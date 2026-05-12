import type { JwtService } from '@nestjs/jwt';
import { USER_ROLE } from '@parklink/common';
import { AuthService } from '../src/auth/auth.service';
import type { PrismaService } from '../src/database/prisma.service';

describe('AuthService', () => {
  it('registers a driver and never exposes passwordHash', async () => {
    const createdAt = new Date();
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'user-1',
          fullName: 'Ada Lovelace',
          email: 'ada@parklink.test',
          passwordHash: 'hashed',
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
    const jwt = { signAsync: jest.fn().mockResolvedValue('jwt-token') } as unknown as JwtService;
    const service = new AuthService(prisma, jwt);

    const result = await service.registerDriver({
      fullName: 'Ada Lovelace',
      email: 'ada@parklink.test',
      password: 'StrongPassword123',
      phone: '+54911',
      plateNumber: 'ABC-123',
    });

    expect(result.accessToken).toBe('jwt-token');
    expect(result.user).not.toHaveProperty('passwordHash');
  });
});
