// app/api/user/active-plan/workout-today/route.ts
// 9D — GET today's plan-linked recommended workout for the dashboard.
//
// Resolves: UserActivePlan → mealPlan.subCategory + tier → ExerciseSchedule
// → today's ExerciseScheduleDay (by weekday) → hydrated exercise details.
//
// Returns 200 in all non-error cases (dashboard decides what to render):
//   { hasWorkout: false, reason }                         — nothing to show
//   { hasWorkout: true, isRestDay: true, ... }            — rest day card
//   { hasWorkout: true, isRestDay: false, completedToday, exercises[] }

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Prescription shape stored in ExerciseScheduleDay.exercises (Json).
interface PlannedExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number | null;
  durationSecs: number | null;
  restSecs: number;
  notes: string | null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // today @ midnight UTC — matches @db.Date storage used across the app
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  // weekday derived from the SAME UTC day so date + weekday never disagree
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC",
  })
    .format(day)
    .toLowerCase();

  // 1. Active plan → which workout program category/tier
  const activePlan = await prisma.userActivePlan.findFirst({
    where: { userId, status: "active" },
    select: {
      mealPlan: { select: { subCategory: true, tier: true } },
    },
  });

  if (!activePlan) {
    return NextResponse.json({ hasWorkout: false, reason: "no_active_plan" });
  }

  // 2. Plan-linked schedule (mealPlanCategory === subCategory, matching tier)
  const schedule = await prisma.exerciseSchedule.findFirst({
    where: {
      mealPlanCategory: activePlan.mealPlan.subCategory,
      tier: activePlan.mealPlan.tier,
    },
    include: { workoutDays: true },
  });

  if (!schedule) {
    return NextResponse.json({ hasWorkout: false, reason: "no_schedule" });
  }

  // 3. Today's day in the weekly program
  const today = schedule.workoutDays.find(
    (d) => d.dayOfWeek.toLowerCase() === weekday
  );

  if (!today) {
    return NextResponse.json({
      hasWorkout: false,
      reason: "no_day_mapping",
      scheduleName: schedule.name,
    });
  }

  if (today.isRestDay) {
    return NextResponse.json({
      hasWorkout: true,
      isRestDay: true,
      scheduleName: schedule.name,
      focusArea: today.focusArea,
      estimatedCalories: 0,
    });
  }

  // 4. Hydrate exercise details from the library
  const planned = (today.exercises as unknown as PlannedExercise[]) ?? [];
  const ids = planned.map((p) => p.exerciseId);

  const library = await prisma.exercise.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      category: true,
      equipment: true,
      primaryMuscles: true,
      images: true,
    },
  });
  const libById = new Map(library.map((e) => [e.id, e]));

  const exercises = planned.map((p) => {
    const lib = libById.get(p.exerciseId);
    return {
      exerciseId: p.exerciseId,
      name: lib?.name ?? p.name,
      sets: p.sets,
      reps: p.reps,
      durationSecs: p.durationSecs,
      restSecs: p.restSecs,
      notes: p.notes,
      // display extras (null-safe if a lib row was removed)
      category: lib?.category ?? null,
      equipment: lib?.equipment ?? null,
      primaryMuscles: lib?.primaryMuscles ?? [],
      image: lib?.images?.[0] ?? null,
    };
  });

  // 5. Already completed today?
  const doneToday = await prisma.workoutSession.findFirst({
    where: { userId, date: day, completedAt: { not: null } },
    select: { id: true, caloriesBurned: true },
  });

  return NextResponse.json({
    hasWorkout: true,
    isRestDay: false,
    scheduleName: schedule.name,
    focusArea: today.focusArea,
    estimatedCalories: today.estimatedCalories,
    durationMins: schedule.sessionDurationMins,
    completedToday: !!doneToday,
    completedCaloriesBurned: doneToday?.caloriesBurned ?? null,
    exercises,
  });
}
