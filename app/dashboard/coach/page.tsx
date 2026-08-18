// app/dashboard/coach/page.tsx
//
// THE COACH HAD NO SCREEN. lib/coach ships a four-stage spine
// (Sense -> Summarise -> Reason -> Act), two API routes and a full typed
// contract, and the only place any of it surfaced was one card near the bottom
// of the dashboard. The recalibration, which is the part that actually earns
// the word "coach", could be read but never inspected.
//
// This is its home. Server component: buildWeeklyReview is called directly, so
// there is no HTTP round trip and no loading state on first paint. Only the
// Apply action is a client component, because only the Apply action has state.

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { buildWeeklyReview } from "@/lib/coach/weekly-review";
import type { WeeklyReview } from "@/lib/coach/types";
import { C, screen, section, body, label, num, figure, PANEL, APP_MAX } from "@/app/_app/theme";
import CoachApply from "./CoachApply";

export const metadata: Metadata = { title: "Coach" };
export const dynamic = "force-dynamic";

const WRAP: React.CSSProperties = {
  width: "100%", maxWidth: APP_MAX, margin: "0 auto",
  padding: "0 clamp(16px,4vw,28px)",
};

/** Status wording. Never the colour alone. */
const STATUS_COPY: Record<string, string> = {
  on_track: "On track",
  too_slow: "Slower than planned",
  too_fast: "Faster than is safe",
  stalled: "Stalled",
  wrong_direction: "Moving the wrong way",
  insufficient_data: "Not enough data yet",
};

function Rule() {
  return <div style={{ height: 1, background: C.rule, margin: "26px 0" }} />;
}

/** One mono label and a hairline. No serial, no right-hand caption. */
function Spine({ children }: { children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
      <span style={label(12)}>{children}</span>
      <span style={{ flex: 1, height: 1, background: C.rule }} />
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

/** A list where each row is a hairline, not a bullet and not a card. */
function Rows({ items, mark }: { items: string[]; mark: string }) {
  if (!items.length) {
    return <p style={body(14)}>Nothing to report this week.</p>;
  }
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: `1px solid ${C.rule}` }}>
      {items.map((t, i) => (
        <li key={i} style={{ display: "flex", gap: 13, padding: "13px 0",
                             borderBottom: `1px solid ${C.rule}`, alignItems: "baseline" }}>
          <span style={num(12, { color: C.lime, flex: "none", minWidth: "2ch" })}>{mark}</span>
          <span style={body(14, { color: C.ink })}>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function CoachPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard/coach");

  let review: WeeklyReview | null = null;
  try {
    review = await buildWeeklyReview(session.user.id);
  } catch {
    review = null;
  }

  if (!review) {
    return (
      <div style={{ ...WRAP, paddingTop: 26 }}>
        <h1 style={screen()}>Coach</h1>
        <div style={{ ...PANEL, padding: "20px 18px", marginTop: 18 }}>
          <p style={body(14)}>
            The review could not be built right now. Nothing is lost, your logs and weigh-ins are
            unaffected. Try again in a moment.
          </p>
        </div>
      </div>
    );
  }

  const r = review.recalibration;
  const sm = review.summary;
  const statusText = STATUS_COPY[r.status] ?? r.status;
  const kcal = (n: number) => `${Math.round(n).toLocaleString("en-IN")}`;

  return (
    <div style={{ ...WRAP, paddingTop: 26 }}>

      {/* ── Headline ─────────────────────────────────────────────────── */}
      <header style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <h1 style={screen()}>Coach</h1>
          <span style={label(12)}>
            {review.source === "rules" ? "RULES ENGINE" : "MODEL"} ·{" "}
            {new Date(review.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        </div>
        <p style={{ fontFamily: "var(--ff-cond), sans-serif", fontWeight: 900,
                    fontSize: "clamp(1.6rem,4.2vw,2.4rem)", lineHeight: 0.98,
                    letterSpacing: "-0.025em", textTransform: "uppercase",
                    color: C.ink, margin: 0, maxWidth: "22ch" }}>
          {review.headline}
        </p>
        {/* The conversational half. This page states what changed and applies
            it; the chat is where "why" and "what do I do about it" get
            answered. Neither is much use without the other, so each links
            across rather than leaving the customer to find the other one. */}
        <Link
          href="/dashboard/trainer"
          style={{
            display: "inline-flex", alignItems: "center", minHeight: 44,
            marginTop: 14, color: C.lime, fontFamily: "var(--font-archivo), sans-serif",
            fontSize: 14, fontWeight: 600,
          }}
        >
          Ask the coach about this →
        </Link>
      </header>

      <Rule />

      {/* ── The week, measured ───────────────────────────────────────── */}
      <Spine>The week, measured</Spine>
      <div style={{ display: "grid", gap: 1, background: C.rule, border: `1px solid ${C.rule}`,
                    gridTemplateColumns: "repeat(auto-fit,minmax(136px,1fr))" }}>
        <Readout v={kcal(sm.avgCaloriesIn)} k={`Avg in / ${kcal(sm.calorieTarget)} target`} />
        <Readout v={kcal(sm.avgNet)} k="Avg net" />
        <Readout v={`${Math.round(sm.avgProtein)}g`} k={`Protein / ${Math.round(sm.proteinTarget)}g`} />
        <Readout v={`${sm.mealsLogged}/${sm.mealsScheduled}`} k="Meals logged" />
        <Readout v={String(sm.workoutsCompleted)} k="Workouts done" />
        <Readout v={`${sm.streakDays}d`} k="Streak" live={sm.streakDays > 0} />
      </div>
      {sm.consistencyScore != null && (
        <p style={body(13, { marginTop: 12 })}>
          Consistency{" "}
          <span style={num(13, { color: C.lime })}>{Math.round(sm.consistencyScore)}</span>
          {sm.consistencyLabel ? `, ${sm.consistencyLabel.toLowerCase()}` : ""}. Built from{" "}
          <span style={num(13)}>{sm.calorieDaysWithData}</span> days with data and{" "}
          <span style={num(13)}>{sm.weighInsInWindow}</span> weigh-ins.
        </p>
      )}

      <Rule />

      {/* ── The recalibration: the arithmetic, shown ─────────────────── */}
      <Spine>The recalibration</Spine>
      <div style={{ ...(r.canApply ? { background: C.panel, border: `1px solid ${C.lime}` } : PANEL) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
                      gap: 12, flexWrap: "wrap", padding: "15px 18px",
                      borderBottom: `1px solid ${C.rule}` }}>
          <h2 style={section()}>{statusText}</h2>
          <span style={label(12)}>
            {r.actualRateKgPerWeek != null
              ? `${r.actualRateKgPerWeek > 0 ? "+" : ""}${r.actualRateKgPerWeek.toFixed(2)} KG/WK MEASURED`
              : "RATE NOT MEASURABLE YET"}
          </span>
        </div>

        <div style={{ padding: "18px" }}>
          <p style={body(14, { color: C.ink, maxWidth: "62ch" })}>{r.rationale}</p>

          {/* The arithmetic is a real table: it is tabular data and the whole
              point of the feature is that you can check it. */}
          <div style={{ overflowX: "auto", marginTop: 18, border: `1px solid ${C.rule}` }}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 380 }}>
              <caption style={label(12, { textAlign: "left", padding: "11px 14px",
                                          background: C.panel2, borderBottom: `1px solid ${C.rule}` })}>
                How the number was reached
              </caption>
              <tbody>
                <tr>
                  <th scope="row" style={{ ...body(13), textAlign: "left", padding: "11px 14px",
                                           borderBottom: `1px solid ${C.rule}`, fontWeight: 400 }}>
                    Expected rate for this goal
                  </th>
                  <td style={{ ...num(13), textAlign: "right", padding: "11px 14px",
                               borderBottom: `1px solid ${C.rule}` }}>
                    {r.expectedRateKgPerWeek.toFixed(2)} kg/wk
                  </td>
                </tr>
                <tr>
                  <th scope="row" style={{ ...body(13), textAlign: "left", padding: "11px 14px",
                                           borderBottom: `1px solid ${C.rule}`, fontWeight: 400 }}>
                    Your measured rate
                  </th>
                  <td style={{ ...num(13), textAlign: "right", padding: "11px 14px",
                               borderBottom: `1px solid ${C.rule}` }}>
                    {r.actualRateKgPerWeek != null ? `${r.actualRateKgPerWeek.toFixed(2)} kg/wk` : "not enough weigh-ins"}
                  </td>
                </tr>
                <tr>
                  <th scope="row" style={{ ...body(13), textAlign: "left", padding: "11px 14px",
                                           borderBottom: `1px solid ${C.rule}`, fontWeight: 400 }}>
                    Current target
                  </th>
                  <td style={{ ...num(13), textAlign: "right", padding: "11px 14px",
                               borderBottom: `1px solid ${C.rule}` }}>
                    {kcal(r.currentTarget)} kcal
                  </td>
                </tr>
                <tr>
                  <th scope="row" style={{ ...body(13), textAlign: "left", padding: "11px 14px",
                                           color: C.ink, fontWeight: 400 }}>
                    Recommended target
                  </th>
                  <td style={{ ...num(13), textAlign: "right", padding: "11px 14px",
                               color: r.deltaKcal !== 0 ? C.lime : C.ink }}>
                    {kcal(r.recommendedTarget)} kcal
                    {r.deltaKcal !== 0 && (
                      <span style={{ color: C.dim }}>
                        {" "}({r.deltaKcal > 0 ? "+" : ""}{kcal(r.deltaKcal)})
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <CoachApply
            canApply={r.canApply}
            currentTarget={r.currentTarget}
            recommendedTarget={r.recommendedTarget}
            deltaKcal={r.deltaKcal}
          />
        </div>
      </div>

      <Rule />

      {/* ── Working / focus ──────────────────────────────────────────── */}
      <div style={{ display: "grid", gap: "clamp(22px,4vw,40px)",
                    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
        <section>
          <Spine>What is working</Spine>
          <Rows items={review.whatsWorking} mark="OK" />
        </section>
        <section>
          <Spine>Focus this week</Spine>
          <Rows items={review.focusThisWeek} mark="→" />
        </section>
      </div>

      <Rule />

      {/* ── The one question ─────────────────────────────────────────── */}
      <section style={{ ...PANEL, padding: "20px 18px", marginBottom: 8 }}>
        <span style={label(12, { display: "block", marginBottom: 10 })}>One question</span>
        <p style={{ fontFamily: "var(--ff-cond), sans-serif", fontWeight: 800,
                    fontSize: "clamp(1.2rem,2.6vw,1.6rem)", lineHeight: 1.08,
                    letterSpacing: "-0.015em", textTransform: "uppercase",
                    color: C.ink, margin: 0, maxWidth: "30ch" }}>
          {review.oneQuestion}
        </p>
      </section>
    </div>
  );
}
