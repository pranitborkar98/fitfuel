// app/api/digital-plan/[slug]/pdf/route.tsx — designed, personalised PDF. PRO appends training.
// OWNER/ADMIN preview any plan as PRO. Workout matched by subCategory. Personalisation from the buyer's profile.
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { DigitalPlanDocument } from "@/lib/digital-plan-pdf";
import { getDigitalPlanData } from "@/lib/digital-plan";
import { getWorkoutPlanData } from "@/lib/workout-plan";
import { getPersonalization } from "@/lib/personalization";
import { put, list } from "@vercel/blob";
import { createHash } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const me = await (prisma as any).user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  const isStaff = me?.role === "OWNER" || me?.role === "ADMIN";

  const owns = await (prisma as any).userActivePlan.findFirst({
    where: { userId: session.user.id, isDigital: true, mealPlan: { slug }, status: { in: ["active", "completed"] } },
    select: { id: true, bundle: true },
  });
  if (!owns && !isStaff) return new Response("You don't have access to this plan.", { status: 403 });

  const bundle: "STARTER" | "PRO" = owns?.bundle ?? "PRO"; // staff preview = full PRO

  const data = await getDigitalPlanData(slug);
  if (!data) return new Response("Plan not found", { status: 404 });

  // Personalise from the signed-in user's profile + latest scale reading (falls back to plan defaults).
  const person = await getPersonalization(data, { userId: session.user.id });

  let workout = null;
  if (bundle === "PRO") {
    const plan = await (prisma as any).mealPlan.findUnique({ where: { slug }, select: { subCategory: true, tier: true } });
    if (plan) workout = await getWorkoutPlanData(String(plan.subCategory), String(plan.tier));
  }

  const pdfHeaders = {
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="fitfuel-${slug}-${bundle.toLowerCase()}.pdf"`,
    "Cache-Control": "private, max-age=3600",
  };

  // F11: cache the rendered PDF in Vercel Blob. The doc is personalised (profile +
  // latest weigh-in), so the key carries a hash of the inputs — when the buyer's
  // stats change, the hash changes and a fresh PDF is rendered. Blob failures fall
  // back to rendering inline, so caching can never break a download.
  const sig = createHash("sha1")
    .update(JSON.stringify({ person, bundle, slug, hasWorkout: !!workout }))
    .digest("hex")
    .slice(0, 12);
  const cacheKey = `digital-plans/${session.user.id}/${slug}-${bundle.toLowerCase()}-${sig}.pdf`;

  // 1) Serve from cache if present (fetched server-side so the auth gate still applies).
  try {
    const { blobs } = await list({ prefix: cacheKey, limit: 1 });
    const hit = blobs.find((b) => b.pathname === cacheKey);
    if (hit) {
      const cached = await fetch(hit.url);
      if (cached.ok) {
        const cachedBuf = Buffer.from(await cached.arrayBuffer());
        return new Response(new Uint8Array(cachedBuf), { headers: pdfHeaders });
      }
    }
  } catch (e) {
    console.error("[pdf] blob cache read failed — rendering fresh", e);
  }

  // 2) Render.
  const buffer = await renderToBuffer(<DigitalPlanDocument data={data} workout={workout} bundle={bundle} person={person} />);

  // 3) Cache for next time (best-effort).
  try {
    await put(cacheKey, Buffer.from(buffer), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/pdf",
    });
  } catch (e) {
    console.error("[pdf] blob cache write failed", e);
  }

  return new Response(new Uint8Array(buffer), { headers: pdfHeaders });
}