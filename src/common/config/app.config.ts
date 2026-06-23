import { registerAs } from '@nestjs/config';

export interface IAppConfig {
  port: number;
  environment: string;
}

export default registerAs(
  'app',
  (): IAppConfig => ({
    port: parseInt(process.env.PORT ?? '3000', 10),
    environment: process.env.NODE_ENV ?? 'development',
  }),
);
