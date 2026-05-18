// app/api/exercises/filters/route.ts
// GET /api/exercises/filters
// Returns all unique categories, levels, equipment types, and muscle groups
// Called once on page load to populate filter dropdowns

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [categories, levels, equipmentList, allExercises] = await Promise.all([
      // Unique categories
      prisma.exercise.findMany({
        select: { category: true },
        distinct: ["category"],
        orderBy: { category: "asc" },
      }),
      // Unique levels
      prisma.exercise.findMany({
        select: { level: true },
        distinct: ["level"],
        orderBy: { level: "asc" },
      }),
      // Unique equipment (excluding null)
      prisma.exercise.findMany({
        select: { equipment: true },
        distinct: ["equipment"],
        orderBy: { equipment: "asc" },
        where: { equipment: { not: null } },
      }),
      // All primaryMuscles arrays to flatten into unique muscles
      prisma.exercise.findMany({
        select: { primaryMuscles: true },
      }),
    ]);

    // Flatten and deduplicate muscles
    const muscleSet = new Set<string>();
    allExercises.forEach((ex) =>
      ex.primaryMuscles.forEach((m) => muscleSet.add(m))
    );
    const muscles = Array.from(muscleSet).sort();

    return NextResponse.json({
      categories: categories.map((c) => c.category),
      levels:     levels.map((l) => l.level),
      equipment:  equipmentList.map((e) => e.equipment).filter(Boolean),
      muscles,
    });
  } catch (err) {
    console.error("[GET /api/exercises/filters]", err);
    return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 });
  }
}
