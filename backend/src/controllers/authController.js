import { User } from '../models/User.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Input Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          field: 'name',
          message: 'Name must be at least 2 characters long.',
        },
      });
    }

    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          field: 'email',
          message: 'Please provide a valid email address.',
        },
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          field: 'password',
          message: 'Password must be at least 8 characters long.',
        },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists.',
        },
      });
    }

    // 3. Create user (password is automatically hashed by pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    // 4. Issue token in secure HttpOnly cookie
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    // 5. Respond with sanitized user data
    res.status(201).json({
      status: 'success',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required.',
        },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query user and explicitly include password field for verification
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // Generic error message prevents user enumeration attacks
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
    }

    // Issue new session token in HttpOnly cookie
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    res.status(200).json({
      status: 'success',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.',
  });
};

export const getMe = (req, res) => {
  // Identity is strictly established from verified req.user attached by protect middleware
  res.status(200).json({
    status: 'success',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
};
