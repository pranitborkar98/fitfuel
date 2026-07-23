// lib/validation/core.ts
// WS-3 · SEC-2 — One safe entry point for reading request input. Every hardened
// route reads its body/query through here instead of raw `await req.json()`.
//
//   const parsed = await readJson(req, waitlistSchema);
//   if (!parsed.ok) return parsed.response;     // 400 / 413 already shaped
//   const { email, tier } = parsed.data;        // fully typed + validated
//
// Guards added on top of zod:
//   • oversized-payload DoS — rejects bodies over maxBytes (Content-Length AND
//     actual byte length) with 413 before parsing.
//   • malformed JSON: 400 instead of an unhandled throw.

import { NextRequest, NextResponse } from "next/server";
import type { ZodType } from "zod";

// These bodies are all small JSON objects. 32 KB is generous and blocks abuse.
const DEFAULT_MAX_BYTES = 32 * 1024;

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

function badRequest(message: string, issues?: unknown): NextResponse {
  return NextResponse.json(
    issues ? { error: message, issues } : { error: message },
    { status: 400 },
  );
}

function payloadTooLarge(): NextResponse {
  return NextResponse.json({ error: "Payload too large" }, { status: 413 });
}

/** Compact, client-safe view of zod issues (path + message only). */
function formatIssues(
  issues: readonly { path: readonly PropertyKey[]; message: string }[],
): { field: string; message: string }[] {
  return issues.slice(0, 12).map((i) => ({
    field: i.path.map((p) => String(p)).join(".") || "(root)",
    message: i.message,
  }));
}

/**
 * Read + validate a JSON request body against a zod schema.
 * Enforces a byte cap, tolerates malformed JSON, returns typed data or a response.
 */
export async function readJson<T>(
  req: NextRequest,
  schema: ZodType<T>,
  opts?: { maxBytes?: number },
): Promise<ParseResult<T>> {
  const maxBytes = opts?.maxBytes ?? DEFAULT_MAX_BYTES;

  // 1) Cheap pre-check on the declared length.
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared && declared > maxBytes) {
    return { ok: false, response: payloadTooLarge() };
  }

  // 2) Read the raw text and hard-cap the actual byte length.
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return { ok: false, response: badRequest("Could not read request body") };
  }
  if (Buffer.byteLength(raw, "utf8") > maxBytes) {
    return { ok: false, response: payloadTooLarge() };
  }
  if (!raw.trim()) {
    return { ok: false, response: badRequest("Request body is required") };
  }

  // 3) Parse JSON.
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, response: badRequest("Invalid JSON") };
  }

  // 4) Validate.
  const result = schema.safeParse(json);
  if (!result.success) {
    return {
      ok: false,
      response: badRequest("Validation failed", formatIssues(result.error.issues)),
    };
  }
  return { ok: true, data: result.data };
}

/** Validate URL search params (for GET routes) against a zod schema. */
export function readQuery<T>(
  req: NextRequest,
  schema: ZodType<T>,
): ParseResult<T> {
  const obj: Record<string, string> = {};
  new URL(req.url).searchParams.forEach((v, k) => {
    obj[k] = v;
  });
  const result = schema.safeParse(obj);
  if (!result.success) {
    return {
      ok: false,
      response: badRequest("Invalid query parameters", formatIssues(result.error.issues)),
    };
  }
  return { ok: true, data: result.data };
}
