"use client";

// app/dashboard/WeeklyReviewCard.tsx
//
// The coach's summary on the dashboard. It fetches /api/coach/weekly-review and
// shows the headline, what is working, and what to focus on.
//
// It no longer applies the recalibration. /dashboard/coach exists now and owns
// that action, with the arithmetic shown and a confirm step; this card was a
// second, divergent implementation of the same POST that skipped both. Two
// buttons that mutate the same target, behaving differently, is worse than one
// button and a link. So the card reports and hands off.
//
// The spinner is a skeleton: DESIGN.md §6 says anything over 300ms gets one.

import { useEffect, useState } from "react";
import Link from "next/link";
import { C, body, label, section, ghostBtn, PANEL } from "@/app/_app/theme";

type Recalibration = {
  status: string;
  currentTarget: number;
  recommendedTarget: number;
  deltaKcal: number;
  rationale: string;
  canApply: boolean;
};

type WeeklyReview = {
  generatedAt: string;
  headline: string;
  whatsWorking: string[];
  focusThisWeek: string[];
  recalibration: Recalibration;
  oneQuestion: string;
  source: "rules" | "llm";
};

function Head({ children }: { children?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 12, padding: "14px 16px", borderBottom: `1px solid ${C.rule}` }}>
      <h2 style={section()}>Weekly review</h2>
      {children}
    </div>
  );
}

/** Hairline bars standing in for the lines that are coming. No spin. */
function Skeleton() {
  return (
    <section style={PANEL} aria-busy="true" aria-label="Loading your weekly review">
      <Head />
      <div style={{ padding: 16 }}>
        {[80, 62, 45].map((w, i) => (
          <div key={i} style={{ height: 10, width: `${w}%`, background: C.trough, marginBottom: 10 }} />
        ))}
      </div>
    </section>
  );
}

function List({ name, items }: { name: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <span style={label(12, { display: "block", marginBottom: 10 })}>{name}</span>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: `1px solid ${C.rule}` }}>
        {items.map((t, i) => (
          <li key={i} style={{ display: "flex", gap: 13, padding: "11px 0", alignItems: "baseline",
                               borderBottom: `1px solid ${C.rule}` }}>
            <span style={{ ...label(12, { color: C.lime }), flex: "none", minWidth: "2ch" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={body(14, { color: C.ink })}>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WeeklyReviewCard() {
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/coach/weekly-review")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("failed"))))
      .then((d: WeeklyReview) => { if (alive) { setReview(d); setLoading(false); } })
      .catch(() => { if (alive) { setFailed(true); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  if (loading) return <Skeleton />;

  if (failed || !review) {
    return (
      <section style={PANEL}>
        <Head />
        <p style={{ ...body(14), padding: 16, margin: 0, maxWidth: "62ch" }}>
          The review could not be built right now. Nothing is lost, your logs and weigh-ins are
          unaffected.
        </p>
      </section>
    );
  }

  const r = review.recalibration;
  const kcal = (n: number) => Math.round(n).toLocaleString("en-IN");

  return (
    <section style={r.canApply ? { ...PANEL, borderColor: C.lime } : PANEL}>
      <Head>
        <span style={label(12)}>
          {review.source === "rules" ? "Rules engine" : "Model"}
        </span>
      </Head>

      <div style={{ padding: 16 }}>
        <p style={{
          fontFamily: "var(--ff-cond), sans-serif", fontWeight: 900, fontSize: 22,
          lineHeight: 1.1, letterSpacing: "-0.02em", textTransform: "uppercase",
          color: C.ink, margin: 0, maxWidth: "26ch",
        }}>
          {review.headline}
        </p>

        <List name="What is working" items={review.whatsWorking} />
        <List name="Focus this week" items={review.focusThisWeek} />

        {r.canApply && (
          <div style={{ marginTop: 16, borderTop: `1px solid ${C.rule}`, paddingTop: 16 }}>
            <span style={label(12, { display: "block", marginBottom: 8, color: C.lime })}>
              A target change is waiting
            </span>
            <p style={body(14, { color: C.ink, maxWidth: "62ch" })}>{r.rationale}</p>
            <p style={body(13, { margin: "8px 0 12px" })}>
              {kcal(r.currentTarget)} to {kcal(r.recommendedTarget)} kcal a day,
              a change of {r.deltaKcal > 0 ? "+" : "−"}{Math.abs(r.deltaKcal)}.
            </p>
            <Link href="/dashboard/coach" style={ghostBtn(true, { textDecoration: "none" })}>
              Review it
            </Link>
          </div>
        )}

        <p style={{ ...body(13), margin: "16px 0 0", paddingTop: 14,
                    borderTop: `1px solid ${C.rule}`, maxWidth: "62ch" }}>
          {review.oneQuestion}
        </p>
      </div>
    </section>
  );
}
