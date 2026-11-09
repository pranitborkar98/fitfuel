// lib/payu-hash.ts
// PayU SHA-512 hash helpers. Pure module (node:crypto only, no server-only
// import) so the contract tests can import it directly. The route-level
// helpers in lib/payu-response.ts delegate to these functions, so the tested
// code and the live code are the same code.
//
// Sources: PayU developer docs (docs.payu.in), read 2026-11-09.
//   Init hash: sha512(key|txnid|amount|productinfo|firstname|email|
//     udf1|udf2|udf3|udf4|udf5||||||salt)
//   Response hash (reverse hash): sha512([additionalCharges|]salt|status|
//     udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
//     with seven empty fields between status and udf5, matching the request
//     hash layout reversed. additionalCharges is prepended only when present.
//   Postservice hash (refund and other merchant APIs):
//     sha512(key|command|var1|var2|var3|salt). PayU documents the single-var
//     form as sha512(key|command|var1|salt); the extra vars join in order
//     before the salt, as in PayU's own PHP SDK refund call.

import crypto from "node:crypto";

export type PayuInitHashInput = {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  salt: string;
};

export function buildPayuInitHash(input: PayuInitHashInput): string {
  const hashInput = [
    input.key,
    input.txnid,
    input.amount,
    input.productinfo,
    input.firstname,
    input.email,
    "", "", "", "", "",
    "", "", "", "", "",
    input.salt,
  ].join("|");
  return crypto.createHash("sha512").update(hashInput).digest("hex");
}

export type PayuResponseHashInput = {
  salt: string;
  key: string;
  status: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1: string;
  udf2: string;
  udf3: string;
  udf4: string;
  udf5: string;
  additionalCharges: string;
};

export function buildPayuResponseHash(input: PayuResponseHashInput): string {
  const fields = [
    input.salt,
    input.status,
    "", "", "", "", "", "",
    input.udf5,
    input.udf4,
    input.udf3,
    input.udf2,
    input.udf1,
    input.email,
    input.firstname,
    input.productinfo,
    input.amount,
    input.txnid,
    input.key,
  ];
  if (input.additionalCharges) fields.unshift(input.additionalCharges);
  return crypto.createHash("sha512").update(fields.join("|")).digest("hex");
}

export function buildPayuRefundHash(input: {
  key: string;
  command: string;
  var1: string;
  var2: string;
  var3: string;
  salt: string;
}): string {
  const hashInput = [input.key, input.command, input.var1, input.var2, input.var3, input.salt].join("|");
  return crypto.createHash("sha512").update(hashInput).digest("hex");
}

/** Constant-time comparison. Returns false on length mismatch instead of
 * throwing, so a truncated attacker hash can never pass. */
export function hashesEqual(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return receivedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

/** Full response verification: required fields present, key matches the
 * merchant key, and the posted hash equals the reverse hash. Returns false
 * for any missing or mismatched input. Never throws. */
export function verifyPayuResponseHash(
  response: PayuResponseHashInput & { hash: string },
  config: { key: string; salt: string },
): boolean {
  if (
    !response.status || !response.txnid || !response.amount ||
    !response.productinfo || !response.firstname || !response.email ||
    !response.hash || response.key !== config.key
  ) return false;
  return hashesEqual(response.hash.toLowerCase(), buildPayuResponseHash({ ...response, salt: config.salt }));
}
