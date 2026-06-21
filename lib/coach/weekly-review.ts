// lib/coach/weekly-review.ts
// AI Coach — Reason layer (rules-based v1). Turns the WeeklySummary +
// recalibration into a structured WeeklyReview. Deterministic templates now;
// when an LLM key is available this whole function is swapped for a Claude call
// with the SAME inputs/outputs (source flips to "llm").

import { buildWeeklySummary } from "./weekly-summary";
import { computeRecalibration } from "./recalibration";
import type { WeeklyReview, WeeklySummary } from "./types";

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

function buildReviewFromSummary(summary: WeeklySummary): WeeklyReview {
  const recal = computeRecalibration(summary);
  const working: string[] = [];
  const focus: string[] = [];

  // ── protein adherence ──
  if (summary.proteinTarget > 0) {
    const p = pct(summary.avgProtein, summary.proteinTarget);
    if (p >= 90) working.push(`Protein is on point — averaging ${summary.avgProtein}g (${p}% of your ${summary.proteinTarget}g target).`);
    else if (p < 75) focus.push(`Protein is short — averaging ${summary.avgProtein}g vs a ${summary.proteinTarget}g target. Aim to close that gap; it protects muscle and curbs hunger.`);
  }

  // ── workouts ──
  if (summary.workoutsCompleted >= 3) working.push(`${summary.workoutsCompleted} workouts logged — strong training week.`);
  else if (summary.hasPlan && summary.workoutsCompleted <= 1) focus.push(`Only ${summary.workoutsCompleted} workout${summary.workoutsCompleted === 1 ? "" : "s"} logged. Your plan has sessions waiting — even two this week moves the needle.`);

  // ── logging streak / adherence ──
  if (summary.streakDays >= 5) working.push(`${summary.streakDays}-day logging streak — that consistency is what makes the rest work.`);
  else if (summary.mealsScheduled > 0) {
    const m = pct(summary.mealsLogged, summary.mealsScheduled);
    if (m < 60) focus.push(`Meal logging is patchy (${m}% of planned meals). The coach can only steer what it can see — log as you go.`);
  }

  // ── weight trajectory ──
  if (summary.weightRateKgPerWeek !== null && summary.currentWeightKg !== null) {
    const r = summary.weightRateKgPerWeek;
    const dirOk =
      (summary.goal === "LOSE_WEIGHT" && r < -0.1) ||
      (summary.goal === "GAIN_MUSCLE" && r > 0.1) ||
      ((summary.goal === "MAINTAIN" || summary.goal === "IMPROVE_FITNESS" || summary.goal === "MANAGE_CONDITION") && Math.abs(r) <= 0.3);
    if (dirOk) working.push(`Weight is trending the right way (${r >= 0 ? "+" : "−"}${Math.abs(r).toFixed(2)} kg/wk) for your goal.`);
  }

  // ── consistency score ──
  if (summary.consistencyScore !== null) {
    if (summary.consistencyScore >= 75) working.push(`Consistency score ${summary.consistencyScore} (${summary.consistencyLabel}).`);
    else if (summary.consistencyScore < 50) focus.push(`Consistency score is ${summary.consistencyScore} (${summary.consistencyLabel}). Pick one habit — logging, a workout, a weigh-in — and nail it daily.`);
  }

  // ── recalibration → a focus item ──
  if (recal.canApply) focus.push(recal.rationale);

  // ── headline ──
  let headline: string;
  if (!summary.hasPlan) headline = "Get a plan active and I'll start coaching the whole loop.";
  else if (recal.status === "insufficient_data") headline = "Solid start — a couple more weigh-ins and I can fine-tune your targets.";
  else if (working.length >= 2 && focus.length === 0) headline = "Great week — everything's pointing the right way.";
  else if (recal.canApply) headline = "Good week with one adjustment worth making.";
  else if (focus.length > working.length) headline = "A few things to tighten up this week.";
  else headline = "Steady week — keep the momentum.";

  if (working.length === 0) working.push("You showed up and logged — that's the foundation everything else builds on.");

  // ── one MI-style question ──
  let question: string;
  if (recal.canApply) question = "Does that target change feel doable this week, or should we ease into it?";
  else if (focus.length > 0) question = `Of the focus areas above, which one feels most realistic to commit to this week?`;
  else question = "What's one thing that made this week work that you can repeat?";

  return {
    generatedAt: new Date().toISOString(),
    headline,
    whatsWorking: working,
    focusThisWeek: focus,
    recalibration: recal,
    oneQuestion: question,
    source: "rules",
    summary,
  };
}

export async function buildWeeklyReview(userId: string): Promise<WeeklyReview> {
  const summary = await buildWeeklySummary(userId);
  return buildReviewFromSummary(summary);
}
