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
import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { todayISTDate } from "@/lib/production";
import type { Prisma } from "@prisma/client";

interface PlannedExercise {
  exerciseId: string;
  sets: number;
  reps: number | null;
  durationSecs: number | null;
  notes: string | null;
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function boundedInteger(value: unknown, min: number, max: number): number | null {
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max ? number : null;
}

function plannedExercises(value: Prisma.JsonValue): PlannedExercise[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const item = record(entry);
    if (!item || typeof item.exerciseId !== "string" || !item.exerciseId.trim()) return [];
    const sets = boundedInteger(item.sets, 1, 20);
    if (!sets) return [];
    return [{
      exerciseId: item.exerciseId,
      sets,
      reps: boundedInteger(item.reps, 1, 1000),
      durationSecs: boundedInteger(item.durationSecs, 1, 86_400),
      notes: typeof item.notes === "string" ? item.notes.trim().slice(0, 500) || null : null,
    }];
  });
}

function errorCode(error: unknown): string | null {
  return typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const rl = await enforceRateLimit(req, "mutation", userId);
  if (!rl.ok) return rl.response;

  const now = new Date();
  const day = todayISTDate(now);
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC",
  })
    .format(day)
    .toLowerCase();

  // 1. Active plan → program
  const activePlan = await prisma.userActivePlan.findFirst({
    where: { userId, status: "active", startDate: { lte: day }, endDate: { gte: day } },
    orderBy: [{ isDigital: "asc" }, { createdAt: "desc" }],
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

  // 2. Build session with nested exercises + sets from the prescription
  const planned = plannedExercises(today.exercises);
  if (planned.length === 0) {
    return NextResponse.json({ error: "Today's workout schedule needs staff attention." }, { status: 409 });
  }

  let result: { id: string; caloriesBurned: number | null; alreadyCompleted: boolean } | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const existing = await tx.workoutSession.findFirst({
          where: { userId, date: day, completedAt: { not: null }, notes: `Completed plan workout: ${schedule.name}` },
          select: { id: true, caloriesBurned: true },
        });
        if (existing) return { ...existing, alreadyCompleted: true };

        const created = await tx.workoutSession.create({
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
              create: planned.map((exercise, index) => ({
                exerciseId: exercise.exerciseId,
                orderInSession: index + 1,
                notes: exercise.notes,
                sets: {
                  create: Array.from({ length: exercise.sets }, (_, setIndex) => ({
                    setNumber: setIndex + 1,
                    reps: exercise.reps,
                    durationSecs: exercise.durationSecs,
                    completed: true,
                  })),
                },
              })),
            },
          },
          select: { id: true, caloriesBurned: true },
        });
        return { ...created, alreadyCompleted: false };
      }, { isolationLevel: "Serializable" });
      break;
    } catch (error: unknown) {
      if (errorCode(error) === "P2034" && attempt < 2) continue;
      throw error;
    }
  }
  if (!result) throw new Error("Workout completion could not be saved");

  return NextResponse.json({
    success: true,
    alreadyCompleted: result.alreadyCompleted,
    workoutSessionId: result.id,
    caloriesBurned: result.caloriesBurned ?? 0,
  }, { status: result.alreadyCompleted ? 409 : 200 });
}
