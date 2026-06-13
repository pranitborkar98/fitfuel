// app/p/[code]/page.tsx
// Phase 17B — Polymorphic branded landing page.
// /p/<CODE> → looks up Partner by code (or User.referralCode for P2P),
// sets ff_ref cookie (first-touch, 30 days), renders branded UI per type.
// Inactive/unknown codes → fall through to /plans with no attribution.

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import LandingClient from "./LandingClient";

const db = prisma as any;

export const dynamic = "force-dynamic";

const COOKIE_NAME = "ff_ref";
const COOKIE_DAYS = 30;

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

  // First-touch attribution: only set cookie if not already present.
  const jar = await cookies();
  const existing = jar.get(COOKIE_NAME)?.value;
  if (!existing) {
    jar.set({
      name: COOKIE_NAME,
      value: code,
      httpOnly: false, // readable client-side too (debugging, manual override)
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * COOKIE_DAYS,
    });
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
    title: `Welcome via ${code} — FitFuel`,
    description: "Get a special welcome offer on your first FitFuel plan.",
  };
}
