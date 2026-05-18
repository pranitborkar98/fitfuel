// app/dashboard/exercises/page.tsx
// Server component — auth guard + SSR initial exercise data + filter metadata

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExercisesClient from "./ExercisesClient";

export const metadata = { title: "Exercise Library — FitFuel" };

export default async function ExercisesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard/exercises");

  // SSR: load first page of exercises + filter metadata in parallel
  const [initialExercises, categories, levels, equipmentList, allMuscles] =
    await Promise.all([
      // First 20 exercises sorted by name
      prisma.exercise.findMany({
        select: {
          id:               true,
          name:             true,
          category:         true,
          level:            true,
          equipment:        true,
          force:            true,
          mechanic:         true,
          primaryMuscles:   true,
          secondaryMuscles: true,
          images:           true,
        },
        orderBy: { name: "asc" },
        take: 20,
      }),

      // Unique categories
      prisma.exercise.findMany({
        select:   { category: true },
        distinct: ["category"],
        orderBy:  { category: "asc" },
      }),

      // Unique levels
      prisma.exercise.findMany({
        select:   { level: true },
        distinct: ["level"],
        orderBy:  { level: "asc" },
      }),

      // Unique equipment
      prisma.exercise.findMany({
        select:   { equipment: true },
        distinct: ["equipment"],
        orderBy:  { equipment: "asc" },
        where:    { equipment: { not: null } },
      }),

      // All exercises for muscle extraction
      prisma.exercise.findMany({ select: { primaryMuscles: true } }),
    ]);

  const total = await prisma.exercise.count();

  // Flatten + deduplicate muscles
  const muscleSet = new Set<string>();
  allMuscles.forEach((ex) => ex.primaryMuscles.forEach((m) => muscleSet.add(m)));
  const muscles = Array.from(muscleSet).sort();

  return (
    <ExercisesClient
      initialExercises={initialExercises}
      initialTotal={total}
      categories={categories.map((c) => c.category)}
      levels={levels.map((l) => l.level)}
      equipment={equipmentList.map((e) => e.equipment).filter(Boolean) as string[]}
      muscles={muscles}
    />
  );
}
