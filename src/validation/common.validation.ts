import { body } from 'express-validator';

export const WebhookValidationRules = [
  body('sourceName').isString().notEmpty().withMessage('Source name is required'),
  body('sourceUrl').isURL().withMessage('Valid source URL is required'),
  body('destinationName').isString().notEmpty().withMessage('Destination name is required'),
  body('destinationUrl').isURL().withMessage('Valid destination URL is required'),
  body('gameId').isMongoId().withMessage('Valid gameId is required'),
];
