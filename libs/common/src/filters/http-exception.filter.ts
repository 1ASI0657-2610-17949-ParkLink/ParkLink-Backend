import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api-response.type';

interface ErrorResponseBody {
  message?: unknown;
  error?: unknown;
}

function isErrorResponseBody(value: unknown): value is ErrorResponseBody {
  return typeof value === 'object' && value !== null;
}

function extractMessage(exception: unknown): string {
  if (exception instanceof HttpException) {
    const responseBody = exception.getResponse();

    if (typeof responseBody === 'string') {
      return responseBody;
    }

    if (isErrorResponseBody(responseBody) && responseBody.message !== undefined) {
      if (Array.isArray(responseBody.message)) {
        return responseBody.message.map(String).join(', ');
      }

      return String(responseBody.message);
    }

    return exception.message;
  }

  if (exception instanceof Error) {
    return exception.message;
  }

  return 'Unexpected internal server error';
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: ApiResponse<null> = {
      success: false,
      statusCode,
      message: extractMessage(exception),
      timestamp: new Date().toISOString(),
      path: request.url,
      data: null,
    };

    response.status(statusCode).json(body);
  }
}
