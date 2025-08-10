import { body } from 'express-validator';
import { validateEmailFormat, validatePasswordStrength, validateCountryCode } from '@/utils/authUtils';

// Register validation
export const registerValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters')
    .normalizeEmail()
    .custom(validateEmailFormat),

  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .custom(validatePasswordStrength),

  body('country')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Country code must be exactly 3 characters')
    .matches(/^[A-Z]{3}$/)
    .withMessage('Country code must be in ISO 3166-1 alpha-3 format (e.g., USA, GBR)')
    .custom(validateCountryCode),
];

// Login validation
export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),
];

// Refresh token validation
export const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string'),
];

// Forgot password validation
export const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
];

// Reset password validation
export const resetPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),

  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),

  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('New password must be between 6 and 128 characters')
    .custom(validatePasswordStrength),
];

// Telegram login validation
export const telegramLoginValidation = [
  body('telegramId')
    .notEmpty()
    .withMessage('Telegram ID is required')
    .isString()
    .withMessage('Telegram ID must be a string'),

  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('email').optional().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),

  body('country')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Country code must be exactly 3 characters')
    .matches(/^[A-Z]{3}$/)
    .withMessage('Country code must be in ISO 3166-1 alpha-3 format (e.g., USA, GBR)')
    .custom(validateCountryCode),
];

// Email verification validation
export const verifyEmailValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),

  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
];
