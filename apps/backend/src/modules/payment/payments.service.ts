import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { NOTIFICATION_TYPE, PAYMENT_STATUS, type AuthenticatedUser, type PaymentStatus } from '@parklink/common';
import { firstValueFrom } from 'rxjs';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    dto: CreatePaymentDto,
    user: AuthenticatedUser,
    authorizationHeader: string | undefined,
  ): Promise<PaymentRecord> {
    const result = dto.forceResult ?? this.mockPaymentResult();
    const payment = (await this.prisma.payment.create({
      data: {
        reservationId: dto.reservationId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        status: result,
        receiptCode: this.generateReceiptCode(),
      },
    })) as PaymentRecord;

    if (payment.status === PAYMENT_STATUS.APPROVED) {
      await this.confirmReservation(payment.reservationId, authorizationHeader);
      await this.createNotification(
        user.sub,
        authorizationHeader,
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

  async refund(id: string, dto: RefundPaymentDto, authorizationHeader: string | undefined): Promise<PaymentRecord> {
    const payment = await this.findById(id);

    if (payment.status !== PAYMENT_STATUS.APPROVED) {
      throw new BadRequestException('Only approved payments can be refunded');
    }

    const refunded = (await this.prisma.payment.update({
      where: { id },
      data: { status: PAYMENT_STATUS.REFUNDED },
    })) as PaymentRecord;

    await this.createNotification(
      '',
      authorizationHeader,
      'Reembolso procesado',
      `Tu reembolso fue procesado. Motivo: ${dto.reason}`,
      NOTIFICATION_TYPE.REFUND_PROCESSED,
    );

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

  private async confirmReservation(reservationId: string, authorizationHeader: string | undefined): Promise<void> {
    if (!authorizationHeader) {
      return;
    }

    await firstValueFrom(
      this.httpService.patch(
        `/reservations/${reservationId}/confirm`,
        {},
        { headers: { Authorization: authorizationHeader } },
      ),
    );
  }

  private async createNotification(
    userId: string,
    authorizationHeader: string | undefined,
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
        { userId: userId || undefined, title, message, type },
        { headers: { Authorization: authorizationHeader } },
      ),
    );
  }
}
