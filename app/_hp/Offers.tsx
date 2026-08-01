// app/_hp/Offers.tsx
//
// THE PRICE, BUILDABLE.
//
// Two things had never appeared on this homepage and both cost real money:
//
//  1. The coupon codes. They are seeded, live, and validated at checkout by
//     lib/coupons.ts, and no visitor could discover one without an email from
//     us. They are read here with the same validity gate checkout applies, so an
//     expired code can never sit on the page looking live.
//
//  2. Every duration but one. The receipt was demonstrated on the trial day and
//     the other six durations were left to the plan pages, which made the
//     section's own claim — delivery and packaging are named, not buried —
//     something a visitor had to take on trust six times out of seven.
//
// SUBTOTALS ARE QUERIED, NOT EXTRAPOLATED. Every chip is a real PlanPrice row
// for the reference plan at ALL_FOUR meals, VEGETARIAN. A duration with no
// seeded price does not get a chip. That matters more than completeness here:
// this is the section that argues the numbers are checkable, so inventing the
// three-month figure by multiplying the weekly one would undo it.
//
// The trial day is always present, from lib/trial-price, because it is the offer
// the rest of the page is selling and it is derived rather than seeded.
//
// SERVER COMPONENT. The chips are a control and live in PriceBuilder.

import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { TRIAL_SUBTOTAL_RS } from "@/lib/trial-price";
import { countPublishedPrices } from "@/lib/site-counts";
import s from "./hp.module.css";
import v from "./v2.module.css";
import Idx from "./Idx";
import PriceBuilder, { type Duration, type Coupon } from "./PriceBuilder";
import { PLAN_SLUG } from "./menu-data";
import { WRAP, PANEL, DIM, display, body } from "./theme";
import type { PlanDurationKey } from "@/lib/pricing-decomposition";

const money = (n: number) => `Rs ${n.toLocaleString("en-IN")}`;

/* Label and one line of copy per duration. The FIGURES come from Postgres; only
   the words are here. */
const COPY: Record<PlanDurationKey, { label: string; blurb: string }> = {
  TRIAL_DAY: {
    label: "One day",
    blurb:
      "Four meals, cooked and delivered, weighed to your macros. No subscription, no card kept on file, nothing to cancel.",
  },
  WEEKLY: {
    label: "One week",
    blurb: "Six delivered mornings and a Sunday off. Long enough to know whether you want the month.",
  },
  BI_WEEKLY: {
    label: "Two weeks",
    blurb: "Twelve delivered mornings. The point at which the diary stops being something you think about.",
  },
  MONTHLY_EXCL_WEEKENDS: {
    label: "Weekdays only",
    blurb: "Twenty-two deliveries, Monday to Friday. For people who cook at the weekend and not otherwise.",
  },
  ONE_MONTH: {
    label: "One month",
    blurb: "The full rotation: thirty days, no dish twice running, the whole schedule published before you pay.",
  },
  TWO_MONTH: {
    label: "Two months",
    blurb: "Long enough for the coach to see a trend, call a plateau and move your target on real weigh-ins.",
  },
  THREE_MONTH: {
    label: "Three months",
    blurb: "The lowest per-day figure we publish, and the horizon body composition actually changes over.",
  },
};

const ORDER: PlanDurationKey[] = [
  "TRIAL_DAY",
  "WEEKLY",
  "BI_WEEKLY",
  "MONTHLY_EXCL_WEEKENDS",
  "ONE_MONTH",
  "TWO_MONTH",
  "THREE_MONTH",
];

async function getDurations(): Promise<Duration[]> {
  const seeded = new Map<string, number>();
  try {
    const plan = await prisma.mealPlan.findUnique({
      where: { slug: PLAN_SLUG },
      select: { id: true },
    });
    if (plan) {
      const rows = await prisma.planPrice.findMany({
        where: {
          mealPlanId: plan.id,
          isActive: true,
          isDigital: false,
          diet: "VEGETARIAN",
          mealsPerDay: "ALL_FOUR",
        },
        select: { duration: true, priceRs: true },
      });
      for (const r of rows) seeded.set(String(r.duration), r.priceRs);
    }
  } catch {
    /* Fall through: the trial day below is derived and always available, so the
       section still renders its argument with one real receipt. */
  }

  return ORDER.flatMap((key) => {
    const subtotalRs = key === "TRIAL_DAY" ? TRIAL_SUBTOTAL_RS : seeded.get(key);
    if (!subtotalRs) return [];
    return [{ key, subtotalRs, label: COPY[key].label, blurb: COPY[key].blurb }];
  });
}

type CouponRow = {
  code: string;
  discountType: "PERCENT" | "FLAT" | "FREE_DELIVERY";
  value: number;
  maxDiscountRs: number | null;
  minOrderRs: number | null;
  firstOrderOnly: boolean;
  appliesTo: string;
  validUntil: Date | null;
};

function headlineFor(c: CouponRow): string {
  if (c.discountType === "PERCENT") {
    return c.maxDiscountRs ? `${c.value}% off, up to ${money(c.maxDiscountRs)}` : `${c.value}% off`;
  }
  if (c.discountType === "FLAT") return `${money(c.value)} off`;
  return "Free delivery";
}

function termsFor(c: CouponRow): string {
  const t: string[] = [];
  if (c.minOrderRs) t.push(`orders over ${money(c.minOrderRs)}`);
  if (c.firstOrderOnly) t.push("first order only");
  if (c.appliesTo === "DIGITAL") t.push("digital plans");
  else if (c.appliesTo === "PHYSICAL") t.push("delivered plans");
  else t.push("any plan");
  if (c.validUntil) {
    t.push(
      `until ${new Date(c.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
    );
  }
  return t.join(", ");
}

/* The same validity gate lib/coupons.ts applies, so nothing listed here can be
   rejected at checkout. FREEDEL expired in July and is filtered out by the
   query rather than by us remembering to. */
async function getCoupons(): Promise<Coupon[]> {
  try {
    const now = new Date();
    const rows: CouponRow[] = await prisma.coupon.findMany({
      where: {
        isActive: true,
        source: "MANUAL",
        AND: [
          { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
          { OR: [{ validUntil: null }, { validUntil: { gte: now } }] },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: 3,
      select: {
        code: true,
        discountType: true,
        value: true,
        maxDiscountRs: true,
        minOrderRs: true,
        firstOrderOnly: true,
        appliesTo: true,
        validUntil: true,
      },
    });
    return rows.map((c) => ({ code: c.code, headline: headlineFor(c), terms: termsFor(c) }));
  } catch {
    return [];
  }
}

export default async function Offers() {
  const [durations, coupons, priceCount] = await Promise.all([
    getDurations(),
    getCoupons(),
    countPublishedPrices(),
  ]);

  if (!durations.length) return null;

  return (
    <section
      id="hp-price"
      aria-labelledby="hp-price-h"
      style={{ padding: "clamp(80px,11vw,160px) 0", background: PANEL, borderTop: "1px solid #232320" }}
    >
      <div style={WRAP}>
        <Idx label="Price and offers" />

        <div className={v.head}>
          <div className={v.rise}>
            <h2 id="hp-price-h" style={{ ...display("clamp(2.4rem,6.6vw,5.4rem)"), maxWidth: "13ch" }}>
              Build the receipt before you pay
            </h2>
          </div>
          <p className={v.rise} style={{ ...body(16.5), maxWidth: "48ch" }}>
            Delivery and packaging are named, not buried. GST is stated at 5% instead of
            appearing on the last screen. Pick a duration: this is the same arithmetic
            checkout runs.
          </p>
        </div>

        <PriceBuilder durations={durations} coupons={coupons} />

        {priceCount !== null && (
          <p style={{ ...body(13.5), color: DIM, marginTop: 20, maxWidth: "78ch" }}>
            {priceCount.toLocaleString("en-IN")} published prices across seven durations, four
            diets, three tiers and two delivery windows. Every combination has a real price on
            its plan page with this same breakdown behind it.{" "}
            <Link href="/plans" className={s.link} style={{ display: "inline" }}>
              See real prices
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
