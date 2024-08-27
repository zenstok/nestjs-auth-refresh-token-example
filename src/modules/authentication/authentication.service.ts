import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import { Response } from 'express';

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UserService,
    private cryptoService: CryptoService,
    private readonly authRefreshTokenService: AuthRefreshTokenService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      return null;
    }

    const isMatch = await this.cryptoService.compareHash(
      password,
      user.password,
    );

    if (isMatch) {
      return user;
    }
    return null;
  }

  login(res: Response, user?: Express.User) {
    if (!user?.id) {
      throw new InternalServerErrorException('User not set in request');
    }

    return this.authRefreshTokenService.generateTokenPair(user, res);
  }
}
