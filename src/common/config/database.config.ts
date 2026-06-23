import { join } from 'path';

import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[DatabaseConfig] Missing required environment variable: "${key}"`);
  }
  return value;
};

export default registerAs('database', (): TypeOrmModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: requireEnv('DB_USERNAME'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_DATABASE'),
    // Use join() to ensure absolute paths work in both dev (.ts) and build (.js)
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, '..', 'database', 'typeorm', 'migrations', '*.{ts,js}')],
    // Never true — schema changes must go through migrations
    synchronize: false,
    // Auto-run migrations on startup in production CI/CD pipelines
    migrationsRun: isProduction,
    logging: isDevelopment,
    // SSL required for cloud providers (AWS RDS, Heroku, Azure)
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    // Connection pool tuning
    extra: {
      max: isProduction ? 20 : 10, // Max concurrent DB connections
      min: 2, // Min connections kept alive
      idleTimeoutMillis: 30_000, // Close idle connections after 30s
      connectionTimeoutMillis: 2_000, // Fail fast if DB unreachable after 2s
    },

    
  };
});
