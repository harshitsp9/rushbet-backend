import { ApiError } from '@/types/interfaces/interfaces.common';
import { HTTP_STATUS_CODES, errorResponse } from '@/utils/responseUtils';
import { Request, Response, NextFunction } from 'express';

// @desc Handles error responses from throw errors

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
export const errorMiddlewareResponse = (error: ApiError, _req: Request, res: Response, _next: NextFunction) => {
  if ((error as any).code === 11000) {
    // Duplicate key error
    return errorResponse(res, 'Record already exists.', HTTP_STATUS_CODES.BAD_REQUEST, error);
  }
  return errorResponse(res, error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error);
};
