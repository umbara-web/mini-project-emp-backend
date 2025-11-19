"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expirePointsAndCoupons = expirePointsAndCoupons;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
async function expirePointsAndCoupons() {
    const now = new Date();
    const expired = await prismaClient_1.default.pointTransaction.findMany({
        where: { expiresAt: { lt: now }, type: 'EARN' },
    });
    for (const p of expired) {
        await prismaClient_1.default.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: p.userId } });
            const deduct = Math.min(user.pointsBalance, p.points);
            if (deduct > 0) {
                await tx.user.update({
                    where: { id: user.id },
                    data: { pointsBalance: user.pointsBalance - deduct },
                });
                await tx.pointTransaction.create({
                    data: {
                        userId: user.id,
                        points: -deduct,
                        type: 'EXPIRE',
                        expiresAt: now,
                    },
                });
            }
        });
    }
    await prismaClient_1.default.coupon.updateMany({
        where: { expiresAt: { lt: now }, used: false },
        data: {},
    });
}
