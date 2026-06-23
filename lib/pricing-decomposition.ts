// lib/pricing-decomposition.ts
// R-PRICE (Decision #189) — single source of truth for the marketing price model.
// Pure + deterministic. Strips delivery+packaging OUT of the headline (low "base"
// shown on cards) and the checkout adds them back to reach the real subtotal,
// then GST on top. The seeded PlanPrice.priceRs IS the real, GST-EXCLUSIVE subtotal
// and never changes — this lib only reshapes how that number is presented.
//
//   card:      MRP(struck)  →  base
//   checkout:  base + delivery + packaging = subtotal  (+) GST = total(paid)
//
// Digital plans have NO delivery/packaging: base = subtotal, MRP strike + GST only.

export type PlanDurationKey =
  | "TRIAL_DAY"
  | "WEEKLY"
  | "BI_WEEKLY"
  | "MONTHLY_EXCL_WEEKENDS"
  | "ONE_MONTH"
  | "TWO_MONTH"
  | "THREE_MONTH";

// CANONICAL delivery count per duration (Decision #189 — resolves the 14-vs-15 /
// 22-vs-26 drift across cod/activate-digital/plan-tier-pricing). Used for charge
// scaling. NOTE: this is the number of DELIVERIES, which for MONTHLY_EXCL_WEEKENDS
// differs from the calendar end-date span — keep that fix separate (activation layer).
export const DELIVERY_COUNT: Record<PlanDurationKey, number> = {
  TRIAL_DAY: 1,
  WEEKLY: 7,
  BI_WEEKLY: 14,
  MONTHLY_EXCL_WEEKENDS: 22,
  ONE_MONTH: 30,
  TWO_MONTH: 60,
  THREE_MONTH: 90,
};

// Monthly (30-delivery) basis. Per-delivery = basis / 30, scaled by count.
const DELIVERY_PER_MONTH = 1500;
const PACKAGING_PER_MONTH = 2000;
const BASIS_DELIVERIES = 30;
const CHARGE_ROUND = 50; // smooth charges to nearest ₹50
const GST_PERCENT = 5;
const MRP_MULTIPLE = 1.85;

function roundTo(x: number, step: number): number {
  return Math.round(x / step) * step;
}

// 1.85× base, rounded to a smooth ₹X,999 / ₹X,499 ending (nearest 500, minus 1).
function smoothMrp(base: number): number {
  const v = Math.round((base * MRP_MULTIPLE) / 500) * 500 - 1;
  return v > base ? v : base; // never show an MRP below base
}

export interface PriceBreakdown {
  subtotalRs: number; // anchor (GST-exclusive) — unchanged real price
  baseRs: number; // card headline = subtotal − delivery − packaging
  deliveryRs: number;
  packagingRs: number;
  mrpRs: number; // struck-through marketing price
  gstPercent: number;
  gstRs: number; // GST on the full subtotal
  totalRs: number; // subtotal + gst = what PayU/COD collects
  isDigital: boolean;
}

export interface DecomposeInput {
  subtotalRs: number; // the real PlanPrice.priceRs
  duration: PlanDurationKey;
  isDigital?: boolean;
}

export function decomposePrice(input: DecomposeInput): PriceBreakdown {
  const subtotalRs = Math.max(0, Math.round(input.subtotalRs));
  const isDigital = input.isDigital ?? false;

  let deliveryRs = 0;
  let packagingRs = 0;

  if (!isDigital) {
    const count = DELIVERY_COUNT[input.duration] ?? DELIVERY_COUNT.ONE_MONTH;
    deliveryRs = roundTo((DELIVERY_PER_MONTH * count) / BASIS_DELIVERIES, CHARGE_ROUND);
    packagingRs = roundTo((PACKAGING_PER_MONTH * count) / BASIS_DELIVERIES, CHARGE_ROUND);

    // Safety: charges must never meet/exceed subtotal (base would be ≤0).
    // Clamp proportionally, keeping base ≥ 1.
    if (deliveryRs + packagingRs >= subtotalRs) {
      const room = Math.max(0, subtotalRs - 1);
      const total = deliveryRs + packagingRs || 1;
      deliveryRs = Math.floor((deliveryRs / total) * room);
      packagingRs = Math.max(0, room - deliveryRs);
    }
  }

  const baseRs = subtotalRs - deliveryRs - packagingRs;
  const mrpRs = smoothMrp(baseRs);
  const gstRs = Math.round((subtotalRs * GST_PERCENT) / 100);
  const totalRs = subtotalRs + gstRs;

  return {
    subtotalRs,
    baseRs,
    deliveryRs,
    packagingRs,
    mrpRs,
    gstPercent: GST_PERCENT,
    gstRs,
    totalRs,
    isDigital,
  };
}

// Map the frontend duration key (trial/weekly/...) to the enum key, for callers
// that carry the short form. Returns ONE_MONTH if unknown.
const SHORT_TO_ENUM: Record<string, PlanDurationKey> = {
  trial: "TRIAL_DAY",
  weekly: "WEEKLY",
  biweekly: "BI_WEEKLY",
  monthly_ex: "MONTHLY_EXCL_WEEKENDS",
  monthly: "ONE_MONTH",
  two_month: "TWO_MONTH",
  three_month: "THREE_MONTH",
};
export function durationKeyFromShort(short: string): PlanDurationKey {
  return SHORT_TO_ENUM[short] ?? "ONE_MONTH";
}
