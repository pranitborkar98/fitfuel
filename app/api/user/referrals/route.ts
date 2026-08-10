// app/api/user/referrals/route.ts
// Phase 17B — Customer P2P referrals data.
// GET: returns { code, creditsBalanceRs, referees, totalEarnedRs, name }
//
// The query itself lives in lib/referrals so the dashboard screen can render it
// on the server without a round trip. This route stays for client callers.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getReferralSummary } from "@/lib/referrals";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getReferralSummary(session.user.id));
}
