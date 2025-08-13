import config from '@/config/envConfig';
import { errorResponse } from '@/utils/responseUtils';
import { HTTP_STATUS_CODES } from '@/utils/responseUtils';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const { DEPOSIT_WEBHOOK_SECRET, WITHDRAWAL_WEBHOOK_SECRET } = config;

// Middleware function
export const speedWebhookMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const webhookSignature = req.headers['webhook-signature'];
    const webhookTimestamp = req.headers['webhook-timestamp'];
    const webhookId = req.headers['webhook-id'];

    if (!webhookSignature || !webhookTimestamp || !webhookId) {
      return errorResponse(res, 'Missing required webhook headers', HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    const route = req.route?.path || req.url;
    const signingSecret = getSigningSecret(route);

    if (!signingSecret?.startsWith('wsec_')) {
      return errorResponse(res, 'Invalid signing secret format', HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    const requestBody = req.rawBody || '';

    if (!requestBody) {
      console.error('Raw body not available for signature verification');
      return errorResponse(res, 'Missing raw request body', HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    const isValid = verifySignature(
      webhookSignature as string,
      webhookTimestamp as string,
      webhookId as string,
      signingSecret as string,
      requestBody
    );

    console.log(`Speed Signature Verification: ${isValid}`);

    if (!isValid) {
      return errorResponse(res, 'Invalid webhook signature', HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    next();
  } catch (error) {
    console.error('Speed Webhook Middleware Error:', error);
    return errorResponse(res, 'Unauthorized', HTTP_STATUS_CODES.UNAUTHORIZED);
  }
};

const getSigningSecret = (route: string) => {
  if (route.includes('/receive-payment')) {
    return DEPOSIT_WEBHOOK_SECRET;
  } else if (route.includes('/withdraw-status')) {
    return WITHDRAWAL_WEBHOOK_SECRET;
  }
  throw new Error('Invalid webhook route');
};

const verifySignature = (
  webhookSignature: string,
  webhookTimestamp: string,
  webhookId: string,
  signingSecret: string,
  requestBody: string | Buffer
) => {
  try {
    const secretWithoutPrefix = signingSecret.substring(5);
    const secretBytes = Buffer.from(secretWithoutPrefix, 'base64');

    const signedPayload = `${webhookId}.${webhookTimestamp}.${requestBody.toString()}`;

    const hmac = crypto.createHmac('sha256', secretBytes);
    hmac.update(signedPayload, 'utf8');
    const expectedSignature = hmac.digest('base64');

    const signatureWithoutVersion = webhookSignature.includes(',') ? webhookSignature.split(',')[1] : webhookSignature;

    const expectedBuffer = Buffer.from(expectedSignature, 'base64');
    const actualBuffer = Buffer.from(signatureWithoutVersion, 'base64');

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch (error) {
    console.error('Speed verifySignature error: ', error);
    return false;
  }
};
