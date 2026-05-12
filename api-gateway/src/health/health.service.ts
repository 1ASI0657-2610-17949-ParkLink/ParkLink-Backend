import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

type ServiceAvailability = 'available' | 'unavailable';

@Injectable()
export class HealthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async check() {
    const backendUrl = this.configService.get<string>('BACKEND_URL');
    const status = await this.checkBackend(backendUrl);

    return {
      status: status === 'available' ? 'ok' : 'degraded',
      service: 'api-gateway',
      backend: status,
      backendUrl: backendUrl ?? 'NOT_CONFIGURED',
      timestamp: new Date().toISOString(),
    };
  }

  private async checkBackend(backendUrl: string | undefined): Promise<ServiceAvailability> {
    if (!backendUrl) {
      return 'unavailable';
    }

    try {
      await firstValueFrom(
        this.httpService.get(`${backendUrl}/health`, {
          timeout: 1500,
        }),
      );
      return 'available';
    } catch {
      return 'unavailable';
    }
  }
}