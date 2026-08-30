import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { resolvePhysicalCheckout } from "@/lib/physical-checkout";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";

const schema = z.object({
  planSlug: z.string().trim().min(1).max(120),
  diet: z.enum(["veg", "egg", "nonveg", "jain", "vegan"]),
  dur: z.enum(["trial", "weekly", "biweekly", "monthly_ex", "monthly", "two_month", "three_month"]),
  meal: z.enum(["bl", "sd", "all"]),
}).strict();

export async function POST(req: NextRequest) {
  const limit = await enforceRateLimit(req, "read");
  if (!limit.ok) return limit.response;

  const parsed = await readJson(req, schema);
  if (!parsed.ok) return parsed.response;
  const selection = await resolvePhysicalCheckout({
    planSlug: parsed.data.planSlug,
    diet: parsed.data.diet,
    duration: parsed.data.dur,
    meals: parsed.data.meal,
  });
  if (!selection.ok) {
    return NextResponse.json({ error: selection.error }, { status: selection.status });
  }

  return NextResponse.json({
    subtotalRs: selection.subtotalRs,
    plan: {
      slug: selection.plan.slug,
      name: selection.plan.displayName || selection.plan.name,
    },
  });
}
