import express from 'express';
import {
  registerUser,
  loginUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  telegramLogin,
  sendEmailVerificationOTP,
  verifyEmail,
} from '@/controllers/auth-controller';
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  telegramLoginValidation,
  verifyEmailValidation,
} from '@/validation/user.validation';
import { validate } from '../validation';

// Setup router
const router = express.Router();

// Authentication Routes

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user with email and password
 * @access  Public
 * @body    { username?, email, password, country? }
 */
router.post('/register', [...registerValidation, validate], registerUser);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user with email and password
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', [...loginValidation, validate], loginUser);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 * @body    { refreshToken }
 */
router.post('/refresh-token', [...refreshTokenValidation, validate], refreshToken);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send OTP to email for password reset
 * @access  Public
 * @body    { email }
 */
router.post('/forgot-password', [...forgotPasswordValidation, validate], forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using OTP
 * @access  Public
 * @body    { email, otp, newPassword }
 */
router.post('/reset-password', [...resetPasswordValidation, validate], resetPassword);

/**
 * @route   POST /api/v1/auth/telegram-login
 * @desc    Login/Register user with Telegram
 * @access  Public
 * @body    { telegramId, username?, email?, country? }
 */
router.post('/telegram-login', [...telegramLoginValidation, validate], telegramLogin);

/**
 * @route   POST /api/v1/auth/send-verification-otp
 * @desc    Send email verification OTP
 * @access  Public
 * @body    { email }
 */
router.post('/send-verification-otp', [...forgotPasswordValidation, validate], sendEmailVerificationOTP);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify email using OTP
 * @access  Public
 * @body    { email, otp }
 */
router.post('/verify-email', [...verifyEmailValidation, validate], verifyEmail);

export default router;
