import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { AuthRefreshToken } from './entities/auth-refresh-token.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../config/env/configuration';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class AuthRefreshTokenService {
  constructor(
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private configService: ConfigService<EnvironmentVariables>,
    @InjectRepository(AuthRefreshToken)
    private authRefreshTokenRepository: Repository<AuthRefreshToken>,
  ) {}

  async generateRefreshToken(
    authUser: Express.User,
    currentRefreshToken?: string,
    currentRefreshTokenExpiresAt?: Date,
  ) {
    const newRefreshToken = this.jwtService.sign(
      { sub: authUser.id, role: authUser.role },
      {
        secret: this.configService.get('jwtRefreshSecret'),
        expiresIn: '30d',
      },
    );

    if (currentRefreshToken && currentRefreshTokenExpiresAt) {
      const hashedRefreshToken =
        this.cryptoService.generateSha256HashBase64(currentRefreshToken);
      if (
        await this.isRefreshTokenBlackListed(hashedRefreshToken, authUser.id)
      ) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      await this.authRefreshTokenRepository.insert({
        hashedRefreshToken,
        expiresAt: currentRefreshTokenExpiresAt,
        userId: authUser.id,
      });
    }

    return newRefreshToken;
  }

  private isRefreshTokenBlackListed(
    hashedRefreshToken: string,
    userId: number,
  ) {
    return this.authRefreshTokenRepository.existsBy({
      hashedRefreshToken,
      userId,
    });
  }

  async generateTokenPair(
    user: Express.User,
    currentRefreshToken?: string,
    currentRefreshTokenExpiresAt?: Date,
  ) {
    const payload = { sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload), // jwt module is configured in auth.module.ts for access token
      refresh_token: await this.generateRefreshToken(
        user,
        currentRefreshToken,
        currentRefreshTokenExpiresAt,
      ),
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async clearExpiredRefreshTokens() {
    await this.authRefreshTokenRepository.delete({
      expiresAt: LessThanOrEqual(new Date()),
    });
  }
}
