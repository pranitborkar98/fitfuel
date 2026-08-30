import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  supplementIdSchema,
  supplementPatchSchema,
  supplementPublishingError,
} from "@/lib/supplements-admin-validation";
import { readJson } from "@/lib/validation/core";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

function errorCode(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : null;
}

async function supplementId(ctx: Ctx) {
  const parsed = supplementIdSchema.safeParse((await ctx.params).id);
  return parsed.success ? parsed.data : null;
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const admin = await requireApiRole("supplements");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "read", admin.id);
  if (!rl.ok) return rl.response;

  const id = await supplementId(ctx);
  if (!id) return NextResponse.json({ error: "Invalid supplement id." }, { status: 400 });

  const supplement = await prisma.supplement.findUnique({
    where: { id },
    include: {
      category: { select: { slug: true, name: true, isActive: true } },
      links: { orderBy: [{ sortOrder: "asc" }, { priceRs: "asc" }] },
      _count: { select: { clicks: true } },
    },
  });
  if (!supplement) return NextResponse.json({ error: "Supplement not found." }, { status: 404 });

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const clicksByNetwork = await prisma.supplementClick.groupBy({
    by: ["network"],
    where: { supplementId: id, createdAt: { gte: since } },
    _count: { id: true },
  });

  return NextResponse.json({
    supplement,
    clicks30d: clicksByNetwork.map((group) => ({ network: group.network, count: group._count.id })),
  });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = await requireApiRole("supplements");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const id = await supplementId(ctx);
  if (!id) return NextResponse.json({ error: "Invalid supplement id." }, { status: 400 });
  const parsed = await readJson(req, supplementPatchSchema, { maxBytes: 128 * 1024 });
  if (!parsed.ok) return parsed.response;

  const { categorySlug, ...fields } = parsed.data;
  const current = await prisma.supplement.findUnique({
    where: { id },
    select: {
      isActive: true,
      tagline: true,
      description: true,
      mechanism: true,
      benefits: true,
      dosage: true,
      warnings: true,
      evidenceLevel: true,
      studyCount: true,
      keyStudyFindings: true,
      priceRange: true,
      indiaAvailability: true,
      indiaNote: true,
      recommendedFor: true,
      category: { select: { isActive: true } },
    },
  });
  if (!current) return NextResponse.json({ error: "Supplement not found." }, { status: 404 });
  let categoryId: string | undefined;
  let categoryActive = current.category.isActive;
  if (categorySlug) {
    const category = await prisma.supplementCategory.findUnique({
      where: { slug: categorySlug },
      select: { id: true, isActive: true },
    });
    if (!category?.isActive) {
      return NextResponse.json({ error: "Choose an active supplement category." }, { status: 400 });
    }
    categoryId = category.id;
    categoryActive = category.isActive;
  }

  if (fields.isActive === true && !current.isActive) {
    const publishingError = supplementPublishingError({
      categoryActive,
      tagline: fields.tagline !== undefined ? fields.tagline : current.tagline,
      description: fields.description !== undefined ? fields.description : current.description,
      mechanism: fields.mechanism !== undefined ? fields.mechanism : current.mechanism,
      benefits: fields.benefits ?? current.benefits,
      dosage: fields.dosage !== undefined ? fields.dosage : current.dosage,
      warnings: fields.warnings !== undefined ? fields.warnings : current.warnings,
      evidenceLevel: fields.evidenceLevel !== undefined ? fields.evidenceLevel : current.evidenceLevel,
      studyCount: fields.studyCount !== undefined ? fields.studyCount : current.studyCount,
      keyStudyFindings: fields.keyStudyFindings ?? current.keyStudyFindings,
      priceRange: fields.priceRange !== undefined ? fields.priceRange : current.priceRange,
      indiaAvailability: fields.indiaAvailability !== undefined ? fields.indiaAvailability : current.indiaAvailability,
      indiaNote: fields.indiaNote !== undefined ? fields.indiaNote : current.indiaNote,
      recommendedFor: fields.recommendedFor ?? current.recommendedFor,
    });
    if (publishingError) return NextResponse.json({ error: publishingError }, { status: 409 });
  }

  try {
    const updated = await prisma.supplement.update({
      where: { id },
      data: { ...fields, ...(categoryId ? { categoryId } : {}) },
      select: { id: true, slug: true, name: true, isActive: true },
    });
    return NextResponse.json({ ok: true, supplement: updated });
  } catch (error: unknown) {
    if (errorCode(error) === "P2025") {
      return NextResponse.json({ error: "Supplement not found." }, { status: 404 });
    }
    console.error("[admin/supplements] update failed", error);
    return NextResponse.json({ error: "Supplement update failed." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const admin = await requireApiRole("supplements");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const id = await supplementId(ctx);
  if (!id) return NextResponse.json({ error: "Invalid supplement id." }, { status: 400 });
  const result = await prisma.supplement.updateMany({ where: { id }, data: { isActive: false } });
  if (result.count === 0) return NextResponse.json({ error: "Supplement not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
