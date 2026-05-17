// app/api/nutrition/foods/route.ts
// GET  /api/nutrition/foods?q=rice   — search food library (global + user custom)
// POST /api/nutrition/foods          — add a custom food

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const userFilter = session?.user?.id
    ? { OR: [{ userId: null }, { userId: session.user.id }] }
    : { userId: null };

  if (!q) {
    const foods = await prisma.foodItem.findMany({
      where: userFilter,
      orderBy: [{ isCustom: "asc" }, { name: "asc" }],
      take: 30,
    });
    return NextResponse.json(foods);
  }

  const foods = await prisma.foodItem.findMany({
    where: {
      name: { contains: q, mode: "insensitive" },
      ...userFilter,
    },
    orderBy: [{ isCustom: "asc" }, { name: "asc" }],
    take: 20,
  });

  return NextResponse.json(foods);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, brand, category, per100Calories, per100Protein, per100Carbs, per100Fat, per100Fiber } = body;

  if (!name || per100Calories === undefined) {
    return NextResponse.json({ error: "name and per100Calories are required" }, { status: 400 });
  }

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
