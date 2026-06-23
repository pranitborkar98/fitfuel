// app/api/nutrition/goals/route.ts
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { goalsPatchSchema } from "@/lib/validation/schemas";

const DEFAULTS = { calories: 2000, protein: 150, carbs: 250, fat: 67, waterMl: 2500 };

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await enforceRateLimit(req, "read", session.user.id);
  if (!rl.ok) return rl.response;

  const goal = await prisma.nutritionGoal.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(goal ?? { ...DEFAULTS, userId: session.user.id });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await enforceRateLimit(req, "mutation", session.user.id);
  if (!rl.ok) return rl.response;
  const parsed = await readJson(req, goalsPatchSchema);
  if (!parsed.ok) return parsed.response;
  const { calories, protein, carbs, fat, waterMl } = parsed.data;

  const goal = await prisma.nutritionGoal.upsert({
    where:  { userId: session.user.id },
    update: {
      ...(calories !== undefined && { calories: Number(calories) }),
      ...(protein  !== undefined && { protein:  Number(protein)  }),
      ...(carbs    !== undefined && { carbs:    Number(carbs)    }),
      ...(fat      !== undefined && { fat:      Number(fat)      }),
      ...(waterMl  !== undefined && { waterMl:  Number(waterMl)  }),
    },
    create: {
      userId:   session.user.id,
      calories: calories !== undefined ? Number(calories) : DEFAULTS.calories,
      protein:  protein  !== undefined ? Number(protein)  : DEFAULTS.protein,
      carbs:    carbs    !== undefined ? Number(carbs)    : DEFAULTS.carbs,
      fat:      fat      !== undefined ? Number(fat)      : DEFAULTS.fat,
      waterMl:  waterMl  !== undefined ? Number(waterMl)  : DEFAULTS.waterMl,
    },
  });

  return NextResponse.json(goal);
}
