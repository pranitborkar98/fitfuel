// app/partners/apply/page.tsx
// Phase 17C-1 — Self-onboarding form for Trainer / Influencer / Dietician / Doctor.
// Per Decision #118: must be signed in. Per #123: manual admin approve (creates PENDING).

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ApplyClient from "./ApplyClient";

const db = prisma as any;

export const dynamic = "force-dynamic";

export default async function PartnerApplyPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/partners/apply");
  }

  // If user already owns a Partner row, send them to /dashboard/partners.
  const existing = await db.partner.findUnique({
    where: { ownerUserId: session.user.id },
    select: { id: true, type: true, status: true },
  });

  if (existing && existing.type !== "CUSTOMER") {
    redirect("/dashboard/partners");
  }

  // Prefill from user account
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true },
  });

  return <ApplyClient prefill={{ name: user?.name || "", email: user?.email || "", phone: user?.phone || "" }} />;
}
