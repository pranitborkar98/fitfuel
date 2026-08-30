// app/api/workout/sessions/[id]/exercises/route.ts
// POST /api/workout/sessions/:id/exercises — add an exercise to a session

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";

type Params = { params: Promise<{ id: string }> };

const addExerciseSchema = z.object({
  exerciseId: z.string().trim().min(1).max(60),
  notes: z.string().trim().max(1000).nullable().optional(),
}).strict();
const removeExerciseSchema = z.object({ workoutExerciseId: z.string().trim().min(1).max(60) }).strict();

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rl = await enforceRateLimit(req, "mutation", session.user.id);
    if (!rl.ok) return rl.response;

    // Verify session ownership
    const workoutSession = await prisma.workoutSession.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!workoutSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const parsed = await readJson(req, addExerciseSchema);
    if (!parsed.ok) return parsed.response;
    const { exerciseId, notes } = parsed.data;

    // Verify exercise exists
    const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Get next order position
    const count = await prisma.workoutExercise.count({
      where: { workoutSessionId: id },
    });
    if (count >= 100) return NextResponse.json({ error: "Exercise limit reached" }, { status: 409 });

    const workoutExercise = await prisma.workoutExercise.create({
      data: {
        workoutSessionId: id,
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
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rl = await enforceRateLimit(req, "mutation", session.user.id);
    if (!rl.ok) return rl.response;

    const parsed = await readJson(req, removeExerciseSchema);
    if (!parsed.ok) return parsed.response;
    const { workoutExerciseId } = parsed.data;

    // Verify ownership via session chain
    const workoutExercise = await prisma.workoutExercise.findFirst({
      where: {
        id: workoutExerciseId,
        workoutSession: { id, userId: session.user.id },
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
