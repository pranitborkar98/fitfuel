// app/api/exercises/[id]/route.ts
// GET /api/exercises/:id — full exercise detail including instructions

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: params.id },
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
