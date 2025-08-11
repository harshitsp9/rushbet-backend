import { Request, Response } from 'express';
import UserModel from '@/models/users/users.model';
import { asyncHandler } from '@/middleware/async-middleware';
import { successResponse, errorResponse, HTTP_STATUS_CODES } from '@/utils/responseUtils';

/**
 * Get user profile
 */
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  // Get user ID from the authenticated request (this would be set by auth middleware)
  const userId = req.userId;

  if (!userId) {
    return errorResponse(res, 'Authentication required', HTTP_STATUS_CODES.BAD_REQUEST);
  }

  // Find user by ID
  const user = await UserModel.findById(userId).select('-password');
  if (!user) {
    return errorResponse(res, 'User not found', HTTP_STATUS_CODES.NOT_FOUND);
  }

  // Return user profile
  const userResponse = {
    id: user._id,
    username: user.username,
    email: user.email,
    country: user.country,
    authProvider: user.authProvider,
    isEmailVerified: user.isEmailVerified,
    status: user.status,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return successResponse(res, 'Profile retrieved successfully', HTTP_STATUS_CODES.OK, { user: userResponse });
});
