// app/partners/apply/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ApplyClient from "./ApplyClient";

export const metadata = {
  title: "Apply to partner with FitFuel",
  description:
    "Apply for a FitFuel partner code. Approved partners can track referred customers, first paid conversions and payouts.",
  alternates: { canonical: "/partners/apply" },
};

// Stays dynamic: calls auth() to prefill the form for a signed-in applicant.
export const dynamic = "force-dynamic";

const PARTNER_TYPES = new Set(["GYM", "TRAINER", "INFLUENCER", "DIETICIAN", "DOCTOR", "CORPORATE", "RESIDENCE"]);

export default async function PartnerApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const requested = (await searchParams).type?.toUpperCase();
  const initialType = requested && PARTNER_TYPES.has(requested) ? requested : null;
  const session = await auth();
  if (!session?.user?.id) {
    const callback = initialType ? `/partners/apply?type=${initialType}` : "/partners/apply";
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callback)}`);
  }

  // If user already owns a Partner row, send them to /dashboard/partners.
  const existing = await prisma.partner.findUnique({
    where: { ownerUserId: session.user.id },
    select: { id: true, type: true, status: true },
  });

  if (existing && existing.type !== "CUSTOMER") {
    redirect("/dashboard/partners");
  }

  // Prefill from user account
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true },
  });

  return (
    <ApplyClient
      initialType={initialType}
      prefill={{ name: user?.name || "", email: user?.email || "", phone: user?.phone || "" }}
    />
  );
}
