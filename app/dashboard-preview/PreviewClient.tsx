"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/app/_app/AppShell";
import { screen, solidBtn, ghostBtn } from "@/app/_app/theme";
import DashboardClient from "../dashboard/DashboardClient";
import { SAMPLE_DAY, SAMPLE_PLAN } from "./sample-data";
import s from "../dashboard/dashboard.module.css";

export default function PreviewClient() {
  const [version, setVersion] = useState(0);
  const [withPlan, setWithPlan] = useState(true);
  return (
    <AppShell preview>
      <div className={s.page}>
        <header className={s.pageHeader}>
          <div>
            <h1 style={screen()}>Your day with FitFuel</h1>
            <p className={s.pageIntro}>
              Meals, nutrition, training and progress in one dashboard.
            </p>
          </div>
        </header>
        <aside className={s.notice} aria-label="Preview information">
          <p>
            <strong>Interactive preview. Sample data only.</strong> Meal and
            workout actions stay on this page. Sign in for your own data.
          </p>
          <div className={s.inlineActions}>
            <Link href="/auth/signin?callbackUrl=/dashboard" style={solidBtn()}>
              Sign in
            </Link>
            <button
              type="button"
              style={ghostBtn()}
              onClick={() => setVersion((value) => value + 1)}
            >
              Reset preview
            </button>
          </div>
          <details className={s.previewDetails}><summary>About this preview</summary><p>Changes reset when you leave. Food images are illustrative, and nutrition figures are examples, not a personal plan. Other tools require sign-in.</p></details>
        </aside>
        <div
          className={s.inlineActions}
          role="group"
          aria-label="Preview account state"
        >
          <button
            type="button"
            style={ghostBtn(withPlan)}
            aria-pressed={withPlan}
            onClick={() => setWithPlan(true)}
          >
            With a meal plan
          </button>
          <button
            type="button"
            style={ghostBtn(!withPlan)}
            aria-pressed={!withPlan}
            onClick={() => setWithPlan(false)}
          >
            Without a meal plan
          </button>
        </div>
        <DashboardClient
          key={`${version}-${withPlan}`}
          orders={[]}
          activePlan={withPlan ? SAMPLE_PLAN : null}
          previewData={SAMPLE_DAY}
          starterSummary={{
            calories: 420,
            protein: 24,
            waterMl: 750,
            entries: 1,
            calorieTarget: 2000,
            weightKg: null,
            measuredAt: null,
          }}
        />
      </div>
    </AppShell>
  );
}
