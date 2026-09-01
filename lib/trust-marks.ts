// lib/trust-marks.ts
//
// The third-party layer every food business in India carries on its site and
// FitFuel did not: where you can order, what you can pay with, who licenses
// the kitchen, who has written about it.
//
// This is the "Swiggy / Zomato / UPI / FSSAI" row. Its absence is why the site
// read as a project rather than a business: a customer landing cold has no
// external mark to anchor on, and in food the licence number does more work
// than any amount of copy.
//
// STATUS IS LOAD-BEARING. "LIVE" means it works today, in this repository or
// on paper:
//
//   PayU, UPI, cards, net banking   app/api/payments/payu/*
//   Cash on delivery                app/api/orders/cod
//   WhatsApp                        lib/msg91-whatsapp.ts, the cron sends
//   Nutrabay                        lib/supplements-data.ts, click tracking
//   FSSAI 21523035002815            the real licence, already in the footer
//   Swiggy, Zomato                  the kitchen is listed and taking orders
//
// On the aggregators: FITFUEL_PROJECT_TRACKER.md line 522 has said
// "Live separately — no website integration" the whole time. Both listings
// take orders today. What does not exist is a website integration: no order
// ingestion, no menu sync, no rating pull. That is Phase 21 in the master
// tracker, and it is a plumbing job, not a trading status. The marks below say
// we are on them, because we are, and claim nothing about integration.
//
// "SOON" means a slot held open, rendered as a slot, never as a claim. A mark
// shown as live before it is live sends a hungry customer somewhere we are not,
// and they find nothing, which is worse than not showing it at all. So SOON
// marks render dimmed with the word printed next to them, and the group says
// what the state is. Going live is one field.
//
// Marks are typographic, not image files. A greyscale wordmark row is what a
// good press strip looks like anyway, and it means no external asset request,
// no CDN, no logo file rotting in /public at the wrong aspect ratio, and no
// third-party mark reproduced inaccurately at 40px.

export type MarkStatus = "LIVE" | "SOON";

export type Mark = {
  name: string;
  /** Sub-line under the mark. Kept to two or three words. */
  note: string;
  status: MarkStatus;
  /** Per-brand letterform tuning so the row does not read as one flat font. */
  tracking?: string;
  weight?: number;
  /** Marks that are lowercase in their own identity stay lowercase. */
  lower?: boolean;
  /**
   * Where the mark goes when it is somewhere a customer can actually click
   * through to. Set this for the aggregator listings once the two restaurant
   * IDs are in hand:
   *
   *   Swiggy   https://www.swiggy.com/restaurants/<slug>-<id>
   *   Zomato   https://www.zomato.com/pune/<slug>/order
   *
   * A LIVE mark with no href renders as plain text, which is the right
   * behaviour: saying "we are on Swiggy" is true and useful even before the
   * deep link exists. Adding the URL is one field, not a rebuild.
   */
  href?: string;
};

export type MarkGroup = {
  key: string;
  label: string;
  /** Stated under the group heading. This is where the honesty lives. */
  note: string;
  marks: Mark[];
};

export const TRUST_GROUPS: MarkGroup[] = [
  {
    key: "order",
    label: "Order on",
    /* The note leads with direct ordering on purpose. Swiggy and Zomato take
       roughly 40% of order value, so the aggregators are listed here as proof
       that the kitchen is real and findable, NOT as a route we push people
       down. Deliberately no href on either: see the Mark.href docs above. */
    note: "Order direct here or on WhatsApp, both single meals and full plans. You will also find us on Swiggy and Zomato, though ordering direct reaches the kitchen without a middleman.",
    marks: [
      { name: "FitFuel", note: "Meals and plans, direct", status: "LIVE", weight: 900, tracking: "-0.02em" },
      { name: "WhatsApp", note: "Order and support", status: "LIVE", weight: 800 },
      { name: "Swiggy", note: "Also listed", status: "LIVE", lower: true, weight: 800, tracking: "-0.01em" },
      { name: "Zomato", note: "Also listed", status: "LIVE", weight: 800, tracking: "-0.01em" },
    ],
  },
  {
    key: "pay",
    label: "Pay with",
    note: "Cards, UPI and net banking clear through PayU. Cash on delivery is handled on our side, not theirs.",
    marks: [
      { name: "UPI", note: "GPay, PhonePe, Paytm", status: "LIVE", weight: 900, tracking: "0.02em" },
      { name: "Visa", note: "Credit and debit", status: "LIVE", weight: 900, tracking: "0.06em" },
      { name: "Mastercard", note: "Credit and debit", status: "LIVE", weight: 800 },
      { name: "RuPay", note: "Credit and debit", status: "LIVE", weight: 800 },
      { name: "Net banking", note: "All major banks", status: "LIVE", weight: 800 },
      { name: "Cash", note: "On delivery", status: "LIVE", weight: 800 },
    ],
  },
  {
    key: "licence",
    label: "Licensed",
    note: "Cooked by the FitFuel kitchen assigned to your address. The licence below belongs to the current originating kitchen, and each new kitchen carries its own operating licence.",
    marks: [
      { name: "FSSAI", note: "Lic. 21523035002815", status: "LIVE", weight: 900, tracking: "0.04em" },
      { name: "GST registered", note: "5% on meal plans", status: "LIVE", weight: 800 },
      { name: "HACCP", note: "Kitchen audit", status: "SOON", weight: 800, tracking: "0.03em" },
    ],
  },
  {
    key: "stack",
    label: "Runs on",
    note: "The parts we did not build ourselves, named rather than hidden.",
    marks: [
      { name: "PayU", note: "Payment gateway", status: "LIVE", weight: 800 },
      { name: "Nutrabay", note: "Retailer checkout", status: "LIVE", weight: 800 },
      { name: "MSG91", note: "WhatsApp delivery", status: "LIVE", weight: 800 },
    ],
  },
];

/** The FSSAI number, stated once and imported everywhere it appears. */
export const FSSAI_LICENCE = "21523035002815";
