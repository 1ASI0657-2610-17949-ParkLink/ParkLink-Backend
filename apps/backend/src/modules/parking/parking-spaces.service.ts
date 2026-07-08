import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import {
  PARKING_SPACE_STATUS,
  USER_ROLE,
  type AuthenticatedUser,
  type ParkingSpaceStatus,
} from '../../common';
import { PrismaService } from '../../database/prisma.service';
import { AvailabilityCacheService } from '../availability-cache/availability-cache.service';
import { AUDIT_ACTION, AUDIT_ENTITY } from '../audit/audit.constants';
import { AuditEventsService } from '../audit/audit-events.service';
import { MapsService } from '../maps/maps.service';
import type { GeocodeResult } from '../maps/maps.provider';
import { AddParkingSpacePhotoDto } from './dto/add-parking-space-photo.dto';
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
  photos: string[];
  status: ParkingSpaceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParkingSpaceWithDistance extends ParkingSpaceRecord {
  distanceKm?: number;
}

export interface ParkingPhotoUploadResponse {
  parkingSpace: ParkingSpaceRecord;
  photoUrl: string;
  uploadUrl?: string;
  uploadMethod?: 'PUT';
  expiresInSeconds?: number;
}

interface ParkingPhotoUpload {
  photoUrl: string;
  uploadUrl?: string;
  expiresInSeconds?: number;
}

const DEFAULT_SEARCH_LIMIT = 50;

@Injectable()
export class ParkingSpacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapsService: MapsService,
    private readonly availabilityCache: AvailabilityCacheService,
    private readonly auditEvents: AuditEventsService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateParkingSpaceDto, user: AuthenticatedUser): Promise<ParkingSpaceRecord> {
    this.assertOwner(user);
    const geocode = await this.geocodeAddress(dto.address);

    const parkingSpace = (await this.prisma.parkingSpace.create({
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

    await Promise.all([
      this.availabilityCache.invalidateAvailability(),
      this.auditEvents.record({
        actor: user,
        action: AUDIT_ACTION.PARKING_SPACE_CREATED,
        entityType: AUDIT_ENTITY.PARKING_SPACE,
        entityId: parkingSpace.id,
        metadata: { name: parkingSpace.name, address: parkingSpace.address },
      }),
    ]);

    return this.normalizeParkingSpace(parkingSpace);
  }

  async findAll(): Promise<ParkingSpaceRecord[]> {
    return (await this.prisma.parkingSpace.findMany({
      orderBy: { createdAt: 'desc' },
    })) as ParkingSpaceRecord[];
  }

  async search(dto: SearchParkingSpacesDto): Promise<ParkingSpaceWithDistance[]> {
    const cacheCriteria = this.buildSearchCacheCriteria(dto);
    const cachedSpaces = await this.availabilityCache.get<ParkingSpaceWithDistance[]>(cacheCriteria);

    if (cachedSpaces) {
      return cachedSpaces;
    }

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

    const result = spaces
      .map((space) => this.normalizeParkingSpace(space))
      .map((space) => this.withDistance(space, dto))
      .filter((space) => this.matchesDistance(space, dto))
      .filter((space) => this.matchesSchedule(space, dto))
      .slice(dto.offset ?? 0, (dto.offset ?? 0) + (dto.limit ?? DEFAULT_SEARCH_LIMIT));

    await this.availabilityCache.set(cacheCriteria, result);

    return result;
  }

  async findById(id: string): Promise<ParkingSpaceRecord> {
    const parkingSpace = (await this.prisma.parkingSpace.findUnique({ where: { id } })) as
      | ParkingSpaceRecord
      | null;

    if (!parkingSpace) {
      throw new NotFoundException('Parking space not found');
    }

    return this.normalizeParkingSpace(parkingSpace);
  }

  async update(id: string, dto: UpdateParkingSpaceDto, user: AuthenticatedUser): Promise<ParkingSpaceRecord> {
    const parkingSpace = await this.findById(id);
    this.assertOwnerOrAdmin(parkingSpace, user);

    const geocode = dto.address ? await this.geocodeAddress(dto.address) : undefined;

    const updatedParkingSpace = (await this.prisma.parkingSpace.update({
      where: { id },
      data: {
        ...dto,
        latitude: geocode?.latitude,
        longitude: geocode?.longitude,
      },
    })) as ParkingSpaceRecord;

    await Promise.all([
      this.availabilityCache.invalidateAvailability(),
      this.auditEvents.record({
        actor: user,
        action: AUDIT_ACTION.PARKING_SPACE_UPDATED,
        entityType: AUDIT_ENTITY.PARKING_SPACE,
        entityId: id,
        metadata: { updatedFields: Object.keys(dto) },
      }),
    ]);

    return this.normalizeParkingSpace(updatedParkingSpace);
  }

  async updateStatus(
    id: string,
    status: ParkingSpaceStatus,
    user: AuthenticatedUser,
  ): Promise<ParkingSpaceRecord> {
    const parkingSpace = await this.findById(id);
    this.assertOwnerOrAdmin(parkingSpace, user);

    const updatedParkingSpace = (await this.prisma.parkingSpace.update({
      where: { id },
      data: { status },
    })) as ParkingSpaceRecord;

    await Promise.all([
      this.availabilityCache.invalidateAvailability(),
      this.auditEvents.record({
        actor: user,
        action: AUDIT_ACTION.PARKING_SPACE_STATUS_UPDATED,
        entityType: AUDIT_ENTITY.PARKING_SPACE,
        entityId: id,
        metadata: { previousStatus: parkingSpace.status, status },
      }),
    ]);

    return this.normalizeParkingSpace(updatedParkingSpace);
  }

  async remove(id: string, user: AuthenticatedUser): Promise<{ id: string; deleted: boolean }> {
    const parkingSpace = await this.findById(id);
    this.assertOwnerOrAdmin(parkingSpace, user);
    await this.prisma.parkingSpace.delete({ where: { id } });

    await Promise.all([
      this.availabilityCache.invalidateAvailability(),
      this.auditEvents.record({
        actor: user,
        action: AUDIT_ACTION.PARKING_SPACE_DELETED,
        entityType: AUDIT_ENTITY.PARKING_SPACE,
        entityId: id,
        metadata: { name: parkingSpace.name },
      }),
    ]);

    return { id, deleted: true };
  }

  async addPhoto(
    id: string,
    dto: AddParkingSpacePhotoDto,
    user: AuthenticatedUser,
  ): Promise<ParkingPhotoUploadResponse> {
    const parkingSpace = await this.findById(id);
    this.assertOwnerOrAdmin(parkingSpace, user);

    const upload: ParkingPhotoUpload = dto.url ? { photoUrl: dto.url } : await this.createPresignedPhotoUpload(id, dto);
    const photos = this.appendPhotoUrl(parkingSpace.photos, upload.photoUrl);
    const updatedParkingSpace = (await this.prisma.parkingSpace.update({
      where: { id },
      data: { photos },
    })) as ParkingSpaceRecord;

    await this.auditEvents.record({
      actor: user,
      action: AUDIT_ACTION.PARKING_SPACE_PHOTO_ADDED,
      entityType: AUDIT_ENTITY.PARKING_SPACE,
      entityId: id,
      metadata: { photoUrl: upload.photoUrl, presignedUpload: Boolean(upload.uploadUrl) },
    });

    return {
      parkingSpace: this.normalizeParkingSpace(updatedParkingSpace),
      photoUrl: upload.photoUrl,
      uploadUrl: upload.uploadUrl,
      uploadMethod: upload.uploadUrl ? 'PUT' : undefined,
      expiresInSeconds: upload.expiresInSeconds,
    };
  }

  private async geocodeAddress(address: string): Promise<GeocodeResult> {
    return this.mapsService.geocode(address);
  }

  private async createPresignedPhotoUpload(
    parkingSpaceId: string,
    dto: AddParkingSpacePhotoDto,
  ): Promise<{ photoUrl: string; uploadUrl: string; expiresInSeconds: number }> {
    if (!dto.fileName) {
      throw new BadRequestException('fileName is required when url is not provided');
    }

    const bucket = this.configService.get<string>('S3_BUCKET');

    if (!bucket) {
      throw new BadRequestException('S3_BUCKET is required to generate parking photo upload URLs');
    }

    const expiresInSeconds = 900;
    const contentType = dto.contentType ?? 'image/jpeg';
    const key = `parking-spaces/${parkingSpaceId}/${randomUUID()}-${this.sanitizeFileName(dto.fileName)}`;
    const client = this.createS3Client();
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    return {
      photoUrl: this.buildPhotoUrl(bucket, key),
      uploadUrl: await getSignedUrl(client, command, { expiresIn: expiresInSeconds }),
      expiresInSeconds,
    };
  }

  private createS3Client(): S3Client {
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID') ?? this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey =
      this.configService.get<string>('S3_SECRET_ACCESS_KEY') ?? this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    return new S3Client({
      region: this.configService.get<string>('S3_REGION') ?? this.configService.get<string>('AWS_REGION') ?? 'us-east-1',
      endpoint,
      forcePathStyle: Boolean(endpoint),
      credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
    });
  }

  private buildPhotoUrl(bucket: string, key: string): string {
    const publicBaseUrl = this.configService.get<string>('S3_PUBLIC_BASE_URL');

    if (publicBaseUrl) {
      return `${publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }

    const endpoint = this.configService.get<string>('S3_ENDPOINT');

    if (endpoint) {
      return `${endpoint.replace(/\/$/, '')}/${bucket}/${key}`;
    }

    const region = this.configService.get<string>('S3_REGION') ?? this.configService.get<string>('AWS_REGION') ?? 'us-east-1';
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  private sanitizeFileName(fileName: string): string {
    return fileName.trim().replace(/[^a-zA-Z0-9._-]/g, '-');
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

  private appendPhotoUrl(existingPhotos: string[], photoUrl: string): string[] {
    return Array.from(new Set([...existingPhotos, photoUrl]));
  }

  private normalizeParkingSpace(space: ParkingSpaceRecord): ParkingSpaceRecord {
    return {
      ...space,
      photos: Array.isArray(space.photos) ? space.photos.filter((photo): photo is string => typeof photo === 'string') : [],
    };
  }

  private buildSearchCacheCriteria(dto: SearchParkingSpacesDto): Record<string, unknown> {
    return {
      lat: dto.lat,
      lng: dto.lng,
      maxDistance: dto.maxDistance,
      minPrice: dto.minPrice,
      maxPrice: dto.maxPrice,
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: dto.status ?? PARKING_SPACE_STATUS.AVAILABLE,
      limit: dto.limit ?? DEFAULT_SEARCH_LIMIT,
      offset: dto.offset ?? 0,
    };
  }
}
