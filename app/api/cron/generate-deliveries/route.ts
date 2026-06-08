// app/api/cron/generate-deliveries/route.ts
// Phase 11 -- the delivery generator. Runs nightly (Vercel Cron, 17:30 UTC).
// For every ACTIVE subscriber whose plan covers tomorrow (and didn't skip it),
// it creates ONE delivery -- all their meals together -- stamped with the
// customer's chosen window (MORNING / EVENING). Idempotent: re-running won't
// create duplicates.
//
// Phase 15B: subscriber selection + skip filtering now come from the SHARED
// resolver in lib/production.ts, so this cron and the Kitchen Production
// Dashboard can never disagree about who eats tomorrow (Decision P15-1).
//
// Manual test (with your CRON_SECRET):
//   curl -H "Authorization: Bearer <CRON_SECRET>" \
//     "https://fitfuel-eosin.vercel.app/api/cron/generate-deliveries?date=2026-06-05"

import { prisma } from "@/lib/prisma";
import { getActiveSubscribersForDate, targetDayUTC, ymd } from "@/lib/production";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// which meals go in the (single) drop, based on what they subscribed to
function mealsFor(m: string | null | undefined): string[] {
  switch (m) {
    case "BREAKFAST_LUNCH": return ["Breakfast", "Lunch"];
    case "SNACK_DINNER": return ["Snack", "Dinner"];
    case "ALL_FOUR": return ["Breakfast", "Lunch", "Snack", "Dinner"];
    default: return ["Breakfast", "Lunch", "Snack", "Dinner"];
  }
}

export async function GET(req: NextRequest) {
  // Vercel Cron sends "Authorization: Bearer <CRON_SECRET>" automatically.
  const expected = process.env.CRON_SECRET;
  if (expected && req.headers.get("authorization") !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = targetDayUTC(req.nextUrl.searchParams.get("date"));

  // Shared predicate: active, physical, in-range, has order, skip-filtered.
  const { total, served, skipped } = await getActiveSubscribersForDate(date);

  let created = 0;
  let already = 0;

  for (const plan of served) {
    // already generated (idempotent re-run)?
    const exists = await prisma.delivery.findFirst({
      where: { orderId: plan.orderId!, deliveryDate: date },
      select: { id: true },
    });
    if (exists) {
      already++;
      continue;
    }

    await prisma.delivery.create({
      data: {
        orderId: plan.orderId!,
        deliveryDate: date,
        status: "PREPARING",
        mealsIncluded: mealsFor(plan.mealsPerDay),
        deliveryWindow: plan.deliveryWindow ?? "MORNING", // MORNING / EVENING
      },
    });
    created++;
  }

  return NextResponse.json({
    date: ymd(date),
    activePlans: total,
    created,
    alreadyExisted: already,
    skipped,
  });
}
