// lib/calorie-target.ts
// Single source of truth for a user's daily calorie target (kcal).
//
// Before this module, three surfaces each resolved the target their own way
// and could disagree for the same user:
//   - the dashboard ring (lib/net-calories.ts): active-plan target, then plan
//     average, then a flat 1600;
//   - the nutrition page (app/api/nutrition/goals/route.ts, NutritionGoal
//     table): the stored goal row, or a flat 2000 when no row exists;
//   - the progress charts (lib/progress.ts): active-plan target, then plan
//     average, then profile target, then profile TDEE, then a flat 2000.
// Recalibration wrote to the active plan and the profile only, so the
// nutrition page kept showing the old target after an apply.
//
// One precedence now, used by all three surfaces:
//
//   1. explicit personal override -- UserProfile.calorieTarget, the personal
//      target computed at onboarding from the user's own TDEE and goal.
//   2. active-plan target -- UserActivePlan.calorieTarget, the personalised
//      target on the user's current plan (written at activation and by
//      recalibration).
//   3. NutritionGoal -- NutritionGoal.calories, the goal set on the nutrition
//      page. Only a stored row counts: the 2000 shown when no row exists is a
//      display default, not a value, and never enters this chain.
//   4. plan average -- MealPlan.avgCaloriesPerDay for the active plan.
//   5. safe default -- DEFAULT_CALORIE_TARGET_KCAL (2000). This is the
//      default the nutrition page, the progress charts, and the recalibration
//      engine already used; the ring's old 1600 fallback was the outlier and
//      is retired, so a user with no plan, no profile target, and no goal row
//      now resolves to 2000 everywhere instead of 1600 on the ring alone.
//
// Floor: CALORIE_FLOOR_KCAL (1200) is the global minimum, taken from the
// coach floor (lib/ai-trainer/persona.ts CALORIE_FLOOR, lib/coach/
// recalibration.ts FLOOR). The resolver clamps the resolved value to
// [1200, 20000] at read time; it never rewrites stored data, so a goal saved
// below the floor before this change now reads as 1200 instead of the stored
// number. Values of 0 or below are treated as absent, not as a target.
//
// The male 1500 floor in lib/tdee.ts (getCalorieTarget) is kept as-is: it is
// stricter than the 1200 global minimum, so it does not conflict with it. It
// only applies when a target is first computed at onboarding. This module
// takes no gender, so a male recalibrated to 1200 (below the TDEE male floor)
// stays possible; that residue is a product decision, not something this
// module silently changes.
//
// This file is pure (no imports) so client components can use the floor
// constant too. The database-backed helper lives in lib/calorie-target-server.ts.

/** Global minimum daily calorie target (kcal). Mirrors the coach floor. */
export const CALORIE_FLOOR_KCAL = 1200;

/** Hard ceiling for a daily calorie target (kcal). Matches the goals schema max. */
export const CALORIE_CEILING_KCAL = 20_000;

/** Fallback when no stored value exists anywhere (kcal). */
export const DEFAULT_CALORIE_TARGET_KCAL = 2000;

export type CalorieTargetSource =
  | "profile"
  | "active_plan"
  | "nutrition_goal"
  | "plan_average"
  | "default";

export interface CalorieTargetInputs {
  profileCalorieTarget?: number | null;
  activePlanCalorieTarget?: number | null;
  nutritionGoalCalories?: number | null;
  planAvgCaloriesPerDay?: number | null;
}

export interface ResolvedCalorieTarget {
  calories: number;
  source: CalorieTargetSource;
}

function usable(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/** Clamp a target into the safe band. Non-finite input falls back to the default. */
export function clampCalorieTarget(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_CALORIE_TARGET_KCAL;
  return Math.min(
    Math.max(Math.round(value), CALORIE_FLOOR_KCAL),
    CALORIE_CEILING_KCAL,
  );
}

/**
 * Resolve a user's daily calorie target from already-fetched stored values,
 * in the single documented precedence above. Returns the resolved value and
 * which rung produced it, so callers can say where the number came from.
 */
export function resolveCalorieTarget(
  inputs: CalorieTargetInputs,
): ResolvedCalorieTarget {
  const candidates: Array<[CalorieTargetSource, number | null | undefined]> = [
    ["profile", inputs.profileCalorieTarget],
    ["active_plan", inputs.activePlanCalorieTarget],
    ["nutrition_goal", inputs.nutritionGoalCalories],
    ["plan_average", inputs.planAvgCaloriesPerDay],
  ];
  for (const [source, value] of candidates) {
    if (usable(value)) return { calories: clampCalorieTarget(value), source };
  }
  return { calories: DEFAULT_CALORIE_TARGET_KCAL, source: "default" };
}
