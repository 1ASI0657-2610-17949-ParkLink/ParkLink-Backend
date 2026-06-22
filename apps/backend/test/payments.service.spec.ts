import { BadRequestException } from '@nestjs/common';
import { PAYMENT_STATUS, RESERVATION_STATUS, USER_ROLE, type AuthenticatedUser } from '../src/common';
import type { PrismaService } from '../src/database/prisma.service';
import type { AvailabilityCacheService } from '../src/modules/availability-cache/availability-cache.service';
import type { AuditEventsService } from '../src/modules/audit/audit-events.service';
import type { CreatePaymentDto } from '../src/modules/payment/dto/create-payment.dto';
import { PaymentsService } from '../src/modules/payment/payments.service';

describe('PaymentsService', () => {
  const user: AuthenticatedUser = {
    sub: 'driver-1',
    email: 'driver01@parklink.test',
    role: USER_ROLE.DRIVER,
  };

  const dto: CreatePaymentDto = {
    reservationId: 'reservation-1',
    amount: 20,
    paymentMethod: 'mock-card',
    forceResult: PAYMENT_STATUS.APPROVED,
  };

  const buildService = () => {
    const txReservationUpdate = jest.fn().mockResolvedValue({ id: dto.reservationId });
    const txPaymentCreate = jest.fn().mockResolvedValue({
      id: 'payment-1',
      reservationId: dto.reservationId,
      amount: dto.amount,
      status: PAYMENT_STATUS.APPROVED,
      paymentMethod: dto.paymentMethod,
      idempotencyKey: 'checkout-1',
      receiptCode: 'RCT-1',
      createdAt: new Date('2026-06-22T10:00:00.000Z'),
      updatedAt: new Date('2026-06-22T10:00:00.000Z'),
    });

    const tx = {
      payment: { create: txPaymentCreate },
      reservation: { update: txReservationUpdate },
    };

    const prisma = {
      payment: { findUnique: jest.fn().mockResolvedValue(null), update: jest.fn() },
      reservation: {
        findUnique: jest.fn().mockResolvedValue({
          id: dto.reservationId,
          userId: user.sub,
          totalPrice: dto.amount,
          status: RESERVATION_STATUS.PENDING_PAYMENT,
        }),
      },
      notification: { create: jest.fn().mockResolvedValue({ id: 'notification-1' }) },
      $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
    };
    const availabilityCache = { invalidateAvailability: jest.fn().mockResolvedValue(undefined) };
    const auditEvents = { record: jest.fn().mockResolvedValue(undefined) };
    const service = new PaymentsService(
      prisma as unknown as PrismaService,
      availabilityCache as unknown as AvailabilityCacheService,
      auditEvents as unknown as AuditEventsService,
    );

    return { service, prisma, txPaymentCreate, txReservationUpdate, availabilityCache, auditEvents };
  };

  it('returns an existing payment when the idempotency key was already processed', async () => {
    const { service, prisma, txPaymentCreate } = buildService();
    const existingPayment = {
      id: 'payment-existing',
      reservationId: dto.reservationId,
      amount: dto.amount,
      status: PAYMENT_STATUS.APPROVED,
      paymentMethod: dto.paymentMethod,
      idempotencyKey: 'checkout-1',
      receiptCode: 'RCT-EXISTING',
      createdAt: new Date('2026-06-22T10:00:00.000Z'),
      updatedAt: new Date('2026-06-22T10:00:00.000Z'),
    };
    prisma.payment.findUnique.mockResolvedValueOnce(existingPayment);

    const payment = await service.create(dto, user, 'checkout-1');

    expect(payment).toEqual(existingPayment);
    expect(txPaymentCreate).not.toHaveBeenCalled();
  });

  it('creates a payment once and confirms the reservation when approved', async () => {
    const { service, txPaymentCreate, txReservationUpdate, availabilityCache, auditEvents } = buildService();

    const payment = await service.create(dto, user, 'checkout-1');

    expect(payment.status).toBe(PAYMENT_STATUS.APPROVED);
    expect(txPaymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          idempotencyKey: 'checkout-1',
          reservationId: dto.reservationId,
        }),
      }),
    );
    expect(txReservationUpdate).toHaveBeenCalledWith({
      where: { id: dto.reservationId },
      data: { status: RESERVATION_STATUS.CONFIRMED },
    });
    expect(availabilityCache.invalidateAvailability).toHaveBeenCalledTimes(1);
    expect(auditEvents.record).toHaveBeenCalledWith(expect.objectContaining({ entityId: 'payment-1' }));
  });

  it('rejects payments for reservations owned by another user', async () => {
    const { service, prisma } = buildService();
    prisma.reservation.findUnique.mockResolvedValueOnce({
      id: dto.reservationId,
      userId: 'another-driver',
      totalPrice: dto.amount,
      status: RESERVATION_STATUS.PENDING_PAYMENT,
    });

    await expect(service.create(dto, user, 'checkout-1')).rejects.toBeInstanceOf(BadRequestException);
  });
});
