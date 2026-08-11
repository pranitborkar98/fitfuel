// lib/partner-console.ts
//
// The B2B partner console's read model, lifted out of the GET handler so the
// dashboard screen can render it on the server. Same reason as lib/referrals:
// a server component should not pay for an HTTP call it already has the
// session for.

import { prisma } from "@/lib/prisma";

export type PartnerSummary = {
  id: string;
  type: string;
  status: string;
  name: string;
  code: string;
  rewardType: string;
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
  rewardType: string;
  rewardAmountRs: number;
  status: string;
  createdAt: string;
};

export type Payout = {
  id: string;
  periodYearMonth: string;
  amountRs: number;
  referralCount: number;
  status: string;
  paidAt: string | null;
  paymentRef: string | null;
};

export type PartnerConsole = {
  partner: PartnerSummary;
  stats: {
    totalConversions: number;
    totalEarnedRs: number;
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

  return {
    partner: {
      id: partner.id,
      type: String(partner.type),
      status: String(partner.status),
      name: partner.name,
      code: partner.code,
      rewardType: String(partner.rewardType),
      rewardValueRs: partner.rewardValueRs,
      refereeDiscountRs: partner.refereeDiscountRs,
      profilePhotoUrl: partner.profilePhotoUrl,
      approvedAt: iso(partner.approvedAt),
    },
    stats: {
      totalConversions: referrals.length,
      totalEarnedRs: referrals.reduce((s, r) => s + (r.rewardAmountRs || 0), 0),
      pendingPayoutRs: payouts
        .filter((p) => p.status === "PENDING" || p.status === "PROCESSING")
        .reduce((s, p) => s + (p.amountRs || 0), 0),
      paidPayoutRs: payouts
        .filter((p) => p.status === "PAID")
        .reduce((s, p) => s + (p.amountRs || 0), 0),
    },
    referrals: referrals.map((r) => ({
      id: r.id,
      refereeName: r.refereeUser?.name || "A customer",
      orderNumber: r.refereeOrder?.orderNumber || null,
      orderTotal: r.refereeOrder?.totalRs || 0,
      rewardType: String(r.rewardType),
      rewardAmountRs: r.rewardAmountRs,
      status: String(r.status),
      createdAt: r.createdAt.toISOString(),
    })),
    payouts: payouts.map((p) => ({
      id: p.id,
      periodYearMonth: p.periodYearMonth,
      amountRs: p.amountRs,
      referralCount: p.referralCount,
      status: String(p.status),
      paidAt: iso(p.paidAt),
      paymentRef: p.paymentRef,
    })),
  };
}
