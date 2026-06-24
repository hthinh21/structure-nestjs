import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { type Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { IS_IDEMPOTENT_KEY } from '../decorators/idempotent.decorator';
import { RedisService } from '../redis/redis.service';

import type { Response } from 'express';

interface IIdempotencyCachedResponse {
  status: 'processing' | 'completed';
  statusCode: number;
  body: unknown;
}

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const options = this.reflector.getAllAndOverride<{ ttlSeconds?: number } | undefined>(
      IS_IDEMPOTENT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: { id: string };
    }>();

    const idempotencyKey =
      request.headers['x-idempotency-key'] || request.headers['idempotency-key'];

    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required for this request');
    }

    const userId = request.user?.id || 'anonymous';
    const redisKey = `idempotency:${userId}:${idempotencyKey}`;
    const ttlSeconds = options.ttlSeconds ?? 120;

    const acquired = await this.redisService.setNx(
      redisKey,
      JSON.stringify({ status: 'processing' }),
      ttlSeconds,
    );

    if (!acquired) {
      const cachedVal = await this.redisService.get(redisKey);
      if (cachedVal) {
        return this.handleCachedResponse(cachedVal, context);
      }
    }

    return next.handle().pipe(
      tap(async (body: unknown) => {
        const response = context.switchToHttp().getResponse<Response>();
        const statusCode = response.statusCode || 200;
        await this.redisService.set(
          redisKey,
          JSON.stringify({ status: 'completed', statusCode, body }),
          ttlSeconds,
        );
      }),
      catchError(async (err: unknown) => {
        await this.redisService.del(redisKey);
        throw err;
      }),
    );
  }

  private handleCachedResponse(cachedVal: string, context: ExecutionContext): Observable<unknown> {
    const parsed = JSON.parse(cachedVal) as IIdempotencyCachedResponse;
    if (parsed.status === 'processing') {
      throw new ConflictException(
        'Another request with the same idempotency key is currently processing.',
      );
    }
    const response = context.switchToHttp().getResponse<Response>();
    response.status(parsed.statusCode);
    return of(parsed.body);
  }
}
