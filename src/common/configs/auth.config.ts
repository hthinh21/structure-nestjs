import { registerAs } from '@nestjs/config';

import { requireEnv } from './config.helper';

export interface IAuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
}

export default registerAs(
  'auth',
  (): IAuthConfig => ({
    jwtSecret: requireEnv('JWT_SECRET'),
    jwtExpiresIn: requireEnv('JWT_EXPIRES_IN'),
    jwtRefreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    jwtRefreshExpiresIn: requireEnv('JWT_REFRESH_EXPIRES_IN'),
  }),
);
