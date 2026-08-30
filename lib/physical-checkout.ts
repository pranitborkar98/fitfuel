import "server-only";

import { DietVariant, MealsPerDay, PlanDuration } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { hasCompletePlanSchedule } from "@/lib/plan-readiness";

const DIET_VARIANT: Record<string, DietVariant> = {
  veg: DietVariant.VEG,
  egg: DietVariant.EGG,
  nonveg: DietVariant.NON_VEG,
  jain: DietVariant.JAIN,
  vegan: DietVariant.VEGAN,
};

const DURATION: Record<string, PlanDuration> = {
  trial: PlanDuration.TRIAL_DAY,
  weekly: PlanDuration.WEEKLY,
  biweekly: PlanDuration.BI_WEEKLY,
  monthly_ex: PlanDuration.MONTHLY_EXCL_WEEKENDS,
  monthly: PlanDuration.ONE_MONTH,
  two_month: PlanDuration.TWO_MONTH,
  three_month: PlanDuration.THREE_MONTH,
};

const MEALS: Record<string, MealsPerDay> = {
  bl: MealsPerDay.BREAKFAST_LUNCH,
  sd: MealsPerDay.SNACK_DINNER,
  all: MealsPerDay.ALL_FOUR,
};

type Rejection = { ok: false; status: number; error: string };

export async function resolvePhysicalCheckout(input: {
  planSlug: string;
  diet: string;
  duration: string;
  meals: string;
  submittedSubtotalRs?: number;
}) {
  const duration = DURATION[input.duration];
  const meals = MEALS[input.meals];
  const diet = DIET_VARIANT[input.diet];
  if (!duration || !meals || !diet) {
    return { ok: false, status: 400, error: "Invalid plan selection." } satisfies Rejection;
  }

  const plan = await prisma.mealPlan.findUnique({
    where: { slug: input.planSlug },
    select: {
      id: true,
      slug: true,
      name: true,
      displayName: true,
      dietaryVariant: true,
      cycleLengthDays: true,
      mealsPerDay: true,
      _count: { select: { scheduleSlots: true } },
      planPrices: {
        where: { duration, mealsPerDay: meals, isDigital: false, isActive: true },
        select: { id: true, priceRs: true, priceIsTaxInclusive: true },
        take: 1,
      },
    },
  });

  if (!plan) {
    return { ok: false, status: 404, error: "That meal plan no longer exists." } satisfies Rejection;
  }
  if (plan.dietaryVariant !== diet) {
    return {
      ok: false,
      status: 409,
      error: "This plan is not yet published for the selected diet.",
    } satisfies Rejection;
  }
  if (
    !hasCompletePlanSchedule({
      scheduleCount: plan._count.scheduleSlots,
      cycleLengthDays: plan.cycleLengthDays,
      mealsPerDay: plan.mealsPerDay,
    })
  ) {
    return {
      ok: false,
      status: 409,
      error: "This plan's kitchen menu is still being prepared and cannot be ordered yet.",
    } satisfies Rejection;
  }

  const price = plan.planPrices[0];
  if (!price || price.priceIsTaxInclusive) {
    return {
      ok: false,
      status: 409,
      error: "This plan combination is not available to order.",
    } satisfies Rejection;
  }
  if (
    input.submittedSubtotalRs !== undefined &&
    Math.round(input.submittedSubtotalRs) !== price.priceRs
  ) {
    return {
      ok: false,
      status: 409,
      error: "The plan price changed. Refresh the page to see the current total.",
    } satisfies Rejection;
  }

  return {
    ok: true as const,
    plan: {
      id: plan.id,
      slug: plan.slug,
      name: plan.name,
      displayName: plan.displayName,
    },
    subtotalRs: price.priceRs,
    duration,
    meals,
  };
}
