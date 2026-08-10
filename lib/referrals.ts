// lib/referrals.ts
//
// The referral summary, in one place. It used to live inside the GET handler,
// which meant the only way to read it was an HTTP round trip, so the screen
// booted empty and filled in later. DESIGN.md §7 wants server components by
// default; a server component cannot call its own API route without paying for
// a request it already has the session for. So the query moves here and both
// callers use it: the route for anything client-side, the page for first paint.

// User.creditsBalanceRs, Partner.ownerUserId and PartnerReferral.rewardAmountRs
// are all in schema.prisma, so the generated client types them. The `prisma as
// any` the old handler used was not buying anything, and it was hiding the
// createdAt shape that made the client re-parse dates.

import { prisma } from "@/lib/prisma";
import { getOrCreateUserReferralCode } from "@/lib/partners";

export type Referee = {
  id: string;
  refereeName: string;
  orderNumber: string | null;
  rewardAmountRs: number;
  status: string;
  createdAt: string;
};

export type ReferralSummary = {
  code: string;
  creditsBalanceRs: number;
  referees: Referee[];
  totalEarnedRs: number;
  name: string;
};

/** Referees arrive through the Partner row this user owns, lazy created on the
 *  first reward, so a user with no rewards yet has no partner and no referees. */
export async function getReferralSummary(userId: string): Promise<ReferralSummary> {
  const code = await getOrCreateUserReferralCode(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditsBalanceRs: true, name: true },
  });

  const ownedPartner = await prisma.partner.findUnique({
    where: { ownerUserId: userId },
    select: { id: true },
  });

  let referees: Referee[] = [];
  let totalEarnedRs = 0;

  if (ownedPartner?.id) {
    const rows = await prisma.partnerReferral.findMany({
      where: { partnerId: ownedPartner.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        refereeUser: { select: { name: true } },
        refereeOrder: { select: { orderNumber: true, totalRs: true, createdAt: true } },
      },
    });

    referees = rows.map((r) => ({
      id: r.id,
      refereeName: r.refereeUser?.name || "A friend",
      orderNumber: r.refereeOrder?.orderNumber || null,
      rewardAmountRs: r.rewardAmountRs,
      status: String(r.status),
      createdAt: r.createdAt.toISOString(),
    }));

    totalEarnedRs = rows.reduce((s, r) => s + (r.rewardAmountRs || 0), 0);
  }

  return {
    code,
    creditsBalanceRs: user?.creditsBalanceRs ?? 0,
    referees,
    totalEarnedRs,
    name: user?.name || "",
  };
}
