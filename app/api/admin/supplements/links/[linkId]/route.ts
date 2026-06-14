// app/api/admin/supplements/links/[linkId]/route.ts
// Phase 18-2 — Per-link admin actions.
//   PATCH  → update fields (URL, price, mrp, notes, sortOrder, isActive, merchantLabel)
//   DELETE → soft-delete (isActive=false) — preserves click history

import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const db = prisma as any;
type Ctx = { params: Promise<{ linkId: string }> };

const NETWORKS = new Set([
  "NUTRABAY", "HEALTHKART", "MUSCLEBLAZE", "AMAZON_IN", "FLIPKART",
  "TATA_1MG", "WELLNESS_FOREVER", "OTHER",
]);

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const me = await requireApiRole("supplements");
  if (!me) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { linkId } = await ctx.params;

  const body = await req.json().catch(() => ({}));
  const data: any = {};

  if ("affiliateUrl" in body) {
    const url = String(body.affiliateUrl || "").trim();
    if (!url || !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "affiliateUrl must be a valid http(s) URL" }, { status: 400 });
    }
    data.affiliateUrl = url;
  }
  if ("network" in body) {
    const network = String(body.network || "").toUpperCase();
    if (!NETWORKS.has(network)) return NextResponse.json({ error: "Invalid network" }, { status: 400 });
    data.network = network;
  }
  if ("merchantLabel" in body) data.merchantLabel = body.merchantLabel || null;
  if ("priceRs" in body) data.priceRs = body.priceRs != null ? Math.round(Number(body.priceRs)) : null;
  if ("mrpRs" in body) data.mrpRs = body.mrpRs != null ? Math.round(Number(body.mrpRs)) : null;
  if ("notes" in body) data.notes = body.notes || null;
  if ("sortOrder" in body) data.sortOrder = Number(body.sortOrder) || 0;
  if ("isActive" in body) data.isActive = !!body.isActive;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  const updated = await db.supplementLink.update({ where: { id: linkId }, data });
  return NextResponse.json({ ok: true, link: updated });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const me = await requireApiRole("supplements");
  if (!me) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { linkId } = await ctx.params;
  // Soft delete — preserves click history (Decision #138-pattern: don't lose analytics)
  await db.supplementLink.update({ where: { id: linkId }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
