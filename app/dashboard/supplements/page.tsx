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
      userGoal={userGoal}
      userName={userName}
    />
  );
}
