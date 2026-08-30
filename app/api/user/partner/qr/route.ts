import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";
import { readQuery } from "@/lib/validation/core";
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { z } from "zod";

const querySchema = z.object({
  format: z.enum(["png", "svg"]).default("png"),
  download: z.enum(["0", "1"]).default("0"),
}).strict();

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limit = await enforceRateLimit(req, "read", session.user.id);
  if (!limit.ok) return limit.response;

  const parsed = readQuery(req, querySchema);
  if (!parsed.ok) return parsed.response;

  const partner = await prisma.partner.findUnique({
    where: { ownerUserId: session.user.id },
    select: { code: true, status: true, type: true },
  });
  if (!partner || partner.type === "CUSTOMER") {
    return NextResponse.json({ error: "Partner account not found." }, { status: 404 });
  }
  if (partner.status !== "ACTIVE") {
    return NextResponse.json({ error: "The partner code is not active." }, { status: 409 });
  }

  const target = `${SITE_URL}/p/${encodeURIComponent(partner.code)}`;
  const options = {
    margin: 2,
    errorCorrectionLevel: "H" as const,
    color: { dark: "#070707", light: "#FFFFFF" },
    width: 1024,
  };
  const headers: Record<string, string> = { "Cache-Control": "private, no-store" };
  if (parsed.data.download === "1") {
    headers["Content-Disposition"] = `attachment; filename="fitfuel-${partner.code}-qr.${parsed.data.format}"`;
  }

  if (parsed.data.format === "svg") {
    const svg = await QRCode.toString(target, { ...options, type: "svg" });
    headers["Content-Type"] = "image/svg+xml; charset=utf-8";
    return new NextResponse(svg, {
      headers,
    });
  }

  const png = await QRCode.toBuffer(target, { ...options, type: "png" });
  headers["Content-Type"] = "image/png";
  return new NextResponse(new Uint8Array(png), {
    headers,
  });
}
