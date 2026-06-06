// lib/workout-plan.ts  (Pro tier — real workout plan from ExerciseSchedule)
import { prisma } from "@/lib/prisma";

export interface WorkoutExerciseRow { name: string; sets?: number; reps?: string | number; restSecs?: number; primaryMuscles?: string[]; equipment?: string | null; }
export interface WorkoutDay { dayOfWeek: string; focusArea: string; isRestDay: boolean; estimatedCalories: number; exercises: WorkoutExerciseRow[]; }
export interface WorkoutPlanData { name: string; description: string; daysPerWeek: number; sessionDurationMins: number; days: WorkoutDay[]; }

// MealPlan.category (enum) -> ExerciseSchedule.mealPlanCategory (string). Tries a few shapes.
function categoryKeys(cat: string): string[] {
  const lower = cat.toLowerCase();
  return [lower, lower.replace(/_/g, ""), lower.replace(/-/g, "_")];
}

export async function getWorkoutPlanData(planCategory: string, tier: string): Promise<WorkoutPlanData | null> {
  const keys = categoryKeys(planCategory);
  const schedule =
    (await (prisma as any).exerciseSchedule.findFirst({ where: { tier, mealPlanCategory: { in: keys } }, include: { workoutDays: true } })) ??
    (await (prisma as any).exerciseSchedule.findFirst({ where: { mealPlanCategory: { in: keys } }, include: { workoutDays: true } }));
  if (!schedule) return null;

  // Collect exercise ids across all days, resolve names once.
  const ids = new Set<string>();
  for (const d of schedule.workoutDays) for (const e of (d.exercises ?? []) as any[]) if (e?.exerciseId) ids.add(e.exerciseId);
  const exMap = new Map<string, any>();
  if (ids.size) {
    const exs = await (prisma as any).exercise.findMany({ where: { id: { in: [...ids] } } });
    for (const ex of exs) exMap.set(ex.id, ex);
  }

  const order = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const days: WorkoutDay[] = schedule.workoutDays
    .slice()
    .sort((a: any, b: any) => order.indexOf(a.dayOfWeek?.toLowerCase()) - order.indexOf(b.dayOfWeek?.toLowerCase()))
    .map((d: any) => ({
      dayOfWeek: d.dayOfWeek,
      focusArea: d.focusArea,
      isRestDay: d.isRestDay,
      estimatedCalories: d.estimatedCalories,
      exercises: ((d.exercises ?? []) as any[]).map((e) => {
        const ex = exMap.get(e.exerciseId);
        return { name: ex?.name ?? "Exercise", sets: e.sets, reps: e.reps, restSecs: e.restSecs, primaryMuscles: ex?.primaryMuscles, equipment: ex?.equipment };
      }),
    }));

  return { name: schedule.name, description: schedule.description, daysPerWeek: schedule.daysPerWeek, sessionDurationMins: schedule.sessionDurationMins, days };
}
