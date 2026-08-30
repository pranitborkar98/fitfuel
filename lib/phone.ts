/** Normalise an Indian mobile number to the 10 digits used in the database. */
export function normalizeIndiaMobile(value: string): string | null {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export function indiaMobileE164(value: string): string | null {
  const mobile = normalizeIndiaMobile(value);
  return mobile ? `91${mobile}` : null;
}
