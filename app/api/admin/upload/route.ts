// app/api/admin/upload/route.ts
// Image upload via Vercel Blob (client-upload pattern — file goes straight from
// the browser to Blob, bypassing the 4.5MB serverless body limit). This route
// only mints a short-lived upload token, and only for signed-in staff.

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getAdminUser } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const declared = Number(request.headers.get("content-length") || 0);
    if (declared > 64 * 1024) {
      return NextResponse.json({ error: "Upload request is too large." }, { status: 413 });
    }
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const admin = await getAdminUser();
        if (!admin) throw new Error("Not authorized");
        const rl = await enforceRateLimit(request, "mutation", admin.id);
        if (!rl.ok) throw new Error("Too many upload requests. Please try again shortly.");
        if (!/^(recipes|plans|blog|testimonials)\/[A-Za-z0-9._-]{1,160}$/.test(pathname)) {
          throw new Error("Invalid upload path");
        }
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
          maximumSizeInBytes: 8 * 1024 * 1024, // 8 MB
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ uid: admin.id }),
        };
      },
      onUploadCompleted: async () => {
        // No-op. (Could log the uploaded blob here; webhook only fires in prod.)
      },
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    const expected = ["Not authorized", "Invalid upload path", "Too many upload requests. Please try again shortly."];
    if (!expected.includes(message)) console.error("[admin/upload] failed", error);
    return NextResponse.json(
      { error: expected.includes(message) ? message : "Upload failed. Please try another image." },
      { status: message === "Not authorized" ? 403 : 400 },
    );
  }
}
