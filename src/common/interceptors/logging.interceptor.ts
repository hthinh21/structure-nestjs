import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common';

import { tap } from 'rxjs/operators';

import type { Request } from 'express';
import type { Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next
      .handle()
      .pipe(
        tap(() => this.logger.log(`[${method}] ${url} - Response time: ${Date.now() - now}ms`)),
      );
  }
}
