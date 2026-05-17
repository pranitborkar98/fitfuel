// app/api/nutrition/diary/[id]/route.ts
// DELETE /api/nutrition/diary/:id — remove a logged food entry

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entry = await prisma.foodEntry.findUnique({ where: { id: params.id } });

  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (entry.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.foodEntry.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
