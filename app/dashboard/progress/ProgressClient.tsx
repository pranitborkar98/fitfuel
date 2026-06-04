"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingDown, TrendingUp, Activity, Flame, Target, Dumbbell, Award, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import type { ProgressData, WeightPoint } from "@/lib/progress";

// ── Design tokens (matches existing dashboard system) ──
const T = {
  bg: "#0a0a0a",
  card: "#111111",
  cardHover: "#161616",
  border: "#1f1f1f",
  accent: "#84cc16",
  accentLight: "#a3e635",
  text: "#ffffff",
  textSecond: "#a3a3a3",
  textMuted: "#737373",
  good: "#22c55e",
  warn: "#f97316",
  fat: "#38bdf8",
  muscle: "#f59e0b",
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function fmtNum(n: number | null, suffix = "") {
  if (n === null || n === undefined) return "—";
  return `${n.toLocaleString("en-IN")}${suffix}`;
}

// ── Generic section card ──
function Card({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: "22px 22px",
      }}
    >
      {children}
    </motion.div>
  );
}

function Heading({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <div style={{ color: T.accent, display: "flex" }}>{icon}</div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.1 }}>{title}</p>
        {sub && <p style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Weight + body-comp line chart ──
function WeightChart({ series, target }: { series: WeightPoint[]; target: number | null }) {
  const pts = series.filter((p) => p.weightKg !== null);
  if (pts.length < 2) {
    return (
      <div style={{ fontSize: 13, color: T.textMuted, padding: "28px 0", textAlign: "center" }}>
        Log at least two weigh-ins to see your trend. Connect your scale on the Body Metrics page.
      </div>
    );
  }

  const W = 640, H = 220, padL = 40, padR = 16, padT = 16, padB = 26;
  const ws = pts.map((p) => p.weightKg as number);
  const allY = target !== null ? [...ws, target] : ws;
  const minY = Math.floor(Math.min(...allY) - 1);
  const maxY = Math.ceil(Math.max(...allY) + 1);
  const spanY = maxY - minY || 1;

  const x = (i: number) => padL + (i / (pts.length - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - minY) / spanY) * (H - padT - padB);

  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.weightKg as number)}`).join(" ");
  const area = `${path} L ${x(pts.length - 1)} ${H - padB} L ${x(0)} ${H - padB} Z`;
  const targetY = target !== null ? y(target) : null;

  const gridVals = [minY, minY + spanY / 2, maxY];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.accent} stopOpacity="0.25" />
          <stop offset="100%" stopColor={T.accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridVals.map((g, i) => (
        <g key={i}>
          <line x1={padL} y1={y(g)} x2={W - padR} y2={y(g)} stroke={T.border} strokeWidth="1" />
          <text x={6} y={y(g) + 4} fontSize="10" fill={T.textMuted}>{g.toFixed(0)}</text>
        </g>
      ))}
      {targetY !== null && (
        <g>
          <line x1={padL} y1={targetY} x2={W - padR} y2={targetY} stroke={T.textMuted} strokeWidth="1.2" strokeDasharray="5 4" />
          <text x={W - padR} y={targetY - 5} fontSize="10" fill={T.textMuted} textAnchor="end">target {target}kg</text>
        </g>
      )}
      <path d={area} fill="url(#wfill)" />
      <path d={path} fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.weightKg as number)} r="3" fill={T.bg} stroke={T.accentLight} strokeWidth="2" />
      ))}
    </svg>
  );
}

// ── Daily net-calorie bar chart with target line ──
function CalorieChart({ data }: { data: ProgressData["calories"] }) {
  const days = data.days;
  const hasAny = days.some((d) => d.in > 0 || d.out > 0);
  if (!hasAny) {
    return (
      <div style={{ fontSize: 13, color: T.textMuted, padding: "28px 0", textAlign: "center" }}>
        No intake or workouts logged in the last 30 days yet.
      </div>
    );
  }

  const W = 640, H = 200, padL = 44, padR = 12, padT = 12, padB = 22;
  const maxVal = Math.max(data.target, ...days.map((d) => d.net), ...days.map((d) => d.in)) * 1.1 || 1;
  const bw = (W - padL - padR) / days.length;
  const y = (v: number) => padT + (1 - v / maxVal) * (H - padT - padB);
  const targetY = y(data.target);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {[0, maxVal / 2, maxVal].map((g, i) => (
        <g key={i}>
          <line x1={padL} y1={y(g)} x2={W - padR} y2={y(g)} stroke={T.border} strokeWidth="1" />
          <text x={6} y={y(g) + 4} fontSize="10" fill={T.textMuted}>{Math.round(g)}</text>
        </g>
      ))}
      {days.map((d, i) => {
        if (d.net <= 0) return null;
        const barH = (H - padT - padB) - (y(d.net) - padT);
        const over = d.net > data.target;
        return (
          <rect
            key={i}
            x={padL + i * bw + bw * 0.18}
            y={y(d.net)}
            width={bw * 0.64}
            height={Math.max(0, barH)}
            rx="1.5"
            fill={over ? T.warn : T.good}
            opacity={0.9}
          />
        );
      })}
      <line x1={padL} y1={targetY} x2={W - padR} y2={targetY} stroke={T.accentLight} strokeWidth="1.4" strokeDasharray="5 4" />
      <text x={W - padR} y={targetY - 5} fontSize="10" fill={T.accentLight} textAnchor="end">target {data.target}</text>
    </svg>
  );
}

// ── Macro adherence horizontal bars ──
function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = target > 0 ? Math.min(150, Math.round((value / target) * 100)) : 0;
  const barPct = Math.min(100, pct);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: T.textSecond, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, color: T.textMuted }}>
          <span style={{ color: T.text, fontWeight: 700 }}>{value}g</span>
          {target > 0 ? ` / ${target}g · ${pct}%` : " avg/day"}
        </span>
      </div>
      <div style={{ height: 8, background: "#1a1a1a", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${barPct}%`, background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ── Consistency component bars ──
function ConsistencyBars({ data }: { data: NonNullable<ProgressData["consistency"]> }) {
  const barColor =
    data.score >= 80 ? T.good : data.score >= 60 ? T.accent : data.score >= 40 ? "#facc15" : T.warn;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 34, fontWeight: 800, color: barColor, lineHeight: 1 }}>
          {data.score}
        </span>
        <span style={{ fontSize: 13, color: T.textMuted }}>/ 100 · {data.label}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.components.map((c) => {
          const pct = c.max > 0 ? Math.round((c.points / c.max) * 100) : 0;
          return (
            <div key={c.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: T.textSecond }}>{c.label}</span>
                <span style={{ fontSize: 11, color: T.textMuted }}>{c.points}/{c.max}</span>
              </div>
              <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 3, opacity: 0.85, transition: "width 0.6s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Stat tile ──
function Stat({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color?: string }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ color: color ?? T.textMuted, marginBottom: 8, display: "flex" }}>{icon}</div>
      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: color ?? T.text, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>{label}</p>
    </div>
  );
}

// ── Page ──
export default function ProgressClient({ data, userName }: { data: ProgressData; userName: string | null }) {
  const [metric, setMetric] = useState<"weight" | "bodyFat" | "muscle">("weight");
  const w = data.weight;
  const losing = w.deltaKg !== null && w.deltaKg < 0;

  return (
    <div
      style={{
        background: T.bg,
        minHeight: "100vh",
        color: T.text,
        fontFamily: "'DM Sans', sans-serif",
        paddingTop: 96,
        paddingBottom: 80,
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px" }}>
        {/* header */}
        <div style={{ marginBottom: 28 }}>
          <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: T.textMuted, textDecoration: "none", marginBottom: 14 }}>
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 24, height: 2, background: T.accent, borderRadius: 1 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: T.accent, textTransform: "uppercase" }}>Your Progress</span>
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2rem, 6vw, 3rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>
            The Transformation
          </h1>
          {data.planName && (
            <p style={{ fontSize: 13, color: T.textMuted, marginTop: 8 }}>{data.planName} · last 30 days</p>
          )}
        </div>

        {/* top stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }} className="prog-stats">
          <Stat
            icon={losing ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
            value={w.deltaKg !== null ? `${w.deltaKg > 0 ? "+" : ""}${w.deltaKg} kg` : "—"}
            label="Weight change"
            color={losing ? T.good : w.deltaKg !== null && w.deltaKg > 0 ? T.warn : T.text}
          />
          <Stat icon={<Flame size={18} />} value={fmtNum(data.calories.avgNet)} label="Avg net kcal/day" />
          <Stat icon={<Dumbbell size={18} />} value={fmtNum(data.adherence.workoutsCompleted)} label="Workouts done" color={T.accent} />
          <Stat icon={<Award size={18} />} value={`${data.adherence.streakDays}d`} label="Current streak" color={T.accentLight} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="prog-grid">
          {/* weight chart — full width */}
          <div style={{ gridColumn: "1 / -1" }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <Heading icon={<Activity size={18} />} title="Weight trend" sub={`Start ${fmtNum(w.startWeight, "kg")} · Now ${fmtNum(w.currentWeight, "kg")} · Goal ${fmtNum(w.targetWeight, "kg")}`} />
                <div style={{ display: "flex", gap: 6 }}>
                  {(["weight", "bodyFat", "muscle"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMetric(m)}
                      style={{
                        fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                        background: metric === m ? "rgba(132,204,22,0.12)" : "transparent",
                        border: `1px solid ${metric === m ? "rgba(132,204,22,0.4)" : T.border}`,
                        color: metric === m ? T.accentLight : T.textMuted,
                      }}
                    >
                      {m === "weight" ? "Weight" : m === "bodyFat" ? "Body fat" : "Muscle"}
                    </button>
                  ))}
                </div>
              </div>
              <WeightChart series={w.series} target={metric === "weight" ? w.targetWeight : null} />
              <div style={{ display: "flex", gap: 18, marginTop: 8, flexWrap: "wrap" }}>
                {w.latestBodyFat !== null && (
                  <span style={{ fontSize: 12, color: T.textMuted }}>Body fat <strong style={{ color: T.fat }}>{w.latestBodyFat}%</strong></span>
                )}
                {w.latestMuscle !== null && (
                  <span style={{ fontSize: 12, color: T.textMuted }}>Muscle <strong style={{ color: T.muscle }}>{w.latestMuscle}kg</strong></span>
                )}
              </div>
            </Card>
          </div>

          {/* calorie chart */}
          <div style={{ gridColumn: "1 / -1" }}>
            <Card delay={0.05}>
              <Heading icon={<Flame size={18} />} title="Daily net calories" sub={`In ${fmtNum(data.calories.avgIn)} · Out ${fmtNum(data.calories.avgOut)} avg/day · target ${data.calories.target}`} />
              <CalorieChart data={data.calories} />
              <p style={{ fontSize: 11, color: T.textMuted, marginTop: 8, lineHeight: 1.5 }}>
                Net = plan meals eaten + manual diary minus workout burn. Green = at/under target, orange = over.
              </p>
            </Card>
          </div>

          {/* macros */}
          <Card delay={0.1}>
            <Heading icon={<Target size={18} />} title="Macro adherence" sub="Average per tracked day vs target" />
            <MacroBar label="Protein" value={data.macros.avg.protein} target={data.macros.target.protein} color={T.accent} />
            <MacroBar label="Carbs" value={data.macros.avg.carbs} target={data.macros.target.carbs} color={T.fat} />
            <MacroBar label="Fat" value={data.macros.avg.fat} target={data.macros.target.fat} color={T.muscle} />
          </Card>

          {/* consistency */}
          <Card delay={0.15}>
            <Heading icon={<Award size={18} />} title="Consistency this week" sub="Resets Sunday · feeds your AI trainer" />
            {data.consistency ? (
              <ConsistencyBars data={data.consistency} />
            ) : (
              <p style={{ fontSize: 13, color: T.textMuted }}>No active plan this week.</p>
            )}
          </Card>

          {/* adherence summary — full width */}
          <div style={{ gridColumn: "1 / -1" }}>
            <Card delay={0.2}>
              <Heading icon={<Activity size={18} />} title="Adherence" sub="How closely you followed the plan" />
              <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
                <div>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>
                    {data.adherence.mealsLogged}<span style={{ color: T.textMuted, fontWeight: 600 }}> / {data.adherence.mealsScheduled || "—"}</span>
                  </p>
                  <p style={{ fontSize: 12, color: T.textMuted }}>Plan meals eaten</p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: T.accent }}>{data.adherence.workoutsCompleted}</p>
                  <p style={{ fontSize: 12, color: T.textMuted }}>Workouts completed</p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: T.accentLight }}>{data.adherence.streakDays} days</p>
                  <p style={{ fontSize: 12, color: T.textMuted }}>Current logging streak</p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>{data.adherence.daysActive}</p>
                  <p style={{ fontSize: 12, color: T.textMuted }}>Active days (30d window)</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .prog-stats { grid-template-columns: 1fr 1fr !important; }
          .prog-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
