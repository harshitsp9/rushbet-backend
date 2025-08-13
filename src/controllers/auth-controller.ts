import { Request, Response } from 'express';
import { Types } from 'mongoose';
import UserModel from '@/models/users/users.model';
import OTPModel from '@/models/users/otp.model';
import emailService from '@/services/emailServices';
import { hashPassword, comparePassword, generateOTP, generateUsername } from '@/utils/authUtils';
import { generateAuthTokens, commonVerifyJwtToken } from '@/utils/securityUtils';
import { AUTH_PROVIDER, OTP_TYPE, OTP_STATUS, USER_STATUS_TYPE } from '@/types/enums/enums.common';
import { asyncHandler } from '@/middleware/async-middleware';
import { successResponse, errorResponse, HTTP_STATUS_CODES } from '@/utils/responseUtils';
import { createInitialBalanceRecord } from '@/helper/balanceHelper';

/**
 * Register user with email and password
 */
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, country } = req.body;

  // Check if user already exists
  const existingUser = await UserModel.findOne({
    $or: [{ email }, { username: username || generateUsername(email) }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return errorResponse(res, 'User with this email already exists', HTTP_STATUS_CODES.BAD_REQUEST);
    }
    if (existingUser.username === username) {
      return errorResponse(res, 'Username is already taken', HTTP_STATUS_CODES.BAD_REQUEST);
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new user
  const newUser = new UserModel({
    username: username || generateUsername(email),
    email,
    password: hashedPassword,
    ...(country && { country: country.toUpperCase() }),
    authProvider: AUTH_PROVIDER.EMAIL,
    status: USER_STATUS_TYPE.ACTIVE,
    isEmailVerified: false,
  });

  await newUser.save();

  // Create initial balance record in background (without await)
  createInitialBalanceRecord(newUser._id as Types.ObjectId);

  // Generate access and refresh tokens
  const tokens = generateAuthTokens({
    userId: newUser._id as Types.ObjectId,
    sessionId: new Types.ObjectId(), // Generate a new session ID
  });

  // Send welcome email in background (won't crash server if fails)
  emailService.sendWelcomeEmail(newUser.email, newUser.username);

  // Return success response
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
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };

  return successResponse(res, 'User registered successfully', HTTP_STATUS_CODES.CREATED, responseData);
});

/**
 * Login user with email and password
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await UserModel.findOne({ email });
  if (!user) {
    return errorResponse(res, 'Invalid email or password', HTTP_STATUS_CODES.BAD_REQUEST);
  }

  // Check if user is active
  if (user.status !== USER_STATUS_TYPE.ACTIVE) {
    return errorResponse(res, 'Account is inactive. Please contact support', HTTP_STATUS_CODES.FORBIDDEN);
  }

  // Check if user registered with email (has password)
  if (user.authProvider !== AUTH_PROVIDER.EMAIL || !user.password) {
    return errorResponse(
      res,
      'Invalid login method. Please use the correct authentication method',
      HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return errorResponse(res, 'Invalid email or password', HTTP_STATUS_CODES.BAD_REQUEST);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate access and refresh tokens
  const tokens = generateAuthTokens({
    userId: user._id as Types.ObjectId,
    sessionId: new Types.ObjectId(), // Generate a new session ID
  });

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
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };

  return successResponse(res, 'Login successful', HTTP_STATUS_CODES.OK, responseData);
});

/**
 * Refresh access token using refresh token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: providedRefreshToken } = req.body;

  if (!providedRefreshToken) {
    return errorResponse(res, 'Refresh token is required', HTTP_STATUS_CODES.BAD_REQUEST);
  }

  try {
    // Verify the refresh token
    const decoded = commonVerifyJwtToken(providedRefreshToken);
    if (!decoded || !decoded.userId) {
      return errorResponse(res, 'Invalid refresh token', HTTP_STATUS_CODES.BAD_REQUEST);
    }

    // Find user by ID
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return errorResponse(res, 'User not found', HTTP_STATUS_CODES.NOT_FOUND);
    }

    // Check if user is active
    if (user.status !== USER_STATUS_TYPE.ACTIVE) {
      return errorResponse(res, 'Account is inactive. Please contact support', HTTP_STATUS_CODES.FORBIDDEN);
    }

    // Generate new access and refresh tokens
    const tokens = generateAuthTokens({
      userId: user._id as Types.ObjectId,
      sessionId: new Types.ObjectId(), // Generate a new session ID
    });

    const responseData = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };

    return successResponse(res, 'Tokens refreshed successfully', HTTP_STATUS_CODES.OK, responseData);
  } catch (error) {
    return errorResponse(res, 'Invalid or expired refresh token', HTTP_STATUS_CODES.BAD_REQUEST);
  }
});

/**
 * Forgot password - Send OTP to email
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  // Find user by email
  const user = await UserModel.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not for security
    return successResponse(
      res,
      'If an account with this email exists, you will receive an OTP shortly',
      HTTP_STATUS_CODES.OK,
      {}
    );
  }

  // Check if user registered with email
  if (user.authProvider !== AUTH_PROVIDER.EMAIL) {
    return successResponse(
      res,
      'If an account with this email exists, you will receive an OTP shortly',
      HTTP_STATUS_CODES.OK,
      {}
    );
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

  // Send OTP email in background (won't crash server if fails)
  emailService.sendPasswordResetOTP(user.email, otp, user.username);

  const responseData = {
    expiresIn: '5 minutes',
  };
  return successResponse(res, 'Password reset OTP sent to your email', HTTP_STATUS_CODES.OK, responseData);
});

/**
 * Reset password using OTP
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  // Find user by email
  const user = await UserModel.findOne({ email });
  if (!user) {
    return errorResponse(res, 'User not found', HTTP_STATUS_CODES.NOT_FOUND);
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
    return errorResponse(res, 'Invalid or expired OTP', HTTP_STATUS_CODES.BAD_REQUEST);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password
  user.password = hashedPassword;
  await user.save();

  // Mark OTP as used
  otpRecord.status = OTP_STATUS.USED;
  await otpRecord.save();

  return successResponse(res, 'Password reset successfully', HTTP_STATUS_CODES.OK, {});
});

/**
 * Telegram login/register
 */
export const telegramLogin = asyncHandler(async (req: Request, res: Response) => {
  const { telegramId, username, email, country } = req.body;

  // Check if user exists with this telegram ID
  const user = await UserModel.findOne({ telegramId });

  if (user) {
    // User exists, log them in
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate access and refresh tokens
    const tokens = generateAuthTokens({
      userId: user._id as Types.ObjectId,
      sessionId: new Types.ObjectId(), // Generate a new session ID
    });

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
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };

    return successResponse(res, 'Telegram login successful', HTTP_STATUS_CODES.OK, responseData);
  } else {
    // User doesn't exist, create new account
    const finalUsername = username || `telegram_${telegramId}`;

    // Check if username or email is already taken
    const existingUser = await UserModel.findOne({
      $or: [{ username: finalUsername }, ...(email ? [{ email }] : [])],
    });

    if (existingUser) {
      if (existingUser.username === finalUsername) {
        return errorResponse(res, 'Username is already taken', HTTP_STATUS_CODES.BAD_REQUEST);
      }
      if (email && existingUser.email === email) {
        return errorResponse(res, 'Email is already registered', HTTP_STATUS_CODES.BAD_REQUEST);
      }
    }

    // Create new user
    const newUser = new UserModel({
      username: finalUsername,
      email: email || null,
      telegramId,
      ...(country && { country: country.toUpperCase() }),
      authProvider: AUTH_PROVIDER.TELEGRAM,
      status: USER_STATUS_TYPE.ACTIVE,
      isEmailVerified: email ? false : true, // No email verification needed if no email provided
    });

    await newUser.save();

    // Create initial balance record in background (without await)
    createInitialBalanceRecord(newUser._id as Types.ObjectId);

    // Generate access and refresh tokens
    const tokens = generateAuthTokens({
      userId: newUser._id as Types.ObjectId,
      sessionId: new Types.ObjectId(), // Generate a new session ID
    });

    // Send welcome email in background if email provided (won't crash server if fails)
    if (email) {
      emailService.sendWelcomeEmail(newUser.email!, newUser.username);
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
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };

    return successResponse(res, 'Telegram account created successfully', HTTP_STATUS_CODES.CREATED, responseData);
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
    return errorResponse(res, 'User not found', HTTP_STATUS_CODES.NOT_FOUND);
  }

  if (user.isEmailVerified) {
    return errorResponse(res, 'Email is already verified', HTTP_STATUS_CODES.BAD_REQUEST);
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

  // Send OTP email in background (won't crash server if fails)
  emailService.sendEmailVerificationOTP(user.email, otp, user.username);

  const responseData = {
    expiresIn: '5 minutes',
  };
  return successResponse(res, 'Email verification OTP sent', HTTP_STATUS_CODES.OK, responseData);
});

/**
 * Verify email using OTP
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  // Find user by email
  const user = await UserModel.findOne({ email });
  if (!user) {
    return errorResponse(res, 'User not found', HTTP_STATUS_CODES.NOT_FOUND);
  }

  if (user.isEmailVerified) {
    return errorResponse(res, 'Email is already verified', HTTP_STATUS_CODES.BAD_REQUEST);
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
    return errorResponse(res, 'Invalid or expired OTP', HTTP_STATUS_CODES.BAD_REQUEST);
  }

  // Update user email verification status
  user.isEmailVerified = true;
  await user.save();

  // Mark OTP as used
  otpRecord.status = OTP_STATUS.USED;
  await otpRecord.save();

  return successResponse(res, 'Email verified successfully', HTTP_STATUS_CODES.OK, {});
});
