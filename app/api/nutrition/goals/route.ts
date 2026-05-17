// app/api/nutrition/goals/route.ts
// GET   /api/nutrition/goals   — fetch goals (or defaults)
// PATCH /api/nutrition/goals   — create/update goals

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULTS = { calories: 2000, protein: 150, carbs: 250, fat: 67, waterMl: 2500 };

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const goal = await prisma.nutritionGoal.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(goal ?? { ...DEFAULTS, userId: session.user.id });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { calories, protein, carbs, fat, waterMl } = body;

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
