import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { addDateOnlyDays, formatDateOnly, parseDateOnly, todayIndiaDate } from "@/lib/date-only";
import { enforceRateLimit } from "@/lib/rate-limit";
import { cutoffInstantFor, cutoffLabel } from "@/lib/order-cutoff";
import { isPlanServiceDate } from "@/lib/plan-service-dates";
import { prisma } from "@/lib/prisma";
import { readJson } from "@/lib/validation/core";

const changeSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  skipped: z.boolean(),
}).strict();

function errorCode(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
}

function dateLabel(date: Date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function mealsFor(mealsPerDay: string | null) {
  if (mealsPerDay === "BREAKFAST_LUNCH") return ["Breakfast", "Lunch"];
  if (mealsPerDay === "SNACK_DINNER") return ["Snack", "Dinner"];
  return ["Breakfast", "Lunch", "Snack", "Dinner"];
}

async function activePhysicalPlan(userId: string) {
  return prisma.userActivePlan.findFirst({
    where: { userId, status: "active", isDigital: false },
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      orderId: true,
      startDate: true,
      endDate: true,
      duration: true,
      mealsPerDay: true,
      deliveryWindow: true,
      skipDates: true,
    },
  });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rateLimit = await enforceRateLimit(req, "read", session.user.id);
  if (!rateLimit.ok) return rateLimit.response;

  const plan = await activePhysicalPlan(session.user.id);
  if (!plan) return NextResponse.json({ days: [], cutoffLabel: cutoffLabel() });

  const now = new Date();
  const today = todayIndiaDate(now);
  const skipped = new Set(plan.skipDates.map(formatDateOnly));
  let cursor = plan.startDate.getTime() > today.getTime() ? new Date(plan.startDate) : today;
  const days: Array<{ date: string; label: string; skipped: boolean; canChange: boolean; cutoff: string }> = [];

  while (cursor.getTime() <= plan.endDate.getTime() && days.length < 8) {
    if (isPlanServiceDate(plan.duration, cursor)) {
      const date = formatDateOnly(cursor);
      const cutoff = cutoffInstantFor(cursor);
      days.push({
        date,
        label: dateLabel(cursor),
        skipped: skipped.has(date),
        canChange: now.getTime() <= cutoff.getTime(),
        cutoff: cutoff.toISOString(),
      });
    }
    cursor = parseDateOnly(addDateOnlyDays(formatDateOnly(cursor), 1))!;
  }

  return NextResponse.json({ days, cutoffLabel: cutoffLabel() });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rateLimit = await enforceRateLimit(req, "mutation", session.user.id);
  if (!rateLimit.ok) return rateLimit.response;
  const parsed = await readJson(req, changeSchema);
  if (!parsed.ok) return parsed.response;
  const target = parseDateOnly(parsed.data.date);
  if (!target) return NextResponse.json({ error: "Choose a valid delivery date." }, { status: 400 });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const plan = await tx.userActivePlan.findFirst({
          where: { userId: session.user.id, status: "active", isDigital: false },
          orderBy: { startDate: "desc" },
          select: {
            id: true,
            orderId: true,
            startDate: true,
            endDate: true,
            duration: true,
            mealsPerDay: true,
            deliveryWindow: true,
            skipDates: true,
          },
        });
        if (!plan) return { status: 404, error: "No active meal-delivery plan was found." } as const;
        if (target.getTime() < plan.startDate.getTime() || target.getTime() > plan.endDate.getTime()) {
          return { status: 400, error: "That date is outside your active plan." } as const;
        }
        if (!isPlanServiceDate(plan.duration, target)) {
          return { status: 400, error: "That is not a delivery day for this plan." } as const;
        }
        if (Date.now() > cutoffInstantFor(target).getTime()) {
          return { status: 409, error: `Changes for this delivery closed at ${cutoffLabel()} the previous evening.` } as const;
        }

        const delivery = plan.orderId
          ? await tx.delivery.findFirst({
              where: { orderId: plan.orderId, deliveryDate: target },
              select: { id: true, status: true },
            })
          : null;
        if (delivery && delivery.status !== "PREPARING") {
          return { status: 409, error: "This delivery is already packed or with the driver. Contact support for help." } as const;
        }

        const targetKey = formatDateOnly(target);
        const nextDates = plan.skipDates.filter((date) => formatDateOnly(date) !== targetKey);
        if (parsed.data.skipped) nextDates.push(target);
        nextDates.sort((left, right) => left.getTime() - right.getTime());
        await tx.userActivePlan.update({
          where: { id: plan.id },
          data: { skipDates: { set: nextDates } },
        });

        if (parsed.data.skipped && delivery) {
          await tx.delivery.delete({ where: { id: delivery.id } });
        } else if (!parsed.data.skipped && !delivery && plan.orderId) {
          const today = todayIndiaDate();
          const daysAhead = Math.round((target.getTime() - today.getTime()) / 86_400_000);
          if (daysAhead <= 2) {
            await tx.delivery.create({
              data: {
                orderId: plan.orderId,
                deliveryDate: target,
                status: "PREPARING",
                mealsIncluded: mealsFor(plan.mealsPerDay),
                deliveryWindow: plan.deliveryWindow,
              },
            });
          }
        }

        return { status: 200, date: targetKey, skipped: parsed.data.skipped } as const;
      }, { isolationLevel: "Serializable" });

      if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
      return NextResponse.json({ ok: true, date: result.date, skipped: result.skipped });
    } catch (error: unknown) {
      if (errorCode(error) === "P2034" && attempt < 2) continue;
      console.error("[delivery-days] change failed", error);
      return NextResponse.json({ error: "The delivery change could not be saved. Please try again." }, { status: 500 });
    }
  }
  return NextResponse.json({ error: "The delivery change could not be saved. Please try again." }, { status: 500 });
}
