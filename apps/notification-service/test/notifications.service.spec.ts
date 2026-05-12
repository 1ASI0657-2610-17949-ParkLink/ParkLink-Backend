import { NOTIFICATION_TYPE } from '@parklink/common';
import type { PrismaService } from '../src/database/prisma.service';
import { NotificationsService } from '../src/notifications/notifications.service';

describe('NotificationsService', () => {
  it('creates an internal notification', async () => {
    const createdAt = new Date();
    const prisma = {
      notification: {
        create: jest.fn().mockResolvedValue({
          id: 'not-1',
          userId: 'user-1',
          title: 'Pago aprobado',
          message: 'Tu pago fue aprobado',
          type: NOTIFICATION_TYPE.PAYMENT_APPROVED,
          isRead: false,
          createdAt,
        }),
      },
    } as unknown as PrismaService;
    const service = new NotificationsService(prisma);

    const result = await service.create(
      {
        title: 'Pago aprobado',
        message: 'Tu pago fue aprobado',
        type: NOTIFICATION_TYPE.PAYMENT_APPROVED,
      },
      'user-1',
    );

    expect(result.isRead).toBe(false);
  });
});
