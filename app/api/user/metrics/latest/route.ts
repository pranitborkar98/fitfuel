import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/user/metrics/latest
// Returns the most recent BodyMetric row remapped to the client Metrics shape.
// Used by BodyMetricsClient on mount to hydrate the Overview tab without a save.
// Returns null (HTTP 200) when the user has no readings yet.

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await prisma.bodyMetric.findFirst({
    where:   { userId: session.user.id },
    orderBy: { measuredAt: "desc" },
    select: {
      weightKg:    true,
      bmi:         true,
      bodyFatPct:  true,
      muscleMassKg: true,
      waterPct:    true,
      boneMassKg:  true,
      visceralFat: true,
      metabolicAge: true,
      proteinPct:  true,
      notes:       true,   // JSON — contains bmr, fatFreeWeight, subcutaneousFat, skeletalMuscle
    },
  });

  if (!row) {
    return NextResponse.json(null);
  }

  // Unpack the extras from notes JSON (packed by the POST route)
  let extras: Record<string, number> = {};
  if (row.notes) {
    try { extras = JSON.parse(row.notes) as Record<string, number>; } catch { /* skip */ }
  }

  // Remap schema field names → client Metrics field names.
  // The 5 new computed fields (fatMass, waterWeight, muscleRate, proteinMass,
  // idealWeight) are derived client-side inside computeAllMetrics — we don't
  // store them separately, so they come back as null and get recomputed on save.
  const metrics = {
    weight:          row.weightKg,
    bmi:             row.bmi,
    bodyFatRate:     row.bodyFatPct,
    fatMass:         null,                    // derived client-side
    fatFreeWeight:   extras.fatFreeWeight  ?? null,
    subcutaneousFat: extras.subcutaneousFat ?? null,
    visceralFat:     row.visceralFat,
    bodyWater:       row.waterPct,
    waterWeight:     null,                    // derived client-side
    skeletalMuscle:  extras.skeletalMuscle ?? null,
    muscleMass:      row.muscleMassKg,
    muscleRate:      null,                    // derived client-side
    boneMass:        row.boneMassKg,
    protein:         row.proteinPct,
    proteinMass:     null,                    // derived client-side
    bmr:             extras.bmr            ?? null,
    bodyAge:         row.metabolicAge,
    idealWeight:     null,                    // derived client-side
  };

  return NextResponse.json(metrics);
}
