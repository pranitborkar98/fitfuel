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

  // Derive computed fields from stored values so the Overview never shows blanks.
  // These mirror the formulas in computeAllMetrics on the client.
  const weight      = row.weightKg;
  const bodyFatPct  = row.bodyFatPct;
  const muscleMassKg = row.muscleMassKg;

  const fatMass     = weight != null && bodyFatPct != null
    ? parseFloat((weight * bodyFatPct / 100).toFixed(1)) : null;
  const fatFreeWeight = extras.fatFreeWeight ?? (
    weight != null && fatMass != null
      ? parseFloat((weight - fatMass).toFixed(1)) : null
  );
  const bodyWater   = row.waterPct;
  const waterWeight = weight != null && bodyWater != null
    ? parseFloat((weight * bodyWater / 100).toFixed(1)) : null;
  const muscleRate  = muscleMassKg != null && weight != null
    ? parseFloat((muscleMassKg / weight * 100).toFixed(1)) : null;
  const proteinPct  = row.proteinPct;
  const proteinMass = weight != null && proteinPct != null
    ? parseFloat((weight * proteinPct / 100).toFixed(1)) : null;
  // idealWeight uses BMI=22 × height². We don't store height here, so derive
  // from bmi and weight: height² = weight/bmi → idealWeight = 22 × weight/bmi
  const bmi         = row.bmi;
  const idealWeight = weight != null && bmi != null && bmi > 0
    ? parseFloat((22 * weight / bmi).toFixed(1)) : null;

  const metrics = {
    weight,
    bmi,
    bodyFatRate:     bodyFatPct,
    fatMass,
    fatFreeWeight,
    subcutaneousFat: extras.subcutaneousFat ?? (
      bodyFatPct != null ? parseFloat((bodyFatPct * 0.82).toFixed(1)) : null
    ),
    visceralFat:     row.visceralFat,
    bodyWater,
    waterWeight,
    skeletalMuscle:  extras.skeletalMuscle ?? (
      muscleMassKg != null && weight != null
        ? parseFloat((muscleMassKg / weight * 100 * 0.73).toFixed(1)) : null
    ),
    muscleMass:      muscleMassKg,
    muscleRate,
    boneMass:        row.boneMassKg,
    protein:         proteinPct,
    proteinMass,
    bmr:             extras.bmr ?? null,
    bodyAge:         row.metabolicAge,
    idealWeight,
  };

  return NextResponse.json(metrics);
}