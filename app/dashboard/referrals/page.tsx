// app/dashboard/referrals/page.tsx
// Phase 17B — Customer P2P referrals tab.

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import ReferralsClient from "./ReferralsClient";

export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard/referrals");
  }

  // Resolve site origin for the share link (works locally + on Vercel)
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "fitfuel-eosin.vercel.app";
  const proto = h.get("x-forwarded-proto") || "https";
  const origin = `${proto}://${host}`;

  return <ReferralsClient origin={origin} />;
}
