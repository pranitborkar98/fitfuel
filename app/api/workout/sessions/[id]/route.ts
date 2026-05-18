// app/api/workout/sessions/[id]/route.ts
// GET   /api/workout/sessions/:id — full session with exercises + sets
// PATCH /api/workout/sessions/:id — update name, notes, durationMins, caloriesBurned, completedAt
// DELETE /api/workout/sessions/:id — delete session (cascades)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

// ── GET ───────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workoutSession = await prisma.workoutSession.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: {
        exercises: {
          orderBy: { orderInSession: "asc" },
          include: {
            exercise: {
              select: {
                id:             true,
                name:           true,
                category:       true,
                equipment:      true,
                primaryMuscles: true,
                images:         true,
              },
            },
            sets: { orderBy: { setNumber: "asc" } },
          },
        },
      },
    });

    if (!workoutSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session: workoutSession });
  } catch (err) {
    console.error("[GET /api/workout/sessions/:id]", err);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}

// ── PATCH ─────────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.workoutSession.findFirst({
      where: { id: params.id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const { name, notes, durationMins, caloriesBurned, completedAt } = await req.json();

    const updated = await prisma.workoutSession.update({
      where: { id: params.id },
      data: {
        ...(name           !== undefined && { name }),
        ...(notes          !== undefined && { notes }),
        ...(durationMins   !== undefined && { durationMins }),
        ...(caloriesBurned !== undefined && { caloriesBurned }),
        ...(completedAt    !== undefined && { completedAt: new Date(completedAt) }),
      },
    });

    return NextResponse.json({ session: updated });
  } catch (err) {
    console.error("[PATCH /api/workout/sessions/:id]", err);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.workoutSession.findFirst({
      where: { id: params.id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await prisma.workoutSession.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/workout/sessions/:id]", err);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
