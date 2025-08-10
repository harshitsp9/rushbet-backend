import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import UserModel from '@/models/users/users.model';
import OTPModel from '@/models/users/otp.model';
import emailService from '@/services/emailServices';
import { ApiError } from '@/utils/ApiError';
import { ApiSuccess } from '@/utils/ApiSucess';
import { hashPassword, comparePassword, generateOTP, generateJWTToken, generateUsername } from '@/utils/authUtils';
import { AUTH_PROVIDER, OTP_TYPE, OTP_STATUS, USER_STATUS_TYPE } from '@/types/enums/enums.common';
import { asyncHandler } from '@/middleware/async-middleware';

/**
 * Register user with email and password
 */
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(errors.array(), 400, 'Validation failed');
  }

  const { username, email, password, country, gameId } = req.body;

  // Check if user already exists
  const existingUser = await UserModel.findOne({
    $or: [{ email }, { username: username || generateUsername(email) }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new ApiError({}, 409, 'User with this email already exists');
    }
    if (existingUser.username === username) {
      throw new ApiError({}, 409, 'Username is already taken');
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new user
  const newUser = new UserModel({
    username: username || generateUsername(email),
    email,
    password: hashedPassword,
    country: country.toUpperCase(),
    authProvider: AUTH_PROVIDER.EMAIL,
    gameId,
    status: USER_STATUS_TYPE.ACTIVE,
    isEmailVerified: false,
  });

  await newUser.save();

  // Generate JWT token
  const token = generateJWTToken((newUser._id as any).toString(), newUser.email);

  // Send welcome email
  try {
    await emailService.sendWelcomeEmail(newUser.email, newUser.username);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw error, just log it
  }

  // Return success response (don't include password)
  const userResponse = {
    id: newUser._id,
    username: newUser.username,
    email: newUser.email,
    country: newUser.country,
    authProvider: newUser.authProvider,
    isEmailVerified: newUser.isEmailVerified,
    status: newUser.status,
    createdAt: newUser.createdAt,
  };

  const responseData = {
    user: userResponse,
    token,
  };

  res.status(201).json(new ApiSuccess(responseData, 'User registered successfully'));
});

/**
 * Login user with email and password
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(errors.array(), 400, 'Validation failed');
  }

  const { email, password } = req.body;

  // Find user by email
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new ApiError({}, 401, 'Invalid email or password');
  }

  // Check if user is active
  if (user.status !== USER_STATUS_TYPE.ACTIVE) {
    throw new ApiError({}, 403, 'Account is inactive. Please contact support');
  }

  // Check if user registered with email (has password)
  if (user.authProvider !== AUTH_PROVIDER.EMAIL || !user.password) {
    throw new ApiError({}, 401, 'Invalid login method. Please use the correct authentication method');
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError({}, 401, 'Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = generateJWTToken((user._id as any).toString(), user.email);

  // Return success response
  const userResponse = {
    id: user._id,
    username: user.username,
    email: user.email,
    country: user.country,
    authProvider: user.authProvider,
    isEmailVerified: user.isEmailVerified,
    status: user.status,
    lastLogin: user.lastLogin,
  };

  const responseData = {
    user: userResponse,
    token,
  };

  res.status(200).json(new ApiSuccess(responseData, 'Login successful'));
});

/**
 * Forgot password - Send OTP to email
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(errors.array(), 400, 'Validation failed');
  }

  const { email } = req.body;

  // Find user by email
  const user = await UserModel.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not for security
    res.status(200).json(new ApiSuccess({}, 'If an account with this email exists, you will receive an OTP shortly'));
    return;
  }

  // Check if user registered with email
  if (user.authProvider !== AUTH_PROVIDER.EMAIL) {
    res.status(200).json(new ApiSuccess({}, 'If an account with this email exists, you will receive an OTP shortly'));
    return;
  }

  // Generate OTP
  const otp = generateOTP();

  // Deactivate any existing password reset OTPs for this user
  await OTPModel.updateMany(
    {
      userId: user._id,
      type: OTP_TYPE.PASSWORD_RESET,
      status: OTP_STATUS.ACTIVE,
    },
    {
      status: OTP_STATUS.EXPIRED,
    }
  );

  // Create new OTP record
  const otpRecord = new OTPModel({
    userId: user._id,
    email: user.email,
    otp,
    type: OTP_TYPE.PASSWORD_RESET,
  });

  await otpRecord.save();

  // Send OTP email
  try {
    await emailService.sendPasswordResetOTP(user.email, otp, user.username);
    const responseData = {
      expiresIn: '5 minutes',
    };
    res.status(200).json(new ApiSuccess(responseData, 'Password reset OTP sent to your email'));
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new ApiError({}, 500, 'Failed to send password reset email. Please try again later');
  }
});

/**
 * Reset password using OTP
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(errors.array(), 400, 'Validation failed');
  }

  const { email, otp, newPassword } = req.body;

  // Find user by email
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new ApiError({}, 404, 'User not found');
  }

  // Find valid OTP
  const otpRecord = await OTPModel.findOne({
    userId: user._id,
    email,
    otp,
    type: OTP_TYPE.PASSWORD_RESET,
    status: OTP_STATUS.ACTIVE,
    expiresAt: { $gt: new Date() },
  });

  if (!otpRecord) {
    throw new ApiError({}, 400, 'Invalid or expired OTP');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password
  user.password = hashedPassword;
  await user.save();

  // Mark OTP as used
  otpRecord.status = OTP_STATUS.USED;
  await otpRecord.save();

  res.status(200).json(new ApiSuccess({}, 'Password reset successfully'));
});

/**
 * Telegram login/register
 */
export const telegramLogin = asyncHandler(async (req: Request, res: Response) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(errors.array(), 400, 'Validation failed');
  }

  const { telegramId, username, email, country, gameId } = req.body;

  // Check if user exists with this telegram ID
  const user = await UserModel.findOne({ telegramId });

  if (user) {
    // User exists, log them in
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateJWTToken((user._id as any).toString(), user.email || '');

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      country: user.country,
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,
      status: user.status,
      lastLogin: user.lastLogin,
    };

    const responseData = {
      user: userResponse,
      token,
    };

    res.status(200).json(new ApiSuccess(responseData, 'Telegram login successful'));
  } else {
    // User doesn't exist, create new account
    const finalUsername = username || `telegram_${telegramId}`;

    // Check if username or email is already taken
    const existingUser = await UserModel.findOne({
      $or: [{ username: finalUsername }, ...(email ? [{ email }] : [])],
    });

    if (existingUser) {
      if (existingUser.username === finalUsername) {
        throw new ApiError({}, 409, 'Username is already taken');
      }
      if (email && existingUser.email === email) {
        throw new ApiError({}, 409, 'Email is already registered');
      }
    }

    // Create new user
    const newUser = new UserModel({
      username: finalUsername,
      email: email || null,
      telegramId,
      country: country.toUpperCase(),
      authProvider: AUTH_PROVIDER.TELEGRAM,
      gameId,
      status: USER_STATUS_TYPE.ACTIVE,
      isEmailVerified: email ? false : true, // No email verification needed if no email provided
    });

    await newUser.save();

    // Generate JWT token
    const token = generateJWTToken((newUser._id as any).toString(), newUser.email || '');

    // Send welcome email if email provided
    if (email) {
      try {
        await emailService.sendWelcomeEmail(newUser.email!, newUser.username);
      } catch (error) {
        console.error('Failed to send welcome email:', error);
      }
    }

    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      country: newUser.country,
      authProvider: newUser.authProvider,
      isEmailVerified: newUser.isEmailVerified,
      status: newUser.status,
      createdAt: newUser.createdAt,
    };

    const responseData = {
      user: userResponse,
      token,
    };

    res.status(201).json(new ApiSuccess(responseData, 'Telegram account created successfully'));
  }
});

/**
 * Send email verification OTP
 */
export const sendEmailVerificationOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  // Find user by email
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new ApiError({}, 404, 'User not found');
  }

  if (user.isEmailVerified) {
    throw new ApiError({}, 400, 'Email is already verified');
  }

  // Generate OTP
  const otp = generateOTP();

  // Deactivate any existing email verification OTPs for this user
  await OTPModel.updateMany(
    {
      userId: user._id,
      type: OTP_TYPE.EMAIL_VERIFICATION,
      status: OTP_STATUS.ACTIVE,
    },
    {
      status: OTP_STATUS.EXPIRED,
    }
  );

  // Create new OTP record
  const otpRecord = new OTPModel({
    userId: user._id,
    email: user.email,
    otp,
    type: OTP_TYPE.EMAIL_VERIFICATION,
  });

  await otpRecord.save();

  // Send OTP email
  try {
    await emailService.sendEmailVerificationOTP(user.email, otp, user.username);
    const responseData = {
      expiresIn: '5 minutes',
    };
    res.status(200).json(new ApiSuccess(responseData, 'Email verification OTP sent'));
  } catch (error) {
    console.error('Failed to send email verification OTP:', error);
    throw new ApiError({}, 500, 'Failed to send email verification OTP. Please try again later');
  }
});

/**
 * Verify email using OTP
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(errors.array(), 400, 'Validation failed');
  }

  const { email, otp } = req.body;

  // Find user by email
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new ApiError({}, 404, 'User not found');
  }

  if (user.isEmailVerified) {
    throw new ApiError({}, 400, 'Email is already verified');
  }

  // Find valid OTP
  const otpRecord = await OTPModel.findOne({
    userId: user._id,
    email,
    otp,
    type: OTP_TYPE.EMAIL_VERIFICATION,
    status: OTP_STATUS.ACTIVE,
    expiresAt: { $gt: new Date() },
  });

  if (!otpRecord) {
    throw new ApiError({}, 400, 'Invalid or expired OTP');
  }

  // Update user email verification status
  user.isEmailVerified = true;
  await user.save();

  // Mark OTP as used
  otpRecord.status = OTP_STATUS.USED;
  await otpRecord.save();

  res.status(200).json(new ApiSuccess({}, 'Email verified successfully'));
});
