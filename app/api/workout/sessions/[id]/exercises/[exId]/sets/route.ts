// app/api/workout/sessions/[id]/exercises/[exId]/sets/route.ts
// POST  /api/workout/sessions/:id/exercises/:exId/sets  — add a set
// PATCH /api/workout/sessions/:id/exercises/:exId/sets  — update a set
// DELETE /api/workout/sessions/:id/exercises/:exId/sets — delete a set

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";

type Params = { params: Promise<{ id: string; exId: string }> };

const optionalNumber = (max: number, integer = false) => {
  const value = integer ? z.number().int().min(0).max(max) : z.number().finite().min(0).max(max);
  return value.nullable().optional();
};
const setValuesSchema = z.object({
  reps: optionalNumber(10_000, true),
  weightKg: optionalNumber(2_000),
  durationSecs: optionalNumber(86_400, true),
  distanceM: optionalNumber(1_000_000),
  notes: z.string().trim().max(1000).nullable().optional(),
}).strict();
const setPatchSchema = setValuesSchema.extend({
  setId: z.string().trim().min(1).max(60),
  completed: z.boolean().optional(),
});
const setDeleteSchema = z.object({ setId: z.string().trim().min(1).max(60) }).strict();

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
  const { id, exId } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rl = await enforceRateLimit(req, "mutation", session.user.id);
    if (!rl.ok) return rl.response;

    const workoutExercise = await verifyOwnership(id, exId, session.user.id);
    if (!workoutExercise) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const parsed = await readJson(req, setValuesSchema);
    if (!parsed.ok) return parsed.response;
    const { reps, weightKg, durationSecs, distanceM, notes } = parsed.data;

    // Get next set number
    const setCount = await prisma.workoutSet.count({
      where: { workoutExerciseId: exId },
    });
    if (setCount >= 100) return NextResponse.json({ error: "Set limit reached" }, { status: 409 });

    const set = await prisma.workoutSet.create({
      data: {
        workoutExerciseId: exId,
        setNumber:         setCount + 1, // 1-indexed
        reps:              reps         ?? null,
        weightKg:          weightKg     ?? null,
        durationSecs:      durationSecs ?? null,
        distanceM:         distanceM    ?? null,
        notes:             notes        ?? null,
        completed:         false,
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
  const { id, exId } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rl = await enforceRateLimit(req, "mutation", session.user.id);
    if (!rl.ok) return rl.response;

    const workoutExercise = await verifyOwnership(id, exId, session.user.id);
    if (!workoutExercise) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const parsed = await readJson(req, setPatchSchema);
    if (!parsed.ok) return parsed.response;
    const { setId, reps, weightKg, durationSecs, distanceM, completed, notes } = parsed.data;

    const ownedSet = await prisma.workoutSet.findFirst({ where: { id: setId, workoutExerciseId: exId }, select: { id: true } });
    if (!ownedSet) return NextResponse.json({ error: "Set not found" }, { status: 404 });

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
  const { id, exId } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rl = await enforceRateLimit(req, "mutation", session.user.id);
    if (!rl.ok) return rl.response;

    const workoutExercise = await verifyOwnership(id, exId, session.user.id);
    if (!workoutExercise) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const parsed = await readJson(req, setDeleteSchema);
    if (!parsed.ok) return parsed.response;
    const { setId } = parsed.data;

    const ownedSet = await prisma.workoutSet.findFirst({ where: { id: setId, workoutExerciseId: exId }, select: { id: true } });
    if (!ownedSet) return NextResponse.json({ error: "Set not found" }, { status: 404 });

    await prisma.workoutSet.delete({ where: { id: setId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE sets]", err);
    return NextResponse.json({ error: "Failed to delete set" }, { status: 500 });
  }
}
