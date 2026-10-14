import crypto from 'crypto';
import { config } from '../config/env.js';

export const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
export const CSRF_HEADER_NAME = 'x-xsrf-token';
export const DEFAULT_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Generate a cryptographically signed CSRF token
 * Structure: <salt>.<timestamp>.<hmacSignature>
 */
export const generateCsrfToken = (customTimestamp) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const timestamp = customTimestamp || Date.now();
  const signature = crypto
    .createHmac('sha256', config.csrfSecret)
    .update(`${salt}.${timestamp}`)
    .digest('hex');

  return `${salt}.${timestamp}.${signature}`;
};

/**
 * Verify CSRF token HMAC signature and freshness
 */
export const verifyCsrfToken = (token, maxAgeMs = DEFAULT_MAX_AGE_MS) => {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'INVALID_FORMAT' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, reason: 'MALFORMED_TOKEN' };
  }

  const [salt, timestampStr, providedSignature] = parts;
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) {
    return { valid: false, reason: 'INVALID_TIMESTAMP' };
  }

  // 1. Freshness / Expiration check
  const now = Date.now();
  if (now < timestamp || now - timestamp > maxAgeMs) {
    return { valid: false, reason: 'EXPIRED' };
  }

  // 2. Cryptographic HMAC signature calculation and timing-safe comparison
  const expectedSignature = crypto
    .createHmac('sha256', config.csrfSecret)
    .update(`${salt}.${timestamp}`)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const providedBuffer = Buffer.from(providedSignature, 'hex');

  if (expectedBuffer.length !== providedBuffer.length) {
    return { valid: false, reason: 'TAMPERED' };
  }

  const isSignatureValid = crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  if (!isSignatureValid) {
    return { valid: false, reason: 'TAMPERED' };
  }

  return { valid: true };
};

/**
 * Set XSRF-TOKEN cookie (accessible to client-side script for Double Submit)
 */
export const setCsrfCookie = (res, token) => {
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by client script to send in request header
    secure: config.isProduction,
    sameSite: config.isCrossSite && config.isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: DEFAULT_MAX_AGE_MS,
  });
};

/**
 * Clear CSRF cookie
 */
export const clearCsrfCookie = (res) => {
  res.cookie(CSRF_COOKIE_NAME, '', {
    httpOnly: false,
    secure: config.isProduction,
    sameSite: config.isCrossSite && config.isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
};
