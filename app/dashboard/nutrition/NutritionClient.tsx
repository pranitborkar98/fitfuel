"use client";

// app/dashboard/nutrition/NutritionClient.tsx
// ─────────────────────────────────────────────
// Redesigned Phase 6 — matches FitFuel design system exactly:
//   bg #0a0a0a · card #111111 · border #1f1f1f · accent #84cc16
//   Barlow Condensed headings · lime glow · gradient accent lines
// ─────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Search, Plus, Trash2, X,
  Droplets, Target, ChevronDown, ChevronUp, Loader2,
  Check, Flame, Dumbbell, Wheat, Zap, ArrowLeft,
} from "lucide-react";

// ── Design tokens (matches site exactly) ────────────────────
const T = {
  bg:          "#0a0a0a",
  card:        "#111111",
  cardDeep:    "#0d0d0d",
  border:      "#1f1f1f",
  borderHover: "#3a3a3a",
  accent:      "#84cc16",
  accentLight: "#a3e635",
  accentBg:    "#1a2e05",
  accentBorder:"#365314",
  accentGlow:  "rgba(132,204,22,0.3)",
  text:        "#f9fafb",
  textSecond:  "#a3a3a3",
  textMuted:   "#737373",
  textGhost:   "#404040",
  red:         "#f87171",
  amber:       "#fbbf24",
  blue:        "#3b82f6",
  blueBg:      "rgba(59,130,246,0.12)",
  blueBorder:  "rgba(59,130,246,0.25)",
};

// ── Types ────────────────────────────────────────────────────
interface FoodItem {
  id: string; name: string; brand?: string | null; category?: string | null;
  per100Calories: number; per100Protein: number; per100Carbs: number;
  per100Fat: number; per100Fiber: number; isCustom: boolean;
}
interface MealType { id: string; name: string; emoji?: string | null; sortOrder: number; }
interface FoodEntry {
  id: string; foodItemId: string; mealTypeId: string; entryDate: string;
  quantity: number; calories: number; protein: number; carbs: number;
  fat: number; fiber: number; foodItem: FoodItem; mealType: MealType;
}
interface Goal { calories: number; protein: number; carbs: number; fat: number; waterMl: number; }
interface Props {
  initialEntries: FoodEntry[]; mealTypes: MealType[]; goal: Goal;
  initialWaterMl: number; userName: string;
}

// ── Helpers ──────────────────────────────────────────────────
function fmt(d: Date) { return d.toISOString().split("T")[0]; }

function displayDate(d: Date) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString())     return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function pct(val: number, goal: number) {
  return Math.min(100, goal > 0 ? (val / goal) * 100 : 0);
}

// ── Donut Ring ───────────────────────────────────────────────
function CalorieRing({ consumed, goal }: { consumed: number; goal: number }) {
  const r    = 58;
  const circ = 2 * Math.PI * r;
  const over = consumed > goal;
  const filled = (Math.min(consumed, goal) / (goal || 1)) * circ;
  const remaining = Math.abs(goal - consumed);

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 136 136" style={{ width: 136, height: 136, transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx="68" cy="68" r={r} fill="none" stroke="#1a1a1a" strokeWidth="11" />
        {/* Fill */}
        <circle
          cx="68" cy="68" r={r} fill="none"
          stroke={over ? T.red : T.accent}
          strokeWidth="11"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)",
            filter: over ? "none" : `drop-shadow(0 0 6px ${T.accentGlow})`,
          }}
        />
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 900, color: T.text, lineHeight: 1 }}>
          {Math.round(consumed)}
        </p>
        <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>of {goal} kcal</p>
        <p style={{ fontSize: 9, fontWeight: 700, marginTop: 2, color: over ? T.red : T.accentLight }}>
          {over ? `${Math.round(remaining)} OVER` : `${Math.round(remaining)} LEFT`}
        </p>
      </div>
    </div>
  );
}

// ── Macro Bar ────────────────────────────────────────────────
function MacroBar({ icon: Icon, label, consumed, goal, color }: {
  icon: React.ElementType; label: string; consumed: number; goal: number; color: string;
}) {
  const p = pct(consumed, goal);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon size={11} style={{ color }} />
          <span style={{ fontSize: 12, color: T.textMuted }}>{label}</span>
        </div>
        <span style={{ fontSize: 12, color: T.text, fontWeight: 700 }}>
          {Math.round(consumed)}<span style={{ color: T.textGhost, fontWeight: 400 }}>/{goal}g</span>
        </span>
      </div>
      <div style={{ height: 4, background: "#1a1a1a", borderRadius: 999, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${p}%`,
          backgroundColor: color, borderRadius: 999,
          transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
          boxShadow: p > 0 ? `0 0 6px ${color}55` : "none",
        }} />
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function NutritionClient({
  initialEntries, mealTypes, goal, initialWaterMl, userName,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  });
  const [entries,      setEntries]      = useState<FoodEntry[]>(initialEntries);
  const [waterMl,      setWaterMl]      = useState(initialWaterMl);
  const [loadingDiary, setLoadingDiary] = useState(false);
  const [currentGoal,  setCurrentGoal]  = useState<Goal>(goal);

  // Food search modal
  const [activeSlot,    setActiveSlot]    = useState<MealType | null>(null);
  const [searchQ,       setSearchQ]       = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [searching,     setSearching]     = useState(false);
  const [selectedFood,  setSelectedFood]  = useState<FoodItem | null>(null);
  const [quantity,      setQuantity]      = useState("100");
  const [logging,       setLogging]       = useState(false);

  // Goals modal
  const [showGoals,  setShowGoals]  = useState(false);
  const [goalDraft,  setGoalDraft]  = useState<Goal>(goal);
  const [savingGoals,setSavingGoals]= useState(false);
  const [goalsSaved, setGoalsSaved] = useState(false);

  // Collapsed slots
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isToday = fmt(selectedDate) === fmt(new Date());

  // ── Date navigation ──
  function goDay(delta: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d);
  }

  // ── Fetch diary on date change ──
  useEffect(() => {
    if (isToday) { setEntries(initialEntries); setWaterMl(initialWaterMl); return; }
    setLoadingDiary(true);
    const dateStr = fmt(selectedDate);
    Promise.all([
      fetch(`/api/nutrition/diary?date=${dateStr}`).then(r => r.json()),
      fetch(`/api/nutrition/water?date=${dateStr}`).then(r => r.json()),
    ])
      .then(([diary, water]) => { setEntries(diary.entries ?? []); setWaterMl(water.amountMl ?? 0); })
      .finally(() => setLoadingDiary(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // ── Totals ──
  const totals = entries.reduce(
    (acc, e) => ({ calories: acc.calories + e.calories, protein: acc.protein + e.protein, carbs: acc.carbs + e.carbs, fat: acc.fat + e.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // ── Search ──
  const doSearch = useCallback((q: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/nutrition/foods?q=${encodeURIComponent(q)}`);
        setSearchResults(await res.json());
      } finally { setSearching(false); }
    }, 280);
  }, []);

  useEffect(() => { doSearch(searchQ); }, [searchQ, doSearch]);

  useEffect(() => {
    if (!activeSlot) return;
    setSearching(true);
    fetch("/api/nutrition/foods?q=").then(r => r.json()).then(setSearchResults).finally(() => setSearching(false));
  }, [activeSlot]);

  // ── Log food ──
  async function logFood() {
    if (!selectedFood || !activeSlot || !quantity) return;
    setLogging(true);
    try {
      const res = await fetch("/api/nutrition/diary", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodItemId: selectedFood.id, mealTypeId: activeSlot.id, date: fmt(selectedDate), quantity: Number(quantity) }),
      });
      if (!res.ok) throw new Error();
      const entry: FoodEntry = await res.json();
      setEntries(prev => [...prev, entry]);
      setSelectedFood(null); setSearchQ(""); setSearchResults([]); setQuantity("100"); setActiveSlot(null);
    } finally { setLogging(false); }
  }

  // ── Delete entry ──
  async function deleteEntry(id: string) {
    await fetch(`/api/nutrition/diary/${id}`, { method: "DELETE" });
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  // ── Water ──
  const glassMl     = 250;
  const totalGlasses = Math.round(currentGoal.waterMl / glassMl);
  const filledGlasses = Math.floor(waterMl / glassMl);

  async function logWater(idx: number) {
    const target = (idx + 1) * glassMl;
    const action = waterMl >= target ? "subtract" : "add";
    const change = action === "add" ? target - waterMl : glassMl;
    const res = await fetch("/api/nutrition/water", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: fmt(selectedDate), amountMl: change, action }),
    });
    const data = await res.json();
    setWaterMl(data.amountMl ?? waterMl);
  }

  // ── Save goals ──
  async function saveGoals() {
    setSavingGoals(true);
    await fetch("/api/nutrition/goals", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goalDraft),
    });
    setSavingGoals(false); setGoalsSaved(true); setCurrentGoal(goalDraft);
    setTimeout(() => { setGoalsSaved(false); setShowGoals(false); }, 900);
  }

  // ── Preview macros ──
  const preview = selectedFood && quantity ? {
    calories: Math.round(selectedFood.per100Calories * Number(quantity) / 100 * 10) / 10,
    protein:  Math.round(selectedFood.per100Protein  * Number(quantity) / 100 * 10) / 10,
    carbs:    Math.round(selectedFood.per100Carbs    * Number(quantity) / 100 * 10) / 10,
    fat:      Math.round(selectedFood.per100Fat      * Number(quantity) / 100 * 10) / 10,
  } : null;

  const bySlot  = (id: string) => entries.filter(e => e.mealTypeId === id);
  const slotKcal = (id: string) => bySlot(id).reduce((a, e) => a + e.calories, 0);

  // ─────────────────────────────────────────────────────────
  // ── RENDER ───────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────
  return (
    <div style={{ background: T.bg, minHeight: "100vh", paddingTop: 88, paddingBottom: 96, color: T.text }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

        {/* ── Page header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Dashboard</p>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", lineHeight: 1 }}>
              Fuel <span style={{ color: T.accent }}>Log</span>
            </h1>
          </div>
          <button
            onClick={() => { setGoalDraft(currentGoal); setShowGoals(true); }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "transparent", border: `1px solid ${T.border}`,
              borderRadius: 8, padding: "9px 16px",
              fontSize: 13, fontWeight: 600, color: T.textMuted,
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
          >
            <Target size={14} /> Set Goals
          </button>
        </div>

        {/* ── Date navigator ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button
            onClick={() => goDay(-1)}
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: "transparent", border: `1px solid ${T.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.textMuted, cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
          >
            <ChevronLeft size={16} />
          </button>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{displayDate(selectedDate)}</p>
            <p style={{ fontSize: 12, color: T.textMuted }}>
              {selectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          <button
            onClick={() => goDay(1)}
            disabled={isToday}
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: "transparent", border: `1px solid ${T.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: isToday ? T.textGhost : T.textMuted,
              cursor: isToday ? "not-allowed" : "pointer",
              opacity: isToday ? 0.3 : 1, transition: "all 0.2s",
            }}
            onMouseEnter={e => { if (!isToday) { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.text; } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* ── Summary card ── */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 16, padding: "28px 32px", marginBottom: 16,
          position: "relative", overflow: "hidden",
        }}>
          {/* Lime top line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.accent}, transparent)` }} />

          <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
            <CalorieRing consumed={totals.calories} goal={currentGoal.calories} />

            <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 14 }}>
              <MacroBar icon={Dumbbell} label="Protein" consumed={totals.protein} goal={currentGoal.protein} color={T.accentLight} />
              <MacroBar icon={Wheat}   label="Carbs"   consumed={totals.carbs}   goal={currentGoal.carbs}   color={T.amber} />
              <MacroBar icon={Zap}     label="Fat"     consumed={totals.fat}     goal={currentGoal.fat}     color={T.red} />
            </div>
          </div>

          {/* Bottom strip */}
          <div style={{
            marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 12, color: T.textMuted }}>Daily progress</span>
            <span style={{
              fontSize: 13, fontWeight: 800,
              color: totals.calories > currentGoal.calories ? T.red : T.accentLight,
            }}>
              {totals.calories > currentGoal.calories
                ? `${Math.round(totals.calories - currentGoal.calories)} kcal over`
                : `${Math.round(currentGoal.calories - totals.calories)} kcal remaining`}
            </span>
          </div>
        </div>

        {/* ── Water card ── */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px 32px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: T.blueBg, border: `1px solid ${T.blueBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Droplets size={16} style={{ color: T.blue }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Water</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{waterMl}ml</span>
              <span style={{ fontSize: 12, color: T.textMuted }}> / {currentGoal.waterMl}ml</span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: "#1a1a1a", borderRadius: 999, overflow: "hidden", marginBottom: 14 }}>
            <div style={{
              height: "100%",
              width: `${Math.min(100, (waterMl / currentGoal.waterMl) * 100)}%`,
              background: T.blue, borderRadius: 999,
              transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
              boxShadow: `0 0 8px rgba(59,130,246,0.4)`,
            }} />
          </div>

          {/* Glass buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Array.from({ length: totalGlasses }).map((_, i) => {
              const filled = i < filledGlasses;
              return (
                <button
                  key={i}
                  onClick={() => logWater(i)}
                  style={{
                    width: 36, height: 36, borderRadius: 9,
                    border: `1px solid ${filled ? T.blueBorder : T.border}`,
                    background: filled ? T.blueBg : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: filled ? T.blue : T.textGhost,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (!filled) { e.currentTarget.style.borderColor = T.blueBorder; e.currentTarget.style.color = T.blue; } }}
                  onMouseLeave={e => { if (!filled) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textGhost; } }}
                >
                  <Droplets size={14} />
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: T.textGhost, marginTop: 10 }}>Tap to log 250ml · Tap filled to undo</p>
        </div>

        {/* ── Meal slots ── */}
        <p style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Today&apos;s Meals</p>

        {loadingDiary ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
            <Loader2 size={22} style={{ color: T.accent, animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mealTypes.map(mt => {
              const slotEntries = bySlot(mt.id);
              const kcal = slotKcal(mt.id);
              const isCollapsed = collapsed[mt.id];

              return (
                <div
                  key={mt.id}
                  style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}
                >
                  {/* Slot header */}
                  <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: 12 }}>
                    <button
                      style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
                      onClick={() => setCollapsed(c => ({ ...c, [mt.id]: !c[mt.id] }))}
                    >
                      <span style={{ fontSize: 18, lineHeight: 1 }}>{mt.emoji ?? "🍽️"}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{mt.name}</p>
                        {kcal > 0 && (
                          <p style={{ fontSize: 11, color: T.textMuted, display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                            <Flame size={9} style={{ color: "#f97316" }} />
                            {Math.round(kcal)} kcal · {slotEntries.length} item{slotEntries.length !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                      <span style={{ color: T.textGhost }}>
                        {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                      </span>
                    </button>

                    {/* Add food button */}
                    <button
                      onClick={() => { setActiveSlot(mt); setSearchQ(""); setSelectedFood(null); setQuantity("100"); }}
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: T.accentBg, border: `1px solid ${T.accentBorder}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: T.accent, cursor: "pointer", transition: "all 0.15s",
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(132,204,22,0.2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = T.accentBg; }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Entries */}
                  {!isCollapsed && (
                    <>
                      {slotEntries.length > 0 ? (
                        <div style={{ borderTop: `1px solid ${T.border}` }}>
                          {slotEntries.map((e, idx) => (
                            <div
                              key={e.id}
                              style={{
                                display: "flex", alignItems: "center", padding: "12px 20px", gap: 12,
                                borderTop: idx > 0 ? `1px solid #161616` : "none",
                              }}
                              className="ff-entry-row"
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {e.foodItem.name}
                                </p>
                                <p style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                                  {e.quantity}g · {Math.round(e.calories)} kcal ·{" "}
                                  P{Math.round(e.protein)}g C{Math.round(e.carbs)}g F{Math.round(e.fat)}g
                                </p>
                              </div>
                              <button
                                onClick={() => deleteEntry(e.id)}
                                style={{
                                  width: 28, height: 28, borderRadius: 7,
                                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: T.red, cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
                                  opacity: 0,
                                }}
                                className="ff-delete-btn"
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.18)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ borderTop: `1px solid ${T.border}`, padding: "12px 20px" }}>
                          <p style={{ fontSize: 12, color: T.textGhost, fontStyle: "italic" }}>Nothing logged yet</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Food Search Modal (full screen) ── */}
      {activeSlot && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: T.bg, display: "flex", flexDirection: "column" }}>

          {/* Modal top bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "16px 24px", borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
          }}>
            <button
              onClick={() => { setActiveSlot(null); setSelectedFood(null); setSearchQ(""); }}
              style={{
                width: 36, height: 36, borderRadius: 9,
                background: "transparent", border: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: T.textMuted, cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.text; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
            >
              <ArrowLeft size={15} />
            </button>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                {activeSlot.emoji} {activeSlot.name}
              </p>
              <p style={{ fontSize: 11, color: T.textMuted }}>{displayDate(selectedDate)}</p>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMuted }} />
              <input
                autoFocus
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search food (e.g. rice, dal, paneer, egg…)"
                style={{
                  width: "100%", background: T.card, border: `1px solid ${T.border}`,
                  borderRadius: 10, paddingLeft: 42, paddingRight: 42,
                  paddingTop: 11, paddingBottom: 11,
                  fontSize: 14, color: T.text, outline: "none",
                  transition: "border-color 0.2s", boxSizing: "border-box",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = T.accentBorder; }}
                onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
              />
              {searching && (
                <Loader2 size={14} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: T.textMuted, animation: "spin 1s linear infinite" }} />
              )}
            </div>
          </div>

          {/* Selected food panel */}
          {selectedFood && (
            <div style={{
              padding: "16px 24px", borderBottom: `1px solid ${T.border}`,
              background: "#0d0d0d", flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{selectedFood.name}</p>
                  {selectedFood.brand && <p style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{selectedFood.brand}</p>}
                </div>
                <button
                  onClick={() => setSelectedFood(null)}
                  style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", padding: 4 }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Qty row */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: T.textMuted, display: "block", marginBottom: 6 }}>Quantity (grams)</label>
                  <input
                    type="number" min="1" max="5000"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    style={{
                      width: "100%", background: T.bg, border: `1px solid ${T.border}`,
                      borderRadius: 8, padding: "10px 14px",
                      fontSize: 14, fontWeight: 700, color: T.text, outline: "none",
                      transition: "border-color 0.2s", boxSizing: "border-box",
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = T.accentBorder; }}
                    onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
                  />
                </div>
                <div style={{ display: "flex", gap: 6, paddingBottom: 2 }}>
                  {[50, 100, 150, 200].map(q => (
                    <button
                      key={q}
                      onClick={() => setQuantity(String(q))}
                      style={{
                        padding: "10px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                        cursor: "pointer", transition: "all 0.15s",
                        background: quantity === String(q) ? T.accent : "transparent",
                        color: quantity === String(q) ? "#000" : T.textMuted,
                        border: `1px solid ${quantity === String(q) ? T.accent : T.border}`,
                      }}
                    >
                      {q}g
                    </button>
                  ))}
                </div>
              </div>

              {/* Macro preview */}
              {preview && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
                  {[
                    { label: "kcal",    value: preview.calories, color: T.accentLight },
                    { label: "Protein", value: preview.protein,  color: T.accentLight },
                    { label: "Carbs",   value: preview.carbs,    color: T.amber },
                    { label: "Fat",     value: preview.fat,      color: T.red },
                  ].map(m => (
                    <div key={m.label} style={{
                      background: T.bg, border: `1px solid ${T.border}`,
                      borderRadius: 8, padding: "10px 8px", textAlign: "center",
                    }}>
                      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, color: m.color, lineHeight: 1 }}>{m.value}</p>
                      <p style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>{m.label}</p>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={logFood}
                disabled={logging || !quantity || Number(quantity) <= 0}
                style={{
                  width: "100%", padding: "13px", borderRadius: 10,
                  background: T.accent, color: "#000",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 16, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em",
                  border: "none", cursor: logging ? "not-allowed" : "pointer",
                  opacity: logging || !quantity || Number(quantity) <= 0 ? 0.5 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.2s", boxSizing: "border-box",
                  boxShadow: `0 2px 16px ${T.accentGlow}`,
                }}
                onMouseEnter={e => { if (!logging) e.currentTarget.style.background = T.accentLight; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.accent; }}
              >
                {logging ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={16} />}
                {logging ? "Logging…" : `Add to ${activeSlot.name}`}
              </button>
            </div>
          )}

          {/* Results */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {!searching && searchQ && searchResults.length === 0 && (
              <p style={{ textAlign: "center", color: T.textMuted, fontSize: 13, padding: "48px 24px" }}>
                No foods found for &quot;{searchQ}&quot;
              </p>
            )}
            {!searchQ && (
              <p style={{ fontSize: 11, color: T.textGhost, textAlign: "center", padding: "14px 0 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Popular Foods
              </p>
            )}
            <div>
              {searchResults.map((food, idx) => {
                const isSelected = selectedFood?.id === food.id;
                return (
                  <button
                    key={food.id}
                    onClick={() => { setSelectedFood(food); setQuantity("100"); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 24px", textAlign: "left",
                      background: isSelected ? "#111111" : "transparent",
                      borderLeft: isSelected ? `2px solid ${T.accent}` : "2px solid transparent",
                      borderTop: idx > 0 ? `1px solid #161616` : "none",
                      borderRight: "none", borderBottom: "none",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#0d0d0d"; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {food.name}
                        </p>
                        {food.isCustom && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, color: T.accent,
                            background: T.accentBg, border: `1px solid ${T.accentBorder}`,
                            borderRadius: 4, padding: "2px 6px", flexShrink: 0, textTransform: "uppercase",
                          }}>
                            Custom
                          </span>
                        )}
                      </div>
                      {food.brand && <p style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{food.brand}</p>}
                      <p style={{ fontSize: 11, color: T.textGhost, marginTop: 1 }}>per 100g</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, fontWeight: 900, color: T.accent }}>
                        {Math.round(food.per100Calories)} kcal
                      </p>
                      <p style={{ fontSize: 10, color: T.textMuted }}>
                        P{food.per100Protein}g C{food.per100Carbs}g F{food.per100Fat}g
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Goals Modal (bottom sheet) ── */}
      {showGoals && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end" }}
          onClick={() => setShowGoals(false)}
        >
          {/* Backdrop */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />

          <div
            style={{
              position: "relative", width: "100%", maxWidth: 560, margin: "0 auto",
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: "20px 20px 0 0", padding: "24px 28px 36px",
              boxShadow: "0 -24px 60px rgba(0,0,0,0.5)",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ width: 40, height: 4, borderRadius: 999, background: T.border, margin: "0 auto 20px" }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em" }}>
                Daily <span style={{ color: T.accent }}>Targets</span>
              </h2>
              <button
                onClick={() => setShowGoals(false)}
                style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {[
                { key: "calories", label: "Calories",  unit: "kcal", min: 500,  max: 5000 },
                { key: "protein",  label: "Protein",   unit: "g",    min: 10,   max: 400  },
                { key: "carbs",    label: "Carbs",     unit: "g",    min: 10,   max: 800  },
                { key: "fat",      label: "Fat",       unit: "g",    min: 5,    max: 300  },
                { key: "waterMl",  label: "Water",     unit: "ml",   min: 500,  max: 6000 },
              ].map(({ key, label, unit, min, max }) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label style={{ fontSize: 13, color: T.textSecond, width: 80, flexShrink: 0 }}>
                    {label}
                  </label>
                  <div style={{ flex: 1, position: "relative" }}>
                    <input
                      type="number" min={min} max={max}
                      value={(goalDraft as unknown as Record<string, number>)[key]}
                      onChange={e => setGoalDraft(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                      style={{
                        width: "100%", background: T.bg, border: `1px solid ${T.border}`,
                        borderRadius: 8, padding: "10px 40px 10px 14px",
                        fontSize: 14, fontWeight: 700, color: T.text,
                        outline: "none", textAlign: "right", boxSizing: "border-box",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = T.accentBorder; }}
                      onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
                    />
                    <span style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      fontSize: 11, color: T.textMuted, pointerEvents: "none",
                    }}>
                      {unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={saveGoals}
              disabled={savingGoals}
              style={{
                width: "100%", padding: "14px",
                background: T.accent, color: "#000",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 16, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em",
                border: "none", borderRadius: 10, cursor: savingGoals ? "not-allowed" : "pointer",
                opacity: savingGoals ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: `0 2px 16px ${T.accentGlow}`, transition: "all 0.2s",
              }}
              onMouseEnter={e => { if (!savingGoals) e.currentTarget.style.background = T.accentLight; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.accent; }}
            >
              {savingGoals ? (
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              ) : goalsSaved ? (
                <Check size={16} />
              ) : (
                <Check size={16} />
              )}
              {savingGoals ? "Saving…" : goalsSaved ? "Saved!" : "Save Goals"}
            </button>
          </div>
        </div>
      )}

      {/* ── Hover-reveal delete + spin animation ── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .ff-entry-row:hover .ff-delete-btn {
          opacity: 1 !important;
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
      `}</style>
    </div>
  );
}