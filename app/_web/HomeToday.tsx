"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowUpRight, Droplets, RefreshCw } from "lucide-react";
import s from "./home-workspace.module.css";

type Day = {
  diary: {
    totals: { calories: number; protein: number };
    entries: unknown[];
  } | null;
  water: { amountMl: number } | null;
  plan: {
    activePlan: {
      currentDay: number;
      daysRemaining: number;
      mealPlan: { name: string };
    } | null;
  } | null;
  workout: {
    hasWorkout: boolean;
    isRestDay?: boolean;
    completedToday?: boolean;
    focusArea?: string;
    durationMins?: number;
  } | null;
};
const endpoints = {
  diary: "/api/nutrition/diary",
  water: "/api/nutrition/water",
  plan: "/api/user/active-plan",
  workout: "/api/user/active-plan/workout-today",
} as const;

export default function HomeToday() {
  const { data: session, status } = useSession();
  return (
    <section className={s.today} aria-labelledby="home-today-title">
      <header>
        <div>
          <span className={s.eyebrow}>Your account</span>
          <h2 id="home-today-title">Today at a glance</h2>
        </div>
        <Link href="/dashboard" aria-label="Open your full dashboard">
          <ArrowUpRight size={22} />
        </Link>
      </header>
      {status === "loading" ? (
        <p role="status">Loading your account…</p>
      ) : session?.user?.id ? (
        <AccountDay key={session.user.id} />
      ) : (
        <div className={s.guestDay}>
          <p>See your next meal, food log and workout here when you sign in.</p>
          <ul>
            <li>
              <span>Food & water</span>
              <b>Your daily diary</b>
            </li>
            <li>
              <span>Meals & delivery</span>
              <b>Your current plan</b>
            </li>
            <li>
              <span>Training & progress</span>
              <b>Your next session</b>
            </li>
          </ul>
          <Link className={s.primary} href="/auth/signin?callbackUrl=%2F">
            Sign in to your day <ArrowUpRight size={18} />
          </Link>
          <Link className={s.textLink} href="/dashboard-preview">
            Try the interactive dashboard first
          </Link>
          <small>No meal subscription needed for the daily tools.</small>
        </div>
      )}
    </section>
  );
}

function AccountDay() {
  const [day, setDay] = useState<Day | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [waterBusy, setWaterBusy] = useState(false);
  const [waterUncertain, setWaterUncertain] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const keys = Object.keys(endpoints) as (keyof Day)[];
    const signal = AbortSignal.any([
      controller.signal,
      AbortSignal.timeout(14000),
    ]);
    void Promise.all(
      keys.map(async (key) => {
        try {
          const response = await fetch(endpoints[key], {
            signal,
            cache: "no-store",
          });
          if (!response.ok) throw new Error("Unavailable");
          return [key, await response.json()];
        } catch {
          return [key, null];
        }
      }),
    ).then((values) => {
      if (!controller.signal.aborted) setDay(Object.fromEntries(values) as Day);
    });
    return () => controller.abort();
  }, [refresh]);

  async function addWater() {
    if (waterBusy || waterUncertain) return;
    setWaterBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/nutrition/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", amountMl: 250 }),
        signal: AbortSignal.timeout(14000),
      });
      if (!response.ok) throw new Error("Save failed");
      const water = (await response.json()) as { amountMl: number };
      setDay((previous) => (previous ? { ...previous, water } : previous));
      setNotice("Added 250 ml to your diary.");
    } catch {
      setWaterUncertain(true);
      setNotice(
        "Could not confirm the save. Check your diary before trying again.",
      );
    } finally {
      setWaterBusy(false);
    }
  }

  if (!day) return <p role="status">Loading today’s food, water and plan…</p>;
  const missing = Object.values(day).some((value) => value === null);
  const plan = day.plan?.activePlan;
  const workout = day.workout;
  return (
    <div className={s.accountDay}>
      <dl className={s.numbers}>
        <div>
          <dt>Food logged</dt>
          <dd>
            {day.diary
              ? Math.round(day.diary.totals.calories).toLocaleString("en-IN")
              : "Unavailable"}
            <small>{day.diary ? " kcal" : ""}</small>
          </dd>
        </div>
        <div>
          <dt>Protein</dt>
          <dd>
            {day.diary ? Math.round(day.diary.totals.protein) : "Unavailable"}
            <small>{day.diary ? " g" : ""}</small>
          </dd>
        </div>
      </dl>
      <div className={s.water}>
        <span>
          <Droplets size={18} />
          {day.water
            ? `${day.water.amountMl.toLocaleString("en-IN")} ml water`
            : "Water unavailable"}
        </span>
        <button
          type="button"
          onClick={addWater}
          disabled={waterBusy || waterUncertain || !day.water}
        >
          {waterBusy ? "Saving…" : "+ 250 ml"}
        </button>
      </div>
      {notice ? (
        <p role="status" className={s.notice}>
          {notice}
        </p>
      ) : null}
      <Link href="/dashboard" className={s.planRow}>
        <span>Meal plan</span>
        <b>
          {plan
            ? plan.mealPlan.name
            : day.plan
              ? "No active plan. Explore your options."
              : "Plan unavailable"}
        </b>
        {plan ? (
          <small>
            Day {plan.currentDay} · {plan.daysRemaining} service days left
          </small>
        ) : null}
      </Link>
      <Link href="/dashboard/exercises" className={s.planRow}>
        <span>Training</span>
        <b>
          {!workout
            ? "Session unavailable"
            : workout.completedToday
              ? "Today's workout complete"
              : workout.isRestDay
                ? "Rest day"
                : workout.hasWorkout
                  ? workout.focusArea || "Your scheduled workout"
                  : "Choose a workout"}
        </b>
      </Link>
      <div className={s.dayActions}>
        <Link className={s.primary} href="/dashboard/nutrition">
          Open food diary <ArrowUpRight size={16} />
        </Link>
        <button
          type="button"
          aria-label="Refresh today's summary"
          disabled={waterBusy}
          onClick={() => {
            setDay(null);
            setWaterUncertain(false);
            setRefresh((value) => value + 1);
          }}
        >
          <RefreshCw size={17} />
        </button>
      </div>
      {missing ? (
        <p role="status" className={s.notice}>
          Some information could not load. Refresh to try again.
        </p>
      ) : null}
    </div>
  );
}
