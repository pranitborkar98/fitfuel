// app/api/digital-plan/[slug]/pdf/route.tsx — bundle-aware: PRO gets the training plan appended.
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { DigitalPlanDocument } from "@/lib/digital-plan-pdf";
import { getDigitalPlanData } from "@/lib/digital-plan";
import { getWorkoutPlanData } from "@/lib/workout-plan";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const owns = await (prisma as any).userActivePlan.findFirst({
    where: { userId: session.user.id, isDigital: true, mealPlan: { slug }, status: { in: ["active", "completed"] } },
    select: { id: true, bundle: true },
  });
  if (!owns) return new Response("You don't have access to this plan.", { status: 403 });

  const data = await getDigitalPlanData(slug);
  if (!data) return new Response("Plan not found", { status: 404 });

  // PRO buyers get the workout plan too.
  let workout = null;
  if (owns.bundle === "PRO") {
    const plan = await (prisma as any).mealPlan.findUnique({ where: { slug }, select: { category: true, tier: true } });
    if (plan) workout = await getWorkoutPlanData(String(plan.category), String(plan.tier));
  }

  const buffer = await renderToBuffer(<DigitalPlanDocument data={data} workout={workout} />);
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="fitfuel-${slug}-${owns.bundle.toLowerCase()}.pdf"`, "Cache-Control": "private, max-age=3600" },
  });
}
