// commonUtils.ts

import { Response } from 'express';

// Commonly used HTTP status codes
export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Function to send a success response
export const successResponse = (res: Response, message: string, statusCode: number, body: any) => {
  res.status(statusCode).json({
    success: true,
    message: message,
    data: body,
  });
};

export const successGameResponse = (res: Response, message: string, statusCode: number, body: any) => {
  res.status(statusCode).json({
    success: true,
    message: message,
    ...body,
  });
};
export const commonResponse = (res: Response, statusCode: number, body: any) => {
  console.log('res common::', JSON.stringify(body));
  res.status(statusCode).json(body);
};

// Function to send an error response
export const errorResponse = (res: Response, message: string, statusCode: number, error?: any, body?: any) => {
  console.log('error', message, 'cause::', error);
  res.status(statusCode).json({
    success: false,
    message: message,
    error: error?.cause || error || 'Internal Server Error',
    ...body,
  });
};

// Function to send an error response
export const gameErrorResponse = (res: Response, message: string, statusCode: number, gameCode: number) => {
  res.status(statusCode).json({
    success: false,
    message: message,
    code: gameCode,
  });
};
