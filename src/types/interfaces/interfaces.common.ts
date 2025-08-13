import { Types } from 'mongoose';

// Interface for custom class ApiError
export interface ApiError extends Error {
  success: boolean;
  message: string;
  statusCode: number;
  data: [] | Record<string, never>;
}

// Example User interface
export interface User {
  name: string;
}

export interface AppErrorType {
  message: string | string[] | (() => string | string[]);
  messages: string[] | undefined;
  statusCode: number;
  extraFields: Record<string, unknown>;
  isOperational: boolean;
}

//jwt token extra payload field
export interface JwtPayloadFieldType {
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;
}

//jwt auth token
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
