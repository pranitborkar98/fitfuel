import "server-only";

import type { Prisma } from "@prisma/client";

/** Reserve only credit not already attached to a recent pending PayU order.
 * Call inside the same serializable transaction that creates the new order so
 * simultaneous checkouts cannot both reserve the same balance. */
export async function checkoutCreditReservation(
  tx: Prisma.TransactionClient,
  input: { userId: string; totalRs: number; enabled: boolean },
): Promise<number> {
  if (!input.enabled) return 0;
  const reservationCutoff = new Date(Date.now() - 30 * 60_000);
  const [user, pending] = await Promise.all([
    tx.user.findUnique({ where: { id: input.userId }, select: { creditsBalanceRs: true } }),
    tx.order.aggregate({
      where: {
        userId: input.userId,
        status: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
        createdAt: { gte: reservationCutoff },
      },
      _sum: { creditAppliedRs: true },
    }),
  ]);
  const balance = Math.max(0, user?.creditsBalanceRs ?? 0);
  const reserved = Math.max(0, pending._sum.creditAppliedRs ?? 0);
  return Math.min(Math.max(0, balance - reserved), Math.max(0, input.totalRs - 1));
}
