// Plan copy, readiness, and existing price-row management. OWNER/ADMIN only.

import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasCompletePlanSchedule } from "@/lib/plan-readiness";

export const dynamic = "force-dynamic";

const idSchema = z.string().cuid();
const imageUrlSchema = z.string().trim().max(2048).refine(
  (value) => !value || value.startsWith("/") || /^https:\/\//i.test(value),
  "Use an HTTPS image URL or an app-relative path.",
);
const lineListSchema = z
  .union([
    z.array(z.string().trim().min(1).max(240)).max(30),
    z.string().max(8_000),
  ])
  .transform((value) =>
    (Array.isArray(value) ? value : value.split("\n"))
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 30),
  );

const planDataSchema = z
  .object({
    displayName: z.string().trim().min(1, "Display name is required.").max(160),
    tagline: z.string().trim().max(240).default(""),
    description: z.string().trim().max(700).default(""),
    longDescription: z.string().trim().max(8_000).default(""),
    whoIsItFor: z.string().trim().max(1_500).default(""),
    keyPrinciples: lineListSchema.default([]),
    whatIsAvoided: lineListSchema.default([]),
    avgCaloriesPerDay: z.coerce.number().int().min(0).max(10_000).default(0),
    avgProteinGrams: z.coerce.number().int().min(0).max(1_000).default(0),
    avgCarbsGrams: z.coerce.number().int().min(0).max(2_000).default(0),
    avgFatGrams: z.coerce.number().int().min(0).max(1_000).default(0),
    nutritionistName: z.string().trim().max(120).default(""),
    nutritionistCred: z.string().trim().max(200).default(""),
    nutritionistBio: z.string().trim().max(1_500).default(""),
    medicalDisclaimer: z.string().trim().max(2_500).default(""),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    sortOrder: z.coerce.number().int().min(-10_000).max(10_000).default(0),
    imageUrl: imageUrlSchema.default(""),
    accentColor: z.string().trim().max(9).refine(
      (value) => !value || /^#[0-9a-f]{6}$/i.test(value),
      "Accent colour must be a six-digit hex value.",
    ).default(""),
  })
  .strict();

const planRequestSchema = z
  .object({ action: z.literal("updatePlan"), id: idSchema, data: planDataSchema })
  .strict();
const priceRequestSchema = z
  .object({
    action: z.literal("updatePrice"),
    id: idSchema,
    data: z
      .object({
        priceRs: z.coerce.number().int().min(1).max(500_000),
        gstPercent: z.coerce.number().int().min(0).max(28).default(5),
        isActive: z.boolean(),
        mrpRs: z.union([z.literal(""), z.null(), z.coerce.number().int().min(1).max(500_000)]).optional(),
      })
      .strict(),
  })
  .strict();
const requestSchema = z.discriminatedUnion("action", [planRequestSchema, priceRequestSchema]);

export async function POST(req: NextRequest) {
  const admin = await requireApiRole("plans");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = await readJson(req, requestSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  try {
    if (body.action === "updatePlan") {
      const input = body.data;
      if (input.isActive) {
        if (input.avgCaloriesPerDay < 800 || input.avgProteinGrams < 1) {
          return NextResponse.json(
            { error: "Active plans need a plausible calorie target and protein amount." },
            { status: 400 },
          );
        }
        if (!input.tagline || !input.description || !input.longDescription || !input.whoIsItFor) {
          return NextResponse.json(
            { error: "Active plans need complete customer-facing copy." },
            { status: 400 },
          );
        }
        const readiness = await prisma.mealPlan.findUnique({
          where: { id: body.id },
          select: {
            cycleLengthDays: true,
            mealsPerDay: true,
            _count: { select: { scheduleSlots: true } },
            planPrices: {
              where: { isActive: true },
              select: { id: true },
              take: 1,
            },
          },
        });
        if (!readiness) return NextResponse.json({ error: "Plan not found." }, { status: 404 });
        if (!hasCompletePlanSchedule({
          scheduleCount: readiness._count.scheduleSlots,
          cycleLengthDays: readiness.cycleLengthDays,
          mealsPerDay: readiness.mealsPerDay,
        })) {
          return NextResponse.json(
            { error: "Complete every meal slot in the plan cycle before making it live." },
            { status: 400 },
          );
        }
        if (readiness.planPrices.length === 0) {
          return NextResponse.json(
            { error: "Add at least one active price before making this plan live." },
            { status: 400 },
          );
        }
      }

      const record = await prisma.mealPlan.update({
        where: { id: body.id },
        data: {
          displayName: input.displayName,
          tagline: input.tagline,
          description: input.description,
          longDescription: input.longDescription,
          whoIsItFor: input.whoIsItFor,
          keyPrinciples: input.keyPrinciples,
          whatIsAvoided: input.whatIsAvoided,
          avgCaloriesPerDay: input.avgCaloriesPerDay,
          avgProteinGrams: input.avgProteinGrams,
          avgCarbsGrams: input.avgCarbsGrams,
          avgFatGrams: input.avgFatGrams,
          nutritionistName: input.nutritionistName || null,
          nutritionistCred: input.nutritionistCred || null,
          nutritionistBio: input.nutritionistBio || null,
          medicalDisclaimer: input.medicalDisclaimer || null,
          isActive: input.isActive,
          isFeatured: input.isFeatured,
          sortOrder: input.sortOrder,
          imageUrl: input.imageUrl || null,
          accentColor: input.accentColor || null,
        },
      });
      return NextResponse.json({ ok: true, record });
    }

    const mrpRs = body.data.mrpRs === "" || body.data.mrpRs == null ? null : body.data.mrpRs;
    if (mrpRs !== null && mrpRs < body.data.priceRs) {
      return NextResponse.json({ error: "MRP cannot be lower than the selling price." }, { status: 400 });
    }
    const currentPrice = await prisma.planPrice.findUnique({
      where: { id: body.id },
      select: { mealPlanId: true, mealPlan: { select: { isActive: true } } },
    });
    if (!currentPrice) return NextResponse.json({ error: "Price row not found." }, { status: 404 });
    if (currentPrice.mealPlan?.isActive && !body.data.isActive && currentPrice.mealPlanId) {
      const otherActivePrices = await prisma.planPrice.count({
        where: { mealPlanId: currentPrice.mealPlanId, id: { not: body.id }, isActive: true },
      });
      if (otherActivePrices === 0) {
        return NextResponse.json(
          { error: "A live plan must keep at least one active price. Hide the plan first if you want to remove its final price." },
          { status: 400 },
        );
      }
    }
    const record = await prisma.planPrice.update({
      where: { id: body.id },
      data: { priceRs: body.data.priceRs, gstPercent: body.data.gstPercent, isActive: body.data.isActive, mrpRs },
    });
    return NextResponse.json({ ok: true, record });
  } catch (error: unknown) {
    const code = typeof error === "object" && error && "code" in error ? error.code : null;
    if (code === "P2025") return NextResponse.json({ error: "Plan or price row not found." }, { status: 404 });
    console.error("[admin/plans] save failed", error);
    return NextResponse.json({ error: "Plan save failed." }, { status: 500 });
  }
}
