import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipResponseWrap } from '../../../libs/common/src';
import { GatewayService } from './gateway.service';

@ApiTags('Gateway')
@Controller()
@SkipResponseWrap()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get()
  @ApiOperation({ summary: 'Show API Gateway status' })
  getStatus() {
    return this.gatewayService.getStatus();
  }

  @Get('routes')
  @ApiOperation({ summary: 'List gateway proxy routes' })
  getRoutes() {
    return {
      service: 'parklink-api-gateway',
      type: 'proxy-to-consolidated-backend',
      routes: this.gatewayService.getRoutes(),
    };
  }
}
