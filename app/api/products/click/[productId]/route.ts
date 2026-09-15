import crypto from "node:crypto";
import { after, NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { findNutrabaySnapshotProduct, safeNutrabayUrl } from "@/lib/nutrabay-catalog";
import { prisma } from "@/lib/prisma";
import { readWithDeadline } from "@/lib/read-with-deadline";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { supplementIdSchema } from "@/lib/supplements-admin-validation";

type RouteCtx = { params: Promise<{ productId: string }> };

function marketplaceRedirect(req: NextRequest) {
  return NextResponse.redirect(new URL("/products", req.url), 303);
}

function hashIp(ip: string): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fitfuel-local-ip-hash";
  return crypto.createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const productId = (await ctx.params).productId;
  const snapshotProduct = findNutrabaySnapshotProduct(productId);
  const idResult = supplementIdSchema.safeParse(productId);
  if (!snapshotProduct && !idResult.success) return marketplaceRedirect(req);

  const rateLimit = await enforceRateLimit(req, "read", `product-click:${productId}`);
  if (!rateLimit.ok) return rateLimit.response;

  const product = await readWithDeadline(prisma.affiliateProduct.findUnique({
        where: snapshotProduct
          ? { retailer_retailerProductId: { retailer: "NUTRABAY", retailerProductId: snapshotProduct.retailerProductId } }
          : { id: idResult.data! },
        select: {
          id: true,
          retailer: true,
          affiliateUrl: true,
          isActive: true,
        },
      }), 2_500).catch(() => null);
  const destination = safeNutrabayUrl(
    product?.affiliateUrl ?? snapshotProduct?.affiliateUrl ?? "",
  );
  if ((product && !product.isActive) || !destination) return marketplaceRedirect(req);

  if (product) {
    const referrer = req.headers.get("referer")?.slice(0, 2_048) || null;
    const userAgent = req.headers.get("user-agent")?.slice(0, 1_000) || null;
    const ipHash = hashIp(getClientIp(req));

    after(async () => {
      try {
        const session = await auth().catch(() => null);
        await prisma.affiliateProductClick.create({
          data: {
            productId: product.id,
            userId: session?.user?.id ?? null,
            retailer: product.retailer,
            referrer,
            ipHash,
            userAgent,
          },
        });
      } catch (error: unknown) {
        console.error("[products/click] analytics write failed", error);
      }
    });
  }

  return NextResponse.redirect(destination, 302);
}
