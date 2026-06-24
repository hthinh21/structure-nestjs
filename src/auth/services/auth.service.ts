import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { plainToInstance } from 'class-transformer';

import { RedisService } from '../../common/redis/redis.service';
import { UserService } from '../../user/services/user.service';
import { AUTH_CONSTANTS } from '../constants/auth.constants';
import { TokenResponseDto } from '../dtos/responses/token.response.dto';

import type { IAuthConfig } from '../../common/configs/auth.config';
import type { LoginRequestDto } from '../dtos/requests/login.request.dto';
import type { RegisterRequestDto } from '../dtos/requests/register.request.dto';
import type { IJwtPayload, ITokenPayloadSource, IUserValidated } from '../interfaces/jwt.interface';
import type { StringValue } from 'ms';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterRequestDto): Promise<TokenResponseDto> {
    this.logger.log(`Register attempt for email: ${dto.email}`);

    const user = await this.userService.create({
      email: dto.email,
      password: dto.password,
    });

    const tokens = await this.generateTokens(user);
    this.logger.log(`User registered successfully: ${user.id}`);
    return tokens;
  }

  async login(dto: LoginRequestDto): Promise<TokenResponseDto> {
    this.logger.log(`Login attempt for email: ${dto.email}`);

    const user = await this.userService.validateCredentials(dto.email, dto.password);
    const tokens = await this.generateTokens(user);

    this.logger.log(`Login successful for user: ${user.id}`);
    return tokens;
  }

  async refresh(user: IUserValidated & { refreshToken?: string }): Promise<TokenResponseDto> {
    this.logger.log(`Token refresh for user: ${user.id}`);

    if (!user.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const storedToken = await this.redisService.get(`auth:refresh:${user.id}`);
    if (!storedToken || storedToken !== user.refreshToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return this.generateTokens(user);
  }

  async logout(userId: string): Promise<void> {
    this.logger.log(`User logging out: ${userId}`);
    await this.redisService.del(`auth:refresh:${userId}`);
  }

  private async generateTokens(user: ITokenPayloadSource): Promise<TokenResponseDto> {
    const payload: IJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const authConfig = this.configService.getOrThrow<IAuthConfig>('auth');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: authConfig.jwtSecret,
        expiresIn: authConfig.jwtExpiresIn as StringValue,
      }),
      this.jwtService.signAsync(payload, {
        secret: authConfig.jwtRefreshSecret,
        expiresIn: authConfig.jwtRefreshExpiresIn as StringValue,
      }),
    ]);

    // Save refresh token to Redis with 7 days TTL (604800 seconds)
    await this.redisService.set(
      `auth:refresh:${user.id}`,
      refreshToken,
      AUTH_CONSTANTS.REDIS_REFRESH_TOKEN_TTL,
    );

    return plainToInstance(TokenResponseDto, {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    });
  }
}
