// app/api/user/active-plan/workout/complete/route.ts
// 9D — POST: mark today's plan-linked workout complete.
//
// Writes a WorkoutSession (date = today, caloriesBurned = day.estimatedCalories,
// completedAt = now) plus WorkoutExercise + WorkoutSet rows from the schedule.
// This is the row net-calories.ts reads → `burned` stops being 0.
//
// Server-authoritative: it recomputes today's scheduled day itself rather than
// trusting the client, so a user can't claim calories for a day they aren't on.
// Idempotent: one completed session per user per day (returns 409 if already done).

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface PlannedExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number | null;
  durationSecs: number | null;
  restSecs: number;
  notes: string | null;
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const now = new Date();
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC",
  })
    .format(day)
    .toLowerCase();

  // 1. Active plan → program
  const activePlan = await prisma.userActivePlan.findFirst({
    where: { userId, status: "active" },
    select: { mealPlan: { select: { subCategory: true, tier: true } } },
  });
  if (!activePlan) {
    return NextResponse.json({ error: "No active plan" }, { status: 404 });
  }

  const schedule = await prisma.exerciseSchedule.findFirst({
    where: {
      mealPlanCategory: activePlan.mealPlan.subCategory,
      tier: activePlan.mealPlan.tier,
    },
    include: { workoutDays: true },
  });
  if (!schedule) {
    return NextResponse.json({ error: "No workout schedule for this plan" }, { status: 404 });
  }

  const today = schedule.workoutDays.find(
    (d) => d.dayOfWeek.toLowerCase() === weekday
  );
  if (!today || today.isRestDay) {
    return NextResponse.json(
      { error: "No workout scheduled today (rest day)" },
      { status: 400 }
    );
  }

  // 2. Idempotency — one completed session per user per day
  const existing = await prisma.workoutSession.findFirst({
    where: { userId, date: day, completedAt: { not: null } },
    select: { id: true, caloriesBurned: true },
  });
  if (existing) {
    return NextResponse.json(
      {
        success: true,
        alreadyCompleted: true,
        workoutSessionId: existing.id,
        caloriesBurned: existing.caloriesBurned ?? 0,
      },
      { status: 409 }
    );
  }

  // 3. Build session with nested exercises + sets from the prescription
  const planned = (today.exercises as unknown as PlannedExercise[]) ?? [];

  const created = await prisma.workoutSession.create({
    data: {
      userId,
      name: today.focusArea,
      date: day,
      startedAt: now,
      completedAt: now,
      durationMins: schedule.sessionDurationMins,
      caloriesBurned: today.estimatedCalories,
      notes: `Completed plan workout: ${schedule.name}`,
      exercises: {
        create: planned.map((pe, i) => ({
          exerciseId: pe.exerciseId,
          orderInSession: i + 1,
          notes: pe.notes ?? null,
          sets: {
            create: Array.from({ length: Math.max(1, pe.sets) }, (_, s) => ({
              setNumber: s + 1,
              reps: pe.reps ?? null,
              durationSecs: pe.durationSecs ?? null,
              completed: true,
            })),
          },
        })),
      },
    },
    select: { id: true, caloriesBurned: true },
  });

  return NextResponse.json({
    success: true,
    workoutSessionId: created.id,
    caloriesBurned: created.caloriesBurned ?? 0,
  });
}
