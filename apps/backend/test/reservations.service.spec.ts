import { BadRequestException } from '@nestjs/common';
import { PARKING_SPACE_STATUS, RESERVATION_STATUS, USER_ROLE, type AuthenticatedUser } from '../src/common';
import type { PrismaService } from '../src/database/prisma.service';
import type { AvailabilityCacheService } from '../src/modules/availability-cache/availability-cache.service';
import type { AuditEventsService } from '../src/modules/audit/audit-events.service';
import type { CreateReservationDto } from '../src/modules/reservation/dto/create-reservation.dto';
import { ReservationsService } from '../src/modules/reservation/reservations.service';

describe('ReservationsService', () => {
  const user: AuthenticatedUser = {
    sub: 'driver-1',
    email: 'driver01@parklink.test',
    role: USER_ROLE.DRIVER,
  };

  const dto: CreateReservationDto = {
    parkingSpaceId: 'space-1',
    startTime: new Date('2026-06-22T15:00:00.000Z'),
    endTime: new Date('2026-06-22T17:00:00.000Z'),
  };

  const parkingSpace = {
    id: dto.parkingSpaceId,
    pricePerHour: 10,
    status: PARKING_SPACE_STATUS.AVAILABLE,
    openingTime: '08:00',
    closingTime: '22:00',
  };

  const buildService = () => {
    const txExecuteRaw = jest.fn().mockResolvedValue(1);
    const txReservationCreate = jest.fn().mockResolvedValue({
      id: 'reservation-1',
      userId: user.sub,
      parkingSpaceId: dto.parkingSpaceId,
      reservationCode: 'PKL-1',
      startTime: dto.startTime,
      endTime: dto.endTime,
      totalPrice: 20,
      status: RESERVATION_STATUS.PENDING_PAYMENT,
      createdAt: new Date('2026-06-22T10:00:00.000Z'),
      updatedAt: new Date('2026-06-22T10:00:00.000Z'),
    });

    const tx = {
      $executeRaw: txExecuteRaw,
      parkingSpace: { findUnique: jest.fn().mockResolvedValue(parkingSpace) },
      reservation: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: txReservationCreate,
      },
    };

    const prisma = {
      reservation: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
      parkingSpace: { findUnique: jest.fn().mockResolvedValue(parkingSpace) },
      notification: { create: jest.fn().mockResolvedValue({ id: 'notification-1' }) },
      $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
    };
    const availabilityCache = { invalidateAvailability: jest.fn().mockResolvedValue(undefined) };
    const auditEvents = { record: jest.fn().mockResolvedValue(undefined) };
    const service = new ReservationsService(
      prisma as unknown as PrismaService,
      availabilityCache as unknown as AvailabilityCacheService,
      auditEvents as unknown as AuditEventsService,
    );

    return { service, tx, txExecuteRaw, txReservationCreate, availabilityCache, auditEvents };
  };

  it('serializes reservation creation with an advisory lock before checking overlaps', async () => {
    const { service, txExecuteRaw, txReservationCreate, availabilityCache, auditEvents } = buildService();

    const reservation = await service.create(dto, user);

    expect(reservation.status).toBe(RESERVATION_STATUS.PENDING_PAYMENT);
    expect(txExecuteRaw).toHaveBeenCalledTimes(1);
    expect(txReservationCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          parkingSpaceId: dto.parkingSpaceId,
          userId: user.sub,
        }),
      }),
    );
    expect(availabilityCache.invalidateAvailability).toHaveBeenCalledTimes(1);
    expect(auditEvents.record).toHaveBeenCalledWith(expect.objectContaining({ entityId: 'reservation-1' }));
  });

  it('rejects overlapping reservations inside the same transaction', async () => {
    const { service, tx, txReservationCreate } = buildService();
    tx.reservation.findFirst.mockResolvedValueOnce({ id: 'existing-reservation' });

    await expect(service.create(dto, user)).rejects.toBeInstanceOf(BadRequestException);
    expect(txReservationCreate).not.toHaveBeenCalled();
  });
});
