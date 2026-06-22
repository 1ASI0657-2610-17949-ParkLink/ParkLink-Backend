import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { type AuthenticatedUser } from '../../common';
import { PrismaService } from '../../database/prisma.service';
import { type AuditAction, type AuditEntity } from './audit.constants';
import { QueryAuditEventsDto } from './dto/query-audit-events.dto';

const DEFAULT_AUDIT_LIMIT = 100;

export interface AuditEventRecord {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: unknown;
  createdAt: Date;
}

export interface RecordAuditEventInput {
  actor?: AuthenticatedUser;
  action: AuditAction;
  entityType: AuditEntity;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditEventsService {
  private readonly logger = new Logger(AuditEventsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordAuditEventInput): Promise<void> {
    try {
      await this.prisma.auditEvent.create({
        data: {
          actorId: input.actor?.sub,
          actorRole: input.actor?.role,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          metadata: input.metadata as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown audit persistence error';
      this.logger.warn(`Audit event skipped: ${message}`);
    }
  }

  async findMany(query: QueryAuditEventsDto): Promise<AuditEventRecord[]> {
    return (await this.prisma.auditEvent.findMany({
      where: {
        action: query.action,
        entityType: query.entityType,
        actorId: query.actorId,
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? DEFAULT_AUDIT_LIMIT,
    })) as AuditEventRecord[];
  }
}
