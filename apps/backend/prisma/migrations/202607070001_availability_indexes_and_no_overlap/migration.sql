CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE INDEX IF NOT EXISTS "ParkingSpace_status_pricePerHour_idx"
  ON "ParkingSpace"("status", "pricePerHour");

CREATE INDEX IF NOT EXISTS "ParkingSpace_openingTime_closingTime_idx"
  ON "ParkingSpace"("openingTime", "closingTime");

CREATE INDEX IF NOT EXISTS "Reservation_parkingSpaceId_status_startTime_endTime_idx"
  ON "Reservation"("parkingSpaceId", "status", "startTime", "endTime");

ALTER TABLE "Reservation"
  ADD CONSTRAINT "Reservation_no_overlapping_active_time"
  EXCLUDE USING gist (
    "parkingSpaceId" WITH =,
    tsrange("startTime", "endTime", '[)') WITH &&
  )
  WHERE ("status" IN ('PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE'));
