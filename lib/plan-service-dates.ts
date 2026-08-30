import { DELIVERY_COUNT, type PlanDurationKey } from "@/lib/pricing-decomposition";

const WEEKDAY_ONLY = "MONTHLY_EXCL_WEEKENDS";

function clone(date: Date) {
  return new Date(date.getTime());
}

function addUtcDays(date: Date, days: number) {
  const next = clone(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function isPlanServiceDate(duration: string | null | undefined, date: Date) {
  if (duration !== WEEKDAY_ONLY) return true;
  const day = date.getUTCDay();
  return day !== 0 && day !== 6;
}

export function nextPlanServiceDate(candidate: Date, duration: string | null | undefined) {
  let date = clone(candidate);
  while (!isPlanServiceDate(duration, date)) date = addUtcDays(date, 1);
  return date;
}

/** Inclusive range: a trial starts and ends on the same service date; seven
 * deliveries span seven eligible dates, never eight. */
export function planDateRange(candidate: Date, duration: PlanDurationKey | string) {
  const startDate = nextPlanServiceDate(candidate, duration);
  const deliveryDays = DELIVERY_COUNT[duration as PlanDurationKey] ?? DELIVERY_COUNT.ONE_MONTH;
  let endDate = clone(startDate);
  let counted = 1;
  while (counted < deliveryDays) {
    endDate = addUtcDays(endDate, 1);
    if (isPlanServiceDate(duration, endDate)) counted += 1;
  }
  return { startDate, endDate, deliveryDays };
}

export function serviceDayNumber(
  startDate: Date,
  targetDate: Date,
  cycleLengthDays: number,
  duration?: string | null,
) {
  const cycle = cycleLengthDays > 0 ? cycleLengthDays : 30;
  let cursor = clone(startDate);
  let count = 0;
  while (cursor.getTime() <= targetDate.getTime()) {
    if (isPlanServiceDate(duration, cursor)) count += 1;
    cursor = addUtcDays(cursor, 1);
  }
  return ((Math.max(1, count) - 1) % cycle) + 1;
}

export function remainingServiceDays(
  today: Date,
  endDate: Date,
  duration?: string | null,
) {
  if (today.getTime() > endDate.getTime()) return 0;
  let cursor = clone(today);
  let count = 0;
  while (cursor.getTime() <= endDate.getTime()) {
    if (isPlanServiceDate(duration, cursor)) count += 1;
    cursor = addUtcDays(cursor, 1);
  }
  return count;
}
