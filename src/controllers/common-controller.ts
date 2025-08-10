import { Request, Response } from 'express';
import { errorResponse, successResponse, HTTP_STATUS_CODES } from '@/utils/responseUtils';

export const generateBasicKey = async (req: Request, res: Response) => {
  // Check validation errors

  try {
    const { secretKey } = req.body;

    const auth = 'Basic ' + Buffer.from(`${secretKey}:`).toString('base64');

    return successResponse(res, 'Webhook registered successfully', HTTP_STATUS_CODES.CREATED, auth);
  } catch (error) {
    return errorResponse(res, 'Error registering webhook', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error);
  }
};
