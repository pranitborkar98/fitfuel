import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import LandingClient, { type PartnerLandingView } from "./LandingClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ code: string }> };

const publicPartnerSelect = {
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
} satisfies Prisma.PartnerSelect;

type PublicPartner = Prisma.PartnerGetPayload<{ select: typeof publicPartnerSelect }>;

function partnerView(partner: PublicPartner): PartnerLandingView {
  return {
    kind: "PARTNER",
    type: partner.type,
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
    refereeDiscountRs: partner.refereeDiscountRs,
  };
}

export default async function PartnerLandingPage({ params }: Props) {
  const raw = (await params).code?.trim().slice(0, 80);
  if (!raw) notFound();

  const partner = await prisma.partner.findFirst({
    where: {
      OR: [
        { code: raw.toUpperCase() },
        { customLandingSlug: raw.toLowerCase() },
      ],
    },
    select: publicPartnerSelect,
  });

  if (partner) {
    if (partner.status !== "ACTIVE") redirect("/plans");
    return <LandingClient view={partnerView(partner)} />;
  }

  const user = await prisma.user.findFirst({
    where: { referralCode: raw.toUpperCase() },
    select: {
      name: true,
      referralCode: true,
      ownedPartner: { select: publicPartnerSelect },
    },
  });
  if (!user) redirect("/plans");

  if (user.ownedPartner) {
    if (user.ownedPartner.status !== "ACTIVE") redirect("/plans");
    return <LandingClient view={partnerView(user.ownedPartner)} />;
  }

  const view: PartnerLandingView = {
    kind: "P2P",
    type: "CUSTOMER",
    name: user.name || "A friend",
    code: user.referralCode || raw.toUpperCase(),
    refereeDiscountRs: 200,
  };
  return <LandingClient view={view} />;
}

export async function generateMetadata({ params }: Props) {
  await params;
  return {
    title: "A verified FitFuel invitation",
    description: "See the FitFuel welcome offer attached to this verified referral page.",
    robots: { index: false, follow: true },
  };
}
