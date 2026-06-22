import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard, USER_ROLE } from '../../common';
import { AuditEventsService } from './audit-events.service';
import { QueryAuditEventsDto } from './dto/query-audit-events.dto';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(USER_ROLE.ADMIN)
@Controller('audit/events')
export class AuditEventsController {
  constructor(private readonly auditEventsService: AuditEventsService) {}

  @Get()
  @ApiOperation({ summary: 'List audit events for critical operations' })
  findMany(@Query() query: QueryAuditEventsDto) {
    return this.auditEventsService.findMany(query);
  }
}
