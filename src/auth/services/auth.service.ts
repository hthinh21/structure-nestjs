import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { plainToInstance } from 'class-transformer';

import type { LoginRequestDto } from '../dtos/requests/login.request.dto';
import { TokenResponseDto } from '../dtos/responses/token.response.dto';
import type { IJwtPayload, IUserValidated } from '../interfaces/jwt.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginRequestDto): Promise<TokenResponseDto> {
    this.logger.log(`Login attempt for email: ${dto.email}`);

    // TODO: Replace with real user lookup from UserModule/UserService
    // For now this is a placeholder — inject UserService when available
    const mockUser: IUserValidated = {
      id: 'mock-user-id',
      email: dto.email,
      role: 'USER',
    };

    if (dto.password !== 'password123') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(mockUser);
    this.logger.log(`Login successful for user: ${mockUser.id}`);
    return tokens;
  }

  async refresh(user: IUserValidated): Promise<TokenResponseDto> {
    this.logger.log(`Token refresh for user: ${user.id}`);
    return this.generateTokens(user);
  }

  private async generateTokens(user: IUserValidated): Promise<TokenResponseDto> {
    const payload: Omit<IJwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return plainToInstance(TokenResponseDto, {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    });
  }
}
