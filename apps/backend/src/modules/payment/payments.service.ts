import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  NOTIFICATION_TYPE,
  PAYMENT_STATUS,
  RESERVATION_STATUS,
  type AuthenticatedUser,
  type NotificationType,
  type PaymentStatus,
} from '../../common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';

export interface PaymentRecord {
  id: string;
  reservationId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  receiptCode: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreatePaymentDto,
    user: AuthenticatedUser,
  ): Promise<PaymentRecord> {
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

    const payment = await this.prisma.$transaction(async (tx) => {
      const createdPayment = (await tx.payment.create({
        data: {
          reservationId: dto.reservationId,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          status: result,
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

    if (payment.status === PAYMENT_STATUS.APPROVED) {
      await this.createNotification(
        user.sub,
        'Pago aprobado',
        `Tu pago ${payment.receiptCode} fue aprobado.`,
        NOTIFICATION_TYPE.PAYMENT_APPROVED,
      );
    }

    return payment;
  }

  async findById(id: string): Promise<PaymentRecord> {
    const payment = (await this.prisma.payment.findUnique({ where: { id } })) as PaymentRecord | null;

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async receipt(id: string): Promise<PaymentRecord> {
    return this.findById(id);
  }

  async refund(id: string, dto: RefundPaymentDto): Promise<PaymentRecord> {
    const payment = await this.findById(id);

    if (payment.status !== PAYMENT_STATUS.APPROVED) {
      throw new BadRequestException('Only approved payments can be refunded');
    }

    const refunded = (await this.prisma.payment.update({
      where: { id },
      data: { status: PAYMENT_STATUS.REFUNDED },
    })) as PaymentRecord;

    await this.createRefundNotification(payment.reservationId, dto.reason);

    return refunded;
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
