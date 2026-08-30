import "server-only";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { fireNotification } from "@/lib/notify";
import type { Partner, Prisma } from "@prisma/client";

function isRetryableTransaction(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2034";
}

function isUniqueConflict(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function generateUniqueReferralCode(displayName: string | null | undefined): Promise<string> {
  const base = (displayName || "USER")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 8) || "USER";

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = randomUUID().replace(/-/g, "").slice(0, 4).toUpperCase();
    const code = `FF-${base}-${suffix}`;
    const exists = await prisma.user.findFirst({
      where: { OR: [{ referralCode: code }, { ownedPartner: { code } }] },
      select: { id: true },
    });
    if (!exists) return code;
  }

  return `FF-${base}-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export async function getOrCreateUserReferralCode(userId: string): Promise<string> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, referralCode: true },
    });
    if (!user) throw new Error("User not found");
    if (user.referralCode) return user.referralCode;

    const code = await generateUniqueReferralCode(user.name);
    try {
      const claimed = await prisma.user.updateMany({
        where: { id: userId, referralCode: null },
        data: { referralCode: code },
      });
      if (claimed.count === 1) return code;
    } catch (error: unknown) {
      if (!isUniqueConflict(error) || attempt === 3) throw error;
    }
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true } });
  if (user?.referralCode) return user.referralCode;
  throw new Error("Could not create a referral code");
}

export type ResolvedReferral =
  | { kind: "PARTNER"; partner: Partner }
  | { kind: "USER"; user: { id: string; name: string | null } }
  | null;

export async function resolveReferralCode(code: string): Promise<ResolvedReferral> {
  const normalized = String(code || "").trim().toUpperCase().slice(0, 64);
  if (!normalized) return null;

  const partner = await prisma.partner.findUnique({ where: { code: normalized } });
  if (partner) return partner.status === "ACTIVE" ? { kind: "PARTNER", partner } : null;

  const user = await prisma.user.findFirst({
    where: { referralCode: normalized },
    select: { id: true, name: true, ownedPartner: true },
  });
  if (!user) return null;
  if (user.ownedPartner) {
    return user.ownedPartner.status === "ACTIVE"
      ? { kind: "PARTNER", partner: user.ownedPartner }
      : null;
  }
  return { kind: "USER", user: { id: user.id, name: user.name } };
}

/** Preview only. The balance is committed separately when the order reaches
 * the appropriate payment point. */
export async function applyCreditAtCheckout(
  userId: string,
  subtotalRs: number,
): Promise<{ creditAppliedRs: number; newTotalRs: number }> {
  const reservationCutoff = new Date(Date.now() - 30 * 60_000);
  const [user, pending] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { creditsBalanceRs: true },
    }),
    prisma.order.aggregate({
      where: {
        userId,
        status: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
        createdAt: { gte: reservationCutoff },
      },
      _sum: { creditAppliedRs: true },
    }),
  ]);
  const balance = Math.max(0, Number(user?.creditsBalanceRs || 0));
  const reserved = Math.max(0, Number(pending?._sum?.creditAppliedRs || 0));
  const available = Math.max(0, balance - reserved);
  const total = Math.max(0, Math.round(subtotalRs));
  const used = Math.min(available, total);
  return { creditAppliedRs: used, newTotalRs: total - used };
}

/** Commit a ledger change and cached balance together. Negative changes cannot
 * push the account below zero even if two requests race. */
export async function recordCreditChange(
  userId: string,
  deltaRs: number,
  reason: string,
  refs?: { refReferralId?: string; refOrderId?: string },
): Promise<number> {
  const delta = Math.trunc(deltaRs);
  if (!delta) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { creditsBalanceRs: true } });
    return Number(user?.creditsBalanceRs || 0);
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const normalizedReason = reason.slice(0, 200);
        if (refs?.refOrderId) {
          const existing = await tx.creditLedger.findFirst({
            where: { userId, refOrderId: refs.refOrderId, reason: normalizedReason },
            select: { id: true },
          });
          if (existing) {
            const current = await tx.user.findUnique({ where: { id: userId }, select: { creditsBalanceRs: true } });
            return Number(current?.creditsBalanceRs || 0);
          }
        }

        let balance: number;
        if (delta < 0) {
          const claimed = await tx.user.updateMany({
            where: { id: userId, creditsBalanceRs: { gte: Math.abs(delta) } },
            data: { creditsBalanceRs: { increment: delta } },
          });
          if (claimed.count !== 1) throw new Error("Insufficient FitFuel credit");
          const user = await tx.user.findUnique({ where: { id: userId }, select: { creditsBalanceRs: true } });
          balance = Number(user?.creditsBalanceRs || 0);
        } else {
          const user = await tx.user.update({
            where: { id: userId },
            data: { creditsBalanceRs: { increment: delta } },
            select: { creditsBalanceRs: true },
          });
          balance = Number(user.creditsBalanceRs);
        }

        await tx.creditLedger.create({
          data: {
            userId,
            deltaRs: delta,
            reason: normalizedReason,
            refReferralId: refs?.refReferralId || null,
            refOrderId: refs?.refOrderId || null,
          },
        });
        return balance;
      }, { isolationLevel: "Serializable" });
    } catch (error: unknown) {
      if (isRetryableTransaction(error) && attempt < 2) continue;
      throw error;
    }
  }
  throw new Error("Could not record FitFuel credit");
}

export async function ensureOrderCreditCommitted(order: {
  id: string;
  userId: string;
  creditAppliedRs?: number | null;
}): Promise<void> {
  const amount = Math.max(0, Number(order.creditAppliedRs || 0));
  if (!amount) return;
  await recordCreditChange(order.userId, -amount, "order_payment", { refOrderId: order.id });
}

export async function refundOrderCredit(order: {
  id: string;
  userId: string;
  creditAppliedRs?: number | null;
}): Promise<void> {
  const amount = Math.max(0, Number(order.creditAppliedRs || 0));
  if (!amount) return;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const [spent, refunded] = await Promise.all([
          tx.creditLedger.findFirst({
            where: { userId: order.userId, refOrderId: order.id, reason: "order_payment", deltaRs: { lt: 0 } },
            select: { id: true },
          }),
          tx.creditLedger.findFirst({
            where: { userId: order.userId, refOrderId: order.id, reason: "order_credit_refund" },
            select: { id: true },
          }),
        ]);
        if (!spent || refunded) return;

        await tx.user.update({
          where: { id: order.userId },
          data: { creditsBalanceRs: { increment: amount } },
        });
        await tx.creditLedger.create({
          data: {
            userId: order.userId,
            deltaRs: amount,
            reason: "order_credit_refund",
            refOrderId: order.id,
          },
        });
      }, { isolationLevel: "Serializable" });
      return;
    } catch (error: unknown) {
      if (isRetryableTransaction(error) && attempt < 2) continue;
      throw error;
    }
  }
}

type RewardNotice = {
  userId: string;
  refereeName: string;
  rewardLabel: string;
  rewardAmount: string;
};

function indiaYearMonth(now = new Date()): string {
  const shifted = new Date(now.getTime() + 330 * 60_000);
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}`;
}

function nextYearMonth(period: string): string {
  const [year, month] = period.split("-").map(Number);
  const next = new Date(Date.UTC(year, month, 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Add cash to the first open payout bucket. A referral that lands after the
 * current month was sent to the bank rolls into the next month rather than
 * mutating an already processing or paid settlement. */
async function accrueCashPayout(
  tx: Prisma.TransactionClient,
  partnerId: string,
  amountRs: number,
): Promise<{ id: string; periodYearMonth: string }> {
  let periodYearMonth = indiaYearMonth();
  for (let offset = 0; offset < 24; offset += 1) {
    const existing = await tx.partnerPayout.findUnique({
      where: { partnerId_periodYearMonth: { partnerId, periodYearMonth } },
      select: { id: true, status: true },
    });
    if (!existing) {
      return tx.partnerPayout.create({
        data: { partnerId, periodYearMonth, amountRs, referralCount: 1, status: "PENDING" },
        select: { id: true, periodYearMonth: true },
      });
    }
    if (existing.status === "PENDING" || existing.status === "FAILED") {
      const claimed = await tx.partnerPayout.updateMany({
        where: { id: existing.id, status: { in: ["PENDING", "FAILED"] } },
        data: { amountRs: { increment: amountRs }, referralCount: { increment: 1 } },
      });
      if (claimed.count === 1) return { id: existing.id, periodYearMonth };
    }
    periodYearMonth = nextYearMonth(periodYearMonth);
  }
  throw new Error("No open partner payout period is available");
}

/** Convert one successful customer's first paid order into one referral reward.
 * The check, referral row and money/credit movement share a serializable
 * transaction, so callback retries and simultaneous orders cannot double-pay. */
export async function processReferralReward(orderId: string): Promise<void> {
  let notice: RewardNotice | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      notice = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          select: {
            id: true,
            orderNumber: true,
            userId: true,
            paymentStatus: true,
            referralAttribution: true,
            user: {
              select: {
                name: true,
                referralCode: true,
                referredByPartnerCode: true,
                ownedPartner: { select: { code: true } },
              },
            },
          },
        });
        if (!order || order.paymentStatus !== "SUCCESS") return null;

        const existing = await tx.partnerReferral.findFirst({
          where: { OR: [{ refereeOrderId: order.id }, { refereeUserId: order.userId }] },
          select: { id: true },
        });
        if (existing) return null;

        const code = (order.referralAttribution || order.user?.referredByPartnerCode || "").trim().toUpperCase() || null;
        if (!code || code === order.user?.referralCode || code === order.user?.ownedPartner?.code) return null;

        const directPartner = await tx.partner.findUnique({ where: { code } });
        const legacyOwner = directPartner
          ? null
          : await tx.user.findFirst({
              where: { referralCode: code },
              select: { ownedPartner: true },
            });
        const partner = directPartner ?? legacyOwner?.ownedPartner ?? null;
        if (partner?.ownerUserId === order.userId) return null;

        if (partner && partner.status !== "ACTIVE") return null;
        if (partner) {
          const rewardAmount = Math.max(0, Number(partner.rewardValueRs || 0));
          const referral = await tx.partnerReferral.create({
            data: {
              partnerId: partner.id,
              refereeUserId: order.userId,
              refereeOrderId: order.id,
              status: "FIRST_ORDER",
              rewardType: partner.rewardType,
              rewardAmountRs: rewardAmount,
              rewardEarnedAt: new Date(),
            },
          });

          if (partner.rewardType === "CREDIT" && partner.ownerUserId && rewardAmount > 0) {
            await tx.user.update({
              where: { id: partner.ownerUserId },
              data: { creditsBalanceRs: { increment: rewardAmount } },
            });
            await tx.creditLedger.create({
              data: {
                userId: partner.ownerUserId,
                deltaRs: rewardAmount,
                reason: `partner:${partner.code}:${order.orderNumber}`,
                refReferralId: referral.id,
                refOrderId: order.id,
              },
            });
          } else if ((partner.rewardType === "CASH" || partner.rewardType === "HYBRID") && rewardAmount > 0) {
            const payout = await accrueCashPayout(tx, partner.id, rewardAmount);
            await tx.partnerReferral.update({ where: { id: referral.id }, data: { payoutId: payout.id } });
          }

          if (!partner.ownerUserId || partner.rewardType === "DISCOUNT_ONLY") return null;
          const rewardLabel = partner.rewardType === "CASH" || partner.rewardType === "HYBRID"
            ? `₹${rewardAmount} added to your next payout`
            : partner.rewardType === "MEAL_VOUCHER"
              ? `${rewardAmount} meal voucher(s) recorded`
              : `₹${rewardAmount} added to your account credit`;
          return {
            userId: partner.ownerUserId,
            refereeName: order.user?.name || "a new customer",
            rewardLabel,
            rewardAmount: String(rewardAmount),
          };
        }

        const referrer = await tx.user.findFirst({
          where: { referralCode: code },
          select: { id: true, name: true, referralCode: true },
        });
        if (!referrer || referrer.id === order.userId || !referrer.referralCode) return null;

        let customerPartner = await tx.partner.findUnique({
          where: { ownerUserId: referrer.id },
          select: { id: true },
        });
        if (!customerPartner) {
          customerPartner = await tx.partner.create({
            data: {
              type: "CUSTOMER",
              status: "ACTIVE",
              name: referrer.name || "Customer",
              ownerUserId: referrer.id,
              code: referrer.referralCode,
              rewardType: "CREDIT",
              rewardValueRs: 500,
              refereeDiscountRs: 200,
              approvedAt: new Date(),
            },
            select: { id: true },
          });
        }

        const rewardAmount = 500;
        const referral = await tx.partnerReferral.create({
          data: {
            partnerId: customerPartner.id,
            refereeUserId: order.userId,
            refereeOrderId: order.id,
            status: "FIRST_ORDER",
            rewardType: "CREDIT",
            rewardAmountRs: rewardAmount,
            rewardEarnedAt: new Date(),
          },
        });
        await tx.user.update({
          where: { id: referrer.id },
          data: { creditsBalanceRs: { increment: rewardAmount } },
        });
        await tx.creditLedger.create({
          data: {
            userId: referrer.id,
            deltaRs: rewardAmount,
            reason: `referral:${order.orderNumber}`,
            refReferralId: referral.id,
            refOrderId: order.id,
          },
        });

        return {
          userId: referrer.id,
          refereeName: order.user?.name || "your friend",
          rewardLabel: `₹${rewardAmount} added to your account credit`,
          rewardAmount: String(rewardAmount),
        };
      }, { isolationLevel: "Serializable" });
      break;
    } catch (error: unknown) {
      if ((isRetryableTransaction(error) || isUniqueConflict(error)) && attempt < 2) continue;
      throw error;
    }
  }

  if (notice) {
    fireNotification({
      userId: notice.userId,
      templateKey: "partner_referral_earned",
      vars: {
        refereeName: notice.refereeName,
        rewardLabel: notice.rewardLabel,
        rewardAmount: notice.rewardAmount,
      },
    });
  }
}

/** Reverse a referral when the qualifying order is refunded. Credit rewards
 * are clawed back even when already spent (the resulting balance becomes a
 * debt against future credits). Pending cash payouts are reduced immediately;
 * money already processing or paid is left as an explicit admin clawback note
 * because it cannot be safely pulled from a bank account in this system. */
export async function reverseReferralReward(orderId: string): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const referral = await tx.partnerReferral.findFirst({
          where: { refereeOrderId: orderId },
          include: {
            partner: {
              select: { id: true, code: true, ownerUserId: true, adminNotes: true },
            },
          },
        });
        if (!referral || referral.status === "CANCELLED") return;

        const rewardAmount = Math.max(0, Number(referral.rewardAmountRs || 0));
        if (referral.rewardType === "CREDIT" && rewardAmount > 0) {
          const earned = await tx.creditLedger.findFirst({
            where: {
              refReferralId: referral.id,
              refOrderId: orderId,
              deltaRs: { gt: 0 },
            },
            select: { userId: true, deltaRs: true },
          });
          const reversed = await tx.creditLedger.findFirst({
            where: {
              refReferralId: referral.id,
              refOrderId: orderId,
              reason: "referral_reward_reversal",
            },
            select: { id: true },
          });
          if (earned && !reversed) {
            await tx.user.update({
              where: { id: earned.userId },
              data: { creditsBalanceRs: { increment: -Math.max(0, Number(earned.deltaRs)) } },
            });
            await tx.creditLedger.create({
              data: {
                userId: earned.userId,
                deltaRs: -Math.max(0, Number(earned.deltaRs)),
                reason: "referral_reward_reversal",
                refReferralId: referral.id,
                refOrderId: orderId,
              },
            });
          }
        } else if ((referral.rewardType === "CASH" || referral.rewardType === "HYBRID") && rewardAmount > 0) {
          const payout = referral.payoutId
            ? await tx.partnerPayout.findUnique({ where: { id: referral.payoutId } })
            : referral.rewardEarnedAt
              ? await tx.partnerPayout.findUnique({
                  where: {
                    partnerId_periodYearMonth: {
                      partnerId: referral.partnerId,
                      periodYearMonth: indiaYearMonth(referral.rewardEarnedAt),
                    },
                  },
                })
              : null;

          if (payout && ["PENDING", "FAILED"].includes(payout.status)) {
            await tx.partnerPayout.update({
              where: { id: payout.id },
              data: {
                amountRs: Math.max(0, Number(payout.amountRs) - rewardAmount),
                referralCount: Math.max(0, Number(payout.referralCount) - 1),
              },
            });
          } else if (referral.partner) {
            const marker = `Referral clawback required: ₹${rewardAmount} for refunded order ${orderId}.`;
            const existingNotes = String(referral.partner.adminNotes || "");
            if (!existingNotes.includes(marker)) {
              await tx.partner.update({
                where: { id: referral.partner.id },
                data: { adminNotes: [existingNotes, marker].filter(Boolean).join("\n").slice(-4000) },
              });
            }
          }
        } else if (referral.rewardType === "MEAL_VOUCHER" && rewardAmount > 0 && referral.partner) {
          const marker = `Referral reward review required: ${referral.rewardType} reward ${rewardAmount} for refunded order ${orderId}.`;
          const existingNotes = String(referral.partner.adminNotes || "");
          if (!existingNotes.includes(marker)) {
            await tx.partner.update({
              where: { id: referral.partner.id },
              data: { adminNotes: [existingNotes, marker].filter(Boolean).join("\n").slice(-4000) },
            });
          }
        }

        await tx.partnerReferral.update({
          where: { id: referral.id },
          data: { status: "CANCELLED" },
        });
      }, { isolationLevel: "Serializable" });
      return;
    } catch (error: unknown) {
      if (isRetryableTransaction(error) && attempt < 2) continue;
      throw error;
    }
  }
}
