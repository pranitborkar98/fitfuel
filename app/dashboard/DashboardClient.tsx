"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Zap, ShoppingBag, Activity, Utensils, Dumbbell, LogOut, User, ChevronRight,
  Calendar, Target, CheckCircle2, Circle, X, Clock, ChefHat, Flame, Star,
} from "lucide-react";

const T = {
  bg: "#0a0a0a", card: "#111111", border: "#1f1f1f",
  accent: "#84cc16", text: "#f9fafb",
  textSecond: "#a3a3a3", textMuted: "#737373",
};

const MEAL_LABEL: Record<string, string> = {
  BREAKFAST_LUNCH: "Breakfast + Lunch",
  SNACK_DINNER:    "Snack + Dinner",
  ALL_FOUR:        "All 4 Meals",
};
const DUR_LABEL: Record<string, string> = {
  TRIAL_DAY:             "Trial Day",
  WEEKLY:                "Weekly",
  BI_WEEKLY:             "Bi-Weekly",
  MONTHLY_EXCL_WEEKENDS: "Monthly (excl. weekends)",
  ONE_MONTH:             "1 Month",
  TWO_MONTH:             "2 Months",
  THREE_MONTH:           "3 Months",
};
const STATUS_COLOR: Record<string, string> = {
  CONFIRMED:       "#84cc16",
  PENDING_PAYMENT: "#facc15",
  CANCELLED:       "#ef4444",
  DELIVERED:       "#22c55e",
  PROCESSING:      "#60a5fa",
};

type Meal = {
  slotId: string;
  mealSlot: string;
  label: string;
  time: string;
  emoji: string;
  isLogged: boolean;
  isSkipped: boolean;
  dayNumber: number;
  recipe: {
    id: string;
    name: string;
    slug?: string;
    caloriesPerServing: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    prepTimeMins?: number;
    cookTimeMins?: number;
    cuisineType?: string;
  };
};

type ActivePlan = {
  id: string;
  currentDay: number;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  status: string;
  calorieTarget: number | null;
  proteinTarget: number | null;
  mealPlan: {
    id: string;
    name: string;
    slug: string;
    tier: string;
    category: string;
    dietaryVariant: string;
    avgCaloriesPerDay: number;
  } | null;
};

// 9D — today's plan-linked workout (from /api/user/active-plan/workout-today)
type WorkoutExerciseView = {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number | null;
  durationSecs: number | null;
  restSecs: number;
  notes: string | null;
  category: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  image: string | null;
};
type WorkoutToday = {
  hasWorkout: boolean;
  isRestDay: boolean;
  scheduleName: string;
  focusArea: string;
  estimatedCalories: number;
  durationMins?: number;
  completedToday?: boolean;
  completedCaloriesBurned?: number | null;
  exercises?: WorkoutExerciseView[];
};

// ── Meal Detail Drawer ──────────────────────────────────────────
function MealDrawer({ meal, onClose, isLogged, isLogging, onLog }: {
  meal: Meal;
  onClose: () => void;
  isLogged: boolean;
  isLogging: boolean;
  onLog: () => void;
}) {
  const totalTime = (meal.recipe.prepTimeMins ?? 0) + (meal.recipe.cookTimeMins ?? 0);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          zIndex: 1000, backdropFilter: "blur(4px)",
        }}
      />
      {/* Sheet */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#141414", borderRadius: "20px 20px 0 0",
        border: `1px solid ${T.border}`, borderBottom: "none",
        zIndex: 1001, padding: "28px 24px 40px",
        maxHeight: "85vh", overflowY: "auto",
        maxWidth: 640, margin: "0 auto",
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: "#333", borderRadius: 2, margin: "0 auto 24px" }} />

        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 20, right: 20,
          background: "#1a1a1a", border: `1px solid ${T.border}`,
          borderRadius: 8, padding: 6, cursor: "pointer", color: T.textMuted,
          display: "flex", alignItems: "center",
        }}>
          <X size={16} />
        </button>

        {/* Slot badge + emoji */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>{meal.emoji}</span>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, background: "#1a2e05", border: "1px solid #365314", borderRadius: 4, padding: "2px 8px", textTransform: "uppercase" }}>
              {meal.label}
            </span>
            <p style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>{meal.time}</p>
          </div>
        </div>

        {/* Recipe name */}
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, lineHeight: 1.3, marginBottom: 20 }}>
          {meal.recipe.name}
        </h2>

        {/* Macro grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Calories", value: meal.recipe.caloriesPerServing, unit: "kcal", color: "#f97316" },
            { label: "Protein",  value: Number(meal.recipe.proteinGrams).toFixed(1), unit: "g", color: "#60a5fa" },
            { label: "Carbs",    value: Number(meal.recipe.carbsGrams).toFixed(1),   unit: "g", color: "#facc15" },
            { label: "Fat",      value: Number(meal.recipe.fatGrams).toFixed(1),     unit: "g", color: "#a78bfa" },
          ].map(m => (
            <div key={m.label} style={{ background: "#0f0f0f", border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.value}</p>
              <p style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>{m.unit}</p>
              <p style={{ fontSize: 10, color: T.textMuted }}>{m.label}</p>
            </div>
          ))}
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          {totalTime > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.textMuted }}>
              <Clock size={13} /> {totalTime} min prep
            </div>
          )}
          {meal.recipe.cuisineType && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.textMuted }}>
              <ChefHat size={13} /> {meal.recipe.cuisineType.replace(/_/g, " ")}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.textMuted }}>
            <Flame size={13} /> Day {meal.dayNumber} of 30
          </div>
        </div>

        {/* Log button */}
        <button
          onClick={() => { onLog(); onClose(); }}
          disabled={isLogged || isLogging}
          style={{
            width: "100%", padding: "15px 0", borderRadius: 12,
            background: isLogged ? "#1a2e05" : T.accent,
            border: `1px solid ${isLogged ? "#365314" : T.accent}`,
            color: isLogged ? T.accent : "#000",
            fontSize: 14, fontWeight: 800, cursor: isLogged ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}
        >
          {isLogged
            ? <><CheckCircle2 size={16} /> Logged</>
            : isLogging
            ? "Logging..."
            : <><Circle size={16} /> I ate this</>
          }
        </button>
      </div>
    </>
  );
}


// ── Meal Progress Ring (9L) ────────────────────────────────────
function CalorieRing({ balance }: {
  balance: {
    caloriesIn: number; caloriesOut: number; net: number;
    target: number; remaining: number; status: string;
    mealsLogged: number; mealsTotal: number;
    proteinIn: number; proteinTarget: number;
  };
}) {
  const SIZE = 120;
  const STROKE = 10;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;

  const logged = balance.mealsLogged;
  const total  = balance.mealsTotal || 4;
  const pct    = Math.min(1, logged / total);
  const dash   = pct * CIRC;
  const allDone = logged >= total;
  const ringColor = allDone ? T.accent : T.accent;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      {/* Ring */}
      <div style={{ position: "relative", width: SIZE, height: SIZE, flexShrink: 0 }}>
        <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={SIZE/2} cy={SIZE/2} r={R}
            fill="none" stroke="#1a1a1a" strokeWidth={STROKE} />
          <circle cx={SIZE/2} cy={SIZE/2} r={R}
            fill="none" stroke={ringColor} strokeWidth={STROKE}
            strokeDasharray={`${dash} ${CIRC - dash}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.5s ease" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <p style={{ fontSize: 22, fontWeight: 900, color: T.text, lineHeight: 1 }}>
            {logged}<span style={{ fontSize: 12, color: T.textMuted, fontWeight: 400 }}>/{total}</span>
          </p>
          <p style={{ fontSize: 9, color: T.textMuted, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {allDone ? "✓ done" : "meals"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "Eaten",  value: `${balance.caloriesIn}`, unit: "kcal", color: T.accent },
            { label: "Burned", value: `${balance.caloriesOut}`, unit: "kcal", color: "#22c55e" },
            { label: "Target", value: `${balance.target}`, unit: "kcal", color: T.textMuted },
          ].map(s => (
            <div key={s.label} style={{ background: "#0f0f0f", border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 9, color: T.textMuted, marginTop: 2 }}>{s.unit}</p>
              <p style={{ fontSize: 9, color: T.textMuted }}>{s.label}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, background: "#0f0f0f", border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 10px" }}>
            <p style={{ fontSize: 11, color: T.textMuted, marginBottom: 2 }}>Protein today</p>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#60a5fa" }}>
              {balance.proteinIn}g
              <span style={{ fontSize: 10, fontWeight: 400, color: T.textMuted }}> / {balance.proteinTarget}g</span>
            </p>
          </div>
          <div style={{ flex: 1, background: "#0f0f0f", border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 10px" }}>
            <p style={{ fontSize: 11, color: T.textMuted, marginBottom: 2 }}>Remaining</p>
            <p style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
              {total - logged} meal{total - logged !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 9D Today's Workout Card ─────────────────────────────────────
function WorkoutCard({ workout, completing, onComplete }: {
  workout: WorkoutToday;
  completing: boolean;
  onComplete: () => void;
}) {
  const done = !!workout.completedToday;

  // Rest day — calm, no CTA
  if (workout.isRestDay) {
    return (
      <div style={{
        marginBottom: 20, background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 14, padding: "16px 18px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: "#0f0f0f",
          border: `1px solid ${T.border}`, display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Activity size={18} color={T.textSecond} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Rest Day</p>
          <p style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
            {workout.focusArea} · recovery keeps fat loss going
          </p>
        </div>
      </div>
    );
  }

  const fmtSet = (e: WorkoutExerciseView) =>
    e.durationSecs != null
      ? `${e.sets} × ${e.durationSecs >= 60 ? `${Math.round(e.durationSecs / 60)} min` : `${e.durationSecs}s`}`
      : `${e.sets} × ${e.reps ?? "—"}`;

  return (
    <div style={{
      marginBottom: 20, background: T.card,
      border: `1px solid ${done ? "#365314" : T.border}`,
      borderRadius: 14, padding: "16px 18px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, background: "#1a2e05",
            border: "1px solid #365314", display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Dumbbell size={17} color={T.accent} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>
              Today's Workout
            </p>
            <p style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{workout.focusArea}</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#22c55e", lineHeight: 1 }}>
            ~{workout.estimatedCalories}
          </p>
          <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>kcal burn</p>
        </div>
      </div>

      {/* Exercise list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        {(workout.exercises ?? []).map((e) => (
          <div key={e.exerciseId} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#0f0f0f", border: `1px solid ${T.border}`,
            borderRadius: 9, padding: "9px 12px",
          }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {e.name}
              </p>
              {e.notes && (
                <p style={{ fontSize: 10.5, color: T.textMuted, marginTop: 1 }}>{e.notes}</p>
              )}
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: T.accent, flexShrink: 0, marginLeft: 10 }}>
              {fmtSet(e)}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      {done ? (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          background: "#1a2e05", border: "1px solid #365314", borderRadius: 10,
          padding: "11px", color: T.accent, fontSize: 13, fontWeight: 700,
        }}>
          <CheckCircle2 size={16} /> Workout complete · {workout.estimatedCalories} kcal logged
        </div>
      ) : (
        <button
          onClick={onComplete}
          disabled={completing}
          style={{
            width: "100%", background: completing ? "#1a1a1a" : T.accent,
            color: completing ? T.textMuted : "#0a0a0a",
            border: "none", borderRadius: 10, padding: "11px",
            fontSize: 13, fontWeight: 800, cursor: completing ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background 0.2s ease",
          }}
        >
          <Flame size={16} /> {completing ? "Logging…" : "Mark Workout Complete"}
        </button>
      )}
    </div>
  );
}

// ── Star Rating Modal ───────────────────────────────────────────
function StarRatingModal({ meal, onClose, onSubmit }: {
  meal: Meal;
  onClose: () => void;
  onSubmit: (rating: number, note: string) => Promise<void>;
}) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const LABELS = ["", "Didn't like it", "It was okay", "Pretty good", "Really liked it", "Loved it!"];

  async function handleSubmit(star: number) {
    if (submitting) return;
    setSelected(star);
    setSubmitting(true);
    await onSubmit(star, note);
    onClose();
  }

  async function handleSubmitWithNote() {
    if (!selected || submitting) return;
    setSubmitting(true);
    await onSubmit(selected, note);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
          zIndex: 1100, backdropFilter: "blur(6px)",
        }}
      />
      {/* Centering wrapper */}
      <div style={{
        position: "fixed", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1101, pointerEvents: "none",
        padding: "0 16px",
      }}>
        {/* Sheet */}
        <div style={{
          width: "100%", maxWidth: 460,
          background: "#141414", borderRadius: 20,
          border: `1px solid ${T.border}`,
          padding: "28px 28px 36px",
          textAlign: "center",
          pointerEvents: "all",
          position: "relative",
        }}>
          {/* Close X instead of handle for centered modal */}

          {/* Skip */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 20, right: 20,
              background: "transparent", border: "none",
              fontSize: 12, color: T.textMuted, cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            Skip
          </button>

          {/* Emoji */}
          <div style={{ fontSize: 34, marginBottom: 10 }}>{meal.emoji}</div>

          {/* Heading */}
          <h3 style={{ fontSize: 17, fontWeight: 800, color: T.text, marginBottom: 4 }}>
            How was it?
          </h3>
          <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 24, lineHeight: 1.5 }}>
            {meal.recipe.name}
          </p>

          {/* Stars */}
          <div
            style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 12 }}
            onMouseLeave={() => setHovered(0)}
          >
            {[1, 2, 3, 4, 5].map(star => {
              const active = star <= (hovered || selected);
              return (
                <button
                  key={star}
                  disabled={submitting}
                  onMouseEnter={() => setHovered(star)}
                  onClick={() => setSelected(star)}
                  style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    padding: 4, transition: "transform 0.12s",
                    transform: active ? "scale(1.18)" : "scale(1)",
                  }}
                >
                  <Star
                    size={34}
                    fill={active ? T.accent : "transparent"}
                    color={active ? T.accent : "#404040"}
                    strokeWidth={1.5}
                  />
                </button>
              );
            })}
          </div>

          {/* Dynamic label */}
          <p style={{
            fontSize: 13, fontWeight: 600,
            color: (hovered || selected) ? T.accent : T.textMuted,
            minHeight: 20, marginBottom: 20, transition: "color 0.15s",
          }}>
            {LABELS[hovered || selected] ?? ""}
          </p>

          {/* Note input */}
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note (optional) — too spicy, loved the texture..."
            maxLength={200}
            rows={2}
            style={{
              width: "100%", background: "#0f0f0f",
              border: `1px solid ${note ? T.accent + "55" : T.border}`,
              borderRadius: 10, padding: "10px 12px",
              fontSize: 13, color: T.text, resize: "none",
              outline: "none", marginBottom: 16,
              fontFamily: "inherit", lineHeight: 1.5,
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
          />

          {/* Submit button — shown once a star is selected */}
          {selected > 0 && (
            <button
              onClick={handleSubmitWithNote}
              disabled={submitting}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 10,
                background: T.accent, border: "none",
                color: "#000", fontSize: 14, fontWeight: 800,
                cursor: submitting ? "default" : "pointer",
                textTransform: "uppercase", letterSpacing: "0.06em",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Saving…" : "Submit Rating"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────
export default function DashboardClient({
  session, orders, user, activePlan, hasPendingOrder,
}: {
  session: any;
  orders: any[];
  user: any;
  activePlan: ActivePlan | null;
  hasPendingOrder?: boolean;
}) {
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealsLoading, setMealsLoading] = useState(false);
  const [loggingSlot, setLoggingSlot] = useState<string | null>(null);
  const [loggedSlots, setLoggedSlots] = useState<Set<string>>(new Set());
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [ratingMeal, setRatingMeal] = useState<Meal | null>(null);
  const [balance, setBalance] = useState<{
    caloriesIn: number; caloriesOut: number; net: number;
    target: number; remaining: number; status: string;
    mealsLogged: number; mealsTotal: number;
    proteinIn: number; proteinTarget: number;
  } | null>(null);
  const [workout, setWorkout] = useState<WorkoutToday | null>(null);
  const [completingWorkout, setCompletingWorkout] = useState(false);

  useEffect(() => {
    if (!activePlan) return;
    setMealsLoading(true);
    fetch("/api/user/active-plan/meals/today")
      .then(r => r.json())
      .then(data => {
        if (data.meals) {
          setMeals(data.meals);
          const logged = new Set<string>(
            data.meals.filter((m: Meal) => m.isLogged).map((m: Meal) => m.slotId)
          );
          setLoggedSlots(logged);
        }
      })
      .finally(() => setMealsLoading(false));

    // 9L: fetch calorie balance
    fetch("/api/user/active-plan/calorie-balance")
      .then(r => r.json())
      .then(data => { if (data.target) setBalance(data); });

    // 9D: fetch today's plan-linked workout
    fetch("/api/user/active-plan/workout-today")
      .then(r => r.json())
      .then(data => { if (data.hasWorkout) setWorkout(data); });
  }, [activePlan]);

  async function handleLogMeal(meal: Meal) {
    if (loggedSlots.has(meal.slotId) || loggingSlot === meal.slotId) return;
    setLoggingSlot(meal.slotId);
    try {
      const res = await fetch("/api/user/active-plan/meals/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planScheduleSlotId: meal.slotId,
          dayNumber: meal.dayNumber,
        }),
      });
      if (res.ok || res.status === 409) {
        setLoggedSlots(prev => new Set([...prev, meal.slotId]));
        // refresh calorie balance ring
        fetch("/api/user/active-plan/calorie-balance")
          .then(r => r.json())
          .then(data => { if (data.target) setBalance(data); });
        // 9K: close drawer then show star rating prompt
        setSelectedMeal(null);
        setRatingMeal(meal);
      }
    } finally {
      setLoggingSlot(null);
    }
  }

  async function handleRateMeal(meal: Meal, rating: number, note: string) {
    try {
      await fetch("/api/user/active-plan/meals/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealSlot: meal.mealSlot,
          logDate: new Date().toISOString(),
          rating,
          note: note.trim() || undefined,
        }),
      });
    } catch {
      // Rating is non-blocking — silently ignore network errors
    }
  }

  async function handleCompleteWorkout() {
    if (completingWorkout || workout?.completedToday || workout?.isRestDay) return;
    setCompletingWorkout(true);
    try {
      const res = await fetch("/api/user/active-plan/workout/complete", { method: "POST" });
      if (res.ok || res.status === 409) {
        setWorkout(prev => (prev ? { ...prev, completedToday: true } : prev));
        // refresh ring so Burned reflects the logged session
        fetch("/api/user/active-plan/calorie-balance")
          .then(r => r.json())
          .then(data => { if (data.target) setBalance(data); });
      }
    } finally {
      setCompletingWorkout(false);
    }
  }

  const totalCalories = meals.reduce((sum, m) => sum + (m.recipe?.caloriesPerServing ?? 0), 0);
  const loggedCalories = meals
    .filter(m => loggedSlots.has(m.slotId))
    .reduce((sum, m) => sum + (m.recipe?.caloriesPerServing ?? 0), 0);
  const calorieTarget = activePlan?.calorieTarget ?? activePlan?.mealPlan?.avgCaloriesPerDay ?? 1600;
  const progressPct = Math.min(100, Math.round((loggedCalories / calorieTarget) * 100));
  const dayProgress = activePlan ? Math.round((activePlan.currentDay / 30) * 100) : 0;

  return (
    <div style={{ background: T.bg, minHeight: "100vh", paddingTop: 88, paddingBottom: 80, color: T.text }}>

      {/* Meal Detail Drawer */}
      {selectedMeal && (
        <MealDrawer
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
          isLogged={loggedSlots.has(selectedMeal.slotId)}
          isLogging={loggingSlot === selectedMeal.slotId}
          onLog={() => handleLogMeal(selectedMeal)}
        />
      )}

      {/* 9K: Star rating prompt shown after "I ate this" */}
      {ratingMeal && (
        <StarRatingModal
          meal={ratingMeal}
          onClose={() => setRatingMeal(null)}
          onSubmit={(rating, note) => handleRateMeal(ratingMeal, rating, note)}
        />
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${T.border}`, overflow: "hidden", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {user?.image
                ? <img src={user.image} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <User size={22} color={T.textMuted} />}
            </div>
            <div>
              <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 3 }}>Welcome back</p>
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", lineHeight: 1 }}>
                {firstName} <span style={{ color: T.accent }}>💪</span>
              </h1>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, color: T.textMuted, cursor: "pointer" }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* Active Plan Card */}
        {activePlan ? (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px 20px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.accent}, transparent)` }} />

            {/* Plan header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Active Plan</p>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{activePlan.mealPlan?.name}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: T.accent, background: "#1a2e05", border: "1px solid #365314", borderRadius: 4, padding: "2px 7px", fontWeight: 700 }}>
                    {activePlan.mealPlan?.tier}
                  </span>
                  <span style={{ fontSize: 11, color: T.textMuted }}>·</span>
                  <span style={{ fontSize: 11, color: T.textMuted }}>{activePlan.mealPlan?.dietaryVariant}</span>
                  <span style={{ fontSize: 11, color: T.textMuted }}>·</span>
                  <span style={{ fontSize: 11, color: T.textMuted }}>{activePlan.daysRemaining} days remaining</span>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontSize: 26, fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", color: T.accent, lineHeight: 1 }}>
                  Day {activePlan.currentDay}
                </p>
                <p style={{ fontSize: 11, color: T.textMuted }}>of 30</p>
              </div>
            </div>

            {/* Day progress bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: T.textMuted }}>Plan progress</span>
                <span style={{ fontSize: 12, color: T.textMuted }}>{dayProgress}%</span>
              </div>
              <div style={{ height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${dayProgress}%`, background: T.accent, borderRadius: 2, transition: "width 0.6s ease" }} />
              </div>
            </div>

            {/* 9L — Net Calorie Ring */}
            {balance && (
              <div style={{ marginBottom: 20 }}>
                <CalorieRing balance={balance} />
              </div>
            )}

            {/* 9D — Today's Workout */}
            {workout?.hasWorkout && (
              <WorkoutCard
                workout={workout}
                completing={completingWorkout}
                onComplete={handleCompleteWorkout}
              />
            )}

            {/* Today's Meals */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Today's Meals</p>
                {calorieTarget && (
                  <p style={{ fontSize: 12, color: T.textMuted }}>
                    {loggedCalories} / {calorieTarget} kcal
                    {loggedCalories > 0 && (
                      <span style={{ color: T.accent, marginLeft: 6 }}>({progressPct}%)</span>
                    )}
                  </p>
                )}
              </div>

              {mealsLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ height: 56, background: "#0f0f0f", borderRadius: 10, border: `1px solid ${T.border}` }} />
                  ))}
                </div>
              ) : meals.length === 0 ? (
                <div style={{ background: "#0f0f0f", border: `1px dashed ${T.border}`, borderRadius: 10, padding: "20px 24px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: T.textMuted }}>No meals scheduled for today. Your plan may not have a schedule set up yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {meals.map(meal => {
                    const isLogged = loggedSlots.has(meal.slotId);
                    const isLogging = loggingSlot === meal.slotId;
                    return (
                      <div
                        key={meal.slotId}
                        onClick={() => setSelectedMeal(meal)}
                        style={{
                          background: "#0f0f0f",
                          border: `1px solid ${isLogged ? "#365314" : T.border}`,
                          borderRadius: 10,
                          padding: "12px 14px",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          cursor: "pointer",
                          transition: "border-color 0.2s, background 0.15s",
                        }}
                        onMouseEnter={e => { if (!isLogged) e.currentTarget.style.borderColor = "#333"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = isLogged ? "#365314" : T.border; }}
                      >
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{meal.emoji}</span>

                        {/* Name + macros — flex col, truncates on mobile */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 13, fontWeight: 700,
                            color: isLogged ? T.accent : T.text,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            marginBottom: 2,
                          }}>
                            {meal.recipe?.name ?? meal.label}
                          </p>
                          <p style={{ fontSize: 11, color: T.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {Number(meal.recipe?.proteinGrams ?? 0).toFixed(0)}g P
                            {" · "}{Number(meal.recipe?.fatGrams ?? 0).toFixed(0)}g F
                            {" · "}{Number(meal.recipe?.carbsGrams ?? 0).toFixed(0)}g C
                            {" · "}{meal.recipe?.caloriesPerServing} kcal
                          </p>
                        </div>

                        {/* Time — hidden on very small screens via explicit min-width check */}
                        <span style={{ fontSize: 11, color: T.textMuted, flexShrink: 0, display: "none" }}
                          className="meal-time"
                        >{meal.time}</span>

                        {/* Log button — stops propagation so card click doesn't double-fire */}
                        <button
                          onClick={e => { e.stopPropagation(); handleLogMeal(meal); }}
                          disabled={isLogged || isLogging}
                          style={{
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            background: isLogged ? "#1a2e05" : "transparent",
                            border: `1px solid ${isLogged ? "#365314" : T.border}`,
                            borderRadius: 6,
                            padding: "6px 10px",
                            fontSize: 11,
                            fontWeight: 700,
                            color: isLogged ? T.accent : T.textMuted,
                            cursor: isLogged ? "default" : "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isLogged
                            ? <><CheckCircle2 size={11} /> Logged</>
                            : isLogging
                            ? "..."
                            : <><Circle size={11} /> I ate this</>
                          }
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Calorie progress bar */}
              {loggedCalories > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ height: 3, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progressPct}%`, background: progressPct >= 100 ? "#ef4444" : T.accent, borderRadius: 2, transition: "width 0.4s ease" }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : hasPendingOrder ? (
          /* Confirmed order exists but no active plan — needs onboarding */
          <div style={{ background: T.card, border: `1px solid #365314`, borderRadius: 16, padding: "28px 20px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.accent}, transparent)` }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: T.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Order Confirmed ✓</p>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>One step left — personalise your plan</h2>
                <p style={{ fontSize: 14, color: T.textSecond, lineHeight: 1.6 }}>
                  Your order is confirmed. Complete the 2-minute setup so we know your calorie target, diet, and goals before your meals start.
                </p>
              </div>
              <div>
                <Link href="/onboarding" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.accent, color: "#000", fontWeight: 800, fontSize: 13, textDecoration: "none", padding: "13px 28px", borderRadius: 8, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                  <Zap size={14} fill="currentColor" /> Set Up My Plan
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* No active plan, no confirmed order */
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 20px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.accent}, transparent)` }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Active Plan</p>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>No active plan yet</h2>
                <p style={{ fontSize: 14, color: T.textSecond, lineHeight: 1.6 }}>
                  Start with a trial day for just ₹399 — 4 meals, fully personalised.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/plans" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.accent, color: "#000", fontWeight: 800, fontSize: 13, textDecoration: "none", padding: "11px 22px", borderRadius: 8, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                  <Zap size={14} fill="currentColor" /> Order Now
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px 20px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <ShoppingBag size={18} color={T.accent} />
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Orders</h2>
            <span style={{ fontSize: 12, color: T.textMuted, marginLeft: 4 }}>({orders.length})</span>
          </div>

          {orders.length === 0 ? (
            <div style={{ border: `1px dashed ${T.border}`, borderRadius: 10, padding: "32px 24px", textAlign: "center" }}>
              <ShoppingBag size={32} color={T.border} style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: 14, color: T.textMuted }}>No orders yet. Your order history will appear here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {orders.map((order: any) => {
                const item = order.items?.[0];
                return (
                  <div key={order.id} style={{ background: "#0f0f0f", border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{order.orderNumber}</p>
                      <p style={{ fontSize: 12, color: T.textMuted }}>
                        {item ? `${MEAL_LABEL[item.mealsPerDay] ?? item.mealsPerDay} · ${DUR_LABEL[item.duration] ?? item.duration}` : "—"}
                      </p>
                      <p style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>₹{order.totalRs.toLocaleString("en-IN")}</p>
                      <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLOR[order.status] ?? T.textMuted, background: "#1a1a1a", border: `1px solid ${T.border}`, borderRadius: 4, padding: "2px 8px" }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Features */}
        <p style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Features</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 32 }}>

          <Link href="/dashboard/body-metrics" style={{ textDecoration: "none" }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 20px", display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#365314")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1a2e05", border: `1px solid #365314`, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, flexShrink: 0 }}>
                <Activity size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Body Metrics</p>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.accent, background: "#1a2e05", border: `1px solid #365314`, borderRadius: 4, padding: "2px 6px" }}>LIVE</span>
                </div>
                <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>Track 18 body composition parameters — connect your FitDays BLE scale or log manually.</p>
              </div>
              <ChevronRight size={16} color={T.textMuted} style={{ flexShrink: 0, marginTop: 2 }} />
            </div>
          </Link>

          <Link href="/dashboard/nutrition" style={{ textDecoration: "none" }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 20px", display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#365314")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1a2e05", border: `1px solid #365314`, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, flexShrink: 0 }}>
                <Utensils size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Nutrition Tracker</p>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.accent, background: "#1a2e05", border: `1px solid #365314`, borderRadius: 4, padding: "2px 6px" }}>LIVE</span>
                </div>
                <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>Log meals, track calories, macros and water daily.</p>
              </div>
              <ChevronRight size={16} color={T.textMuted} style={{ flexShrink: 0, marginTop: 2 }} />
            </div>
          </Link>

          <Link href="/dashboard/exercises" style={{ textDecoration: "none" }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 20px", display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#365314")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1a2e05", border: `1px solid #365314`, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, flexShrink: 0 }}>
                <Dumbbell size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Exercise Library</p>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.accent, background: "#1a2e05", border: `1px solid #365314`, borderRadius: 4, padding: "2px 6px" }}>LIVE</span>
                </div>
                <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>873 exercises — browse, log workouts, track sets and burned kcal.</p>
              </div>
              <ChevronRight size={16} color={T.textMuted} style={{ flexShrink: 0, marginTop: 2 }} />
            </div>
          </Link>

        </div>

        {/* Account */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Account</h2>
            <Link href="/dashboard/profile" style={{ fontSize: 13, fontWeight: 600, color: T.accent, textDecoration: "none" }}>
              Edit Profile →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Row label="Name"  value={user?.name  ?? "—"} />
            <Row label="Email" value={user?.email ?? "—"} />
            <Row label="Phone" value={user?.phone ?? "—"} />
            <Row label="Role"  value={user?.role  ?? "CUSTOMER"} />
          </div>
        </div>

      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #161616", gap: 12 }}>
      <span style={{ fontSize: 13, color: "#737373", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#f9fafb", textAlign: "right", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}