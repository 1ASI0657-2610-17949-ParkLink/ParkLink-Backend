-- Sprint 3 technical stories: availability photos, payment idempotency and audit trail.

ALTER TABLE "ParkingSpace"
  ADD COLUMN IF NOT EXISTS "photos" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "Payment"
  ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_idempotencyKey_key"
  ON "Payment"("idempotencyKey");

CREATE TABLE IF NOT EXISTS "AuditEvent" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "actorRole" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AuditEvent_actorId_createdAt_idx"
  ON "AuditEvent"("actorId", "createdAt");

CREATE INDEX IF NOT EXISTS "AuditEvent_action_entityType_createdAt_idx"
  ON "AuditEvent"("action", "entityType", "createdAt");
