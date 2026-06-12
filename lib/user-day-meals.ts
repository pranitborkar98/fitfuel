// lib/user-day-meals.ts
// Phase 16B — given a UserActivePlan and a target date, return the meals
// the user will receive that day. Reuses production.ts's day-numbering logic.
//
// Used by morning preview (today) and evening recap (tomorrow).

import { prisma } from "@/lib/prisma";
import {
  type DeliveryWindowValue,
  type MealSlotValue,
  menuDayNumber,
  mealSlotsForMealsPerDay,
  SLOT_ORDER,
} from "@/lib/production";

export type UserMealLine = {
  slot: MealSlotValue;
  recipeName: string;
  calories: number;
  servingGrams: number;
};

export type UserDayMeals = {
  userId: string;
  date: string;            // YYYY-MM-DD (UTC)
  dayNumber: number;       // menu day in cycle
  window: DeliveryWindowValue;
  meals: UserMealLine[];   // ordered by slot
  totalCalories: number;
};

/**
 * Build the per-user meal lineup for the given UTC date.
 * Returns null if the user has no active plan covering this date.
 */
export async function getUserDayMeals(
  userId: string,
  date: Date
): Promise<UserDayMeals | null> {
  const plan = await (prisma as any).userActivePlan.findFirst({
    where: {
      userId,
      status: "active",
      isDigital: false,
      startDate: { lte: date },
      endDate: { gte: date },
    },
    select: {
      mealPlanId: true,
      mealsPerDay: true,
      deliveryWindow: true,
      startDate: true,
      skipDates: true,
      mealPlan: { select: { cycleLengthDays: true } },
    },
  });
  if (!plan) return null;

  // Skip days produce no meal lineup
  const dateStr = date.toISOString().slice(0, 10);
  const isSkipped = (plan.skipDates || []).some(
    (sd: Date) => new Date(sd).toISOString().slice(0, 10) === dateStr
  );
  if (isSkipped) {
    return {
      userId,
      date: dateStr,
      dayNumber: 0,
      window: (plan.deliveryWindow || "MORNING") as DeliveryWindowValue,
      meals: [],
      totalCalories: 0,
    };
  }

  const cycleLen = plan.mealPlan?.cycleLengthDays || 30;
  const dayNumber = menuDayNumber(new Date(plan.startDate), date, cycleLen);
  const slots = mealSlotsForMealsPerDay(plan.mealsPerDay);

  const rows = await (prisma as any).planScheduleSlot.findMany({
    where: {
      mealPlanId: plan.mealPlanId,
      dayNumber,
      mealSlot: { in: slots },
    },
    select: {
      mealSlot: true,
      recipe: {
        select: {
          name: true,
          caloriesPerServing: true,
          servingSizeGrams: true,
        },
      },
    },
  });

  const meals: UserMealLine[] = rows
    .filter((r: any) => r.recipe)
    .map((r: any) => ({
      slot: r.mealSlot as MealSlotValue,
      recipeName: r.recipe.name as string,
      calories: Number(r.recipe.caloriesPerServing || 0),
      servingGrams: Number(r.recipe.servingSizeGrams || 0),
    }))
    .sort((a: UserMealLine, b: UserMealLine) => SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot]);

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

  return {
    userId,
    date: dateStr,
    dayNumber,
    window: (plan.deliveryWindow || "MORNING") as DeliveryWindowValue,
    meals,
    totalCalories,
  };
}

/** Format a slot name as a label (e.g. "BREAKFAST" → "Breakfast"). */
export function slotLabel(s: MealSlotValue): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

/** Render the meal list as inline HTML rows for an email body. */
export function mealsListHtml(meals: UserMealLine[]): string {
  if (meals.length === 0) {
    return `<tr><td style="padding:12px 0;color:#888;text-align:center">No meals scheduled today.</td></tr>`;
  }
  return meals
    .map(
      (m) => `<tr>
  <td style="padding:10px 0;color:#84cc16;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:90px;vertical-align:top">${slotLabel(
    m.slot
  )}</td>
  <td style="padding:10px 0;color:#eee;font-size:14px;vertical-align:top">${escapeHtml(
    m.recipeName
  )}<div style="color:#666;font-size:12px;margin-top:2px">${m.calories} cal \u00B7 ${m.servingGrams}g</div></td>
</tr>
<tr><td colspan="2" style="border-top:1px solid #1a1a1a;height:1px;line-height:1px"></td></tr>`
    )
    .join("");
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return c;
    }
  });
}
