import { planDateRange } from "@/lib/plan-service-dates";
import { prisma } from "@/lib/prisma";
import { todayISTDate } from "@/lib/production";
import { DigitalBundle, PlanDuration, type Prisma } from "@prisma/client";

export interface CapturedProfile {
  heightCm?: number;
  weightKg?: number;
  targetWeightKg?: number;
  age?: number;
}

export interface ActivateDigitalArgs {
  orderId: string;
  mealPlanId: string;
  durEnum: string;
  bundle?: string;
  profile?: CapturedProfile;
}

function durationValue(value: string): PlanDuration | null {
  switch (value) {
    case "TRIAL_DAY": case "WEEKLY": case "BI_WEEKLY": case "MONTHLY_EXCL_WEEKENDS":
    case "ONE_MONTH": case "TWO_MONTH": case "THREE_MONTH":
      return value;
    default:
      return null;
  }
}

function bundleValue(value: string): DigitalBundle | null {
  if (value === "STARTER" || value === "PRO") return value;
  return null;
}

function errorCode(error: unknown): string | null {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : null;
}

async function persistProfile(userId: string, profile?: CapturedProfile) {
  if (!profile) return;
  const data: Pick<Prisma.UserProfileUncheckedCreateInput, "heightCm" | "weightKg" | "targetWeightKg" | "age"> = {};
  if (typeof profile.heightCm === "number") data.heightCm = profile.heightCm;
  if (typeof profile.weightKg === "number") data.weightKg = profile.weightKg;
  if (typeof profile.targetWeightKg === "number") data.targetWeightKg = profile.targetWeightKg;
  if (typeof profile.age === "number") data.age = profile.age;
  if (Object.keys(data).length === 0) return;
  try {
    await prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  } catch (error: unknown) {
    // Access is the paid-for outcome. Profile enrichment may be repaired later.
    console.error("[activateDigitalPlan] profile persist failed", { userId, error });
  }
}

export async function activateDigitalPlan({
  orderId,
  mealPlanId,
  durEnum,
  bundle = "STARTER",
  profile,
}: ActivateDigitalArgs) {
  const duration = durationValue(durEnum);
  const digitalBundle = bundleValue(bundle);
  if (!duration) throw new Error("Invalid digital plan duration");
  if (!digitalBundle) throw new Error("Invalid digital plan bundle");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const activePlan = await prisma.$transaction(async (tx) => {
        const existing = await tx.userActivePlan.findFirst({ where: { orderId, isDigital: true } });
        if (existing) return existing;

        const [order, plan] = await Promise.all([
          tx.order.findUnique({ where: { id: orderId }, select: { userId: true } }),
          tx.mealPlan.findUnique({
            where: { id: mealPlanId },
            select: {
              avgCaloriesPerDay: true,
              avgProteinGrams: true,
              avgCarbsGrams: true,
              avgFatGrams: true,
            },
          }),
        ]);
        if (!order) throw new Error("Order not found");
        if (!plan) throw new Error("Plan not found");

        const { startDate, endDate } = planDateRange(todayISTDate(), duration);
        return tx.userActivePlan.create({
          data: {
            userId: order.userId,
            mealPlanId,
            orderId,
            startDate,
            endDate,
            currentDay: 1,
            status: "active",
            isDigital: true,
            bundle: digitalBundle,
            duration,
            calorieTarget: plan.avgCaloriesPerDay,
            proteinTarget: plan.avgProteinGrams,
            carbTarget: plan.avgCarbsGrams,
            fatTarget: plan.avgFatGrams,
            skipDates: [],
          },
        });
      }, { isolationLevel: "Serializable" });

      await persistProfile(activePlan.userId, profile);
      return activePlan;
    } catch (error: unknown) {
      if (errorCode(error) === "P2034" && attempt < 2) continue;
      throw error;
    }
  }
  throw new Error("Could not activate digital plan");
}
