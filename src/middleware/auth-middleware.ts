import { DEFAULT_CURRENCY } from '@/config/constant';
import GamesModel from '@/models/games/games.model';
import UserModel from '@/models/users/users.model';
import { HTTP_STATUS_CODES, errorResponse } from '@/utils/responseUtils';
import { commonVerifyJwtToken } from '@/utils/securityUtils';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// @desc Authenticates user and protects routes

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  let { userId } = req.query;

  const token = req.headers['authorization']?.split(' ')[1];

  // // Ensure token is present in the headers
  // if (!token) {
  //   return errorResponse(res, 'Token is required in the headers', HTTP_STATUS_CODES.UNAUTHORIZED, {});
  // }

  // Check if token is present in the headers
  if (token) {
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
  }

  // Ensure userId is present in the query
  if (!userId) {
    return errorResponse(res, 'userId is required in the query params', HTTP_STATUS_CODES.BAD_REQUEST, {});
  }

  try {
    // Find the user by userId from the database
    const user = await UserModel.findById(userId);

    if (!user) {
      return errorResponse(res, 'User not found', HTTP_STATUS_CODES.NOT_FOUND, {});
    }

    const game = await GamesModel.findById(user.gameId).select(
      'isUnderMaintenance config defaultCurrency name provider'
    );
    if (!game || game?.isUnderMaintenance === true) {
      return errorResponse(
        res,
        'game is under maintenance, please try after some time!',
        HTTP_STATUS_CODES.BAD_REQUEST,
        {}
      );
    }

    // Attach the userId and gameId to the request object for downstream use
    req.userId = user._id;
    req.userName = user.username;
    req.provider = game.provider;
    req.gameName = game.name;
    req.gameId = user.gameId; // Assuming user document contains gameId field
    req.gameCurrency = game?.defaultCurrency || DEFAULT_CURRENCY;
    req.gameConfig = game?.config;

    // Pass control to the next middleware or route handler
    next();
  } catch (error) {
    return errorResponse(res, 'Internal server error', HTTP_STATUS_CODES.UNAUTHORIZED, error);
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
