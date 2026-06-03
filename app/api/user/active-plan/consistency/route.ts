// app/api/user/active-plan/consistency/route.ts
// 9R — GET this week's consistency score + breakdown for the dashboard.

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getWeeklyConsistency } from "@/lib/consistency-score";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const breakdown = await getWeeklyConsistency(session.user.id, new Date());
  return NextResponse.json(breakdown);
}
