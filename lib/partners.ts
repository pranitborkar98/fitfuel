// lib/partners.ts
// Phase 17A \u2014 shared helpers for the partner/referral system.
// - generateReferralCode: per-user P2P code (FF-NAME-XXXX)
// - resolveReferralCode: looks up a code (Partner table OR User.referralCode)
// - processReferralReward: called from PayU/COD success after order CONFIRMED
// - applyCreditAtCheckout: deducts user credit balance against an order total
// - recordCreditChange: writes CreditLedger row + updates User.creditsBalanceRs

import { prisma } from "@/lib/prisma";
import { fireNotification } from "@/lib/notify";

const db = prisma as any;

/** Generate a fresh referral code like FF-PRANIT-X3K7. */
export async function generateUniqueReferralCode(displayName: string | null | undefined): Promise<string> {
  const base = (displayName || "USER")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 8) || "USER";
  for (let i = 0; i < 8; i++) {
    const suffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) || "X3K7";
    const code = `FF-${base}-${suffix}`;
    const exists = await db.user.findFirst({
      where: { OR: [{ referralCode: code }, { ownedPartner: { code } }] },
      select: { id: true },
    });
    if (!exists) return code;
  }
  return `FF-${base}-${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

/** Lazy-create the user's referral code on first read. */
export async function getOrCreateUserReferralCode(userId: string): Promise<string> {
  const u = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, referralCode: true },
  });
  if (!u) throw new Error("User not found");
  if (u.referralCode) return u.referralCode;
  const code = await generateUniqueReferralCode(u.name);
  await db.user.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
}

export type ResolvedReferral =
  | { kind: "PARTNER"; partner: any }
  | { kind: "USER"; user: any }
  | null;

/**
 * Look up a referral code. Returns the active Partner first, or a User with this
 * code in their `referralCode` field. Inactive partners return null so attribution
 * silently skips.
 */
export async function resolveReferralCode(code: string): Promise<ResolvedReferral> {
  if (!code) return null;
  const partner = await db.partner.findUnique({ where: { code } });
  if (partner && partner.status === "ACTIVE") return { kind: "PARTNER", partner };
  const user = await db.user.findFirst({ where: { referralCode: code }, select: { id: true, name: true } });
  if (user) return { kind: "USER", user };
  return null;
}

/**
 * Apply user's credit balance against an order total. Returns the discounted
 * amount and the credit actually used. Writes a CreditLedger entry.
 *
 * Call this at checkout BEFORE creating the order so the discount reflects in
 * Order.totalRs. The order is then linked back via refOrderId.
 */
export async function applyCreditAtCheckout(
  userId: string,
  subtotalRs: number
): Promise<{ creditAppliedRs: number; newTotalRs: number }> {
  const u = await db.user.findUnique({
    where: { id: userId },
    select: { creditsBalanceRs: true },
  });
  const bal = u?.creditsBalanceRs ?? 0;
  if (bal <= 0) return { creditAppliedRs: 0, newTotalRs: subtotalRs };
  const used = Math.min(bal, subtotalRs);
  // We DO NOT decrement here \u2014 the actual deduction happens at order CONFIRMED
  // via recordCreditChange. This function just reports what WILL be applied.
  return { creditAppliedRs: used, newTotalRs: subtotalRs - used };
}

/**
 * Commit a credit change to the ledger and update the cached balance.
 * deltaRs positive = earn, negative = spend.
 */
export async function recordCreditChange(
  userId: string,
  deltaRs: number,
  reason: string,
  refs?: { refReferralId?: string; refOrderId?: string }
): Promise<number> {
  // Use a transaction to avoid races
  const result = await db.$transaction(async (tx: any) => {
    await tx.creditLedger.create({
      data: {
        userId,
        deltaRs,
        reason,
        refReferralId: refs?.refReferralId || null,
        refOrderId: refs?.refOrderId || null,
      },
    });
    const updated = await tx.user.update({
      where: { id: userId },
      data: { creditsBalanceRs: { increment: deltaRs } },
      select: { creditsBalanceRs: true },
    });
    return updated.creditsBalanceRs;
  });
  return result;
}

/**
 * Process the referral reward when an order reaches CONFIRMED status.
 * Idempotent \u2014 if a PartnerReferral already exists for this order, no-op.
 * Reads attribution from order.referralAttribution OR user.referredByPartnerCode.
 */
export async function processReferralReward(orderId: string): Promise<void> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      userId: true,
      totalRs: true,
      referralAttribution: true,
      user: { select: { id: true, name: true, email: true, referredByPartnerCode: true } },
    },
  });
  if (!order) return;

  // Idempotency: already processed?
  const existing = await db.partnerReferral.findFirst({
    where: { refereeOrderId: orderId },
    select: { id: true },
  });
  if (existing) return;

  const code =
    order.referralAttribution || order.user?.referredByPartnerCode || null;
  if (!code) return;

  // Self-referral guard: if the user's own code matches, bail.
  const selfRef = await db.user.findFirst({
    where: { id: order.userId, referralCode: code },
    select: { id: true },
  });
  if (selfRef) return;

  const resolved = await resolveReferralCode(code);
  if (!resolved) return;

  if (resolved.kind === "USER") {
    // Customer P2P: referrer gets credit.
    const REFERRER_REWARD_RS = 500;
    const referrer = resolved.user;
    const refRow = await db.partnerReferral.create({
      data: {
        partnerId: await ensureCustomerPartner(referrer.id, referrer.name),
        refereeUserId: order.userId,
        refereeOrderId: order.id,
        status: "FIRST_ORDER",
        rewardType: "CREDIT",
        rewardAmountRs: REFERRER_REWARD_RS,
        rewardEarnedAt: new Date(),
      },
    });
    await recordCreditChange(
      referrer.id,
      REFERRER_REWARD_RS,
      `referral:${order.orderNumber}`,
      { refReferralId: refRow.id, refOrderId: order.id }
    );
    fireNotification({
      userId: referrer.id,
      templateKey: "partner_referral_earned",
      vars: {
        refereeName: order.user?.name || "your friend",
        rewardLabel: `\u20B9${REFERRER_REWARD_RS} added to your account credit`,
        rewardAmount: String(REFERRER_REWARD_RS),
      },
    });
    return;
  }

  // resolved.kind === "PARTNER"
  const partner = resolved.partner;
  const rewardAmount = partner.rewardValueRs || 0;
  const refRow = await db.partnerReferral.create({
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

  // Reward processing by type
  if (partner.rewardType === "CREDIT" && partner.ownerUserId) {
    // Treat partner-as-credit-recipient (rare, but supported)
    await recordCreditChange(
      partner.ownerUserId,
      rewardAmount,
      `partner:${partner.code}:${order.orderNumber}`,
      { refReferralId: refRow.id, refOrderId: order.id }
    );
  } else if (partner.rewardType === "CASH") {
    // Accrue into a monthly PartnerPayout (PENDING)
    const period = new Date().toISOString().slice(0, 7); // YYYY-MM
    await db.partnerPayout.upsert({
      where: { partnerId_periodYearMonth: { partnerId: partner.id, periodYearMonth: period } },
      create: {
        partnerId: partner.id,
        periodYearMonth: period,
        amountRs: rewardAmount,
        referralCount: 1,
        status: "PENDING",
      },
      update: {
        amountRs: { increment: rewardAmount },
        referralCount: { increment: 1 },
      },
    });
    if (partner.ownerUserId) {
      fireNotification({
        userId: partner.ownerUserId,
        templateKey: "partner_referral_earned",
        vars: {
          refereeName: order.user?.name || "a new customer",
          rewardLabel: `\u20B9${rewardAmount} added to your next payout`,
          rewardAmount: String(rewardAmount),
        },
      });
    }
  } else if (partner.rewardType === "MEAL_VOUCHER") {
    // No money/credit movement \u2014 tracked via PartnerReferral count only.
    // Admin distributes meals out-of-band based on monthly reports.
    if (partner.ownerUserId) {
      fireNotification({
        userId: partner.ownerUserId,
        templateKey: "partner_referral_earned",
        vars: {
          refereeName: order.user?.name || "a new customer",
          rewardLabel: `${rewardAmount} meal voucher(s) earned`,
          rewardAmount: String(rewardAmount),
        },
      });
    }
  }
  // DISCOUNT_ONLY and HYBRID: discount already applied at checkout, nothing else to do here.
}

/**
 * For Customer P2P: every user implicitly is a Partner of type CUSTOMER.
 * We lazy-create the Partner row on first reward to keep the table light.
 */
async function ensureCustomerPartner(userId: string, name: string | null): Promise<string> {
  const existing = await db.partner.findUnique({
    where: { ownerUserId: userId },
    select: { id: true },
  });
  if (existing) return existing.id;

  // ensure user has a referralCode
  const u = await db.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  let code = u?.referralCode;
  if (!code) {
    code = await generateUniqueReferralCode(name);
    await db.user.update({ where: { id: userId }, data: { referralCode: code } });
  }

  const partner = await db.partner.create({
    data: {
      type: "CUSTOMER",
      status: "ACTIVE",
      name: name || "Customer",
      ownerUserId: userId,
      code,
      rewardType: "CREDIT",
      rewardValueRs: 500,
      refereeDiscountRs: 200,
      approvedAt: new Date(),
    },
    select: { id: true },
  });
  return partner.id;
}
