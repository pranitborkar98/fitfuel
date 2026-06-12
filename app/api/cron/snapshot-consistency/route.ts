// app/api/cron/snapshot-consistency/route.ts
// Phase 11 — weekly consistency snapshot.
// Phase 16B — after snapshotting, fans out weekly_digest emails to users whose
//             snapshot was successfully computed this run.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeeklyConsistency } from "@/lib/consistency-score";
import { sendNotification } from "@/lib/notify";

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
  const snapshotted: Array<{ userId: string; payload: any }> = [];

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
      snapshotted.push({ userId, payload });
    } catch {
      failed.push(userId);
    }
  }

  // ────────────── Phase 16B: weekly digest fan-out ──────────────
  // Sequential await keeps Resend rate limits happy (free tier: 2 req/s).
  // Sequential is fine for the typical ~10\u2013100 user range; revisit at scale.
  let digestSent = 0;
  let digestSkipped = 0;
  let digestFailed = 0;
  for (const { userId, payload } of snapshotted) {
    try {
      const result = await sendNotification({
        userId,
        templateKey: "weekly_digest",
        vars: {
          score: String(payload.score),
          label: String(payload.label || ""),
          mealsPoints: String(payload.mealsPoints),
          workoutsPoints: String(payload.workoutsPoints),
          waterPoints: String(payload.waterPoints),
          weighInPoints: String(payload.weighInPoints),
          noSkipPoints: String(payload.noSkipPoints),
        },
      });
      if (result.email === "sent" || result.whatsapp === "sent") digestSent++;
      else digestSkipped++;
    } catch (e) {
      digestFailed++;
      console.error("[snapshot-consistency] digest send failed", userId, e);
    }
  }

  return NextResponse.json({
    ok: true,
    users: plans.length,
    written,
    failed: failed.length,
    digest: { sent: digestSent, skipped: digestSkipped, failed: digestFailed },
  });
}
