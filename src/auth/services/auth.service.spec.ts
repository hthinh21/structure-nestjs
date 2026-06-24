import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { ROLES } from '../../common/constants/role.constants';
import { RedisService } from '../../common/redis/redis.service';
import { UserStatus } from '../../user/enums/user-status.enum';
import { UserService } from '../../user/services/user.service';
import { TokenResponseDto } from '../dtos/responses/token.response.dto';

import type { UserEntity } from '../../user/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let userService: jest.Mocked<UserService>;
  let redisService: jest.Mocked<RedisService>;

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

  const mockAuthConfig = {
    jwtSecret: 'jwt-secret',
    jwtExpiresIn: '15m',
    jwtRefreshSecret: 'refresh-secret',
    jwtRefreshExpiresIn: '7d',
  };

  beforeEach(async () => {
    const mockJwtService = {
      signAsync: jest.fn(),
    };
    const mockUserService = {
      create: jest.fn(),
      validateCredentials: jest.fn(),
    };
    const mockRedisService = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };
    const mockConfigService = {
      getOrThrow: jest.fn().mockReturnValue(mockAuthConfig),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserService, useValue: mockUserService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    userService = module.get(UserService);
    redisService = module.get(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      userService.create.mockResolvedValue(mockUser);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.register({ email: 'test@example.com', password: 'password123' });

      expect(userService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(redisService.set).toHaveBeenCalledWith(
        'auth:refresh:user-id-123',
        'refresh-token',
        604800,
      );
      expect(result).toBeInstanceOf(TokenResponseDto);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });
  });

  describe('login', () => {
    it('should login user and return tokens', async () => {
      userService.validateCredentials.mockResolvedValue(mockUser);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login({ email: 'test@example.com', password: 'password123' });

      expect(userService.validateCredentials).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });
  });

  describe('refresh', () => {
    const refreshUser = {
      id: 'user-id-123',
      email: 'test@example.com',
      role: ROLES.USER,
      refreshToken: 'current-refresh-token',
    };

    it('should refresh tokens successfully', async () => {
      redisService.get.mockResolvedValue('current-refresh-token');
      jwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await service.refresh(refreshUser);

      expect(redisService.get).toHaveBeenCalledWith('auth:refresh:user-id-123');
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
    });

    it('should throw UnauthorizedException if refreshToken is missing', async () => {
      const { refreshToken: _, ...userWithoutToken } = refreshUser;
      await expect(service.refresh(userWithoutToken)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if stored token does not match', async () => {
      redisService.get.mockResolvedValue('different-refresh-token');

      await expect(service.refresh(refreshUser)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should delete token from redis', async () => {
      await service.logout('user-id-123');
      expect(redisService.del).toHaveBeenCalledWith('auth:refresh:user-id-123');
    });
  });
});
