// app/api/admin/plans/route.ts
// Phase 15E-1 — plans + pricing management.
//   POST updatePlan  { id, data } -> edit a MealPlan's copy / flags / macros
//   POST updatePrice { id, data } -> edit an EXISTING PlanPrice row's price/mrp/gst/active
// Plans surface (OWNER/ADMIN). We intentionally do NOT create/delete price rows
// here — checkout depends on the exact (duration × meals × bundle) combos
// existing, so v1 only edits the price fields of rows that already exist.

import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const db = prisma as any;

const s = (v: any) => (typeof v === "string" ? v.trim() : "");
const i = (v: any, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : d;
};
const lines = (v: any) =>
  Array.isArray(v)
    ? v.map((x) => s(x)).filter(Boolean)
    : s(v).split("\n").map((x) => x.trim()).filter(Boolean);

export async function POST(req: NextRequest) {
  const admin = await requireApiRole("plans");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    id?: string;
    data?: any;
  };
  const d = body.data ?? {};

  try {
    if (body.action === "updatePlan") {
      if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
      if (!s(d.displayName)) return NextResponse.json({ error: "Display name is required" }, { status: 400 });

      const data = {
        displayName: s(d.displayName),
        tagline: s(d.tagline),
        description: s(d.description),
        longDescription: s(d.longDescription),
        whoIsItFor: s(d.whoIsItFor),
        keyPrinciples: lines(d.keyPrinciples),
        whatIsAvoided: lines(d.whatIsAvoided),
        avgCaloriesPerDay: i(d.avgCaloriesPerDay),
        avgProteinGrams: i(d.avgProteinGrams),
        avgCarbsGrams: i(d.avgCarbsGrams),
        avgFatGrams: i(d.avgFatGrams),
        nutritionistName: s(d.nutritionistName) || null,
        nutritionistCred: s(d.nutritionistCred) || null,
        nutritionistBio: s(d.nutritionistBio) || null,
        medicalDisclaimer: s(d.medicalDisclaimer) || null,
        isActive: !!d.isActive,
        isFeatured: !!d.isFeatured,
        sortOrder: i(d.sortOrder),
        imageUrl: s(d.imageUrl) || null,
        accentColor: s(d.accentColor) || null,
      };
      const record = await db.mealPlan.update({ where: { id: body.id }, data });
      return NextResponse.json({ ok: true, record });
    }

    if (body.action === "updatePrice") {
      if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
      const data = {
        priceRs: i(d.priceRs),
        gstPercent: i(d.gstPercent, 5),
        isActive: !!d.isActive,
        mrpRs: d.mrpRs === "" || d.mrpRs == null ? null : i(d.mrpRs),
      };
      if (data.priceRs <= 0) return NextResponse.json({ error: "Price must be greater than 0" }, { status: 400 });
      const record = await db.planPrice.update({ where: { id: body.id }, data });
      return NextResponse.json({ ok: true, record });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 400 });
  }
}
