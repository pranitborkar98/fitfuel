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

/* ── The provider boundary (Phase 12B) ──────────────────────────────────────
   These three lived in client.ts until the coach gained a second provider.
   They moved here so a provider module can import them without importing the
   client — which would be a cycle, and would drag the Anthropic SDK into the
   Gemini path for no reason. Re-exported from client.ts so nothing that
   already imports them had to change. */

/** One turn of the stored conversation. */
export type TrainerTurn = { role: "user" | "assistant"; content: string };

/** A line of the response stream. Newline-delimited JSON: `t` is text to
 *  append, `e` is a notice to show in place of a reply, `c` is the conversation
 *  id to send back with the next turn. */
export type TrainerChunk = { t: string } | { e: string } | { c: string };

/** What the turn produced, handed to the caller once the stream has drained so
 *  persistence lives in the route rather than in the client. Reported even when
 *  the turn failed — a refusal and a half-written reply are both worth keeping. */
export type TrainerOutcome = {
  reply: string;
  inputTokens?: number;
  outputTokens?: number;
  refusedReason?: string;
  /** Which provider actually answered, for the stored message row. */
  model?: string;
};
