import { All, Controller, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

@ApiTags('Proxy')
@Controller()
export class ProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['auth', 'auth/*'])
  @ApiOperation({ summary: 'Proxy auth requests → backend' })
  proxyAuth(@Req() request: Request, @Res() response: Response): Promise<void> {
    return this.proxyService.forward(request, response, this.configService.get<string>('BACKEND_URL'));
  }

  @All(['users', 'users/*'])
  @ApiOperation({ summary: 'Proxy users requests → backend' })
  proxyUsers(@Req() request: Request, @Res() response: Response): Promise<void> {
    return this.proxyService.forward(request, response, this.configService.get<string>('BACKEND_URL'));
  }

  @All(['parking-spaces', 'parking-spaces/*'])
  @ApiOperation({ summary: 'Proxy parking requests → backend' })
  proxyParking(@Req() request: Request, @Res() response: Response): Promise<void> {
    return this.proxyService.forward(request, response, this.configService.get<string>('BACKEND_URL'));
  }

  @All(['reservations', 'reservations/*'])
  @ApiOperation({ summary: 'Proxy reservation requests → backend' })
  proxyReservations(@Req() request: Request, @Res() response: Response): Promise<void> {
    return this.proxyService.forward(request, response, this.configService.get<string>('BACKEND_URL'));
  }

  @All(['payments', 'payments/*'])
  @ApiOperation({ summary: 'Proxy payment requests → backend' })
  proxyPayments(@Req() request: Request, @Res() response: Response): Promise<void> {
    return this.proxyService.forward(request, response, this.configService.get<string>('BACKEND_URL'));
  }

  @All(['notifications', 'notifications/*'])
  @ApiOperation({ summary: 'Proxy notification requests → backend' })
  proxyNotifications(@Req() request: Request, @Res() response: Response): Promise<void> {
    return this.proxyService.forward(request, response, this.configService.get<string>('BACKEND_URL'));
  }

  @All(['maps', 'maps/*'])
  @ApiOperation({ summary: 'Proxy maps requests → backend' })
  proxyMaps(@Req() request: Request, @Res() response: Response): Promise<void> {
    return this.proxyService.forward(request, response, this.configService.get<string>('BACKEND_URL'));
  }

  @All('health/*')
  @ApiOperation({ summary: 'Proxy health requests → backend' })
  proxyHealth(@Req() request: Request, @Res() response: Response): Promise<void> {
    return this.proxyService.forward(request, response, this.configService.get<string>('BACKEND_URL'));
  }
}
