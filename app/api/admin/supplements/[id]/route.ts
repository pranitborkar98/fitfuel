// app/api/admin/supplements/[id]/route.ts
// Phase 18-2 — Per-supplement admin actions.
//   GET    → full detail (incl. links, recent clicks)
//   PATCH  → update fields
//   DELETE → soft delete (isActive=false)
//
// To add a link, POST to /api/admin/supplements/[id]/links

import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const db = prisma as any;

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const me = await requireApiRole("supplements");
  if (!me) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;

  const s = await db.supplement.findUnique({
    where: { id },
    include: {
      category: { select: { slug: true, name: true } },
      links: { orderBy: [{ sortOrder: "asc" }, { priceRs: "asc" }] },
      _count: { select: { clicks: true } },
    },
  });
  if (!s) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Recent 30-day click count by network
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const clicksByNetwork = await db.supplementClick.groupBy({
    by: ["network"],
    where: { supplementId: id, createdAt: { gte: since } },
    _count: { id: true },
  });

  return NextResponse.json({
    supplement: s,
    clicks30d: clicksByNetwork.map((g: any) => ({ network: g.network, count: g._count.id })),
  });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const me = await requireApiRole("supplements");
  if (!me) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const allowed = [
    "name", "tagline", "description", "mechanism", "dosage", "timing",
    "onsetTime", "halfLife", "form", "cyclingRequired", "cyclingProtocol",
    "warnings", "evidenceLevel", "studyCount", "priceRange", "valueRating",
    "veganFriendly", "certificationNote", "popular", "indiaAvailability",
    "indiaNote", "imageUrl", "emoji", "accentColor", "brandName",
    "isFeatured", "isActive", "sortOrder",
  ];
  const arrays = [
    "aka", "benefits", "stacksWith", "avoidWith", "sideEffects", "keyStudyFindings",
  ];

  const data: any = {};
  for (const k of allowed) if (k in body) data[k] = body[k];
  for (const k of arrays) if (k in body && Array.isArray(body[k])) data[k] = body[k];

  if (Array.isArray(body?.recommendedFor)) {
    data.recommendedFor = body.recommendedFor.map((g: string) => String(g).toUpperCase());
  }

  if (body?.categorySlug) {
    const cat = await db.supplementCategory.findUnique({ where: { slug: body.categorySlug }, select: { id: true } });
    if (cat) data.categoryId = cat.id;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  const updated = await db.supplement.update({ where: { id }, data });
  return NextResponse.json({ ok: true, supplement: { id: updated.id, slug: updated.slug, name: updated.name } });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const me = await requireApiRole("supplements");
  if (!me) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  // Soft delete — preserve click history
  await db.supplement.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
