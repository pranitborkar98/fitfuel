// app/api/admin/partners/qr/route.ts
// Phase 17B — QR code generator for printable partner posters.
// GET ?code=XXX → returns image/png of QR pointing to <origin>/p/<code>
// GET ?code=XXX&format=svg → returns image/svg+xml
// GET ?code=XXX&download=1 → adds Content-Disposition for browser download

import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/admin-auth";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  const me = await requireApiRole("partners");
  if (!me) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const code = (url.searchParams.get("code") || "").trim();
  const format = (url.searchParams.get("format") || "png").toLowerCase();
  const download = url.searchParams.get("download") === "1";

  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  // Resolve the public origin (works locally + on Vercel)
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "fitfuel-eosin.vercel.app";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const target = `${proto}://${host}/p/${encodeURIComponent(code)}`;

  if (format === "svg") {
    const svg = await QRCode.toString(target, {
      type: "svg",
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#000000", light: "#FFFFFF" },
      width: 1024,
    });
    const headers: Record<string, string> = {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    };
    if (download) headers["Content-Disposition"] = `attachment; filename="fitfuel-${code}-qr.svg"`;
    return new NextResponse(svg, { headers });
  }

  // Default PNG
  const png: Buffer = await QRCode.toBuffer(target, {
    type: "png",
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#000000", light: "#FFFFFF" },
    width: 1024,
  });

  const headers: Record<string, string> = {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=3600",
  };
  if (download) headers["Content-Disposition"] = `attachment; filename="fitfuel-${code}-qr.png"`;
  return new NextResponse(new Uint8Array(png), { headers });
}
