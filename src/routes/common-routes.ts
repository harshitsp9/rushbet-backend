import express from 'express';

import { generateBasicKey } from '@/controllers/common-controller';
import { HTTP_STATUS_CODES, successResponse } from '@/utils/responseUtils';

// Import controllers from

// Setup router
const router = express.Router();

// Setup all routes for game
router.post('/generate-speed-basic', generateBasicKey);
router.get('/test', (_, res) => {
  return successResponse(res, 'Test connection', HTTP_STATUS_CODES.OK, {});
});

// Export router; should always export as default
export default router;
