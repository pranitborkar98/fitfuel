// lib/activate-digital-plan.ts — creates isDigital UserActivePlan (with bundle) + coupon redemption. Idempotent.
import { prisma } from "@/lib/prisma";
import { PlanDuration } from "@prisma/client";

const DUR_DAYS: Record<string, number> = { TRIAL_DAY: 1, WEEKLY: 7, BI_WEEKLY: 14, MONTHLY_EXCL_WEEKENDS: 26, ONE_MONTH: 30, TWO_MONTH: 60, THREE_MONTH: 90 };

export interface ActivateDigitalArgs { orderId: string; mealPlanId: string; durEnum: string; bundle?: string; }

export async function activateDigitalPlan({ orderId, mealPlanId, durEnum, bundle = "STARTER" }: ActivateDigitalArgs) {
  const existing = await (prisma as any).userActivePlan.findFirst({ where: { orderId, isDigital: true } });
  if (existing) return existing;
  const order = await (prisma as any).order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  const plan = await (prisma as any).mealPlan.findUnique({ where: { id: mealPlanId } });
  if (!plan) throw new Error("Plan not found");

  const days = DUR_DAYS[durEnum] ?? 30;
  const startDate = new Date(); const endDate = new Date(startDate); endDate.setDate(endDate.getDate() + days);

  const activePlan = await (prisma as any).userActivePlan.create({
    data: { userId: order.userId, mealPlanId, orderId, startDate, endDate, currentDay: 1, status: "active", isDigital: true, bundle, duration: durEnum as PlanDuration, calorieTarget: plan.avgCaloriesPerDay, proteinTarget: plan.avgProteinGrams, carbTarget: plan.avgCarbsGrams, fatTarget: plan.avgFatGrams, skipDates: [] },
  });

  if (order.couponCode && order.discountRs > 0) {
    const coupon = await (prisma as any).coupon.findUnique({ where: { code: order.couponCode } });
    if (coupon) await (prisma as any).couponRedemption.create({ data: { couponId: coupon.id, userId: order.userId, orderId, amountRs: order.discountRs } });
  }
  return activePlan;
}
