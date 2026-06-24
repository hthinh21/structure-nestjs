import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import * as bcrypt from 'bcrypt';

import { UserService } from './user.service';
import { ROLES } from '../../common/constants/role.constants';
import { USER_CONSTANTS } from '../constants/user.constants';
import { UserStatus } from '../enums/user-status.enum';
import { UserRepository } from '../repositories/user.repository';

import type { UserEntity } from '../entities/user.entity';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  const mockUser: UserEntity = {
    id: 'user-id-123',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    role: ROLES.USER,
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as unknown as UserEntity;

  beforeEach(async () => {
    const mockUserRepository = {
      existsByEmail: jest.fn(),
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should create a user successfully', async () => {
      repository.existsByEmail.mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      repository.create.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(repository.existsByEmail).toHaveBeenCalledWith(createDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(
        createDto.password,
        USER_CONSTANTS.PASSWORD_SALT_ROUNDS,
      );
      expect(repository.create).toHaveBeenCalledWith({
        email: createDto.email,
        passwordHash: 'hashed-password',
        role: ROLES.USER,
        status: UserStatus.ACTIVE,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email exists', async () => {
      repository.existsByEmail.mockResolvedValue(true);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(repository.existsByEmail).toHaveBeenCalledWith(createDto.email);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('validateCredentials', () => {
    it('should return user if credentials are valid', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateCredentials('test@example.com', 'password123');

      expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.passwordHash);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      repository.findByEmail.mockResolvedValue(null);

      await expect(service.validateCredentials('notfound@example.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, status: UserStatus.INACTIVE } as UserEntity;
      repository.findByEmail.mockResolvedValue(inactiveUser);

      await expect(service.validateCredentials('test@example.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateCredentials('test@example.com', 'wrongpass')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.findById('user-id-123');

      expect(repository.findById).toHaveBeenCalledWith('user-id-123');
      expect(result).toEqual(mockUser);
    });
  });
});
