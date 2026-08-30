// app/api/workout/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { parseDateOnly, todayIndiaDate } from "@/lib/date-only";
import { readJson, readQuery } from "@/lib/validation/core";
import { workoutSessionQuerySchema, workoutSessionPostSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await enforceRateLimit(req, "read", session.user.id);
    if (!rl.ok) return rl.response;
    const q = readQuery(req, workoutSessionQuerySchema);
    if (!q.ok) return q.response;
    const limit = q.data.limit;
    const offset = q.data.offset;

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

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await enforceRateLimit(req, "mutation", session.user.id);
    if (!rl.ok) return rl.response;
    const parsed = await readJson(req, workoutSessionPostSchema);
    if (!parsed.ok) return parsed.response;
    const { name, date } = parsed.data;

    const sessionDate = date ? parseDateOnly(date) : todayIndiaDate();
    if (!sessionDate) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    if (sessionDate.getTime() > todayIndiaDate().getTime()) {
      return NextResponse.json({ error: "Future workout sessions are not allowed" }, { status: 400 });
    }

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
