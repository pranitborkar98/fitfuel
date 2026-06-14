// app/api/admin/supplements/route.ts
// Phase 18-2 — Admin GET: list all supplements with link counts + click counts.
//                Admin POST: create a new supplement.

import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const db = prisma as any;

export async function GET(req: NextRequest) {
  const me = await requireApiRole("supplements");
  if (!me) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const categorySlug = url.searchParams.get("category") || "";
  const includeInactive = url.searchParams.get("includeInactive") === "1";

  const where: any = {};
  if (!includeInactive) where.isActive = true;
  if (categorySlug) where.category = { slug: categorySlug };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { tagline: { contains: q, mode: "insensitive" } },
    ];
  }

  const [supplements, categories] = await Promise.all([
    db.supplement.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        category: { select: { slug: true, name: true, emoji: true } },
        _count: { select: { links: true, clicks: true } },
      },
    }),
    db.supplementCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, emoji: true },
    }),
  ]);

  return NextResponse.json({
    supplements: supplements.map((s: any) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      tagline: s.tagline,
      emoji: s.emoji,
      accentColor: s.accentColor,
      categorySlug: s.category?.slug,
      categoryName: s.category?.name,
      categoryEmoji: s.category?.emoji,
      recommendedFor: s.recommendedFor || [],
      isActive: s.isActive,
      isFeatured: s.isFeatured,
      sortOrder: s.sortOrder,
      linkCount: s._count?.links ?? 0,
      clickCount: s._count?.clicks ?? 0,
      priceRange: s.priceRange,
    })),
    categories,
  });
}

export async function POST(req: NextRequest) {
  const me = await requireApiRole("supplements");
  if (!me) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const slug = String(body?.slug || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const name = String(body?.name || "").trim();
  const categorySlug = String(body?.categorySlug || "").trim();

  if (!slug || !name || !categorySlug) {
    return NextResponse.json({ error: "slug, name, and categorySlug required" }, { status: 400 });
  }

  const category = await db.supplementCategory.findUnique({ where: { slug: categorySlug }, select: { id: true } });
  if (!category) return NextResponse.json({ error: "Unknown category" }, { status: 400 });

  const existing = await db.supplement.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "A supplement with that slug already exists" }, { status: 409 });

  const data: any = {
    slug, name,
    categoryId: category.id,
    tagline: body?.tagline || null,
    description: body?.description || null,
    benefits: Array.isArray(body?.benefits) ? body.benefits : [],
    dosage: body?.dosage || null,
    priceRange: body?.priceRange || null,
    emoji: body?.emoji || null,
    accentColor: body?.accentColor || null,
    recommendedFor: Array.isArray(body?.recommendedFor)
      ? body.recommendedFor.map((g: string) => g.toUpperCase())
      : [],
    isActive: true,
  };

  const created = await db.supplement.create({ data });
  return NextResponse.json({ ok: true, supplement: { id: created.id, slug: created.slug, name: created.name } });
}
