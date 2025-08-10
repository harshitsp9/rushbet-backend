import { body } from 'express-validator';

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
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must be less than 100 characters'),

  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),

  body('country')
    .isLength({ min: 3, max: 3 })
    .withMessage('Country code must be exactly 3 characters')
    .matches(/^[A-Z]{3}$/)
    .withMessage('Country code must be in ISO 3166-1 alpha-3 format (e.g., USA, GBR, IND)'),

  body('gameId').isMongoId().withMessage('Invalid game ID format'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
];

export const resetPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),

  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),

  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
];

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
    .isLength({ min: 3, max: 3 })
    .withMessage('Country code must be exactly 3 characters')
    .matches(/^[A-Z]{3}$/)
    .withMessage('Country code must be in ISO 3166-1 alpha-3 format (e.g., USA, GBR, IND)'),

  body('gameId').isMongoId().withMessage('Invalid game ID format'),
];

export const verifyEmailValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),

  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
];
