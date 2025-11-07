import { Router } from 'express';

import {
  verificationLinkController,
  verifyController,
} from '../controllers/auth.controller';

import { authMiddleware } from '../middlewares/auth.middleware';

const authRouter = Router();

authRouter.post('/verification-link', verificationLinkController);
authRouter.post('/verify', authMiddleware, verifyController);

export default authRouter;
