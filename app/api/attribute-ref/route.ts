// app/api/attribute-ref/route.ts
// Phase 17A \u2014 attribution capture. Browser POSTs the ref code (from cookie or URL)
// to this endpoint after login. We write it to User.referredByPartnerCode IF
// the user has no prior attribution (first-touch wins).

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveReferralCode } from "@/lib/partners";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const code = typeof body?.code === "string" ? body.code.trim().slice(0, 64) : "";
  if (!code) return NextResponse.json({ ok: true, attributed: false });

  // Resolve to confirm it's a real code before saving
  const resolved = await resolveReferralCode(code);
  if (!resolved) return NextResponse.json({ ok: true, attributed: false, reason: "unknown_code" });

  // Self-referral guard
  const self = await (prisma as any).user.findFirst({
    where: { id: session.user.id, referralCode: code },
    select: { id: true },
  });
  if (self) return NextResponse.json({ ok: true, attributed: false, reason: "self" });

  // First-touch only
  const u = await (prisma as any).user.findUnique({
    where: { id: session.user.id },
    select: { referredByPartnerCode: true },
  });
  if (u?.referredByPartnerCode) {
    return NextResponse.json({ ok: true, attributed: false, reason: "already_attributed" });
  }

  await (prisma as any).user.update({
    where: { id: session.user.id },
    data: { referredByPartnerCode: code },
  });

  return NextResponse.json({ ok: true, attributed: true });
}
