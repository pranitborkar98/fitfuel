import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/user/active-plan/meals/rate
// Body: { planScheduleSlotId: string, dayNumber: number, rating: 1|2|3|4|5 }
//
// 1. Finds the existing MealLog for this user + slot + day
// 2. Updates MealLog.rating
// 3. Recomputes Recipe.avgRating from all non-null ratings for that recipe
//    (uses prisma aggregate — no raw SQL, safe for serverless)

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { planScheduleSlotId?: string; dayNumber?: number; rating?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { planScheduleSlotId, dayNumber, rating } = body;

  // Validate
  if (!planScheduleSlotId || typeof dayNumber !== "number") {
    return NextResponse.json(
      { error: "planScheduleSlotId and dayNumber are required" },
      { status: 400 }
    );
  }
  if (!Number.isInteger(rating) || (rating as number) < 1 || (rating as number) > 5) {
    return NextResponse.json(
      { error: "rating must be an integer 1–5" },
      { status: 400 }
    );
  }

  // Find the MealLog — must belong to this user
  const mealLog = await prisma.mealLog.findFirst({
    where: {
      userId,
      planScheduleSlotId,
      dayNumber,
    },
    select: { id: true, recipeId: true },
  });

  if (!mealLog) {
    // Guard: can only rate a meal that has been logged
    return NextResponse.json(
      { error: "Meal not logged yet. Log the meal before rating it." },
      { status: 404 }
    );
  }

  // Update the rating on the MealLog
  await prisma.mealLog.update({
    where: { id: mealLog.id },
    data: { rating: rating as number },
  });

  // Recompute avgRating on the Recipe from all rated logs
  // Uses Prisma aggregate — atomic enough for our scale (no race condition risk at ~100s of users)
  if (mealLog.recipeId) {
    const agg = await prisma.mealLog.aggregate({
      where: {
        recipeId: mealLog.recipeId,
        rating: { not: null },
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const newAvg = agg._avg.rating ?? 0;

    await prisma.recipe.update({
      where: { id: mealLog.recipeId },
      data: { avgRating: newAvg },
    });
  }

  return NextResponse.json({ success: true, rating });
}
