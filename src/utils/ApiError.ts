import { AppErrorType } from '@/types/interfaces/interfaces.common';
import { HTTP_STATUS_CODES } from './responseUtils';

// @desc Structures data from error with more relevant data
export class ApiError extends Error {
  statusCode: number;
  error: unknown;
  // eslint-disable-next-line @typescript-eslint/ban-types
  data: [] | {};

  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor(data: {} | [], statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }
}

export class AppError extends Error {
  public messages: AppErrorType['messages'];
  public statusCode: AppErrorType['statusCode'];
  public status: AppErrorType['statusCode'];
  public extraFields: AppErrorType['extraFields'];
  public isOperational: AppErrorType['isOperational'];

  static getMessage = (message: AppErrorType['message']): string => {
    if (message instanceof Function) return message() as string;
    return Array.isArray(message) ? message[0] : message;
  };

  constructor(
    message: AppErrorType['message'],
    statusCode: AppErrorType['statusCode'],
    extraFields: AppErrorType['extraFields'] = {}
  ) {
    super();
    this.message = AppError.getMessage(message);
    this.messages = Array.isArray(message) ? message : undefined;
    this.statusCode = statusCode || (HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR as number);
    this.status = statusCode;
    this.extraFields = extraFields;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
