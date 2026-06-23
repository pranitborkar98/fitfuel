// app/api/admin/coupons/route.ts
// R-PRICE-c (Decision #193) — coupon CRUD for the admin. Coupons surface (OWNER/ADMIN).
// GET  → list all coupons + redemption counts.
// POST { action, ... }  action: 'create' | 'update' | 'toggle' | 'delete'.

import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const db = prisma as any;

const DISCOUNT_TYPES = ["PERCENT", "FLAT", "FREE_DELIVERY"] as const;

function str(v: any): string {
  return typeof v === "string" ? v.trim() : "";
}
function intOrNull(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
}
function dateOrNull(v: any): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function buildData(d: any) {
  const discountType = DISCOUNT_TYPES.includes(d.discountType) ? d.discountType : "PERCENT";
  const value = Math.max(0, intOrNull(d.value) ?? 0);
  return {
    discountType,
    value,
    maxDiscountRs: intOrNull(d.maxDiscountRs),
    minOrderRs: intOrNull(d.minOrderRs),
    appliesTo: str(d.appliesTo).toUpperCase() || "ALL",
    firstOrderOnly: !!d.firstOrderOnly,
    usageLimitGlobal: intOrNull(d.usageLimitGlobal),
    usageLimitPerUser: intOrNull(d.usageLimitPerUser) ?? 1,
    validFrom: dateOrNull(d.validFrom) ?? new Date(),
    validUntil: dateOrNull(d.validUntil),
    stackable: !!d.stackable,
    isActive: d.isActive !== false,
  };
}

export async function GET() {
  const admin = await requireApiRole("coupons");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redemptions: true } } },
  });

  return NextResponse.json({
    coupons: coupons.map((c: any) => ({
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

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const action = str(body.action);

  try {
    if (action === "create") {
      const code = str(body.code).toUpperCase().replace(/\s+/g, "");
      if (!/^[A-Z0-9]{3,40}$/.test(code)) {
        return NextResponse.json({ error: "Code must be 3–40 letters/numbers." }, { status: 400 });
      }
      const exists = await db.coupon.findUnique({ where: { code } });
      if (exists) return NextResponse.json({ error: "A coupon with that code already exists." }, { status: 409 });

      const data = buildData(body);
      if (data.discountType === "PERCENT" && (data.value < 1 || data.value > 100)) {
        return NextResponse.json({ error: "Percent value must be 1–100." }, { status: 400 });
      }
      if (data.discountType === "FLAT" && data.value < 1) {
        return NextResponse.json({ error: "Flat value must be at least ₹1." }, { status: 400 });
      }
      const created = await db.coupon.create({
        data: { code, ...data, source: "MANUAL" },
      });
      return NextResponse.json({ ok: true, id: created.id });
    }

    if (action === "update") {
      const id = str(body.id);
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      const data = buildData(body);
      await db.coupon.update({ where: { id }, data });
      return NextResponse.json({ ok: true });
    }

    if (action === "toggle") {
      const id = str(body.id);
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      const cur = await db.coupon.findUnique({ where: { id }, select: { isActive: true } });
      if (!cur) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await db.coupon.update({ where: { id }, data: { isActive: !cur.isActive } });
      return NextResponse.json({ ok: true, isActive: !cur.isActive });
    }

    if (action === "delete") {
      const id = str(body.id);
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      const used = await db.couponRedemption.count({ where: { couponId: id } });
      if (used > 0) {
        // Preserve history — never hard-delete a redeemed coupon; deactivate instead.
        await db.coupon.update({ where: { id }, data: { isActive: false } });
        return NextResponse.json({ ok: true, deactivated: true, reason: "Coupon has redemptions; deactivated instead of deleted." });
      }
      await db.coupon.delete({ where: { id } });
      return NextResponse.json({ ok: true, deleted: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("[admin/coupons]", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
