import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { supplementClicksQuerySchema } from "@/lib/supplements-admin-validation";
import { readQuery } from "@/lib/validation/core";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const admin = await requireApiRole("supplements");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "read", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = readQuery(req, supplementClicksQuerySchema);
  if (!parsed.ok) return parsed.response;
  const days = parsed.data.days;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const where = { createdAt: { gte: since } };

  const [totalClicks, signedInClicks, uniqueUsers, topProductsRaw, topNetworksRaw, clicksForTrend] =
    await Promise.all([
      prisma.supplementClick.count({ where }),
      prisma.supplementClick.count({ where: { ...where, userId: { not: null } } }),
      prisma.supplementClick.findMany({
        where: { ...where, userId: { not: null } },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.supplementClick.groupBy({
        by: ["supplementId"],
        where,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 15,
      }),
      prisma.supplementClick.groupBy({
        by: ["network"],
        where,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.supplementClick.findMany({ where, select: { createdAt: true } }),
    ]);

  const topIds = topProductsRaw.map((row) => row.supplementId);
  const topSupplements = topIds.length
    ? await prisma.supplement.findMany({
        where: { id: { in: topIds } },
        select: { id: true, name: true, slug: true, emoji: true, accentColor: true },
      })
    : [];
  const supplementById = new Map(topSupplements.map((supplement) => [supplement.id, supplement]));
  const topProducts = topProductsRaw.map((row) => {
    const supplement = supplementById.get(row.supplementId);
    return {
      supplementId: row.supplementId,
      name: supplement?.name ?? "Removed supplement",
      slug: supplement?.slug ?? null,
      emoji: supplement?.emoji ?? null,
      accentColor: supplement?.accentColor ?? null,
      clicks: row._count.id,
    };
  });
  const topNetworks = topNetworksRaw.map((row) => ({ network: row.network, clicks: row._count.id }));

  const dailyBuckets = new Map<string, number>();
  for (let i = 0; i < days; i += 1) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    dailyBuckets.set(date, 0);
  }
  for (const click of clicksForTrend) {
    const date = click.createdAt.toISOString().slice(0, 10);
    if (dailyBuckets.has(date)) dailyBuckets.set(date, (dailyBuckets.get(date) ?? 0) + 1);
  }
  const dailyTrend = [...dailyBuckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, clicks]) => ({ date, clicks }));

  return NextResponse.json({
    days,
    totalClicks,
    signedInClicks,
    uniqueUsers: uniqueUsers.length,
    topProducts,
    topNetworks,
    dailyTrend,
  });
}
