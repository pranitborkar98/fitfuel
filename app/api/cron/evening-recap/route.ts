// app/api/cron/evening-recap/route.ts
// Phase 16B \u2014 daily 9 PM IST. For each active subscriber, fires
// `evening_recap` with TOMORROW's meals + a log nudge.
// Triggered by Upstash QStash schedule.

import { NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { prisma } from "@/lib/prisma";
import { getUserDayMeals, mealsListHtml } from "@/lib/user-day-meals";
import { sendNotification } from "@/lib/notify";

export const dynamic = "force-dynamic";

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
        url: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/cron/evening-recap`,
      });
      if (isValid) return true;
    } catch { /* fall through */ }
  }
  if (process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`) {
    return true;
  }
  return false;
}

async function handle(req: Request) {
  const bodyText = await req.text().catch(() => "");
  const ok = await authorize(req, bodyText);
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Tomorrow in UTC midnight
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  const plans = await (prisma as any).userActivePlan.findMany({
    where: {
      status: "active",
      isDigital: false,
      startDate: { lte: tomorrow },
      endDate: { gte: tomorrow },
    },
    select: { userId: true },
    distinct: ["userId"],
  });

  let sent = 0, skipped = 0, failed = 0;
  for (const { userId } of plans) {
    try {
      const day = await getUserDayMeals(userId, tomorrow);
      if (!day || day.meals.length === 0) { skipped++; continue; }
      const result = await sendNotification({
        userId,
        templateKey: "evening_recap",
        vars: {
          mealsList: mealsListHtml(day.meals),
          totalCalories: String(day.totalCalories),
        },
      });
      if (result.email === "sent" || result.whatsapp === "sent") sent++;
      else skipped++;
    } catch (e) {
      failed++;
      console.error("[evening-recap] send failed", userId, e);
    }
  }

  return NextResponse.json({
    ok: true,
    tomorrow: tomorrow.toISOString().slice(0, 10),
    eligible: plans.length,
    sent, skipped, failed,
  });
}

export async function POST(req: Request) { return handle(req); }
export async function GET(req: Request)  { return handle(req); }
