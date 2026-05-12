import type { HttpService } from '@nestjs/axios';
import type { ConfigService } from '@nestjs/config';
import { PARKING_SPACE_STATUS, USER_ROLE } from '@parklink/common';
import { of } from 'rxjs';
import type { PrismaService } from '../src/database/prisma.service';
import { ParkingSpacesService } from '../src/parking-spaces/parking-spaces.service';

describe('ParkingSpacesService', () => {
  it('creates a parking space for an owner using maps-service geocoding', async () => {
    const createdAt = new Date();
    const prisma = {
      parkingSpace: {
        create: jest.fn().mockResolvedValue({
          id: 'space-1',
          ownerId: 'owner-1',
          name: 'Cochera Centro',
          address: 'Av Siempre Viva 123',
          reference: 'Portón azul',
          latitude: -34.6,
          longitude: -58.4,
          pricePerHour: 1000,
          openingTime: '08:00',
          closingTime: '20:00',
          status: PARKING_SPACE_STATUS.AVAILABLE,
          createdAt,
          updatedAt: createdAt,
        }),
      },
    } as unknown as PrismaService;
    const http = {
      get: jest.fn().mockReturnValue(of({ data: { success: true, data: { latitude: -34.6, longitude: -58.4 } } })),
    } as unknown as HttpService;
    const config = { get: jest.fn().mockReturnValue('http://localhost:3007') } as unknown as ConfigService;
    const service = new ParkingSpacesService(prisma, http, config);

    const result = await service.create(
      {
        name: 'Cochera Centro',
        address: 'Av Siempre Viva 123',
        reference: 'Portón azul',
        pricePerHour: 1000,
        openingTime: '08:00',
        closingTime: '20:00',
      },
      { sub: 'owner-1', email: 'owner@parklink.test', role: USER_ROLE.OWNER },
    );

    expect(result.status).toBe(PARKING_SPACE_STATUS.AVAILABLE);
    expect(prisma.parkingSpace.create).toHaveBeenCalled();
  });
});
