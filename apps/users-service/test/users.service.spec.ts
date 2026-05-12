import { USER_ROLE } from '@parklink/common';
import type { PrismaService } from '../src/database/prisma.service';
import { UsersService } from '../src/users/users.service';

describe('UsersService', () => {
  it('returns a public profile without passwordHash', async () => {
    const createdAt = new Date();
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-1',
          fullName: 'Ada',
          email: 'ada@parklink.test',
          passwordHash: 'secret',
          phone: '+54911',
          role: USER_ROLE.DRIVER,
          plateNumber: 'ABC-123',
          ownerType: null,
          bankAccount: null,
          createdAt,
          updatedAt: createdAt,
        }),
      },
    } as unknown as PrismaService;

    const service = new UsersService(prisma);
    const result = await service.getById('user-1');

    expect(result).not.toHaveProperty('passwordHash');
    expect(result.email).toBe('ada@parklink.test');
  });
});
