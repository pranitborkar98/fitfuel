import Link from "next/link";
import type { PlanDuration } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { computePrice } from "@/lib/pricing";
import { getWorkoutPlanData } from "@/lib/workout-plan";

import DigitalCheckoutClient, { type DigitalCheckoutOffer } from "./DigitalCheckoutClient";
import styles from "./digital-checkout.module.css";

const DURATION_MAP: Record<string, PlanDuration> = {
  trial: "TRIAL_DAY",
  weekly: "WEEKLY",
  biweekly: "BI_WEEKLY",
  monthly_ex: "MONTHLY_EXCL_WEEKENDS",
  monthly: "ONE_MONTH",
  two_month: "TWO_MONTH",
  three_month: "THREE_MONTH",
};

const DURATION_LABELS: Record<string, string> = {
  trial: "1 day of access",
  weekly: "1 week of access",
  biweekly: "2 weeks of access",
  monthly_ex: "1 month, weekdays",
  monthly: "1 month of access",
  two_month: "2 months of access",
  three_month: "3 months of access",
};

export const metadata = {
  title: "Digital plan checkout",
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function SelectionProblem({ title, message }: { title: string; message: string }) {
  return (
    <main className={styles.problemPage}>
      <div>
        <p>Digital checkout</p>
        <h1>{title}</h1>
        <span>{message}</span>
        <Link href="/plans/digital">Choose a digital plan</Link>
      </div>
    </main>
  );
}

export default async function DigitalCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const planSlug = first(params.planSlug)?.trim() || "";
  const durationKey = first(params.dur)?.trim() || "";
  const bundleParam = first(params.bundle)?.trim().toUpperCase();
  const bundle = bundleParam === "PRO" ? "PRO" : bundleParam === "STARTER" ? "STARTER" : null;
  const duration = DURATION_MAP[durationKey];

  if (!planSlug || !duration || !bundle) {
    return <SelectionProblem title="Choose a plan first." message="The checkout link is incomplete or no longer valid." />;
  }

  const price = await prisma.planPrice.findFirst({
    where: {
      duration,
      mealsPerDay: "ALL_FOUR",
      bundle,
      isDigital: true,
      isActive: true,
      mealPlan: { slug: planSlug },
    },
    include: { mealPlan: true },
  });

  if (!price?.mealPlan) {
    return <SelectionProblem title="This option is not available." message="Its active price could not be confirmed, so we have stopped checkout." />;
  }

  if (bundle === "PRO") {
    const workout = await getWorkoutPlanData(String(price.mealPlan.subCategory || ""), String(price.mealPlan.tier || ""));
    if (!workout) {
      return <SelectionProblem title="Pro is not ready for this plan." message="We will not sell the training bundle until its matching exercise schedule is connected." />;
    }
  }

  const breakdown = computePrice({
    items: [{ mrpRs: price.mrpRs ?? price.priceRs, saleRs: price.priceRs, qty: 1 }],
    discountRs: 0,
    gstPercent: price.gstPercent,
    priceIsTaxInclusive: price.priceIsTaxInclusive,
    buyerStateCode: "MH",
    sellerStateCode: "MH",
  });

  const offer: DigitalCheckoutOffer = {
    planSlug,
    planName: price.mealPlan.displayName,
    durationKey,
    durationLabel: DURATION_LABELS[durationKey] ?? durationKey,
    bundle,
    bundleName: bundle === "PRO" ? "Pro" : "Starter",
    cycleLengthDays: price.mealPlan.cycleLengthDays,
    taxableRs: breakdown.subtotalRs,
    gstRs: breakdown.gstRs,
    gstPercent: price.gstPercent,
    totalRs: breakdown.totalRs,
  };

  return <DigitalCheckoutClient offer={offer} />;
}
