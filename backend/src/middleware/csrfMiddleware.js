import { 
  CSRF_COOKIE_NAME, 
  CSRF_HEADER_NAME, 
  generateCsrfToken, 
  verifyCsrfToken, 
  setCsrfCookie 
} from '../utils/csrf.js';
import { config } from '../config/env.js';

const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

/**
 * Middleware: Injects or refreshes the XSRF-TOKEN cookie on safe requests
 */
export const injectCsrfCookie = (req, res, next) => {
  const existingToken = req.cookies[CSRF_COOKIE_NAME];
  if (!existingToken || !verifyCsrfToken(existingToken).valid) {
    const newToken = generateCsrfToken();
    setCsrfCookie(res, newToken);
  }
  next();
};

/**
 * Middleware: Strictly validates HMAC signature, freshness, match, and origin on state-changing requests
 */
export const verifyCsrf = (req, res, next) => {
  // Safe HTTP methods do not mutate state
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // 1. Strict Origin Validation
  const origin = req.headers.origin || req.headers.referer;
  if (origin) {
    try {
      const originUrl = new URL(origin).origin;
      if (!allowedOrigins.includes(originUrl)) {
        return res.status(403).json({
          error: {
            code: 'CORS_ORIGIN_DENIED',
            message: 'Request origin not allowed by policy.',
          },
        });
      }
    } catch {
      return res.status(403).json({
        error: {
          code: 'CORS_ORIGIN_DENIED',
          message: 'Malformed origin header.',
        },
      });
    }
  }

  // 2. Token Presence Checks
  const headerToken = req.headers[CSRF_HEADER_NAME] || req.headers['x-csrf-token'];
  const cookieToken = req.cookies[CSRF_COOKIE_NAME];

  if (!headerToken || !cookieToken) {
    return res.status(403).json({
      error: {
        code: 'CSRF_TOKEN_MISSING',
        message: 'CSRF token missing in request header or cookie.',
      },
    });
  }

  // 3. Header-to-Cookie Match Check
  if (headerToken !== cookieToken) {
    return res.status(403).json({
      error: {
        code: 'CSRF_TOKEN_MISMATCH',
        message: 'CSRF header token does not match cookie.',
      },
    });
  }

  // 4. Cryptographic HMAC Signature & Freshness Verification
  const verification = verifyCsrfToken(headerToken);
  if (!verification.valid) {
    if (verification.reason === 'EXPIRED') {
      return res.status(403).json({
        error: {
          code: 'CSRF_TOKEN_EXPIRED',
          message: 'CSRF token has expired. Please refresh the page.',
        },
      });
    }

    return res.status(403).json({
      error: {
        code: 'CSRF_TOKEN_INVALID',
        message: 'CSRF token verification failed: invalid cryptographic signature.',
      },
    });
  }

  next();
};
