import UserModel from '@/models/users/users.model';
import { UserDocument } from '@/models/users/users.type';
import { HTTP_STATUS_CODES, errorResponse } from '@/utils/responseUtils';
import { commonVerifyJwtToken } from '@/utils/securityUtils';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// @desc Authenticates user and protects routes
export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];

  // Check if token is present in the headers
  if (!token) {
    return errorResponse(res, 'Authorization token is required', HTTP_STATUS_CODES.UNAUTHORIZED, {});
  }

  let userId: string | null = null;
  try {
    const decodedToken = commonVerifyJwtToken(token);

    // Ensure the decoded token contains userId
    if (!decodedToken || !decodedToken.userId) {
      return errorResponse(res, 'Invalid token', HTTP_STATUS_CODES.UNAUTHORIZED, {});
    }

    userId = decodedToken.userId.toString();
  } catch (err: any) {
    // Handle token verification errors
    const isTokenExpired = err.name === 'TokenExpiredError';
    const message = isTokenExpired ? 'Token has expired' : 'Invalid token';
    return errorResponse(res, message, HTTP_STATUS_CODES.UNAUTHORIZED, {});
  }

  // Ensure userId is present in the query
  if (!userId) {
    return errorResponse(res, 'userId is required in the query params', HTTP_STATUS_CODES.BAD_REQUEST, {});
  }

  try {
    // Find the user by userId from the database
    const user = (await UserModel.findById(userId)) as UserDocument;

    if (!user) {
      return errorResponse(res, 'User not found', HTTP_STATUS_CODES.NOT_FOUND, {});
    }

    // Check if user is active
    if (user.status !== 'active') {
      return errorResponse(res, 'User account is inactive', HTTP_STATUS_CODES.FORBIDDEN, {});
    }

    // Attach the userId and userName to the request object for downstream use
    req.userId = String(user._id);
    req.userName = user.username;

    // Pass control to the next middleware or route handler
    next();
  } catch (error) {
    return errorResponse(res, 'Internal server error', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error);
  }
};

// New auth middleware for Bearer token authentication
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Extract the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return errorResponse(res, 'Authorization header is required', HTTP_STATUS_CODES.UNAUTHORIZED, {});
  }

  // Check if the Authorization header starts with 'Bearer '
  if (!authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authorization header must start with Bearer', HTTP_STATUS_CODES.UNAUTHORIZED, {});
  }

  // Extract the token from the Authorization header
  const token = authHeader.slice(7); // Remove 'Bearer ' prefix

  if (!token) {
    return errorResponse(res, 'Authorization token is required', HTTP_STATUS_CODES.UNAUTHORIZED, {});
  }

  try {
    const decodedToken = commonVerifyJwtToken(token);

    // Ensure the decoded token contains userId
    if (!decodedToken || !decodedToken.userId) {
      return errorResponse(res, 'Invalid token', HTTP_STATUS_CODES.UNAUTHORIZED, {});
    }

    // Find the user by userId from the database
    const user = await UserModel.findById(decodedToken.userId);

    if (!user) {
      return errorResponse(res, 'User not found', HTTP_STATUS_CODES.NOT_FOUND, {});
    }

    // Check if user is active
    if (user.status !== 'active') {
      return errorResponse(res, 'User account is inactive', HTTP_STATUS_CODES.FORBIDDEN, {});
    }

    // Attach the userId and userName to the request object for downstream use
    req.userId = user._id?.toString();
    req.userName = user.username;

    // Pass control to the next middleware or route handler
    next();
  } catch (err: any) {
    // Handle token verification errors
    const isTokenExpired = err.name === 'TokenExpiredError';
    const message = isTokenExpired ? 'Token has expired' : 'Invalid token';
    return errorResponse(res, message, HTTP_STATUS_CODES.UNAUTHORIZED, {});
  }
};

// Dynamic function to create a rate limiter
export const createRateLimiter = (windowMs = 60000, max = 100) => {
  return rateLimit({
    windowMs, // time window in milliseconds
    max, // maximum number of requests allowed in the window
    message: 'Too many requests, please try again later.',
  });
};

export const commonRateLimitter = createRateLimiter(); // 1 minute window, max 100 requests
