import prisma from '../config/prismaClient';

export async function expirePointsAndCoupons() {
  const now = new Date();
  const expired = await prisma.pointTransaction.findMany({
    where: { expiresAt: { lt: now }, type: 'EARN' },
  });
  for (const p of expired) {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: p.userId } });
      const deduct = Math.min(user!.pointsBalance, p.points);
      if (deduct > 0) {
        await tx.user.update({
          where: { id: user!.id },
          data: { pointsBalance: user!.pointsBalance - deduct },
        });
        await tx.pointTransaction.create({
          data: {
            userId: user!.id,
            points: -deduct,
            type: 'EXPIRE',
            expiresAt: now,
          },
        });
      }
    });
  }

  await prisma.coupon.updateMany({
    where: { expiresAt: { lt: now }, used: false },
    data: {},
  });
}
