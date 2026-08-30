// app/api/admin/coupons/route.ts
// R-PRICE-c (Decision #193) — coupon CRUD for the admin. Coupons surface (OWNER/ADMIN).
// GET  → list all coupons + redemption counts.
// POST { action, ... }  action: 'create' | 'update' | 'toggle' | 'delete'.

import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";

export const dynamic = "force-dynamic";

const DISCOUNT_TYPES = ["PERCENT", "FLAT", "FREE_DELIVERY"] as const;
const couponRequestSchema = z.object({
  action: z.enum(["create", "update", "toggle", "delete"]),
  id: z.string().trim().max(60).optional(),
  code: z.string().trim().max(80).optional(),
  discountType: z.enum(DISCOUNT_TYPES).optional(),
  value: z.union([z.string().max(20), z.number().finite()]).optional(),
  maxDiscountRs: z.union([z.string().max(20), z.number().finite(), z.null()]).optional(),
  minOrderRs: z.union([z.string().max(20), z.number().finite(), z.null()]).optional(),
  appliesTo: z.string().trim().max(80).optional(),
  firstOrderOnly: z.boolean().optional(),
  usageLimitGlobal: z.union([z.string().max(20), z.number().finite(), z.null()]).optional(),
  usageLimitPerUser: z.union([z.string().max(20), z.number().finite(), z.null()]).optional(),
  validFrom: z.string().trim().max(40).optional().nullable(),
  validUntil: z.string().trim().max(40).optional().nullable(),
  stackable: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).strict();

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}
function intOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
}
function dateOrNull(v: unknown, endOfDay = false): Date | null {
  if (!v) return null;
  if (typeof v !== "string" && typeof v !== "number" && !(v instanceof Date)) return null;
  const dateOnly = typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
  const d = dateOnly
    ? new Date(`${v}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}+05:30`)
    : new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function buildData(d: z.infer<typeof couponRequestSchema>, creating: boolean) {
  const discountType = d.discountType ?? "PERCENT";
  const value = discountType === "FREE_DELIVERY" ? 0 : intOrNull(d.value) ?? 0;
  return {
    discountType,
    value,
    maxDiscountRs: intOrNull(d.maxDiscountRs),
    minOrderRs: intOrNull(d.minOrderRs),
    appliesTo: str(d.appliesTo).toUpperCase() || "ALL",
    firstOrderOnly: !!d.firstOrderOnly,
    usageLimitGlobal: intOrNull(d.usageLimitGlobal),
    usageLimitPerUser: intOrNull(d.usageLimitPerUser) ?? 1,
    validFrom: dateOrNull(d.validFrom) ?? (creating ? new Date() : null),
    validUntil: dateOrNull(d.validUntil, true),
    stackable: !!d.stackable,
    isActive: d.isActive !== false,
  };
}

function dataError(
  body: z.infer<typeof couponRequestSchema>,
  data: ReturnType<typeof buildData>,
): string | null {
  if (body.validFrom && !dateOrNull(body.validFrom)) return "Start date is invalid.";
  if (body.validUntil && !dateOrNull(body.validUntil, true)) return "End date is invalid.";
  if (data.validFrom && data.validUntil && data.validUntil < data.validFrom) return "End date must be after the start date.";
  if (!/^[A-Z0-9_-]{2,80}$/.test(data.appliesTo)) return "Applies-to must be ALL, DIGITAL, PHYSICAL or a plan slug.";
  if (data.discountType === "PERCENT" && (data.value < 1 || data.value > 100)) return "Percent value must be 1–100.";
  if (data.discountType === "FLAT" && (data.value < 1 || data.value > 1_000_000)) return "Flat value must be between ₹1 and ₹10,00,000.";
  if (data.maxDiscountRs !== null && data.maxDiscountRs < 1) return "Maximum discount must be at least ₹1.";
  if (data.minOrderRs !== null && data.minOrderRs < 0) return "Minimum order cannot be negative.";
  if (data.usageLimitGlobal !== null && data.usageLimitGlobal < 1) return "Global usage limit must be at least 1.";
  if (data.usageLimitPerUser !== null && data.usageLimitPerUser < 1) return "Per-user usage limit must be at least 1.";
  return null;
}

export async function GET(req: NextRequest) {
  const admin = await requireApiRole("coupons");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "read", admin.id);
  if (!rl.ok) return rl.response;

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redemptions: true } } },
  });

  return NextResponse.json({
    coupons: coupons.map((c) => ({
      id: c.id,
      code: c.code,
      discountType: c.discountType,
      value: c.value,
      maxDiscountRs: c.maxDiscountRs,
      minOrderRs: c.minOrderRs,
      appliesTo: c.appliesTo,
      firstOrderOnly: c.firstOrderOnly,
      usageLimitGlobal: c.usageLimitGlobal,
      usageLimitPerUser: c.usageLimitPerUser,
      validFrom: c.validFrom,
      validUntil: c.validUntil,
      stackable: c.stackable,
      source: c.source,
      isActive: c.isActive,
      redemptions: c._count?.redemptions ?? 0,
      createdAt: c.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireApiRole("coupons");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = await readJson(req, couponRequestSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;
  const action = body.action;

  try {
    if (action === "create") {
      const code = str(body.code).toUpperCase().replace(/\s+/g, "");
      if (!/^[A-Z0-9_-]{3,40}$/.test(code)) {
        return NextResponse.json({ error: "Code must be 3–40 letters, numbers, dashes or underscores." }, { status: 400 });
      }
      const exists = await prisma.coupon.findUnique({ where: { code } });
      if (exists) return NextResponse.json({ error: "A coupon with that code already exists." }, { status: 409 });

      const data = buildData(body, true);
      const invalid = dataError(body, data);
      if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
      const created = await prisma.coupon.create({
        data: { code, ...data, source: "MANUAL" },
      });
      return NextResponse.json({ ok: true, id: created.id });
    }

    if (action === "update") {
      const id = str(body.id);
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      const existing = await prisma.coupon.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
      const merged: z.infer<typeof couponRequestSchema> = {
        action: "update",
        id,
        discountType: body.discountType ?? existing.discountType,
        value: body.value ?? existing.value,
        maxDiscountRs: body.maxDiscountRs === undefined ? existing.maxDiscountRs : body.maxDiscountRs,
        minOrderRs: body.minOrderRs === undefined ? existing.minOrderRs : body.minOrderRs,
        appliesTo: body.appliesTo ?? existing.appliesTo,
        firstOrderOnly: body.firstOrderOnly ?? existing.firstOrderOnly,
        usageLimitGlobal: body.usageLimitGlobal === undefined ? existing.usageLimitGlobal : body.usageLimitGlobal,
        usageLimitPerUser: body.usageLimitPerUser === undefined ? existing.usageLimitPerUser : body.usageLimitPerUser,
        validFrom: body.validFrom === undefined ? existing.validFrom?.toISOString() ?? null : body.validFrom,
        validUntil: body.validUntil === undefined ? existing.validUntil?.toISOString() ?? null : body.validUntil,
        stackable: body.stackable ?? existing.stackable,
        isActive: body.isActive ?? existing.isActive,
      };
      const data = buildData(merged, false);
      const invalid = dataError(merged, data);
      if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
      await prisma.coupon.update({ where: { id }, data });
      return NextResponse.json({ ok: true });
    }

    if (action === "toggle") {
      const id = str(body.id);
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      if (body.isActive === undefined) {
        return NextResponse.json({ error: "Choose whether the coupon should be active." }, { status: 400 });
      }
      const updated = await prisma.coupon.updateMany({ where: { id }, data: { isActive: body.isActive } });
      if (updated.count !== 1) return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
      return NextResponse.json({ ok: true, isActive: body.isActive });
    }

    if (action === "delete") {
      const id = str(body.id);
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      const used = await prisma.couponRedemption.count({ where: { couponId: id } });
      if (used > 0) {
        // Preserve history — never hard-delete a redeemed coupon; deactivate instead.
        await prisma.coupon.update({ where: { id }, data: { isActive: false } });
        return NextResponse.json({ ok: true, deactivated: true, reason: "Coupon has redemptions; deactivated instead of deleted." });
      }
      await prisma.coupon.delete({ where: { id } });
      return NextResponse.json({ ok: true, deleted: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    console.error("[admin/coupons]", err);
    return NextResponse.json({ error: "Coupon operation failed." }, { status: 500 });
  }
}
