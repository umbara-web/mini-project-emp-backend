"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParticipantsList = exports.getRevenueStats = exports.getOverviewStats = void 0;
const statsService_1 = require("../services/statsService");
const zod_1 = require("zod");
// Zod schema for query validation
const revenueQuerySchema = zod_1.z.object({
    filter: zod_1.z.enum(['daily', 'monthly', 'yearly']).default('daily'),
});
/**
 * GET /stats/overview
 * Organizer dashboard overview statistics
 */
const getOverviewStats = async (req, res) => {
    var _a;
    try {
        const organizerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!organizerId)
            return res
                .status(400)
                .json({ success: false, message: 'Organizer id missing' });
        const data = await (0, statsService_1.getEventStats)(organizerId);
        return res.json({ success: true, data });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getOverviewStats = getOverviewStats;
/**
 * GET /stats/revenue?filter=daily|monthly|yearly
 */
const getRevenueStats = async (req, res) => {
    var _a;
    try {
        const organizerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const data = await (0, statsService_1.getRevenueByTime)(organizerId, parsed.data.filter);
        return res.json({ success: true, data });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getRevenueStats = getRevenueStats;
/**
 * GET /stats/event/:eventId/participants
 */
const getParticipantsList = async (req, res) => {
    try {
        const { eventId } = req.params;
        const data = await (0, statsService_1.getEventParticipants)(eventId);
        return res.json({ success: true, data });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getParticipantsList = getParticipantsList;
