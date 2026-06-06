// lib/digital-plan-pdf.tsx  (Phase 13B — PDF document)
// Renders DigitalPlanData -> PDF. No Prisma here (consumes the 13A shape).
// Install: npm i @react-pdf/renderer
// Light/printer-friendly pages with FitFuel lime accents. Helvetica avoids font-registration
// overhead; register Syne/DM Sans later via Font.register if you want brand fonts.
import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { DigitalPlanData, DigitalPlanMeal } from "./digital-plan-types";

const LIME = "#5b7a00"; // print-safe darker lime for text on white
const INK = "#111111";
const MUTE = "#666666";

const s = StyleSheet.create({
  page: { padding: 36, fontSize: 10, color: INK, fontFamily: "Helvetica" },
  cover: { padding: 48, justifyContent: "center", height: "100%" },
  brand: { fontSize: 12, color: LIME, letterSpacing: 2, marginBottom: 8, fontFamily: "Helvetica-Bold" },
  h1: { fontSize: 28, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  sub: { fontSize: 12, color: MUTE, marginBottom: 24 },
  macroRow: { flexDirection: "row", gap: 18, marginTop: 8 },
  macroBox: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 4, padding: 8, minWidth: 90 },
  macroNum: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  macroLbl: { fontSize: 8, color: MUTE, textTransform: "uppercase", letterSpacing: 1 },
  dayHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderBottomWidth: 2, borderBottomColor: LIME, paddingBottom: 4, marginBottom: 10 },
  dayTitle: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  dayTotals: { fontSize: 9, color: MUTE },
  meal: { marginBottom: 12, breakInside: "avoid" },
  mealTitle: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  slotTag: { fontSize: 8, color: LIME, letterSpacing: 1, marginBottom: 2 },
  mealMacros: { fontSize: 8, color: MUTE, marginBottom: 4 },
  sectionLbl: { fontSize: 8, fontFamily: "Helvetica-Bold", marginTop: 4, marginBottom: 2, color: "#333" },
  ing: { fontSize: 9, marginBottom: 1 },
  step: { fontSize: 9, marginBottom: 2 },
  footer: { position: "absolute", bottom: 18, left: 36, right: 36, flexDirection: "row",
    justifyContent: "space-between", fontSize: 7, color: MUTE, borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 4 },
  groceryItem: { flexDirection: "row", justifyContent: "space-between", fontSize: 9, paddingVertical: 1 },
  groceryCat: { fontSize: 11, fontFamily: "Helvetica-Bold", color: LIME, marginTop: 10, marginBottom: 3 },
});

const Footer = ({ plan }: { plan: string }) => (
  <View style={s.footer} fixed>
    <Text>FitFuel · {plan}</Text>
    <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
  </View>
);

const Meal = ({ m }: { m: DigitalPlanMeal }) => (
  <View style={s.meal} wrap={false}>
    <Text style={s.slotTag}>{m.slot}</Text>
    <Text style={s.mealTitle}>{m.recipeName}</Text>
    <Text style={s.mealMacros}>
      {m.calories} kcal · P {m.proteinG}g · C {m.carbsG}g · F {m.fatG}g
      {m.fibreG ? ` · Fibre ${m.fibreG}g` : ""}{m.difficulty ? ` · ${m.difficulty}` : ""}
    </Text>
    <Text style={s.sectionLbl}>INGREDIENTS</Text>
    {m.ingredients.map((i, idx) => (
      <Text key={idx} style={s.ing}>• {i.name} — {i.rawGrams} g</Text>
    ))}
    <Text style={s.sectionLbl}>METHOD</Text>
    {m.steps.map((st, idx) => (
      <Text key={idx} style={s.step}>{idx + 1}. {st}</Text>
    ))}
  </View>
);

export function DigitalPlanDocument({ data }: { data: DigitalPlanData }) {
  // group grocery by category
  const byCat = new Map<string, typeof data.grocery>();
  for (const g of data.grocery) {
    const c = g.category ?? "Other";
    (byCat.get(c) ?? byCat.set(c, []).get(c)!).push(g);
  }

  return (
    <Document title={`${data.planName} — FitFuel Digital Plan`}>
      {/* Cover */}
      <Page size="A4" style={s.cover}>
        <Text style={s.brand}>FITFUEL · DIGITAL PLAN</Text>
        <Text style={s.h1}>{data.planName}</Text>
        <Text style={s.sub}>
          {data.tier} · {data.dietVariant.replace("_", "-")} · {data.durationDays}-day plan
        </Text>
        <View style={s.macroRow}>
          <View style={s.macroBox}><Text style={s.macroNum}>{data.targetCalories ?? "—"}</Text><Text style={s.macroLbl}>kcal / day</Text></View>
          <View style={s.macroBox}><Text style={s.macroNum}>{data.targetProteinG ?? "—"}g</Text><Text style={s.macroLbl}>protein / day</Text></View>
          <View style={s.macroBox}><Text style={s.macroNum}>{data.days.length}</Text><Text style={s.macroLbl}>days</Text></View>
        </View>
      </Page>

      {/* Days */}
      <Page size="A4" style={s.page} wrap>
        {data.days.map((d) => (
          <View key={d.day}>
            <View style={s.dayHeader}>
              <Text style={s.dayTitle}>Day {d.day}</Text>
              <Text style={s.dayTotals}>
                {d.totals.calories} kcal · P {d.totals.proteinG} · C {d.totals.carbsG} · F {d.totals.fatG}
              </Text>
            </View>
            {d.meals.map((m, i) => <Meal key={i} m={m} />)}
          </View>
        ))}
        <Footer plan={data.planName} />
      </Page>

      {/* Grocery appendix */}
      <Page size="A4" style={s.page} wrap>
        <Text style={s.h1}>Grocery List</Text>
        <Text style={s.sub}>Total raw quantities across the full {data.durationDays}-day plan.</Text>
        {[...byCat.entries()].map(([cat, items]) => (
          <View key={cat}>
            <Text style={s.groceryCat}>{cat}</Text>
            {items.map((g, i) => (
              <View key={i} style={s.groceryItem}>
                <Text>{g.foodName}</Text>
                <Text>{g.totalRawGrams} g</Text>
              </View>
            ))}
          </View>
        ))}
        <Footer plan={data.planName} />
      </Page>
    </Document>
  );
}
