export const PARKING_SPACE_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  OCCUPIED: 'OCCUPIED',
  DISABLED: 'DISABLED',
} as const;

export type ParkingSpaceStatus =
  (typeof PARKING_SPACE_STATUS)[keyof typeof PARKING_SPACE_STATUS];
