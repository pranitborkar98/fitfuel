// Supplement catalogue list and creation. OWNER/ADMIN only.

import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { supplementCreateSchema, supplementListQuerySchema } from "@/lib/supplements-admin-validation";
import { readJson, readQuery } from "@/lib/validation/core";
import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const admin = await requireApiRole("supplements");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "read", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = readQuery(req, supplementListQuerySchema);
  if (!parsed.ok) return parsed.response;
  const query = parsed.data;
  const where: Prisma.SupplementWhereInput = {
    ...(query.includeInactive === "1" ? {} : { isActive: true }),
    ...(query.category ? { category: { slug: query.category } } : {}),
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: "insensitive" } },
            { slug: { contains: query.q, mode: "insensitive" } },
            { tagline: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [supplements, categories] = await Promise.all([
    prisma.supplement.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 500,
      include: {
        category: { select: { slug: true, name: true, emoji: true } },
        _count: { select: { links: true, clicks: true } },
      },
    }),
    prisma.supplementCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, emoji: true },
    }),
  ]);

  return NextResponse.json({
    supplements: supplements.map((supplement) => ({
      id: supplement.id,
      slug: supplement.slug,
      name: supplement.name,
      tagline: supplement.tagline,
      emoji: supplement.emoji,
      accentColor: supplement.accentColor,
      categorySlug: supplement.category.slug,
      categoryName: supplement.category.name,
      categoryEmoji: supplement.category.emoji,
      recommendedFor: supplement.recommendedFor,
      isActive: supplement.isActive,
      isFeatured: supplement.isFeatured,
      sortOrder: supplement.sortOrder,
      linkCount: supplement._count.links,
      clickCount: supplement._count.clicks,
      priceRange: supplement.priceRange,
    })),
    categories,
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireApiRole("supplements");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = await readJson(req, supplementCreateSchema);
  if (!parsed.ok) return parsed.response;
  const input = parsed.data;

  try {
    const category = await prisma.supplementCategory.findUnique({
      where: { slug: input.categorySlug },
      select: { id: true, isActive: true },
    });
    if (!category?.isActive) return NextResponse.json({ error: "Choose an active supplement category." }, { status: 400 });
    const existing = await prisma.supplement.findUnique({ where: { slug: input.slug }, select: { id: true } });
    if (existing) return NextResponse.json({ error: "A supplement with that slug already exists." }, { status: 409 });

    const created = await prisma.supplement.create({
      data: {
        slug: input.slug,
        name: input.name,
        categoryId: category.id,
        tagline: input.tagline,
        description: input.description,
        benefits: input.benefits,
        dosage: input.dosage,
        priceRange: input.priceRange,
        emoji: input.emoji,
        accentColor: input.accentColor,
        recommendedFor: input.recommendedFor,
        isActive: false,
        aka: [],
        stacksWith: [],
        avoidWith: [],
        sideEffects: [],
        keyStudyFindings: [],
      },
      select: { id: true, slug: true, name: true },
    });
    return NextResponse.json({ ok: true, supplement: created });
  } catch (error: unknown) {
    console.error("[admin/supplements] create failed", error);
    return NextResponse.json({ error: "Supplement creation failed." }, { status: 500 });
  }
}
