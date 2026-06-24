import type { RoleType } from '../../common/constants/role.constants';

export interface IJwtPayload {
  sub: string;
  email: string;
  role: RoleType;
  iat?: number;
  exp?: number;
}

export interface IUserValidated {
  id: string;
  email: string;
  role: RoleType;
}

export interface ITokenPayloadSource {
  id: string;
  email: string;
  role: RoleType;
}
