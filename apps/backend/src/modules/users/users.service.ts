import { Injectable, NotFoundException } from '@nestjs/common';
import type { UserRole } from '@parklink/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: UserRole;
  plateNumber: string | null;
  ownerType: string | null;
  bankAccount: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  plateNumber: string | null;
  ownerType: string | null;
  bankAccount: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string): Promise<PublicUser> {
    return this.getById(userId);
  }

  async updateMe(userId: string, dto: UpdateUserDto): Promise<PublicUser> {
    await this.ensureUserExists(userId);

    const user = (await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    })) as UserRecord;

    return this.toPublicUser(user);
  }

  async getById(userId: string): Promise<PublicUser> {
    const user = (await this.prisma.user.findUnique({ where: { id: userId } })) as UserRecord | null;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toPublicUser(user);
  }

  private async ensureUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private toPublicUser(user: UserRecord): PublicUser {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      plateNumber: user.plateNumber,
      ownerType: user.ownerType,
      bankAccount: user.bankAccount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}