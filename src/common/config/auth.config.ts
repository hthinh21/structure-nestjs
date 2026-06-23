import { registerAs } from '@nestjs/config';

export interface IAuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
}

export default registerAs(
  'auth',
  (): IAuthConfig => ({
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  }),
);
