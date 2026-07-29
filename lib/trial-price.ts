// lib/trial-price.ts
//
// ONE trial-day price, derived once, imported everywhere.
//
// THE BUG THIS EXISTS TO KILL: "Rs 400" was hardcoded as a string in the hero,
// both navbar dropdowns, the footer, the layout metadata, /about and
// /locations — seven surfaces, all of them quoting the SUBTOTAL. What PayU
// actually collects is subtotal + 5% GST, so every one of those surfaces named
// a number no customer ever pays. On a homepage whose headline claim is "the
// receipt, before you pay", that is the single inconsistency that attacks the
// product rather than merely looking untidy.
//
// So no marketing surface is allowed a price literal any more. They import
// TRIAL_TOTAL_LABEL, which is decomposePrice() run on the same subtotal
// checkout runs it on. If pricing moves, the copy moves with it, and the two
// cannot drift apart again.
//
// SUBTOTAL vs TOTAL, and which one to print:
//   baseRs      300  the food alone            → the receipt's first line
//   subtotalRs  400  food + delivery + packaging
//   totalRs     420  + 5% GST                  → what is actually collected
//
// Print TOTAL in any sentence a buyer reads as "this is what it costs me".
// Print the breakdown only where the breakdown is the point (Offers.tsx).

import { decomposePrice } from "./pricing-decomposition";

/** The real, GST-exclusive trial subtotal. The same figure checkout charges. */
export const TRIAL_SUBTOTAL_RS = 400;

/** Full breakdown, computed once at module load. Pure + deterministic. */
export const TRIAL = decomposePrice({
  subtotalRs: TRIAL_SUBTOTAL_RS,
  duration: "TRIAL_DAY",
});

/** What the customer is actually charged. This is the number to advertise. */
export const TRIAL_TOTAL_RS = TRIAL.totalRs;

/** "Rs 420" — for prose and buttons. */
export const TRIAL_TOTAL_LABEL = `Rs ${TRIAL_TOTAL_RS.toLocaleString("en-IN")}`;

/** "₹420" — for surfaces already using the glyph rather than the word. */
export const TRIAL_TOTAL_GLYPH = `₹${TRIAL_TOTAL_RS.toLocaleString("en-IN")}`;
