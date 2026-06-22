// app/api/checkout/credit-preview/route.ts  · WS-3 hardened (SEC-1/2)
// Phase 17C-2 — Returns the signed-in user's credit balance + how much
// is applicable to the given order amount.
//
// GET ?subtotal=4200 → { signedIn: true, balanceRs: 500, applicableRs: 500, newTotalRs: 3700 }
//
// Guests get { signedIn: false, balanceRs: 0, applicableRs: 0, newTotalRs: <amount> }.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readQuery } from "@/lib/validation/core";
import { creditPreviewQuerySchema } from "@/lib/validation/schemas";

const db = prisma as any;

export async function GET(req: NextRequest) {
  // SEC-1: credit-balance enumeration guard.
  const rl = await enforceRateLimit(req, "creditPreview");
  if (!rl.ok) return rl.response;

  // SEC-2: validate + coerce the query (subtotal → number, defaults to 0).
  const parsed = readQuery(req, creditPreviewQuerySchema);
  if (!parsed.ok) return parsed.response;
  const subtotalRs = Math.max(0, Math.round(parsed.data.subtotal));

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({
      signedIn: false,
      balanceRs: 0,
      applicableRs: 0,
      newTotalRs: subtotalRs,
    });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { creditsBalanceRs: true, email: true },
  });
  const balanceRs = user?.creditsBalanceRs ?? 0;

  // Cap at subtotal - 1 to keep PayU happy (no zero-amount orders).
  // If subtotal <= 1, no credit applies.
  let applicableRs = 0;
  if (balanceRs > 0 && subtotalRs > 1) {
    applicableRs = Math.min(balanceRs, subtotalRs - 1);
  }

  return NextResponse.json({
    signedIn: true,
    email: user?.email ?? null,
    balanceRs,
    applicableRs,
    newTotalRs: subtotalRs - applicableRs,
  });
}
