import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

type HeaderValue = string | string[];

@Injectable()
export class ProxyService {
  constructor(private readonly httpService: HttpService) {}

  async forward(request: Request, response: Response, targetBaseUrl: string | undefined): Promise<void> {
    if (!targetBaseUrl) {
      throw new ServiceUnavailableException('Backend service is not configured. Set BACKEND_URL environment variable.');
    }

    const targetUrl = new URL(request.originalUrl, targetBaseUrl).toString();

    try {
      const proxiedResponse = await firstValueFrom(
        this.httpService.request<unknown>({
          method: request.method,
          url: targetUrl,
          data: request.body,
          headers: this.forwardHeaders(request),
          timeout: 10000,
          validateStatus: () => true,
        }),
      );

      response.status(proxiedResponse.status).json(proxiedResponse.data);
    } catch {
      throw new BadGatewayException('Downstream service is unavailable');
    }
  }

  private forwardHeaders(request: Request): Record<string, HeaderValue> {
    const forwardedHeaders: Record<string, HeaderValue> = {};

    Object.entries(request.headers).forEach(([key, value]) => {
      if (!value || key === 'host' || key === 'content-length') {
        return;
      }

      forwardedHeaders[key] = value;
    });

    return forwardedHeaders;
  }
}