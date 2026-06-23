// app/api/nutrition/diary/route.ts
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson, readQuery } from "@/lib/validation/core";
import { diaryQuerySchema, diaryPostSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await enforceRateLimit(req, "read", session.user.id);
  if (!rl.ok) return rl.response;
  const q = readQuery(req, diaryQuerySchema);
  if (!q.ok) return q.response;

  const date = q.data.date ? new Date(q.data.date) : new Date();
  date.setUTCHours(0, 0, 0, 0);

  const [entries, mealTypes] = await Promise.all([
    prisma.foodEntry.findMany({
      where: { userId: session.user.id, entryDate: date },
      include: { foodItem: true, mealType: true },
      orderBy: [{ mealType: { sortOrder: "asc" } }, { createdAt: "asc" }],
    }),
    prisma.mealType.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const totals = entries.reduce(
    (acc: any, e: any) => ({
      calories: acc.calories + e.calories,
      protein:  acc.protein  + e.protein,
      carbs:    acc.carbs    + e.carbs,
      fat:      acc.fat      + e.fat,
      fiber:    acc.fiber    + e.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  return NextResponse.json({ entries, mealTypes, totals });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await enforceRateLimit(req, "mutation", session.user.id);
  if (!rl.ok) return rl.response;
  const parsed = await readJson(req, diaryPostSchema);
  if (!parsed.ok) return parsed.response;
  const { foodItemId, mealTypeId, date, quantity, notes } = parsed.data as any;

  const food = await prisma.foodItem.findUnique({ where: { id: foodItemId } });
  if (!food) return NextResponse.json({ error: "Food not found" }, { status: 404 });

  const qty = Number(quantity);
  const f = qty / 100;

  const entryDate = new Date(date);
  entryDate.setUTCHours(0, 0, 0, 0);

  const entry = await prisma.foodEntry.create({
    data: {
      userId:     session.user.id,
      foodItemId,
      mealTypeId,
      entryDate,
      quantity:   qty,
      calories:   Math.round(food.per100Calories * f * 10) / 10,
      protein:    Math.round(food.per100Protein  * f * 10) / 10,
      carbs:      Math.round(food.per100Carbs    * f * 10) / 10,
      fat:        Math.round(food.per100Fat      * f * 10) / 10,
      fiber:      Math.round(food.per100Fiber    * f * 10) / 10,
      notes:      notes ?? null,
    },
    include: { foodItem: true, mealType: true },
  });

  return NextResponse.json(entry, { status: 201 });
}
