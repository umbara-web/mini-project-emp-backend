import prisma from '../config/prismaClient';
import type { Prisma } from '@prisma/client';

export async function runInTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>
) {
  // Use Prisma.TransactionClient as the callback client type — this matches
  // the runtime transaction client that Prisma provides to the callback.
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => fn(tx));
}
