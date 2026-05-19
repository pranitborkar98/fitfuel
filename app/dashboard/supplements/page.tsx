// app/dashboard/supplements/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SupplementsClient from "./SupplementsClient";

export const metadata = {
  title: "My Supplements — FitFuel Dashboard",
};

export default async function SupplementsDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard/supplements");

  const userId = session.user.id;

  // ── Premium check ──────────────────────────────────────────────────────────
  // Checks active_plans for a Premium or Luxury product.
  // TODO: adjust the `where` clause and relation name to match your exact schema
  // field names once the premium plan products are seeded/confirmed.
  let isPremium = false;
  try {
    const activePlan = await prisma.activePlan.findFirst({
      where: { userId },
      include: { product: true }, // adjust relation name if needed
    });
    // Check product tier — adjust field access to match your MealPlanProduct schema
    const tier = (activePlan?.product as any)?.tier?.toLowerCase() ?? "";
    isPremium = tier === "premium" || tier === "luxury";
  } catch {
    // Schema mismatch or no active plan — default to false
    isPremium = false;
  }

  // ── User goal from profile ─────────────────────────────────────────────────
  let userGoal: string | null = null;
  try {
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    userGoal = (profile as any)?.goal ?? null;
  } catch {
    userGoal = null;
  }

  const userName = session.user.name ?? null;

  return (
    <SupplementsClient
      isPremium={isPremium}
      userGoal={userGoal}
      userName={userName}
    />
  );
}
