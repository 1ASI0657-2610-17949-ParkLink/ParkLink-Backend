import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  calculateReservationPrice,
  generateReservationCode,
  NOTIFICATION_TYPE,
  PARKING_SPACE_STATUS,
  RESERVATION_STATUS,
  USER_ROLE,
  validateTimeRange,
  type AuthenticatedUser,
  type NotificationType,
  type ParkingSpaceStatus,
  type ReservationStatus,
} from '../../common';
import { PrismaService } from '../../database/prisma.service';
import { AvailabilityCacheService } from '../availability-cache/availability-cache.service';
import { AUDIT_ACTION, AUDIT_ENTITY } from '../audit/audit.constants';
import { AuditEventsService } from '../audit/audit-events.service';
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

type PrismaExecutor = PrismaService | Prisma.TransactionClient;

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
    private readonly availabilityCache: AvailabilityCacheService,
    private readonly auditEvents: AuditEventsService,
  ) {}

  async create(
    dto: CreateReservationDto,
    user: AuthenticatedUser,
  ): Promise<ReservationRecord> {
    if (!validateTimeRange(dto.startTime, dto.endTime)) {
      throw new BadRequestException('Reservation startTime must be before endTime');
    }

    const reservation = await this.runReservationTransaction(async (tx) => {
      await this.lockParkingSpaceAvailability(tx, dto.parkingSpaceId);
      const parkingSpace = await this.fetchParkingSpace(dto.parkingSpaceId, tx);

      if (parkingSpace.status !== PARKING_SPACE_STATUS.AVAILABLE) {
        throw new BadRequestException('Parking space is not available');
      }

      this.assertWithinParkingSchedule(parkingSpace, dto.startTime, dto.endTime);

      await this.ensureNoOverlap(dto.parkingSpaceId, dto.startTime, dto.endTime, undefined, tx);

      const totalPrice = calculateReservationPrice(dto.startTime, dto.endTime, parkingSpace.pricePerHour);

      return (await tx.reservation.create({
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
    });

    await this.createNotification(
      user.sub,
      'Reserva pendiente de pago',
      `Tu reserva ${reservation.reservationCode} fue creada y espera pago.`,
      NOTIFICATION_TYPE.RESERVATION_CONFIRMED,
    );

    await Promise.all([
      this.availabilityCache.invalidateAvailability(),
      this.auditEvents.record({
        actor: user,
        action: AUDIT_ACTION.RESERVATION_CREATED,
        entityType: AUDIT_ENTITY.RESERVATION,
        entityId: reservation.id,
        metadata: {
          parkingSpaceId: reservation.parkingSpaceId,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          totalPrice: reservation.totalPrice,
        },
      }),
    ]);

    return reservation;
  }

  async findMyReservations(user: AuthenticatedUser): Promise<ReservationRecord[]> {
    return (await this.prisma.reservation.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: 'desc' },
    })) as ReservationRecord[];
  }

  async findById(id: string, user?: AuthenticatedUser): Promise<ReservationRecord> {
    const reservation = (await this.prisma.reservation.findUnique({ where: { id } })) as ReservationRecord | null;

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (user) {
      this.assertReservationReader(reservation, user);
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

    await Promise.all([
      this.availabilityCache.invalidateAvailability(),
      this.auditEvents.record({
        actor: user,
        action: AUDIT_ACTION.RESERVATION_CANCELLED,
        entityType: AUDIT_ENTITY.RESERVATION,
        entityId: id,
        metadata: { reason: dto.reason },
      }),
    ]);

    return updatedReservation;
  }

  async extend(id: string, dto: ExtendReservationDto, user: AuthenticatedUser): Promise<ReservationRecord> {
    const updatedReservation = await this.runReservationTransaction(async (tx) => {
      const reservation = await this.findByIdWithClient(id, tx);
      this.assertReservationOwner(reservation, user);

      if (!validateTimeRange(reservation.startTime, dto.newEndTime)) {
        throw new BadRequestException('newEndTime must be after startTime');
      }

      await this.lockParkingSpaceAvailability(tx, reservation.parkingSpaceId);
      const parkingSpace = await this.fetchParkingSpace(reservation.parkingSpaceId, tx);
      this.assertWithinParkingSchedule(parkingSpace, reservation.startTime, dto.newEndTime);

      await this.ensureNoOverlap(
        reservation.parkingSpaceId,
        reservation.endTime,
        dto.newEndTime,
        reservation.id,
        tx,
      );

      const totalPrice = calculateReservationPrice(reservation.startTime, dto.newEndTime, parkingSpace.pricePerHour);

      return (await tx.reservation.update({
        where: { id },
        data: {
          endTime: dto.newEndTime,
          totalPrice,
        },
      })) as ReservationRecord;
    });

    await Promise.all([
      this.availabilityCache.invalidateAvailability(),
      this.auditEvents.record({
        actor: user,
        action: AUDIT_ACTION.RESERVATION_EXTENDED,
        entityType: AUDIT_ENTITY.RESERVATION,
        entityId: id,
        metadata: { newEndTime: dto.newEndTime, totalPrice: updatedReservation.totalPrice },
      }),
    ]);

    return updatedReservation;
  }

  async confirm(id: string, user: AuthenticatedUser): Promise<ReservationRecord> {
    const reservation = await this.findById(id);
    this.assertReservationOwner(reservation, user);

    const updatedReservation = (await this.prisma.reservation.update({
      where: { id },
      data: { status: RESERVATION_STATUS.CONFIRMED },
    })) as ReservationRecord;

    await Promise.all([
      this.availabilityCache.invalidateAvailability(),
      this.auditEvents.record({
        actor: user,
        action: AUDIT_ACTION.RESERVATION_CONFIRMED,
        entityType: AUDIT_ENTITY.RESERVATION,
        entityId: id,
      }),
    ]);

    return updatedReservation;
  }

  private async fetchParkingSpace(
    parkingSpaceId: string,
    prisma: PrismaExecutor = this.prisma,
  ): Promise<ParkingSpaceSnapshot> {
    const parkingSpace = await prisma.parkingSpace.findUnique({
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
    prisma: PrismaExecutor = this.prisma,
  ): Promise<void> {
    const blockingStatuses = [
      RESERVATION_STATUS.PENDING_PAYMENT,
      RESERVATION_STATUS.CONFIRMED,
      RESERVATION_STATUS.ACTIVE,
    ];

    const existingReservation = await prisma.reservation.findFirst({
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

  private async findByIdWithClient(id: string, prisma: PrismaExecutor): Promise<ReservationRecord> {
    const reservation = (await prisma.reservation.findUnique({ where: { id } })) as ReservationRecord | null;

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }

  private async runReservationTransaction<T>(operation: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    try {
      return await this.prisma.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (this.isReservationConflict(error)) {
        throw new BadRequestException('Parking space already has a reservation in this time range');
      }

      throw error;
    }
  }

  private isReservationConflict(error: unknown): boolean {
    if (!error || typeof error !== 'object' || !('code' in error)) {
      return false;
    }

    const code = (error as { code?: unknown }).code;
    return code === 'P2004' || code === 'P2034';
  }

  private async lockParkingSpaceAvailability(prisma: Prisma.TransactionClient, parkingSpaceId: string): Promise<void> {
    await prisma.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${parkingSpaceId}))`;
  }

  private assertReservationOwner(reservation: ReservationRecord, user: AuthenticatedUser): void {
    if (reservation.userId !== user.sub) {
      throw new BadRequestException('Reservation does not belong to the authenticated user');
    }
  }

  private assertReservationReader(reservation: ReservationRecord, user: AuthenticatedUser): void {
    if (user.role === USER_ROLE.ADMIN || reservation.userId === user.sub) {
      return;
    }

    throw new BadRequestException('Reservation does not belong to the authenticated user');
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
