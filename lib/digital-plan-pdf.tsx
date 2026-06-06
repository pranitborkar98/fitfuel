// lib/digital-plan-pdf.tsx — FitFuel Digital Plan. Full dark brand theme + personalised infographics.
// Vector graphics via @react-pdf/renderer's Svg primitives (no remote fonts, no images → render never fails).
import React from "react";
import { Document, Page, View, Text, StyleSheet, Svg, Path, Circle, Rect, Polyline, Polygon, Line } from "@react-pdf/renderer";
import type { DigitalPlanData, DigitalPlanMeal } from "./digital-plan-types";
import type { WorkoutPlanData } from "./workout-plan";
import type { PersonalStats } from "./personalization";

const BG = "#0a0a0a";
const CARD = "#141414";
const CARD2 = "#1b1b1b";
const LINE = "#262626";
const LIME = "#a3e635";
const LIME2 = "#84cc16";
const TEXT = "#f5f5f4";
const SUBTLE = "#d4d4d8";
const DIM = "#a1a1aa";
const MUTE = "#71717a";
const PROT = "#a3e635";
const CARB = "#38bdf8";
const FAT = "#f59e0b";

const s = StyleSheet.create({
  page: { backgroundColor: BG, color: TEXT, paddingHorizontal: 40, paddingTop: 40, paddingBottom: 52, fontSize: 10, fontFamily: "Helvetica" },
  full: { backgroundColor: BG, color: TEXT, padding: 0, height: "100%", position: "relative" },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, height: 6, backgroundColor: LIME },
  botBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 6, backgroundColor: LIME },
  centerInner: { paddingHorizontal: 54, paddingVertical: 64, flexGrow: 1, justifyContent: "center" },

  kicker: { fontSize: 11, color: LIME, letterSpacing: 3, fontFamily: "Helvetica-Bold", marginBottom: 16 },
  badge: { alignSelf: "flex-start", backgroundColor: LIME, color: BG, fontSize: 9, fontFamily: "Helvetica-Bold", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, letterSpacing: 1, marginBottom: 16, textTransform: "uppercase" },
  title: { fontSize: 34, fontFamily: "Helvetica-Bold", color: TEXT, lineHeight: 1.1 },
  sub: { fontSize: 12, color: DIM, marginTop: 10, lineHeight: 1.5, maxWidth: 430 },
  rule: { height: 2, width: 56, backgroundColor: LIME, marginTop: 22, marginBottom: 22 },
  metricRow: { flexDirection: "row", flexWrap: "wrap" },
  metricBox: { borderWidth: 1, borderColor: LINE, backgroundColor: CARD, borderRadius: 6, paddingVertical: 10, paddingHorizontal: 12, marginRight: 10, marginBottom: 10, minWidth: 96 },
  metricNum: { fontSize: 18, fontFamily: "Helvetica-Bold", color: LIME },
  metricLbl: { fontSize: 7.5, color: MUTE, textTransform: "uppercase", letterSpacing: 1, marginTop: 3 },
  foot: { position: "absolute", bottom: 40, left: 54, right: 54, color: MUTE, fontSize: 9, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 10 },

  h2: { fontSize: 20, fontFamily: "Helvetica-Bold", color: TEXT, marginBottom: 6 },
  lead: { fontSize: 11, color: DIM, lineHeight: 1.55, marginBottom: 16, maxWidth: 470 },

  // dashboard prompt
  prompt: { flexDirection: "row", alignItems: "center", backgroundColor: CARD, borderWidth: 1, borderColor: LINE, borderLeftWidth: 3, borderLeftColor: LIME, borderRadius: 6, paddingVertical: 9, paddingHorizontal: 12, marginTop: 4, marginBottom: 14 },
  promptArrow: { color: LIME, fontFamily: "Helvetica-Bold", marginRight: 8, fontSize: 12 },
  promptText: { fontSize: 9.5, color: SUBTLE, flex: 1, lineHeight: 1.4 },

  // stat tiles
  tileRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 6 },
  tile: { width: "25%", paddingRight: 8, marginBottom: 10 },
  tileInner: { backgroundColor: CARD, borderWidth: 1, borderColor: LINE, borderRadius: 6, padding: 10 },
  tileNum: { fontSize: 17, fontFamily: "Helvetica-Bold", color: TEXT },
  tileUnit: { fontSize: 9, color: DIM, fontFamily: "Helvetica" },
  tileLbl: { fontSize: 7.5, color: MUTE, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 },

  // infographic cards
  vizRow: { flexDirection: "row", marginBottom: 12 },
  vizCard: { backgroundColor: CARD, borderWidth: 1, borderColor: LINE, borderRadius: 8, padding: 12, flex: 1 },
  vizTitle: { fontSize: 9, color: LIME, fontFamily: "Helvetica-Bold", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendTxt: { fontSize: 9, color: SUBTLE },
  legendVal: { fontSize: 9, color: TEXT, fontFamily: "Helvetica-Bold" },
  ringCenterWrap: { position: "absolute", top: 0, left: 0, width: 120, height: 120, alignItems: "center", justifyContent: "center" },
  ringCenterNum: { fontSize: 16, fontFamily: "Helvetica-Bold", color: TEXT },
  ringCenterLbl: { fontSize: 7, color: MUTE, textTransform: "uppercase", letterSpacing: 1 },
  callout: { backgroundColor: CARD2, borderWidth: 1, borderColor: LIME2, borderRadius: 6, padding: 12, marginTop: 6 },
  calloutTxt: { fontSize: 10, color: SUBTLE, lineHeight: 1.5 },

  // section divider
  divKicker: { fontSize: 11, color: LIME, letterSpacing: 3, fontFamily: "Helvetica-Bold", marginBottom: 10 },
  divTitle: { fontSize: 30, fontFamily: "Helvetica-Bold", color: TEXT, lineHeight: 1.1 },
  divText: { fontSize: 11, color: DIM, marginTop: 12, lineHeight: 1.5, maxWidth: 430 },

  // day + meal
  dayWrap: { marginBottom: 14 },
  dayRibbon: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: CARD2, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: LIME, paddingVertical: 9, paddingHorizontal: 12, marginBottom: 8 },
  dayNum: { fontSize: 14, fontFamily: "Helvetica-Bold", color: TEXT, letterSpacing: 1 },
  dayTotals: { fontSize: 9, color: LIME, fontFamily: "Helvetica-Bold" },
  meal: { backgroundColor: CARD, borderRadius: 6, borderWidth: 1, borderColor: LINE, paddingVertical: 11, paddingHorizontal: 12, marginBottom: 8 },
  slotPill: { alignSelf: "flex-start", backgroundColor: LIME, color: BG, fontSize: 7.5, fontFamily: "Helvetica-Bold", letterSpacing: 1, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 8, textTransform: "uppercase", marginBottom: 5 },
  mealName: { fontSize: 12, fontFamily: "Helvetica-Bold", color: TEXT, marginBottom: 6 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 },
  chip: { borderWidth: 1, borderColor: LINE, backgroundColor: CARD2, borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6, marginRight: 5, marginBottom: 4 },
  chipNum: { fontSize: 9, fontFamily: "Helvetica-Bold", color: TEXT },
  chipUnit: { fontSize: 8, color: MUTE },
  subLbl: { fontSize: 7.5, fontFamily: "Helvetica-Bold", letterSpacing: 1, color: LIME, textTransform: "uppercase", marginTop: 6, marginBottom: 4 },
  ingGrid: { flexDirection: "row", flexWrap: "wrap" },
  ingItem: { width: "50%", fontSize: 9, color: SUBTLE, marginBottom: 2, paddingRight: 8 },
  step: { fontSize: 9, color: SUBTLE, marginBottom: 3, lineHeight: 1.4 },
  stepN: { fontFamily: "Helvetica-Bold", color: LIME },

  // grocery
  catBar: { backgroundColor: CARD2, color: LIME, fontSize: 10, fontFamily: "Helvetica-Bold", paddingVertical: 5, paddingHorizontal: 8, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: LIME, marginTop: 12, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 },
  gGrid: { flexDirection: "row", flexWrap: "wrap" },
  gItem: { width: "50%", flexDirection: "row", justifyContent: "space-between", paddingRight: 14, paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: LINE },
  gName: { fontSize: 9, color: SUBTLE },
  gQty: { fontSize: 9, color: LIME, fontFamily: "Helvetica-Bold" },

  // workout
  woDay: { marginBottom: 10 },
  woHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: CARD2, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: LIME, paddingVertical: 8, paddingHorizontal: 11, marginBottom: 6 },
  woDayName: { fontSize: 12, fontFamily: "Helvetica-Bold", color: TEXT, textTransform: "capitalize" },
  woFocus: { fontSize: 9, color: LIME, fontFamily: "Helvetica-Bold" },
  woRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 3, paddingLeft: 2 },
  woBullet: { width: 5, height: 5, backgroundColor: LIME, borderRadius: 1, marginTop: 4, marginRight: 8 },
  woName: { fontSize: 9.5, color: SUBTLE, flex: 1 },
  woReps: { fontSize: 9, color: LIME, fontFamily: "Helvetica-Bold" },
  woRest: { fontSize: 8.5, color: MUTE },

  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 7.5, color: MUTE, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 6 },
});

const Footer = ({ plan }: { plan: string }) => (
  <View style={s.footer} fixed>
    <Text>FitFuel · {plan}</Text>
    <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
  </View>
);

const Prompt = ({ children }: { children: React.ReactNode }) => (
  <View style={s.prompt}><Text style={s.promptArrow}>→</Text><Text style={s.promptText}>{children}</Text></View>
);

const Chip = ({ n, u }: { n: number | string; u: string }) => (
  <View style={s.chip}><Text><Text style={s.chipNum}>{n}</Text><Text style={s.chipUnit}> {u}</Text></Text></View>
);

const Tile = ({ n, u, l }: { n: string | number; u?: string; l: string }) => (
  <View style={s.tile}><View style={s.tileInner}>
    <Text><Text style={s.tileNum}>{n}</Text>{u ? <Text style={s.tileUnit}> {u}</Text> : null}</Text>
    <Text style={s.tileLbl}>{l}</Text>
  </View></View>
);

// ── arc helpers for the macro ring (Path-based; avoids untyped strokeDashoffset) ──
function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const sgn = polar(cx, cy, r, startDeg), e = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${sgn.x.toFixed(2)} ${sgn.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

// ── macro ring (donut via dash segments) ──
function MacroRing({ p }: { p: PersonalStats }) {
  const pc = p.macros.proteinG * 4, cc = p.macros.carbsG * 4, fc = p.macros.fatG * 9;
  const total = pc + cc + fc || 1;
  const segs = [
    { c: PROT, v: pc, g: p.macros.proteinG, label: "Protein" },
    { c: CARB, v: cc, g: p.macros.carbsG, label: "Carbs" },
    { c: FAT, v: fc, g: p.macros.fatG, label: "Fat" },
  ];
  const CX = 60, CY = 60, R = 44, SW = 16;
  let a0 = 0;
  return (
    <View style={s.vizCard}>
      <Text style={s.vizTitle}>Daily macro split</Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: 120, height: 120, position: "relative" }}>
          <Svg width={120} height={120}>
            <Circle cx={CX} cy={CY} r={R} stroke={CARD2} strokeWidth={SW} fill="none" />
            {segs.map((sg, i) => {
              const frac = sg.v / total;
              if (frac <= 0) return null;
              const a1 = a0 + frac * 360;
              const d = arcPath(CX, CY, R, a0, Math.min(a1, 359.99));
              a0 = a1;
              return <Path key={i} d={d} stroke={sg.c} strokeWidth={SW} fill="none" />;
            })}
          </Svg>
          <View style={s.ringCenterWrap}>
            <Text style={s.ringCenterNum}>{p.calorieTarget}</Text>
            <Text style={s.ringCenterLbl}>kcal / day</Text>
          </View>
        </View>
        <View style={{ flex: 1, paddingLeft: 10 }}>
          {segs.map((sg, i) => (
            <View key={i} style={s.legendRow}>
              <View style={[s.legendDot, { backgroundColor: sg.c }]} />
              <Text style={s.legendTxt}>{sg.label} </Text>
              <Text style={s.legendVal}>{sg.g}g</Text>
              <Text style={s.legendTxt}>  ·  {Math.round((sg.v / total) * 100)}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ── BMI scale (zones + marker) ──
function BmiScale({ p }: { p: PersonalStats }) {
  const W = 230, H = 14, MIN = 15, MAX = 35;
  const zones = [
    { from: 15, to: 18.5, c: "#38bdf8" },
    { from: 18.5, to: 25, c: LIME2 },
    { from: 25, to: 30, c: "#f59e0b" },
    { from: 30, to: 35, c: "#ef4444" },
  ];
  const x = (v: number) => ((Math.min(Math.max(v, MIN), MAX) - MIN) / (MAX - MIN)) * W;
  const mx = p.bmi ? x(p.bmi) : null;
  return (
    <View style={s.vizCard}>
      <Text style={s.vizTitle}>Body mass index</Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 8 }}>
        <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", color: TEXT }}>{p.bmi ?? "—"}</Text>
        <Text style={{ fontSize: 10, color: LIME, fontFamily: "Helvetica-Bold", marginLeft: 8 }}>{p.bmiCategory ?? "Add your stats"}</Text>
      </View>
      <Svg width={W} height={H + 14}>
        {zones.map((z, i) => (
          <Rect key={i} x={x(z.from)} y={6} width={x(z.to) - x(z.from)} height={H} fill={z.c} rx={2} />
        ))}
        {mx !== null && <Polygon points={`${mx - 4},2 ${mx + 4},2 ${mx},8`} fill={TEXT} />}
        {mx !== null && <Line x1={mx} y1={4} x2={mx} y2={H + 8} stroke={TEXT} strokeWidth={1.5} />}
      </Svg>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2 }}>
        <Text style={{ fontSize: 7, color: MUTE }}>15</Text>
        <Text style={{ fontSize: 7, color: MUTE }}>Healthy 18.5–25</Text>
        <Text style={{ fontSize: 7, color: MUTE }}>35</Text>
      </View>
    </View>
  );
}

// ── calorie / deficit bars ──
function CalorieBars({ p }: { p: PersonalStats }) {
  const maint = p.maintenanceCalories;
  const max = Math.max(maint ?? 0, p.calorieTarget, 1);
  const W = 200;
  const bar = (val: number, color: string) => Math.max((val / max) * W, 4);
  return (
    <View style={s.vizCard}>
      <Text style={s.vizTitle}>Your energy target</Text>
      {maint ? (
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 8, color: DIM, marginBottom: 3 }}>Maintenance (TDEE)</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: bar(maint, MUTE), height: 12, backgroundColor: "#3f3f46", borderRadius: 3, marginRight: 6 }} />
            <Text style={{ fontSize: 9, color: SUBTLE, fontFamily: "Helvetica-Bold" }}>{maint}</Text>
          </View>
        </View>
      ) : null}
      <View>
        <Text style={{ fontSize: 8, color: DIM, marginBottom: 3 }}>Plan target</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: bar(p.calorieTarget, LIME), height: 12, backgroundColor: LIME, borderRadius: 3, marginRight: 6 }} />
          <Text style={{ fontSize: 9, color: TEXT, fontFamily: "Helvetica-Bold" }}>{p.calorieTarget}</Text>
        </View>
      </View>
      {p.dailyDeficit && p.dailyDeficit > 0 ? (
        <Text style={{ fontSize: 9, color: LIME, marginTop: 8 }}>≈ {p.dailyDeficit} kcal/day deficit</Text>
      ) : (
        <Text style={{ fontSize: 8.5, color: MUTE, marginTop: 8 }}>Hit this daily and the results follow.</Text>
      )}
    </View>
  );
}

// ── weight projection line ──
function Projection({ p }: { p: PersonalStats }) {
  if (!p.projection || !p.currentWeightKg || !p.goalWeightKg) return null;
  const pts = p.projection.points;
  const W = 470, H = 120, padL = 34, padR = 16, padT = 14, padB = 22;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const weights = pts.map((q) => q.kg);
  const lo = Math.min(...weights) - 1, hi = Math.max(...weights) + 1;
  const X = (w: number) => padL + (w / p.projection!.weeks) * plotW;
  const Y = (kg: number) => padT + (1 - (kg - lo) / (hi - lo || 1)) * plotH;
  const poly = pts.map((q) => `${X(q.week).toFixed(1)},${Y(q.kg).toFixed(1)}`).join(" ");
  const start = pts[0], end = pts[pts.length - 1];
  return (
    <View style={[s.vizCard, { marginTop: 0 }]}>
      <Text style={s.vizTitle}>Projected progress {p.projection.assumed ? "(typical pace)" : ""}</Text>
      <Svg width={W} height={H}>
        <Line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={LINE} strokeWidth={1} />
        <Line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke={LINE} strokeWidth={1} />
        <Polyline points={poly} fill="none" stroke={LIME} strokeWidth={2} />
        <Circle cx={X(start.week)} cy={Y(start.kg)} r={3.5} fill={TEXT} />
        <Circle cx={X(end.week)} cy={Y(end.kg)} r={3.5} fill={LIME} />
      </Svg>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2 }}>
        <Text style={{ fontSize: 8.5, color: SUBTLE }}>Now · {start.kg} kg</Text>
        <Text style={{ fontSize: 8.5, color: LIME, fontFamily: "Helvetica-Bold" }}>~{p.projection.weeks} wks · goal {end.kg} kg</Text>
      </View>
    </View>
  );
}

const Meal = ({ m }: { m: DigitalPlanMeal }) => (
  <View style={s.meal} wrap={false}>
    <Text style={s.slotPill}>{m.slot}</Text>
    <Text style={s.mealName}>{m.recipeName}</Text>
    <View style={s.chipRow}>
      <Chip n={m.calories} u="kcal" /><Chip n={`${m.proteinG}g`} u="protein" /><Chip n={`${m.carbsG}g`} u="carbs" /><Chip n={`${m.fatG}g`} u="fat" />
      {m.fibreG ? <Chip n={`${m.fibreG}g`} u="fibre" /> : null}
    </View>
    <Text style={s.subLbl}>Ingredients</Text>
    <View style={s.ingGrid}>{m.ingredients.map((i, idx) => <Text key={idx} style={s.ingItem}>• {i.name} — {i.rawGrams} g</Text>)}</View>
    <Text style={s.subLbl}>Method</Text>
    {m.steps.map((st, idx) => <Text key={idx} style={s.step}><Text style={s.stepN}>{idx + 1}. </Text>{st}</Text>)}
  </View>
);

const Divider = ({ kicker, title, text }: { kicker: string; title: string; text?: string }) => (
  <Page size="A4" style={s.full}>
    <View style={s.topBar} /><View style={s.botBar} />
    <View style={s.centerInner}>
      <Text style={s.divKicker}>{kicker}</Text>
      <Text style={s.divTitle}>{title}</Text>
      {text ? <Text style={s.divText}>{text}</Text> : null}
    </View>
  </Page>
);

export function DigitalPlanDocument(
  { data, workout, bundle, person }:
  { data: DigitalPlanData; workout?: WorkoutPlanData | null; bundle?: "STARTER" | "PRO"; person?: PersonalStats | null },
) {
  const tierLabel = bundle ?? (workout ? "PRO" : "STARTER");
  const dayCount = data.days.length;
  const mealsPerDay = data.days[0]?.meals.length ?? 4;
  const diet = data.dietVariant.replace("_", "-");
  const hello = person?.firstName ? `${person.firstName}, here's` : "Here's";

  const byCat = new Map<string, typeof data.grocery>();
  for (const g of data.grocery) { const c = g.category ?? "Other"; (byCat.get(c) ?? byCat.set(c, []).get(c)!).push(g); }

  return (
    <Document title={`${data.planName} — FitFuel Digital ${tierLabel}`} author="FitFuel">
      {/* COVER */}
      <Page size="A4" style={s.full}>
        <View style={s.topBar} /><View style={s.botBar} />
        <View style={s.centerInner}>
          <Text style={s.kicker}>FITFUEL · DIGITAL PLAN</Text>
          <Text style={s.badge}>{tierLabel} · {diet}</Text>
          <Text style={s.title}>{data.planName}</Text>
          <Text style={s.sub}>
            {hello} a {dayCount}-day chef-built plan you cook yourself — full recipes, macros and a single shop list
            {workout ? ", plus a real training plan." : "."}
          </Text>
          <View style={s.rule} />
          <View style={s.metricRow}>
            <View style={s.metricBox}><Text style={s.metricNum}>{person?.calorieTarget ?? data.targetCalories ?? "—"}</Text><Text style={s.metricLbl}>kcal / day</Text></View>
            <View style={s.metricBox}><Text style={s.metricNum}>{data.targetProteinG ?? person?.macros.proteinG ?? "—"}g</Text><Text style={s.metricLbl}>protein / day</Text></View>
            <View style={s.metricBox}><Text style={s.metricNum}>{dayCount}</Text><Text style={s.metricLbl}>days</Text></View>
            <View style={s.metricBox}><Text style={s.metricNum}>{mealsPerDay}</Text><Text style={s.metricLbl}>meals / day</Text></View>
          </View>
        </View>
        <Text style={s.foot}>FitFuel · fitfuel-eosin.vercel.app — your plan, your kitchen, anywhere in India.</Text>
      </Page>

      {/* YOUR NUMBERS */}
      {person ? (
        <Page size="A4" style={s.page} wrap>
          <Text style={s.h2}>Your numbers</Text>
          <Text style={s.lead}>
            {person.hasBodyData
              ? "Built around the body data on your FitFuel profile. As you log and weigh in, these update — this is your starting line."
              : "We've set this from the plan's targets. Add your height, weight and goal in the dashboard and your BMI, deficit and projection personalise instantly."}
          </Text>

          <View style={s.tileRow}>
            <Tile n={person.heightCm ?? "—"} u={person.heightCm ? "cm" : ""} l="Height" />
            <Tile n={person.currentWeightKg ?? "—"} u={person.currentWeightKg ? "kg" : ""} l="Current" />
            <Tile n={person.goalWeightKg ?? "—"} u={person.goalWeightKg ? "kg" : ""} l="Goal" />
            <Tile n={person.bodyFatPct ?? person.age ?? "—"} u={person.bodyFatPct ? "%" : ""} l={person.bodyFatPct ? "Body fat" : "Age"} />
          </View>

          <View style={s.vizRow}>
            <MacroRing p={person} />
            <View style={{ width: 12 }} />
            {person.hasBodyData ? <BmiScale p={person} /> : <CalorieBars p={person} />}
          </View>

          {person.hasBodyData ? (
            <View style={s.vizRow}><CalorieBars p={person} /></View>
          ) : null}

          {person.projection ? <Projection p={person} /> : null}

          {!person.hasBodyData ? (
            <View style={s.callout}>
              <Text style={s.calloutTxt}>
                Want the BMI gauge and a personalised weight-projection chart here? Open your FitFuel dashboard,
                add your height, current weight and goal weight, and re-download — this page rebuilds around you.
              </Text>
            </View>
          ) : null}

          <Prompt>Weigh in weekly and log each meal in your FitFuel dashboard — that's what powers your progress charts and keeps these numbers honest.</Prompt>
          <Footer plan={data.planName} />
        </Page>
      ) : null}

      {/* HOW TO USE */}
      <Page size="A4" style={s.page} wrap>
        <Text style={s.h2}>How to use this plan</Text>
        <Text style={s.lead}>This is the exact {dayCount}-day rotation our kitchen cooks — portioned, balanced to your targets, written so you can make every dish at home.</Text>
        {[
          ["All quantities are raw weights.", " Grams are measured before cooking — weigh dry rice, uncooked dal and raw vegetables, not the finished dish."],
          ["Hit the daily targets, not every gram.", " The per-day kcal and protein numbers are what matter. Small swaps are fine as long as the day's totals hold."],
          ["Batch-prep the bases.", " Soak legumes overnight, pressure-cook dals and grains in bulk, pre-chop aromatics — most days then take minutes."],
          ["Log what you eat.", " Mark each meal in your FitFuel dashboard. That's what powers your progress charts and consistency score."],
          ["Use the shop list.", " The grocery pages total every ingredient across the plan, so one trip covers you."],
        ].map(([h, t], i) => (
          <View key={i} style={{ flexDirection: "row", marginBottom: 9 }}>
            <View style={{ width: 6, height: 6, backgroundColor: LIME, borderRadius: 1, marginTop: 4, marginRight: 9 }} />
            <Text style={{ fontSize: 10.5, color: SUBTLE, lineHeight: 1.45, flex: 1 }}><Text style={{ fontFamily: "Helvetica-Bold", color: TEXT }}>{h}</Text>{t}</Text>
          </View>
        ))}
        <Footer plan={data.planName} />
      </Page>

      {/* MEALS */}
      <Divider kicker="SECTION 01" title={`The ${dayCount}-day plan`} text="Every day is a full menu — breakfast, lunch, dinner and snack — with macros, ingredients and step-by-step method." />
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

      {/* GROCERY */}
      <Divider kicker="SECTION 02" title="One shop, whole plan" text={`Total raw quantities across all ${dayCount} days, grouped by aisle. Buy once, cook the month.`} />
      <Page size="A4" style={s.page} wrap>
        {[...byCat.entries()].map(([cat, items]) => (
          <View key={cat} wrap={false}>
            <Text style={s.catBar}>{cat}</Text>
            <View style={s.gGrid}>{items.map((g, i) => <View key={i} style={s.gItem}><Text style={s.gName}>{g.foodName}</Text><Text style={s.gQty}>{g.totalRawGrams} g</Text></View>)}</View>
          </View>
        ))}
        <Footer plan={data.planName} />
      </Page>

      {/* TRAINING (PRO) */}
      {workout && (
        <>
          <Divider kicker="SECTION 03 · PRO" title="Your training plan" text={`${workout.name} — ${workout.daysPerWeek} days a week, about ${workout.sessionDurationMins} minutes a session. Pair it with the meals for the full result.`} />
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
                      <Text style={s.woReps}>{e.sets ? `${e.sets}×${e.reps ?? ""}` : ""}{e.restSecs ? <Text style={s.woRest}>{e.sets ? "  " : ""}rest {e.restSecs}s</Text> : null}</Text>
                    </View>
                  ))
                )}
              </View>
            ))}
            <Prompt>Log every set in the dashboard workout logger — your training and your meals live in one place so the numbers actually connect.</Prompt>
            <Footer plan={data.planName} />
          </Page>
        </>
      )}

      {/* BACK COVER */}
      <Page size="A4" style={s.full}>
        <View style={s.topBar} /><View style={s.botBar} />
        <View style={s.centerInner}>
          <Text style={s.kicker}>NOW THE WORK BEGINS</Text>
          <Text style={s.title}>Cook it. Log it.{"\n"}Transform.</Text>
          <Text style={s.sub}>
            Tick off each meal in your FitFuel dashboard to build your streak, watch your macros land, and see your
            consistency score and weight trend move. The plan only works if you run it — start with Day 1, tomorrow morning.
          </Text>
          <View style={s.rule} />
          <Text style={[s.sub, { marginTop: 0 }]}>Track daily · fitfuel-eosin.vercel.app/dashboard</Text>
        </View>
        <Text style={s.foot}>FitFuel · Built in Pune · {tierLabel} Digital Plan</Text>
      </Page>
    </Document>
  );
}
