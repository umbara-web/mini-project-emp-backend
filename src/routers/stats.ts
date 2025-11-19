import { Router } from 'express';
import {
  getOverviewStats,
  getRevenueStats,
  getParticipantsList,
} from '../controllers/statsController';
import {
  authenticate,
  authorizeOrganizer,
} from '../middlewares/auth.middleware';

const router = Router();

// All stats routes require user to be organizer
router.use(authenticate, authorizeOrganizer);

// GET /stats/overview
router.get('/overview', getOverviewStats);

// GET /stats/revenue?filter=daily|monthly|yearly
router.get('/revenue', getRevenueStats);

// GET /stats/event/:eventId/participants
router.get('/event/:eventId/participants', getParticipantsList);

export default router;
