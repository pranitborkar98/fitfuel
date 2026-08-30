import type { PlanTier, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export interface WorkoutExerciseRow {
  name: string;
  sets?: number;
  reps?: string | number;
  restSecs?: number;
  primaryMuscles?: string[];
  equipment?: string | null;
}

export interface WorkoutDay {
  dayOfWeek: string;
  focusArea: string;
  isRestDay: boolean;
  estimatedCalories: number;
  exercises: WorkoutExerciseRow[];
}

export interface WorkoutPlanData {
  name: string;
  description: string;
  daysPerWeek: number;
  sessionDurationMins: number;
  days: WorkoutDay[];
}

type RawExercise = {
  exerciseId?: string;
  name?: string;
  sets?: number;
  reps?: string | number;
  restSecs?: number;
  equipment?: string;
};

function categoryKeys(category: string): string[] {
  const lower = category.toLowerCase().trim();
  return [...new Set([
    lower,
    lower.replace(/_/g, ""),
    lower.replace(/-/g, "_"),
    lower.replace(/\s+/g, "_"),
  ].filter(Boolean))];
}

function optionalText(value: unknown, max: number): string | undefined {
  return typeof value === "string" ? value.trim().slice(0, max) || undefined : undefined;
}

function optionalInteger(value: unknown, min: number, max: number): number | undefined {
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max ? number : undefined;
}

function parseExercises(value: Prisma.JsonValue): RawExercise[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return [];
    const item = entry as Record<string, unknown>;
    const exerciseId = optionalText(item.exerciseId, 120);
    const name = optionalText(item.name, 160);
    if (!exerciseId && !name) return [];
    const repsNumber = optionalInteger(item.reps, 1, 1000);
    const repsText = optionalText(item.reps, 80);
    return [{
      exerciseId,
      name,
      sets: optionalInteger(item.sets, 1, 20),
      reps: repsNumber ?? repsText,
      restSecs: optionalInteger(item.restSecs, 0, 3600),
      equipment: optionalText(item.equipment, 120),
    }];
  });
}

function validTier(value: string): PlanTier | null {
  return value === "STANDARD" || value === "PREMIUM" || value === "LUXURY" ? value : null;
}

export async function getWorkoutPlanData(planCategory: string, tier: string): Promise<WorkoutPlanData | null> {
  const keys = categoryKeys(planCategory);
  if (keys.length === 0) return null;
  const tierValue = validTier(tier);
  const exact = tierValue
    ? await prisma.exerciseSchedule.findFirst({
        where: { tier: tierValue, mealPlanCategory: { in: keys } },
        include: { workoutDays: true },
      })
    : null;
  const schedule = exact ?? await prisma.exerciseSchedule.findFirst({
    where: { mealPlanCategory: { in: keys } },
    include: { workoutDays: true },
  });
  if (!schedule) return null;

  const parsedDays = schedule.workoutDays.map((day) => ({
    day,
    exercises: parseExercises(day.exercises),
  }));
  const exerciseIds = [...new Set(parsedDays.flatMap(({ exercises }) =>
    exercises.flatMap((exercise) => exercise.exerciseId ? [exercise.exerciseId] : [])
  ))];
  const exerciseRows = exerciseIds.length > 0
    ? await prisma.exercise.findMany({
        where: { id: { in: exerciseIds } },
        select: { id: true, name: true, primaryMuscles: true, equipment: true },
      })
    : [];
  const exerciseMap = new Map(exerciseRows.map((exercise) => [exercise.id, exercise]));
  const weekdayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  const days: WorkoutDay[] = parsedDays
    .sort((left, right) =>
      weekdayOrder.indexOf(left.day.dayOfWeek.toLowerCase()) - weekdayOrder.indexOf(right.day.dayOfWeek.toLowerCase())
    )
    .map(({ day, exercises }) => ({
      dayOfWeek: day.dayOfWeek,
      focusArea: day.focusArea,
      isRestDay: day.isRestDay,
      estimatedCalories: day.estimatedCalories,
      exercises: exercises.map((exercise) => {
        const libraryExercise = exercise.exerciseId ? exerciseMap.get(exercise.exerciseId) : undefined;
        return {
          name: exercise.name ?? libraryExercise?.name ?? "Exercise",
          sets: exercise.sets,
          reps: exercise.reps,
          restSecs: exercise.restSecs,
          primaryMuscles: libraryExercise?.primaryMuscles,
          equipment: exercise.equipment ?? libraryExercise?.equipment ?? null,
        };
      }),
    }));

  return {
    name: schedule.name,
    description: schedule.description,
    daysPerWeek: schedule.daysPerWeek,
    sessionDurationMins: schedule.sessionDurationMins,
    days,
  };
}
