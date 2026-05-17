// app/api/nutrition/diary/[id]/route.ts
// DELETE + PATCH /api/nutrition/diary/:id — remove or update a logged food entry

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const entry = await prisma.foodEntry.findUnique({ where: { id } });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (entry.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.foodEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { quantity } = await req.json();

  if (!quantity || Number(quantity) <= 0) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const entry = await prisma.foodEntry.findUnique({
    where: { id },
    include: { foodItem: true },
  });

  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (entry.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const ratio = Number(quantity) / 100;

  const updated = await prisma.foodEntry.update({
    where: { id },
    data: {
      quantity: Number(quantity),
      calories: Math.round(entry.foodItem.per100Calories * ratio),
      protein:  Math.round(entry.foodItem.per100Protein  * ratio),
      carbs:    Math.round(entry.foodItem.per100Carbs    * ratio),
      fat:      Math.round(entry.foodItem.per100Fat      * ratio),
      fiber:    Math.round(entry.foodItem.per100Fiber    * ratio),
    },
    include: { foodItem: true, mealType: true },
  });

  return NextResponse.json(updated);
}