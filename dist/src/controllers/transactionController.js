"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectTransaction = exports.acceptTransaction = exports.listMyTransactions = exports.createTransaction = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const nodemailer_1 = require("../helper/nodemailer");
/**
 * Create a transaction (purchase) - minimal implementation
 */
const createTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const { eventId, quantity = 1, couponCode, } = req.body;
        // Basic validation
        if (!eventId)
            return res.status(400).json({ error: 'Missing eventId' });
        const result = await prismaClient_1.default.$transaction(async (tx) => {
            const event = await tx.event.findUnique({ where: { id: eventId } });
            if (!event)
                throw new Error('Event not found');
            if (event.seatsLeft < Number(quantity))
                throw new Error('Not enough seats');
            let coupon = null;
            let total = event.price * Number(quantity);
            if (couponCode) {
                coupon = await tx.coupon.findUnique({ where: { code: couponCode } });
                if (!coupon || coupon.used || coupon.expiresAt < new Date())
                    throw new Error('Invalid coupon');
                total = Math.round(total * (1 - coupon.discount / 100));
                await tx.coupon.update({
                    where: { id: coupon.id },
                    data: { used: true },
                });
            }
            await tx.event.update({
                where: { id: eventId },
                data: { seatsLeft: event.seatsLeft - Number(quantity) },
            });
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    eventId,
                    amount: total,
                    status: 'PENDING',
                    couponId: coupon ? coupon.id : null,
                },
            });
            return { transaction };
        });
        res.json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(400).json({ error: message });
    }
};
exports.createTransaction = createTransaction;
const listMyTransactions = async (req, res) => {
    const items = await prismaClient_1.default.transaction.findMany({
        where: { userId: req.user.id },
    });
    res.json({ items });
};
exports.listMyTransactions = listMyTransactions;
const acceptTransaction = async (req, res) => {
    const txId = req.params.id;
    try {
        await prismaClient_1.default.$transaction(async (tx) => {
            var _a;
            const transaction = await tx.transaction.findUnique({
                where: { id: txId },
                include: { user: true },
            });
            if (!transaction)
                throw new Error('Transaction not found');
            if (transaction.status !== 'PENDING')
                throw new Error('Invalid transaction status');
            await tx.transaction.update({
                where: { id: txId },
                data: { status: 'ACCEPTED' },
            });
            // send email notification (via mailer)
            if ((_a = transaction.user) === null || _a === void 0 ? void 0 : _a.email) {
                await nodemailer_1.transporter.sendMail({
                    to: transaction.user.email,
                    subject: 'Transaksi Diterima',
                    text: `Transaksi Anda untuk event ${transaction.eventId} telah diterima.`,
                });
            }
        });
        res.json({ ok: true });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(400).json({ error: message });
    }
};
exports.acceptTransaction = acceptTransaction;
const rejectTransaction = async (req, res) => {
    const txId = req.params.id;
    try {
        await prismaClient_1.default.$transaction(async (tx) => {
            var _a;
            const transaction = await tx.transaction.findUnique({
                where: { id: txId },
                include: { user: true },
            });
            if (!transaction)
                throw new Error('Transaction not found');
            if (transaction.status !== 'PENDING')
                throw new Error('Invalid transaction status');
            const event = await tx.event.findUnique({
                where: { id: transaction.eventId },
            });
            if (event)
                await tx.event.update({
                    where: { id: event.id },
                    data: { seatsLeft: event.seatsLeft + 1 },
                });
            if (transaction.couponId) {
                await tx.coupon.update({
                    where: { id: transaction.couponId },
                    data: { used: false },
                });
            }
            // restore points if used (assume amount < event.price means points used)
            if (event &&
                typeof event.price === 'number' &&
                transaction.amount < event.price) {
                // restore selisih ke user
                const restorePoints = event.price - transaction.amount;
                await tx.user.update({
                    where: { id: transaction.userId },
                    data: { pointsBalance: { increment: restorePoints } },
                });
                await tx.pointTransaction.create({
                    data: {
                        userId: transaction.userId,
                        points: restorePoints,
                        type: 'EARN',
                        expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 3)),
                    },
                });
            }
            await tx.transaction.update({
                where: { id: txId },
                data: { status: 'REJECTED' },
            });
            // send email notification (via mailer)
            if ((_a = transaction.user) === null || _a === void 0 ? void 0 : _a.email) {
                await nodemailer_1.transporter.sendMail({
                    to: transaction.user.email,
                    subject: 'Transaksi Ditolak',
                    text: `Transaksi Anda untuk event ${transaction.eventId} telah ditolak. Poin/kupon/kursi telah dikembalikan jika digunakan.`,
                });
            }
        });
        res.json({ ok: true });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(400).json({ error: message });
    }
};
exports.rejectTransaction = rejectTransaction;
