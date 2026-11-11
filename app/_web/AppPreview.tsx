"use client";

// app/_web/AppPreview.tsx
//
// THE APP, LIVE (v2 §3.6, Merge A).
//
// The standalone dashboard-feature section, the product-preview band's four
// cards, HomeLaunchpad, HomeToday and the "Also inside" pill row were four
// descriptions of one product. They are all folded into this ONE working
// tabbed widget: five tabs, each a live view built from the existing example
// data (app/dashboard-preview/sample-data.ts and the preview-band copy).
// Every row that looks tappable does something: tabs switch, sets check,
// the 18-reading grid expands. No dead buttons.
//
// Every number is labelled "Example member day" / "Example live reading".

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import {
  Activity,
  BookOpen,
  LayoutDashboard,
  Scale,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { MacroSplit } from "./DishVisuals";
import WeightChart from "./WeightChart";
import type { BandCounts } from "./HomeBands";
import {
  BODY_METRICS_18,
  HERO_METRICS_6,
  TRAINING_SESSION,
  buildWeightSeries,
  setLabel,
  type BodyMetricTile,
} from "./homepage-v2-data";
import s from "./app-preview.module.css";

type TabKey = "today" | "weight" | "training" | "supplements" | "coach";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "today", label: "Today", icon: <LayoutDashboard size={20} /> },
  { key: "weight", label: "Weight", icon: <Scale size={20} /> },
  { key: "training", label: "Training", icon: <Activity size={20} /> },
  { key: "supplements", label: "Supplements", icon: <BookOpen size={20} /> },
  { key: "coach", label: "Coach", icon: <Sparkles size={20} /> },
];

/* The six HomeLaunchpad tools, as rail entries that switch tabs. Food & water
   lives in the Today tab; Progress (trends) lives in the Weight tab. */
const RAIL: { label: string; note: string; icon: React.ReactNode; tab: TabKey }[] = [
  { label: "Today", note: "Meals, delivery and orders", icon: <LayoutDashboard size={21} />, tab: "today" },
  { label: "Food & water", note: "Keep your day up to date", icon: <BookOpen size={21} />, tab: "today" },
  { label: "Workouts", note: "Workouts, sets and reps", icon: <Activity size={21} />, tab: "training" },
  { label: "Measurements", note: "Manual or compatible scale", icon: <Scale size={21} />, tab: "weight" },
  { label: "Progress", note: "Trends and consistency", icon: <TrendingUp size={21} />, tab: "weight" },
  { label: "AI coach", note: "Your logs in context", icon: <Sparkles size={21} />, tab: "coach" },
];

/* The example day's macros, from the sample-data meals (420+580+300+700 kcal;
   24+26+12+38g protein; 54+74+44+80g carbs; 12+20+8+25g fat). */
const EXAMPLE_DAY_MACROS = { p: 100, c: 252, f: 65, kcal: 2000 };

/** The 18-reading tile grid, shared with the scale section (§3.7). */
export function MetricGrid({ tiles }: { tiles: BodyMetricTile[] }) {
  return (
    <ul className={s.metricGrid}>
      {tiles.map((m) => (
        <li key={m.key} className={s.metricTile}>
          <span className={s.metricName}>{m.label}</span>
          {m.value !== null ? (
            <b className="fk-num">
              {m.value}
              <small> {m.unit}</small>
            </b>
          ) : (
            <b className={s.metricEstimated}>Estimated</b>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function AppPreview({
  counts,
}: {
  counts: BandCounts;
}) {
  const [tab, setTab] = useState<TabKey>("today");
  const [doneSets, setDoneSets] = useState<Set<number>>(new Set());
  const [readingsOpen, setReadingsOpen] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveTabFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    setTab(TABS[next]!.key);
    tabRefs.current[next]?.focus();
  };

  const toggleSet = (i: number) => {
    setDoneSets((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className={s.appWindow}>
      <div className={s.windowBar}>
        <span className={s.windowDots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={s.windowTitle}>Example member day</span>
        <Link href="/dashboard-preview" className={s.windowLink}>
          Try the dashboard preview
        </Link>
      </div>

      <div className={s.appBody}>
        <nav className={s.rail} aria-label="FitFuel app sections">
          {RAIL.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`${s.railItem} ${tab === item.tab ? s.railOn : ""}`}
              onClick={() => setTab(item.tab)}
              aria-pressed={tab === item.tab}
            >
              {item.icon}
              <span>
                <b>{item.label}</b>
                <small>{item.note}</small>
              </span>
            </button>
          ))}
        </nav>

        <div className={s.panel}>
          <div
            className={s.tabBar}
            role="tablist"
            aria-label="App views"
            aria-orientation="horizontal"
          >
            {TABS.map((t, i) => (
              <button
                key={t.key}
                id={`app-tab-${t.key}`}
                type="button"
                role="tab"
                aria-controls={`app-panel-${t.key}`}
                aria-selected={tab === t.key}
                tabIndex={tab === t.key ? 0 : -1}
                className={tab === t.key ? s.tabOn : undefined}
                onClick={() => setTab(t.key)}
                onKeyDown={(event) => moveTabFocus(event, i)}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          <div
            id={`app-panel-${tab}`}
            role="tabpanel"
            aria-labelledby={`app-tab-${tab}`}
            className={s.tabPanel}
          >
            {tab === "today" ? (
              <div>
                <dl className={s.statTiles}>
                  <div>
                    <dt>Eaten</dt>
                    <dd className="fk-num">1,430 kcal</dd>
                  </div>
                  <div>
                    <dt>Exercise</dt>
                    <dd className="fk-num">280 kcal</dd>
                  </div>
                  <div>
                    <dt>Net left</dt>
                    <dd className="fk-num">850 kcal</dd>
                  </div>
                </dl>
                <span className={s.netTrack} aria-hidden="true">
                  <i style={{ width: "71.5%" }} />
                </span>
                <p className={s.netNote}>1,430 of 2,000 kcal eaten. Net left after exercise: 850 kcal.</p>
                <div className={s.todaySplit}>
                  <MacroSplit
                    p={EXAMPLE_DAY_MACROS.p}
                    c={EXAMPLE_DAY_MACROS.c}
                    f={EXAMPLE_DAY_MACROS.f}
                    kcal={EXAMPLE_DAY_MACROS.kcal}
                    unit="a day"
                  />
                  <ul className={s.todayRows}>
                    <li>
                      <Link href="/dashboard" className={s.todayRow}>
                        <span>Next meal</span>
                        <b>Planned meals and delivery days</b>
                      </Link>
                    </li>
                    <li>
                      <button type="button" className={s.todayRow} onClick={() => setTab("training")}>
                        <span>Today&apos;s workout</span>
                        <b>Your session is already programmed</b>
                      </button>
                    </li>
                  </ul>
                </div>
                <p className={s.guestNote}>
                  See your next meal, food log and workout here when you sign in.{" "}
                  <Link href="/auth/signin?callbackUrl=%2F">Sign in to your day</Link>. No meal
                  subscription needed for the daily tools.
                </p>
              </div>
            ) : null}

            {tab === "weight" ? (
              <div>
                <p className={s.weightBig}>
                  <span className={s.liveDot} aria-hidden="true" />
                  <b className="fk-num">78.2</b> kg
                  <small>Example live reading</small>
                </p>
                <WeightChart
                  series={buildWeightSeries()}
                  stallDay={-10}
                  label="Example member day: weight over the last 30 days."
                />
                <div className={s.readingsHead}>
                  <h3>Body measurements</h3>
                  <button
                    type="button"
                    onClick={() => setReadingsOpen((v) => !v)}
                    aria-expanded={readingsOpen}
                  >
                    {readingsOpen ? "Show fewer readings" : "See all 18 readings"}
                  </button>
                </div>
                <MetricGrid tiles={readingsOpen ? BODY_METRICS_18 : HERO_METRICS_6} />
                <p className={s.metricFine}>
                  Weight is measured directly from a supported Bluetooth scale. Other
                  body-composition values are labelled as estimates.
                </p>
              </div>
            ) : null}

            {tab === "training" ? (
              <div>
                <h3 className={s.panelH}>Your session is already programmed.</h3>
                <p className={s.panelLede}>
                  Full-body strength · 25 minutes ·{" "}
                  {counts.exercises.toLocaleString("en-IN")} exercises in the library
                </p>
                <ul className={s.setRows}>
                  {TRAINING_SESSION.map((set, i) => {
                    const done = doneSets.has(i);
                    return (
                      <li key={set.name}>
                        <button
                          type="button"
                          className={`${s.setRow} ${done ? s.setDone : ""}`}
                          onClick={() => toggleSet(i)}
                          aria-pressed={done}
                        >
                          <span className={s.setCheck} aria-hidden="true">
                            {done ? "✓" : ""}
                          </span>
                          <span>{set.name}</span>
                          <b className="fk-num">{setLabel(set)}</b>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <span className={s.setTrack} aria-hidden="true">
                  <i style={{ width: `${(doneSets.size / TRAINING_SESSION.length) * 100}%` }} />
                </span>
                <p className={s.setNote} aria-live="polite">
                  {doneSets.size === 0
                    ? "Tap a set to mark it done."
                    : doneSets.size === TRAINING_SESSION.length
                      ? "Session complete. Nice work."
                      : `${doneSets.size} of ${TRAINING_SESSION.length} sets done.`}
                </p>
                <Link href="/dashboard/exercises" className={s.panelLink}>
                  Browse {counts.exercises.toLocaleString("en-IN")} exercises
                </Link>
              </div>
            ) : null}

            {tab === "supplements" ? (
              <div>
                <h3 className={s.panelH}>Evidence first. Retailer choice stays yours.</h3>
                <ul className={s.suppRows}>
                  <li>
                    <Link href="/supplements#creatine" className={s.suppRow}>
                      <span>Creatine monohydrate</span>
                      <b>Evidence</b>
                    </Link>
                  </li>
                  <li>
                    <Link href="/supplements#omega3" className={s.suppRow}>
                      <span>Omega-3</span>
                      <b>Goal match</b>
                    </Link>
                  </li>
                  <li>
                    <Link href="/products" className={s.suppRow}>
                      <span>Tracked retailer products</span>
                      <b className="fk-num">{counts.retailerLinks.toLocaleString("en-IN")}</b>
                    </Link>
                  </li>
                </ul>
                <p className={s.panelLede}>
                  {counts.supplements.toLocaleString("en-IN")} researched supplements.
                  FitFuel holds no supplement stock.
                </p>
              </div>
            ) : null}

            {tab === "coach" ? (
              <div>
                <h3 className={s.panelH}>Weekly review, from your own numbers.</h3>
                <p className={s.panelLede}>
                  Week 3 held at 78.0 kg after 78.1 kg in week 2. Stall flagged.
                  The review proposes 1,700 kcal, down 300 kcal from 2,000 kcal.
                </p>
                <div className={s.coachMini}>
                  <span>
                    <b className="fk-num">2,000 kcal</b>
                    <span>Current target</span>
                  </span>
                  <span aria-hidden="true">→</span>
                  <span>
                    <b className="fk-num">1,700 kcal</b>
                    <span>Proposed target</span>
                  </span>
                </div>
                <div className={s.coachActions}>
                  <button
                    type="button"
                    className={s.chatPrimary}
                    onClick={() => document.getElementById("fitfuel-coach-trigger")?.click()}
                  >
                    Open AI coach
                  </button>
                  <Link href="#coach" className={s.chatGhost}>
                    Read the full conversation
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
