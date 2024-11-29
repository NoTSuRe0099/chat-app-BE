import { CookieOptions } from 'express';

export const cookieOptions: CookieOptions = {
  expires: new Date(Date.now() + 48 * 60 * 60 * 1000),
  secure: process.env.NODE_ENV === 'production' ? true : false,
  httpOnly: process.env.NODE_ENV === 'production' ? true : false,
  sameSite: 'none',
};
