import { SetMetadata, type CustomDecorator } from '@nestjs/common';

export const IS_IDEMPOTENT_KEY = 'isIdempotent';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Idempotent = (options?: { ttlSeconds?: number }): CustomDecorator<string> =>
  SetMetadata(IS_IDEMPOTENT_KEY, options ?? { ttlSeconds: 120 });
