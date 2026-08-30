const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const INDIA_OFFSET_MINUTES = 330;

/** Parse a YYYY-MM-DD calendar value as a UTC-midnight database date. */
export function parseDateOnly(value: string): Date | null {
  const match = DATE_ONLY.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) return null;

  return parsed;
}

export function isDateOnly(value: string): boolean {
  return parseDateOnly(value) !== null;
}

export function formatDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/** India's current calendar day, represented as UTC midnight for @db.Date. */
export function todayIndiaDate(now = new Date()): Date {
  const shifted = new Date(now.getTime() + INDIA_OFFSET_MINUTES * 60_000);
  return new Date(Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
  ));
}

export function addDateOnlyDays(value: string, days: number): string {
  const parsed = parseDateOnly(value);
  if (!parsed) throw new RangeError("Invalid date-only value");
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return formatDateOnly(parsed);
}
