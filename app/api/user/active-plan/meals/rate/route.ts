import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST /api/user/active-plan/meals/rate
// Body: { mealSlot: string, logDate: string (ISO), rating: 1|2|3|4|5 }
//
// Finds the MealLog by userId + activePlan + mealSlot + logDate
// Updates MealLog.rating, then recomputes Recipe.avgRating

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { mealSlot?: string; logDate?: string; rating?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { mealSlot, logDate, rating } = body;

  if (!mealSlot || !logDate) {
    return NextResponse.json(
      { error: "mealSlot and logDate are required" },
      { status: 400 }
    );
  }
  if (!Number.isInteger(rating) || (rating as number) < 1 || (rating as number) > 5) {
    return NextResponse.json(
      { error: "rating must be an integer 1–5" },
      { status: 400 }
    );
  }

  // Normalise logDate to midnight UTC so it matches @db.Date storage
  const dateOnly = new Date(logDate);
  dateOnly.setUTCHours(0, 0, 0, 0);

  // Find the MealLog — must belong to this user
  const mealLog = await prisma.mealLog.findFirst({
    where: {
      userId,
      mealSlot: mealSlot as any,
      logDate: dateOnly,
    },
    select: { id: true, recipeId: true },
  });

  if (!mealLog) {
    return NextResponse.json(
      { error: "Meal not logged yet. Log the meal before rating it." },
      { status: 404 }
    );
  }

  // Update rating
  await prisma.mealLog.update({
    where: { id: mealLog.id },
    data: { rating: rating as number },
  });

  // Recompute Recipe.avgRating from all rated logs for this recipe
  const agg = await prisma.mealLog.aggregate({
    where: {
      recipeId: mealLog.recipeId,
      rating: { not: null },
    },
    _avg: { rating: true },
  });

  await prisma.recipe.update({
    where: { id: mealLog.recipeId },
    data: { avgRating: agg._avg.rating ?? 0 },
  });

  return NextResponse.json({ success: true, rating });
}