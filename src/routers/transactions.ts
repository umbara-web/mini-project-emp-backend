import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { permit } from '../middlewares/roleMiddleware';
import * as transactionController from '../controllers/transactionController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.post(
  '/',
  authenticate,
  asyncHandler(transactionController.createTransaction)
);
router.get(
  '/my',
  authenticate,
  asyncHandler(transactionController.listMyTransactions)
);
router.patch(
  '/:id/accept',
  authenticate,
  permit('ORGANIZER'),
  asyncHandler(transactionController.acceptTransaction)
);
router.patch(
  '/:id/reject',
  authenticate,
  permit('ORGANIZER'),
  asyncHandler(transactionController.rejectTransaction)
);

export default router;
export const transactionsRouter = router;
