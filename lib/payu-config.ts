import "server-only";

export type PayuConfig = {
  key: string;
  salt: string;
  paymentUrl: string;
  baseUrl: string;
};

/** Payment routes must fail closed when production credentials are missing.
 * Non-null assertions turn a missing secret into a valid-looking hash over the
 * literal word "undefined", which can leave pending orders that can never pay. */
export function getPayuConfig(): PayuConfig | null {
  const key = process.env.PAYU_MERCHANT_KEY?.trim();
  const salt = process.env.PAYU_MERCHANT_SALT?.trim();
  const configuredBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (!key || !salt || !configuredBase) return null;

  try {
    const parsed = new URL(configuredBase);
    if (!/^https?:$/.test(parsed.protocol)) return null;
    if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") return null;
    return {
      key,
      salt,
      paymentUrl: "https://secure.payu.in/_payment",
      baseUrl: configuredBase.replace(/\/$/, ""),
    };
  } catch {
    return null;
  }
}
