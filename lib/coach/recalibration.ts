// lib/coach/recalibration.ts
// LOOP-6 — adaptive recalibration engine. PURE function: given a WeeklySummary,
// compare the measured weight trend against the goal's target rate and recommend
// a calorie-target adjustment. No LLM, no DB — just the energy-balance math.

import type { Goal, Recalibration, WeeklySummary } from "./types";

const KCAL_PER_KG = 7700; // approx energy in 1 kg of body mass
const MAX_DELTA = 300; // cap a single recalibration to ±300 kcal/day (no big swings)
const FLOOR = 1200; // never recommend a target below this

// Target weekly weight change (kg/week) per goal.
const EXPECTED_RATE: Record<Goal, number> = {
  LOSE_WEIGHT: -0.5,
  GAIN_MUSCLE: 0.25,
  MAINTAIN: 0,
  IMPROVE_FITNESS: 0,
  MANAGE_CONDITION: 0,
};

// Tolerance band (kg/week) around the target before we suggest a change.
function toleranceFor(goal: Goal): number {
  return goal === "LOSE_WEIGHT" || goal === "GAIN_MUSCLE" ? 0.25 : 0.3;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function fmt(n: number): string {
  const s = n >= 0 ? "+" : "−";
  return `${s}${Math.abs(n).toFixed(2)}`;
}

export function computeRecalibration(summary: WeeklySummary): Recalibration {
  const goal = summary.goal;
  const expected = goal ? EXPECTED_RATE[goal] : 0;
  const currentTarget = summary.calorieTarget > 0 ? summary.calorieTarget : 2000;

  const base: Omit<Recalibration, "status" | "rationale" | "recommendedTarget" | "deltaKcal" | "canApply"> = {
    goal,
    actualRateKgPerWeek: summary.weightRateKgPerWeek,
    expectedRateKgPerWeek: expected,
    currentTarget,
  };

  // Not enough weigh-ins to trust a trend.
  if (summary.weightRateKgPerWeek === null || summary.weighInsInWindow < 2) {
    return {
      ...base,
      status: "insufficient_data",
      recommendedTarget: currentTarget,
      deltaKcal: 0,
      canApply: false,
      rationale:
        "Not enough weigh-ins yet to read a reliable trend — log at least two weigh-ins about two weeks apart and I'll recalibrate.",
    };
  }

  const actual = summary.weightRateKgPerWeek;
  const tol = goal ? toleranceFor(goal) : 0.3;
  const gap = actual - expected; // >0 = trending heavier than target; <0 = lighter

  // Within tolerance → on track, no change.
  if (Math.abs(gap) <= tol) {
    return {
      ...base,
      status: "on_track",
      recommendedTarget: currentTarget,
      deltaKcal: 0,
      canApply: false,
      rationale: `Your trend (${fmt(actual)} kg/wk) is right where a ${labelGoal(goal)} goal wants it (${fmt(
        expected
      )} kg/wk). Hold the line.`,
    };
  }

  // Compute the intake change that would close the gap, capped + floored.
  const rawDelta = (-gap * KCAL_PER_KG) / 7; // gap>0 (too heavy) → eat less; gap<0 → eat more
  const delta = Math.round(clamp(rawDelta, -MAX_DELTA, MAX_DELTA) / 10) * 10;
  const recommendedTarget = Math.max(FLOOR, currentTarget + delta);
  const actualDelta = recommendedTarget - currentTarget;

  const status = classify(goal, expected, actual, tol);
  return {
    ...base,
    status,
    recommendedTarget,
    deltaKcal: actualDelta,
    canApply: actualDelta !== 0,
    rationale: rationaleFor(status, goal, actual, expected, actualDelta),
  };
}

function classify(goal: Goal | null, expected: number, actual: number, tol: number): Recalibration["status"] {
  const gap = actual - expected;
  if (expected < 0) {
    // loss goal
    if (actual >= 0.15) return "wrong_direction"; // gaining
    if (Math.abs(actual) < 0.1) return "stalled";
    return gap > tol ? "too_slow" : "too_fast";
  }
  if (expected > 0) {
    // gain goal
    if (actual <= -0.15) return "wrong_direction"; // losing
    return gap < -tol ? "too_slow" : "too_fast";
  }
  // maintain
  return "wrong_direction";
}

function labelGoal(goal: Goal | null): string {
  switch (goal) {
    case "LOSE_WEIGHT":
      return "weight-loss";
    case "GAIN_MUSCLE":
      return "muscle-gain";
    case "MAINTAIN":
      return "maintenance";
    case "IMPROVE_FITNESS":
      return "fitness";
    case "MANAGE_CONDITION":
      return "condition-management";
    default:
      return "current";
  }
}

function rationaleFor(
  status: Recalibration["status"],
  goal: Goal | null,
  actual: number,
  expected: number,
  delta: number
): string {
  const dir = delta < 0 ? "trim" : "add";
  const amt = Math.abs(delta);
  const trend = `${fmt(actual)} kg/wk`;
  const tgt = `${fmt(expected)} kg/wk`;
  switch (status) {
    case "stalled":
      return `Your weight has stalled (${trend}) but a ${labelGoal(goal)} goal targets ${tgt}. ${cap(
        dir
      )}ming your daily target by ${amt} kcal should restart progress.`;
    case "wrong_direction":
      return `You're trending the wrong way (${trend}) for a ${labelGoal(goal)} goal (${tgt}). I'd ${dir} ${amt} kcal/day to turn it around.`;
    case "too_slow":
      return `Progress is slower than target (${trend} vs ${tgt}). ${cap(dir)}ming ${amt} kcal/day should bring it in line.`;
    case "too_fast":
      return `You're moving faster than target (${trend} vs ${tgt}) — that risks muscle/energy. I'd ${dir} ${amt} kcal/day to ease it to a sustainable pace.`;
    default:
      return `Adjusting your daily target by ${delta} kcal aligns your trend with your goal.`;
  }
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
