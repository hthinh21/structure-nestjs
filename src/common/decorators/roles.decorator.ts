// roles.decorator.ts
import { SetMetadata, type CustomDecorator } from '@nestjs/common';

import type { RoleType } from '../constants/role.constants';

export const ROLES_KEY = 'roles';
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Roles = (...roles: RoleType[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);
