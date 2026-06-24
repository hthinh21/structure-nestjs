import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../common/bases/base.entity';
import { ROLES, type RoleType } from '../../common/constants/role.constants';
import { UserStatus } from '../enums/user-status.enum';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ name: 'email', unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({
    name: 'role',
    type: 'varchar',
    default: ROLES.USER,
  })
  role!: RoleType;

  @Column({
    name: 'status',
    type: 'varchar',
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;
}
