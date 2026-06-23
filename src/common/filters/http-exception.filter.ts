import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';

import type { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const res = exception.getResponse();

    let message: unknown = exception.message;
    if (typeof res === 'object') {
      const resObj = res as Record<string, unknown>;
      if ('message' in resObj) {
        message = resObj.message;
      }
    }

    this.logger.warn(`[${request.method}] ${request.url} - ${status}: ${JSON.stringify(message)}`);

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: exception.name,
      message,
    });
  }
}
