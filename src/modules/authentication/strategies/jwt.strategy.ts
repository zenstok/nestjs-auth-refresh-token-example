import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { User } from '../../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../../config/env/configuration';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly userService: UserService;

  constructor(
    userService: UserService,
    configService: ConfigService<EnvironmentVariables>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwtSecret'),
    });
    this.userService = userService;
  }

  async validate(payload: any): Promise<User | null> {
    const authUser = await this.userService.findOne(payload.sub);
    if (!authUser) {
      throw new UnauthorizedException();
    }

    return authUser;
  }
}
