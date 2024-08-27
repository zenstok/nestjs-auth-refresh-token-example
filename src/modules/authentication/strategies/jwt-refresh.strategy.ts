import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../../config/env/configuration';
import { Request } from 'express';
import { extractRefreshTokenFromCookies } from '../../../api/constants/cookies';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService<EnvironmentVariables>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => extractRefreshTokenFromCookies(req),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwtRefreshSecret'),
    });
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException('Invalid refresh jwt payload.');
    }

    return {
      attributes: { id: payload.sub, role: payload.role },
      refreshTokenExpiresAt: new Date(payload.exp * 1000),
    };
  }
}
