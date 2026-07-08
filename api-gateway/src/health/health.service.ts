import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

type ServiceAvailability = 'available' | 'unavailable';

interface BackendHealth {
  status: ServiceAvailability;
  latencyMs: number | null;
  lastError?: string;
}

@Injectable()
export class HealthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async check() {
    const backendUrl = this.configService.get<string>('BACKEND_URL');
    const backend = await this.checkBackend(backendUrl);
    const degradedReason = backend.status === 'available' ? undefined : backend.lastError ?? 'Backend unavailable';

    return {
      status: backend.status === 'available' ? 'ok' : 'degraded',
      service: 'api-gateway',
      backend: backend.status,
      backendLatencyMs: backend.latencyMs,
      lastError: backend.lastError,
      degradedReason,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkBackend(backendUrl: string | undefined): Promise<BackendHealth> {
    if (!backendUrl) {
      return {
        status: 'unavailable',
        latencyMs: null,
        lastError: 'BACKEND_URL is not configured',
      };
    }

    const startedAt = Date.now();

    try {
      await firstValueFrom(
        this.httpService.get(`${backendUrl}/health`, {
          timeout: 5000,
        }),
      );
      return {
        status: 'available',
        latencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      return {
        status: 'unavailable',
        latencyMs: Date.now() - startedAt,
        lastError: error instanceof Error ? error.message : 'Backend health check failed',
      };
    }
  }
}
