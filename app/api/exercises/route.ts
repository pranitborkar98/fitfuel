// app/api/exercises/route.ts
// GET /api/exercises — search + filter the exercise library
// Query params:
//   q          — search by name (case-insensitive, partial match)
//   category   — strength | stretching | cardio | plyometrics | powerlifting | strongman | olympic weightlifting
//   level      — beginner | intermediate | expert
//   equipment  — body only | barbell | dumbbell | cable | machine | etc.
//   muscle     — any value in primaryMuscles array
//   limit      — default 20, max 50
//   offset     — default 0 (for pagination)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const q         = searchParams.get("q")?.trim() ?? "";
    const category  = searchParams.get("category")?.trim() ?? "";
    const level     = searchParams.get("level")?.trim() ?? "";
    const equipment = searchParams.get("equipment")?.trim() ?? "";
    const muscle    = searchParams.get("muscle")?.trim() ?? "";
    const limit     = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
    const offset    = parseInt(searchParams.get("offset") ?? "0");

    const where: Record<string, unknown> = {};

    if (q) {
      where.name = { contains: q, mode: "insensitive" };
    }

    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (level) {
      where.level = { equals: level, mode: "insensitive" };
    }

    if (equipment) {
      where.equipment = { equals: equipment, mode: "insensitive" };
    }

    // Filter by primary muscle (array contains)
    if (muscle) {
      where.primaryMuscles = { has: muscle };
    }

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
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
          // instructions omitted from list view — fetched on detail open
        },
        orderBy: { name: "asc" },
        take:   limit,
        skip:   offset,
      }),
      prisma.exercise.count({ where }),
    ]);

    return NextResponse.json({
      exercises,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (err) {
    console.error("[GET /api/exercises]", err);
    return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 });
  }
}
