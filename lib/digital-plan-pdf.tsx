// lib/digital-plan-pdf.tsx — FitFuel Digital Plan, designed document (meal plan + optional Pro training plan).
// react-pdf has no remote-font dependency here (uses the built-in Helvetica family) so generation
// never fails on a font fetch. Design is carried by colour, scale, layout and dark brand pages.
import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { DigitalPlanData, DigitalPlanMeal } from "./digital-plan-types";
import type { WorkoutPlanData } from "./workout-plan";

const INK = "#0a0a0a";
const INK2 = "#161616";
const PAPER = "#ffffff";
const LIME = "#84cc16";
const LIME_DK = "#4d7c0f";
const SURFACE = "#f5f7ee";
const LINE = "#e7e9df";
const MUTE = "#6b7280";
const SUBINK = "#1f2937";
const DIMTEXT = "#cbd5cf";

const s = StyleSheet.create({
  // ── dark pages ──
  dark: { backgroundColor: INK, color: PAPER, padding: 0, height: "100%", position: "relative" },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, height: 6, backgroundColor: LIME },
  botBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 6, backgroundColor: LIME },
  coverInner: { paddingHorizontal: 54, paddingVertical: 64, flexGrow: 1, justifyContent: "center" },
  kicker: { fontSize: 11, color: LIME, letterSpacing: 3, fontFamily: "Helvetica-Bold", marginBottom: 18 },
  badge: { alignSelf: "flex-start", backgroundColor: LIME, color: INK, fontSize: 9, fontFamily: "Helvetica-Bold",
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, letterSpacing: 1, marginBottom: 16, textTransform: "uppercase" },
  coverTitle: { fontSize: 34, fontFamily: "Helvetica-Bold", color: PAPER, lineHeight: 1.1 },
  coverSub: { fontSize: 12, color: DIMTEXT, marginTop: 10 },
  rule: { height: 2, width: 56, backgroundColor: LIME, marginTop: 22, marginBottom: 22 },
  metricRow: { flexDirection: "row", flexWrap: "wrap" },
  metricBox: { borderWidth: 1, borderColor: "#2c2c2c", backgroundColor: INK2, borderRadius: 6,
    paddingVertical: 10, paddingHorizontal: 12, marginRight: 10, marginBottom: 10, minWidth: 96 },
  metricNum: { fontSize: 18, fontFamily: "Helvetica-Bold", color: LIME },
  metricLbl: { fontSize: 7.5, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginTop: 3 },
  coverFoot: { position: "absolute", bottom: 40, left: 54, right: 54, color: "#9ca3af", fontSize: 9,
    borderTopWidth: 1, borderTopColor: "#2c2c2c", paddingTop: 10 },

  // ── section divider ──
  divInner: { paddingHorizontal: 54, flexGrow: 1, justifyContent: "center" },
  divKicker: { fontSize: 11, color: LIME, letterSpacing: 3, fontFamily: "Helvetica-Bold", marginBottom: 10 },
  divTitle: { fontSize: 30, fontFamily: "Helvetica-Bold", color: PAPER, lineHeight: 1.1 },
  divText: { fontSize: 11, color: DIMTEXT, marginTop: 12, lineHeight: 1.5, maxWidth: 420 },

  // ── light content ──
  page: { paddingHorizontal: 40, paddingTop: 40, paddingBottom: 54, fontSize: 10, color: SUBINK, backgroundColor: PAPER },
  h2: { fontSize: 20, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 8 },
  lead: { fontSize: 11, color: MUTE, lineHeight: 1.55, marginBottom: 16, maxWidth: 470 },
  useRow: { flexDirection: "row", marginBottom: 9, alignItems: "flex-start" },
  useDot: { width: 6, height: 6, backgroundColor: LIME, borderRadius: 1, marginTop: 4, marginRight: 9 },
  useText: { fontSize: 10.5, color: SUBINK, lineHeight: 1.45, flex: 1 },
  useStrong: { fontFamily: "Helvetica-Bold", color: INK },

  // day ribbon
  dayWrap: { marginBottom: 14 },
  dayRibbon: { flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: INK, borderRadius: 6, paddingVertical: 9, paddingHorizontal: 12, marginBottom: 8 },
  dayNum: { fontSize: 14, fontFamily: "Helvetica-Bold", color: PAPER, letterSpacing: 1 },
  dayTotals: { fontSize: 9, color: LIME, fontFamily: "Helvetica-Bold" },

  // meal card
  meal: { backgroundColor: SURFACE, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: LIME,
    paddingVertical: 11, paddingHorizontal: 12, marginBottom: 8 },
  slotPill: { alignSelf: "flex-start", backgroundColor: LIME, color: INK, fontSize: 7.5, fontFamily: "Helvetica-Bold",
    letterSpacing: 1, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 8, textTransform: "uppercase", marginBottom: 5 },
  mealName: { fontSize: 12, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 6 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 },
  chip: { borderWidth: 1, borderColor: LINE, backgroundColor: PAPER, borderRadius: 4,
    paddingVertical: 2, paddingHorizontal: 6, marginRight: 5, marginBottom: 4 },
  chipNum: { fontSize: 9, fontFamily: "Helvetica-Bold", color: INK },
  chipUnit: { fontSize: 8, color: MUTE },
  subLbl: { fontSize: 7.5, fontFamily: "Helvetica-Bold", letterSpacing: 1, color: LIME_DK,
    textTransform: "uppercase", marginTop: 6, marginBottom: 4 },
  ingGrid: { flexDirection: "row", flexWrap: "wrap" },
  ingItem: { width: "50%", fontSize: 9, color: SUBINK, marginBottom: 2, paddingRight: 8 },
  step: { fontSize: 9, color: SUBINK, marginBottom: 3, lineHeight: 1.4 },
  stepN: { fontFamily: "Helvetica-Bold", color: LIME_DK },

  // grocery
  catBar: { backgroundColor: LIME, color: INK, fontSize: 10, fontFamily: "Helvetica-Bold",
    paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, marginTop: 12, marginBottom: 6,
    textTransform: "uppercase", letterSpacing: 1 },
  gGrid: { flexDirection: "row", flexWrap: "wrap" },
  gItem: { width: "50%", flexDirection: "row", justifyContent: "space-between",
    paddingRight: 14, paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: "#f0f1ea" },
  gName: { fontSize: 9, color: SUBINK },
  gQty: { fontSize: 9, color: LIME_DK, fontFamily: "Helvetica-Bold" },

  // workout
  woDay: { marginBottom: 10 },
  woHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: INK, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 11, marginBottom: 6 },
  woDayName: { fontSize: 12, fontFamily: "Helvetica-Bold", color: PAPER, textTransform: "capitalize" },
  woFocus: { fontSize: 9, color: LIME, fontFamily: "Helvetica-Bold" },
  woRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 3, paddingLeft: 2 },
  woBullet: { width: 5, height: 5, backgroundColor: LIME, borderRadius: 1, marginTop: 4, marginRight: 8 },
  woName: { fontSize: 9.5, color: SUBINK, flex: 1 },
  woReps: { fontSize: 9, color: LIME_DK, fontFamily: "Helvetica-Bold" },
  woRest: { fontSize: 8.5, color: MUTE },

  // footer
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row",
    justifyContent: "space-between", fontSize: 7.5, color: MUTE, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 6 },
});

const Footer = ({ plan }: { plan: string }) => (
  <View style={s.footer} fixed>
    <Text>FitFuel · {plan}</Text>
    <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
  </View>
);

const Chip = ({ n, u }: { n: number | string; u: string }) => (
  <View style={s.chip}><Text><Text style={s.chipNum}>{n}</Text><Text style={s.chipUnit}> {u}</Text></Text></View>
);

const Meal = ({ m }: { m: DigitalPlanMeal }) => (
  <View style={s.meal} wrap={false}>
    <Text style={s.slotPill}>{m.slot}</Text>
    <Text style={s.mealName}>{m.recipeName}</Text>
    <View style={s.chipRow}>
      <Chip n={m.calories} u="kcal" />
      <Chip n={`${m.proteinG}g`} u="protein" />
      <Chip n={`${m.carbsG}g`} u="carbs" />
      <Chip n={`${m.fatG}g`} u="fat" />
      {m.fibreG ? <Chip n={`${m.fibreG}g`} u="fibre" /> : null}
    </View>
    <Text style={s.subLbl}>Ingredients</Text>
    <View style={s.ingGrid}>
      {m.ingredients.map((i, idx) => (
        <Text key={idx} style={s.ingItem}>• {i.name} — {i.rawGrams} g</Text>
      ))}
    </View>
    <Text style={s.subLbl}>Method</Text>
    {m.steps.map((st, idx) => (
      <Text key={idx} style={s.step}><Text style={s.stepN}>{idx + 1}. </Text>{st}</Text>
    ))}
  </View>
);

const Divider = ({ kicker, title, text }: { kicker: string; title: string; text?: string }) => (
  <Page size="A4" style={s.dark}>
    <View style={s.topBar} /><View style={s.botBar} />
    <View style={s.divInner}>
      <Text style={s.divKicker}>{kicker}</Text>
      <Text style={s.divTitle}>{title}</Text>
      {text ? <Text style={s.divText}>{text}</Text> : null}
    </View>
  </Page>
);

export function DigitalPlanDocument(
  { data, workout, bundle }: { data: DigitalPlanData; workout?: WorkoutPlanData | null; bundle?: "STARTER" | "PRO" },
) {
  const tierLabel = bundle ?? (workout ? "PRO" : "STARTER");
  const dayCount = data.days.length;
  const mealsPerDay = data.days[0]?.meals.length ?? 4;
  const diet = data.dietVariant.replace("_", "-");

  const byCat = new Map<string, typeof data.grocery>();
  for (const g of data.grocery) {
    const c = g.category ?? "Other";
    (byCat.get(c) ?? byCat.set(c, []).get(c)!).push(g);
  }

  return (
    <Document title={`${data.planName} — FitFuel Digital ${tierLabel}`} author="FitFuel">
      {/* ── COVER ── */}
      <Page size="A4" style={s.dark}>
        <View style={s.topBar} /><View style={s.botBar} />
        <View style={s.coverInner}>
          <Text style={s.kicker}>FITFUEL · DIGITAL PLAN</Text>
          <Text style={s.badge}>{tierLabel} · {diet}</Text>
          <Text style={s.coverTitle}>{data.planName}</Text>
          <Text style={s.coverSub}>
            A {dayCount}-day chef-built plan you cook yourself — full recipes, macros and a single shop list
            {workout ? ", plus a real training plan." : "."}
          </Text>
          <View style={s.rule} />
          <View style={s.metricRow}>
            <View style={s.metricBox}><Text style={s.metricNum}>{data.targetCalories ?? "—"}</Text><Text style={s.metricLbl}>kcal / day</Text></View>
            <View style={s.metricBox}><Text style={s.metricNum}>{data.targetProteinG ?? "—"}g</Text><Text style={s.metricLbl}>protein / day</Text></View>
            <View style={s.metricBox}><Text style={s.metricNum}>{dayCount}</Text><Text style={s.metricLbl}>days</Text></View>
            <View style={s.metricBox}><Text style={s.metricNum}>{mealsPerDay}</Text><Text style={s.metricLbl}>meals / day</Text></View>
          </View>
        </View>
        <Text style={s.coverFoot}>FitFuel · fitfuel-eosin.vercel.app — your plan, your kitchen, anywhere in India.</Text>
      </Page>

      {/* ── HOW TO USE ── */}
      <Page size="A4" style={s.page} wrap>
        <Text style={s.h2}>How to use this plan</Text>
        <Text style={s.lead}>
          This is the exact {dayCount}-day rotation our kitchen cooks — portioned, balanced to your daily targets,
          and written so you can make every dish at home. A few things that make it work.
        </Text>
        {[
          ["All quantities are raw weights.", " Grams are measured before cooking — weigh dry rice, uncooked dal and raw vegetables, not the finished dish."],
          ["Hit the daily targets, not every gram.", " The per-day kcal and protein numbers are what matter. Small swaps are fine as long as the day's totals hold."],
          ["Batch-prep the bases.", " Soak legumes overnight, pressure-cook dals and grains in bulk, and pre-chop aromatics — most days then take minutes."],
          ["Log what you eat.", " Mark each meal in your FitFuel dashboard. That's what powers your progress charts and consistency score."],
          ["Use the shop list.", " The final pages total every ingredient across the whole plan, so one trip covers you."],
        ].map(([h, t], i) => (
          <View key={i} style={s.useRow}>
            <View style={s.useDot} />
            <Text style={s.useText}><Text style={s.useStrong}>{h}</Text>{t}</Text>
          </View>
        ))}
        <Footer plan={data.planName} />
      </Page>

      {/* ── MEALS ── */}
      <Divider kicker="SECTION 01" title={`The ${dayCount}-day plan`}
        text="Every day below is a full menu — breakfast, lunch, dinner and snack — with macros, ingredients and step-by-step method for each dish." />
      <Page size="A4" style={s.page} wrap>
        {data.days.map((d) => (
          <View key={d.day} style={s.dayWrap}>
            <View style={s.dayRibbon} wrap={false}>
              <Text style={s.dayNum}>DAY {d.day}</Text>
              <Text style={s.dayTotals}>{d.totals.calories} kcal · P {d.totals.proteinG} · C {d.totals.carbsG} · F {d.totals.fatG}</Text>
            </View>
            {d.meals.map((m, i) => <Meal key={i} m={m} />)}
          </View>
        ))}
        <Footer plan={data.planName} />
      </Page>

      {/* ── GROCERY ── */}
      <Divider kicker="SECTION 02" title="One shop, whole plan"
        text={`Total raw quantities across all ${dayCount} days, grouped by aisle. Buy once, cook the month.`} />
      <Page size="A4" style={s.page} wrap>
        {[...byCat.entries()].map(([cat, items]) => (
          <View key={cat} wrap={false}>
            <Text style={s.catBar}>{cat}</Text>
            <View style={s.gGrid}>
              {items.map((g, i) => (
                <View key={i} style={s.gItem}><Text style={s.gName}>{g.foodName}</Text><Text style={s.gQty}>{g.totalRawGrams} g</Text></View>
              ))}
            </View>
          </View>
        ))}
        <Footer plan={data.planName} />
      </Page>

      {/* ── TRAINING (PRO) ── */}
      {workout && (
        <>
          <Divider kicker="SECTION 03 · PRO" title="Your training plan"
            text={`${workout.name} — ${workout.daysPerWeek} days a week, about ${workout.sessionDurationMins} minutes a session. Pair it with the meals above for the full result.`} />
          <Page size="A4" style={s.page} wrap>
            {workout.days.map((d, i) => (
              <View key={i} style={s.woDay} wrap={false}>
                <View style={s.woHead}>
                  <Text style={s.woDayName}>{d.dayOfWeek}</Text>
                  <Text style={s.woFocus}>{d.isRestDay ? "REST & RECOVERY" : `${d.focusArea} · ~${d.estimatedCalories} kcal`}</Text>
                </View>
                {d.isRestDay ? (
                  <Text style={s.step}>Active recovery — light walking, mobility or stretching. Let the work land.</Text>
                ) : (
                  d.exercises.map((e, j) => (
                    <View key={j} style={s.woRow}>
                      <View style={s.woBullet} />
                      <Text style={s.woName}>{e.name}{e.equipment ? <Text style={s.woRest}>  ·  {e.equipment}</Text> : null}</Text>
                      <Text style={s.woReps}>
                        {e.sets ? `${e.sets}×${e.reps ?? ""}` : ""}{e.restSecs ? <Text style={s.woRest}>{e.sets ? "  " : ""}rest {e.restSecs}s</Text> : null}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            ))}
            <Footer plan={data.planName} />
          </Page>
        </>
      )}

      {/* ── BACK COVER ── */}
      <Page size="A4" style={s.dark}>
        <View style={s.topBar} /><View style={s.botBar} />
        <View style={s.coverInner}>
          <Text style={s.kicker}>NOW THE WORK BEGINS</Text>
          <Text style={s.coverTitle}>Cook it. Log it.{"\n"}Transform.</Text>
          <Text style={s.coverSub}>
            Tick off each meal in your FitFuel dashboard to build your streak, watch your macros land, and see the
            consistency score climb. The plan only works if you run it — so start with Day 1, tomorrow morning.
          </Text>
          <View style={s.rule} />
          <Text style={[s.coverSub, { marginTop: 0 }]}>Questions or a custom plan? fitfuel-eosin.vercel.app</Text>
        </View>
        <Text style={s.coverFoot}>FitFuel · Built in Pune · {tierLabel} Digital Plan</Text>
      </Page>
    </Document>
  );
}
