import { Router } from 'express';
import * as authController from '../controllers/authController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));

export default router;
