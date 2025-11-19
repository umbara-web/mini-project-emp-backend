import prisma from '../config/prismaClient';

export async function createReferralOnSignup(
  newUserId: string,
  referenceCode: string
) {
  const referrer = await prisma.user.findFirst({ where: { referenceCode } });
  if (!referrer) return;

  return prisma.$transaction(async (tx) => {
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
