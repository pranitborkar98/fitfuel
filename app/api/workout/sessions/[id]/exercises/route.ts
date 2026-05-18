// app/api/workout/sessions/[id]/exercises/route.ts
// POST /api/workout/sessions/:id/exercises — add an exercise to a session

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify session ownership
    const workoutSession = await prisma.workoutSession.findFirst({
      where: { id: params.id, userId: session.user.id },
    });
    if (!workoutSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const { exerciseId, notes } = await req.json();
    if (!exerciseId) {
      return NextResponse.json({ error: "exerciseId is required" }, { status: 400 });
    }

    // Verify exercise exists
    const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Get next order position
    const count = await prisma.workoutExercise.count({
      where: { workoutSessionId: params.id },
    });

    const workoutExercise = await prisma.workoutExercise.create({
      data: {
        workoutSessionId: params.id,
        exerciseId,
        orderInSession: count, // 0-indexed
        notes: notes ?? null,
      },
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
        sets: true,
      },
    });

    return NextResponse.json({ workoutExercise }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/workout/sessions/:id/exercises]", err);
    return NextResponse.json({ error: "Failed to add exercise" }, { status: 500 });
  }
}

// DELETE /api/workout/sessions/:id/exercises  — remove exercise from session
// Body: { workoutExerciseId }
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workoutExerciseId } = await req.json();

    // Verify ownership via session chain
    const workoutExercise = await prisma.workoutExercise.findFirst({
      where: {
        id: workoutExerciseId,
        workoutSession: { id: params.id, userId: session.user.id },
      },
    });
    if (!workoutExercise) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.workoutExercise.delete({ where: { id: workoutExerciseId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/workout/sessions/:id/exercises]", err);
    return NextResponse.json({ error: "Failed to remove exercise" }, { status: 500 });
  }
}
