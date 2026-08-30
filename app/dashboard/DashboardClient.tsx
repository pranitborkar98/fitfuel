"use client";

// app/dashboard/DashboardClient.tsx
//
// Today.
//
// The largest thing removed here is a second navigation. A "Features" grid of
// six tiles linked to Body Metrics, Nutrition, Exercises, Progress, Supplements
// and Notifications, which is the sidebar, drawn again, in a uniform icon plus
// title plus paragraph grid that §11 rejects by name. app/_app/nav.ts opens by
// saying it is "the only place the app's navigation is declared", and this was
// the other place, already drifted: every tile wore a LIVE badge, one promised
// "FitDays BLE scale sync coming soon", and none of them knew about Coach or
// Referrals. The sidebar is on every screen. Today does not need to relist it.
//
// The header went with it. It carried a second sign out and a second greeting,
// both of which the shell owns.
//
// The palette was the usual: an orange, a blue, a yellow, a purple and a green
// for four macros and five order states, meaning carried by hue alone.

import { useEffect, useState } from "react";
import Link from "next/link";

import DeliveryConfirmCard from "./DeliveryConfirmCard";
import DeliveryScheduleCard from "./DeliveryScheduleCard";
import WeeklyReviewCard from "./WeeklyReviewCard";
import Dialog from "@/app/_app/Dialog";
import {
  C, SANS, body, label, num, figure, section, PANEL, solidBtn, ghostBtn,
} from "@/app/_app/theme";
import type { ActivePlanView } from "./page";
import s from "./dashboard.module.css";

/* ── types ──────────────────────────────────────────────────────────────── */

type Meal = {
  slotId: string; mealSlot: string; label: string; time: string; emoji: string;
  isLogged: boolean; isSkipped: boolean; dayNumber: number;
  recipe: {
    id: string; name: string; slug?: string;
    caloriesPerServing: number; proteinGrams: number;
    carbsGrams: number; fatGrams: number;
    prepTimeMins?: number; cookTimeMins?: number; cuisineType?: string;
    imageUrl?: string | null;
  };
};

type WorkoutExerciseView = {
  exerciseId: string; name: string; sets: number; reps: number | null;
  durationSecs: number | null; restSecs: number; notes: string | null;
};

type WorkoutToday = {
  hasWorkout: boolean; isRestDay: boolean; scheduleName: string;
  focusArea: string; estimatedCalories: number; durationMins?: number;
  completedToday?: boolean; completedCaloriesBurned?: number | null;
  exercises?: WorkoutExerciseView[];
};

type Consistency = {
  score: number; label: string;
  meals: { logged: number; delivered: number };
  workouts: { completed: number; scheduled: number };
};

type Balance = {
  caloriesIn: number; caloriesOut: number; net: number;
  target: number; remaining: number; status: string;
  mealsLogged: number; mealsTotal: number;
  proteinIn: number; proteinTarget: number;
};

type OrderItem = { mealsPerDay?: string | null; duration?: string | null; dishName?: string | null };
type Order = {
  id: string; orderNumber: string; status: string; totalRs: number;
  createdAt: string; items?: OrderItem[];
};

const MEAL_LABEL: Record<string, string> = {
  BREAKFAST_LUNCH: "Breakfast and lunch",
  SNACK_DINNER: "Snack and dinner",
  ALL_FOUR: "All four meals",
};
const DUR_LABEL: Record<string, string> = {
  TRIAL_DAY: "Trial day",
  WEEKLY: "Weekly",
  BI_WEEKLY: "Fortnightly",
  MONTHLY_EXCL_WEEKENDS: "Monthly, excluding weekends",
  ONE_MONTH: "One month",
  TWO_MONTH: "Two months",
  THREE_MONTH: "Three months",
};
/** Order state is a word. It used to be five hues with the raw enum inside. */
const ORDER_STATUS: Record<string, string> = {
  CONFIRMED: "Confirmed",
  PENDING_PAYMENT: "Payment pending",
  CANCELLED: "Cancelled",
  DELIVERED: "Delivered",
  PROCESSING: "Being prepared",
};

const n0 = (v: number) => Math.round(v).toLocaleString("en-IN");

function cssImage(url: string | null | undefined): string | undefined {
  const raw = String(url || "").trim();
  if (!raw || /["\\\r\n]/.test(raw)) return undefined;
  if (raw.startsWith("/") && !raw.startsWith("//")) return `url("${raw}")`;
  try {
    const parsed = new URL(raw);
    return ["http:", "https:"].includes(parsed.protocol) ? `url("${parsed.toString()}")` : undefined;
  } catch {
    return undefined;
  }
}

/* ── pieces ─────────────────────────────────────────────────────────────── */

function Spine({ children }: { children: string }) {
  return (
    <div className={s.sectionBreak}>
      <h2>{children}</h2>
    </div>
  );
}

function Meter({ name, value, goal, unit, on }: {
  name: string; value: number; goal: number; unit: string; on: boolean;
}) {
  const w = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  return (
    <div className={s.meter}>
      <div className={s.meterLabel}>
        <span>{name}</span>
        <strong>{n0(value)} / {n0(goal)}{unit}</strong>
      </div>
      <div className={s.meterTrack}>
        <div className={s.meterFill} style={{ width: `${w}%`, background: on ? C.lime : C.fat }} />
      </div>
    </div>
  );
}

function MealDialog({ meal, cycleDays, logged, logging, onLog, onClose }: {
  meal: Meal; cycleDays: number; logged: boolean; logging: boolean; onLog: () => void; onClose: () => void;
}) {
  const prep = (meal.recipe.prepTimeMins ?? 0) + (meal.recipe.cookTimeMins ?? 0);
  return (
    <Dialog title={meal.recipe.name} onClose={onClose} maxWidth={520}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                    gap: 12, padding: "18px 18px 14px", borderBottom: `1px solid ${C.rule}` }}>
        <div style={{ minWidth: 0 }}>
          <span style={label(12, { display: "block", marginBottom: 8, color: logged ? C.lime : C.dim })}>
            {meal.label}, {meal.time}
          </span>
          <h2 style={section()}>{meal.recipe.name}</h2>
        </div>
        <button type="button" onClick={onClose} style={ghostBtn()}>Close</button>
      </div>

      <div style={{ padding: 18 }}>
        <div style={{ display: "grid", gap: 1, background: C.rule, border: `1px solid ${C.rule}`,
                      gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))" }}>
          {[
            { k: "kcal", v: n0(meal.recipe.caloriesPerServing), on: true },
            { k: "Protein g", v: n0(Number(meal.recipe.proteinGrams)), on: true },
            { k: "Carbs g", v: n0(Number(meal.recipe.carbsGrams)), on: false },
            { k: "Fat g", v: n0(Number(meal.recipe.fatGrams)), on: false },
          ].map((m) => (
            <div key={m.k} style={{ background: C.bg, padding: "12px 14px" }}>
              <span style={figure(24, { display: "block", color: m.on ? C.lime : C.ink })}>{m.v}</span>
              <span style={label(12, { display: "block", marginTop: 6 })}>{m.k}</span>
            </div>
          ))}
        </div>

        <p style={body(13, { marginTop: 14 })}>
          Day {meal.dayNumber} of {cycleDays}
          {prep > 0 ? `, ${prep} min to prepare` : ""}
          {meal.recipe.cuisineType ? `, ${meal.recipe.cuisineType.replace(/_/g, " ").toLowerCase()}` : ""}
        </p>

        <button
          type="button"
          onClick={() => { onLog(); onClose(); }}
          disabled={logged || logging}
          style={solidBtn({
            width: "100%", marginTop: 18,
            opacity: logged || logging ? 0.55 : 1,
            cursor: logged ? "default" : "pointer",
          })}
        >
          {logged ? "Already logged" : logging ? "Logging" : "I ate this"}
        </button>
      </div>
    </Dialog>
  );
}

function RatingDialog({ meal, onClose, onSubmit }: {
  meal: Meal; onClose: () => void; onSubmit: (rating: number, note: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState(0);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const LABELS = ["", "Did not like it", "It was okay", "Pretty good", "Really liked it", "Loved it"];

  async function submit() {
    if (!selected || saving) return;
    setSaving(true);
    await onSubmit(selected, note);
    onClose();
  }

  return (
    <Dialog title="Rate this meal" onClose={onClose} maxWidth={440}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 12, padding: "16px 18px", borderBottom: `1px solid ${C.rule}` }}>
        <h2 style={section()}>How was it?</h2>
        <button type="button" onClick={onClose} style={ghostBtn()}>Skip</button>
      </div>

      <div style={{ padding: 18 }}>
        <p style={body(14, { color: C.ink })}>{meal.recipe.name}</p>

        <div role="radiogroup" aria-label="Rating out of five"
             style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5].map((star) => {
            const on = star <= selected;
            return (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={star === selected}
                aria-label={`${star} out of 5, ${LABELS[star].toLowerCase()}`}
                onClick={() => setSelected(star)}
                style={{
                  minWidth: 52, minHeight: 44, cursor: "pointer",
                  background: on ? C.lime : "transparent",
                  border: `1px solid ${on ? C.lime : C.rule2}`,
                  color: on ? C.onLime : C.mute,
                  fontFamily: SANS, fontWeight: 700, fontSize: 16,
                  transition: "background-color 180ms ease-out, border-color 180ms ease-out",
                }}
              >
                {star}
              </button>
            );
          })}
        </div>

        <p style={{ ...label(12, { color: selected ? C.lime : C.dim }), minHeight: 18, marginTop: 12 }}>
          {LABELS[selected] ?? ""}
        </p>

        <label htmlFor="rating-note" style={label(12, { display: "block", margin: "16px 0 8px" })}>
          Anything to add
        </label>
        <textarea
          id="rating-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Too spicy, loved the texture"
          maxLength={200}
          rows={3}
          style={{
            width: "100%", boxSizing: "border-box", background: C.bg, color: C.ink,
            border: `1px solid ${C.rule2}`, padding: "10px 12px", fontSize: 14,
            lineHeight: 1.55, resize: "vertical", fontFamily: "inherit", outline: "none",
          }}
        />

        <button
          type="button"
          onClick={submit}
          disabled={!selected || saving}
          style={solidBtn({
            width: "100%", marginTop: 14,
            opacity: !selected || saving ? 0.55 : 1,
            cursor: !selected || saving ? "default" : "pointer",
          })}
        >
          {saving ? "Saving" : "Submit rating"}
        </button>
      </div>
    </Dialog>
  );
}

/* ── main ───────────────────────────────────────────────────────────────── */

export default function DashboardClient({
  orders, activePlan, hasActivationIssue,
}: {
  orders: Order[];
  activePlan: ActivePlanView | null;
  hasActivationIssue?: boolean;
}) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealsLoading, setMealsLoading] = useState(!!activePlan);
  const [loggingSlot, setLoggingSlot] = useState<string | null>(null);
  const [loggedSlots, setLoggedSlots] = useState<Set<string>>(new Set());
  const [openMeal, setOpenMeal] = useState<Meal | null>(null);
  const [ratingMeal, setRatingMeal] = useState<Meal | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [workout, setWorkout] = useState<WorkoutToday | null>(null);
  const [completingWorkout, setCompletingWorkout] = useState(false);
  const [consistency, setConsistency] = useState<Consistency | null>(null);

  useEffect(() => {
    if (!activePlan) return;
    let alive = true;

    fetch("/api/user/active-plan/meals/today")
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d.meals) return;
        setMeals(d.meals);
        setLoggedSlots(new Set<string>(
          d.meals.filter((m: Meal) => m.isLogged).map((m: Meal) => m.slotId),
        ));
      })
      .finally(() => { if (alive) setMealsLoading(false); });

    fetch("/api/user/active-plan/calorie-balance")
      .then((r) => r.json()).then((d) => { if (alive && d.target) setBalance(d); }).catch(() => {});
    fetch("/api/user/active-plan/workout-today")
      .then((r) => r.json()).then((d) => { if (alive && d.hasWorkout) setWorkout(d); }).catch(() => {});
    fetch("/api/user/active-plan/consistency")
      .then((r) => r.json()).then((d) => { if (alive && typeof d.score === "number") setConsistency(d); }).catch(() => {});

    return () => { alive = false; };
  }, [activePlan]);

  function refreshBalance() {
    fetch("/api/user/active-plan/calorie-balance")
      .then((r) => r.json()).then((d) => { if (d.target) setBalance(d); }).catch(() => {});
  }

  async function logMeal(meal: Meal) {
    if (loggedSlots.has(meal.slotId) || loggingSlot === meal.slotId) return;
    setLoggingSlot(meal.slotId);
    try {
      const res = await fetch("/api/user/active-plan/meals/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planScheduleSlotId: meal.slotId, dayNumber: meal.dayNumber }),
      });
      if (res.ok || res.status === 409) {
        setLoggedSlots((p) => new Set([...p, meal.slotId]));
        refreshBalance();
        setOpenMeal(null);
        setRatingMeal(meal);
      }
    } finally {
      setLoggingSlot(null);
    }
  }

  async function rateMeal(meal: Meal, rating: number, note: string) {
    try {
      await fetch("/api/user/active-plan/meals/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealSlot: meal.mealSlot,
          rating,
          note: note.trim() || undefined,
        }),
      });
    } catch {
      // Rating is not load bearing. A failure here must not block the log.
    }
  }

  async function completeWorkout() {
    if (completingWorkout || workout?.completedToday || workout?.isRestDay) return;
    setCompletingWorkout(true);
    try {
      const res = await fetch("/api/user/active-plan/workout/complete", { method: "POST" });
      if (res.ok || res.status === 409) {
        setWorkout((p) => (p ? { ...p, completedToday: true } : p));
        refreshBalance();
      }
    } finally {
      setCompletingWorkout(false);
    }
  }

  const target = balance?.target
    ?? activePlan?.calorieTarget
    ?? activePlan?.mealPlan?.avgCaloriesPerDay
    ?? 0;
  const eaten = balance?.caloriesIn ?? 0;
  const burned = balance?.caloriesOut ?? 0;
  const remaining = target - (eaten - burned);
  const energyProgress = target > 0
    ? Math.max(0, Math.min(100, ((eaten - burned) / target) * 100))
    : 0;
  const setsLabel = (e: WorkoutExerciseView) =>
    e.durationSecs != null
      ? `${e.sets} x ${e.durationSecs >= 60 ? `${Math.round(e.durationSecs / 60)} min` : `${e.durationSecs}s`}`
      : `${e.sets} x ${e.reps ?? "?"}`;

  /* ── no plan states ── */

  if (!activePlan) {
    return (
      <>
        <DeliveryConfirmCard />
        <div style={{ ...PANEL, borderColor: hasActivationIssue ? C.danger : C.rule, padding: 20, marginTop: 20 }}>
          <span style={label(12, { display: "block", marginBottom: 10, color: hasActivationIssue ? C.danger : C.dim })}>
            {hasActivationIssue ? "Order needs attention" : "No active plan"}
          </span>
          <h2 style={section()}>
            {hasActivationIssue ? "Your paid plan was not attached correctly" : "You do not have a plan running"}
          </h2>
          <p style={body(14, { margin: "10px 0 16px", maxWidth: "62ch" })}>
            {hasActivationIssue
              ? "Your order is safe, but the dashboard needs our team to reconnect it before meal service starts."
              : "Start with breakfast and lunch for one delivery day. The ₹420 total includes delivery, packaging and GST."}
          </p>
          <Link
            href={hasActivationIssue ? "/contact" : "/plans?trial=true"}
            style={solidBtn({ textDecoration: "none" })}
          >
            {hasActivationIssue ? "Contact support" : "See the trial day"}
          </Link>
        </div>
        <RecentOrders orders={orders} />
      </>
    );
  }

  /* ── the day ── */

  return (
    <>
      <DeliveryConfirmCard />

      <section className={s.daySummary} aria-label="Today's energy and plan">
        <div className={s.energy}>
          <p className={s.eyebrow}>{remaining >= 0 ? "Still available today" : "Above today’s target"}</p>
          <div className={s.energyLine}>
            <span className={s.energyValue} style={{ color: remaining < 0 ? C.danger : undefined }}>
              {remaining >= 0 ? n0(remaining) : `+${n0(-remaining)}`}
            </span>
            <span className={s.energyUnit}>kcal</span>
          </div>
          <div className={s.energyBar} aria-hidden="true">
            <div className={s.energyFill} style={{ width: `${energyProgress}%` }} />
          </div>
          <p className={s.planLine}>
            {activePlan.mealPlan?.displayName || activePlan.mealPlan?.name}
            {`, ${activePlan.daysRemaining} service day${activePlan.daysRemaining === 1 ? "" : "s"} left.`}
            {activePlan.isDigital && activePlan.mealPlan?.slug ? (
              <> <a href={`/api/digital-plan/${activePlan.mealPlan.slug}/pdf`} target="_blank" rel="noopener noreferrer">Download your plan</a>.</>
            ) : null}
          </p>
        </div>
        <dl className={s.supportingStats}>
          <div className={s.supportingStat}><dt>Eaten</dt><dd>{n0(eaten)}</dd></div>
          <div className={s.supportingStat}><dt>Burned</dt><dd>{n0(burned)}</dd></div>
          <div className={s.supportingStat}><dt>Daily target</dt><dd>{n0(target)}</dd></div>
          <div className={s.supportingStat}><dt>Meals logged</dt><dd>{loggedSlots.size}/{meals.length || 4}</dd></div>
        </dl>
      </section>

      {!activePlan.isDigital ? <DeliveryScheduleCard /> : null}

      <div className={s.workspace}>

        {/* meals */}
        <section className={s.card}>
          <div className={s.cardHeader}>
            <h2 style={section()}>The day&apos;s meals</h2>
            <span className={s.cardMeta}>
              {loggedSlots.size} of {meals.length || 4} logged
            </span>
          </div>

          {mealsLoading ? (
            <div style={{ padding: 16 }} aria-busy="true">
              {[80, 66, 74, 58].map((w, i) => (
                <div key={i} style={{ height: 12, width: `${w}%`, background: C.trough, marginBottom: 12 }} />
              ))}
            </div>
          ) : meals.length === 0 ? (
            <p style={{ ...body(14), padding: 16, margin: 0, maxWidth: "62ch" }}>
              Nothing is scheduled for today. Your plan may not have a schedule set up yet.
            </p>
          ) : (
            meals.map((meal) => {
              const isLogged = loggedSlots.has(meal.slotId);
              const isLogging = loggingSlot === meal.slotId;
              return (
                <div
                  key={meal.slotId}
                  className={s.mealRow}
                >
                  <div
                    className={s.mealPhoto}
                    role={cssImage(meal.recipe?.imageUrl) ? "img" : undefined}
                    aria-label={cssImage(meal.recipe?.imageUrl) ? meal.recipe.name : undefined}
                    style={{ backgroundImage: cssImage(meal.recipe?.imageUrl) }}
                  />
                  <button
                    type="button"
                    onClick={() => setOpenMeal(meal)}
                    className={s.mealOpen}
                  >
                    <span className={s.mealTime} style={{ color: isLogged ? C.lime : undefined }}>
                      {meal.label}, {meal.time}
                    </span>
                    <span className={s.mealName}>
                      {meal.recipe?.name ?? meal.label}
                    </span>
                    <span className={s.mealMacros}>
                      {n0(Number(meal.recipe?.proteinGrams ?? 0))}g protein ·{" "}
                      {n0(Number(meal.recipe?.carbsGrams ?? 0))}g carbs ·{" "}
                      {n0(Number(meal.recipe?.fatGrams ?? 0))}g fat
                    </span>
                  </button>

                  <div className={s.mealAction}>
                    <span className={s.mealCalories}>{n0(meal.recipe?.caloriesPerServing ?? 0)} kcal</span>
                    {isLogged ? (
                      <span className={s.logged}>Logged</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => logMeal(meal)}
                        disabled={isLogging}
                        style={ghostBtn(false, { flex: "none", opacity: isLogging ? 0.55 : 1 })}
                      >
                        {isLogging ? "Logging" : "I ate this"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* right rail */}
        <div className={s.rail}>
          {balance && (
            <section className={s.card}>
              <div className={s.cardBody}>
              <h2 style={section({ marginBottom: 16 })}>Today’s nutrition</h2>
              <Meter name="Calories" value={eaten} goal={target} unit=" kcal" on />
              <Meter name="Protein" value={balance.proteinIn} goal={balance.proteinTarget} unit="g" on />
              <p style={body(13, { marginTop: 4 })}>
                {balance.mealsLogged} of {balance.mealsTotal} plan meals confirmed today.
              </p>
              </div>
            </section>
          )}

          {workout?.hasWorkout && (
            <section className={s.card} style={{ borderColor: workout.completedToday ? C.lime : C.rule }}>
              <div style={{ padding: "16px 18px 14px", borderBottom: `1px solid ${C.rule}` }}>
                <p style={label(12, { display: "block", marginBottom: 8 })}>Training today</p>
                <p style={{ fontFamily: "var(--fk-display), Georgia, serif", fontWeight: 600, fontSize: 24, lineHeight: 1.1,
                            letterSpacing: "-0.02em", textTransform: "none", color: C.ink, margin: 0 }}>
                  {workout.isRestDay ? "Rest day" : workout.focusArea}
                </p>
                <p style={body(13, { marginTop: 8 })}>
                  {workout.isRestDay
                    ? "Recovery is part of the plan, not a gap in it."
                    : `${workout.exercises?.length ?? 0} exercises, about ${workout.estimatedCalories} kcal.`}
                </p>
              </div>

              {!workout.isRestDay && (
                <>
                  {(workout.exercises ?? []).map((e) => (
                    <div key={e.exerciseId} style={{ display: "flex", alignItems: "center", gap: 12,
                                                     padding: "11px 18px", borderBottom: `1px solid ${C.rule}` }}>
                      <span style={{ ...body(14, { color: C.ink }), flex: 1, minWidth: 0 }}>{e.name}</span>
                      <span style={num(12, { flex: "none" })}>{setsLabel(e)}</span>
                    </div>
                  ))}
                  <div style={{ padding: 16 }}>
                    {workout.completedToday ? (
                      <p style={label(12, { color: C.lime })}>
                        Completed, {workout.estimatedCalories} kcal logged
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={completeWorkout}
                        disabled={completingWorkout}
                        style={solidBtn({
                          width: "100%",
                          opacity: completingWorkout ? 0.55 : 1,
                          cursor: completingWorkout ? "default" : "pointer",
                        })}
                      >
                        {completingWorkout ? "Logging" : "Mark it complete"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </section>
          )}

          {consistency && (
            <section className={s.card}>
              <div className={s.cardBody}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between",
                            gap: 12, marginBottom: 14 }}>
                <p style={label(12)}>Consistency this week</p>
                <span style={num(12, { color: C.dim })}>resets Sunday</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
                <span style={figure(34, { color: C.lime })}>{Math.round(consistency.score)}</span>
                <span style={num(12, { color: C.dim })}>of 100, {consistency.label.toLowerCase()}</span>
              </div>
              <div className={s.consistencyTrack}>
                <div className={s.consistencyFill} style={{ width: `${Math.max(0, Math.min(100, consistency.score))}%` }} />
              </div>
              <p style={body(13, { marginTop: 12 })}>
                {consistency.meals.logged} of {consistency.meals.delivered} delivered meals logged
                {consistency.workouts.scheduled > 0
                  ? `, and ${consistency.workouts.completed} of ${consistency.workouts.scheduled} sessions done`
                  : ""}.
              </p>
              </div>
            </section>
          )}
        </div>
      </div>

      <Spine>From your coach</Spine>
      <WeeklyReviewCard />

      <RecentOrders orders={orders} />

      {openMeal && (
        <MealDialog
          meal={openMeal}
          cycleDays={activePlan?.mealPlan?.cycleLengthDays ?? 30}
          logged={loggedSlots.has(openMeal.slotId)}
          logging={loggingSlot === openMeal.slotId}
          onLog={() => logMeal(openMeal)}
          onClose={() => setOpenMeal(null)}
        />
      )}
      {ratingMeal && (
        <RatingDialog
          meal={ratingMeal}
          onClose={() => setRatingMeal(null)}
          onSubmit={(rating, note) => rateMeal(ratingMeal, rating, note)}
        />
      )}
    </>
  );
}

function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <>
      <Spine>Recent orders</Spine>
      {orders.length === 0 ? (
        <div style={{ ...PANEL, padding: "20px 18px" }}>
          <p style={body(14, { maxWidth: "62ch" })}>
            No orders yet. Anything you order shows up here with its status.
          </p>
        </div>
      ) : (
        <div style={{ borderTop: `1px solid ${C.rule}` }}>
          {orders.map((o) => {
            const item = o.items?.[0];
            return (
              <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                                       padding: "13px 0", borderBottom: `1px solid ${C.rule}` }}>
                <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                  <p style={body(14, { color: C.ink, margin: 0 })}>{o.orderNumber}</p>
                  <p style={{ ...num(12, { color: C.dim }), margin: "3px 0 0" }}>
                    {item?.dishName
                      ? `${item.dishName}, `
                      : item?.mealsPerDay && item?.duration
                        ? `${MEAL_LABEL[item.mealsPerDay] ?? item.mealsPerDay}, ${DUR_LABEL[item.duration] ?? item.duration}, `
                        : ""}
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <span style={label(12, { flex: "none" })}>{ORDER_STATUS[o.status] ?? o.status}</span>
                <span style={num(13, { flex: "none", minWidth: "8ch", textAlign: "right" })}>
                  {"₹"}{o.totalRs.toLocaleString("en-IN")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
