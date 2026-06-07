import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  PARKING_SPACE_STATUS,
  USER_ROLE,
  type AuthenticatedUser,
  type ParkingSpaceStatus,
} from '../../common';
import { PrismaService } from '../../database/prisma.service';
import { MapsService } from '../maps/maps.service';
import type { GeocodeResult } from '../maps/maps.provider';
import { CreateParkingSpaceDto } from './dto/create-parking-space.dto';
import { SearchParkingSpacesDto } from './dto/search-parking-spaces.dto';
import { UpdateParkingSpaceDto } from './dto/update-parking-space.dto';

export interface ParkingSpaceRecord {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  reference: string;
  latitude: number;
  longitude: number;
  pricePerHour: number;
  openingTime: string;
  closingTime: string;
  status: ParkingSpaceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParkingSpaceWithDistance extends ParkingSpaceRecord {
  distanceKm?: number;
}

@Injectable()
export class ParkingSpacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapsService: MapsService,
  ) {}

  async create(dto: CreateParkingSpaceDto, user: AuthenticatedUser): Promise<ParkingSpaceRecord> {
    this.assertOwner(user);
    const geocode = await this.geocodeAddress(dto.address);

    return (await this.prisma.parkingSpace.create({
      data: {
        ownerId: user.sub,
        name: dto.name,
        address: dto.address,
        reference: dto.reference,
        latitude: geocode.latitude,
        longitude: geocode.longitude,
        pricePerHour: dto.pricePerHour,
        openingTime: dto.openingTime,
        closingTime: dto.closingTime,
        status: PARKING_SPACE_STATUS.AVAILABLE,
      },
    })) as ParkingSpaceRecord;
  }

  async findAll(): Promise<ParkingSpaceRecord[]> {
    return (await this.prisma.parkingSpace.findMany({
      orderBy: { createdAt: 'desc' },
    })) as ParkingSpaceRecord[];
  }

  async search(dto: SearchParkingSpacesDto): Promise<ParkingSpaceWithDistance[]> {
    const where: Record<string, unknown> = {
      status: dto.status ?? PARKING_SPACE_STATUS.AVAILABLE,
    };

    if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
      where.pricePerHour = {
        gte: dto.minPrice,
        lte: dto.maxPrice,
      };
    }

    const spaces = (await this.prisma.parkingSpace.findMany({ where })) as ParkingSpaceRecord[];

    return spaces
      .map((space) => this.withDistance(space, dto))
      .filter((space) => this.matchesDistance(space, dto))
      .filter((space) => this.matchesSchedule(space, dto));
  }

  async findById(id: string): Promise<ParkingSpaceRecord> {
    const parkingSpace = (await this.prisma.parkingSpace.findUnique({ where: { id } })) as
      | ParkingSpaceRecord
      | null;

    if (!parkingSpace) {
      throw new NotFoundException('Parking space not found');
    }

    return parkingSpace;
  }

  async update(id: string, dto: UpdateParkingSpaceDto, user: AuthenticatedUser): Promise<ParkingSpaceRecord> {
    const parkingSpace = await this.findById(id);
    this.assertOwnerOrAdmin(parkingSpace, user);

    const geocode = dto.address ? await this.geocodeAddress(dto.address) : undefined;

    return (await this.prisma.parkingSpace.update({
      where: { id },
      data: {
        ...dto,
        latitude: geocode?.latitude,
        longitude: geocode?.longitude,
      },
    })) as ParkingSpaceRecord;
  }

  async updateStatus(
    id: string,
    status: ParkingSpaceStatus,
    user: AuthenticatedUser,
  ): Promise<ParkingSpaceRecord> {
    const parkingSpace = await this.findById(id);
    this.assertOwnerOrAdmin(parkingSpace, user);

    return (await this.prisma.parkingSpace.update({
      where: { id },
      data: { status },
    })) as ParkingSpaceRecord;
  }

  async remove(id: string, user: AuthenticatedUser): Promise<{ id: string; deleted: boolean }> {
    const parkingSpace = await this.findById(id);
    this.assertOwnerOrAdmin(parkingSpace, user);
    await this.prisma.parkingSpace.delete({ where: { id } });

    return { id, deleted: true };
  }

  private async geocodeAddress(address: string): Promise<GeocodeResult> {
    return this.mapsService.geocode(address);
  }

  private assertOwner(user: AuthenticatedUser): void {
    if (user.role !== USER_ROLE.OWNER) {
      throw new ForbiddenException('Only owners can create parking spaces');
    }
  }

  private assertOwnerOrAdmin(parkingSpace: ParkingSpaceRecord, user: AuthenticatedUser): void {
    if (user.role === USER_ROLE.ADMIN) {
      return;
    }

    if (user.role !== USER_ROLE.OWNER || parkingSpace.ownerId !== user.sub) {
      throw new ForbiddenException('Only the owner can modify this parking space');
    }
  }

  private withDistance(space: ParkingSpaceRecord, dto: SearchParkingSpacesDto): ParkingSpaceWithDistance {
    if (dto.lat === undefined || dto.lng === undefined) {
      return space;
    }

    return {
      ...space,
      distanceKm: this.calculateDistanceKm(dto.lat, dto.lng, space.latitude, space.longitude),
    };
  }

  private matchesDistance(space: ParkingSpaceWithDistance, dto: SearchParkingSpacesDto): boolean {
    if (dto.maxDistance === undefined || space.distanceKm === undefined) {
      return true;
    }

    return space.distanceKm <= dto.maxDistance;
  }

  private matchesSchedule(space: ParkingSpaceRecord, dto: SearchParkingSpacesDto): boolean {
    if (!dto.startTime || !dto.endTime) {
      return true;
    }

    return space.openingTime <= dto.startTime && space.closingTime >= dto.endTime;
  }

  private calculateDistanceKm(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
  ): number {
    const earthRadiusKm = 6371;
    const latDelta = this.toRadians(destinationLat - originLat);
    const lngDelta = this.toRadians(destinationLng - originLng);
    const originLatRad = this.toRadians(originLat);
    const destinationLatRad = this.toRadians(destinationLat);
    const haversine =
      Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
      Math.cos(originLatRad) *
        Math.cos(destinationLatRad) *
        Math.sin(lngDelta / 2) *
        Math.sin(lngDelta / 2);

    return Number((earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))).toFixed(2));
  }

  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }
}
