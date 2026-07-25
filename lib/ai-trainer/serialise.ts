// lib/ai-trainer/serialise.ts
// Phase 12A — turns a TrainerContext into the text block that goes into the prompt.
//
// Raw JSON of this object costs roughly three times what these lines do, mostly in
// braces, quotes and null fields the model gains nothing from reading. Empty sections
// are dropped entirely rather than sent as "none" — a new user's block stays short.
//
// This is the cacheable prefix: it changes once a day, so it must be assembled
// deterministically (stable key order, no timestamps beyond the date) or every turn
// misses the prompt cache.

import type { TrainerContext, RatedMeal } from "./types";

function line(label: string, value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  return `${label}: ${value}`;
}

function list(values: string[]): string | null {
  return values.length ? values.join(", ") : null;
}

function meals(bucket: RatedMeal[]): string | null {
  if (!bucket.length) return null;
  return bucket
    .map((m) => {
      const note = m.note ? ` ("${m.note}")` : "";
      return `${m.name} [${m.slot}] ${m.rating}/5${note}`;
    })
    .join("; ");
}

// Macro targets are only worth sending when something actually set them.
function targets(kcal: number, source: string, p: number | null, c: number | null, f: number | null): string {
  const macros = [p ? `${p}P` : null, c ? `${c}C` : null, f ? `${f}F` : null].filter(Boolean);
  const kcalPart =
    source === "default"
      ? `${kcal} kcal (generic default — no target has been set for this user)`
      : `${kcal} kcal`;
  return macros.length ? `${kcalPart}, ${macros.join(" / ")}` : kcalPart;
}

function section(title: string, lines: (string | null)[]): string | null {
  const kept = lines.filter((l): l is string => l !== null);
  if (!kept.length) return null;
  return `## ${title}\n${kept.join("\n")}`;
}

export function serialiseTrainerContext(ctx: TrainerContext): string {
  const p = ctx.profile;
  const n = ctx.nutrition7d;
  const w = ctx.workouts7d;
  const b = ctx.body;
  const c = ctx.consistency;
  const d = ctx.derived;

  const blocks = [
    section("Who", [
      line("Name", p.name),
      line("Age", p.age),
      line("Sex", p.sex),
      line("Height cm", p.heightCm),
      line(
        "Weight kg",
        p.currentWeightKg === null
          ? null
          : b.latestWeightAgeDays !== null && b.latestWeightAgeDays > 14
            ? `${p.currentWeightKg} (last weighed ${b.latestWeightAgeDays} days ago — treat as stale)`
            : p.currentWeightKg
      ),
      line("Target weight kg", p.targetWeightKg),
      line("Goal", p.goal),
      line("Activity", p.activityLevel),
      line("Diet", p.diet),
      line("Health conditions", list(p.healthConditions)),
      line("Allergies", list(p.allergies)),
      line("Dietary restrictions", list(p.dietaryRestrictions)),
      line("TDEE", p.tdee),
      line(
        "Daily targets",
        targets(p.calorieTarget, p.calorieTargetSource, p.proteinTarget, p.carbTarget, p.fatTarget)
      ),
    ]),

    ctx.plan
      ? section("Plan", [
          line("Plan", `${ctx.plan.name} (${ctx.plan.slug}, ${ctx.plan.tier})`),
          line("Day", `${ctx.plan.currentDay} of ${ctx.plan.cycleLengthDays}`),
          line("Started", ctx.plan.startDate),
          line("Delivery", ctx.plan.deliveryWindow),
        ])
      : null,

    section("Nutrition, last 7 days", [
      line("Days tracked", `${n.daysTracked} of 7`),
      line("Avg intake", `${n.avgKcalIn} kcal vs ${n.targetKcal} target`),
      line("Avg burned", `${n.avgKcalOut} kcal`),
      line("Avg net", `${n.avgNet} kcal`),
      line("Adherence", n.adherencePct === null ? null : `${n.adherencePct}%`),
      line(
        "Avg protein",
        n.proteinTarget ? `${n.avgProtein}g vs ${n.proteinTarget}g target` : `${n.avgProtein}g`
      ),
      line("Loved", meals(n.topRatedMeals)),
      line("Disliked", meals(n.lowRatedMeals)),
    ]),

    section("Training, last 7 days", [
      line("Program", w.programType),
      line("Sessions", `${w.completed} done of ${w.scheduled} scheduled`),
      line("Burned", w.totalKcalBurned ? `${w.totalKcalBurned} kcal` : null),
      line("Last session", w.lastSessionDate),
    ]),

    section("Body", [
      line("Latest weight kg", b.latestWeightKg),
      line("Last weighed", b.latestWeightAgeDays === null ? null : `${b.latestWeightAgeDays} days ago`),
      line("Weigh-ins last 30d", b.weighInsLast30d),
      line(
        "30d change kg",
        b.trend30dKg === null
          ? b.weighInsLast30d < 2
            ? "unknown — fewer than two weigh-ins this month"
            : null
          : b.trend30dKg
      ),
      line("Body fat %", b.bodyFatPct),
      line("Muscle mass kg", b.muscleMassKg),
      line("BMI", b.bmi),
    ]),

    section("Consistency", [
      line(
        "This week",
        c.thisWeekScore === null ? null : `${c.thisWeekScore}/100 (${c.label})`
      ),
      line(
        "Components",
        `meals ${c.components.meals}/40, workouts ${c.components.workouts}/30, ` +
          `water ${c.components.water}/10, weigh-in ${c.components.weighIn}/10, ` +
          `no-skips ${c.components.noSkips}/10`
      ),
      line("Last 4 weeks", c.trend4w.length ? c.trend4w.join(" → ") : null),
    ]),

    ctx.supplements.recommendedStack.length
      ? section("Supplements", [
          line("Suggested for " + (ctx.supplements.goalLabel ?? "goal"), list(ctx.supplements.recommendedStack)),
        ])
      : null,

    section("Read of the data", [
      line("Momentum", d.momentum),
      line("Streak days", d.streakDays),
      line("Biggest gap", d.biggestGap),
      d.plateauDetected ? "Plateau: weight has held for 2+ weeks against the goal" : null,
    ]),
  ];

  return blocks.filter((b): b is string => b !== null).join("\n\n");
}
