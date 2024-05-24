import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { CryptoModule } from '../crypto/crypto.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../config/env/configuration';
import { AuthenticationController } from './authentication.controller';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthRefreshToken } from './entities/auth-refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthRefreshToken]),
    UserModule,
    CryptoModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        secret: configService.get('jwtSecret'),
        signOptions: { expiresIn: '30m' },
      }),
    }),
  ],
  providers: [
    AuthenticationService,
    AuthRefreshTokenService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  controllers: [AuthenticationController],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
