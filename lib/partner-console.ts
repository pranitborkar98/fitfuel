// lib/partner-console.ts
//
// The B2B partner console's read model, lifted out of the GET handler so the
// dashboard screen can render it on the server. Same reason as lib/referrals:
// a server component should not pay for an HTTP call it already has the
// session for.

import { prisma } from "@/lib/prisma";
import type { PartnerRewardType, PartnerStatus, PartnerType, PayoutStatus, ReferralStatus } from "@prisma/client";

export type PartnerSummary = {
  id: string;
  type: PartnerType;
  status: PartnerStatus;
  name: string;
  code: string;
  rewardType: PartnerRewardType;
  rewardValueRs: number;
  refereeDiscountRs: number;
  profilePhotoUrl: string | null;
  approvedAt: string | null;
};

export type Conversion = {
  id: string;
  refereeName: string;
  orderNumber: string | null;
  orderTotal: number;
  rewardType: PartnerRewardType;
  rewardAmountRs: number;
  status: ReferralStatus;
  createdAt: string;
};

export type Payout = {
  id: string;
  periodYearMonth: string;
  amountRs: number;
  referralCount: number;
  status: PayoutStatus;
  paidAt: string | null;
  paymentRef: string | null;
};

export type PartnerConsole = {
  partner: PartnerSummary;
  stats: {
    totalConversions: number;
    totalRewardValue: number;
    pendingPayoutRs: number;
    paidPayoutRs: number;
  };
  referrals: Conversion[];
  payouts: Payout[];
};

const iso = (d: Date | null) => (d ? d.toISOString() : null);

/** Null when the viewer does not own a partner account. */
export async function getPartnerConsole(userId: string): Promise<PartnerConsole | null> {
  const partner = await prisma.partner.findUnique({
    where: { ownerUserId: userId },
    select: {
      id: true, type: true, status: true, name: true, code: true,
      rewardType: true, rewardValueRs: true, refereeDiscountRs: true,
      profilePhotoUrl: true, approvedAt: true,
    },
  });

  if (!partner) return null;

  const [referrals, payouts] = await Promise.all([
    prisma.partnerReferral.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        refereeUser: { select: { name: true } },
        refereeOrder: { select: { orderNumber: true, totalRs: true, createdAt: true } },
      },
    }),
    prisma.partnerPayout.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
      take: 24,
    }),
  ]);

  const earnedReferrals = referrals.filter(
    (referral) => referral.status === "FIRST_ORDER" || referral.status === "REWARD_PAID",
  );

  return {
    partner: {
      id: partner.id,
      type: partner.type,
      status: partner.status,
      name: partner.name,
      code: partner.code,
      rewardType: partner.rewardType,
      rewardValueRs: partner.rewardValueRs,
      refereeDiscountRs: partner.refereeDiscountRs,
      profilePhotoUrl: partner.profilePhotoUrl,
      approvedAt: iso(partner.approvedAt),
    },
    stats: {
      totalConversions: earnedReferrals.length,
      totalRewardValue: earnedReferrals.reduce((sum, referral) => sum + referral.rewardAmountRs, 0),
      pendingPayoutRs: payouts
        .filter((payout) => payout.status === "PENDING" || payout.status === "PROCESSING" || payout.status === "FAILED")
        .reduce((sum, payout) => sum + payout.amountRs, 0),
      paidPayoutRs: payouts
        .filter((payout) => payout.status === "PAID")
        .reduce((sum, payout) => sum + payout.amountRs, 0),
    },
    referrals: referrals.map((r) => ({
      id: r.id,
      refereeName: r.refereeUser?.name || "A customer",
      orderNumber: r.refereeOrder?.orderNumber || null,
      orderTotal: r.refereeOrder?.totalRs || 0,
      rewardType: r.rewardType,
      rewardAmountRs: r.rewardAmountRs,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })),
    payouts: payouts.map((p) => ({
      id: p.id,
      periodYearMonth: p.periodYearMonth,
      amountRs: p.amountRs,
      referralCount: p.referralCount,
      status: p.status,
      paidAt: iso(p.paidAt),
      paymentRef: p.paymentRef,
    })),
  };
}
