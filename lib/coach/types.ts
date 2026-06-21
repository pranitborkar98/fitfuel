// lib/coach/types.ts
// AI Coach — shared types. The Coach core is built as a deterministic spine
// (Sense → Summarise → Reason → Act). The "Reason" layer ships rules-based now
// and swaps to an LLM later WITHOUT changing these contracts: same WeeklySummary
// in, same WeeklyReview out.

export type Goal =
  | "LOSE_WEIGHT"
  | "GAIN_MUSCLE"
  | "MAINTAIN"
  | "IMPROVE_FITNESS"
  | "MANAGE_CONDITION";

export interface WeeklySummary {
  hasPlan: boolean;
  goal: Goal | null;

  // weight
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  weightRateKgPerWeek: number | null; // measured trend; null if insufficient weigh-ins
  weighInsInWindow: number;

  // calories
  calorieTarget: number;
  avgCaloriesIn: number;
  avgCaloriesOut: number;
  avgNet: number;
  calorieDaysWithData: number;

  // macros
  proteinTarget: number;
  avgProtein: number;

  // adherence
  mealsLogged: number;
  mealsScheduled: number;
  workoutsCompleted: number;
  streakDays: number;
  daysActive: number;

  // consistency
  consistencyScore: number | null;
  consistencyLabel: string | null;
}

export type RecalStatus =
  | "on_track"
  | "too_slow"
  | "too_fast"
  | "stalled"
  | "wrong_direction"
  | "insufficient_data";

export interface Recalibration {
  status: RecalStatus;
  goal: Goal | null;
  actualRateKgPerWeek: number | null;
  expectedRateKgPerWeek: number;
  currentTarget: number;
  recommendedTarget: number; // === currentTarget when no change
  deltaKcal: number; // recommendedTarget - currentTarget
  rationale: string;
  canApply: boolean; // true when there is a non-zero, applicable change
}

export interface WeeklyReview {
  generatedAt: string;
  headline: string;
  whatsWorking: string[];
  focusThisWeek: string[];
  recalibration: Recalibration;
  oneQuestion: string;
  source: "rules" | "llm"; // which Reason layer produced this
  summary: WeeklySummary;
}
