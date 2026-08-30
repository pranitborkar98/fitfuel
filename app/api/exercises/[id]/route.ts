// app/api/exercises/[id]/route.ts
// GET /api/exercises/:id — full exercise detail including instructions

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    if (!id || id.length > 60) return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    const session = await auth();
    const rl = await enforceRateLimit(req, "read", session?.user?.id);
    if (!rl.ok) return rl.response;
    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    return NextResponse.json({ exercise });
  } catch (err) {
    console.error("[GET /api/exercises/:id]", err);
    return NextResponse.json({ error: "Failed to fetch exercise" }, { status: 500 });
  }
}
