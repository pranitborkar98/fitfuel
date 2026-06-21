// app/api/coach/weekly-review/route.ts
// AI Coach — GET the user's proactive Weekly Review (rules-based v1).
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { buildWeeklyReview } from "@/lib/coach/weekly-review";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const review = await buildWeeklyReview(session.user.id);
  return NextResponse.json(review);
}
