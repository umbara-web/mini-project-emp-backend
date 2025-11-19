"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventParticipants = exports.getRevenueByTime = exports.getEventStats = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const date_fns_1 = require("date-fns");
/**
 * Get event statistics for organizer dashboard
 */
const getEventStats = async (organizerId) => {
    var _a;
    // Total events created by organizer
    const totalEvents = await prismaClient_1.default.event.count({
        where: { ownerId: organizerId },
    });
    // Total transactions for organizer's events
    const totalTransactions = await prismaClient_1.default.transaction.count({
        where: { event: { ownerId: organizerId } },
    });
    // Successful revenue (sum of amount for accepted transactions)
    const totalRevenueAgg = await prismaClient_1.default.transaction.aggregate({
        where: { event: { ownerId: organizerId }, status: 'ACCEPTED' },
        _sum: { amount: true },
    });
    const totalRevenue = (_a = totalRevenueAgg._sum.amount) !== null && _a !== void 0 ? _a : 0;
    return { totalEvents, totalTransactions, totalRevenue };
};
exports.getEventStats = getEventStats;
/**
 * Get revenue grouped by day, month, or year
 */
const getRevenueByTime = async (organizerId, filter) => {
    const now = new Date();
    let start;
    let end;
    if (filter === 'daily') {
        start = (0, date_fns_1.startOfDay)(now);
        end = (0, date_fns_1.endOfDay)(now);
    }
    else if (filter === 'monthly') {
        start = (0, date_fns_1.startOfMonth)(now);
        end = (0, date_fns_1.endOfMonth)(now);
    }
    else {
        start = (0, date_fns_1.startOfYear)(now);
        end = (0, date_fns_1.endOfYear)(now);
    }
    const revenue = await prismaClient_1.default.transaction.groupBy({
        by: ['createdAt'],
        where: {
            event: { ownerId: organizerId },
            status: 'ACCEPTED',
            createdAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
        orderBy: { createdAt: 'asc' },
    });
    return revenue.map((item) => {
        var _a;
        return ({
            date: item.createdAt,
            total: (_a = item._sum.amount) !== null && _a !== void 0 ? _a : 0,
        });
    });
};
exports.getRevenueByTime = getRevenueByTime;
/**
 * Get participants list for a specific event
 */
const getEventParticipants = async (eventId) => {
    const participants = await prismaClient_1.default.transaction.findMany({
        where: { eventId: eventId, status: 'ACCEPTED' },
        include: {
            user: {
                select: { id: true, name: true, email: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    // Ambil ticketQuantity dari Ticket (eventId & userId)
    const tickets = await prismaClient_1.default.ticket.findMany({
        where: { eventId: eventId },
        select: { userId: true, quantity: true },
    });
    return participants.map((trx) => {
        var _a;
        const ticket = tickets.find((t) => t.userId === trx.userId);
        return {
            userId: trx.user.id,
            name: trx.user.name,
            email: trx.user.email,
            ticketQuantity: (_a = ticket === null || ticket === void 0 ? void 0 : ticket.quantity) !== null && _a !== void 0 ? _a : 1,
            totalPaid: trx.amount,
            transactionDate: trx.createdAt,
        };
    });
};
exports.getEventParticipants = getEventParticipants;
