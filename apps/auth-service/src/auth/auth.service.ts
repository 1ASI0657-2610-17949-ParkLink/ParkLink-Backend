import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { USER_ROLE, type UserRole } from '@parklink/common';
import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDriverDto } from './dto/register-driver.dto';
import { RegisterOwnerDto } from './dto/register-owner.dto';

interface UserRecord {
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

interface PublicUser {
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

interface AuthTokenResponse {
  accessToken: string;
  user: PublicUser;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerDriver(dto: RegisterDriverDto): Promise<AuthTokenResponse> {
    await this.ensureEmailIsAvailable(dto.email);

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = (await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        passwordHash,
        phone: dto.phone,
        role: USER_ROLE.DRIVER,
        plateNumber: dto.plateNumber,
      },
    })) as UserRecord;

    return this.buildAuthResponse(user);
  }

  async registerOwner(dto: RegisterOwnerDto): Promise<AuthTokenResponse> {
    await this.ensureEmailIsAvailable(dto.email);

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = (await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        passwordHash,
        phone: dto.phone,
        role: USER_ROLE.OWNER,
        ownerType: dto.ownerType,
        bankAccount: dto.bankAccount,
      },
    })) as UserRecord;

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthTokenResponse> {
    const user = (await this.prisma.user.findUnique({
      where: { email: dto.email },
    })) as UserRecord | null;

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async me(userId: string): Promise<PublicUser> {
    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
    })) as UserRecord | null;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toPublicUser(user);
  }

  private async ensureEmailIsAvailable(email: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }
  }

  private async buildAuthResponse(user: UserRecord): Promise<AuthTokenResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: this.toPublicUser(user),
    };
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
