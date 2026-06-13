// app/p/[code]/page.tsx
// Phase 17B (FIX) — Polymorphic branded landing page.
// /p/<CODE> → looks up Partner by code (or User.referralCode for P2P).
// Cookie is set CLIENT-SIDE from LandingClient (Server Components in Next 16
// cannot write cookies). Inactive/unknown codes → fall through to /plans.

import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import LandingClient from "./LandingClient";

const db = prisma as any;

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ code: string }> };

export default async function PartnerLandingPage({ params }: Props) {
  const { code } = await params;
  if (!code) notFound();

  // Try Partner first; if not found / inactive, try a P2P User.referralCode
  const partner = await db.partner.findUnique({
    where: { code },
    select: {
      id: true,
      type: true,
      status: true,
      name: true,
      code: true,
      bio: true,
      specialty: true,
      profilePhotoUrl: true,
      socialHandle: true,
      gymAddress: true,
      gymManagerName: true,
      qualification: true,
      clinicName: true,
      hospitalAffiliation: true,
      companyLogoUrl: true,
      treasurerContact: true,
      societyAddress: true,
      refereeDiscountRs: true,
      rewardType: true,
    },
  });

  let p2pUser: { id: string; name: string | null } | null = null;
  if (!partner || partner.status !== "ACTIVE") {
    p2pUser = await db.user.findFirst({
      where: { referralCode: code },
      select: { id: true, name: true },
    });
  }

  if (!partner && !p2pUser) {
    // Unknown code — silently fall through to /plans without attribution.
    redirect("/plans");
  }

  // Build view model for client
  const view = partner && partner.status === "ACTIVE"
    ? {
        kind: "PARTNER" as const,
        type: partner.type as string,
        name: partner.name,
        code: partner.code,
        bio: partner.bio,
        specialty: partner.specialty,
        profilePhotoUrl: partner.profilePhotoUrl,
        socialHandle: partner.socialHandle,
        gymAddress: partner.gymAddress,
        gymManagerName: partner.gymManagerName,
        qualification: partner.qualification,
        clinicName: partner.clinicName,
        hospitalAffiliation: partner.hospitalAffiliation,
        companyLogoUrl: partner.companyLogoUrl,
        societyAddress: partner.societyAddress,
        treasurerContact: partner.treasurerContact,
        refereeDiscountRs: partner.refereeDiscountRs || 0,
      }
    : {
        kind: "P2P" as const,
        type: "CUSTOMER",
        name: p2pUser?.name || "A friend",
        code,
        refereeDiscountRs: 200,
      };

  return <LandingClient view={view as any} />;
}

export async function generateMetadata({ params }: Props) {
  const { code } = await params;
  return {
    title: `Welcome via ${code} \u2014 FitFuel`,
    description: "Get a special welcome offer on your first FitFuel plan.",
  };
}
