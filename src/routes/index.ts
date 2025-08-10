import { Request, Response, Router } from 'express';
import userRoute from './user-routes';
import authRoute from './auth-routes';
import speedRoute from './speed-routes';
import depositRoute from './deposit-routes';
import withdrawRoute from './withdraw-routes';

import commonRoutes from './common-routes';

import { HTTP_STATUS_CODES, errorResponse } from '@/utils/responseUtils';

const router = Router();

router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/deposit', depositRoute);
router.use('/withdraw', withdrawRoute);
router.use('/speed', speedRoute);

router.use('', commonRoutes);

// Catch-all route for 404 errors
router.all('*', (req: Request, res: Response) => {
  errorResponse(res, 'Route not found', HTTP_STATUS_CODES.NOT_FOUND);
});

export default router;
