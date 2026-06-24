import type { RoleType } from '../../common/constants/role.constants';
import type { UserStatus } from '../enums/user-status.enum';

export interface ICreateUser {
  email: string;
  password: string;
  role?: RoleType;
}

export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  role: RoleType;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
