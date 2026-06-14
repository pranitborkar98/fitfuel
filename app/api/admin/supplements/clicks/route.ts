// app/api/admin/supplements/clicks/route.ts
// Phase 18-2 — Click analytics for the admin dashboard.
//
// GET ?days=7  → returns:
//   {
//     totalClicks, uniqueUsers, signedInClicks,
//     topProducts: [{ supplementId, name, clicks }],
//     topNetworks: [{ network, clicks }],
//     dailyTrend:  [{ date: "2026-06-08", clicks: N }, ...]
//   }

import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const db = prisma as any;

export async function GET(req: NextRequest) {
  const me = await requireApiRole("supplements");
  if (!me) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const days = Math.max(1, Math.min(90, Number(url.searchParams.get("days") || 7)));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    totalClicks,
    signedInClicks,
    uniqueUserSet,
    topProductsRaw,
    topNetworksRaw,
    clicksForTrend,
  ] = await Promise.all([
    db.supplementClick.count({ where: { createdAt: { gte: since } } }),
    db.supplementClick.count({ where: { createdAt: { gte: since }, userId: { not: null } } }),
    db.supplementClick.findMany({
      where: { createdAt: { gte: since }, userId: { not: null } },
      distinct: ["userId"],
      select: { userId: true },
    }),
    db.supplementClick.groupBy({
      by: ["supplementId"],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 15,
    }),
    db.supplementClick.groupBy({
      by: ["network"],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    db.supplementClick.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  // Look up names for top products
  const topIds = topProductsRaw.map((r: any) => r.supplementId);
  const topSupps = topIds.length
    ? await db.supplement.findMany({
        where: { id: { in: topIds } },
        select: { id: true, name: true, slug: true, emoji: true, accentColor: true },
      })
    : [];
  const suppById: Record<string, any> = {};
  topSupps.forEach((s: any) => (suppById[s.id] = s));

  const topProducts = topProductsRaw.map((r: any) => ({
    supplementId: r.supplementId,
    name: suppById[r.supplementId]?.name || "(deleted)",
    slug: suppById[r.supplementId]?.slug,
    emoji: suppById[r.supplementId]?.emoji,
    accentColor: suppById[r.supplementId]?.accentColor,
    clicks: r._count.id,
  }));

  const topNetworks = topNetworksRaw.map((r: any) => ({
    network: r.network,
    clicks: r._count.id,
  }));

  // Daily trend
  const dailyBuckets: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyBuckets[key] = 0;
  }
  for (const c of clicksForTrend) {
    const key = new Date(c.createdAt).toISOString().slice(0, 10);
    if (key in dailyBuckets) dailyBuckets[key]++;
  }
  const dailyTrend = Object.entries(dailyBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, clicks]) => ({ date, clicks }));

  return NextResponse.json({
    days,
    totalClicks,
    signedInClicks,
    uniqueUsers: uniqueUserSet.length,
    topProducts,
    topNetworks,
    dailyTrend,
  });
}
