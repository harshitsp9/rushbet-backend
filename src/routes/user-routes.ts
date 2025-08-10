import express from 'express';
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  telegramLogin,
  sendEmailVerificationOTP,
  verifyEmail,
} from '@/controllers/user-controller';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  telegramLoginValidation,
  verifyEmailValidation,
} from '@/validation/user.validation';

// Setup router
const router = express.Router();

// Authentication Routes

/**
 * @route   POST /api/users/register
 * @desc    Register a new user with email and password
 * @access  Public
 * @body    { username?, email, password, country, gameId }
 */
router.post('/register', registerValidation, registerUser);

/**
 * @route   POST /api/users/login
 * @desc    Login user with email and password
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', loginValidation, loginUser);

/**
 * @route   POST /api/users/forgot-password
 * @desc    Send OTP to email for password reset
 * @access  Public
 * @body    { email }
 */
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);

/**
 * @route   POST /api/users/reset-password
 * @desc    Reset password using OTP
 * @access  Public
 * @body    { email, otp, newPassword }
 */
router.post('/reset-password', resetPasswordValidation, resetPassword);

/**
 * @route   POST /api/users/telegram-login
 * @desc    Login/Register user with Telegram
 * @access  Public
 * @body    { telegramId, username?, email?, country, gameId }
 */
router.post('/telegram-login', telegramLoginValidation, telegramLogin);

/**
 * @route   POST /api/users/send-verification-otp
 * @desc    Send email verification OTP
 * @access  Public
 * @body    { email }
 */
router.post('/send-verification-otp', forgotPasswordValidation, sendEmailVerificationOTP);

/**
 * @route   POST /api/users/verify-email
 * @desc    Verify email using OTP
 * @access  Public
 * @body    { email, otp }
 */
router.post('/verify-email', verifyEmailValidation, verifyEmail);

export default router;
