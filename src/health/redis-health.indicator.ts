import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, type HealthIndicatorResult } from '@nestjs/terminus';

import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.redisService.set('health-check', 'ok', 5);
      const val = await this.redisService.get('health-check');
      if (val === 'ok') {
        return this.getStatus(key, true);
      }
      throw new Error('Redis ping mismatch');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HealthCheckError(
        'Redis health check failed',
        this.getStatus(key, false, { message }),
      );
    }
  }
}
