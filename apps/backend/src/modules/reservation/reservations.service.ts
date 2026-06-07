import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  calculateReservationPrice,
  generateReservationCode,
  NOTIFICATION_TYPE,
  PARKING_SPACE_STATUS,
  RESERVATION_STATUS,
  validateTimeRange,
  type AuthenticatedUser,
  type NotificationType,
  type ParkingSpaceStatus,
  type ReservationStatus,
} from '../../common';
import { PrismaService } from '../../database/prisma.service';
import { CancelReservationDto } from './dto/cancel-reservation.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ExtendReservationDto } from './dto/extend-reservation.dto';

const PARKING_TIME_ZONE = 'America/Lima';

const PARKING_DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: PARKING_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export interface ParkingSpaceSnapshot {
  id: string;
  pricePerHour: number;
  status: ParkingSpaceStatus;
  openingTime: string;
  closingTime: string;
}

interface LocalReservationTime {
  dateKey: string;
  minutes: number;
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
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateReservationDto,
    user: AuthenticatedUser,
  ): Promise<ReservationRecord> {
    if (!validateTimeRange(dto.startTime, dto.endTime)) {
      throw new BadRequestException('Reservation startTime must be before endTime');
    }

    const parkingSpace = await this.fetchParkingSpace(dto.parkingSpaceId);

    if (parkingSpace.status !== PARKING_SPACE_STATUS.AVAILABLE) {
      throw new BadRequestException('Parking space is not available');
    }

    this.assertWithinParkingSchedule(parkingSpace, dto.startTime, dto.endTime);

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
  ): Promise<ReservationRecord> {
    const reservation = await this.findById(id);
    this.assertReservationOwner(reservation, user);

    const updatedReservation = (await this.prisma.reservation.update({
      where: { id },
      data: { status: RESERVATION_STATUS.CANCELLED },
    })) as ReservationRecord;

    await this.createNotification(
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

    const parkingSpace = await this.fetchParkingSpace(reservation.parkingSpaceId);
    this.assertWithinParkingSchedule(parkingSpace, reservation.startTime, dto.newEndTime);

    await this.ensureNoOverlap(reservation.parkingSpaceId, reservation.endTime, dto.newEndTime, reservation.id);

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
    const parkingSpace = await this.prisma.parkingSpace.findUnique({
      where: { id: parkingSpaceId },
    });

    if (!parkingSpace) {
      throw new NotFoundException('Parking space not found');
    }

    return parkingSpace as ParkingSpaceSnapshot;
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

  private assertWithinParkingSchedule(
    parkingSpace: ParkingSpaceSnapshot,
    startTime: Date,
    endTime: Date,
  ): void {
    const openingMinutes = this.parseScheduleTime(parkingSpace.openingTime);
    const closingMinutes = this.parseScheduleTime(parkingSpace.closingTime);
    const start = this.getLocalReservationTime(startTime);
    const end = this.getLocalReservationTime(endTime);

    if (start.dateKey !== end.dateKey) {
      throw new BadRequestException('Reservation must start and end on the same local day');
    }

    if (closingMinutes <= openingMinutes) {
      throw new BadRequestException('Parking space schedule is not valid');
    }

    if (start.minutes < openingMinutes || end.minutes > closingMinutes) {
      throw new BadRequestException(
        `Reservation must be within parking space opening hours (${parkingSpace.openingTime} - ${parkingSpace.closingTime})`,
      );
    }
  }

  private parseScheduleTime(time: string): number {
    const [hoursRaw, minutesRaw] = time.split(':');
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);

    if (
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      throw new BadRequestException('Parking space schedule is not valid');
    }

    return hours * 60 + minutes;
  }

  private getLocalReservationTime(date: Date): LocalReservationTime {
    const parts = PARKING_DATE_TIME_FORMATTER.formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const hours = Number(values.hour);
    const minutes = Number(values.minute);

    if (!values.year || !values.month || !values.day || !Number.isInteger(hours) || !Number.isInteger(minutes)) {
      throw new BadRequestException('Reservation time is not valid');
    }

    return {
      dateKey: `${values.year}-${values.month}-${values.day}`,
      minutes: hours * 60 + minutes,
    };
  }

  private async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
  ): Promise<void> {
    await this.prisma.notification.create({
      data: { userId, title, message, type },
    });
  }
}
