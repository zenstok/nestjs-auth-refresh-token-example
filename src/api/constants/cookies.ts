import { Request } from 'express';

export const cookieConfig = {
  refreshToken: {
    name: 'refreshToken',
    options: {
      path: '/', // should set /auth/api/refresh-tokens path in production, we use / so it works on localhost on Chrome
      httpOnly: true,
      sameSite: 'strict' as 'strict',
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days, must match jwt expiration
    },
  },
};

export const extractRefreshTokenFromCookies = (req: Request) => {
  const cookies = req.headers.cookie?.split('; ');
  if (!cookies?.length) {
    return null;
  }

  const refreshTokenCookie = cookies.find((cookie) =>
    cookie.startsWith(`${cookieConfig.refreshToken.name}=`),
  );

  if (!refreshTokenCookie) {
    return null;
  }
  const refreshToken = refreshTokenCookie.split('=')[1] as string;

  return refreshToken;
};
