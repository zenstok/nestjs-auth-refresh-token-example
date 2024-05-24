import { Injectable } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { AuthRefreshTokenService } from './auth-refresh-token.service';

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

  login(user: User) {
    return this.authRefreshTokenService.generateTokenPair(user);
  }
}
