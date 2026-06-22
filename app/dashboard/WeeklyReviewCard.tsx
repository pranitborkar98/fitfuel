"use client";

// app/dashboard/WeeklyReviewCard.tsx
// AI Coach — the Weekly Review surface. Self-contained: fetches its own review
// from /api/coach/weekly-review and applies a recalibration via
// /api/coach/recalibration/apply. Matches the dashboard house style (inline
// styles, lime accent, dark cards). Drop <WeeklyReviewCard /> into the layout.

import { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, Target, Check, Loader2 } from "lucide-react";

const T = {
  card: "#111111",
  cardSoft: "#0f0f0f",
  border: "#1f1f1f",
  accent: "#84cc16",
  text: "#f9fafb",
  textSecond: "#a3a3a3",
  textMuted: "#737373",
};

type RecalStatus =
  | "on_track"
  | "too_slow"
  | "too_fast"
  | "stalled"
  | "wrong_direction"
  | "insufficient_data";

interface Recalibration {
  status: RecalStatus;
  goal: string | null;
  actualRateKgPerWeek: number | null;
  expectedRateKgPerWeek: number;
  currentTarget: number;
  recommendedTarget: number;
  deltaKcal: number;
  rationale: string;
  canApply: boolean;
}

interface WeeklyReview {
  generatedAt: string;
  headline: string;
  whatsWorking: string[];
  focusThisWeek: string[];
  recalibration: Recalibration;
  oneQuestion: string;
  source: "rules" | "llm";
}

export default function WeeklyReviewCard() {
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [applying, setApplying] = useState(false);
  const [appliedTarget, setAppliedTarget] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/coach/weekly-review")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("failed"))))
      .then((d: WeeklyReview) => {
        if (alive) {
          setReview(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  async function applyRecal() {
    setApplying(true);
    try {
      const res = await fetch("/api/coach/recalibration/apply", { method: "POST" });
      if (res.ok) {
        const d: { newCalorieTarget: number } = await res.json();
        setAppliedTarget(d.newCalorieTarget);
      }
    } finally {
      setApplying(false);
    }
  }

  const shell: React.CSSProperties = {
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: 20,
  };

  // ── loading ──
  if (loading) {
    return (
      <div style={{ ...shell, display: "flex", alignItems: "center", gap: 10 }}>
        <Loader2 size={15} color={T.textMuted} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 13, color: T.textMuted }}>Reading your week…</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── error ──
  if (error || !review) {
    return (
      <div style={shell}>
        <Eyebrow />
        <p style={{ fontSize: 13, color: T.textSecond, marginTop: 10 }}>
          Couldn&apos;t load your weekly review. Refresh to try again.
        </p>
      </div>
    );
  }

  const recal = review.recalibration;
  const showApply = recal.canApply && appliedTarget === null;

  return (
    <div style={shell}>
      <Eyebrow />

      {/* headline */}
      <h3
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: T.text,
          lineHeight: 1.35,
          margin: "12px 0 0",
          letterSpacing: "-0.01em",
        }}
      >
        {review.headline}
      </h3>

      {/* what's working */}
      {review.whatsWorking.length > 0 && (
        <Section label="What's working">
          {review.whatsWorking.map((item, i) => (
            <Row key={i} icon={<CheckCircle2 size={15} color={T.accent} />}>
              {item}
            </Row>
          ))}
        </Section>
      )}

      {/* focus this week */}
      {review.focusThisWeek.length > 0 && (
        <Section label="Focus this week">
          {review.focusThisWeek.map((item, i) => (
            <Row key={i} icon={<Target size={15} color={T.textSecond} />}>
              {item}
            </Row>
          ))}
        </Section>
      )}

      {/* recalibration action panel — the one moment the card earns its place */}
      {(showApply || appliedTarget !== null) && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            background: "rgba(132,204,22,0.06)",
            border: `1px solid rgba(132,204,22,0.25)`,
            borderRadius: 12,
          }}
        >
          {appliedTarget !== null ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Check size={16} color={T.accent} />
              <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>
                New daily target set · {appliedTarget} kcal
              </span>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <Sparkles size={14} color={T.accent} />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.accent,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Recommended adjustment
                </span>
              </div>
              <p style={{ fontSize: 13, color: T.textSecond, lineHeight: 1.5, margin: "0 0 12px" }}>
                {recal.rationale}
              </p>
              <button
                onClick={applyRecal}
                disabled={applying}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  background: T.accent,
                  color: "#0a0a0a",
                  border: "none",
                  borderRadius: 9,
                  padding: "9px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: applying ? "default" : "pointer",
                  opacity: applying ? 0.7 : 1,
                }}
              >
                {applying ? (
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                ) : null}
                {applying
                  ? "Applying…"
                  : `Apply ${recal.deltaKcal > 0 ? "+" : "−"}${Math.abs(recal.deltaKcal)} kcal/day`}
              </button>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </>
          )}
        </div>
      )}

      {/* one reflective question */}
      <p
        style={{
          fontSize: 13,
          color: T.textMuted,
          fontStyle: "italic",
          lineHeight: 1.5,
          margin: "16px 0 0",
          paddingTop: 14,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        {review.oneQuestion}
      </p>
    </div>
  );
}

function Eyebrow() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <Sparkles size={14} color={T.accent} />
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: T.accent,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Weekly Review
      </span>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 16 }}>
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: T.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          margin: "0 0 8px",
        }}
      >
        {label}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span style={{ fontSize: 13, color: T.textSecond, lineHeight: 1.5 }}>{children}</span>
    </div>
  );
}
