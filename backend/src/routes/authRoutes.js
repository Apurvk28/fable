import express from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { verifyCsrf } from '../middleware/csrfMiddleware.js';
import { generateCsrfToken, setCsrfCookie } from '../utils/csrf.js';

const router = express.Router();

// Endpoint to obtain/refresh an HMAC-signed CSRF token
router.get('/csrf-token', (req, res) => {
  const token = generateCsrfToken();
  setCsrfCookie(res, token);
  res.status(200).json({ status: 'success', csrfToken: token });
});

// State-changing routes: protected by brute-force limiter and strict HMAC-signed CSRF validation
router.post('/register', authLimiter, verifyCsrf, register);
router.post('/login', authLimiter, verifyCsrf, login);
router.post('/logout', verifyCsrf, logout);

// Protected route verifying HttpOnly session cookie
router.get('/me', protect, getMe);

export default router;
