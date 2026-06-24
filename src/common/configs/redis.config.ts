import { registerAs } from '@nestjs/config';

import { requireEnv } from './config.helper';

export interface IRedisConfig {
  host: string;
  port: number;
  password?: string | undefined;
}

export default registerAs(
  'redis',
  (): IRedisConfig => ({
    host: requireEnv('REDIS_HOST'),
    port: parseInt(requireEnv('REDIS_PORT'), 10),
    password: requireEnv('REDIS_PASSWORD') || undefined,
  }),
);
