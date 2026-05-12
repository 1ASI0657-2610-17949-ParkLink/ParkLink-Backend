export interface GeocodeResult {
  address: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

export interface ReverseGeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  placeId: string;
}

export interface DistanceResult {
  origin: string;
  destination: string;
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
}

export const TRAVEL_MODE = {
  DRIVING: 'driving',
  WALKING: 'walking',
  BICYCLING: 'bicycling',
  TRANSIT: 'transit',
} as const;

export type TravelMode = (typeof TRAVEL_MODE)[keyof typeof TRAVEL_MODE];

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RouteStep {
  instruction: string;
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
  startLocation: Coordinate;
  endLocation: Coordinate;
}

export interface DirectionsResult {
  origin: string;
  destination: string;
  summary: string;
  travelMode: TravelMode;
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
  overviewPolyline: string;
  steps: RouteStep[];
}

export interface StaticMapResult {
  contentType: string;
  image: Buffer;
}

export interface MapsProvider {
  geocode(address: string): Promise<GeocodeResult>;
  reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult>;
  calculateDistance(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
  ): Promise<DistanceResult>;
  calculateDirections(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
    travelMode: TravelMode,
  ): Promise<DirectionsResult>;
  getStaticMapImage(
    centerLat: number,
    centerLng: number,
    zoom: number,
    width: number,
    height: number,
  ): Promise<StaticMapResult>;
}

export const MAPS_PROVIDER = Symbol('MAPS_PROVIDER');
