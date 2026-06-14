// app/api/supplements/click/[linkId]/route.ts
// Phase 18-1 — Affiliate click tracker.
//
// GET /api/supplements/click/<linkId>?ref=card|modal|stack
//   → logs the click to SupplementClick (async, non-blocking)
//   → 302 redirects to SupplementLink.affiliateUrl
//
// Per Decision #141: logging fires-and-forgets. If the DB write fails, the
// redirect still happens — revenue path doesn't depend on analytics path.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import crypto from "crypto";

const db = prisma as any;

// Hash IPs for privacy — never store raw.
function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

type RouteCtx = { params: Promise<{ linkId: string }> };

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const { linkId } = await ctx.params;
  if (!linkId) {
    return NextResponse.redirect(new URL("/supplements", req.url), 303);
  }

  // Resolve the link.
  const link = await db.supplementLink.findUnique({
    where: { id: linkId },
    select: {
      id: true,
      supplementId: true,
      network: true,
      affiliateUrl: true,
      isActive: true,
    },
  });

  if (!link || !link.isActive || !link.affiliateUrl) {
    // Bad / inactive link — bounce to catalog instead of erroring out.
    return NextResponse.redirect(new URL("/supplements", req.url), 303);
  }

  // Fire-and-forget click log. Do NOT await.
  const referrerHeader = req.headers.get("referer") || null;
  const userAgent = req.headers.get("user-agent") || null;
  const ipRaw =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const ipHash = hashIp(ipRaw);

  // Try to attribute to a signed-in user without blocking the redirect.
  (async () => {
    try {
      let userId: string | null = null;
      try {
        const session = await auth();
        userId = session?.user?.id || null;
      } catch {
        // Auth check failure shouldn't break logging
      }
      await db.supplementClick.create({
        data: {
          userId,
          supplementId: link.supplementId,
          linkId: link.id,
          network: link.network,
          referrer: referrerHeader,
          ipHash,
          userAgent,
        },
      });
    } catch (e) {
      console.error("[supplements/click] log failed", { linkId, e });
    }
  })();

  // Redirect immediately (302).
  return NextResponse.redirect(link.affiliateUrl, 302);
}
