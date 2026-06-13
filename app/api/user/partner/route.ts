// app/api/user/partner/route.ts
// Phase 17B — B2B partner dashboard data.
// GET: returns the Partner owned by the logged-in user + their referrals + payouts.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const db = prisma as any;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const partner = await db.partner.findUnique({
    where: { ownerUserId: userId },
    select: {
      id: true, type: true, status: true, name: true, code: true,
      rewardType: true, rewardValueRs: true, refereeDiscountRs: true,
      bio: true, specialty: true, profilePhotoUrl: true,
      gymAddress: true, clinicName: true, companyLogoUrl: true,
      createdAt: true, approvedAt: true,
    },
  });

  if (!partner) {
    return NextResponse.json({ partner: null });
  }

  const [referrals, payouts] = await Promise.all([
    db.partnerReferral.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        refereeUser: { select: { name: true } },
        refereeOrder: { select: { orderNumber: true, totalRs: true, createdAt: true } },
      },
    }),
    db.partnerPayout.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
      take: 24,
    }),
  ]);

  const totalConversions = referrals.length;
  const totalEarnedRs = referrals.reduce((s: number, r: any) => s + (r.rewardAmountRs || 0), 0);
  const pendingPayoutRs = payouts
    .filter((p: any) => p.status === "PENDING" || p.status === "PROCESSING")
    .reduce((s: number, p: any) => s + (p.amountRs || 0), 0);
  const paidPayoutRs = payouts
    .filter((p: any) => p.status === "PAID")
    .reduce((s: number, p: any) => s + (p.amountRs || 0), 0);

  return NextResponse.json({
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
      approvedAt: partner.approvedAt,
    },
    stats: {
      totalConversions,
      totalEarnedRs,
      pendingPayoutRs,
      paidPayoutRs,
    },
    referrals: referrals.map((r: any) => ({
      id: r.id,
      refereeName: r.refereeUser?.name || "A customer",
      orderNumber: r.refereeOrder?.orderNumber || null,
      orderTotal: r.refereeOrder?.totalRs || 0,
      rewardType: r.rewardType,
      rewardAmountRs: r.rewardAmountRs,
      status: r.status,
      createdAt: r.createdAt,
    })),
    payouts: payouts.map((p: any) => ({
      id: p.id,
      periodYearMonth: p.periodYearMonth,
      amountRs: p.amountRs,
      referralCount: p.referralCount,
      status: p.status,
      paidAt: p.paidAt,
      paymentRef: p.paymentRef,
    })),
  });
}
