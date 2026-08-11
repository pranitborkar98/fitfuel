// app/dashboard/supplements/page.tsx
//
// Server frame. The stack, the quiz and the catalogue filter all have state,
// so they stay in the client component below the header.

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { screen, body, label, APP_MAX } from "@/app/_app/theme";
import SupplementsClient from "./SupplementsClient";

export const metadata: Metadata = { title: "Supplements" };
export const dynamic = "force-dynamic";

const WRAP: React.CSSProperties = {
  width: "100%", maxWidth: APP_MAX, margin: "0 auto",
  padding: "0 clamp(16px,4vw,28px)",
};

export default async function SupplementsDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard/supplements");

  // This read `(profile as any).goal`. UserProfile has no `goal`; that column
  // belongs to Testimonial. So it was always undefined, mapProfileGoal always
  // got null, and the "personalised" stack was the balanced default for every
  // user who ever opened this screen. The cast is what let it through.
  let userGoal: string | null = null;
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: { fitnessGoal: true },
    });
    userGoal = profile?.fitnessGoal ?? null;
  } catch {
    userGoal = null;
  }

  return (
    <div style={{ ...WRAP, paddingTop: 26 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={screen()}>Supplements</h1>
        <span style={label(12)}>Researched, not stocked</span>
      </header>
      <p style={body(14, { margin: "12px 0 0", maxWidth: "68ch" })}>
        We do not sell these. This is what the evidence says, what a dose looks like, and what
        it costs on the open market, so you can decide for yourself.
      </p>

      <SupplementsClient userGoal={userGoal} />
    </div>
  );
}
