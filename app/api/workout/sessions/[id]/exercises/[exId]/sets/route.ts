// app/api/workout/sessions/[id]/exercises/[exId]/sets/route.ts
// POST  /api/workout/sessions/:id/exercises/:exId/sets  — add a set
// PATCH /api/workout/sessions/:id/exercises/:exId/sets  — update a set
// DELETE /api/workout/sessions/:id/exercises/:exId/sets — delete a set

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string; exId: string } };

// Helper — verify the workoutExercise belongs to this user's session
async function verifyOwnership(sessionId: string, exId: string, userId: string) {
  return prisma.workoutExercise.findFirst({
    where: {
      id: exId,
      workoutSession: { id: sessionId, userId },
    },
  });
}

// ── POST — add a set ──────────────────────────────────────────
// Body: { reps?, weightKg?, durationSecs?, distanceM?, notes? }
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workoutExercise = await verifyOwnership(params.id, params.exId, session.user.id);
    if (!workoutExercise) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { reps, weightKg, durationSecs, distanceM, notes } = await req.json();

    // Get next set number
    const setCount = await prisma.workoutSet.count({
      where: { workoutExerciseId: params.exId },
    });

    const set = await prisma.workoutSet.create({
      data: {
        workoutExerciseId: params.exId,
        setNumber:         setCount + 1, // 1-indexed
        reps:              reps         ?? null,
        weightKg:          weightKg     ?? null,
        durationSecs:      durationSecs ?? null,
        distanceM:         distanceM    ?? null,
        notes:             notes        ?? null,
        completed:         true,         // logged = completed
      },
    });

    return NextResponse.json({ set }, { status: 201 });
  } catch (err) {
    console.error("[POST sets]", err);
    return NextResponse.json({ error: "Failed to add set" }, { status: 500 });
  }
}

// ── PATCH — update a set ──────────────────────────────────────
// Body: { setId, reps?, weightKg?, durationSecs?, distanceM?, completed?, notes? }
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workoutExercise = await verifyOwnership(params.id, params.exId, session.user.id);
    if (!workoutExercise) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { setId, reps, weightKg, durationSecs, distanceM, completed, notes } = await req.json();
    if (!setId) {
      return NextResponse.json({ error: "setId is required" }, { status: 400 });
    }

    const updated = await prisma.workoutSet.update({
      where: { id: setId },
      data: {
        ...(reps         !== undefined && { reps }),
        ...(weightKg     !== undefined && { weightKg }),
        ...(durationSecs !== undefined && { durationSecs }),
        ...(distanceM    !== undefined && { distanceM }),
        ...(completed    !== undefined && { completed }),
        ...(notes        !== undefined && { notes }),
      },
    });

    return NextResponse.json({ set: updated });
  } catch (err) {
    console.error("[PATCH sets]", err);
    return NextResponse.json({ error: "Failed to update set" }, { status: 500 });
  }
}

// ── DELETE — remove a set ─────────────────────────────────────
// Body: { setId }
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workoutExercise = await verifyOwnership(params.id, params.exId, session.user.id);
    if (!workoutExercise) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { setId } = await req.json();
    if (!setId) {
      return NextResponse.json({ error: "setId is required" }, { status: 400 });
    }

    await prisma.workoutSet.delete({ where: { id: setId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE sets]", err);
    return NextResponse.json({ error: "Failed to delete set" }, { status: 500 });
  }
}
