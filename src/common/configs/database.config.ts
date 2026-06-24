import { join } from 'path';

import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { requireEnv } from './config.helper';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    type: 'postgres',
    host: requireEnv('DB_HOST'),
    port: parseInt(requireEnv('DB_PORT'), 10),
    username: requireEnv('DB_USERNAME'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_DATABASE'),
    entities: [join(__dirname, '..', '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, '..', '..', 'database', 'typeorm', 'migrations', '*.{ts,js}')],
    synchronize: false,
    migrationsRun: isProduction,
    logging: isDevelopment,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    extra: {
      max: isProduction ? 20 : 10,
      min: 2,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 2_000,
    },
  };
});
