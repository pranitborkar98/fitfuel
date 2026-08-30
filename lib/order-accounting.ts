import "server-only";

import { prisma } from "@/lib/prisma";
import {
  ensureOrderCreditCommitted,
  processReferralReward,
  refundOrderCredit,
  reverseReferralReward,
} from "@/lib/partners";

export interface OrderAccountingSnapshot {
  id: string;
  userId: string;
  couponCode?: string | null;
  discountRs?: number | null;
  creditAppliedRs?: number | null;
  paymentStatus?: string;
}

function errorCode(error: unknown): string | null {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : null;
}

export async function ensureCouponRedemption(order: OrderAccountingSnapshot): Promise<void> {
  const couponCode = order.couponCode;
  const discountRs = Number(order.discountRs || 0);
  if (!couponCode || discountRs <= 0) return;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await prisma.$transaction(async (tx) => {
        const existing = await tx.couponRedemption.findFirst({
          where: { orderId: order.id },
          select: { id: true },
        });
        if (existing) return;

        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode },
          select: { id: true },
        });
        if (!coupon) return;
        await tx.couponRedemption.create({
          data: {
            couponId: coupon.id,
            userId: order.userId,
            orderId: order.id,
            amountRs: discountRs,
          },
        });
      }, { isolationLevel: "Serializable" });
      return;
    } catch (error: unknown) {
      if (errorCode(error) === "P2034" && attempt < 2) continue;
      throw error;
    }
  }
}

export async function releaseCouponRedemption(orderId: string): Promise<void> {
  await prisma.couponRedemption.deleteMany({ where: { orderId } });
}

export async function ensurePaidOrderAccounting(order: OrderAccountingSnapshot): Promise<void> {
  await ensureOrderCreditCommitted(order);
  await processReferralReward(order.id);
  await ensureCouponRedemption(order);
}

/** Undo every commercial side effect that belongs to an order. Each operation
 * is independently idempotent so an admin retry can safely repair a partial
 * reversal. */
export async function reversePaidOrderAccounting(order: OrderAccountingSnapshot): Promise<void> {
  await refundOrderCredit(order);
  await reverseReferralReward(order.id);
  await releaseCouponRedemption(order.id);
}
