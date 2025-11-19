"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReferralOnSignup = createReferralOnSignup;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
async function createReferralOnSignup(newUserId, referenceCode) {
    const referrer = await prismaClient_1.default.user.findFirst({ where: { referenceCode } });
    if (!referrer)
        return;
    return prismaClient_1.default.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: newUserId },
            data: { referredById: referrer.id },
        });
        const points = 10000;
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 3);
        await tx.pointTransaction.create({
            data: { userId: referrer.id, points, type: 'EARN', expiresAt },
        });
        await tx.user.update({
            where: { id: referrer.id },
            data: { pointsBalance: { increment: points } },
        });
        const code = `SYS-${Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()}`;
        await tx.coupon.create({
            data: { code, discount: 10, userId: newUserId, expiresAt },
        });
    });
}
