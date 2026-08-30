// app/api/workout/burned/route.ts
// GET /api/workout/burned?date=YYYY-MM-DD
// Returns total caloriesBurned across all sessions for a given date
// Called by the nutrition tracker to populate the calorie ring

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { formatDateOnly, parseDateOnly, todayIndiaDate } from "@/lib/date-only";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readQuery } from "@/lib/validation/core";
import { workoutBurnedQuerySchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rl = await enforceRateLimit(req, "read", session.user.id);
    if (!rl.ok) return rl.response;
    const query = readQuery(req, workoutBurnedQuerySchema);
    if (!query.ok) return query.response;

    const date = query.data.date ? parseDateOnly(query.data.date) : todayIndiaDate();
    if (!date) return NextResponse.json({ error: "Invalid date" }, { status: 400 });

    const sessions = await prisma.workoutSession.findMany({
      where: {
        userId: session.user.id,
        date,
        caloriesBurned: { not: null },
      },
      select: { caloriesBurned: true },
    });

    const totalBurned = sessions.reduce(
      (sum, s) => sum + (s.caloriesBurned ?? 0),
      0
    );

    return NextResponse.json({ date: formatDateOnly(date), caloriesBurned: totalBurned });
  } catch (err) {
    console.error("[GET /api/workout/burned]", err);
    return NextResponse.json({ error: "Failed to fetch burned calories" }, { status: 500 });
  }
}
