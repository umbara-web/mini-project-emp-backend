"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statsController_1 = require("../controllers/statsController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// All stats routes require user to be organizer
router.use(auth_middleware_1.authenticate, auth_middleware_1.authorizeOrganizer);
// GET /stats/overview
router.get('/overview', statsController_1.getOverviewStats);
// GET /stats/revenue?filter=daily|monthly|yearly
router.get('/revenue', statsController_1.getRevenueStats);
// GET /stats/event/:eventId/participants
router.get('/event/:eventId/participants', statsController_1.getParticipantsList);
exports.default = router;
