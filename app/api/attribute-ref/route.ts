// app/api/attribute-ref/route.ts
// Phase 17A — attribution capture (first-touch wins).

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveReferralCode } from "@/lib/partners";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { attributeRefSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await enforceRateLimit(req, "mutation", session.user.id);
  if (!rl.ok) return rl.response;
  const parsed = await readJson(req, attributeRefSchema);
  if (!parsed.ok) return parsed.response;
  const code = (parsed.data.code ?? "").trim().toUpperCase().slice(0, 64);
  if (!code) return NextResponse.json({ ok: true, attributed: false });

  const resolved = await resolveReferralCode(code);
  if (!resolved) return NextResponse.json({ ok: true, attributed: false, reason: "unknown_code" });
  const resolvedCode = resolved.kind === "PARTNER" ? resolved.partner.code : code;

  const self = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      OR: [{ referralCode: resolvedCode }, { ownedPartner: { code: resolvedCode } }],
    },
    select: { id: true },
  });
  if (self) return NextResponse.json({ ok: true, attributed: false, reason: "self" });

  const u = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { referredByPartnerCode: true },
  });
  if (u?.referredByPartnerCode) {
    return NextResponse.json({ ok: true, attributed: false, reason: "already_attributed" });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { referredByPartnerCode: resolvedCode },
  });

  return NextResponse.json({ ok: true, attributed: true });
}
