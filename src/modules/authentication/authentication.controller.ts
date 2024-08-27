import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
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
import { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import { UserService } from '../user/user.service';
import {
  cookieConfig,
  extractRefreshTokenFromCookies,
} from '../../api/constants/cookies';

@ApiTags('Auth')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private userService: UserService,
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
  login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authenticationService.login(res, req.user);
  }

  @ApiBearerAuth()
  @Get('me')
  @UseInterceptors(ClassSerializerInterceptor)
  async me(
    @User() authUser: Express.User,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.header('Cache-Control', 'no-store');
    return this.userService.findOne(authUser.id);
  }

  @Throttle({
    short: { limit: 1, ttl: 1000 },
    long: { limit: 2, ttl: 60000 },
  })
  @ApiBearerAuth()
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh-tokens')
  refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.user) {
      throw new InternalServerErrorException();
    }

    return this.authRefreshTokenService.generateTokenPair(
      (req.user as any).attributes,
      res,
      extractRefreshTokenFromCookies(req) as string,
      (req.user as any).refreshTokenExpiresAt,
    );
  }

  @Public()
  @Post('clear-auth-cookie')
  clearAuthCookie(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(cookieConfig.refreshToken.name);
  }
}
