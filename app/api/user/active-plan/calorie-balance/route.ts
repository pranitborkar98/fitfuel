// app/api/user/active-plan/calorie-balance/route.ts
// GET — returns today's net calorie balance for the dashboard ring

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getDailyCalorieBalance } from "@/lib/net-calories";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const balance = await getDailyCalorieBalance(session.user.id, new Date());
  return NextResponse.json(balance);
}
