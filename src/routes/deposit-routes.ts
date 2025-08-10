import express from 'express';
import { depositBalance } from '@/controllers/deposit-controller';
import { createRateLimiter, verifyUser } from '@/middleware/auth-middleware';
import { ValidateDepositApi } from '@/validation/payment.validation';
import { validate } from '../validation';

// Import controllers from

// Setup router
const router = express.Router();

// Setup all routes for game
router.post('/balance', [createRateLimiter(1000, 1), ...ValidateDepositApi, validate, verifyUser], depositBalance);

// Export router; should always export as default
export default router;
