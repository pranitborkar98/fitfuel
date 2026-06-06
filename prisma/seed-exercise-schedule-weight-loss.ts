// prisma/seed-exercise-schedule-weight-loss.ts
// 9D — Exercise Schedule (plan-linked) for the weight_loss / STANDARD program.
//
// Links to MealPlan.subCategory === "weight_loss" + tier === "STANDARD".
// A user on weight-loss-veg (subCategory "weight_loss", tier STANDARD) will
// resolve to THIS schedule via /api/user/active-plan/workout-today.
//
// Run: npx tsx prisma/seed-exercise-schedule-weight-loss.ts
//
// SAFETY: every exercise is resolved by EXACT name against the live `exercises`
// table (873 rows from free-exercise-db). If any name is missing it is a HARD
// STOP — no schedule is written with a dangling exerciseId. This is the same
// "no NEW_ID_" gate philosophy used in the recipe seeds.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

// ── Program identity ──────────────────────────────────────────────────────
// mealPlanCategory MUST equal MealPlan.subCategory for the live plan.
// weight-loss-veg has subCategory = "weight_loss".
const MEAL_PLAN_CATEGORY = "weight_loss";
const TIER = "STANDARD" as const;
const SCHEDULE_NAME = "Weight Loss — 5-Day Fat Burn";
const SCHEDULE_DESC =
  "A 5-day fat-loss program: full-body strength to protect lean mass, " +
  "steady-state cardio for sustainable burn, and one HIIT conditioning day. " +
  "Two rest days for recovery. No gym required — bodyweight + cardio machine.";
const DAYS_PER_WEEK = 5;
const SESSION_DURATION_MINS = 40;

// weeklyStructure (Json) — high-level weekly map for display / AI context.
const WEEKLY_STRUCTURE = {
  monday: ["Full Body Strength"],
  tuesday: ["Steady-State Cardio"],
  wednesday: ["Rest"],
  thursday: ["Full Body Strength + Core"],
  friday: ["HIIT Conditioning"],
  saturday: ["Steady-State Cardio"],
  sunday: ["Rest"],
};

// ── Per-exercise prescription type ─────────────────────────────────────────
// Stored in ExerciseScheduleDay.exercises as JSON.
// Either `reps` (strength) OR `durationSecs` (cardio/holds) is set.
interface PlannedExercise {
  name: string; // resolved to exerciseId at seed time (must exist)
  sets: number;
  reps?: number;
  durationSecs?: number;
  restSecs: number;
  notes?: string;
}

interface PlannedDay {
  dayOfWeek: string; // monday..sunday
  focusArea: string;
  estimatedCalories: number;
  isRestDay: boolean;
  exercises: PlannedExercise[];
}

// ── The 7-day program ──────────────────────────────────────────────────────
// All exercise names verified present in free-exercise-db (the seed source).
const PROGRAM: PlannedDay[] = [
  {
    dayOfWeek: "monday",
    focusArea: "Full Body Strength",
    estimatedCalories: 250,
    isRestDay: false,
    exercises: [
      { name: "Bodyweight Squat", sets: 3, reps: 15, restSecs: 45 },
      { name: "Pushups", sets: 3, reps: 12, restSecs: 45, notes: "Knees down if needed" },
      { name: "Bodyweight Walking Lunge", sets: 3, reps: 12, restSecs: 45, notes: "Per leg" },
      { name: "Bench Dips", sets: 3, reps: 12, restSecs: 45 },
      { name: "Plank", sets: 3, durationSecs: 40, restSecs: 30, notes: "Hold, brace core" },
    ],
  },
  {
    dayOfWeek: "tuesday",
    focusArea: "Steady-State Cardio (LISS)",
    estimatedCalories: 300,
    isRestDay: false,
    exercises: [
      {
        name: "Walking, Treadmill",
        sets: 1,
        durationSecs: 2100,
        restSecs: 0,
        notes: "35 min brisk pace, add incline to keep HR moderate",
      },
    ],
  },
  {
    dayOfWeek: "wednesday",
    focusArea: "Rest + Mobility",
    estimatedCalories: 0,
    isRestDay: true,
    exercises: [],
  },
  {
    dayOfWeek: "thursday",
    focusArea: "Full Body Strength + Core",
    estimatedCalories: 260,
    isRestDay: false,
    exercises: [
      { name: "Bodyweight Squat", sets: 3, reps: 15, restSecs: 45 },
      { name: "Pushups", sets: 3, reps: 12, restSecs: 45 },
      { name: "Bent-Knee Hip Raise", sets: 3, reps: 15, restSecs: 40 },
      { name: "Butt Lift (Bridge)", sets: 3, reps: 15, restSecs: 40 },
      { name: "Crunches", sets: 3, reps: 20, restSecs: 30 },
    ],
  },
  {
    dayOfWeek: "friday",
    focusArea: "HIIT Conditioning",
    estimatedCalories: 350,
    isRestDay: false,
    exercises: [
      { name: "Rope Jumping", sets: 5, durationSecs: 60, restSecs: 30, notes: "60s on / 30s off" },
      { name: "Mountain Climbers", sets: 4, durationSecs: 30, restSecs: 30 },
      { name: "Bodyweight Squat", sets: 4, reps: 20, restSecs: 30, notes: "Fast tempo circuit" },
    ],
  },
  {
    dayOfWeek: "saturday",
    focusArea: "Steady-State Cardio",
    estimatedCalories: 320,
    isRestDay: false,
    exercises: [
      {
        name: "Jogging, Treadmill",
        sets: 1,
        durationSecs: 1800,
        restSecs: 0,
        notes: "30 min easy conversational pace",
      },
    ],
  },
  {
    dayOfWeek: "sunday",
    focusArea: "Rest",
    estimatedCalories: 0,
    isRestDay: true,
    exercises: [],
  },
];

async function main() {
  console.log(`⏳ Seeding exercise schedule: ${SCHEDULE_NAME} (${MEAL_PLAN_CATEGORY}/${TIER})`);

  // 1. Resolve every exercise name → id. Hard stop on any miss.
  const allNames = Array.from(
    new Set(PROGRAM.flatMap((d) => d.exercises.map((e) => e.name)))
  );

  const found = await prisma.exercise.findMany({
    where: { name: { in: allNames } },
    select: { id: true, name: true },
  });

  const idByName = new Map(found.map((e) => [e.name, e.id]));
  const missing = allNames.filter((n) => !idByName.has(n));

  if (missing.length > 0) {
    console.error("❌ HARD STOP — these exercise names do not exist in the DB:");
    missing.forEach((m) => console.error(`   • ${m}`));
    console.error("Fix the names (must match `exercises.name` exactly) and re-run. Nothing written.");
    process.exit(1);
  }
  console.log(`✅ Resolved all ${allNames.length} exercises against the library`);

  // 2. Idempotent: remove any existing schedule for this category+tier (cascade
  //    deletes its ExerciseScheduleDay rows), then recreate fresh.
  const existing = await prisma.exerciseSchedule.findFirst({
    where: { mealPlanCategory: MEAL_PLAN_CATEGORY, tier: TIER },
    select: { id: true },
  });
  if (existing) {
    await prisma.exerciseSchedule.delete({ where: { id: existing.id } });
    console.log("♻️  Removed existing schedule (will recreate clean)");
  }

  // 3. Create schedule + days.
  const schedule = await prisma.exerciseSchedule.create({
    data: {
      mealPlanCategory: MEAL_PLAN_CATEGORY,
      tier: TIER,
      name: SCHEDULE_NAME,
      description: SCHEDULE_DESC,
      weeklyStructure: WEEKLY_STRUCTURE,
      daysPerWeek: DAYS_PER_WEEK,
      sessionDurationMins: SESSION_DURATION_MINS,
      workoutDays: {
        create: PROGRAM.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          focusArea: day.focusArea,
          estimatedCalories: day.estimatedCalories,
          isRestDay: day.isRestDay,
          // exercises Json: attach resolved exerciseId to each prescription
          exercises: day.exercises.map((e) => ({
            exerciseId: idByName.get(e.name)!,
            name: e.name,
            sets: e.sets,
            reps: e.reps ?? null,
            durationSecs: e.durationSecs ?? null,
            restSecs: e.restSecs,
            notes: e.notes ?? null,
          })),
        })),
      },
    },
    include: { workoutDays: true },
  });

  console.log(`\n✅ Created schedule ${schedule.id} with ${schedule.workoutDays.length} days:`);
  for (const d of schedule.workoutDays) {
    const tag = d.isRestDay ? "REST" : `${(d.exercises as unknown[]).length} ex · ${d.estimatedCalories} kcal`;
    console.log(`   ${d.dayOfWeek.padEnd(10)} ${d.focusArea.padEnd(28)} ${tag}`);
  }

  console.log("\n📋 Verify in Prisma Studio / SQL:");
  console.log(`   SELECT * FROM exercise_schedules WHERE meal_plan_category = '${MEAL_PLAN_CATEGORY}';`);
  console.log(`   SELECT day_of_week, focus_area, estimated_calories, is_rest_day FROM exercise_schedule_days WHERE schedule_id = '${schedule.id}' ORDER BY id;`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });