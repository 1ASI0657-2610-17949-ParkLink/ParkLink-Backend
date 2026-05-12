import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type {
  DirectionsResult,
  DistanceResult,
  GeocodeResult,
  MapsProvider,
  ReverseGeocodeResult,
  RouteStep,
  StaticMapResult,
  TravelMode,
} from '../maps.provider';

interface GoogleLocation {
  lat: number;
  lng: number;
}

interface GoogleGeometry {
  location: GoogleLocation;
}

interface GoogleGeocodeResult {
  formatted_address: string;
  place_id: string;
  geometry: GoogleGeometry;
}

interface GoogleGeocodeResponse {
  status: string;
  error_message?: string;
  results: GoogleGeocodeResult[];
}

interface GoogleDistanceValue {
  text: string;
  value: number;
}

interface GoogleDistanceElement {
  status: string;
  distance: GoogleDistanceValue;
  duration: GoogleDistanceValue;
}

interface GoogleDistanceRow {
  elements: GoogleDistanceElement[];
}

interface GoogleDistanceResponse {
  status: string;
  error_message?: string;
  origin_addresses: string[];
  destination_addresses: string[];
  rows: GoogleDistanceRow[];
}

interface GooglePolyline {
  points: string;
}

interface GoogleDirectionsStep {
  html_instructions: string;
  distance: GoogleDistanceValue;
  duration: GoogleDistanceValue;
  start_location: GoogleLocation;
  end_location: GoogleLocation;
}

interface GoogleDirectionsLeg {
  start_address: string;
  end_address: string;
  distance: GoogleDistanceValue;
  duration: GoogleDistanceValue;
  steps: GoogleDirectionsStep[];
}

interface GoogleDirectionsRoute {
  summary: string;
  overview_polyline: GooglePolyline;
  legs: GoogleDirectionsLeg[];
}

interface GoogleDirectionsResponse {
  status: string;
  error_message?: string;
  routes: GoogleDirectionsRoute[];
}

@Injectable()
export class GoogleMapsAdapter implements MapsProvider {
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async geocode(address: string): Promise<GeocodeResult> {
    const response = await firstValueFrom(
      this.httpService.get<GoogleGeocodeResponse>(`${this.baseUrl}/geocode/json`, {
        params: {
          address,
          key: this.apiKey(),
        },
      }),
    );

    this.ensureGoogleStatusOk(response.data.status, response.data.error_message);
    const firstResult = response.data.results[0];

    if (!firstResult) {
      throw new ServiceUnavailableException('Google Maps returned no geocoding results');
    }

    return {
      address,
      formattedAddress: firstResult.formatted_address,
      latitude: firstResult.geometry.location.lat,
      longitude: firstResult.geometry.location.lng,
      placeId: firstResult.place_id,
    };
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult> {
    const response = await firstValueFrom(
      this.httpService.get<GoogleGeocodeResponse>(`${this.baseUrl}/geocode/json`, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: this.apiKey(),
        },
      }),
    );

    this.ensureGoogleStatusOk(response.data.status, response.data.error_message);
    const firstResult = response.data.results[0];

    if (!firstResult) {
      throw new ServiceUnavailableException('Google Maps returned no reverse geocoding results');
    }

    return {
      latitude,
      longitude,
      formattedAddress: firstResult.formatted_address,
      placeId: firstResult.place_id,
    };
  }

  async calculateDistance(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
  ): Promise<DistanceResult> {
    const response = await firstValueFrom(
      this.httpService.get<GoogleDistanceResponse>(`${this.baseUrl}/distancematrix/json`, {
        params: {
          origins: `${originLat},${originLng}`,
          destinations: `${destinationLat},${destinationLng}`,
          key: this.apiKey(),
        },
      }),
    );

    this.ensureGoogleStatusOk(response.data.status, response.data.error_message);
    const firstElement = response.data.rows[0]?.elements[0];

    if (!firstElement || firstElement.status !== 'OK') {
      throw new ServiceUnavailableException('Google Maps returned no distance result');
    }

    return {
      origin: response.data.origin_addresses[0] ?? `${originLat},${originLng}`,
      destination: response.data.destination_addresses[0] ?? `${destinationLat},${destinationLng}`,
      distanceText: firstElement.distance.text,
      distanceMeters: firstElement.distance.value,
      durationText: firstElement.duration.text,
      durationSeconds: firstElement.duration.value,
    };
  }

  async calculateDirections(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
    travelMode: TravelMode,
  ): Promise<DirectionsResult> {
    const response = await firstValueFrom(
      this.httpService.get<GoogleDirectionsResponse>(`${this.baseUrl}/directions/json`, {
        params: {
          origin: `${originLat},${originLng}`,
          destination: `${destinationLat},${destinationLng}`,
          mode: travelMode,
          key: this.apiKey(),
        },
      }),
    );

    this.ensureGoogleStatusOk(response.data.status, response.data.error_message);
    const firstRoute = response.data.routes[0];
    const firstLeg = firstRoute?.legs[0];

    if (!firstRoute || !firstLeg) {
      throw new ServiceUnavailableException('Google Maps returned no directions result');
    }

    return {
      origin: firstLeg.start_address,
      destination: firstLeg.end_address,
      summary: firstRoute.summary,
      travelMode,
      distanceText: firstLeg.distance.text,
      distanceMeters: firstLeg.distance.value,
      durationText: firstLeg.duration.text,
      durationSeconds: firstLeg.duration.value,
      overviewPolyline: firstRoute.overview_polyline.points,
      steps: firstLeg.steps.map((step) => this.toRouteStep(step)),
    };
  }

  async getStaticMapImage(
    centerLat: number,
    centerLng: number,
    zoom: number,
    width: number,
    height: number,
  ): Promise<StaticMapResult> {
    const response = await firstValueFrom(
      this.httpService.get<ArrayBuffer>(`${this.baseUrl}/staticmap`, {
        params: {
          center: `${centerLat},${centerLng}`,
          zoom,
          size: `${width}x${height}`,
          markers: `color:red|${centerLat},${centerLng}`,
          key: this.apiKey(),
        },
        responseType: 'arraybuffer',
      }),
    );

    return {
      contentType: this.resolveContentType(response.headers as Record<string, unknown>),
      image: Buffer.from(response.data),
    };
  }

  private toRouteStep(step: GoogleDirectionsStep): RouteStep {
    return {
      instruction: this.stripHtml(step.html_instructions),
      distanceText: step.distance.text,
      distanceMeters: step.distance.value,
      durationText: step.duration.text,
      durationSeconds: step.duration.value,
      startLocation: {
        latitude: step.start_location.lat,
        longitude: step.start_location.lng,
      },
      endLocation: {
        latitude: step.end_location.lat,
        longitude: step.end_location.lng,
      },
    };
  }

  private stripHtml(value: string): string {
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private resolveContentType(headers: Record<string, unknown>): string {
    const contentType = headers['content-type'];

    if (typeof contentType === 'string') {
      return contentType;
    }

    if (Array.isArray(contentType) && typeof contentType[0] === 'string') {
      return contentType[0];
    }

    return 'image/png';
  }

  private apiKey(): string {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');

    if (!apiKey) {
      throw new ServiceUnavailableException('GOOGLE_MAPS_API_KEY is not configured');
    }

    return apiKey;
  }

  private ensureGoogleStatusOk(status: string, errorMessage: string | undefined): void {
    if (status !== 'OK') {
      throw new ServiceUnavailableException(errorMessage ?? `Google Maps API returned status ${status}`);
    }
  }
}
