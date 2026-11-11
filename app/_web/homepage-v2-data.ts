// app/_web/homepage-v2-data.ts
//
// PURE DATA FOR THE v2 HOMEPAGE — no CSS, no Prisma, no "use client".
//
// Same boundary rule as app/_hp/menu-types.ts: the components that consume
// this are client components, and the tests in tests/homepage-v2-contracts
// import it under plain node. Anything that pulls in a stylesheet, pg or a
// server-only module breaks both, so this file imports only menu-types and
// home-data (both pure).
//
// Every number here is either computed from a prop (day-one sums, proof line)
// or labelled example data (the weight series, the body-metric tiles). Nothing
// is a price, a quote or a partner claim.

import type { Dish } from "@/app/_hp/menu-types";
import { COACH_WEEKS } from "./home-data";

/* ── Day-one totals ─────────────────────────────────────────────────────────
   The hero day strip, the proof band's fourth figure and the builder food
   strip all read the SAME computed sums. totals() in menu-types only sums
   kcal + protein; the stacked macro bar needs carbs and fat too. */
export type DayTotals = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export function dayTotals(dishes: Dish[]): DayTotals {
  return {
    kcal: dishes.reduce((n, d) => n + (d.kcal ?? 0), 0),
    protein: dishes.reduce((n, d) => n + (d.protein ?? 0), 0),
    carbs: dishes.reduce((n, d) => n + (d.carbs ?? 0), 0),
    fat: dishes.reduce((n, d) => n + (d.fat ?? 0), 0),
  };
}

/** Macro-calorie shares for the stacked bar: protein 4, carbs 4, fat 9 kcal/g. */
export function macroShares(t: DayTotals): { protein: number; carbs: number; fat: number } {
  const kp = t.protein * 4;
  const kc = t.carbs * 4;
  const kf = t.fat * 9;
  const total = kp + kc + kf;
  if (total <= 0) return { protein: 0, carbs: 0, fat: 0 };
  return { protein: kp / total, carbs: kc / total, fat: kf / total };
}

/* ── Hero proof line ────────────────────────────────────────────────────────
   The line under the hero CTAs must never read "0 plans" (v1's local render).
   With no seeded counts it falls back to the licence alone. */
export function proofLine(
  planRows: number,
  goalCount: number,
  licence: string,
): string {
  if (!planRows || !goalCount) return `FSSAI ${licence}`;
  return `${planRows.toLocaleString("en-IN")} plans · ${goalCount} goals and conditions · FSSAI ${licence}`;
}

/* ── 30-day example weight series ───────────────────────────────────────────
   Deterministic, interpolated between anchor points. The anchors are the four
   COACH_WEEKS readings (78.4 → 78.1 → 78.0 → 78.1 kg) plus the live reading
   the preview band already prints (78.2 kg today) and the 30-day start
   (80.1 kg). The series is an illustration of the chart, labelled "Example
   member day" everywhere it renders — never a claim about any person.
   Stall week (week 3, 78.0 kg) sits at day -10. */
export type WeightPoint = { day: number; kg: number };

const SERIES_ANCHORS: WeightPoint[] = [
  { day: -30, kg: 80.1 },
  { day: -24, kg: 78.4 },
  { day: -17, kg: 78.1 },
  { day: -10, kg: 78.0 },
  { day: -3, kg: 78.1 },
  { day: 0, kg: 78.2 },
];

/** Day of the stall annotation (week 3 anchor). */
export const STALL_DAY = -10;
/** The live reading the series ends on. */
export const EXAMPLE_WEIGHT_KG = 78.2;

export function buildWeightSeries(): WeightPoint[] {
  const points: WeightPoint[] = [];
  for (let day = -30; day <= 0; day++) {
    let kg: number;
    const exact = SERIES_ANCHORS.find((a) => a.day === day);
    if (exact) {
      kg = exact.kg;
    } else {
      const after = SERIES_ANCHORS.find((a) => a.day > day)!;
      const before = [...SERIES_ANCHORS].reverse().find((a) => a.day < day)!;
      const k = (day - before.day) / (after.day - before.day);
      kg = Math.round((before.kg + (after.kg - before.kg) * k) * 10) / 10;
    }
    points.push({ day, kg });
  }
  return points;
}

/** The four weekly coach points, straight from COACH_WEEKS. */
export function coachWeekSeries(): WeightPoint[] {
  return COACH_WEEKS.map((w, i) => ({ day: i, kg: w.kg }));
}

/* ── Body metrics: the 18 readings ──────────────────────────────────────────
   Enumerated from app/dashboard/body-metrics/BodyMetricsClient.tsx PARAM_DEFS
   (18 entries) and the BodyMetric model in prisma/schema.prisma. The sample
   data (app/dashboard-preview/sample-data.ts) carries NO body-metric values,
   so only weight has a real figure (78.2 kg, the example live reading). Every
   other tile renders its name + "Estimated" and no number — never an invented
   value. */
export type BodyMetricTile = {
  key: string;
  label: string;
  unit: string;
  value: string | null;
  estimated: boolean;
};

export const BODY_METRICS_18: BodyMetricTile[] = [
  { key: "weight", label: "Weight", unit: "kg", value: "78.2", estimated: false },
  { key: "bmi", label: "BMI", unit: "", value: null, estimated: true },
  { key: "bodyFatRate", label: "Body fat", unit: "%", value: null, estimated: true },
  { key: "fatMass", label: "Fat mass", unit: "kg", value: null, estimated: true },
  { key: "fatFreeWeight", label: "Fat-free weight", unit: "kg", value: null, estimated: true },
  { key: "subcutaneousFat", label: "Subcutaneous fat", unit: "%", value: null, estimated: true },
  { key: "visceralFat", label: "Visceral fat", unit: "level", value: null, estimated: true },
  { key: "bodyWater", label: "Body water", unit: "%", value: null, estimated: true },
  { key: "waterWeight", label: "Water weight", unit: "kg", value: null, estimated: true },
  { key: "skeletalMuscle", label: "Skeletal muscle", unit: "%", value: null, estimated: true },
  { key: "muscleMass", label: "Muscle mass", unit: "kg", value: null, estimated: true },
  { key: "muscleRate", label: "Muscle rate", unit: "%", value: null, estimated: true },
  { key: "boneMass", label: "Bone mass", unit: "kg", value: null, estimated: true },
  { key: "protein", label: "Protein", unit: "%", value: null, estimated: true },
  { key: "proteinMass", label: "Protein mass", unit: "kg", value: null, estimated: true },
  { key: "bmr", label: "BMR", unit: "kcal", value: null, estimated: true },
  { key: "bodyAge", label: "Metabolic age", unit: "yrs", value: null, estimated: true },
  { key: "idealWeight", label: "Ideal weight", unit: "kg", value: null, estimated: true },
];

/** The six hero tiles: weight plus the five the preview band already named. */
export const HERO_METRICS_6 = BODY_METRICS_18.filter((m) =>
  ["weight", "bmi", "bodyFatRate", "muscleMass", "visceralFat", "bodyAge"].includes(m.key),
);

/* ── Training session ───────────────────────────────────────────────────────
   PLAN §6.4 names "Goblet squat 3 × 10, Dumbbell press 3 × 12" as the
   sample-data sets. The sample-data file does NOT contain those exercises —
   its workout is Bodyweight squat 3 × 12, Incline push-up 3 × 10, Plank
   3 × 30 sec (app/dashboard-preview/sample-data.ts). The plan's own rule is
   "sets from the sample data", so the sample-data sets win and the
   parenthetical names are the error, recorded in the phase report. */
export type TrainingSet = { name: string; sets: number; reps: number | null; secs: number | null };

export const TRAINING_SESSION: TrainingSet[] = [
  { name: "Bodyweight squat", sets: 3, reps: 12, secs: null },
  { name: "Incline push-up", sets: 3, reps: 10, secs: null },
  { name: "Plank", sets: 3, reps: null, secs: 30 },
];

export function setLabel(set: TrainingSet): string {
  if (set.secs !== null) return `${set.sets} × ${set.secs} sec`;
  return `${set.sets} × ${set.reps}`;
}

/* ── Coach chat ─────────────────────────────────────────────────────────────
   New product copy, drafted from COACH_WEEKS + lib/coach/recalibration.ts
   (cap ±300 kcal, floor 1,200 kcal). Numbers match the data exactly; the card
   is labelled "Example conversation". Working material for chintu's review. */
export type ChatBubble = { from: "member" | "coach"; text: string };

export const COACH_CHAT: ChatBubble[] = [
  {
    from: "member",
    text: "I have stalled for two weeks. What should change?",
  },
  {
    from: "coach",
    text: "Week 3 held at 78.0 kg after 78.1 kg in week 2, and week 4 is 78.1 kg. One flat week is a stall flag, not a trend, but two flat weeks in a row is enough to act on. The weekly review proposes 1,700 kcal, down 300 kcal from 2,000 kcal. That is the largest single change the engine makes.",
  },
];

/* ── Goal boxes ─────────────────────────────────────────────────────────────
   The four photo tiles in §3.9. Images are interim reuses (§5.1) until real
   goal photos are shot. Counts are computed live in FitFuelApp from the plan
   rows (never typed here); `filter` is what the box does to the catalog. */
export type GoalBox = {
  key: string;
  label: string;
  line: string;
  img: string;
  alt: string;
  filter: { cat: "all" | "STANDARD" | "LIFESTYLE_MEDICAL" | "SPORTS"; query: string };
};

/** Day-1 trial-day meal images, keyed by slot. The same four images the
    hero mosaic uses; the builder food strip reuses them. */
export const TRIAL_MEAL_IMAGES: Record<string, string> = {
  BREAKFAST: "/images/ai/recipes/maharashtrian-moong-dal-chilla-with-green.webp",
  LUNCH: "/images/ai/recipes/chettinad-cauliflower-steak-with-black-pepper.webp",
  SNACK: "/images/ai/recipes/rajasthani-makhana-chaat-with-tamarind-chutney.webp",
  DINNER: "/images/ai/recipes/north-indian-palak-paneer-with-jowar.webp",
};

export const GOAL_BOXES: GoalBox[] = [
  {
    key: "weight-loss",
    label: "Weight loss",
    line: "Measured portions, a target that moves with your trend.",
    img: "/images/ai/story/meal-training-loop.webp",
    alt: "Illustration of the meal and training loop",
    filter: { cat: "STANDARD", query: "weight loss" },
  },
  {
    key: "muscle",
    label: "Muscle",
    line: "Protein-led plans with training programmed in.",
    img: "/images/training.jpg",
    alt: "Training session in progress",
    filter: { cat: "STANDARD", query: "muscle" },
  },
  {
    key: "medical",
    label: "Medical",
    line: "Condition-focused menus, checked with your clinician.",
    img: "/images/brand/meals-weighed-in-kitchen.webp",
    alt: "Illustration of a meal being portioned on a kitchen scale",
    filter: { cat: "LIFESTYLE_MEDICAL", query: "" },
  },
  {
    key: "sports",
    label: "Sports",
    line: "Fuel for training days and competition weeks.",
    img: "/images/gym.jpg",
    alt: "A gym floor",
    filter: { cat: "SPORTS", query: "" },
  },
];
