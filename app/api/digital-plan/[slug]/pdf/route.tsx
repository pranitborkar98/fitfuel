// app/api/digital-plan/[slug]/pdf/route.tsx — owners/admins can preview any plan; buyers get their own.
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

  // staff (OWNER/ADMIN) can preview any plan as PRO; otherwise the user must own a digital plan.
  const me = await (prisma as any).user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  const isStaff = me?.role === "OWNER" || me?.role === "ADMIN";

  const owns = await (prisma as any).userActivePlan.findFirst({
    where: { userId: session.user.id, isDigital: true, mealPlan: { slug }, status: { in: ["active", "completed"] } },
    select: { id: true, bundle: true },
  });

  if (!owns && !isStaff) return new Response("You don't have access to this plan.", { status: 403 });

  const bundle = owns?.bundle ?? "PRO"; // staff preview shows the full PRO doc

  const data = await getDigitalPlanData(slug);
  if (!data) return new Response("Plan not found", { status: 404 });

  let workout = null;
  if (bundle === "PRO") {
    const plan = await (prisma as any).mealPlan.findUnique({ where: { slug }, select: { category: true, tier: true } });
    if (plan) workout = await getWorkoutPlanData(String(plan.category), String(plan.tier));
  }

  const buffer = await renderToBuffer(<DigitalPlanDocument data={data} workout={workout} />);
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="fitfuel-${slug}-${bundle.toLowerCase()}.pdf"`, "Cache-Control": "private, max-age=3600" },
  });
}
