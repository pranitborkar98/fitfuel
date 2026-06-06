// lib/digital-plan-pdf.tsx  (meal plan + optional Pro workout section)
import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { DigitalPlanData, DigitalPlanMeal } from "./digital-plan-types";
import type { WorkoutPlanData } from "./workout-plan";

const LIME = "#5b7a00", INK = "#111111", MUTE = "#666666";
const s = StyleSheet.create({
  page: { padding: 36, fontSize: 10, color: INK, fontFamily: "Helvetica" },
  cover: { padding: 48, justifyContent: "center", height: "100%" },
  brand: { fontSize: 12, color: LIME, letterSpacing: 2, marginBottom: 8, fontFamily: "Helvetica-Bold" },
  h1: { fontSize: 28, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  sub: { fontSize: 12, color: MUTE, marginBottom: 24 },
  dayHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 2, borderBottomColor: LIME, paddingBottom: 4, marginBottom: 10 },
  dayTitle: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  dayTotals: { fontSize: 9, color: MUTE },
  meal: { marginBottom: 12 },
  mealTitle: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  slotTag: { fontSize: 8, color: LIME, letterSpacing: 1, marginBottom: 2 },
  mealMacros: { fontSize: 8, color: MUTE, marginBottom: 4 },
  sectionLbl: { fontSize: 8, fontFamily: "Helvetica-Bold", marginTop: 4, marginBottom: 2, color: "#333" },
  ing: { fontSize: 9, marginBottom: 1 }, step: { fontSize: 9, marginBottom: 2 },
  footer: { position: "absolute", bottom: 18, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: MUTE, borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 4 },
  groceryItem: { flexDirection: "row", justifyContent: "space-between", fontSize: 9, paddingVertical: 1 },
  groceryCat: { fontSize: 11, fontFamily: "Helvetica-Bold", color: LIME, marginTop: 10, marginBottom: 3 },
  woEx: { fontSize: 9, marginBottom: 2 },
});

const Footer = ({ plan }: { plan: string }) => (
  <View style={s.footer} fixed><Text>FitFuel · {plan}</Text><Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} /></View>
);

const Meal = ({ m }: { m: DigitalPlanMeal }) => (
  <View style={s.meal} wrap={false}>
    <Text style={s.slotTag}>{m.slot}</Text>
    <Text style={s.mealTitle}>{m.recipeName}</Text>
    <Text style={s.mealMacros}>{m.calories} kcal · P {m.proteinG}g · C {m.carbsG}g · F {m.fatG}g{m.fibreG ? ` · Fibre ${m.fibreG}g` : ""}</Text>
    <Text style={s.sectionLbl}>INGREDIENTS</Text>
    {m.ingredients.map((i, idx) => <Text key={idx} style={s.ing}>• {i.name} — {i.rawGrams} g</Text>)}
    <Text style={s.sectionLbl}>METHOD</Text>
    {m.steps.map((st, idx) => <Text key={idx} style={s.step}>{idx + 1}. {st}</Text>)}
  </View>
);

export function DigitalPlanDocument({ data, workout }: { data: DigitalPlanData; workout?: WorkoutPlanData | null }) {
  const byCat = new Map<string, typeof data.grocery>();
  for (const g of data.grocery) { const c = g.category ?? "Other"; (byCat.get(c) ?? byCat.set(c, []).get(c)!).push(g); }

  return (
    <Document title={`${data.planName} — FitFuel`}>
      <Page size="A4" style={s.cover}>
        <Text style={s.brand}>FITFUEL · {workout ? "DIGITAL PRO" : "DIGITAL"}</Text>
        <Text style={s.h1}>{data.planName}</Text>
        <Text style={s.sub}>{data.tier} · {data.dietVariant.replace("_", "-")} · {data.durationDays}-day plan{workout ? " + training plan" : ""}</Text>
      </Page>

      <Page size="A4" style={s.page} wrap>
        {data.days.map((d) => (
          <View key={d.day}>
            <View style={s.dayHeader}><Text style={s.dayTitle}>Day {d.day}</Text><Text style={s.dayTotals}>{d.totals.calories} kcal · P {d.totals.proteinG} · C {d.totals.carbsG} · F {d.totals.fatG}</Text></View>
            {d.meals.map((m, i) => <Meal key={i} m={m} />)}
          </View>
        ))}
        <Footer plan={data.planName} />
      </Page>

      <Page size="A4" style={s.page} wrap>
        <Text style={s.h1}>Grocery List</Text>
        <Text style={s.sub}>Total raw quantities across the {data.durationDays}-day plan.</Text>
        {[...byCat.entries()].map(([cat, items]) => (
          <View key={cat}><Text style={s.groceryCat}>{cat}</Text>
            {items.map((g, i) => <View key={i} style={s.groceryItem}><Text>{g.foodName}</Text><Text>{g.totalRawGrams} g</Text></View>)}
          </View>
        ))}
        <Footer plan={data.planName} />
      </Page>

      {workout && (
        <Page size="A4" style={s.page} wrap>
          <Text style={s.h1}>Training Plan</Text>
          <Text style={s.sub}>{workout.name} · {workout.daysPerWeek} days/week · ~{workout.sessionDurationMins} min/session</Text>
          {workout.days.map((d, i) => (
            <View key={i} wrap={false} style={{ marginBottom: 12 }}>
              <View style={s.dayHeader}>
                <Text style={s.dayTitle}>{d.dayOfWeek}</Text>
                <Text style={s.dayTotals}>{d.isRestDay ? "Rest" : `${d.focusArea} · ~${d.estimatedCalories} kcal`}</Text>
              </View>
              {d.isRestDay ? <Text style={s.woEx}>Rest &amp; recovery.</Text> :
                d.exercises.map((e, j) => (
                  <Text key={j} style={s.woEx}>• {e.name}{e.sets ? ` — ${e.sets}×${e.reps ?? ""}` : ""}{e.restSecs ? ` (rest ${e.restSecs}s)` : ""}{e.equipment ? ` · ${e.equipment}` : ""}</Text>
                ))}
            </View>
          ))}
          <Footer plan={data.planName} />
        </Page>
      )}
    </Document>
  );
}
