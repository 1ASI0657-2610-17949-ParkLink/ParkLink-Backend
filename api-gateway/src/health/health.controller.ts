import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipResponseWrap } from '../../../libs/common/src';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
@SkipResponseWrap()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check gateway and downstream services health' })
  check() {
    return this.healthService.check();
  }
}
