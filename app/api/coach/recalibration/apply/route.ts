// app/api/coach/recalibration/apply/route.ts
// AI Coach — Act layer (LOOP-6). Apply the recommended calorie target.
// Server-authoritative: recomputes the recalibration from the user's data and
// only applies its own recommendation — never a client-supplied number.
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { buildWeeklySummary } from "@/lib/coach/weekly-summary";
import { computeRecalibration } from "@/lib/coach/recalibration";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const summary = await buildWeeklySummary(userId);
  const recal = computeRecalibration(summary);

  if (!recal.canApply) {
    return NextResponse.json(
      { applied: false, reason: "No applicable recalibration right now.", recalibration: recal },
      { status: 409 }
    );
  }

  const db = prisma as any;
  const target = recal.recommendedTarget;

  // update the active plan's personalised target (if any) + the profile target
  await db.userActivePlan.updateMany({
    where: { userId, status: "active" },
    data: { calorieTarget: target },
  });
  await db.userProfile.updateMany({
    where: { userId },
    data: { calorieTarget: target },
  });

  return NextResponse.json({
    applied: true,
    newCalorieTarget: target,
    deltaKcal: recal.deltaKcal,
    recalibration: recal,
  });
}
