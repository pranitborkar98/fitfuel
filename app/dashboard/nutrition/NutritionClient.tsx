"use client";

// app/dashboard/nutrition/NutritionClient.tsx — Phase 6 v4.1
// SparkyFitness-aligned + FULLY MOBILE RESPONSIVE

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Search, Plus, Trash2, X,
  Droplets, Target, Loader2, Check, Flame, Dumbbell,
  Wheat, Zap, ArrowLeft, ChevronDown, ChevronUp,
  Pencil, Leaf, Minus,
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────
const T = {
  bg:           "#0a0a0a",
  card:         "#111111",
  cardDeep:     "#0d0d0d",
  border:       "#1f1f1f",
  borderMid:    "#2a2a2a",
  borderHover:  "#3a3a3a",
  accent:       "#84cc16",
  accentLight:  "#a3e635",
  accentBg:     "#1a2e05",
  accentBorder: "#365314",
  accentGlow:   "rgba(132,204,22,0.18)",
  text:         "#f9fafb",
  textSecond:   "#a3a3a3",
  textMuted:    "#737373",
  textGhost:    "#525252",
  red:          "#f87171",
  redBg:        "rgba(248,113,113,0.08)",
  amber:        "#fbbf24",
  amberBg:      "rgba(251,191,36,0.08)",
  blue:         "#60a5fa",
  blueBg:       "rgba(96,165,250,0.08)",
  blueBorder:   "rgba(96,165,250,0.3)",
  green:        "#4ade80",
  greenBg:      "rgba(74,222,128,0.08)",
  greenBorder:  "rgba(74,222,128,0.3)",
};

// ── Types ─────────────────────────────────────────────────────
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
interface Goal { calories: number; protein: number; carbs: number; fat: number; fiber: number; waterMl: number; }
interface Props {
  initialEntries: FoodEntry[]; mealTypes: MealType[]; goal: Goal;
  initialWaterMl: number; userName: string;
}

// ── Helpers ───────────────────────────────────────────────────
function fmt(d: Date) { return d.toISOString().split("T")[0]; }
function displayDate(d: Date) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }
function pct(v: number, g: number) { return clamp(g > 0 ? (v / g) * 100 : 0, 0, 100); }

// ── Big Hero Donut Ring ───────────────────────────────────────
function CalorieRing({ consumed, goal }: { consumed: number; goal: number }) {
  const r    = 80;
  const circ = 2 * Math.PI * r;
  const over = consumed > goal;
  const filled = clamp(consumed / (goal || 1), 0, 1) * circ;
  const ringColor = over ? T.red : T.accent;

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg viewBox="0 0 184 184" style={{ width: 160, height: 160, transform: "rotate(-90deg)" }}>
        <circle cx="92" cy="92" r="90" fill="none" stroke="#181818" strokeWidth="0.75" />
        <circle cx="92" cy="92" r={r} fill="none" stroke="#1c1c1c" strokeWidth="14" />
        <circle
          cx="92" cy="92" r={r} fill="none"
          stroke={ringColor} strokeWidth="14"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1), stroke 0.3s" }}
        />
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <p style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 44, fontWeight: 900, color: T.text, lineHeight: 1, letterSpacing: "-0.03em",
        }}>
          {Math.round(consumed)}
        </p>
        <p style={{ fontSize: 11, color: T.textMuted, marginTop: 3 }}>of {goal} kcal</p>
        <div style={{
          marginTop: 6, display: "inline-flex", alignItems: "center",
          background: over ? T.redBg : T.accentBg,
          border: `1px solid ${over ? "rgba(248,113,113,0.2)" : T.accentBorder}`,
          borderRadius: 999, padding: "3px 10px",
        }}>
          <span style={{ fontSize: 10, fontWeight: 900, color: over ? T.red : T.accentLight, letterSpacing: "0.04em" }}>
            {over ? `+${Math.round(consumed - goal)} OVER` : `${Math.round(goal - consumed)} LEFT`}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Macro Stat Card ───────────────────────────────────────────
function MacroCard({ icon: Icon, label, consumed, goal, color, bg, unit = "g" }: {
  icon: React.ElementType; label: string; consumed: number; goal: number; color: string; bg: string; unit?: string;
}) {
  const p = pct(consumed, goal);
  return (
    <div style={{ background: "#0e0e0e", border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: bg, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={12} style={{ color }} />
        </div>
        <span style={{ fontSize: 9, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 8 }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900, color: T.text, lineHeight: 1 }}>
          {Math.round(consumed)}
        </span>
        <span style={{ fontSize: 11, color: T.textGhost }}>/{goal}{unit}</span>
      </div>
      <div style={{ height: 4, background: "#1c1c1c", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${p}%`, background: color, borderRadius: 999, transition: "width 0.7s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

// ── Meal Subtotal Row ─────────────────────────────────────────
function MealSubtotal({ kcal, protein, carbs, fat, fiber }: { kcal: number; protein: number; carbs: number; fat: number; fiber: number }) {
  return (
    <div style={{ borderTop: `1px solid ${T.border}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0a0a", flexWrap: "wrap", gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Total:</span>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <span style={{ fontSize: 12, color: T.text, fontWeight: 700 }}>{Math.round(kcal)}<span style={{ fontSize: 10, color: T.textMuted, fontWeight: 400 }}> kcal</span></span>
        <span style={{ fontSize: 12, color: T.accentLight, fontWeight: 700 }}>{Math.round(protein)}<span style={{ fontSize: 10, color: T.textMuted, fontWeight: 400 }}>g protein</span></span>
        <span style={{ fontSize: 12, color: T.amber, fontWeight: 700 }}>{Math.round(carbs)}<span style={{ fontSize: 10, color: T.textMuted, fontWeight: 400 }}>g carbs</span></span>
        <span style={{ fontSize: 12, color: T.red, fontWeight: 700 }}>{Math.round(fat)}<span style={{ fontSize: 10, color: T.textMuted, fontWeight: 400 }}>g fat</span></span>
        <span style={{ fontSize: 12, color: T.green, fontWeight: 700 }}>{Math.round(fiber)}<span style={{ fontSize: 10, color: T.textMuted, fontWeight: 400 }}>g fiber</span></span>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function NutritionClient({ initialEntries, mealTypes, goal, initialWaterMl, userName }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => { const d = new Date(); d.setHours(0,0,0,0); return d; });
  const [entries,      setEntries]      = useState<FoodEntry[]>(initialEntries);
  const [waterMl,      setWaterMl]      = useState(initialWaterMl);
  const [loadingDiary, setLoadingDiary] = useState(false);
  const [currentGoal,  setCurrentGoal]  = useState<Goal>(goal);

  const [activeSlot,    setActiveSlot]    = useState<MealType | null>(null);
  const [searchQ,       setSearchQ]       = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [searching,     setSearching]     = useState(false);
  const [selectedFood,  setSelectedFood]  = useState<FoodItem | null>(null);
  const [quantity,      setQuantity]      = useState("100");
  const [logging,       setLogging]       = useState(false);

  const [showGoals,  setShowGoals]  = useState(false);
  const [goalDraft,  setGoalDraft]  = useState<Goal>(goal);
  const [savingGoals,setSavingGoals]= useState(false);
  const [goalsSaved, setGoalsSaved] = useState(false);
  const [collapsed,  setCollapsed]  = useState<Record<string, boolean>>({});

  // Edit entry state
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState("");

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isToday = fmt(selectedDate) === fmt(new Date());

  function goDay(delta: number) { const d = new Date(selectedDate); d.setDate(d.getDate() + delta); setSelectedDate(d); }

  useEffect(() => {
    if (isToday) { setEntries(initialEntries); setWaterMl(initialWaterMl); return; }
    setLoadingDiary(true);
    const ds = fmt(selectedDate);
    Promise.all([
      fetch(`/api/nutrition/diary?date=${ds}`).then(r => r.json()),
      fetch(`/api/nutrition/water?date=${ds}`).then(r => r.json()),
    ]).then(([diary, water]) => { setEntries(diary.entries ?? []); setWaterMl(water.amountMl ?? 0); })
      .finally(() => setLoadingDiary(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const totals = entries.reduce(
    (a, e) => ({ calories: a.calories + e.calories, protein: a.protein + e.protein, carbs: a.carbs + e.carbs, fat: a.fat + e.fat, fiber: a.fiber + e.fiber }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const doSearch = useCallback((q: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try { setSearchResults(await (await fetch(`/api/nutrition/foods?q=${encodeURIComponent(q)}`)).json()); }
      finally { setSearching(false); }
    }, 280);
  }, []);

  useEffect(() => { doSearch(searchQ); }, [searchQ, doSearch]);
  useEffect(() => {
    if (!activeSlot) return;
    setSearching(true);
    fetch("/api/nutrition/foods?q=").then(r => r.json()).then(setSearchResults).finally(() => setSearching(false));
  }, [activeSlot]);

  async function logFood() {
    if (!selectedFood || !activeSlot || !quantity) return;
    setLogging(true);
    try {
      const res = await fetch("/api/nutrition/diary", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodItemId: selectedFood.id, mealTypeId: activeSlot.id, date: fmt(selectedDate), quantity: Number(quantity) }),
      });
      if (!res.ok) throw new Error();
      const newEntry = await res.json();
      setEntries(p => [...p, newEntry]);
      setSelectedFood(null); setSearchQ(""); setSearchResults([]); setQuantity("100"); setActiveSlot(null);
    } finally { setLogging(false); }
  }

  async function deleteEntry(id: string) {
    await fetch(`/api/nutrition/diary/${id}`, { method: "DELETE" });
    setEntries(p => p.filter(e => e.id !== id));
  }

  async function updateEntry(id: string, newQty: number) {
    const res = await fetch(`/api/nutrition/diary/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty }),
    });
    if (!res.ok) throw new Error();
    const updated = await res.json();
    setEntries(p => p.map(e => e.id === id ? updated : e));
    setEditingEntry(null);
  }

  const glassMl       = 250;
  const totalGlasses  = Math.round(currentGoal.waterMl / glassMl);
  const filledGlasses = Math.floor(waterMl / glassMl);

  async function logWater(idx: number) {
    const target = (idx + 1) * glassMl;
    const action = waterMl >= target ? "subtract" : "add";
    const change = action === "add" ? target - waterMl : glassMl;
    const res = await fetch("/api/nutrition/water", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: fmt(selectedDate), amountMl: change, action }),
    });
    setWaterMl((await res.json()).amountMl ?? waterMl);
  }

  async function adjustWater(delta: number) {
    const action = delta > 0 ? "add" : "subtract";
    const res = await fetch("/api/nutrition/water", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: fmt(selectedDate), amountMl: Math.abs(delta), action }),
    });
    setWaterMl((await res.json()).amountMl ?? waterMl);
  }

  async function saveGoals() {
    setSavingGoals(true);
    await fetch("/api/nutrition/goals", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goalDraft),
    });
    setSavingGoals(false); setGoalsSaved(true); setCurrentGoal(goalDraft);
    setTimeout(() => { setGoalsSaved(false); setShowGoals(false); }, 900);
  }

  const preview = selectedFood && quantity ? {
    calories: Math.round(selectedFood.per100Calories * Number(quantity) / 100 * 10) / 10,
    protein:  Math.round(selectedFood.per100Protein  * Number(quantity) / 100 * 10) / 10,
    carbs:    Math.round(selectedFood.per100Carbs    * Number(quantity) / 100 * 10) / 10,
    fat:      Math.round(selectedFood.per100Fat      * Number(quantity) / 100 * 10) / 10,
    fiber:    Math.round(selectedFood.per100Fiber    * Number(quantity) / 100 * 10) / 10,
  } : null;

  const bySlot   = (id: string) => entries.filter(e => e.mealTypeId === id);
  const slotTotals = (id: string) => {
    const items = bySlot(id);
    return items.reduce((a, e) => ({
      kcal: a.kcal + e.calories, protein: a.protein + e.protein,
      carbs: a.carbs + e.carbs, fat: a.fat + e.fat, fiber: a.fiber + e.fiber,
    }), { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  };
  const slotKcal = (id: string) => slotTotals(id).kcal;

  const calPct = pct(totals.calories, currentGoal.calories);

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div style={{ background: T.bg, minHeight: "100vh", paddingTop: 88, paddingBottom: 100, color: T.text }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Dashboard</p>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1 }}>
              Fuel <span style={{ color: T.accent }}>Log</span>
            </h1>
          </div>
          <button
            onClick={() => { setGoalDraft(currentGoal); setShowGoals(true); }}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, color: T.textMuted, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
          >
            <Target size={14} /> Set Goals
          </button>
        </div>

        {/* Date navigator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          {([-1, 1] as const).map(delta => {
            const disabled = delta === 1 && isToday;
            return (
              <button key={delta} onClick={() => !disabled && goDay(delta)}
                style={{ width: 40, height: 40, borderRadius: 10, background: "transparent", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: disabled ? T.textGhost : T.textMuted, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.25 : 1, transition: "all 0.2s" }}
                onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.text; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
              >
                {delta === -1 ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}
              </button>
            );
          })}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: "0.01em" }}>{displayDate(selectedDate)}</p>
            <p style={{ fontSize: 12, color: T.textMuted }}>{selectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>

        {/* ── DASHBOARD GRID ── */}
        {/* Desktop: 3 columns | Tablet: 2 columns | Mobile: 1 column */}
        <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 24, alignItems: "start" }}>
          
          {/* LEFT: Calorie Ring + Energy */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "24px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 16 }}>Daily Energy Goal</p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <CalorieRing consumed={totals.calories} goal={currentGoal.calories} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, color: T.accentLight }}>{Math.round(totals.calories)}</p>
                  <p style={{ fontSize: 10, color: T.textMuted }}>eaten kcal</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, color: T.red }}>0</p>
                  <p style={{ fontSize: 10, color: T.textMuted }}>burned kcal</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, color: T.text }}>{currentGoal.calories}</p>
                  <p style={{ fontSize: 10, color: T.textMuted }}>goal kcal</p>
                </div>
              </div>
              {/* Daily Progress Bar */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: T.textMuted }}>Daily Progress</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{Math.round(calPct)}%</span>
                </div>
                <div style={{ height: 6, background: "#1c1c1c", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${calPct}%`, background: calPct > 100 ? T.red : T.accent, borderRadius: 999, transition: "width 0.7s cubic-bezier(.4,0,.2,1)" }} />
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: Nutrition Summary + Trends */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "24px", position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Nutrition Summary</p>
                <button
                  onClick={() => { setGoalDraft(currentGoal); setShowGoals(true); }}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: T.textMuted, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.text; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
                >
                  <Target size={12} /> Edit Goals
                </button>
              </div>
              
              {/* 5 Macro Cards - Responsive: 5 on desktop, 3 on tablet, 2 on mobile */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 8, marginBottom: 20 }}>
                <MacroCard icon={Flame} label="Calories" consumed={totals.calories} goal={currentGoal.calories} color={T.accentLight} bg={T.accentBg} unit="kcal" />
                <MacroCard icon={Dumbbell} label="Protein" consumed={totals.protein} goal={currentGoal.protein} color={T.accentLight} bg={T.accentBg} />
                <MacroCard icon={Wheat} label="Carbs" consumed={totals.carbs} goal={currentGoal.carbs} color={T.amber} bg={T.amberBg} />
                <MacroCard icon={Zap} label="Fat" consumed={totals.fat} goal={currentGoal.fat} color={T.red} bg={T.redBg} />
                <MacroCard icon={Leaf} label="Fiber" consumed={totals.fiber} goal={currentGoal.fiber} color={T.green} bg={T.greenBg} />
              </div>

              {/* 14-Day Trends Placeholder */}
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
                <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>14-Day Nutrition Trends</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Calories (kcal)", color: T.accentLight, value: Math.round(totals.calories), goal: currentGoal.calories },
                    { label: "Protein", color: T.accentLight, value: Math.round(totals.protein), goal: currentGoal.protein },
                    { label: "Carbs", color: T.amber, value: Math.round(totals.carbs), goal: currentGoal.carbs },
                    { label: "Fat", color: T.red, value: Math.round(totals.fat), goal: currentGoal.fat },
                    { label: "Fiber", color: T.green, value: Math.round(totals.fiber), goal: currentGoal.fiber },
                  ].map(trend => (
                    <div key={trend.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: T.textMuted }}>{trend.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: trend.color }}>{trend.value}<span style={{ color: T.textMuted, fontWeight: 400 }}> / {trend.goal}</span></span>
                      </div>
                      <div style={{ height: 3, background: "#1c1c1c", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct(trend.value, trend.goal)}%`, background: trend.color, borderRadius: 999, opacity: 0.6 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Water Intake */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "24px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Droplets size={18} style={{ color: T.blue }} />
                <p style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Water Intake</p>
              </div>
              
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: T.blue, lineHeight: 1 }}>
                  {waterMl}<span style={{ fontSize: 14, fontWeight: 400, color: T.textMuted }}> / {currentGoal.waterMl}</span>
                </p>
                <p style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>ml</p>
              </div>

              {/* Water % + Quick buttons */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                <button onClick={() => adjustWater(-250)}
                  style={{ width: 36, height: 36, borderRadius: 8, background: T.cardDeep, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, cursor: "pointer" }}
                >
                  <Minus size={14} />
                </button>
                <div style={{ textAlign: "center", minWidth: 60 }}>
                  <p style={{ fontSize: 20, fontWeight: 900, color: T.blue }}>{Math.round((waterMl / currentGoal.waterMl) * 100)}%</p>
                </div>
                <button onClick={() => adjustWater(250)}
                  style={{ width: 36, height: 36, borderRadius: 8, background: T.blueBg, border: `1px solid ${T.blueBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.blue, cursor: "pointer" }}
                >
                  <Plus size={14} />
                </button>
              </div>
              <p style={{ fontSize: 10, color: T.textGhost, textAlign: "center", marginBottom: 12 }}>250 ml per drink</p>

              {/* Thick progress bar */}
              <div style={{ height: 8, background: "#181818", borderRadius: 999, overflow: "hidden", marginBottom: 16 }}>
                <div style={{ height: "100%", width: `${Math.min(100, (waterMl / currentGoal.waterMl) * 100)}%`, background: `linear-gradient(90deg, ${T.blue}, #93c5fd)`, borderRadius: 999, transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} />
              </div>

              {/* Glass buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                {Array.from({ length: totalGlasses }).map((_, i) => {
                  const filled = i < filledGlasses;
                  return (
                    <button key={i} onClick={() => logWater(i)} title={`${(i + 1) * glassMl}ml`}
                      style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${filled ? T.blueBorder : T.border}`, background: filled ? T.blueBg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: filled ? T.blue : T.textGhost, cursor: "pointer", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.blueBorder; e.currentTarget.style.color = T.blue; e.currentTarget.style.background = T.blueBg; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = filled ? T.blueBorder : T.border; e.currentTarget.style.color = filled ? T.blue : T.textGhost; e.currentTarget.style.background = filled ? T.blueBg : "transparent"; }}
                    >
                      <Droplets size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── MEAL SLOTS ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 3, height: 18, borderRadius: 999, background: T.accent }} />
          <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Today&apos;s Meals</p>
        </div>

        {loadingDiary ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
            <Loader2 size={24} style={{ color: T.accent, animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mealTypes.map(mt => {
              const slotEntries = bySlot(mt.id);
              const st = slotTotals(mt.id);
              const kcal = st.kcal;
              const isCollapsed = collapsed[mt.id];
              const hasFood = slotEntries.length > 0;

              return (
                <div key={mt.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", padding: "16px 18px", gap: 12 }}>
                    <button
                      style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
                      onClick={() => setCollapsed(c => ({ ...c, [mt.id]: !c[mt.id] }))}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 11, background: "#161616", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                        {mt.emoji ?? "🍽️"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <p style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{mt.name}</p>
                          {hasFood && (
                            <span style={{ fontSize: 12, color: T.textMuted }}>
                              {Math.round(kcal)} / {Math.round(currentGoal.calories * 0.25)} kcal
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: T.textMuted, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                          {hasFood ? (
                            <>
                              <Flame size={10} style={{ color: "#f97316" }} />
                              <span style={{ color: T.accentLight, fontWeight: 700 }}>{Math.round(kcal)} kcal</span>
                              <span style={{ color: T.textGhost }}>·</span>
                              <span>{slotEntries.length} item{slotEntries.length !== 1 ? "s" : ""}</span>
                            </>
                          ) : "Nothing logged yet"}
                        </p>
                      </div>
                      <span style={{ color: T.textMuted, flexShrink: 0 }}>
                        {isCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                      </span>
                    </button>

                    <button
                      onClick={() => { setActiveSlot(mt); setSearchQ(""); setSelectedFood(null); setQuantity("100"); }}
                      style={{ width: 36, height: 36, borderRadius: 9, background: T.accentBg, border: `1px solid ${T.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, cursor: "pointer", transition: "all 0.15s", flexShrink: 0 }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(132,204,22,0.2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = T.accentBg; }}
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {/* Entries */}
                  {!isCollapsed && hasFood && (
                    <div style={{ borderTop: `1px solid ${T.border}` }}>
                      {slotEntries.map((e, idx) => (
                        <div key={e.id} className="ff-entry-row"
                          style={{ display: "flex", alignItems: "center", padding: "12px 18px", gap: 10, borderTop: idx > 0 ? "1px solid #161616" : "none", flexWrap: "wrap" }}
                        >
                          <div style={{ width: 6, height: 6, borderRadius: 999, background: T.accentBg, border: `1px solid ${T.accentBorder}`, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <p style={{ fontSize: 14, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.foodItem.name}</p>
                              {e.foodItem.brand && <span style={{ fontSize: 10, color: T.textMuted, flexShrink: 0 }}>{e.foodItem.brand}</span>}
                            </div>
                            <p style={{ fontSize: 11, color: T.textMuted, marginTop: 2, display: "flex", flexWrap: "wrap", gap: "0 8px" }}>
                              <span>{e.quantity}g</span>
                              <span style={{ color: T.accentLight, fontWeight: 700 }}>{Math.round(e.calories)} kcal</span>
                              <span style={{ color: T.accentLight }}>{Math.round(e.protein)}g protein</span>
                              <span style={{ color: T.amber }}>{Math.round(e.carbs)}g carbs</span>
                              <span style={{ color: T.red }}>{Math.round(e.fat)}g fat</span>
                              <span style={{ color: T.green }}>{Math.round(e.fiber)}g fiber</span>
                            </p>
                          </div>
                          
                          {/* Edit + Delete buttons */}
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                            {editingEntry === e.id ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input
                                  type="number"
                                  value={editQuantity}
                                  onChange={ev => setEditQuantity(ev.target.value)}
                                  style={{ width: 60, background: T.bg, border: `1px solid ${T.accentBorder}`, borderRadius: 6, padding: "6px 8px", fontSize: 13, fontWeight: 700, color: T.text, outline: "none", textAlign: "right" }}
                                  autoFocus
                                  onKeyDown={ev => {
                                    if (ev.key === "Enter") updateEntry(e.id, Number(editQuantity));
                                    if (ev.key === "Escape") setEditingEntry(null);
                                  }}
                                />
                                <button onClick={() => updateEntry(e.id, Number(editQuantity))}
                                  style={{ width: 28, height: 28, borderRadius: 6, background: T.accentBg, border: `1px solid ${T.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, cursor: "pointer" }}
                                >
                                  <Check size={12} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <button className="ff-edit-btn" onClick={() => { setEditingEntry(e.id); setEditQuantity(String(e.quantity)); }}
                                  style={{ width: 30, height: 30, borderRadius: 8, background: "transparent", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, cursor: "pointer", transition: "all 0.15s", opacity: 0 }}
                                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.text; }}
                                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
                                >
                                  <Pencil size={13} />
                                </button>
                                <button className="ff-delete-btn" onClick={() => deleteEntry(e.id)}
                                  style={{ width: 30, height: 30, borderRadius: 8, background: T.redBg, border: "1px solid rgba(248,113,113,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: T.red, cursor: "pointer", transition: "all 0.15s", opacity: 0 }}
                                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.18)"; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = T.redBg; }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Meal Subtotal */}
                      <MealSubtotal kcal={st.kcal} protein={st.protein} carbs={st.carbs} fat={st.fat} fiber={st.fiber} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FOOD SEARCH MODAL ── */}
      {activeSlot && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: T.bg, display: "flex", flexDirection: "column" }}>
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 24px", borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: T.card }}>
            <button onClick={() => { setActiveSlot(null); setSelectedFood(null); setSearchQ(""); }}
              style={{ width: 40, height: 40, borderRadius: 10, background: "transparent", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.text; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
            >
              <ArrowLeft size={17} />
            </button>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{activeSlot.emoji} Add to {activeSlot.name}</p>
              <p style={{ fontSize: 11, color: T.textMuted }}>{displayDate(selectedDate)}</p>
            </div>
          </div>

          {/* Search */}
          <div style={{ padding: "14px 24px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMuted }} />
              <input autoFocus value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search food (rice, dal, paneer, egg, chicken…)"
                style={{ width: "100%", background: "#161616", border: `1px solid ${T.border}`, borderRadius: 10, paddingLeft: 44, paddingRight: 44, paddingTop: 12, paddingBottom: 12, fontSize: 15, color: T.text, outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
                onFocus={e => { e.currentTarget.style.borderColor = T.accentBorder; }}
                onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
              />
              {searching && <Loader2 size={15} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: T.textMuted, animation: "spin 1s linear infinite" }} />}
            </div>
          </div>

          {/* Selected food panel */}
          {selectedFood && (
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, background: "#0d0d0d", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{selectedFood.name}</p>
                  {selectedFood.brand && <p style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{selectedFood.brand}</p>}
                </div>
                <button onClick={() => setSelectedFood(null)} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", padding: 4 }}><X size={16} /></button>
              </div>

              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <label style={{ fontSize: 10, color: T.textMuted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Quantity</label>
                  <div style={{ display: "flex", alignItems: "center", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
                    <input type="number" min="1" max="5000" value={quantity} onChange={e => setQuantity(e.target.value)}
                      style={{ flex: 1, background: "transparent", border: "none", padding: "12px 14px", fontSize: 17, fontWeight: 700, color: T.text, outline: "none", width: "100%" }}
                    />
                    <span style={{ paddingRight: 14, fontSize: 13, color: T.textMuted }}>g</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, paddingBottom: 1, flexWrap: "wrap" }}>
                  {[50, 100, 150, 200].map(q => (
                    <button key={q} onClick={() => setQuantity(String(q))}
                      style={{ padding: "12px 10px", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", background: quantity === String(q) ? T.accent : "transparent", color: quantity === String(q) ? "#000" : T.textMuted, border: `1px solid ${quantity === String(q) ? T.accent : T.border}` }}
                    >{q}g</button>
                  ))}
                </div>
              </div>

              {preview && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: 8, marginBottom: 16 }}>
                  {[
                    { label: "kcal", value: preview.calories, color: T.accentLight, bg: T.accentBg },
                    { label: "Protein", value: preview.protein, color: T.accentLight, bg: T.accentBg },
                    { label: "Carbs", value: preview.carbs, color: T.amber, bg: T.amberBg },
                    { label: "Fat", value: preview.fat, color: T.red, bg: T.redBg },
                    { label: "Fiber", value: preview.fiber, color: T.green, bg: T.greenBg },
                  ].map(m => (
                    <div key={m.label} style={{ background: m.bg, border: `1px solid ${m.color}20`, borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
                      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, color: m.color, lineHeight: 1 }}>{m.value}</p>
                      <p style={{ fontSize: 10, color: T.textMuted, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{m.label}</p>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={logFood} disabled={logging || !quantity || Number(quantity) <= 0}
                style={{ width: "100%", padding: "14px", background: T.accent, color: "#000", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", border: "none", borderRadius: 10, cursor: logging ? "not-allowed" : "pointer", opacity: logging || !quantity || Number(quantity) <= 0 ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", boxSizing: "border-box" }}
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
              <p style={{ textAlign: "center", color: T.textMuted, fontSize: 14, padding: "56px 24px" }}>No results for &quot;{searchQ}&quot;</p>
            )}
            {!searchQ && <p style={{ fontSize: 10, color: T.textGhost, textAlign: "center", padding: "16px 0 4px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Popular foods</p>}
            {searchResults.map((food, idx) => {
              const isSel = selectedFood?.id === food.id;
              return (
                <button key={food.id} onClick={() => { setSelectedFood(food); setQuantity("100"); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", textAlign: "left", background: isSel ? "#161616" : "transparent", borderLeft: `3px solid ${isSel ? T.accent : "transparent"}`, borderTop: idx > 0 ? "1px solid #141414" : "none", borderRight: "none", borderBottom: "none", cursor: "pointer", transition: "all 0.12s" }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "#0e0e0e"; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{food.name}</p>
                      {food.isCustom && <span style={{ fontSize: 9, fontWeight: 800, color: T.accent, background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 4, padding: "2px 7px", flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>custom</span>}
                    </div>
                    <p style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>per 100g</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 20 }}>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color: T.accent, lineHeight: 1.1 }}>
                      {Math.round(food.per100Calories)}<span style={{ fontSize: 11, fontWeight: 400, color: T.textMuted }}> kcal</span>
                    </p>
                    <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>P{food.per100Protein} C{food.per100Carbs} F{food.per100Fat} Fi{food.per100Fiber}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── GOALS MODAL ── */}
      {showGoals && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end" }} onClick={() => setShowGoals(false)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }} />
          <div style={{ position: "relative", width: "100%", maxWidth: 580, margin: "0 auto", background: T.card, border: `1px solid ${T.border}`, borderTop: `2px solid ${T.accent}`, borderRadius: "22px 22px 0 0", padding: "28px 28px 44px", boxShadow: "0 -40px 100px rgba(0,0,0,0.7)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 3, borderRadius: 999, background: T.borderMid, margin: "0 auto 24px" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <p style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Nutrition</p>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 30, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em" }}>
                  Daily <span style={{ color: T.accent }}>Targets</span>
                </h2>
              </div>
              <button onClick={() => setShowGoals(false)} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", padding: 4 }}><X size={20} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {[
                { key: "calories", label: "Calories", unit: "kcal", color: T.accentLight },
                { key: "protein", label: "Protein", unit: "g", color: T.accentLight },
                { key: "carbs", label: "Carbs", unit: "g", color: T.amber },
                { key: "fat", label: "Fat", unit: "g", color: T.red },
                { key: "fiber", label: "Fiber", unit: "g", color: T.green },
                { key: "waterMl", label: "Water", unit: "ml", color: T.blue },
              ].map(({ key, label, unit, color }) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 4, height: 36, borderRadius: 999, background: color, flexShrink: 0 }} />
                  <label style={{ fontSize: 13, color: T.textSecond, width: 76, flexShrink: 0 }}>{label}</label>
                  <div style={{ flex: 1, position: "relative" }}>
                    <input type="number"
                      value={(goalDraft as unknown as Record<string, number>)[key]}
                      onChange={e => setGoalDraft(p => ({ ...p, [key]: Number(e.target.value) }))}
                      style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "11px 46px 11px 14px", fontSize: 15, fontWeight: 700, color: T.text, outline: "none", textAlign: "right", boxSizing: "border-box", transition: "border-color 0.2s" }}
                      onFocus={e => { e.currentTarget.style.borderColor = color; }}
                      onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
                    />
                    <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: T.textMuted, pointerEvents: "none" }}>{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={saveGoals} disabled={savingGoals}
              style={{ width: "100%", padding: "15px", background: T.accent, color: "#000", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 19, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", border: "none", borderRadius: 12, cursor: savingGoals ? "not-allowed" : "pointer", opacity: savingGoals ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}
              onMouseEnter={e => { if (!savingGoals) e.currentTarget.style.background = T.accentLight; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.accent; }}
            >
              {savingGoals ? <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={17} />}
              {savingGoals ? "Saving…" : goalsSaved ? "Saved!" : "Save Goals"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .ff-entry-row:hover .ff-edit-btn { opacity: 1 !important; }
        .ff-entry-row:hover .ff-delete-btn { opacity: 1 !important; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 999px; }
      `}</style>
    </div>
  );
}