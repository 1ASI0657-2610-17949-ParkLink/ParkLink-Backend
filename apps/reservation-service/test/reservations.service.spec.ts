import type { HttpService } from '@nestjs/axios';
import type { ConfigService } from '@nestjs/config';
import { PARKING_SPACE_STATUS, RESERVATION_STATUS, USER_ROLE } from '@parklink/common';
import { of } from 'rxjs';
import type { PrismaService } from '../src/database/prisma.service';
import { ReservationsService } from '../src/reservations/reservations.service';

describe('ReservationsService', () => {
  it('creates a pending payment reservation when the space is available', async () => {
    const createdAt = new Date();
    const prisma = {
      reservation: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'res-1',
          userId: 'driver-1',
          parkingSpaceId: 'space-1',
          reservationCode: 'PKL-TEST',
          startTime: new Date('2026-05-12T10:00:00.000Z'),
          endTime: new Date('2026-05-12T12:00:00.000Z'),
          totalPrice: 2000,
          status: RESERVATION_STATUS.PENDING_PAYMENT,
          createdAt,
          updatedAt: createdAt,
        }),
      },
    } as unknown as PrismaService;
    const http = {
      get: jest.fn().mockReturnValue(of({ data: { success: true, data: { id: 'space-1', pricePerHour: 1000, status: PARKING_SPACE_STATUS.AVAILABLE } } })),
      post: jest.fn().mockReturnValue(of({ data: { success: true } })),
    } as unknown as HttpService;
    const config = { get: jest.fn().mockImplementation((key: string) => key.includes('PARKING') ? 'http://localhost:3003' : 'http://localhost:3006') } as unknown as ConfigService;
    const service = new ReservationsService(prisma, http, config);

    const result = await service.create(
      {
        parkingSpaceId: 'space-1',
        startTime: new Date('2026-05-12T10:00:00.000Z'),
        endTime: new Date('2026-05-12T12:00:00.000Z'),
      },
      { sub: 'driver-1', email: 'driver@parklink.test', role: USER_ROLE.DRIVER },
      'Bearer token',
    );

    expect(result.status).toBe(RESERVATION_STATUS.PENDING_PAYMENT);
  });
});
