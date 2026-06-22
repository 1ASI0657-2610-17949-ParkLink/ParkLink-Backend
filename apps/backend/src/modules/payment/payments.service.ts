import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  NOTIFICATION_TYPE,
  PAYMENT_STATUS,
  RESERVATION_STATUS,
  USER_ROLE,
  type AuthenticatedUser,
  type NotificationType,
  type PaymentStatus,
} from '../../common';
import { PrismaService } from '../../database/prisma.service';
import { AvailabilityCacheService } from '../availability-cache/availability-cache.service';
import { AUDIT_ACTION, AUDIT_ENTITY } from '../audit/audit.constants';
import { AuditEventsService } from '../audit/audit-events.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';

export interface PaymentRecord {
  id: string;
  reservationId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  idempotencyKey: string | null;
  receiptCode: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilityCache: AvailabilityCacheService,
    private readonly auditEvents: AuditEventsService,
  ) {}

  async create(
    dto: CreatePaymentDto,
    user: AuthenticatedUser,
    idempotencyKey?: string,
  ): Promise<PaymentRecord> {
    const normalizedIdempotencyKey = this.normalizeIdempotencyKey(idempotencyKey ?? dto.idempotencyKey);

    if (normalizedIdempotencyKey) {
      const existingPayment = await this.findByIdempotencyKey(normalizedIdempotencyKey);

      if (existingPayment) {
        await this.assertPaymentOwner(existingPayment, user);
        return existingPayment;
      }
    }

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: dto.reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.userId !== user.sub) {
      throw new BadRequestException('Reservation does not belong to the authenticated user');
    }

    if (reservation.status !== RESERVATION_STATUS.PENDING_PAYMENT) {
      throw new BadRequestException('Reservation is not pending payment');
    }

    if (Math.abs(dto.amount - reservation.totalPrice) > 0.01) {
      throw new BadRequestException('Payment amount does not match reservation total');
    }

    const result = dto.forceResult ?? this.mockPaymentResult();

    const payment = await this.createPaymentTransaction(dto, result, normalizedIdempotencyKey);

    if (payment.status === PAYMENT_STATUS.APPROVED) {
      await this.createNotification(
        user.sub,
        'Pago aprobado',
        `Tu pago ${payment.receiptCode} fue aprobado.`,
        NOTIFICATION_TYPE.PAYMENT_APPROVED,
      );
    }

    await Promise.all([
      this.availabilityCache.invalidateAvailability(),
      this.auditEvents.record({
        actor: user,
        action: AUDIT_ACTION.PAYMENT_CREATED,
        entityType: AUDIT_ENTITY.PAYMENT,
        entityId: payment.id,
        metadata: {
          reservationId: payment.reservationId,
          status: payment.status,
          amount: payment.amount,
          idempotencyKey: payment.idempotencyKey,
        },
      }),
    ]);

    return payment;
  }

  async findById(id: string, user?: AuthenticatedUser): Promise<PaymentRecord> {
    const payment = (await this.prisma.payment.findUnique({ where: { id } })) as PaymentRecord | null;

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (user) {
      await this.assertPaymentOwner(payment, user);
    }

    return payment;
  }

  async receipt(id: string, user: AuthenticatedUser): Promise<PaymentRecord> {
    return this.findById(id, user);
  }

  async refund(id: string, dto: RefundPaymentDto, user: AuthenticatedUser): Promise<PaymentRecord> {
    const payment = await this.findById(id, user);

    if (payment.status !== PAYMENT_STATUS.APPROVED) {
      throw new BadRequestException('Only approved payments can be refunded');
    }

    const refunded = (await this.prisma.payment.update({
      where: { id },
      data: { status: PAYMENT_STATUS.REFUNDED },
    })) as PaymentRecord;

    await this.createRefundNotification(payment.reservationId, dto.reason);

    await Promise.all([
      this.availabilityCache.invalidateAvailability(),
      this.auditEvents.record({
        actor: user,
        action: AUDIT_ACTION.PAYMENT_REFUNDED,
        entityType: AUDIT_ENTITY.PAYMENT,
        entityId: id,
        metadata: { reservationId: payment.reservationId, reason: dto.reason },
      }),
    ]);

    return refunded;
  }

  private async createPaymentTransaction(
    dto: CreatePaymentDto,
    result: PaymentStatus,
    idempotencyKey: string | undefined,
  ): Promise<PaymentRecord> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const createdPayment = (await tx.payment.create({
          data: {
            reservationId: dto.reservationId,
            amount: dto.amount,
            paymentMethod: dto.paymentMethod,
            status: result,
            idempotencyKey,
            receiptCode: this.generateReceiptCode(),
          },
        })) as PaymentRecord;

        if (createdPayment.status === PAYMENT_STATUS.APPROVED) {
          await tx.reservation.update({
            where: { id: createdPayment.reservationId },
            data: { status: RESERVATION_STATUS.CONFIRMED },
          });
        }

        return createdPayment;
      });
    } catch (error) {
      if (idempotencyKey && this.isUniqueConstraintError(error)) {
        const existingPayment = await this.findByIdempotencyKey(idempotencyKey);

        if (existingPayment) {
          return existingPayment;
        }
      }

      throw error;
    }
  }

  private async findByIdempotencyKey(idempotencyKey: string): Promise<PaymentRecord | null> {
    return (await this.prisma.payment.findUnique({ where: { idempotencyKey } })) as PaymentRecord | null;
  }

  private async assertPaymentOwner(payment: PaymentRecord, user: AuthenticatedUser): Promise<void> {
    if (user.role === USER_ROLE.ADMIN) {
      return;
    }

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: payment.reservationId },
      select: { userId: true },
    });

    if (!reservation || reservation.userId !== user.sub) {
      throw new BadRequestException('Payment does not belong to the authenticated user');
    }
  }

  private normalizeIdempotencyKey(idempotencyKey: string | undefined): string | undefined {
    const normalizedKey = idempotencyKey?.trim();
    return normalizedKey && normalizedKey.length > 0 ? normalizedKey : undefined;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }

  private mockPaymentResult(): PaymentStatus {
    return Math.random() >= 0.1 ? PAYMENT_STATUS.APPROVED : PAYMENT_STATUS.REJECTED;
  }

  private generateReceiptCode(): string {
    const timestampSegment = Date.now().toString(36).toUpperCase();
    const randomSegment = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `RCT-${timestampSegment}-${randomSegment}`;
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

  private async createRefundNotification(reservationId: string, reason: string): Promise<void> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { userId: true },
    });

    if (!reservation) {
      return;
    }

    await this.createNotification(
      reservation.userId,
      'Reembolso procesado',
      `Tu reembolso fue procesado. Motivo: ${reason}`,
      NOTIFICATION_TYPE.REFUND_PROCESSED,
    );
  }
}
