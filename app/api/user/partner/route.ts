// app/api/user/partner/route.ts
// Phase 17B, B2B partner console data.
// GET: the Partner owned by the logged-in user, with conversions and payouts.
//
// The query lives in lib/partner-console so the dashboard screen can render it
// on the server. This route stays for client callers.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPartnerConsole } from "@/lib/partner-console";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const data = await getPartnerConsole(session.user.id);
  if (!data) return NextResponse.json({ partner: null });

  return NextResponse.json(data);
}
