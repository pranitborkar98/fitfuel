// app/api/workout/sessions/[id]/route.ts
// GET   /api/workout/sessions/:id — full session with exercises + sets
// PATCH /api/workout/sessions/:id — update name, notes, durationMins, caloriesBurned, completedAt
// DELETE /api/workout/sessions/:id — delete session (cascades)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";

type Params = { params: Promise<{ id: string }> };

const nullableText = (max: number) => z.string().trim().max(max).nullable().optional();
const sessionPatchSchema = z.object({
  name: nullableText(120),
  notes: nullableText(1000),
  durationMins: z.number().int().min(0).max(1440).nullable().optional(),
  caloriesBurned: z.number().int().min(0).max(20_000).nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
}).strict();

// ── GET ───────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workoutSession = await prisma.workoutSession.findFirst({
      where: { id, userId: session.user.id },
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
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rl = await enforceRateLimit(req, "mutation", session.user.id);
    if (!rl.ok) return rl.response;
    if (!id || id.length > 60) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const existing = await prisma.workoutSession.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const parsed = await readJson(req, sessionPatchSchema);
    if (!parsed.ok) return parsed.response;
    const { name, notes, durationMins, caloriesBurned, completedAt } = parsed.data;

    const updated = await prisma.workoutSession.update({
      where: { id },
      data: {
        ...(name           !== undefined && { name }),
        ...(notes          !== undefined && { notes }),
        ...(durationMins   !== undefined && { durationMins }),
        ...(caloriesBurned !== undefined && { caloriesBurned }),
        ...(completedAt    !== undefined && { completedAt: completedAt === null ? null : new Date(completedAt) }),
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
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rl = await enforceRateLimit(_req, "mutation", session.user.id);
    if (!rl.ok) return rl.response;
    if (!id || id.length > 60) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const existing = await prisma.workoutSession.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await prisma.workoutSession.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/workout/sessions/:id]", err);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
