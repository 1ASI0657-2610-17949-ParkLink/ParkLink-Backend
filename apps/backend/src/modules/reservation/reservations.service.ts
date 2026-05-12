import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import {
  calculateReservationPrice,
  generateReservationCode,
  NOTIFICATION_TYPE,
  PARKING_SPACE_STATUS,
  RESERVATION_STATUS,
  unwrapApiResponse,
  validateTimeRange,
  type ApiResponse,
  type AuthenticatedUser,
  type ParkingSpaceStatus,
  type ReservationStatus,
} from '@parklink/common';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';
import { CancelReservationDto } from './dto/cancel-reservation.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ExtendReservationDto } from './dto/extend-reservation.dto';

export interface ParkingSpaceSnapshot {
  id: string;
  pricePerHour: number;
  status: ParkingSpaceStatus;
}

export interface ReservationRecord {
  id: string;
  userId: string;
  parkingSpaceId: string;
  reservationCode: string;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    dto: CreateReservationDto,
    user: AuthenticatedUser,
    authorizationHeader: string | undefined,
  ): Promise<ReservationRecord> {
    if (!validateTimeRange(dto.startTime, dto.endTime)) {
      throw new BadRequestException('Reservation startTime must be before endTime');
    }

    const parkingSpace = await this.fetchParkingSpace(dto.parkingSpaceId);

    if (parkingSpace.status !== PARKING_SPACE_STATUS.AVAILABLE) {
      throw new BadRequestException('Parking space is not available');
    }

    await this.ensureNoOverlap(dto.parkingSpaceId, dto.startTime, dto.endTime);

    const totalPrice = calculateReservationPrice(dto.startTime, dto.endTime, parkingSpace.pricePerHour);

    const reservation = (await this.prisma.reservation.create({
      data: {
        userId: user.sub,
        parkingSpaceId: dto.parkingSpaceId,
        reservationCode: generateReservationCode(),
        startTime: dto.startTime,
        endTime: dto.endTime,
        totalPrice,
        status: RESERVATION_STATUS.PENDING_PAYMENT,
      },
    })) as ReservationRecord;

    await this.createNotification(
      authorizationHeader,
      user.sub,
      'Reserva pendiente de pago',
      `Tu reserva ${reservation.reservationCode} fue creada y espera pago.`,
      NOTIFICATION_TYPE.RESERVATION_CONFIRMED,
    );

    return reservation;
  }

  async findMyReservations(user: AuthenticatedUser): Promise<ReservationRecord[]> {
    return (await this.prisma.reservation.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: 'desc' },
    })) as ReservationRecord[];
  }

  async findById(id: string): Promise<ReservationRecord> {
    const reservation = (await this.prisma.reservation.findUnique({ where: { id } })) as ReservationRecord | null;

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }

  async cancel(
    id: string,
    dto: CancelReservationDto,
    user: AuthenticatedUser,
    authorizationHeader: string | undefined,
  ): Promise<ReservationRecord> {
    const reservation = await this.findById(id);
    this.assertReservationOwner(reservation, user);

    const updatedReservation = (await this.prisma.reservation.update({
      where: { id },
      data: { status: RESERVATION_STATUS.CANCELLED },
    })) as ReservationRecord;

    await this.createNotification(
      authorizationHeader,
      user.sub,
      'Reserva cancelada',
      `Tu reserva ${reservation.reservationCode} fue cancelada. Motivo: ${dto.reason}`,
      NOTIFICATION_TYPE.RESERVATION_CANCELLED,
    );

    return updatedReservation;
  }

  async extend(id: string, dto: ExtendReservationDto, user: AuthenticatedUser): Promise<ReservationRecord> {
    const reservation = await this.findById(id);
    this.assertReservationOwner(reservation, user);

    if (!validateTimeRange(reservation.startTime, dto.newEndTime)) {
      throw new BadRequestException('newEndTime must be after startTime');
    }

    await this.ensureNoOverlap(reservation.parkingSpaceId, reservation.endTime, dto.newEndTime, reservation.id);

    const parkingSpace = await this.fetchParkingSpace(reservation.parkingSpaceId);
    const totalPrice = calculateReservationPrice(reservation.startTime, dto.newEndTime, parkingSpace.pricePerHour);

    return (await this.prisma.reservation.update({
      where: { id },
      data: {
        endTime: dto.newEndTime,
        totalPrice,
      },
    })) as ReservationRecord;
  }

  async confirm(id: string, user: AuthenticatedUser): Promise<ReservationRecord> {
    const reservation = await this.findById(id);
    this.assertReservationOwner(reservation, user);

    return (await this.prisma.reservation.update({
      where: { id },
      data: { status: RESERVATION_STATUS.CONFIRMED },
    })) as ReservationRecord;
  }

  private async fetchParkingSpace(parkingSpaceId: string): Promise<ParkingSpaceSnapshot> {
    const response = await firstValueFrom(
      this.httpService.get<ApiResponse<ParkingSpaceSnapshot>>(`/parking-spaces/${parkingSpaceId}`),
    );

    return unwrapApiResponse(response.data);
  }

  private async ensureNoOverlap(
    parkingSpaceId: string,
    startTime: Date,
    endTime: Date,
    excludedReservationId?: string,
  ): Promise<void> {
    const blockingStatuses = [
      RESERVATION_STATUS.PENDING_PAYMENT,
      RESERVATION_STATUS.CONFIRMED,
      RESERVATION_STATUS.ACTIVE,
    ];

    const existingReservation = await this.prisma.reservation.findFirst({
      where: {
        parkingSpaceId,
        id: excludedReservationId ? { not: excludedReservationId } : undefined,
        status: { in: blockingStatuses },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (existingReservation) {
      throw new BadRequestException('Parking space already has a reservation in this time range');
    }
  }

  private assertReservationOwner(reservation: ReservationRecord, user: AuthenticatedUser): void {
    if (reservation.userId !== user.sub) {
      throw new BadRequestException('Reservation does not belong to the authenticated user');
    }
  }

  private async createNotification(
    authorizationHeader: string | undefined,
    userId: string,
    title: string,
    message: string,
    type: string,
  ): Promise<void> {
    if (!authorizationHeader) {
      return;
    }

    await firstValueFrom(
      this.httpService.post(
        '/notifications',
        { userId, title, message, type },
        { headers: { Authorization: authorizationHeader } },
      ),
    );
  }
}
