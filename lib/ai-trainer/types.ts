// lib/ai-trainer/types.ts
// Phase 12A — the snapshot the AI trainer reasons over. Summaries, never raw rows:
// 30 days of MealLog is rolled up to averages plus the few meals with extreme
// ratings. The serialised form targets ~1.5-2k tokens.

export type TrainerGoal =
  | "LOSE_WEIGHT"
  | "GAIN_MUSCLE"
  | "MAINTAIN"
  | "IMPROVE_FITNESS"
  | "MANAGE_CONDITION";

export type ConsistencyComponentKey =
  | "meals"
  | "workouts"
  | "water"
  | "weighIn"
  | "noSkips";

export type Momentum = "improving" | "flat" | "declining";

export interface RatedMeal {
  name: string;
  slot: string;
  rating: number;
  note: string | null;
}

export interface TrainerContext {
  generatedAt: string;

  profile: {
    name: string | null;
    age: number | null;
    sex: string | null;
    heightCm: number | null;
    currentWeightKg: number | null;
    targetWeightKg: number | null;
    goal: TrainerGoal | null;
    activityLevel: string | null;
    diet: string | null;
    healthConditions: string[];
    allergies: string[];
    dietaryRestrictions: string[];
    tdee: number | null;
    calorieTarget: number;
    // "default" means nothing in the system set a target and this is a generic
    // fallback — the coach must not present it as the user's number.
    calorieTargetSource: "plan" | "profile" | "default";
    proteinTarget: number | null;
    carbTarget: number | null;
    fatTarget: number | null;
  };

  plan: {
    slug: string;
    name: string;
    tier: string;
    currentDay: number;
    cycleLengthDays: number;
    startDate: string;
    deliveryWindow: string;
  } | null;

  nutrition7d: {
    daysTracked: number;
    avgKcalIn: number;
    avgKcalOut: number;
    avgNet: number;
    targetKcal: number;
    adherencePct: number | null;
    avgProtein: number;
    proteinTarget: number | null;
    topRatedMeals: RatedMeal[];
    lowRatedMeals: RatedMeal[];
  };

  workouts7d: {
    scheduled: number;
    completed: number;
    totalKcalBurned: number;
    lastSessionDate: string | null;
    programType: string | null;
  };

  body: {
    latestWeightKg: number | null;
    // How stale that reading is. A two-month-old weight quoted as today's is the
    // fastest way for the coach to sound like it hasn't been watching.
    latestWeightAgeDays: number | null;
    weighInsLast30d: number;
    // Genuine 30-day delta, null unless there are two weigh-ins inside the window.
    trend30dKg: number | null;
    bodyFatPct: number | null;
    muscleMassKg: number | null;
    bmi: number | null;
  };

  consistency: {
    thisWeekScore: number | null;
    label: string | null;
    components: Record<ConsistencyComponentKey, number>;
    trend4w: number[];
  };

  supplements: {
    goalLabel: string | null;
    recommendedStack: string[];
  };

  derived: {
    plateauDetected: boolean;
    streakDays: number;
    biggestGap: ConsistencyComponentKey | null;
    momentum: Momentum;
  };
}
