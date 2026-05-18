// app/api/workout/burned/route.ts
// GET /api/workout/burned?date=YYYY-MM-DD
// Returns total caloriesBurned across all sessions for a given date
// Called by the nutrition tracker to populate the calorie ring

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dateParam = req.nextUrl.searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();
    date.setHours(0, 0, 0, 0);

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

    return NextResponse.json({ date: date.toISOString().split("T")[0], caloriesBurned: totalBurned });
  } catch (err) {
    console.error("[GET /api/workout/burned]", err);
    return NextResponse.json({ error: "Failed to fetch burned calories" }, { status: 500 });
  }
}
