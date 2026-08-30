// app/api/nutrition/diary/[id]/route.ts
// DELETE + PATCH /api/nutrition/diary/:id — remove or update a logged food entry

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";

const quantityPatchSchema = z.object({
  quantity: z.coerce.number().finite().positive().max(5000),
}).strict();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rl = await enforceRateLimit(req, "mutation", session.user.id);
  if (!rl.ok) return rl.response;

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
  const rl = await enforceRateLimit(req, "mutation", session.user.id);
  if (!rl.ok) return rl.response;

  const { id } = await params;
  const parsed = await readJson(req, quantityPatchSchema);
  if (!parsed.ok) return parsed.response;
  const { quantity } = parsed.data;

  const entry = await prisma.foodEntry.findUnique({
    where: { id },
    include: { foodItem: true },
  });

  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (entry.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const ratio = quantity / 100;

  const updated = await prisma.foodEntry.update({
    where: { id },
    data: {
      quantity,
      calories: Math.round(entry.foodItem.per100Calories * ratio * 10) / 10,
      protein:  Math.round(entry.foodItem.per100Protein  * ratio * 10) / 10,
      carbs:    Math.round(entry.foodItem.per100Carbs    * ratio * 10) / 10,
      fat:      Math.round(entry.foodItem.per100Fat      * ratio * 10) / 10,
      fiber:    Math.round(entry.foodItem.per100Fiber    * ratio * 10) / 10,
    },
    include: { foodItem: true, mealType: true },
  });

  return NextResponse.json(updated);
}
