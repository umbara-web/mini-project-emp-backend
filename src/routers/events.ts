import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { permit } from '../middlewares/roleMiddleware';
import * as eventController from '../controllers/eventController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.post(
  '/',
  authenticate,
  permit('ORGANIZER'),
  asyncHandler(eventController.createEvent)
);
router.put(
  '/:id',
  authenticate,
  permit('ORGANIZER'),
  asyncHandler(eventController.updateEvent)
);
router.get(
  '/my-events',
  authenticate,
  permit('ORGANIZER'),
  asyncHandler(eventController.listMyEvents)
);
router.get('/search', asyncHandler(eventController.searchEvents));

export default router;
