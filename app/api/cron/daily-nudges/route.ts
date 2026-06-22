// app/api/cron/daily-nudges/route.ts
// Phase 16C — daily 10 AM IST. Nudge checks fan out from one endpoint:
//   1) payment_pending  — orders 24h+ old, still PENDING (non-COD)
//   2) plan_ending      — UserActivePlan ending in 2–3 days
//   3) re_engagement    — active sub with no meal logs in 3+ days (max 1x/week)
//   4) coach_nudges     — AI Coach signals: plateau / milestone / missed workouts
//   5) coach_low_rating — a recent meal rated 1–2
// Triggered by Upstash QStash schedule. Signature-verified + CRON_SECRET fallback.
// AI Coach proactive nudges fold into THIS cron (no new cron — Hobby 2-cron limit).

import { NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { prisma } from "@/lib/prisma";
import { sendNotification, wasRecentlySent } from "@/lib/notify";
import { buildWeeklySummary } from "@/lib/coach/weekly-summary";
import { computeRecalibration } from "@/lib/coach/recalibration";
import { detectCoachNudges } from "@/lib/coach/nudges";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // coach summaries add per-user work; give headroom

const receiver =
  process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY
    ? new Receiver({
        currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
        nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
      })
    : null;

async function authorize(req: Request, bodyText: string): Promise<boolean> {
  const sig = req.headers.get("upstash-signature");
  const auth = req.headers.get("authorization");
  if (sig && receiver) {
    try {
      const isValid = await receiver.verify({
        signature: sig,
        body: bodyText,
        url: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/cron/daily-nudges`,
      });
      if (isValid) return true;
    } catch { /* fall through */ }
  }
  if (process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`) {
    return true;
  }
  return false;
}

type Stat = { fired: number; skipped: number; failed: number };
const newStat = (): Stat => ({ fired: 0, skipped: 0, failed: 0 });

async function handle(req: Request) {
  const bodyText = await req.text().catch(() => "");
  const ok = await authorize(req, bodyText);
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const paymentPending = newStat();
  const planEnding = newStat();
  const reEngagement = newStat();
  const coachNudges = newStat();
  const lowRating = newStat();

  // ──────── 1. Payment pending ────────
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  try {
    const unpaid = await (prisma as any).order.findMany({
      where: {
        paymentStatus: "PENDING",
        paymentMethod: { not: "CASH_ON_DELIVERY" },
        status: { notIn: ["CANCELLED", "DELIVERED"] },
        createdAt: { lt: oneDayAgo, gt: sevenDaysAgo },
        userId: { not: null },
      },
      select: {
        id: true,
        orderNumber: true,
        totalRs: true,
        userId: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    });
    for (const o of unpaid) {
      try {
        if (await wasRecentlySent(o.userId, "payment_pending", 24)) {
          paymentPending.skipped++;
          continue;
        }
        const result = await sendNotification({
          userId: o.userId,
          templateKey: "payment_pending",
          vars: {
            name: o.user?.name || "",
            orderNumber: o.orderNumber,
            amount: String(o.totalRs),
          },
        });
        if (result.email === "sent" || result.whatsapp === "sent") paymentPending.fired++;
        else paymentPending.skipped++;
      } catch {
        paymentPending.failed++;
      }
    }
  } catch (e) {
    console.error("[daily-nudges] payment_pending query failed", e);
  }

  // ──────── 2. Plan ending in 2–3 days ────────
  const twoDaysOut = new Date(now);
  twoDaysOut.setUTCDate(twoDaysOut.getUTCDate() + 2);
  twoDaysOut.setUTCHours(0, 0, 0, 0);
  const fourDaysOut = new Date(now);
  fourDaysOut.setUTCDate(fourDaysOut.getUTCDate() + 4);
  fourDaysOut.setUTCHours(0, 0, 0, 0);
  try {
    const ending = await (prisma as any).userActivePlan.findMany({
      where: {
        status: "active",
        endDate: { gte: twoDaysOut, lt: fourDaysOut },
      },
      select: {
        id: true,
        userId: true,
        endDate: true,
        mealPlan: { select: { displayName: true, slug: true } },
      },
    });
    for (const p of ending) {
      try {
        if (await wasRecentlySent(p.userId, "plan_ending", 48)) {
          planEnding.skipped++;
          continue;
        }
        const daysLeft = Math.max(
          1,
          Math.ceil((new Date(p.endDate).getTime() - now.getTime()) / 86400000)
        );
        const result = await sendNotification({
          userId: p.userId,
          templateKey: "plan_ending",
          vars: {
            planName:
              p.mealPlan?.displayName || p.mealPlan?.slug || "your plan",
            daysLeft: String(daysLeft),
          },
        });
        if (result.email === "sent" || result.whatsapp === "sent") planEnding.fired++;
        else planEnding.skipped++;
      } catch {
        planEnding.failed++;
      }
    }
  } catch (e) {
    console.error("[daily-nudges] plan_ending query failed", e);
  }

  // ──────── 3. Re-engagement (max 1x/week) ────────
  const threeDaysAgo = new Date(now.getTime() - 3 * 86400000);
  try {
    const active = await (prisma as any).userActivePlan.findMany({
      where: {
        status: "active",
        isDigital: false,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      select: { userId: true },
      distinct: ["userId"],
    });
    for (const { userId } of active) {
      try {
        // Most recent meal log. Defensive: if MealLog model differs, skip silently.
        let lastLog: { createdAt: Date } | null = null;
        try {
          lastLog = await (prisma as any).mealLog.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
          });
        } catch {
          // model name or field name differs; bail re-engagement quietly
          break;
        }
        if (!lastLog) {
          // never logged — don't nag yet, onboarding nudge belongs elsewhere
          reEngagement.skipped++;
          continue;
        }
        if (new Date(lastLog.createdAt) > threeDaysAgo) {
          reEngagement.skipped++;
          continue;
        }
        if (await wasRecentlySent(userId, "re_engagement", 168)) {
          reEngagement.skipped++;
          continue;
        }
        const result = await sendNotification({
          userId,
          templateKey: "re_engagement",
          vars: {},
        });
        if (result.email === "sent" || result.whatsapp === "sent") reEngagement.fired++;
        else reEngagement.skipped++;
      } catch {
        reEngagement.failed++;
      }
    }
  } catch (e) {
    console.error("[daily-nudges] re_engagement query failed", e);
  }

  // ──────── 4. Coach nudges (plateau / milestone / missed workouts) ────────
  // Reuses the Coach spine: WeeklySummary → Recalibration → detectCoachNudges.
  // Per-user heavy work is fine at current scale; revisit if the active base grows.
  try {
    const coachActive = await (prisma as any).userActivePlan.findMany({
      where: {
        status: "active",
        isDigital: false,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      select: { userId: true },
      distinct: ["userId"],
    });
    for (const { userId } of coachActive) {
      try {
        const summary = await buildWeeklySummary(userId);
        const recal = computeRecalibration(summary);
        const nudges = detectCoachNudges(summary, recal);
        for (const n of nudges) {
          try {
            if (await wasRecentlySent(userId, n.templateKey, n.dedupHours)) {
              coachNudges.skipped++;
              continue;
            }
            const result = await sendNotification({
              userId,
              templateKey: n.templateKey,
              vars: n.vars,
            });
            if (result.email === "sent" || result.whatsapp === "sent") coachNudges.fired++;
            else coachNudges.skipped++;
          } catch {
            coachNudges.failed++;
          }
        }
      } catch (e) {
        coachNudges.failed++;
        console.error("[daily-nudges] coach summary failed for user", userId, e);
      }
    }
  } catch (e) {
    console.error("[daily-nudges] coach_nudges query failed", e);
  }

  // ──────── 5. Low-rated meal (rated 1–2 in the last day) ────────
  try {
    const since = new Date(now.getTime() - 36 * 3600_000); // last ~1.5 days
    const lowRated = await (prisma as any).mealLog.findMany({
      where: { rating: { lte: 2, gt: 0 }, createdAt: { gt: since } },
      select: { userId: true },
      distinct: ["userId"],
    });
    for (const { userId } of lowRated) {
      try {
        if (await wasRecentlySent(userId, "coach_low_rating", 72)) {
          lowRating.skipped++;
          continue;
        }
        const result = await sendNotification({
          userId,
          templateKey: "coach_low_rating",
          vars: {},
        });
        if (result.email === "sent" || result.whatsapp === "sent") lowRating.fired++;
        else lowRating.skipped++;
      } catch {
        lowRating.failed++;
      }
    }
  } catch (e) {
    console.error("[daily-nudges] coach_low_rating query failed", e);
  }

  return NextResponse.json({
    ok: true,
    ranAt: now.toISOString(),
    paymentPending,
    planEnding,
    reEngagement,
    coachNudges,
    lowRating,
  });
}

export async function POST(req: Request) { return handle(req); }
export async function GET(req: Request)  { return handle(req); }
