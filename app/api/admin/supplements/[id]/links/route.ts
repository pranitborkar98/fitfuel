// app/api/admin/supplements/[id]/links/route.ts
// Phase 18-2 — Add a new affiliate link to a supplement.
// POST { network, affiliateUrl, priceRs?, mrpRs?, notes?, merchantLabel?, sortOrder? }

import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const db = prisma as any;

const NETWORKS = new Set([
  "NUTRABAY", "HEALTHKART", "MUSCLEBLAZE", "AMAZON_IN", "FLIPKART",
  "TATA_1MG", "WELLNESS_FOREVER", "OTHER",
]);

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const me = await requireApiRole("supplements");
  if (!me) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;

  const body = await req.json().catch(() => ({}));
  const network = String(body?.network || "").toUpperCase();
  const affiliateUrl = String(body?.affiliateUrl || "").trim();

  if (!NETWORKS.has(network)) {
    return NextResponse.json({ error: "Invalid network" }, { status: 400 });
  }
  if (!affiliateUrl || !/^https?:\/\//i.test(affiliateUrl)) {
    return NextResponse.json({ error: "affiliateUrl must be a valid http(s) URL" }, { status: 400 });
  }

  // Sanity check the supplement exists
  const supp = await db.supplement.findUnique({ where: { id }, select: { id: true } });
  if (!supp) return NextResponse.json({ error: "supplement not found" }, { status: 404 });

  const link = await db.supplementLink.create({
    data: {
      supplementId: id,
      network,
      affiliateUrl,
      merchantLabel: body?.merchantLabel || null,
      priceRs: body?.priceRs != null ? Math.round(Number(body.priceRs)) : null,
      mrpRs: body?.mrpRs != null ? Math.round(Number(body.mrpRs)) : null,
      notes: body?.notes || null,
      sortOrder: body?.sortOrder != null ? Number(body.sortOrder) : 0,
      isActive: true,
    },
  });

  return NextResponse.json({ ok: true, link });
}
