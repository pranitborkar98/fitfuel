"use client";

// app/dashboard/nutrition/NutritionClient.tsx
//
// The diary, the water, and the food database.
//
// Two things had to go beyond the palette.
//
// A block titled "14-Day Nutrition Trends" rendered today's totals, five times,
// against today's goals. No fourteen day series was ever fetched. It was the
// macro cards directly above it, drawn again at 3px tall, under a heading that
// said something else. §11 names fake charts; a real number under a false label
// is worse than a fake chart, because it invites a decision. It is gone, and the
// macro meters it duplicated do the job honestly.
//
// And the edit and delete buttons on every diary row were opacity: 0, revealed
// by a CSS hover rule. They were in the tab order the whole time, so a keyboard
// user tabbed onto an invisible control, and a touch user had no hover to give.
// They are visible now.
//
// The palette was the per category one §2 forbids outright: amber for carbs,
// red for fat, green for fibre, blue for water. Lime carries protein and
// calories, the neutral bar grey carries the rest, and every label is a word.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { C, COND, SANS, body, label, num, figure, section, PANEL, solidBtn, ghostBtn } from "@/app/_app/theme";
import Dialog from "@/app/_app/Dialog";

/* ── types ──────────────────────────────────────────────────────────────── */

interface FoodItem {
  id: string; name: string; brand?: string | null; category?: string | null;
  per100Calories: number; per100Protein: number; per100Carbs: number;
  per100Fat: number; per100Fiber: number; isCustom: boolean;
}
interface MealType { id: string; name: string; emoji?: string | null; sortOrder: number }
interface FoodEntry {
  id: string; foodItemId: string; mealTypeId: string; entryDate: string;
  quantity: number; calories: number; protein: number; carbs: number;
  fat: number; fiber: number; foodItem: FoodItem; mealType: MealType;
}
interface Goal { calories: number; protein: number; carbs: number; fat: number; fiber: number; waterMl: number }
interface Props {
  initialEntries: FoodEntry[];
  mealTypes: MealType[];
  goal: Goal;
  initialWaterMl: number;
}

/* ── helpers ────────────────────────────────────────────────────────────── */

const iso = (d: Date) => d.toISOString().split("T")[0];
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const pct = (v: number, g: number) => clamp(g > 0 ? (v / g) * 100 : 0, 0, 100);
const n0 = (v: number) => Math.round(v).toLocaleString("en-IN");

function displayDate(d: Date) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

const GOAL_FIELDS: Array<{ key: keyof Goal; name: string; unit: string; step: number }> = [
  { key: "calories", name: "Calories", unit: "kcal", step: 10 },
  { key: "protein", name: "Protein", unit: "g", step: 5 },
  { key: "carbs", name: "Carbs", unit: "g", step: 5 },
  { key: "fat", name: "Fat", unit: "g", step: 2 },
  { key: "fiber", name: "Fibre", unit: "g", step: 1 },
  { key: "waterMl", name: "Water", unit: "ml", step: 250 },
];

/* ── small pieces ───────────────────────────────────────────────────────── */

function Spine({ children, right }: { children: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "26px 0 16px" }}>
      <span style={label(12)}>{children}</span>
      <span style={{ flex: 1, height: 1, background: C.rule }} />
      {right}
    </div>
  );
}

function Readout({ v, k, live = false }: { v: string; k: string; live?: boolean }) {
  return (
    <div style={{ background: C.bg, padding: "14px 16px 16px" }}>
      <span style={figure(30, { display: "block", color: live ? C.lime : C.ink })}>{v}</span>
      <span style={label(12, { display: "block", marginTop: 8, lineHeight: 1.45 })}>{k}</span>
    </div>
  );
}

function Meter({ name, value, goal, unit, on }: {
  name: string; value: number; goal: number; unit: string; on: boolean;
}) {
  const over = goal > 0 && value > goal;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={label(12)}>{name}</span>
        <span style={num(12, { color: over ? C.danger : C.ink })}>
          {n0(value)} / {n0(goal)}{unit}{over ? ", over" : ""}
        </span>
      </div>
      <div style={{ height: 10, background: C.trough }}>
        <div style={{ height: 10, width: `${pct(value, goal)}%`, background: on ? C.lime : C.fat }} />
      </div>
    </div>
  );
}

function IconBtn({ onClick, disabled, children, name }: {
  onClick: () => void; disabled?: boolean; children: React.ReactNode; name: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={name}
      style={{
        minWidth: 44, minHeight: 44, background: "transparent",
        border: `1px solid ${C.rule2}`, color: disabled ? C.dim : C.ink,
        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1,
        fontFamily: COND, fontWeight: 800, fontSize: 15, textTransform: "uppercase",
        transition: "border-color 180ms ease-out, color 180ms ease-out",
      }}
    >
      {children}
    </button>
  );
}

const INPUT: React.CSSProperties = {
  minHeight: 44, padding: "0 12px", boxSizing: "border-box",
  background: C.bg, border: `1px solid ${C.rule2}`, color: C.ink,
  fontFamily: SANS, fontSize: 14, outline: "none",
};

/* ── main ───────────────────────────────────────────────────────────────── */

export default function NutritionClient({ initialEntries, mealTypes, goal, initialWaterMl }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  });
  const [entries, setEntries] = useState<FoodEntry[]>(initialEntries);
  const [waterMl, setWaterMl] = useState(initialWaterMl);
  const [burnedKcal, setBurnedKcal] = useState(0);
  const [currentGoal, setCurrentGoal] = useState<Goal>(goal);

  // Which day the state above actually holds. The skeleton is derived from it
  // rather than set by the effect, so nothing calls setState synchronously in
  // an effect body and there is no cascading render.
  const [loadedDate, setLoadedDate] = useState(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return iso(d);
  });

  const [activeSlot, setActiveSlot] = useState<MealType | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState("100");
  const [logging, setLogging] = useState(false);

  // Everything on this screen mutates the diary and then repaints a number
  // somewhere else in the layout. A sighted user sees the total move; a screen
  // reader user got nothing at all. One polite region, written by every
  // mutation, is what announces those. It also gives the failure path a voice:
  // logFood used to swallow a rejected POST and simply not add a row.
  const [notice, setNotice] = useState("");

  const [showGoals, setShowGoals] = useState(false);
  const [goalDraft, setGoalDraft] = useState<Goal>(goal);
  const [savingGoals, setSavingGoals] = useState(false);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isToday = iso(selectedDate) === iso(new Date());

  function goDay(delta: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d);
  }

  const wantedDate = iso(selectedDate);
  const loadingDiary = loadedDate !== wantedDate;

  // Today's diary and water arrive server rendered, so only the burn is
  // fetched on mount. Every other day is fetched whole.
  useEffect(() => {
    let alive = true;
    fetch(`/api/workout/burned?date=${loadedDate}`)
      .then((r) => r.json())
      .then((d) => { if (alive) setBurnedKcal(d.caloriesBurned ?? 0); })
      .catch(() => {});
    return () => { alive = false; };
  }, [loadedDate]);

  useEffect(() => {
    if (!loadingDiary) return;
    let alive = true;
    Promise.all([
      fetch(`/api/nutrition/diary?date=${wantedDate}`).then((r) => r.json()),
      fetch(`/api/nutrition/water?date=${wantedDate}`).then((r) => r.json()),
    ])
      .then(([diary, water]) => {
        if (!alive) return;
        setEntries(diary.entries ?? []);
        setWaterMl(water.amountMl ?? 0);
        setLoadedDate(wantedDate);
      })
      .catch(() => {
        if (alive) setLoadedDate(wantedDate);
      });
    return () => { alive = false; };
  }, [wantedDate, loadingDiary]);

  const totals = useMemo(() => entries.reduce(
    (a, e) => ({
      calories: a.calories + e.calories, protein: a.protein + e.protein,
      carbs: a.carbs + e.carbs, fat: a.fat + e.fat, fiber: a.fiber + e.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  ), [entries]);

  const doSearch = useCallback((q: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(`/api/nutrition/foods?q=${encodeURIComponent(q)}`);
        setResults(await r.json());
      } finally {
        setSearching(false);
      }
    }, 280);
  }, []);

  useEffect(() => { if (activeSlot) doSearch(searchQ); }, [searchQ, activeSlot, doSearch]);

  async function logFood() {
    if (!picked || !activeSlot || !quantity) return;
    // closeAdd() clears both of these, so the announcement text has to be built
    // before the dialog tears itself down.
    const what = `${picked.name}, ${quantity} g`;
    const where = activeSlot.name;
    setLogging(true);
    try {
      const res = await fetch("/api/nutrition/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodItemId: picked.id, mealTypeId: activeSlot.id,
          date: iso(selectedDate), quantity: Number(quantity),
        }),
      });
      if (!res.ok) throw new Error();
      const created: FoodEntry = await res.json();
      setEntries((p) => [...p, created]);
      setNotice(`Added ${what} to ${where}.`);
      closeAdd();
    } catch {
      // Leave the dialog open so the entry is not lost, and say so out loud.
      setNotice("Could not add that. Check your connection and try again.");
    } finally {
      setLogging(false);
    }
  }

  function closeAdd() {
    setActiveSlot(null); setPicked(null); setSearchQ(""); setResults([]); setQuantity("100");
  }

  async function deleteEntry(id: string) {
    const gone = entries.find((e) => e.id === id);
    await fetch(`/api/nutrition/diary/${id}`, { method: "DELETE" });
    setEntries((p) => p.filter((e) => e.id !== id));
    setNotice(gone ? `Removed ${gone.foodItem.name}.` : "Entry removed.");
  }

  async function updateEntry(id: string, qty: number) {
    const res = await fetch(`/api/nutrition/diary/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: qty }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setEntries((p) => p.map((e) => (e.id === id ? updated : e)));
    setEditingId(null);
  }

  const GLASS = 250;
  const glasses = Math.max(1, Math.round(currentGoal.waterMl / GLASS));
  const filled = Math.floor(waterMl / GLASS);

  async function setWaterTo(targetMl: number) {
    const delta = targetMl - waterMl;
    if (delta === 0) return;
    const res = await fetch("/api/nutrition/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: iso(selectedDate),
        amountMl: Math.abs(delta),
        action: delta > 0 ? "add" : "subtract",
      }),
    });
    setWaterMl((await res.json()).amountMl ?? waterMl);
  }

  async function saveGoals() {
    setSavingGoals(true);
    try {
      await fetch("/api/nutrition/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalDraft),
      });
      setCurrentGoal(goalDraft);
      setShowGoals(false);
    } finally {
      setSavingGoals(false);
    }
  }

  const preview = picked && quantity
    ? {
        calories: Math.round(picked.per100Calories * Number(quantity) / 100),
        protein: Math.round(picked.per100Protein * Number(quantity) / 100),
        carbs: Math.round(picked.per100Carbs * Number(quantity) / 100),
        fat: Math.round(picked.per100Fat * Number(quantity) / 100),
        fiber: Math.round(picked.per100Fiber * Number(quantity) / 100),
      }
    : null;

  const bySlot = (id: string) => entries.filter((e) => e.mealTypeId === id);
  const slotTotals = (id: string) => bySlot(id).reduce(
    (a, e) => ({
      kcal: a.kcal + e.calories, protein: a.protein + e.protein,
      carbs: a.carbs + e.carbs, fat: a.fat + e.fat, fiber: a.fiber + e.fiber,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );

  const net = totals.calories - burnedKcal;
  const remaining = currentGoal.calories - net;

  return (
    <>
      {/* Lives outside the dialog on purpose: the add flow closes on success,
          and a region that unmounts in the same tick never gets announced. */}
      <p role="status" aria-live="polite" className="sr-only">{notice}</p>

      {/* date navigator */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
        <IconBtn onClick={() => goDay(-1)} name="Previous day">&lt;</IconBtn>
        <div style={{ minWidth: 0 }}>
          <p style={{ ...section(), margin: 0 }}>{displayDate(selectedDate)}</p>
          <p style={num(12, { color: C.dim })}>
            {selectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <IconBtn onClick={() => goDay(1)} disabled={isToday} name="Next day">&gt;</IconBtn>
        <button
          type="button"
          onClick={() => { setGoalDraft(currentGoal); setShowGoals(true); }}
          style={{ ...ghostBtn(), marginLeft: "auto" }}
        >
          Edit targets
        </button>
      </div>

      {/* the day, measured */}
      <div style={{ display: "grid", gap: 1, background: C.rule, border: `1px solid ${C.rule}`,
                    gridTemplateColumns: "repeat(auto-fit,minmax(136px,1fr))", marginTop: 20 }}>
        <Readout
          v={remaining >= 0 ? n0(remaining) : `+${n0(-remaining)}`}
          k={remaining >= 0 ? "Remaining kcal" : "Over by kcal"}
          live={remaining >= 0}
        />
        <Readout v={n0(totals.calories)} k="Eaten" />
        <Readout v={n0(burnedKcal)} k="Burned" />
        <Readout v={n0(currentGoal.calories)} k="Target" />
      </div>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                    marginTop: 26 }}>
        <div style={{ ...PANEL, padding: 18 }}>
          <p style={label(12, { display: "block", marginBottom: 14 })}>Against target</p>
          <Meter name="Calories" value={totals.calories} goal={currentGoal.calories} unit=" kcal" on />
          <Meter name="Protein" value={totals.protein} goal={currentGoal.protein} unit="g" on />
          <Meter name="Carbs" value={totals.carbs} goal={currentGoal.carbs} unit="g" on={false} />
          <Meter name="Fat" value={totals.fat} goal={currentGoal.fat} unit="g" on={false} />
          <Meter name="Fibre" value={totals.fiber} goal={currentGoal.fiber} unit="g" on={false} />
        </div>

        <div style={{ ...PANEL, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                        gap: 12, marginBottom: 14 }}>
            <p style={label(12)}>Water</p>
            <span style={num(12, { color: C.ink })}>
              {n0(waterMl)} / {n0(currentGoal.waterMl)} ml
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(10, glasses)},1fr)`, gap: 4 }}>
            {Array.from({ length: glasses }, (_, i) => i).map((i) => {
              const on = i < filled;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setWaterTo(on && i === filled - 1 ? i * GLASS : (i + 1) * GLASS)}
                  aria-pressed={on}
                  aria-label={`Set water to ${(i + 1) * GLASS} ml`}
                  style={{
                    height: 34, padding: 0, cursor: "pointer",
                    background: on ? C.lime : "transparent",
                    border: `1px solid ${on ? C.lime : C.rule}`,
                    transition: "background-color 180ms ease-out, border-color 180ms ease-out",
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <IconBtn onClick={() => setWaterTo(Math.max(0, waterMl - GLASS))} name="Remove a glass">-</IconBtn>
            <IconBtn onClick={() => setWaterTo(waterMl + GLASS)} name="Add a glass">+</IconBtn>
            <span style={{ ...body(13), alignSelf: "center" }}>250 ml a glass. Tap to set the level.</span>
          </div>
        </div>
      </div>

      <Spine>The day&apos;s diary</Spine>

      {loadingDiary ? (
        <div style={PANEL} aria-busy="true" aria-label="Loading the diary">
          <div style={{ padding: 18 }}>
            {[70, 55, 40].map((w, i) => (
              <div key={i} style={{ height: 10, width: `${w}%`, background: C.trough, marginBottom: 10 }} />
            ))}
          </div>
        </div>
      ) : (
        mealTypes.map((mt) => {
          const rows = bySlot(mt.id);
          const st = slotTotals(mt.id);
          const isCollapsed = collapsed[mt.id];

          return (
            <section key={mt.id} style={{ ...PANEL, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                            borderBottom: isCollapsed || !rows.length ? "none" : `1px solid ${C.rule}` }}>
                <button
                  type="button"
                  onClick={() => setCollapsed((c) => ({ ...c, [mt.id]: !c[mt.id] }))}
                  aria-expanded={!isCollapsed}
                  style={{
                    display: "flex", alignItems: "baseline", gap: 10, flex: 1, minWidth: 0,
                    minHeight: 44, background: "transparent", border: 0, cursor: "pointer",
                    textAlign: "left", padding: 0, color: "inherit",
                  }}
                >
                  <span style={section()}>{mt.name}</span>
                  <span style={num(12, { color: C.dim })}>
                    {rows.length
                      ? `${n0(st.kcal)} kcal, ${rows.length} item${rows.length === 1 ? "" : "s"}`
                      : "nothing logged"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveSlot(mt); setSearchQ(""); setPicked(null); setQuantity("100"); }}
                  style={ghostBtn()}
                >
                  Add food
                </button>
              </div>

              {!isCollapsed && rows.map((e) => (
                <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                                         padding: "12px 14px", borderBottom: `1px solid ${C.rule}` }}>
                  <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                    <p style={body(14, { color: C.ink, margin: 0 })}>
                      {e.foodItem.name}
                      {e.foodItem.brand ? <span style={{ color: C.dim }}>, {e.foodItem.brand}</span> : null}
                    </p>
                    <p style={{ ...num(12, { color: C.dim }), margin: "3px 0 0" }}>
                      {e.quantity}g, {n0(e.protein)} P, {n0(e.carbs)} C, {n0(e.fat)} F, {n0(e.fiber)} fibre
                    </p>
                  </div>

                  <span style={num(13, { flex: "none", minWidth: "8ch", textAlign: "right" })}>
                    {n0(e.calories)} kcal
                  </span>

                  {editingId === e.id ? (
                    <div style={{ display: "flex", gap: 8, flex: "none" }}>
                      <input
                        type="number"
                        min={1}
                        max={5000}
                        value={editQty}
                        autoFocus
                        onChange={(ev) => setEditQty(ev.target.value)}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter") updateEntry(e.id, Number(editQty));
                          if (ev.key === "Escape") setEditingId(null);
                        }}
                        aria-label={`Grams of ${e.foodItem.name}`}
                        style={{ ...INPUT, width: 84, textAlign: "right" }}
                      />
                      <button type="button" onClick={() => updateEntry(e.id, Number(editQty))} style={ghostBtn(true)}>
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} style={ghostBtn()}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8, flex: "none" }}>
                      <button
                        type="button"
                        onClick={() => { setEditingId(e.id); setEditQty(String(e.quantity)); }}
                        style={ghostBtn()}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteEntry(e.id)}
                        style={ghostBtn(false, { borderColor: C.rule2, color: C.dim })}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {!isCollapsed && rows.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                              gap: 12, padding: "12px 14px", flexWrap: "wrap" }}>
                  <span style={label(12)}>{mt.name} total</span>
                  <span style={num(12, { color: C.ink })}>
                    {n0(st.kcal)} kcal, {n0(st.protein)} P, {n0(st.carbs)} C, {n0(st.fat)} F, {n0(st.fiber)} fibre
                  </span>
                </div>
              )}
            </section>
          );
        })
      )}

      {/* add food */}
      {activeSlot && (
        <Dialog title={`Add to ${activeSlot.name}`} onClose={closeAdd} maxWidth={620}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                        gap: 12, padding: "16px 18px", borderBottom: `1px solid ${C.rule}` }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={section()}>Add to {activeSlot.name}</h2>
              <p style={body(13, { marginTop: 4 })}>{displayDate(selectedDate)}</p>
            </div>
            <button type="button" onClick={closeAdd} style={ghostBtn()}>Close</button>
          </div>

          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.rule}` }}>
            <label htmlFor="food-search" style={label(12, { display: "block", marginBottom: 8 })}>
              Search the database
            </label>
            {/* A text box that repaints a list of choices below it is a
                combobox, and was being announced as a plain input: the results
                existed visually and not at all in the accessibility tree. */}
            <input
              id="food-search"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls="food-results"
              aria-autocomplete="list"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Rice, dal, paneer, egg"
              autoComplete="off"
              style={{ ...INPUT, width: "100%" }}
            />
          </div>

          {picked && (
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.rule}`, background: C.panel2 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <p style={body(14, { color: C.ink, margin: 0 })}>{picked.name}</p>
                <button type="button" onClick={() => setPicked(null)} style={{ ...ghostBtn(), minHeight: 36 }}>
                  Clear
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                <div>
                  <label htmlFor="qty" style={label(12, { display: "block", marginBottom: 8 })}>Grams</label>
                  <input
                    id="qty"
                    type="number"
                    min={1}
                    max={5000}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    style={{ ...INPUT, width: 120, textAlign: "right" }}
                  />
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[50, 100, 150, 200].map((q) => (
                    <button
                      key={q}
                      type="button"
                      aria-pressed={quantity === String(q)}
                      onClick={() => setQuantity(String(q))}
                      style={ghostBtn(quantity === String(q))}
                    >
                      {q}g
                    </button>
                  ))}
                </div>
              </div>

              {preview && (
                <div style={{ display: "grid", gap: 1, background: C.rule, border: `1px solid ${C.rule}`,
                              gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", marginTop: 14 }}>
                  {[
                    { k: "kcal", v: preview.calories, on: true },
                    { k: "Protein g", v: preview.protein, on: true },
                    { k: "Carbs g", v: preview.carbs, on: false },
                    { k: "Fat g", v: preview.fat, on: false },
                    { k: "Fibre g", v: preview.fiber, on: false },
                  ].map((m) => (
                    <div key={m.k} style={{ background: C.bg, padding: "10px 12px" }}>
                      <span style={figure(22, { display: "block", color: m.on ? C.lime : C.ink })}>{m.v}</span>
                      <span style={label(12, { display: "block", marginTop: 6 })}>{m.k}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={logFood}
                disabled={logging || !quantity || Number(quantity) <= 0}
                style={solidBtn({
                  width: "100%", marginTop: 14,
                  opacity: logging || !quantity || Number(quantity) <= 0 ? 0.55 : 1,
                  cursor: logging ? "default" : "pointer",
                })}
              >
                {logging ? "Adding" : `Add to ${activeSlot.name}`}
              </button>
            </div>
          )}

          <div>
            {!searchQ && (
              <p style={label(12, { display: "block", padding: "14px 18px 8px" })}>Popular foods</p>
            )}
            {searching && results.length === 0 && (
              <div style={{ padding: 18 }} aria-busy="true">
                {[70, 55, 62].map((w, i) => (
                  <div key={i} style={{ height: 10, width: `${w}%`, background: C.trough, marginBottom: 10 }} />
                ))}
              </div>
            )}
            {!searching && searchQ && results.length === 0 && (
              <p style={{ ...body(14), padding: 18, margin: 0 }}>
                Nothing in the database matches that.
              </p>
            )}

            {/* Result count, announced without stealing focus from the box. */}
            <p role="status" aria-live="polite" className="sr-only">
              {searching
                ? "Searching"
                : searchQ && results.length === 0
                  ? "No matches"
                  : results.length > 0
                    ? `${results.length} ${results.length === 1 ? "food" : "foods"} found`
                    : ""}
            </p>

            <div id="food-results" role="listbox" aria-label="Search results">
              {results.map((f) => {
                const on = picked?.id === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => { setPicked(f); setQuantity("100"); }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                      width: "100%", minHeight: 44, padding: "12px 18px", textAlign: "left",
                      background: on ? C.panel2 : "transparent",
                      border: 0, borderBottom: `1px solid ${C.rule}`,
                      borderLeft: `2px solid ${on ? C.lime : "transparent"}`,
                      cursor: "pointer", color: "inherit",
                    }}
                  >
                    <span style={{ minWidth: 0 }}>
                      <span style={{ ...body(14, { color: C.ink }), display: "block" }}>
                        {f.name}{f.isCustom ? ", custom" : ""}
                      </span>
                      <span style={{ ...num(12, { color: C.dim }), display: "block", marginTop: 3 }}>
                        per 100g: {f.per100Protein} P, {f.per100Carbs} C, {f.per100Fat} F, {f.per100Fiber} fibre
                      </span>
                    </span>
                    <span style={num(13, { flex: "none" })}>{Math.round(f.per100Calories)} kcal</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Dialog>
      )}

      {/* targets */}
      {showGoals && (
        <Dialog title="Daily targets" onClose={() => setShowGoals(false)} maxWidth={480}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                        gap: 12, padding: "16px 18px", borderBottom: `1px solid ${C.rule}` }}>
            <h2 style={section()}>Daily targets</h2>
            <button type="button" onClick={() => setShowGoals(false)} style={ghostBtn()}>Close</button>
          </div>

          <div style={{ padding: 18 }}>
            {GOAL_FIELDS.map((f) => (
              <div key={f.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                                        gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.rule}` }}>
                <label htmlFor={`goal-${f.key}`} style={body(14, { color: C.ink })}>
                  {f.name} <span style={{ color: C.dim }}>({f.unit})</span>
                </label>
                <input
                  id={`goal-${f.key}`}
                  type="number"
                  min={0}
                  step={f.step}
                  value={goalDraft[f.key]}
                  onChange={(e) => setGoalDraft((g) => ({ ...g, [f.key]: Number(e.target.value) }))}
                  style={{ ...INPUT, width: 120, textAlign: "right" }}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={saveGoals}
              disabled={savingGoals}
              style={solidBtn({
                width: "100%", marginTop: 18,
                opacity: savingGoals ? 0.55 : 1,
                cursor: savingGoals ? "default" : "pointer",
              })}
            >
              {savingGoals ? "Saving" : "Save targets"}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
