import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Request,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { UserLoginDto } from '../user/dto/user-login.dto';
import { Public } from './decorators/public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from './decorators/user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { Response, Request as ExpressRequest } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { AuthRefreshTokenService } from './auth-refresh-token.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private authenticationService: AuthenticationService,
    private authRefreshTokenService: AuthRefreshTokenService,
  ) {}

  @Throttle({
    short: { limit: 2, ttl: 1000 },
    long: { limit: 5, ttl: 60000 },
  })
  @ApiBody({ type: UserLoginDto })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: any) {
    return this.authenticationService.login(req.user);
  }

  @ApiBearerAuth()
  @Get('me')
  @UseInterceptors(ClassSerializerInterceptor)
  async me(
    @User() authUser: UserEntity,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.header('Cache-Control', 'no-store');
    return authUser;
  }

  @Throttle({
    short: { limit: 1, ttl: 1000 },
    long: { limit: 2, ttl: 60000 },
  })
  @ApiBearerAuth()
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh-tokens')
  refreshTokens(@Request() req: ExpressRequest) {
    if (!req.user) {
      throw new InternalServerErrorException();
    }
    return this.authRefreshTokenService.generateTokenPair(
      (req.user as any).attributes,
      req.headers.authorization?.split(' ')[1],
      (req.user as any).refreshTokenExpiresAt,
    );
  }
}
