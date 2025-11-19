import prisma from '../config/prismaClient';
import {
  subDays,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  startOfYear,
  endOfYear,
} from 'date-fns';

/**
 * Get event statistics for organizer dashboard
 */
export const getEventStats = async (organizerId: string) => {
  // Total events created by organizer
  const totalEvents: number = await prisma.event.count({
    where: { ownerId: organizerId },
  });

  // Total transactions for organizer's events
  const totalTransactions: number = await prisma.transaction.count({
    where: { event: { ownerId: organizerId } },
  });

  // Successful revenue (sum of amount for accepted transactions)
  const totalRevenueAgg = await prisma.transaction.aggregate({
    where: { event: { ownerId: organizerId }, status: 'ACCEPTED' },
    _sum: { amount: true },
  });

  const totalRevenue: number = totalRevenueAgg._sum.amount ?? 0;

  return { totalEvents, totalTransactions, totalRevenue };
};

/**
 * Get revenue grouped by day, month, or year
 */
export const getRevenueByTime = async (
  organizerId: string,
  filter: 'daily' | 'monthly' | 'yearly'
) => {
  const now = new Date();
  let start: Date;
  let end: Date;

  if (filter === 'daily') {
    start = startOfDay(now);
    end = endOfDay(now);
  } else if (filter === 'monthly') {
    start = startOfMonth(now);
    end = endOfMonth(now);
  } else {
    start = startOfYear(now);
    end = endOfYear(now);
  }

  const revenue = await prisma.transaction.groupBy({
    by: ['createdAt'],
    where: {
      event: { ownerId: organizerId },
      status: 'ACCEPTED',
      createdAt: { gte: start, lte: end },
    },
    _sum: { amount: true },
    orderBy: { createdAt: 'asc' },
  });

  return revenue.map((item) => ({
    date: item.createdAt,
    total: item._sum.amount ?? 0,
  }));
};

/**
 * Get participants list for a specific event
 */
export const getEventParticipants = async (eventId: string) => {
  const participants = await prisma.transaction.findMany({
    where: { eventId: eventId, status: 'ACCEPTED' },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Ambil ticketQuantity dari Ticket (eventId & userId)
  const tickets = await prisma.ticket.findMany({
    where: { eventId: eventId },
    select: { userId: true, quantity: true },
  });

  return participants.map((trx) => {
    const ticket = tickets.find((t) => t.userId === trx.userId);
    return {
      userId: trx.user.id,
      name: trx.user.name,
      email: trx.user.email,
      ticketQuantity: ticket?.quantity ?? 1,
      totalPaid: trx.amount,
      transactionDate: trx.createdAt,
    };
  });
};
