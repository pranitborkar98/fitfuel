// app/api/nutrition/foods/route.ts
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson, readQuery } from "@/lib/validation/core";
import { foodsQuerySchema, foodsPostSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const session = await auth();

  // Read is auth-optional; rate-limit by IP (+ user axis when present).
  const rl = await enforceRateLimit(req, "read", session?.user?.id);
  if (!rl.ok) return rl.response;
  const parsedQ = readQuery(req, foodsQuerySchema);
  if (!parsedQ.ok) return parsedQ.response;
  const q = parsedQ.data.q?.trim() ?? "";

  const userFilter = session?.user?.id
    ? { OR: [{ userId: null }, { userId: session.user.id }] }
    : { userId: null };

  const foods = await prisma.foodItem.findMany({
    where: {
      AND: [
        userFilter,
        { OR: [{ category: null }, { category: { not: "PLAN_RECIPE" } }] },
        ...(q ? [{ name: { contains: q, mode: "insensitive" as const } }] : []),
      ],
    },
    orderBy: [{ isCustom: "asc" }, { name: "asc" }],
    take: q ? 20 : 30,
  });

  // Scheduled FitFuel meals come from the member's active plan, not from this
  // generic food table. This endpoint is only for food eaten outside the plan.
  return NextResponse.json(foods);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await enforceRateLimit(req, "mutation", session.user.id);
  if (!rl.ok) return rl.response;
  const parsed = await readJson(req, foodsPostSchema);
  if (!parsed.ok) return parsed.response;
  const { name, brand, category, per100Calories, per100Protein, per100Carbs, per100Fat, per100Fiber } = parsed.data;

  const food = await prisma.foodItem.create({
    data: {
      name,
      brand:          brand          ?? null,
      category:       category       ?? "Custom",
      per100Calories: Number(per100Calories),
      per100Protein:  Number(per100Protein  ?? 0),
      per100Carbs:    Number(per100Carbs    ?? 0),
      per100Fat:      Number(per100Fat      ?? 0),
      per100Fiber:    Number(per100Fiber    ?? 0),
      isCustom:       true,
      userId:         session.user.id,
    },
  });

  return NextResponse.json(food, { status: 201 });
}
