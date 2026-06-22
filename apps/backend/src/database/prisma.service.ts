import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL');

    if (!connectionString) {
      throw new Error('DATABASE_URL is required for persistent services');
    }

    super({
      adapter: new PrismaPg(connectionString),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    await this.ensureSprint3Schema();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  private async ensureSprint3Schema(): Promise<void> {
    await this.$executeRawUnsafe(
      'ALTER TABLE "ParkingSpace" ADD COLUMN IF NOT EXISTS "photos" JSONB NOT NULL DEFAULT \'[]\'',
    );
    await this.$executeRawUnsafe(
      'ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT',
    );
    await this.$executeRawUnsafe(
      'CREATE UNIQUE INDEX IF NOT EXISTS "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey")',
    );
    await this.$executeRawUnsafe(`
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
      )
    `);
    await this.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS "AuditEvent_actorId_createdAt_idx" ON "AuditEvent"("actorId", "createdAt")',
    );
    await this.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS "AuditEvent_action_entityType_createdAt_idx" ON "AuditEvent"("action", "entityType", "createdAt")',
    );
  }
}
