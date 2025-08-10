import express from 'express';
import { createRateLimiter, verifyUser } from '@/middleware/auth-middleware';
import { ValidateWithdrawApi } from '@/validation/payment.validation';
import { validate } from '../validation';
import { withdrawBalance } from '@/controllers/withdraw-controller';

// Import controllers from

// Setup router
const router = express.Router();

// Setup all routes for game
router.post('/balance', [createRateLimiter(1000, 1), ...ValidateWithdrawApi, validate, verifyUser], withdrawBalance);

// Export router; should always export as default
export default router;
