// lib/site-counts.ts
//
// The scale figures the homepage prints, COUNTED rather than remembered.
//
// "3,614 published prices" was a string literal in three files (Offers.tsx,
// Ticker.tsx and a comment in Pick.tsx). It sat inside a section that opens
// with "Every code below is live in the database right now" — so the one
// number on that screen nobody could verify was the one bragging about how
// many verifiable numbers there are. Worse, it was frozen: seed another plan
// and the page keeps claiming 3,614 forever.
//
// These run at build time (the homepage is statically prerendered), so the
// cost is one query per deploy, not per request.
//
// EVERY function here fails SOFT. A count that cannot be read returns null and
// the caller drops the tile. A homepage that 500s because a stat tile could
// not reach Postgres would be a strictly worse trade than a missing tile.

import { prisma } from "./prisma";

/** Rows in PlanPrice: every duration × diet × tier × delivery-window with a
 *  real, seeded price behind it. Null if the table cannot be read. */
export async function countPublishedPrices(): Promise<number | null> {
  try {
    return await prisma.planPrice.count();
  } catch {
    return null;
  }
}

/** Formats a count for display, or null so the caller can drop the element
 *  entirely rather than print "0" or a stale literal. */
export function formatCount(n: number | null): string | null {
  return n === null ? null : n.toLocaleString("en-IN");
}

/** Every figure the scroll-scrubbed Ticker prints, counted in one round trip.
 *  Keys are stable; a null value means "drop this item from the track". */
export async function tickerCounts(): Promise<Record<string, number | null>> {
  const q = async (fn: () => Promise<number>) => {
    try {
      return await fn();
    } catch {
      return null;
    }
  };

  const [plans, prices, exercises, supplements, testimonials] = await Promise.all([
    q(() => prisma.mealPlan.count()),
    q(() => prisma.planPrice.count()),
    q(() => prisma.exercise.count()),
    q(() => prisma.supplement.count()),
    q(() => prisma.testimonial.count({ where: { isActive: true } })),
  ]);

  return { plans, prices, exercises, supplements, testimonials };
}
