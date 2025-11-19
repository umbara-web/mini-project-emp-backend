"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInTransaction = runInTransaction;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
async function runInTransaction(fn) {
    // Use Prisma.TransactionClient as the callback client type — this matches
    // the runtime transaction client that Prisma provides to the callback.
    return prismaClient_1.default.$transaction(async (tx) => fn(tx));
}
