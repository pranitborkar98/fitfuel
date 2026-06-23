import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { mealRateSchema } from "@/lib/validation/schemas";

// POST /api/user/active-plan/meals/rate

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const rl = await enforceRateLimit(req, "mutation", userId);
  if (!rl.ok) return rl.response;
  const parsed = await readJson(req, mealRateSchema);
  if (!parsed.ok) return parsed.response;
  const { mealSlot, logDate, rating, note } = parsed.data;

  const dateOnly = new Date(logDate);
  dateOnly.setUTCHours(0, 0, 0, 0);

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

  await prisma.mealLog.update({
    where: { id: mealLog.id },
    data: { rating: rating as number, ratingNote: note ?? null },
  });

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
