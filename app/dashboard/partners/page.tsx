// app/dashboard/partners/page.tsx
// Phase 17B — B2B partner dashboard (logged-in partner views their conversions + payouts).
// CUSTOMER-type partners aren't shown this surface — they have /dashboard/referrals instead.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import PartnerDashboardClient from "./PartnerDashboardClient";

const db = prisma as any;

export const dynamic = "force-dynamic";

export default async function PartnerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard/partners");
  }

  // Server-side gate: if this user doesn't own a non-CUSTOMER Partner, kick them out.
  const partner = await db.partner.findUnique({
    where: { ownerUserId: session.user.id },
    select: { id: true, type: true, status: true },
  });

  if (!partner) {
    // No partner row at all → send to /dashboard
    redirect("/dashboard");
  }
  if (partner.type === "CUSTOMER") {
    // P2P customer → send to referrals tab
    redirect("/dashboard/referrals");
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "fitfuel-eosin.vercel.app";
  const proto = h.get("x-forwarded-proto") || "https";
  const origin = `${proto}://${host}`;

  return <PartnerDashboardClient origin={origin} />;
}
