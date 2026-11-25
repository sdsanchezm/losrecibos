import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

export type HttpErrorBody = {
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
};

export function httpErrorBody(
  statusCode: number,
  message: string | string[],
  path: string,
): HttpErrorBody {
  return {
    statusCode,
    message,
    path,
    timestamp: new Date().toISOString(),
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = this.statusOf(exception);
    const path = request.originalUrl || request.url;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${path} failed`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response
      .status(status)
      .json(httpErrorBody(status, this.messageOf(exception), path));
  }

  private statusOf(exception: unknown): number {
    return exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private messageOf(exception: unknown): string | string[] {
    if (!(exception instanceof HttpException)) {
      return 'Internal server error';
    }

    const body = exception.getResponse();
    if (typeof body === 'string') {
      return body;
    }

    if (typeof body === 'object' && body !== null && 'message' in body) {
      const message = (body as { message?: unknown }).message;
      if (typeof message === 'string') {
        return message;
      }
      if (
        Array.isArray(message) &&
        message.every((item) => typeof item === 'string')
      ) {
        return message;
      }
    }

    return exception.message;
  }
}
