// app/api/cron/snapshot-consistency/route.ts
// Phase 11 — weekly consistency snapshot.
// Runs every Saturday (late, IST) via Vercel Cron. For every user with an active
// plan, computes that week's consistency score and upserts one ConsistencySnapshot
// row. This is what makes the week-over-week consistency trend real going forward.
//
// Protected by CRON_SECRET (same pattern as the Phase 10 delivery generator).
// Vercel Cron automatically sends `Authorization: Bearer <CRON_SECRET>`.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeeklyConsistency } from "@/lib/consistency-score";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // distinct users who currently have an active plan
  const plans = await prisma.userActivePlan.findMany({
    where: { status: "active" },
    select: { userId: true },
    distinct: ["userId"],
  });

  let written = 0;
  const failed: string[] = [];

  for (const { userId } of plans) {
    try {
      const c = await getWeeklyConsistency(userId, now);
      const weekStart = new Date(`${c.weekStart}T00:00:00.000Z`);

      const payload = {
        score: c.score,
        label: c.label,
        mealsPoints: c.meals?.points ?? 0,
        workoutsPoints: c.workouts?.points ?? 0,
        waterPoints: c.water?.points ?? 0,
        weighInPoints: c.weighIn?.points ?? 0,
        noSkipPoints: c.noSkips?.points ?? 0,
      };

      await prisma.consistencySnapshot.upsert({
        where: { userId_weekStart: { userId, weekStart } },
        create: { userId, weekStart, ...payload },
        update: payload,
      });
      written++;
    } catch {
      failed.push(userId);
    }
  }

  return NextResponse.json({ ok: true, users: plans.length, written, failed: failed.length });
}
