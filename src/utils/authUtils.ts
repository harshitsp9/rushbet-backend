import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '@/config/envConfig';

const { JWT_SECRET } = config;

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hashed password
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate 6-digit OTP
 */
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate JWT token
 */
export const generateJWTToken = (userId: string, email: string): string => {
  const payload = {
    userId,
    email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
};

/**
 * Verify JWT token
 */
export const verifyJWTToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate random username if not provided
 */
export const generateUsername = (email: string): string => {
  const emailPrefix = email.split('@')[0];
  const randomSuffix = crypto.randomInt(1000, 9999);
  return `${emailPrefix}_${randomSuffix}`;
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }

  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  // Check for at least one letter
  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one letter' };
  }

  return { isValid: true };
};

/**
 * Validate email format
 */
export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate country code (ISO 3166-1 alpha-3)
 */
export const validateCountryCode = (countryCode: string): boolean => {
  return countryCode.length === 3 && /^[A-Z]{3}$/.test(countryCode);
};
