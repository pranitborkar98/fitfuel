// prisma/render-pdf.tsx — render the digital plan PDF to a local file. No auth, no payment, no deploy.
// Run: node --env-file=.env --env-file=.env.local --import tsx prisma/render-pdf.tsx
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { writeFileSync } from "node:fs";
import { DigitalPlanDocument } from "../lib/digital-plan-pdf";
import { getDigitalPlanData } from "../lib/digital-plan";
import { getWorkoutPlanData } from "../lib/workout-plan";
import { getPersonalization } from "../lib/personalization";
import { prisma } from "../lib/prisma";

const SLUG = "weight-loss-veg";
const BUNDLE: "STARTER" | "PRO" = "PRO";   // "STARTER" to preview the cheaper tier
const EMAIL = "";                          // set to a user's email to personalise from their profile; "" = plan defaults
// Or hard-code sample stats to see the full infographics without any saved data:
const SAMPLE = { heightCm: 175, weightKg: 82, goalWeightKg: 74, age: 29 };
const USE_SAMPLE = true;                   // set false to use EMAIL / saved data only

async function main() {
  const data = await getDigitalPlanData(SLUG);
  if (!data) throw new Error(`No plan for slug ${SLUG}`);

  let userId: string | undefined;
  if (EMAIL) {
    const u = await prisma.user.findFirst({ where: { email: EMAIL }, select: { id: true } });
    userId = u?.id;
  }
  const person = await getPersonalization(data, { userId, overrides: USE_SAMPLE ? SAMPLE : null });

  let workout = null;
  if (BUNDLE === "PRO") {
    const plan = await prisma.mealPlan.findUnique({ where: { slug: SLUG }, select: { subCategory: true, tier: true } });
    if (plan) workout = await getWorkoutPlanData(String(plan.subCategory), String(plan.tier));
    console.log(workout ? `Training plan: ${workout.name}` : "No matching ExerciseSchedule — workout section skipped.");
  }

  const buffer = await renderToBuffer(<DigitalPlanDocument data={data} workout={workout} bundle={BUNDLE} person={person} />);
  const out = `fitfuel-${SLUG}-${BUNDLE.toLowerCase()}.pdf`;
  writeFileSync(out, buffer);
  console.log(`Wrote ${out} (${(buffer.length / 1024).toFixed(0)} KB).`);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
