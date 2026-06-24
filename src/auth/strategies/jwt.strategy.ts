import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { AUTH_CONSTANTS } from '../constants/auth.constants';

import type { IAuthConfig } from '../../common/configs/auth.config';
import type { IJwtPayload, IUserValidated } from '../interfaces/jwt.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AUTH_CONSTANTS.JWT_STRATEGY) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<IAuthConfig>('auth').jwtSecret,
    });
  }

  validate(payload: IJwtPayload): IUserValidated {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
