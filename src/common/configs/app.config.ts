import { registerAs } from '@nestjs/config';

import { requireEnv } from './config.helper';

export interface IAppConfig {
  port: number;
  environment: string;
}

export default registerAs(
  'app',
  (): IAppConfig => ({
    port: parseInt(requireEnv('PORT')),
    environment: requireEnv('NODE_ENV'),
  }),
);
