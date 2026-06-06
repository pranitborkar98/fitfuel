// app/api/digital-plan/[slug]/pdf/route.ts  (Phase 13B — download route)
// Gated: only a user who bought this digital plan can download.
// Auth.js v5 — read session via auth() (Decision #65). Adjust import paths to your project.
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { DigitalPlanDocument } from "@/lib/digital-plan-pdf";
import { getDigitalPlanData } from "@/lib/digital-plan";

export const runtime = "nodejs";      // react-pdf needs Node, not edge
export const maxDuration = 60;        // big docs take time; raise if on a paid plan

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Ownership: an active DIGITAL plan for this user on this meal plan.
  const owns = await prisma.userActivePlan.findFirst({
    where: {
      userId: session.user.id,
      isDigital: true,
      mealPlan: { slug },
      status: { in: ["active", "completed"] },
    },
    select: { id: true },
  });
  if (!owns) {
    return new Response("You don't have access to this plan.", { status: 403 });
  }

  const data = await getDigitalPlanData(slug);
  if (!data) return new Response("Plan not found", { status: 404 });

  // TODO (perf): cache the generated PDF in Vercel Blob keyed by slug, regenerate only when
  // the plan's recipes/schedule change. Re-rendering a 30-day doc on every request is wasteful.
  const buffer = await renderToBuffer(<DigitalPlanDocument data={data} />);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="fitfuel-${slug}.pdf"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
