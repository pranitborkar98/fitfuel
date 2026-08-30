import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { mealRateSchema } from "@/lib/validation/schemas";
import { todayISTDate } from "@/lib/production";
import type { Prisma } from "@prisma/client";

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
  const { mealSlot, rating, note } = parsed.data;
  const dateOnly = todayISTDate();

  const mealLog = await prisma.mealLog.findFirst({
    where: {
      userId,
      mealSlot,
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

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.mealLog.update({
          where: { id: mealLog.id },
          data: { rating, ratingNote: note ?? null },
        });
        const aggregate = await tx.mealLog.aggregate({
          where: { recipeId: mealLog.recipeId, rating: { not: null } },
          _avg: { rating: true },
        });
        await tx.recipe.update({
          where: { id: mealLog.recipeId },
          data: { avgRating: aggregate._avg.rating ?? 0 },
        });
      }, { isolationLevel: "Serializable" });
      break;
    } catch (error: unknown) {
      const code = typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : null;
      if (code === "P2034" && attempt < 2) continue;
      throw error;
    }
  }

  return NextResponse.json({ success: true, rating });
}
