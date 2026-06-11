// app/api/admin/upload/route.ts
// Image upload via Vercel Blob (client-upload pattern — file goes straight from
// the browser to Blob, bypassing the 4.5MB serverless body limit). This route
// only mints a short-lived upload token, and only for signed-in staff.

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getAdminUser } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const admin = await getAdminUser();
        if (!admin) throw new Error("Not authorized");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
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
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Upload failed" }, { status: 400 });
  }
}
