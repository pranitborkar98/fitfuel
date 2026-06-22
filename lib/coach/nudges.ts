// lib/coach/nudges.ts
// AI Coach — proactive nudge detector. PURE + deterministic: takes the same
// WeeklySummary the spine already builds (+ the Recalibration) and returns the
// coach signals worth surfacing. No DB, no I/O, no API key — fully testable.
//
// The cron (daily-nudges) maps each returned nudge to a NotificationTemplate
// and sends it via the existing notify pipeline with per-(user,template) dedup.
// Low-rating is handled directly in the cron (it's per-meal, not per-summary).

import type { WeeklySummary, Recalibration } from "./types";

export type CoachNudgeKind = "plateau" | "milestone" | "missed_workouts";

export interface CoachNudge {
  kind: CoachNudgeKind;
  templateKey: string; // matches a seeded NotificationTemplate key
  dedupHours: number; // don't re-send within this window
  vars: Record<string, string>;
}

// |kg/week| below this counts as effectively flat.
const PLATEAU_RATE_KG = 0.1;
// "Engaged but not training" floor — only nudge missed-workouts if they're
// otherwise active, so we don't pile on someone who's gone fully quiet
// (that's re_engagement's job, not the coach's).
const MISSED_MIN_DAYS_ACTIVE = 3;

const WEEK = 7 * 24;
const MONTH = 30 * 24;

export function detectCoachNudges(
  summary: WeeklySummary,
  recal: Recalibration,
): CoachNudge[] {
  const out: CoachNudge[] = [];
  if (!summary.hasPlan) return out;

  const wantsMovement =
    summary.goal === "LOSE_WEIGHT" || summary.goal === "GAIN_MUSCLE";

  // ── Milestone: target weight reached (direction-aware). Compute first so a
  //    "you've arrived" message never collides with a "you've stalled" one. ──
  let milestoneHit = false;
  if (summary.currentWeightKg !== null && summary.targetWeightKg !== null) {
    milestoneHit =
      (summary.goal === "LOSE_WEIGHT" &&
        summary.currentWeightKg <= summary.targetWeightKg) ||
      (summary.goal === "GAIN_MUSCLE" &&
        summary.currentWeightKg >= summary.targetWeightKg);
    if (milestoneHit) {
      out.push({
        kind: "milestone",
        templateKey: "coach_milestone",
        dedupHours: MONTH, // celebrate ~once per cycle, not daily
        vars: { targetWeight: String(summary.targetWeightKg) },
      });
    }
  }

  // ── Plateau: goal wants movement, but the measured trend is flat (or the
  //    recalibration engine flagged a stall). Needs a real measured rate, so we
  //    never nag on thin data. Suppressed when they've actually hit target. ──
  if (
    !milestoneHit &&
    wantsMovement &&
    summary.weightRateKgPerWeek !== null &&
    (recal.status === "stalled" ||
      Math.abs(summary.weightRateKgPerWeek) < PLATEAU_RATE_KG)
  ) {
    out.push({
      kind: "plateau",
      templateKey: "coach_plateau",
      dedupHours: WEEK,
      vars: {
        goalWord: summary.goal === "LOSE_WEIGHT" ? "loss" : "gain",
      },
    });
  }

  // ── Missed workouts: engaged (active ≥ 3 days) but zero sessions logged in
  //    the window. ──
  if (
    summary.workoutsCompleted === 0 &&
    summary.daysActive >= MISSED_MIN_DAYS_ACTIVE
  ) {
    out.push({
      kind: "missed_workouts",
      templateKey: "coach_missed_workouts",
      dedupHours: WEEK,
      vars: {},
    });
  }

  return out;
}
