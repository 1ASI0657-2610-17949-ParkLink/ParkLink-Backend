import type { HttpService } from '@nestjs/axios';
import type { ConfigService } from '@nestjs/config';
import { PAYMENT_STATUS, USER_ROLE } from '@parklink/common';
import { of } from 'rxjs';
import type { PrismaService } from '../src/database/prisma.service';
import { PaymentsService } from '../src/payments/payments.service';

describe('PaymentsService', () => {
  it('processes an approved mock payment', async () => {
    const createdAt = new Date();
    const prisma = {
      payment: {
        create: jest.fn().mockResolvedValue({
          id: 'pay-1',
          reservationId: 'res-1',
          amount: 2000,
          status: PAYMENT_STATUS.APPROVED,
          paymentMethod: 'mock-card',
          receiptCode: 'RCT-TEST',
          createdAt,
          updatedAt: createdAt,
        }),
      },
    } as unknown as PrismaService;
    const http = {
      patch: jest.fn().mockReturnValue(of({ data: { success: true } })),
      post: jest.fn().mockReturnValue(of({ data: { success: true } })),
    } as unknown as HttpService;
    const config = { get: jest.fn().mockReturnValue('http://localhost:3004') } as unknown as ConfigService;
    const service = new PaymentsService(prisma, http, config);

    const result = await service.create(
      {
        reservationId: 'res-1',
        amount: 2000,
        paymentMethod: 'mock-card',
        forceResult: PAYMENT_STATUS.APPROVED,
      },
      { sub: 'driver-1', email: 'driver@parklink.test', role: USER_ROLE.DRIVER },
      'Bearer token',
    );

    expect(result.status).toBe(PAYMENT_STATUS.APPROVED);
  });
});
