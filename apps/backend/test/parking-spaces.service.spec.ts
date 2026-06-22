import type { ConfigService } from '@nestjs/config';
import { PARKING_SPACE_STATUS, USER_ROLE, type AuthenticatedUser } from '../src/common';
import type { PrismaService } from '../src/database/prisma.service';
import type { AvailabilityCacheService } from '../src/modules/availability-cache/availability-cache.service';
import type { AuditEventsService } from '../src/modules/audit/audit-events.service';
import type { MapsService } from '../src/modules/maps/maps.service';
import { ParkingSpacesService } from '../src/modules/parking/parking-spaces.service';

describe('ParkingSpacesService', () => {
  const owner: AuthenticatedUser = {
    sub: 'owner-1',
    email: 'owner01@parklink.test',
    role: USER_ROLE.OWNER,
  };

  const parkingSpace = {
    id: 'space-1',
    ownerId: owner.sub,
    name: 'Cochera Centro',
    address: 'Av. Arequipa 123, Lima',
    reference: 'Portón negro',
    latitude: -12.0464,
    longitude: -77.0428,
    pricePerHour: 12,
    openingTime: '08:00',
    closingTime: '22:00',
    photos: [],
    status: PARKING_SPACE_STATUS.AVAILABLE,
    createdAt: new Date('2026-06-22T10:00:00.000Z'),
    updatedAt: new Date('2026-06-22T10:00:00.000Z'),
  };

  const buildService = () => {
    const prisma = {
      parkingSpace: {
        findMany: jest.fn().mockResolvedValue([parkingSpace]),
        findUnique: jest.fn().mockResolvedValue(parkingSpace),
        update: jest.fn().mockResolvedValue({ ...parkingSpace, photos: ['https://cdn.test/photo.jpg'] }),
      },
    };
    const mapsService = { geocode: jest.fn() };
    const availabilityCache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      invalidateAvailability: jest.fn().mockResolvedValue(undefined),
    };
    const auditEvents = { record: jest.fn().mockResolvedValue(undefined) };
    const configService = { get: jest.fn().mockReturnValue(undefined) };
    const service = new ParkingSpacesService(
      prisma as unknown as PrismaService,
      mapsService as unknown as MapsService,
      availabilityCache as unknown as AvailabilityCacheService,
      auditEvents as unknown as AuditEventsService,
      configService as unknown as ConfigService,
    );

    return { service, prisma, availabilityCache, auditEvents };
  };

  it('caches search results for repeated availability projections', async () => {
    const { service, prisma, availabilityCache } = buildService();

    const spaces = await service.search({ lat: -12.046, lng: -77.04, maxDistance: 5 });

    expect(spaces).toHaveLength(1);
    expect(prisma.parkingSpace.findMany).toHaveBeenCalledTimes(1);
    expect(availabilityCache.set).toHaveBeenCalledWith(expect.objectContaining({ maxDistance: 5 }), spaces);
  });

  it('returns cached availability without querying the database', async () => {
    const { service, prisma, availabilityCache } = buildService();
    availabilityCache.get.mockResolvedValueOnce([parkingSpace]);

    const spaces = await service.search({ status: PARKING_SPACE_STATUS.AVAILABLE });

    expect(spaces).toEqual([parkingSpace]);
    expect(prisma.parkingSpace.findMany).not.toHaveBeenCalled();
  });

  it('attaches a public photo URL to an owner parking space', async () => {
    const { service, prisma, auditEvents } = buildService();

    const result = await service.addPhoto('space-1', { url: 'https://cdn.test/photo.jpg' }, owner);

    expect(result.photoUrl).toBe('https://cdn.test/photo.jpg');
    expect(prisma.parkingSpace.update).toHaveBeenCalledWith({
      where: { id: 'space-1' },
      data: { photos: ['https://cdn.test/photo.jpg'] },
    });
    expect(auditEvents.record).toHaveBeenCalledWith(expect.objectContaining({ entityId: 'space-1' }));
  });
});
