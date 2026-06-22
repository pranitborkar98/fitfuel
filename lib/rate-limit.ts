// lib/rate-limit.ts
// WS-3 · SEC-1 — Centralised rate limiting. ONE limiter the whole app shares.
//
// Production: Upstash Redis (REST). Reuses the Upstash account already in the
// stack for QStash. Set EITHER:
//   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN   (Upstash Redis), or
//   KV_REST_API_URL        + KV_REST_API_TOKEN          (Vercel KV — same thing)
//
// No creds (local / preview): falls back to a per-instance in-memory sliding
// window. Best-effort — resets on cold start and does NOT share state across
// serverless instances — so it is NOT a substitute for Redis in production, but
// it means dev still has SOME limiting and the app never crashes for a missing env.
//
// Usage in a route handler (first thing inside POST/GET):
//   const rl = await enforceRateLimit(req, "checkout");
//   if (!rl.ok) return rl.response;            // 429 with Retry-After
//
// Add an extra identity axis (e.g. per signed-in user, not just per IP):
//   const rl = await enforceRateLimit(req, "partnerApply", userId);

import { NextRequest, NextResponse } from "next/server";

/* ────────────────────────── Presets ──────────────────────────
   tokens   = requests allowed per window
   window   = Upstash duration string (used when Redis is configured)
   windowMs = same window in ms (used by the in-memory fallback)         */
export type RateLimitPreset =
  | "auth"
  | "waitlist"
  | "checkout"
  | "couponValidate"
  | "creditPreview"
  | "partnerApply"
  | "mutation"
  | "read";

interface PresetConfig {
  tokens: number;
  window: `${number} ${"s" | "m" | "h"}`;
  windowMs: number;
}

const PRESETS: Record<RateLimitPreset, PresetConfig> = {
  // Credential surface. FitFuel uses Google OAuth (NextAuth owns the callback),
  // so this is a defensive default for any future custom auth route.
  auth:           { tokens: 10, window: "10 m", windowMs: 10 * 60_000 },
  // Headline spam target (SEC-3). Tight.
  waitlist:       { tokens: 5,  window: "10 m", windowMs: 10 * 60_000 },
  // COD create + PayU init. Order flooding protection; still allows legit retries.
  checkout:       { tokens: 8,  window: "10 m", windowMs: 10 * 60_000 },
  // Coupon enumeration guard.
  couponValidate: { tokens: 30, window: "5 m",  windowMs: 5 * 60_000 },
  // Credit-balance enumeration guard (also session-gated in-route).
  creditPreview:  { tokens: 40, window: "5 m",  windowMs: 5 * 60_000 },
  // Self-onboarding partner application. Per-user when a userId axis is passed.
  partnerApply:   { tokens: 5,  window: "1 h",  windowMs: 60 * 60_000 },
  // Generic authenticated write. Drop onto any user-mutation route.
  mutation:       { tokens: 60, window: "1 m",  windowMs: 60_000 },
  // Generic read.
  read:           { tokens: 120, window: "1 m", windowMs: 60_000 },
};

/* ───────────────────────── Client IP ───────────────────────── */
export function getClientIp(req: NextRequest): string {
  // Vercel/most proxies: first hop in x-forwarded-for is the real client.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "0.0.0.0";
}

/* ───────────────────── Upstash (lazy, optional) ─────────────────────
   Imported dynamically so a missing dependency or missing env never breaks
   the build or the request — we degrade to the in-memory limiter.          */
function redisEnv(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
  return url && token ? { url, token } : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const upstashLimiters = new Map<RateLimitPreset, any>();
let upstashReady: boolean | null = null; // null = not yet probed
let warnedNoRedis = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getUpstashLimiter(preset: RateLimitPreset): Promise<any | null> {
  if (upstashReady === false) return null;
  const env = redisEnv();
  if (!env) {
    upstashReady = false;
    if (!warnedNoRedis) {
      warnedNoRedis = true;
      console.warn(
        "[rate-limit] No Upstash/KV REST env found — using in-memory fallback. " +
          "Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in production.",
      );
    }
    return null;
  }

  const cached = upstashLimiters.get(preset);
  if (cached) return cached;

  try {
    const [{ Ratelimit }, { Redis }] = await Promise.all([
      import("@upstash/ratelimit"),
      import("@upstash/redis"),
    ]);
    const redis = new Redis({ url: env.url, token: env.token });
    const cfg = PRESETS[preset];
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(cfg.tokens, cfg.window),
      prefix: `ff:rl:${preset}`,
      analytics: false,
    });
    upstashReady = true;
    upstashLimiters.set(preset, limiter);
    return limiter;
  } catch (err) {
    // Package not installed yet, or runtime error — fall back, don't crash.
    upstashReady = false;
    if (!warnedNoRedis) {
      warnedNoRedis = true;
      console.warn("[rate-limit] Upstash init failed — in-memory fallback.", err);
    }
    return null;
  }
}

/* ─────────────────── In-memory fallback (per instance) ───────────────────
   Sliding window via timestamp list per key. Bounded by eviction on read.   */
const memBuckets = new Map<string, number[]>();

function memoryCheck(
  key: string,
  cfg: PresetConfig,
): { success: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const cutoff = now - cfg.windowMs;
  const hits = (memBuckets.get(key) || []).filter((t) => t > cutoff);

  if (hits.length >= cfg.tokens) {
    const oldest = hits[0];
    memBuckets.set(key, hits);
    return { success: false, remaining: 0, resetMs: oldest + cfg.windowMs };
  }

  hits.push(now);
  memBuckets.set(key, hits);

  // Opportunistic cleanup so the Map can't grow unbounded on a long-lived instance.
  if (memBuckets.size > 5000) {
    for (const [k, v] of memBuckets) {
      const live = v.filter((t) => t > cutoff);
      if (live.length === 0) memBuckets.delete(k);
      else memBuckets.set(k, live);
    }
  }

  return {
    success: true,
    remaining: cfg.tokens - hits.length,
    resetMs: now + cfg.windowMs,
  };
}

/* ───────────────────────── Public API ───────────────────────── */
export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; response: NextResponse };

/**
 * Enforce a named rate-limit preset for this request.
 * @param extraKey optional second axis (userId / email) appended to the IP key.
 */
export async function enforceRateLimit(
  req: NextRequest,
  preset: RateLimitPreset,
  extraKey?: string,
): Promise<RateLimitResult> {
  const cfg = PRESETS[preset];
  const ip = getClientIp(req);
  const key = extraKey ? `${ip}:${extraKey}` : ip;

  let success: boolean;
  let remaining: number;
  let resetMs: number;

  const limiter = await getUpstashLimiter(preset);
  if (limiter) {
    try {
      const r = await limiter.limit(key);
      success = r.success;
      remaining = r.remaining ?? 0;
      resetMs = r.reset ?? Date.now() + cfg.windowMs;
    } catch (err) {
      // Redis hiccup → fall back rather than 500 the user out of checkout.
      console.error("[rate-limit] Upstash limit() failed, falling back", err);
      const m = memoryCheck(`${preset}:${key}`, cfg);
      success = m.success;
      remaining = m.remaining;
      resetMs = m.resetMs;
    }
  } else {
    const m = memoryCheck(`${preset}:${key}`, cfg);
    success = m.success;
    remaining = m.remaining;
    resetMs = m.resetMs;
  }

  if (success) return { ok: true, remaining };

  const retryAfterSec = Math.max(1, Math.ceil((resetMs - Date.now()) / 1000));
  const response = NextResponse.json(
    { error: "Too many requests. Please slow down and try again shortly." },
    { status: 429 },
  );
  response.headers.set("Retry-After", String(retryAfterSec));
  response.headers.set("X-RateLimit-Limit", String(cfg.tokens));
  response.headers.set("X-RateLimit-Remaining", "0");
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetMs / 1000)));
  return { ok: false, response };
}
