import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { supplementIdSchema } from "@/lib/supplements-admin-validation";
import crypto from "node:crypto";
import { after, NextRequest, NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ linkId: string }> };

function catalogueRedirect(req: NextRequest) {
  return NextResponse.redirect(new URL("/supplements", req.url), 303);
}

function hashIp(ip: string): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fitfuel-local-ip-hash";
  return crypto.createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}

function safeAffiliateUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const idResult = supplementIdSchema.safeParse((await ctx.params).linkId);
  if (!idResult.success) return catalogueRedirect(req);

  const link = await prisma.supplementLink.findUnique({
    where: { id: idResult.data },
    select: {
      id: true,
      supplementId: true,
      network: true,
      affiliateUrl: true,
      isActive: true,
      supplement: { select: { isActive: true } },
    },
  });
  const destination = link ? safeAffiliateUrl(link.affiliateUrl) : null;
  if (!link?.isActive || !link.supplement.isActive || !destination) return catalogueRedirect(req);

  const rateLimit = await enforceRateLimit(req, "read", `supplement-click:${link.id}`);
  if (rateLimit.ok) {
    const referrer = req.headers.get("referer")?.slice(0, 2_048) || null;
    const userAgent = req.headers.get("user-agent")?.slice(0, 1_000) || null;
    const ipHash = hashIp(getClientIp(req));

    after(async () => {
      try {
        const session = await auth().catch(() => null);
        await prisma.supplementClick.create({
          data: {
            userId: session?.user?.id ?? null,
            supplementId: link.supplementId,
            linkId: link.id,
            network: link.network,
            referrer,
            ipHash,
            userAgent,
          },
        });
      } catch (error: unknown) {
        console.error("[supplements/click] analytics write failed", error);
      }
    });
  }

  return NextResponse.redirect(destination, 302);
}
