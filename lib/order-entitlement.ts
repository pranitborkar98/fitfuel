import { activateDigitalPlan, type CapturedProfile } from "@/lib/activate-digital-plan";
import { firstDeliveryDateFor } from "@/lib/order-cutoff";
import { planDateRange } from "@/lib/plan-service-dates";
import { prisma } from "@/lib/prisma";
import { resolvePurchasedPlan } from "@/lib/resolve-purchased-plan";
import { DeliveryWindow, MealsPerDay, PlanDuration } from "@prisma/client";

const DUR_MAP: Record<string, PlanDuration> = {
  trial: PlanDuration.TRIAL_DAY,
  weekly: PlanDuration.WEEKLY,
  biweekly: PlanDuration.BI_WEEKLY,
  monthly_ex: PlanDuration.MONTHLY_EXCL_WEEKENDS,
  monthly: PlanDuration.ONE_MONTH,
  two_month: PlanDuration.TWO_MONTH,
  three_month: PlanDuration.THREE_MONTH,
};
const MEAL_MAP: Record<string, MealsPerDay> = {
  bl: MealsPerDay.BREAKFAST_LUNCH,
  sd: MealsPerDay.SNACK_DINNER,
  all: MealsPerDay.ALL_FOUR,
};

export interface OrderMeta {
  kind?: string;
  isDigital?: boolean;
  planSlug?: string | null;
  durEnum?: string;
  bundle?: string;
  profile?: CapturedProfile;
  dur?: string;
  meal?: string;
  diet?: string;
  deliveryWindow?: string;
}

export interface EntitlementOrder {
  id: string;
  userId: string;
  notes?: string | null;
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function profileFrom(value: unknown): CapturedProfile | undefined {
  const input = record(value);
  if (!input) return undefined;
  const profile: CapturedProfile = {};
  const fields: Array<[keyof CapturedProfile, number, number]> = [
    ["heightCm", 100, 250],
    ["weightKg", 30, 350],
    ["targetWeightKg", 30, 350],
    ["age", 13, 100],
  ];
  for (const [key, min, max] of fields) {
    const value = input[key];
    if (typeof value === "number" && Number.isFinite(value) && value >= min && value <= max) profile[key] = value;
  }
  return Object.keys(profile).length > 0 ? profile : undefined;
}

function errorCode(error: unknown): string | null {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : null;
}

export function parseOrderMeta(notes: string | null | undefined): OrderMeta {
  try {
    const input = record(JSON.parse(notes || "{}"));
    if (!input) return {};
    return {
      kind: optionalString(input.kind),
      isDigital: input.isDigital === true,
      planSlug: optionalString(input.planSlug) ?? null,
      durEnum: optionalString(input.durEnum),
      bundle: optionalString(input.bundle),
      profile: profileFrom(input.profile),
      dur: optionalString(input.dur),
      meal: optionalString(input.meal),
      diet: optionalString(input.diet),
      deliveryWindow: optionalString(input.deliveryWindow),
    };
  } catch {
    return {};
  }
}

export async function ensurePurchasedEntitlement(order: EntitlementOrder, suppliedMeta?: OrderMeta) {
  const meta = suppliedMeta ?? parseOrderMeta(order.notes);
  if (meta.kind === "DISH") return;

  if (meta.isDigital) {
    if (!meta.planSlug) throw new Error(`Digital plan slug missing for paid order ${order.id}`);
    const plan = await prisma.mealPlan.findUnique({ where: { slug: meta.planSlug }, select: { id: true } });
    if (!plan) throw new Error(`Digital plan not found for paid order ${order.id}`);
    await activateDigitalPlan({
      orderId: order.id,
      mealPlanId: plan.id,
      durEnum: meta.durEnum ?? PlanDuration.ONE_MONTH,
      bundle: meta.bundle ?? "STARTER",
      profile: meta.profile,
    });
    return;
  }

  const duration = DUR_MAP[meta.dur ?? ""] ?? PlanDuration.ONE_MONTH;
  const meals = MEAL_MAP[meta.meal ?? ""] ?? MealsPerDay.ALL_FOUR;
  const deliveryWindow = meta.deliveryWindow === "EVENING" ? DeliveryWindow.EVENING : DeliveryWindow.MORNING;
  const mealPlan = await resolvePurchasedPlan({ planSlug: meta.planSlug, diet: meta.diet });
  if (!mealPlan) throw new Error(`Physical plan not found for paid order ${order.id}`);
  const { startDate, endDate } = planDateRange(firstDeliveryDateFor(), duration);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await prisma.$transaction(async (tx) => {
        const existing = await tx.userActivePlan.findFirst({
          where: { orderId: order.id, isDigital: false },
          select: { id: true },
        });
        if (existing) return;

        const profile = await tx.userProfile.findUnique({
          where: { userId: order.userId },
          select: { calorieTarget: true },
        });
        await tx.userActivePlan.create({
          data: {
            userId: order.userId,
            mealPlanId: mealPlan.id,
            orderId: order.id,
            startDate,
            endDate,
            currentDay: 1,
            status: "active",
            mealsPerDay: meals,
            duration,
            deliveryWindow,
            skipDates: [],
            calorieTarget: profile?.calorieTarget ?? null,
          },
        });
      }, { isolationLevel: "Serializable" });
      return;
    } catch (error: unknown) {
      if (errorCode(error) === "P2034" && attempt < 2) continue;
      throw error;
    }
  }
}

export async function revokePurchasedEntitlement(orderId: string): Promise<void> {
  await prisma.userActivePlan.updateMany({
    where: { orderId, status: { in: ["active", "paused"] } },
    data: { status: "cancelled" },
  });
}
