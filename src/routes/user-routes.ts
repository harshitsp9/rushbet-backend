import express from 'express';
import { getUserProfile } from '@/controllers/user-controller';
import { authMiddleware } from '@/middleware/auth-middleware';

// Setup router
const router = express.Router();

// User Profile Routes

/**
 * @route   GET /api/v1/user/profile
 * @desc    Get user profile information
 * @access  Private (requires authentication)
 */
router.get('/profile', authMiddleware, getUserProfile);

export default router;
