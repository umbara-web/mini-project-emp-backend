import prisma from '../config/prismaClient';

export async function addPointsToUser(
  userId: string,
  points: number,
  tx?: typeof prisma
) {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 3);
  const client = tx || prisma;
  await client.pointTransaction.create({
    data: { userId, points, type: 'EARN', expiresAt },
  });
  await client.user.update({
    where: { id: userId },
    data: { pointsBalance: { increment: points } },
  });
}
