import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, type Observable } from 'rxjs';
import { SKIP_RESPONSE_WRAP_KEY } from '../decorators/skip-response-wrap.decorator';
import type { ApiResponse } from '../types/api-response.type';

interface MaybeWrappedResponse {
  success?: unknown;
}

function isWrappedResponse(value: unknown): value is ApiResponse<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    typeof (value as MaybeWrappedResponse).success === 'boolean'
  );
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor<unknown, unknown> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
    const shouldSkip = this.reflector.getAllAndOverride<boolean>(SKIP_RESPONSE_WRAP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (shouldSkip) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data: unknown): ApiResponse<unknown> | unknown => {
        if (isWrappedResponse(data)) {
          return data;
        }

        return {
          success: true,
          message: 'Operation completed successfully',
          data,
        };
      }),
    );
  }
}
