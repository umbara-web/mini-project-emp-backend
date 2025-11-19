"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPointsToUser = addPointsToUser;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
async function addPointsToUser(userId, points, tx) {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3);
    const client = tx || prismaClient_1.default;
    await client.pointTransaction.create({
        data: { userId, points, type: 'EARN', expiresAt },
    });
    await client.user.update({
        where: { id: userId },
        data: { pointsBalance: { increment: points } },
    });
}
