import "server-only";

import type { PayuConfig } from "@/lib/payu-config";
import { verifyPayuResponseHash } from "@/lib/payu-hash";

export type PayuResponse = {
  status: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  hash: string;
  key: string;
  mihpayid: string;
  errorMessage: string;
  unmappedStatus: string;
  udf1: string;
  udf2: string;
  udf3: string;
  udf4: string;
  udf5: string;
  additionalCharges: string;
};

function value(form: FormData, key: string, max = 200): string {
  const raw = form.get(key);
  return typeof raw === "string" ? raw.trim().slice(0, max) : "";
}

export function readPayuResponse(form: FormData): PayuResponse {
  return {
    status: value(form, "status", 32).toLowerCase(),
    txnid: value(form, "txnid", 128),
    amount: value(form, "amount", 32),
    productinfo: value(form, "productinfo", 100),
    firstname: value(form, "firstname", 60),
    email: value(form, "email", 254),
    hash: value(form, "hash", 256).toLowerCase(),
    key: value(form, "key", 128),
    mihpayid: value(form, "mihpayid", 128),
    errorMessage: value(form, "error_Message", 500) || value(form, "error", 500),
    unmappedStatus: value(form, "unmappedstatus", 80),
    udf1: value(form, "udf1", 255),
    udf2: value(form, "udf2", 255),
    udf3: value(form, "udf3", 255),
    udf4: value(form, "udf4", 255),
    udf5: value(form, "udf5", 255),
    additionalCharges: value(form, "additionalCharges", 32) || value(form, "additional_charges", 32),
  };
}

/** PayU signs both success and failure responses with the reverse request hash.
 * Keep this in one place so a callback cannot receive weaker verification just
 * because it landed on the failure URL. The hash itself lives in
 * lib/payu-hash.ts so contract tests can exercise the exact same code. */
export function verifyPayuResponse(response: PayuResponse, config: PayuConfig): boolean {
  return verifyPayuResponseHash({ ...response, salt: config.salt }, config);
}

export function payuAmountMatches(posted: string, expectedRs: number): boolean {
  const amount = Number(posted);
  return Number.isFinite(amount) && Math.abs(amount - expectedRs) < 0.01;
}

export function safePayuFailureMessage(message: string): string {
  return (message || "Payment was not completed")
    .replace(/[^\p{L}\p{N}\s.,:()'\-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "Payment was not completed";
}
