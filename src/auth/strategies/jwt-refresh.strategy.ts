import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AUTH_CONSTANTS } from '../constants/auth.constants';

import type { IAuthConfig } from '../../common/configs/auth.config';
import type { IJwtPayload, IUserValidated } from '../interfaces/jwt.interface';

export interface IRefreshTokenPayload extends IUserValidated {
  refreshToken: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  AUTH_CONSTANTS.JWT_REFRESH_STRATEGY,
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<IAuthConfig>('auth').jwtRefreshSecret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: IJwtPayload): IRefreshTokenPayload {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const refreshToken = authHeader.replace('Bearer ', '').trim();
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      refreshToken,
    };
  }
}
