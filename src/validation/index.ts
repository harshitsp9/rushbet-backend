import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

interface ErrorResponse {
  errors: { [key: string]: string }[];
}

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors: { [key: string]: string }[] = [];
  errors.array({ onlyFirstError: true }).forEach((err: any) => {
    extractedErrors.push({ [err.path]: err.msg });
  });

  const errorResponse: ErrorResponse = { errors: extractedErrors };
  return res.status(422).json(errorResponse);
};

export const validateDomain = (value: string): boolean => {
  const domainPattern = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!domainPattern.test(value)) {
    throw new Error('Please provide a valid domain name without protocol or path, e.g., google.com');
  }
  return true;
};
