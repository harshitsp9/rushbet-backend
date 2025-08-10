import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODES, errorResponse } from '@/utils/responseUtils';

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to handle file uploads
export const uploadFile = (fields: { name: string; maxCount: number }[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadHandler = upload.fields(fields);

    uploadHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Handle Multer specific errors
        return errorResponse(res, err.message, HTTP_STATUS_CODES.BAD_REQUEST);
      } else if (err) {
        // Handle other errors
        return errorResponse(res, err.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      }
      next();
    });
  };
};

// Middleware function to upload a single file with a specified field name
export const singleFileUploader = (fieldName: string) => {
  return upload.single(fieldName);
};
