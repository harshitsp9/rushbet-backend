import express from 'express';

import { receivePaymentStatus, withdrawPaymentStatus } from '@/controllers/speed-webhook';
import { speedWebhookMiddleware } from '@/middleware/speed-verify-middleware';

// Import controllers from

// Setup router
const router = express.Router();

// Setup all routes for game
router.post('/receive-payment', speedWebhookMiddleware, receivePaymentStatus);
router.post('/withdraw-status', speedWebhookMiddleware, withdrawPaymentStatus);

// Export router; should always export as default
export default router;
