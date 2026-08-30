import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readQuery } from "@/lib/validation/core";
import { metricsQuerySchema } from "@/lib/validation/schemas";

// GET /api/user/metrics/history?limit=30
// Returns an array of HistoryRow objects ordered oldest → newest (for the chart)
// Field mapping — schema column → client HistoryRow field:
//   measuredAt   → recordedAt
//   weightKg     → weight
//   bodyFatPct   → bodyFatRate
//   muscleMassKg → muscleMass
//   bmi          → bmi
//   visceralFat  → visceralFat
//   waterPct     → bodyWater
//   notes JSON   → bmr (packed by the POST route)

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await enforceRateLimit(req, "read", session.user.id);
  if (!rl.ok) return rl.response;
  const parsed = readQuery(req, metricsQuerySchema);
  if (!parsed.ok) return parsed.response;

  const limit = Math.min(parsed.data.limit, 100);

  const rows = await prisma.bodyMetric.findMany({
    where:   { userId: session.user.id },
    orderBy: { measuredAt: "asc" },   // asc = oldest first → chart draws left-to-right
    take:    limit,
    select: {
      id:          true,
      measuredAt:  true,
      weightKg:    true,
      bodyFatPct:  true,
      muscleMassKg: true,
      bmi:         true,
      visceralFat: true,
      waterPct:    true,
      notes:       true,   // JSON string — may contain bmr
    },
  });

  // Remap schema field names → client HistoryRow field names
  const history = rows.map(r => {
    // Parse bmr out of the notes JSON (packed by the POST route)
    let bmr: number | undefined;
    if (r.notes) {
      try {
        const parsed = JSON.parse(r.notes) as Record<string, number>;
        if (typeof parsed.bmr === "number" && Number.isFinite(parsed.bmr)) bmr = parsed.bmr;
      } catch { /* malformed notes — skip bmr */ }
    }

    return {
      id:          r.id,
      recordedAt:  r.measuredAt.toISOString(),
      weight:      r.weightKg    ?? 0,
      bodyFatRate: r.bodyFatPct  ?? 0,
      muscleMass:  r.muscleMassKg ?? 0,
      bmi:         r.bmi         ?? 0,
      ...(r.visceralFat != null  && { visceralFat: r.visceralFat }),
      ...(r.waterPct    != null  && { bodyWater:   r.waterPct }),
      ...(bmr           != null  && { bmr }),
    };
  });

  return NextResponse.json(history);
}
