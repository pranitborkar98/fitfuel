"use client";

// app/dashboard/nutrition/NutritionClient.tsx

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Trash2,
  X,
  Droplets,
  Target,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  Flame,
  Dumbbell,
  Wheat,
  Zap,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────
interface FoodItem {
  id: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  per100Calories: number;
  per100Protein: number;
  per100Carbs: number;
  per100Fat: number;
  per100Fiber: number;
  isCustom: boolean;
}

interface MealType {
  id: string;
  name: string;
  emoji?: string | null;
  sortOrder: number;
}

interface FoodEntry {
  id: string;
  foodItemId: string;
  mealTypeId: string;
  entryDate: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  foodItem: FoodItem;
  mealType: MealType;
}

interface Goal {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
}

interface Props {
  initialEntries: FoodEntry[];
  mealTypes: MealType[];
  goal: Goal;
  initialWaterMl: number;
  userName: string;
}

// ── Helpers ──────────────────────────────────────────────────
function fmt(d: Date) { return d.toISOString().split("T")[0]; }

function displayDate(d: Date) {
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function pct(val: number, goal: number) {
  return Math.min(100, goal > 0 ? Math.round((val / goal) * 100) : 0);
}

// ── Donut Ring ───────────────────────────────────────────────
function CalorieRing({ consumed, goal }: { consumed: number; goal: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const over = consumed > goal;
  const filled = (Math.min(consumed, goal) / goal) * circ;

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 120 120" className="w-[120px] h-[120px] -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1c1c1c" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={over ? "#f87171" : "#a3e635"}
          strokeWidth="10"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-black text-white leading-none">{Math.round(consumed)}</p>
        <p className="text-[10px] text-neutral-500 mt-0.5">of {goal} kcal</p>
        {over && <p className="text-[9px] text-red-400 font-bold">OVER</p>}
      </div>
    </div>
  );
}

// ── Macro Bar ────────────────────────────────────────────────
function MacroBar({
  icon: Icon, label, consumed, goal, color, unit = "g",
}: {
  icon: React.ElementType; label: string; consumed: number; goal: number; color: string; unit?: string;
}) {
  const p = pct(consumed, goal);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Icon size={12} style={{ color }} />
          <span className="text-neutral-400">{label}</span>
        </div>
        <span className="text-white font-semibold">
          {Math.round(consumed)}<span className="text-neutral-600">/{goal}{unit}</span>
        </span>
      </div>
      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${p}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function NutritionClient({
  initialEntries,
  mealTypes,
  goal,
  initialWaterMl,
  userName,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  });
  const [entries, setEntries] = useState<FoodEntry[]>(initialEntries);
  const [waterMl, setWaterMl] = useState(initialWaterMl);
  const [loadingDiary, setLoadingDiary] = useState(false);

  // Food search modal
  const [activeSlot, setActiveSlot] = useState<MealType | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState("100");
  const [logging, setLogging] = useState(false);

  // Goals modal
  const [showGoals, setShowGoals] = useState(false);
  const [goalDraft, setGoalDraft] = useState<Goal>(goal);
  const [savingGoals, setSavingGoals] = useState(false);
  const [goalsSaved, setGoalsSaved] = useState(false);

  // Collapsed slots
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isToday = fmt(selectedDate) === fmt(new Date());

  // ── Date navigation ──────────────────────────────────────
  function goDay(delta: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d);
  }

  // ── Fetch diary on date change ───────────────────────────
  useEffect(() => {
    if (isToday) {
      setEntries(initialEntries);
      setWaterMl(initialWaterMl);
      return;
    }
    setLoadingDiary(true);
    const dateStr = fmt(selectedDate);
    Promise.all([
      fetch(`/api/nutrition/diary?date=${dateStr}`).then(r => r.json()),
      fetch(`/api/nutrition/water?date=${dateStr}`).then(r => r.json()),
    ])
      .then(([diary, water]) => {
        setEntries(diary.entries ?? []);
        setWaterMl(water.amountMl ?? 0);
      })
      .finally(() => setLoadingDiary(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // ── Totals ───────────────────────────────────────────────
  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // ── Search ───────────────────────────────────────────────
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
    fetch("/api/nutrition/foods?q=")
      .then(r => r.json())
      .then(setSearchResults)
      .finally(() => setSearching(false));
  }, [activeSlot]);

  // ── Log food ─────────────────────────────────────────────
  async function logFood() {
    if (!selectedFood || !activeSlot || !quantity) return;
    setLogging(true);
    try {
      const res = await fetch("/api/nutrition/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodItemId: selectedFood.id,
          mealTypeId: activeSlot.id,
          date: fmt(selectedDate),
          quantity: Number(quantity),
        }),
      });
      if (!res.ok) throw new Error();
      const entry: FoodEntry = await res.json();
      setEntries(prev => [...prev, entry]);
      setSelectedFood(null);
      setSearchQ("");
      setSearchResults([]);
      setQuantity("100");
      setActiveSlot(null);
    } finally { setLogging(false); }
  }

  // ── Delete entry ─────────────────────────────────────────
  async function deleteEntry(id: string) {
    await fetch(`/api/nutrition/diary/${id}`, { method: "DELETE" });
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  // ── Water ────────────────────────────────────────────────
  const glassMl = 250;
  const totalGlasses = Math.round(goal.waterMl / glassMl);
  const filledGlasses = Math.floor(waterMl / glassMl);

  async function logWater(idx: number) {
    const target = (idx + 1) * glassMl;
    const action = waterMl >= target ? "subtract" : "add";
    const change = action === "add" ? target - waterMl : glassMl;
    const res = await fetch("/api/nutrition/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: fmt(selectedDate), amountMl: change, action }),
    });
    const data = await res.json();
    setWaterMl(data.amountMl ?? waterMl);
  }

  // ── Save goals ───────────────────────────────────────────
  async function saveGoals() {
    setSavingGoals(true);
    await fetch("/api/nutrition/goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goalDraft),
    });
    setSavingGoals(false);
    setGoalsSaved(true);
    setTimeout(() => { setGoalsSaved(false); setShowGoals(false); }, 800);
  }

  // ── Preview macros ───────────────────────────────────────
  const preview = selectedFood && quantity
    ? {
        calories: Math.round(selectedFood.per100Calories * Number(quantity) / 100 * 10) / 10,
        protein:  Math.round(selectedFood.per100Protein  * Number(quantity) / 100 * 10) / 10,
        carbs:    Math.round(selectedFood.per100Carbs    * Number(quantity) / 100 * 10) / 10,
        fat:      Math.round(selectedFood.per100Fat      * Number(quantity) / 100 * 10) / 10,
      }
    : null;

  const bySlot = (id: string) => entries.filter(e => e.mealTypeId === id);
  const slotKcal = (id: string) => bySlot(id).reduce((a, e) => a + e.calories, 0);

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080808] text-white pt-20" style={{ paddingTop: 80 }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-[#080808]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm text-neutral-500 hover:text-white transition-colors"
          >
            <ChevronLeft size={15} />
            <span>Dashboard</span>
          </Link>

          <div className="text-center">
            <p className="text-[9px] tracking-[0.2em] text-neutral-600 uppercase">Phase 6 · Nutrition</p>
            <h1
              className="text-base font-black uppercase tracking-tight leading-none"
              style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif" }}
            >
              FUEL <span className="text-lime-400">LOG</span>
            </h1>
          </div>

          <button
            onClick={() => setShowGoals(true)}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Target size={15} className="text-neutral-400" />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* ── Date navigator ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => goDay(-1)}
            className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <p className="font-bold text-white">{displayDate(selectedDate)}</p>
            <p className="text-xs text-neutral-600">
              {selectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => goDay(1)}
            disabled={isToday}
            className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* ── Summary card ── */}
        <div className="bg-neutral-900 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-5">
            <CalorieRing consumed={totals.calories} goal={goal.calories} />
            <div className="flex-1 space-y-3 min-w-0">
              <MacroBar icon={Dumbbell} label="Protein"  consumed={totals.protein} goal={goal.protein} color="#a3e635" />
              <MacroBar icon={Wheat}    label="Carbs"    consumed={totals.carbs}   goal={goal.carbs}   color="#fbbf24" />
              <MacroBar icon={Zap}      label="Fat"      consumed={totals.fat}     goal={goal.fat}     color="#f87171" />
            </div>
          </div>

          {/* Remaining kcal strip */}
          <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs text-neutral-500">
            <span>Remaining</span>
            <span className={totals.calories > goal.calories ? "text-red-400 font-bold" : "text-lime-400 font-bold"}>
              {totals.calories > goal.calories
                ? `${Math.round(totals.calories - goal.calories)} kcal over`
                : `${Math.round(goal.calories - totals.calories)} kcal left`}
            </span>
          </div>
        </div>

        {/* ── Water tracker ── */}
        <div className="bg-neutral-900 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets size={15} className="text-blue-400" />
              <span className="text-sm font-semibold">Water</span>
            </div>
            <span className="text-xs text-neutral-400">
              <span className="text-white font-bold">{waterMl}ml</span>
              <span className="text-neutral-600"> / {goal.waterMl}ml</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (waterMl / goal.waterMl) * 100)}%` }}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: totalGlasses }).map((_, i) => (
              <button
                key={i}
                onClick={() => logWater(i)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  i < filledGlasses
                    ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                    : "bg-white/3 border-white/8 text-neutral-700 hover:border-blue-500/30"
                }`}
              >
                <Droplets size={13} />
              </button>
            ))}
          </div>
          <p className="text-[10px] text-neutral-700 mt-2">Tap to log 250ml · Tap filled to undo</p>
        </div>

        {/* ── Meal slots ── */}
        {loadingDiary ? (
          <div className="flex justify-center py-10">
            <Loader2 size={22} className="animate-spin text-lime-400" />
          </div>
        ) : (
          <div className="space-y-2">
            {mealTypes.map(mt => {
              const slotEntries = bySlot(mt.id);
              const kcal = slotKcal(mt.id);
              const isCollapsed = collapsed[mt.id];

              return (
                <div key={mt.id} className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden">
                  {/* Slot header */}
                  <div className="flex items-center px-4 py-3 gap-3">
                    <button
                      className="flex items-center gap-2.5 flex-1 text-left"
                      onClick={() => setCollapsed(c => ({ ...c, [mt.id]: !c[mt.id] }))}
                    >
                      <span className="text-base leading-none">{mt.emoji ?? "🍽️"}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{mt.name}</p>
                        {kcal > 0 && (
                          <p className="text-[11px] text-neutral-600 flex items-center gap-1">
                            <Flame size={9} className="text-orange-400" />
                            {Math.round(kcal)} kcal
                          </p>
                        )}
                      </div>
                      <span className="ml-1 text-neutral-600">
                        {isCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                      </span>
                    </button>
                    <button
                      onClick={() => { setActiveSlot(mt); setSearchQ(""); setSelectedFood(null); setQuantity("100"); }}
                      className="w-7 h-7 rounded-lg bg-lime-400/10 border border-lime-400/20 flex items-center justify-center hover:bg-lime-400/20 transition-colors"
                    >
                      <Plus size={13} className="text-lime-400" />
                    </button>
                  </div>

                  {/* Entries */}
                  {!isCollapsed && (
                    <>
                      {slotEntries.length > 0 ? (
                        <div className="border-t border-white/5 divide-y divide-white/[0.03]">
                          {slotEntries.map(e => (
                            <div key={e.id} className="flex items-center px-4 py-2.5 group gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{e.foodItem.name}</p>
                                <p className="text-[11px] text-neutral-600">
                                  {e.quantity}g · {Math.round(e.calories)} kcal ·{" "}
                                  P{e.protein}g C{e.carbs}g F{e.fat}g
                                </p>
                              </div>
                              <button
                                onClick={() => deleteEntry(e.id)}
                                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-all"
                              >
                                <Trash2 size={11} className="text-red-400" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border-t border-white/5 px-4 py-2.5">
                          <p className="text-[11px] text-neutral-700 italic">Nothing logged yet</p>
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
        <div className="fixed inset-0 z-50 bg-[#080808] flex flex-col">
          {/* Modal header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5 flex-shrink-0">
            <button
              onClick={() => { setActiveSlot(null); setSelectedFood(null); setSearchQ(""); }}
              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
            <div>
              <p className="text-xs text-neutral-600">
                Add to {activeSlot.emoji} {activeSlot.name}
              </p>
              <p className="text-sm font-semibold text-white">{displayDate(selectedDate)}</p>
            </div>
          </div>

          {/* Search input */}
          <div className="px-4 py-3 border-b border-white/5 flex-shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input
                autoFocus
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search food (e.g. dal, rice, egg, paneer)…"
                className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-neutral-700 focus:outline-none focus:border-lime-400/40 transition-colors"
              />
              {searching && (
                <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-neutral-600" />
              )}
            </div>
          </div>

          {/* Selected food + qty panel */}
          {selectedFood && (
            <div className="px-4 py-3 border-b border-white/5 bg-neutral-900/60 flex-shrink-0">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{selectedFood.name}</p>
                  {selectedFood.brand && (
                    <p className="text-xs text-neutral-500">{selectedFood.brand}</p>
                  )}
                </div>
                <button onClick={() => setSelectedFood(null)} className="text-neutral-600 hover:text-white">
                  <X size={14} />
                </button>
              </div>

              {/* Qty row */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-[11px] text-neutral-600 block mb-1">Quantity (grams)</label>
                  <input
                    type="number" min="1" max="5000"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full bg-[#080808] border border-white/8 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400/40"
                  />
                </div>
                <div className="flex gap-1 pb-0.5">
                  {[50, 100, 150, 200].map(q => (
                    <button
                      key={q}
                      onClick={() => setQuantity(String(q))}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        quantity === String(q)
                          ? "bg-lime-400 text-black"
                          : "bg-white/5 text-neutral-500 hover:text-white"
                      }`}
                    >
                      {q}g
                    </button>
                  ))}
                </div>
              </div>

              {/* Macro preview */}
              {preview && (
                <div className="mt-3 grid grid-cols-4 gap-1.5">
                  {[
                    { label: "kcal",    value: preview.calories, color: "#a3e635" },
                    { label: "Protein", value: preview.protein,  color: "#a3e635" },
                    { label: "Carbs",   value: preview.carbs,    color: "#fbbf24" },
                    { label: "Fat",     value: preview.fat,      color: "#f87171" },
                  ].map(m => (
                    <div key={m.label} className="bg-[#080808] rounded-lg p-2 text-center border border-white/5">
                      <p className="text-sm font-black" style={{ color: m.color }}>{m.value}</p>
                      <p className="text-[9px] text-neutral-600">{m.label}</p>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={logFood}
                disabled={logging || !quantity || Number(quantity) <= 0}
                className="mt-3 w-full py-2.5 bg-lime-400 text-black font-black text-sm rounded-xl hover:bg-lime-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {logging ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {logging ? "Logging…" : `Add to ${activeSlot.name}`}
              </button>
            </div>
          )}

          {/* Results list */}
          <div className="flex-1 overflow-y-auto">
            {!searching && searchQ && searchResults.length === 0 && (
              <p className="text-center text-neutral-600 text-sm py-10">No foods found for "{searchQ}"</p>
            )}
            {!searching && !searchQ && (
              <p className="text-center text-neutral-700 text-xs py-3">Popular foods</p>
            )}
            <div className="divide-y divide-white/[0.03]">
              {searchResults.map(food => (
                <button
                  key={food.id}
                  onClick={() => { setSelectedFood(food); setQuantity("100"); }}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-900 transition-colors text-left ${
                    selectedFood?.id === food.id ? "bg-neutral-900 border-l-2 border-lime-400" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white truncate">{food.name}</p>
                      {food.isCustom && (
                        <span className="text-[9px] bg-lime-400/10 text-lime-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          custom
                        </span>
                      )}
                    </div>
                    {food.brand && <p className="text-xs text-neutral-600">{food.brand}</p>}
                    <p className="text-[10px] text-neutral-700">per 100g</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-black text-lime-400">{Math.round(food.per100Calories)} kcal</p>
                    <p className="text-[10px] text-neutral-600">
                      P{food.per100Protein}g C{food.per100Carbs}g F{food.per100Fat}g
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Goals Modal (bottom sheet) ── */}
      {showGoals && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowGoals(false)}>
          <div
            className="w-full max-w-lg mx-auto bg-neutral-900 border-t border-white/8 rounded-t-2xl p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-lg font-black uppercase tracking-tight"
                style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif" }}
              >
                Daily <span className="text-lime-400">Targets</span>
              </h2>
              <button onClick={() => setShowGoals(false)} className="text-neutral-600 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { key: "calories", label: "Calories (kcal)", min: 500,  max: 5000 },
                { key: "protein",  label: "Protein (g)",     min: 10,   max: 400  },
                { key: "carbs",    label: "Carbs (g)",       min: 10,   max: 800  },
                { key: "fat",      label: "Fat (g)",         min: 5,    max: 300  },
                { key: "waterMl",  label: "Water (ml)",      min: 500,  max: 6000 },
              ].map(({ key, label, min, max }) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="text-sm text-neutral-400 w-36 flex-shrink-0">{label}</label>
                  <input
                    type="number" min={min} max={max}
                    value={(goalDraft as unknown as Record<string, number>)[key]}
                    onChange={e => setGoalDraft(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                    className="flex-1 bg-[#080808] border border-white/8 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400/40 text-right"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={saveGoals}
              disabled={savingGoals}
              className="w-full py-3 bg-lime-400 text-black font-black text-sm rounded-xl hover:bg-lime-300 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {savingGoals ? (
                <Loader2 size={15} className="animate-spin" />
              ) : goalsSaved ? (
                <Check size={15} />
              ) : (
                <Check size={15} />
              )}
              {savingGoals ? "Saving…" : goalsSaved ? "Saved!" : "Save Goals"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
