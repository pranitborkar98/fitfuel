// lib/pricing.ts  (CORRECTED — RUPEES, matching Order.subtotalRs / PlanPrice.priceRs)
// ONE order-math function for digital + physical checkout AND invoices.
// Money in whole rupees (Int). GST split by place-of-supply.
// See FITFUEL-PRICING-PROMOTIONS-STRATEGY.md §B.

export interface PriceLineItem {
  mrpRs: number;   // strike price (fallback to saleRs if no MRP)
  saleRs: number;  // charged before coupons
  qty: number;
}

export interface PriceInput {
  items: PriceLineItem[];
  discountRs: number;           // from coupon engine (lib/coupons.ts), already capped
  gstPercent: number;           // 0 until registered; digital = 18, physical food = 5
  priceIsTaxInclusive: boolean; // digital = true, physical = false
  buyerStateCode: string;       // e.g. "MH"
  sellerStateCode: string;      // FitFuel HQ state, e.g. "MH"
}

export interface PriceBreakdown {
  mrpSubtotalRs: number;
  saleSubtotalRs: number;
  discountRs: number;
  subtotalRs: number;   // taxable value (net, ex-tax) — maps to Order.subtotalRs
  gstRs: number;        // total GST — maps to Order.gstRs
  cgstRs: number;
  sgstRs: number;
  igstRs: number;
  totalRs: number;      // what customer pays — maps to Order.totalRs
  gstPercent: number;
}

export function computePrice(input: PriceInput): PriceBreakdown {
  const { items, discountRs, gstPercent, priceIsTaxInclusive, buyerStateCode, sellerStateCode } = input;

  const mrpSubtotal  = items.reduce((s, i) => s + i.mrpRs  * i.qty, 0);
  const saleSubtotal = items.reduce((s, i) => s + i.saleRs * i.qty, 0);
  const discount = Math.min(Math.max(discountRs, 0), saleSubtotal);

  const preTaxBase = saleSubtotal - discount;
  const r = gstPercent / 100;

  let taxable: number, gst: number, total: number;

  if (gstPercent === 0) {
    taxable = preTaxBase; gst = 0; total = preTaxBase;
  } else if (priceIsTaxInclusive) {
    taxable = Math.round(preTaxBase / (1 + r)); // back-calc net from inclusive sticker
    gst = preTaxBase - taxable;
    total = preTaxBase;
  } else {
    taxable = preTaxBase;
    gst = Math.round(preTaxBase * r);
    total = preTaxBase + gst;
  }

  // Place-of-supply: intra-state = CGST+SGST, inter-state = IGST. Odd rupee -> CGST.
  const intraState = buyerStateCode === sellerStateCode;
  let cgst = 0, sgst = 0, igst = 0;
  if (gst > 0) {
    if (intraState) { cgst = Math.ceil(gst / 2); sgst = gst - cgst; }
    else { igst = gst; }
  }

  return {
    mrpSubtotalRs: mrpSubtotal,
    saleSubtotalRs: saleSubtotal,
    discountRs: discount,
    subtotalRs: taxable,
    gstRs: gst,
    cgstRs: cgst, sgstRs: sgst, igstRs: igst,
    totalRs: total,
    gstPercent,
  };
}

export function formatRs(rs: number): string {
  return "\u20B9" + rs.toLocaleString("en-IN");
}
