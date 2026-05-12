import { Inject, Injectable } from '@nestjs/common';
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
    return this.mapsProvider.geocode(address);
  }

  reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult> {
    return this.mapsProvider.reverseGeocode(latitude, longitude);
  }

  calculateDistance(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
  ): Promise<DistanceResult> {
    return this.mapsProvider.calculateDistance(originLat, originLng, destinationLat, destinationLng);
  }

  calculateDirections(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
    travelMode: TravelMode = TRAVEL_MODE.DRIVING,
  ): Promise<DirectionsResult> {
    return this.mapsProvider.calculateDirections(
      originLat,
      originLng,
      destinationLat,
      destinationLng,
      travelMode,
    );
  }

  getStaticMapImage(
    centerLat: number,
    centerLng: number,
    zoom = 15,
    width = 640,
    height = 400,
  ): Promise<StaticMapResult> {
    return this.mapsProvider.getStaticMapImage(centerLat, centerLng, zoom, width, height);
  }
}
