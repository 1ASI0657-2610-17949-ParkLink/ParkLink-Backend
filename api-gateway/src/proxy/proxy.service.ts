import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

type HeaderValue = string | string[];
type ResponseHeaders = Record<string, unknown>;

const MAX_ATTEMPTS = 2;
const RETRY_BACKOFF_MS = 150;
const CIRCUIT_FAILURE_THRESHOLD = 3;
const CIRCUIT_OPEN_MS = 25_000;

interface CircuitState {
  failures: number;
  openedUntil?: number;
  lastError?: string;
}

@Injectable()
export class ProxyService {
  private readonly circuits = new Map<string, CircuitState>();

  constructor(private readonly httpService: HttpService) {}

  async forward(request: Request, response: Response, targetBaseUrl: string | undefined): Promise<void> {
    if (!targetBaseUrl) {
      throw new ServiceUnavailableException('Backend service is not configured. Set BACKEND_URL environment variable.');
    }

    if (this.isCircuitOpen(targetBaseUrl)) {
      throw new ServiceUnavailableException('Downstream service is temporarily unavailable');
    }

    const targetUrl = new URL(request.originalUrl, targetBaseUrl).toString();
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const proxiedResponse = await firstValueFrom(
          this.httpService.request<unknown>({
            method: request.method,
            url: targetUrl,
            data: request.body,
            headers: this.forwardHeaders(request),
            responseType: 'arraybuffer',
            timeout: 10_000,
            validateStatus: () => true,
          }),
        );

        if (proxiedResponse.status < 500 || attempt === MAX_ATTEMPTS) {
          if (proxiedResponse.status >= 500) {
            this.recordFailure(targetBaseUrl, `HTTP ${proxiedResponse.status}`);
          } else {
            this.recordSuccess(targetBaseUrl);
          }

          this.forwardResponseHeaders(response, proxiedResponse.headers as ResponseHeaders);
          this.sendResponse(response, proxiedResponse.status, proxiedResponse.data, proxiedResponse.headers as ResponseHeaders);
          return;
        }

        lastError = new Error(`HTTP ${proxiedResponse.status}`);
      } catch (error) {
        lastError = error;

        if (attempt === MAX_ATTEMPTS) {
          break;
        }
      }

      await this.sleep(RETRY_BACKOFF_MS * attempt);
    }

    this.recordFailure(targetBaseUrl, this.errorMessage(lastError));
    throw new BadGatewayException('Downstream service is unavailable');
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

  private forwardResponseHeaders(response: Response, headers: ResponseHeaders): void {
    const skippedHeaders = new Set(['connection', 'content-encoding', 'content-length', 'transfer-encoding']);

    Object.entries(headers ?? {}).forEach(([key, value]) => {
      if (value == null || skippedHeaders.has(key.toLowerCase())) {
        return;
      }

      response.setHeader(key, Array.isArray(value) ? value.map(String) : String(value));
    });
  }

  private sendResponse(response: Response, status: number, data: unknown, headers: ResponseHeaders): void {
    const contentType = String(headers?.['content-type'] ?? headers?.['Content-Type'] ?? '');

    if (contentType.includes('application/json')) {
      const text = Buffer.isBuffer(data) ? data.toString('utf8') : String(data ?? '');
      response.status(status).json(text ? JSON.parse(text) : null);
      return;
    }

    if (!Buffer.isBuffer(data) && typeof data !== 'string') {
      response.status(status).json(data);
      return;
    }

    response.status(status).send(Buffer.isBuffer(data) ? data : Buffer.from(data));
  }

  private isCircuitOpen(upstream: string): boolean {
    const state = this.circuits.get(upstream);

    if (!state?.openedUntil) {
      return false;
    }

    if (Date.now() >= state.openedUntil) {
      this.circuits.delete(upstream);
      return false;
    }

    return true;
  }

  private recordSuccess(upstream: string): void {
    this.circuits.delete(upstream);
  }

  private recordFailure(upstream: string, error: string): void {
    const state = this.circuits.get(upstream) ?? { failures: 0 };
    state.failures += 1;
    state.lastError = error;

    if (state.failures >= CIRCUIT_FAILURE_THRESHOLD) {
      state.openedUntil = Date.now() + CIRCUIT_OPEN_MS;
    }

    this.circuits.set(upstream, state);
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown downstream error';
  }

  private sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds));
  }
}
