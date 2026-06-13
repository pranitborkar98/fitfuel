// app/api/user/referrals/route.ts
// Phase 17B — Customer P2P referrals data.
// GET: returns { code, credits, referees: [...], totalEarnedRs }

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateUserReferralCode } from "@/lib/partners";

const db = prisma as any;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Make sure they have a code (lazy creates if missing)
  const code = await getOrCreateUserReferralCode(userId);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { creditsBalanceRs: true, name: true },
  });

  // Referees come via the Partner row this user owns (lazy-created on first reward).
  const ownedPartner = await db.partner.findUnique({
    where: { ownerUserId: userId },
    select: { id: true },
  });

  let referees: any[] = [];
  let totalEarnedRs = 0;
  if (ownedPartner?.id) {
    const rows = await db.partnerReferral.findMany({
      where: { partnerId: ownedPartner.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        refereeUser: { select: { name: true } },
        refereeOrder: { select: { orderNumber: true, totalRs: true, createdAt: true } },
      },
    });
    referees = rows.map((r: any) => ({
      id: r.id,
      refereeName: r.refereeUser?.name || "A friend",
      orderNumber: r.refereeOrder?.orderNumber || null,
      rewardAmountRs: r.rewardAmountRs,
      status: r.status,
      createdAt: r.createdAt,
    }));
    totalEarnedRs = rows.reduce((s: number, r: any) => s + (r.rewardAmountRs || 0), 0);
  }

  return NextResponse.json({
    code,
    creditsBalanceRs: user?.creditsBalanceRs ?? 0,
    referees,
    totalEarnedRs,
    name: user?.name || "",
  });
}
