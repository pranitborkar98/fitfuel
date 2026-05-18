// app/api/workout/sessions/route.ts
// GET  /api/workout/sessions        — fetch recent sessions for the user
// POST /api/workout/sessions        — create a new workout session

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ── GET — recent sessions ─────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const limit  = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const [sessions, total] = await Promise.all([
      prisma.workoutSession.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "desc" },
        take: limit,
        skip: offset,
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
              sets: {
                orderBy: { setNumber: "asc" },
              },
            },
          },
        },
      }),
      prisma.workoutSession.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({ sessions, total, limit, offset, hasMore: offset + limit < total });
  } catch (err) {
    console.error("[GET /api/workout/sessions]", err);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

// ── POST — create new session ─────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, date } = body;

    // date defaults to today if not provided
    const sessionDate = date ? new Date(date) : new Date();
    // Normalize to date-only (strip time)
    sessionDate.setHours(0, 0, 0, 0);

    const workoutSession = await prisma.workoutSession.create({
      data: {
        userId:    session.user.id,
        name:      name ?? null,
        date:      sessionDate,
        startedAt: new Date(),
      },
    });

    return NextResponse.json({ session: workoutSession }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/workout/sessions]", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
