import { Request, Response } from 'express';
import {
  getEventStats,
  getRevenueByTime,
  getEventParticipants,
} from '../services/statsService';
import { z } from 'zod';

// Zod schema for query validation
const revenueQuerySchema = z.object({
  filter: z.enum(['daily', 'monthly', 'yearly']).default('daily'),
});

/**
 * GET /stats/overview
 * Organizer dashboard overview statistics
 */
export const getOverviewStats = async (req: Request, res: Response) => {
  try {
    const organizerId = req.user?.id;
    if (!organizerId)
      return res
        .status(400)
        .json({ success: false, message: 'Organizer id missing' });

    const data = await getEventStats(organizerId);

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /stats/revenue?filter=daily|monthly|yearly
 */
export const getRevenueStats = async (req: Request, res: Response) => {
  try {
    const organizerId = req.user?.id;
    if (!organizerId)
      return res
        .status(400)
        .json({ success: false, message: 'Organizer id missing' });

    const parsed = revenueQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, errors: parsed.error.format() });
    }

    const data = await getRevenueByTime(organizerId, parsed.data.filter);

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /stats/event/:eventId/participants
 */
export const getParticipantsList = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    const data = await getEventParticipants(eventId);

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
