// lib/cron-auth.ts
// WS-3 · SEC-7 (F2) — ONE shared cron authoriser. Mirrors the proven pattern
// already used by app/api/cron/daily-nudges: QStash signature first, then a
// CRON_SECRET bearer fallback. New cron routes import verifyCron instead of
// re-implementing it; existing crons keep their inline copy untouched.
//
// Usage in a cron route:
//   export async function POST(req: Request) {
//     const bodyText = await req.text().catch(() => "");
//     if (!(await verifyCron(req, "/api/cron/<name>", bodyText)))
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     ...
//   }

import { Receiver } from "@upstash/qstash";

const receiver =
  process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY
    ? new Receiver({
        currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
        nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
      })
    : null;

/**
 * @param req       the incoming request
 * @param path      the route's own path, e.g. "/api/cron/daily-nudges"
 * @param bodyText  the raw request body (already read once for verification)
 */
export async function verifyCron(
  req: Request,
  path: string,
  bodyText: string,
): Promise<boolean> {
  const sig = req.headers.get("upstash-signature");
  const authz = req.headers.get("authorization");

  if (sig && receiver) {
    try {
      const ok = await receiver.verify({
        signature: sig,
        body: bodyText,
        url: `${process.env.NEXT_PUBLIC_BASE_URL || ""}${path}`,
      });
      if (ok) return true;
    } catch {
      /* fall through to secret check */
    }
  }

  if (process.env.CRON_SECRET && authz === `Bearer ${process.env.CRON_SECRET}`) {
    return true;
  }

  return false;
}
