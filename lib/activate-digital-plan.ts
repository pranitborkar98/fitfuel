// lib/activate-digital-plan.ts — creates isDigital UserActivePlan (with bundle) + coupon redemption. Idempotent.
// Phase 13D (capture): persists optional body stats (height/weight/goal/age) onto UserProfile,
// keyed by the order's userId (@unique). Only provided fields are written — never clobbers
// existing values with blanks. Seeds the dashboard AND feeds the PDF personalisation engine.
import { prisma } from "@/lib/prisma";
import { PlanDuration } from "@prisma/client";

const DUR_DAYS: Record<string, number> = { TRIAL_DAY: 1, WEEKLY: 7, BI_WEEKLY: 14, MONTHLY_EXCL_WEEKENDS: 26, ONE_MONTH: 30, TWO_MONTH: 60, THREE_MONTH: 90 };

export interface CapturedProfile { heightCm?: number; weightKg?: number; targetWeightKg?: number; age?: number; }
export interface ActivateDigitalArgs { orderId: string; mealPlanId: string; durEnum: string; bundle?: string; profile?: CapturedProfile; }

async function persistProfile(userId: string, profile?: CapturedProfile) {
  if (!profile) return;
  const data: Record<string, number> = {};
  if (typeof profile.heightCm === "number") data.heightCm = profile.heightCm;
  if (typeof profile.weightKg === "number") data.weightKg = profile.weightKg;
  if (typeof profile.targetWeightKg === "number") data.targetWeightKg = profile.targetWeightKg;
  if (typeof profile.age === "number") data.age = profile.age;
  if (!Object.keys(data).length) return;
  try {
    // userId is @unique on UserProfile — safe to upsert on it.
    await (prisma as any).userProfile.upsert({
      where: { userId },
      update: data,          // merge: only the captured fields change
      create: { userId, ...data },
    });
  } catch (e) {
    // Never let a profile write fail the activation — the customer has paid.
    console.error("[activateDigitalPlan] profile persist failed", { userId, e });
  }
}

export async function activateDigitalPlan({ orderId, mealPlanId, durEnum, bundle = "STARTER", profile }: ActivateDigitalArgs) {
  const existing = await (prisma as any).userActivePlan.findFirst({ where: { orderId, isDigital: true } });
  if (existing) {
    // Idempotent re-hit (PayU can fire twice): still make sure captured stats are saved.
    await persistProfile(existing.userId, profile);
    return existing;
  }
  const order = await (prisma as any).order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  const plan = await (prisma as any).mealPlan.findUnique({ where: { id: mealPlanId } });
  if (!plan) throw new Error("Plan not found");

  const days = DUR_DAYS[durEnum] ?? 30;
  const startDate = new Date(); const endDate = new Date(startDate); endDate.setDate(endDate.getDate() + days);

  const activePlan = await (prisma as any).userActivePlan.create({
    data: { userId: order.userId, mealPlanId, orderId, startDate, endDate, currentDay: 1, status: "active", isDigital: true, bundle, duration: durEnum as PlanDuration, calorieTarget: plan.avgCaloriesPerDay, proteinTarget: plan.avgProteinGrams, carbTarget: plan.avgCarbsGrams, fatTarget: plan.avgFatGrams, skipDates: [] },
  });

  await persistProfile(order.userId, profile);

  if (order.couponCode && order.discountRs > 0) {
    const coupon = await (prisma as any).coupon.findUnique({ where: { code: order.couponCode } });
    if (coupon) await (prisma as any).couponRedemption.create({ data: { couponId: coupon.id, userId: order.userId, orderId, amountRs: order.discountRs } });
  }
  return activePlan;
}
