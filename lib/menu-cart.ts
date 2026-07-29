// lib/menu-cart.ts
//
// THE À LA CARTE BASKET — pure logic, no React, no DB, no window.
//
// WHY A CART EXISTS NOW. lib/menu-alacarte.ts has held 48 real dishes since it
// was written, and its only consumer was app/_home/Menu.tsx — the PREVIOUS
// homepage. app/page.tsx renders _hp. So the single-meal product line existed
// in data and appeared nowhere on the site. That is the whole reason the site
// reads as a brochure: the one part of it that IS a shop was unmounted.
//
// WHAT SETTLES THE ORDER, AND WHY IT IS NOT PAYU YET.
//
// Two hard blockers, both commercial rather than technical:
//
//   1. THIRTY-TWO OF FORTY-EIGHT DISHES CARRY A PLACEHOLDER PRICE. Bowls,
//      breakfasts, bars and juices are all flagged `provisional: true` at
//      Rs 100 pending the owner's real numbers. Putting "Add to cart" on a
//      price nobody set means the first person to click it has a screenshot of
//      an offer we will not honour. So provisional rows are ORDERABLE BY
//      ENQUIRY ONLY — see `isOrderable` below. They are not hidden; hiding
//      two-thirds of the menu is worse than showing it without a buy button.
//
//   2. `OrderItem` CANNOT HOLD A DISH. Look at the model: `diet`, `duration`
//      and `mealsPerDay` are required enums and `productId` points at
//      MealPlanProduct. Every column is subscription-shaped. Storing a salad
//      needs a schema change on the live money path, and there is no
//      single-meal delivery fee, minimum order or cutoff decided to charge
//      against anyway.
//
// So the basket settles on WhatsApp, itemised. That is not a downgrade: the
// business already takes single-meal orders there (lib/trust-marks.ts), it is
// the channel Indian food ordering actually runs on, and a composed message
// with quantities, add-ons and a total is a real order — it just clears
// through a person instead of PayU.
//
// WHEN THE TWO BLOCKERS CLEAR, exactly one thing changes: `composeOrder()`
// gets a sibling that POSTs the same `CartLine[]` to /api/orders. Nothing in
// the UI, the storage layer or this file's maths has to move. That is why the
// totals below are computed here rather than inside a component.

import type { AddOn, MenuItem, MenuCategoryKey } from "./menu-alacarte";
import { MENU } from "./menu-alacarte";

/* ── Identity ──────────────────────────────────────────────────────────────
   Dishes have no id in menu-alacarte.ts — it was written as display data.
   Rather than add a field to 48 rows by hand (and get one wrong), the id is
   derived from the name, which is already unique across the file. Derived
   means it cannot drift out of sync with the row it names. */
export function dishId(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** A dish plus the category it came from, which the cart line needs to print. */
export type Dish = MenuItem & { id: string; category: MenuCategoryKey; categoryLabel: string };

export const DISHES: Dish[] = MENU.flatMap((c) =>
  c.items.map((i) => ({ ...i, id: dishId(i.name), category: c.key, categoryLabel: c.label })),
);

export const DISH_BY_ID: ReadonlyMap<string, Dish> = new Map(DISHES.map((d) => [d.id, d]));

/**
 * Can this dish be added to a basket that shows a total?
 *
 * A dish is orderable when the kitchen has set its price. `provisional` rows
 * are the Rs 100 placeholder and a null price is "on request"; neither can
 * carry a number a customer might hold us to. See blocker 1 in the header.
 */
export function isOrderable(d: Pick<MenuItem, "price" | "provisional">): boolean {
  return d.price != null && !d.provisional;
}

export const ORDERABLE_COUNT = DISHES.filter(isOrderable).length;
export const ENQUIRY_COUNT = DISHES.length - ORDERABLE_COUNT;

/* ── Lines ─────────────────────────────────────────────────────────────── */

/** What persists to localStorage. Deliberately minimal: ids and counts only,
 *  never prices. A price cached in a browser from three weeks ago is a price
 *  we would have to argue about, so every total is recomputed from MENU at
 *  read time and a dish removed from the menu simply drops out of the cart. */
export type StoredLine = { id: string; qty: number; addOn?: AddOn["kind"] };

/** A line resolved against the live menu, with money attached. */
export type CartLine = {
  id: string;
  qty: number;
  dish: Dish;
  addOn?: AddOn;
  /** Dish price plus the chosen add-on, for one unit. */
  unitRs: number;
  /** unitRs × qty. */
  lineRs: number;
};

export function resolveLines(stored: StoredLine[]): CartLine[] {
  const out: CartLine[] = [];
  for (const s of stored) {
    const dish = DISH_BY_ID.get(s.id);
    // Silently drop unknown or now-unpriced dishes rather than throwing: the
    // menu is edited by hand and a stale localStorage entry must never be
    // able to break the drawer for a returning customer.
    if (!dish || !isOrderable(dish) || s.qty < 1) continue;

    const addOn = s.addOn ? dish.addOns?.find((a) => a.kind === s.addOn) : undefined;
    const unitRs = (dish.price ?? 0) + (addOn?.price ?? 0);
    const qty = Math.min(Math.floor(s.qty), MAX_QTY);
    out.push({ id: s.id, qty, dish, addOn, unitRs, lineRs: unitRs * qty });
  }
  return out;
}

/** One person ordering lunch. A basket of 40 salads is a data-entry accident
 *  or someone testing the form, and either way the kitchen should hear about
 *  it on WhatsApp rather than have it silently accepted. */
export const MAX_QTY = 20;

export type CartTotals = { count: number; subtotalRs: number };

export function totals(lines: CartLine[]): CartTotals {
  return {
    count: lines.reduce((n, l) => n + l.qty, 0),
    subtotalRs: lines.reduce((n, l) => n + l.lineRs, 0),
  };
}

/* ── Settlement ────────────────────────────────────────────────────────────
   The WhatsApp handoff. Everything the kitchen needs to price and pack the
   order without a second round trip. */

const rs = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * Compose the order message.
 *
 * Deliberately plain text with no marketing: this lands in a human's WhatsApp
 * and gets read on a phone in a kitchen. Quantities and the running total are
 * spelled out so the customer and the kitchen are reading the same numbers.
 *
 * NOTE ON THE TOTAL. It is labelled as excluding delivery, because no
 * single-meal delivery fee has been set. Printing a bare total that later
 * grows by Rs 50 on the doorstep is the exact complaint this business does not
 * want, so the message says plainly that delivery is confirmed on reply.
 */
export function composeOrder(lines: CartLine[], enquiries: Dish[] = []): string {
  const parts: string[] = ["Hi FitFuel, I'd like to order these:", ""];

  for (const l of lines) {
    const addOn = l.addOn ? ` + ${l.addOn.what.toLowerCase()}` : "";
    parts.push(`${l.qty} × ${l.dish.name}${addOn} — ${rs(l.lineRs)}`);
  }

  if (lines.length) {
    parts.push("", `Subtotal ${rs(totals(lines).subtotalRs)} (before delivery)`);
  }

  if (enquiries.length) {
    parts.push("", "And could you price these for me:");
    for (const d of enquiries) parts.push(`- ${d.name}`);
  }

  parts.push("", "Please confirm delivery to my area and the total.");
  return parts.join("\n");
}
