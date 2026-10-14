import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const COOKIE_NAME = 'fable_token';
const TOKEN_EXPIRY = '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: TOKEN_EXPIRY,
  });
};

export const getCookieOptions = () => {
  return {
    httpOnly: true, // Prevents JavaScript document.cookie access (mitigates XSS)
    secure: config.isProduction, // HTTPS only in production
    sameSite: config.isCrossSite && config.isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  };
};

export const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
};

export const clearAuthCookie = (res) => {
  res.cookie(COOKIE_NAME, '', {
    ...getCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });
};

export { COOKIE_NAME };
