// lib/order-cutoff.ts
//
// THE ORDER CUTOFF. 21:00 IST, and this file is the only place it exists.
//
// WHY THIS FILE EXISTS. There was already a cutoff — 23:00 IST — but nobody
// chose it and nothing said so. It was an accident of when the Vercel cron
// fired: generate-deliveries ran at 17:30 UTC, created tomorrow's Delivery rows
// for everyone active, and any customer who paid after that ran into a silent
// hole. Their plan said active, their money was taken, and no delivery row
// existed for the morning they were expecting food. Nothing recovered it
// automatically and nothing told them.
//
// THE FIX IS NOT A LATER CRON. Making the cutoff a property of WHEN A JOB RUNS
// means the answer to "am I eating tomorrow?" changes depending on server
// timing, and it cannot be answered at checkout at all. So the cutoff is now a
// property of the DELIVERY DATE: a delivery on date D includes every plan that
// started before 21:00 IST on D-1, no matter when the job that materialises it
// happens to run. That makes the generator idempotent AND re-runnable — you can
// fire it twice, or late, and get the same set — which is what lets a safety-net
// run exist without secretly admitting late orders.
//
// PURE MODULE, NO IMPORTS. Deliberately: checkout needs this in the browser to
// show a countdown, and the cron needs it on the server. Importing anything
// from lib/production.ts (which pulls in Prisma) would make it server-only.
//
// India does not observe DST, so a fixed +05:30 is correct and will stay correct.
//
// THE CRON SCHEDULE THAT PAIRS WITH THIS, recorded here because vercel.json
// cannot hold a comment — its schema rejects any key it does not recognise, and
// a `$comment` array there failed a deployment outright:
//
//   "30 15 * * *"  = 21:00 IST, this cutoff, when generate-deliveries runs.
//
// The project is on Vercel's Hobby plan, which caps a project at TWO cron jobs
// (both slots are taken) and fires them at an approximate time within the hour.
// Neither constraint matters any more: the job generates two days of lookahead
// in one run, and because the cutoff is stamped into UserActivePlan.startDate at
// purchase rather than implied by when the job fires, a late or repeated
// execution returns the same subscribers and cannot change who eats.

/** 21:00 IST. Change this and the cron, the kitchen and the homepage all move. */
export const ORDER_CUTOFF_IST_HOUR = 21;

/** IST is UTC+05:30, year round. */
const IST_OFFSET_MIN = 330;

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/**
 * How far before a delivery date the cutoff falls, in milliseconds.
 *
 * A delivery on date D is stamped at UTC midnight of D and eaten at 08:00 IST
 * that morning. Its cutoff is 21:00 IST on D-1, which in UTC is
 * D_midnight − 24h + (21:00 − 05:30) = D_midnight − 8.5h.
 */
const CUTOFF_BEFORE_DELIVERY_MS =
  DAY_MS - (ORDER_CUTOFF_IST_HOUR * HOUR_MS - IST_OFFSET_MIN * 60_000);

/**
 * The instant ordering closes for a given delivery date.
 *
 * @param deliveryDate a UTC-midnight-stamped delivery date, as produced by
 *                     lib/production.ts `targetDayUTC()`.
 */
export function cutoffInstantFor(deliveryDate: Date): Date {
  return new Date(deliveryDate.getTime() - CUTOFF_BEFORE_DELIVERY_MS);
}

/**
 * The first morning a customer ordering at `orderedAt` will actually be fed.
 *
 * Order at 20:00 IST Wednesday, you eat Thursday. Order at 22:00 IST Wednesday,
 * you eat Friday. This is the single function checkout should quote from, so
 * the date on the confirmation screen is the date the kitchen will cook for.
 *
 * Returns a UTC-midnight date, the same shape Delivery.deliveryDate uses.
 */
export function firstDeliveryDateFor(orderedAt: Date = new Date()): Date {
  // Smallest D (UTC midnight) satisfying orderedAt <= D − 8.5h, i.e. D >= orderedAt + 8.5h.
  const earliest = orderedAt.getTime() + CUTOFF_BEFORE_DELIVERY_MS;
  const d = new Date(earliest);
  const midnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  // If `earliest` landed exactly on midnight, that midnight still qualifies.
  return new Date(midnight === earliest ? midnight : midnight + DAY_MS);
}

/** Milliseconds until ordering closes for the next available delivery. */
export function msUntilCutoff(now: Date = new Date()): number {
  return Math.max(0, cutoffInstantFor(firstDeliveryDateFor(now)).getTime() - now.getTime());
}

/** "9pm" — for copy, derived rather than typed into a sentence somewhere. */
export function cutoffLabel(): string {
  const h = ORDER_CUTOFF_IST_HOUR;
  const suffix = h >= 12 ? "pm" : "am";
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve}${suffix}`;
}

/** The IST calendar date of a UTC-midnight delivery stamp, for display. */
export function deliveryDateLabel(deliveryDate: Date): string {
  return deliveryDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
}
