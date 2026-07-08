import { HttpException, Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  MAPS_PROVIDER,
  TRAVEL_MODE,
  type DirectionsResult,
  type DistanceResult,
  type GeocodeResult,
  type MapsProvider,
  type ReverseGeocodeResult,
  type StaticMapResult,
  type TravelMode,
} from './maps.provider';

@Injectable()
export class MapsService {
  constructor(@Inject(MAPS_PROVIDER) private readonly mapsProvider: MapsProvider) {}

  geocode(address: string): Promise<GeocodeResult> {
    return this.withMapsFallback(() => this.mapsProvider.geocode(address));
  }

  reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult> {
    return this.withMapsFallback(() => this.mapsProvider.reverseGeocode(latitude, longitude));
  }

  calculateDistance(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
  ): Promise<DistanceResult> {
    return this.withMapsFallback(() => this.mapsProvider.calculateDistance(originLat, originLng, destinationLat, destinationLng));
  }

  calculateDirections(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
    travelMode: TravelMode = TRAVEL_MODE.DRIVING,
  ): Promise<DirectionsResult> {
    return this.withMapsFallback(() =>
      this.mapsProvider.calculateDirections(
        originLat,
        originLng,
        destinationLat,
        destinationLng,
        travelMode,
      ),
    );
  }

  getStaticMapImage(
    centerLat: number,
    centerLng: number,
    zoom = 15,
    width = 640,
    height = 400,
  ): Promise<StaticMapResult> {
    return this.withMapsFallback(() => this.mapsProvider.getStaticMapImage(centerLat, centerLng, zoom, width, height));
  }

  private async withMapsFallback<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new ServiceUnavailableException('Google Maps service is temporarily unavailable');
    }
  }
}
