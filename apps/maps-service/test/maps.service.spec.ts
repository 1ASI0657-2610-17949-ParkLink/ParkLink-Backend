import { MapsService } from '../src/maps/maps.service';
import type { MapsProvider } from '../src/maps/maps.provider';

describe('MapsService', () => {
  it('geocodes through the configured maps provider adapter', async () => {
    const provider = {
      geocode: jest.fn().mockResolvedValue({
        address: 'Av Santa Fe',
        formattedAddress: 'Av. Santa Fe, Buenos Aires',
        latitude: -34.6,
        longitude: -58.4,
        placeId: 'place-1',
      }),
      reverseGeocode: jest.fn(),
      calculateDistance: jest.fn(),
      calculateDirections: jest.fn(),
      getStaticMapImage: jest.fn(),
    } as unknown as MapsProvider;
    const service = new MapsService(provider);

    const result = await service.geocode('Av Santa Fe');

    expect(result.latitude).toBe(-34.6);
    expect(provider.geocode).toHaveBeenCalledWith('Av Santa Fe');
  });
});
