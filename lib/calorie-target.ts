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
//   1. NutritionGoal -- NutritionGoal.calories, the goal set on the nutrition
//      page. It wins because it is the user's explicit latest choice: the
//      goals dialog is where a user deliberately sets a number, so it
//      outranks values written earlier by onboarding, activation, or
//      recalibration. Only a stored row counts: the 2000 shown when no row
//      exists is a display default, not a value, and never enters this chain.
//   2. explicit personal override -- UserProfile.calorieTarget, the personal
//      target computed at onboarding from the user's own TDEE and goal.
//   3. active-plan target -- UserActivePlan.calorieTarget, the personalised
//      target on the user's current plan (written at activation and by
//      recalibration).
//   4. plan average -- MealPlan.avgCaloriesPerDay for the active plan.
//   5. safe default -- DEFAULT_CALORIE_TARGET_KCAL (2000). This is the
//      default the nutrition page, the progress charts, and the recalibration
//      engine already used; the ring's old 1600 fallback was the outlier and
//      is retired, so a user with no plan, no profile target, and no goal row
//      now resolves to 2000 everywhere instead of 1600 on the ring alone.
//
// Floor: the minimum is sex-aware, matching lib/tdee.ts (getCalorieTarget):
// FEMALE resolves to at least 1200 kcal, MALE or OTHER to at least 1500.
// When sex is unknown or absent the floor stays 1200, preserving the old
// behaviour. The resolver clamps the resolved value to [floor, 20000] at
// read time; it never rewrites stored data, so a goal saved below the floor
// before this change now reads as the floor instead of the stored number.
// Values of 0 or below are treated as absent, not as a target.
//
// Note the one deliberate difference from lib/tdee.ts: there the gender
// defaults to OTHER (so an absent gender floors at 1500), while here an
// absent sex floors at 1200, because the resolver must not raise the floor
// for users who never recorded a gender.
//
// This file is pure (no imports) so client components can use the floor
// constants too. The database-backed helper lives in lib/calorie-target-server.ts.

/** Global minimum daily calorie target (kcal). Mirrors the coach floor. */
export const CALORIE_FLOOR_KCAL = 1200;

/** Minimum daily calorie target (kcal) for MALE and OTHER. Matches lib/tdee.ts. */
export const CALORIE_FLOOR_MALE_KCAL = 1500;

/** Sex as stored on UserProfile.gender. Null/absent means unknown. */
export type CalorieTargetSex = "MALE" | "FEMALE" | "OTHER";

/** Sex-aware floor: MALE or OTHER resolve to at least 1500 kcal, FEMALE or
 *  unknown sex to at least 1200. Unknown stays 1200 so existing behaviour
 *  (and tests) are preserved for users with no recorded gender. */
export function calorieFloorForSex(sex?: CalorieTargetSex | null): number {
  return sex === "MALE" || sex === "OTHER" ? CALORIE_FLOOR_MALE_KCAL : CALORIE_FLOOR_KCAL;
}

/** Hard ceiling for a daily calorie target (kcal). Matches the goals schema max. */
export const CALORIE_CEILING_KCAL = 20_000;

/** Fallback when no stored value exists anywhere (kcal). */
export const DEFAULT_CALORIE_TARGET_KCAL = 2000;

export type CalorieTargetSource =
  | "nutrition_goal"
  | "profile"
  | "active_plan"
  | "plan_average"
  | "default";

export interface CalorieTargetInputs {
  profileCalorieTarget?: number | null;
  activePlanCalorieTarget?: number | null;
  nutritionGoalCalories?: number | null;
  planAvgCaloriesPerDay?: number | null;
  /** Optional sex for the floor; unknown/absent floors at 1200. */
  sex?: CalorieTargetSex | null;
}

export interface ResolvedCalorieTarget {
  calories: number;
  source: CalorieTargetSource;
}

function usable(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/** Clamp a target into the safe band. Non-finite input falls back to the default.
 *  The floor is sex-aware: 1500 for MALE/OTHER, 1200 for FEMALE or unknown. */
export function clampCalorieTarget(value: number, sex?: CalorieTargetSex | null): number {
  if (!Number.isFinite(value)) return DEFAULT_CALORIE_TARGET_KCAL;
  return Math.min(
    Math.max(Math.round(value), calorieFloorForSex(sex)),
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
    ["nutrition_goal", inputs.nutritionGoalCalories],
    ["profile", inputs.profileCalorieTarget],
    ["active_plan", inputs.activePlanCalorieTarget],
    ["plan_average", inputs.planAvgCaloriesPerDay],
  ];
  for (const [source, value] of candidates) {
    if (usable(value)) return { calories: clampCalorieTarget(value, inputs.sex), source };
  }
  return { calories: DEFAULT_CALORIE_TARGET_KCAL, source: "default" };
}
