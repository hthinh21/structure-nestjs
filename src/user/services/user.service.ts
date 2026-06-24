import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { ROLES } from '../../common/constants/role.constants';
import { USER_CONSTANTS } from '../constants/user.constants';
import { UserEntity } from '../entities/user.entity';
import { UserStatus } from '../enums/user-status.enum';
import { UserRepository } from '../repositories/user.repository';

import type { ICreateUser } from '../interfaces/user.interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async create(data: ICreateUser): Promise<UserEntity> {
    this.logger.log(`Creating user with email: ${data.email}`);

    const exists = await this.userRepository.existsByEmail(data.email);
    if (exists) {
      throw new ConflictException(`Email ${data.email} is already registered`);
    }

    const passwordHash = await bcrypt.hash(data.password, USER_CONSTANTS.PASSWORD_SALT_ROUNDS);

    const user = await this.userRepository.create({
      email: data.email,
      passwordHash,
      role: data.role ?? ROLES.USER,
      status: UserStatus.ACTIVE,
    });

    this.logger.log(`User created successfully: ${user.id}`);
    return user;
  }

  async validateCredentials(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }
}
