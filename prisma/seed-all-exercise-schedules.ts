/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config"; // ← load .env so DATABASE_URL is set before lib/prisma builds the pool
// prisma/seed-all-exercise-schedules.ts
// EX-1: generate an ExerciseSchedule (+ 7 days) for EVERY (subCategory × tier)
// combination that exists across the meal plans — closing LOOP-5/2. Idempotent:
// re-running deletes and regenerates each schedule (deterministic, so output is
// stable). Run the modality backfill FIRST so cardio/HIIT/mobility days populate.
//
//   npx tsx prisma/backfill-exercise-modality.ts   # 1. assign modality + met
//   npx tsx prisma/seed-all-exercise-schedules.ts  # 2. generate all schedules

import { prisma } from "../lib/prisma";
import { generateProgram, type PoolExercise } from "../lib/exercise-program";

const db = prisma as any;

async function main() {
  // 1. Exercise pool
  const pool: PoolExercise[] = await db.exercise.findMany({
    select: {
      id: true,
      name: true,
      modality: true,
      met: true,
      category: true,
      equipment: true,
      primaryMuscles: true,
      level: true,
    },
  });

  if (pool.length === 0) {
    console.error("❌ No exercises in DB. Seed the exercise library first.");
    process.exit(1);
  }

  const cardio = pool.filter((e) => e.modality === "cardio").length;
  const mobility = pool.filter((e) => e.modality === "mobility").length;
  const hiit = pool.filter((e) => e.modality === "hiit").length;
  console.log(`📚 Pool: ${pool.length} exercises  (cardio ${cardio} · hiit ${hiit} · mobility ${mobility})`);
  if (cardio === 0 || mobility === 0) {
    console.warn("⚠️  modality looks un-backfilled — cardio/HIIT/mobility days may be sparse.");
    console.warn("    Run `npx tsx prisma/backfill-exercise-modality.ts` first, then re-run this.\n");
  }

  // 2. Targets = distinct (subCategory, tier) across all meal plans
  const plans = await db.mealPlan.findMany({
    select: { subCategory: true, tier: true },
    distinct: ["subCategory", "tier"],
    orderBy: [{ subCategory: "asc" }, { tier: "asc" }],
  });
  console.log(`🎯 Targets: ${plans.length} (subCategory × tier) combinations\n`);

  let created = 0;
  for (const p of plans) {
    const program = generateProgram({ subCategory: p.subCategory, tier: p.tier, pool });

    // idempotent: drop any existing schedule for this (category, tier) — cascade removes its days
    const existing = await db.exerciseSchedule.findFirst({
      where: { mealPlanCategory: p.subCategory, tier: p.tier },
      select: { id: true },
    });
    if (existing) await db.exerciseSchedule.delete({ where: { id: existing.id } });

    await db.exerciseSchedule.create({
      data: {
        mealPlanCategory: p.subCategory,
        tier: p.tier,
        name: program.name,
        description: program.description,
        weeklyStructure: program.weeklyStructure,
        daysPerWeek: program.daysPerWeek,
        sessionDurationMins: program.sessionDurationMins,
        workoutDays: {
          create: program.days.map((d) => ({
            dayOfWeek: d.dayOfWeek,
            focusArea: d.focusArea,
            estimatedCalories: d.estimatedCalories,
            isRestDay: d.isRestDay,
            exercises: d.exercises, // Json: [{ exerciseId, name, sets, reps?, durationSecs?, restSecs, protocol?, notes? }]
          })),
        },
      },
    });

    created++;
    const sessions = program.days.filter((d) => !d.isRestDay).length;
    console.log(
      `  ✓ ${p.subCategory.padEnd(18)} ${String(p.tier).padEnd(9)} ${program.daysPerWeek}d/wk (${sessions} sessions)`
    );
  }

  console.log(`\n✅ Generated ${created} exercise schedules — LOOP-5/2 closed for every plan.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
