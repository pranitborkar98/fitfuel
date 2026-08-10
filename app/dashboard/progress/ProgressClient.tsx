"use client";

// app/dashboard/progress/ProgressClient.tsx
//
// Two things were wrong here beyond the palette.
//
// The metric toggle did not work. WeightChart only ever read p.weightKg, so
// picking "Body fat" or "Muscle" redrew the identical weight line. WeightPoint
// carries bodyFatPct and muscleMassKg, so the toggle now selects the series it
// claims to, and the empty state is per metric rather than per screen.
//
// And the palette was the exact drift theme.ts was written to stop: a blue for
// fat, an amber for muscle, a green for good, an orange for over and a yellow
// for the middle consistency band. Five hues on a two colour system, with the
// meaning carried by the hue. Now: lime is at or under target, the neutral bar
// grey is over, and both are named in words.

import { useState } from "react";
import type { ProgressData, WeightPoint } from "@/lib/progress";
import { C, COND, body, label, num, figure, PANEL } from "@/app/_app/theme";

type MetricKey = "weight" | "bodyFat" | "muscle";

const METRICS: Record<MetricKey, {
  label: string;
  unit: string;
  pick: (p: WeightPoint) => number | null;
}> = {
  weight: { label: "Weight", unit: "kg", pick: (p) => p.weightKg },
  bodyFat: { label: "Body fat", unit: "%", pick: (p) => p.bodyFatPct },
  muscle: { label: "Muscle", unit: "kg", pick: (p) => p.muscleMassKg },
};

function fmt(n: number | null, suffix = "") {
  if (n === null || n === undefined) return "Not measured";
  return `${n.toLocaleString("en-IN")}${suffix}`;
}

function Spine({ children }: { children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "26px 0 16px" }}>
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

function Empty({ children }: { children: string }) {
  return <p style={body(14, { padding: "24px 0", maxWidth: "62ch" })}>{children}</p>;
}

/** One line, hairline gridlines, no area fill. The fill was a lime gradient,
 *  which is the accent used decoratively, and §2 does not allow that. */
function TrendChart({
  series, metric, target,
}: {
  series: WeightPoint[];
  metric: MetricKey;
  target: number | null;
}) {
  const m = METRICS[metric];
  const pts = series
    .map((p) => ({ date: p.date, v: m.pick(p) }))
    .filter((p): p is { date: string; v: number } => p.v !== null);

  if (pts.length < 2) {
    return (
      <Empty>
        {`Two ${m.label.toLowerCase()} readings are needed before a trend means anything. ` +
         `Your scale sends them over Bluetooth from the Body screen.`}
      </Empty>
    );
  }

  const W = 720, H = 220, padL = 46, padR = 14, padT = 16, padB = 26;
  const vals = pts.map((p) => p.v);
  const all = target !== null ? [...vals, target] : vals;
  const lo = Math.floor(Math.min(...all) - 1);
  const hi = Math.ceil(Math.max(...all) + 1);
  const span = hi - lo || 1;

  const x = (i: number) => padL + (i / (pts.length - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - lo) / span) * (H - padT - padB);

  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.v)}`).join(" ");
  const gridVals = [lo, lo + span / 2, hi];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: "block" }}
      role="img"
      aria-label={`${m.label} from ${vals[0]}${m.unit} to ${vals[vals.length - 1]}${m.unit} over ${pts.length} readings`}
    >
      {gridVals.map((g, i) => (
        <g key={i}>
          <line x1={padL} y1={y(g)} x2={W - padR} y2={y(g)} stroke={C.rule} strokeWidth="1" />
          <text x={4} y={y(g) + 4} fontSize="12" fontFamily="var(--font-mono), ui-monospace, monospace" fill={C.dim}>
            {g.toFixed(0)}
          </text>
        </g>
      ))}

      {target !== null && (
        <g>
          <line x1={padL} y1={y(target)} x2={W - padR} y2={y(target)}
                stroke={C.lime} strokeWidth="1" strokeDasharray="4 6" />
          <text x={W - padR} y={y(target) - 6} fontSize="12" textAnchor="end"
                fontFamily="var(--font-mono), ui-monospace, monospace" fill={C.lime}>
            target {target}{m.unit}
          </text>
        </g>
      )}

      <path d={path} fill="none" stroke={C.ink} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(pts.length - 1)} cy={y(pts[pts.length - 1].v)} r="4" fill={C.lime} />
    </svg>
  );
}

/** Bars are square. The old ones carried a corner radius, and radius is 0
 *  everywhere on both grounds. DESIGN.md §4. */
function CalorieChart({ data }: { data: ProgressData["calories"] }) {
  const days = data.days;
  if (!days.some((d) => d.in > 0 || d.out > 0)) {
    return <Empty>Nothing logged in the last 30 days, so there is no net calorie line to draw yet.</Empty>;
  }

  const W = 720, H = 200, padL = 46, padR = 14, padT = 12, padB = 22;
  const max = Math.max(data.target, ...days.map((d) => d.net), ...days.map((d) => d.in)) * 1.1 || 1;
  const bw = (W - padL - padR) / days.length;
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB);

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} role="img"
           aria-label={`Net calories per day for the last ${days.length} days against a target of ${data.target}`}>
        {[0, max / 2, max].map((g, i) => (
          <g key={i}>
            <line x1={padL} y1={y(g)} x2={W - padR} y2={y(g)} stroke={C.rule} strokeWidth="1" />
            <text x={4} y={y(g) + 4} fontSize="12" fontFamily="var(--font-mono), ui-monospace, monospace" fill={C.dim}>
              {Math.round(g)}
            </text>
          </g>
        ))}

        {days.map((d, i) => {
          if (d.net <= 0) return null;
          const top = y(d.net);
          return (
            <rect
              key={i}
              x={padL + i * bw + bw * 0.18}
              y={top}
              width={bw * 0.64}
              height={Math.max(0, H - padB - top)}
              fill={d.net > data.target ? C.fat : C.lime}
            />
          );
        })}

        <line x1={padL} y1={y(data.target)} x2={W - padR} y2={y(data.target)}
              stroke={C.lime} strokeWidth="1" strokeDasharray="4 6" />
      </svg>

      <p style={body(13, { marginTop: 10, maxWidth: "68ch" })}>
        Net is plan meals eaten plus anything in the diary, minus workout burn. A lime bar is at
        or under target, a grey bar is over. The dashed line is the target itself.
      </p>
    </>
  );
}

function Meter({ name, value, target, on }: { name: string; value: number; target: number; on: boolean }) {
  const pct = target > 0 ? Math.min(150, Math.round((value / target) * 100)) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={label(12)}>{name}</span>
        <span style={num(12)}>
          {value}g{target > 0 ? ` / ${target}g, ${pct}%` : " average a day"}
        </span>
      </div>
      <div style={{ height: 10, background: C.trough }}>
        <div style={{ height: 10, width: `${Math.min(100, pct)}%`, background: on ? C.lime : C.fat }} />
      </div>
    </div>
  );
}

export default function ProgressClient({ data }: { data: ProgressData }) {
  const [metric, setMetric] = useState<MetricKey>("weight");
  const w = data.weight;
  const m = METRICS[metric];

  return (
    <>
      <div style={{ display: "grid", gap: 1, background: C.rule, border: `1px solid ${C.rule}`,
                    gridTemplateColumns: "repeat(auto-fit,minmax(136px,1fr))", marginTop: 26 }}>
        <Readout
          v={w.deltaKg !== null ? `${w.deltaKg > 0 ? "+" : ""}${w.deltaKg} kg` : "Not measured"}
          k="Weight change"
          live={w.deltaKg !== null && w.deltaKg < 0}
        />
        <Readout v={fmt(data.calories.avgNet)} k="Avg net kcal a day" />
        <Readout v={String(data.adherence.workoutsCompleted)} k="Workouts done" />
        <Readout v={`${data.adherence.streakDays}d`} k="Logging streak" live={data.adherence.streakDays > 0} />
      </div>

      <Spine>The trend</Spine>
      <div style={{ ...PANEL, padding: "18px 18px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <p style={body(13, { margin: 0 })}>
            Start {fmt(w.startWeight, "kg")}, now {fmt(w.currentWeight, "kg")}, goal {fmt(w.targetWeight, "kg")}
          </p>
          <div role="group" aria-label="Metric" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(Object.keys(METRICS) as MetricKey[]).map((k) => {
              const on = metric === k;
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setMetric(k)}
                  style={{
                    minHeight: 44, padding: "0 14px", cursor: "pointer",
                    background: on ? C.wash : "transparent",
                    border: `1px solid ${on ? C.lime : C.rule2}`,
                    color: on ? C.lime : C.mute,
                    fontFamily: COND, fontWeight: 800, fontSize: 14,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    transition: "border-color 180ms ease-out, color 180ms ease-out",
                  }}
                >
                  {METRICS[k].label}
                </button>
              );
            })}
          </div>
        </div>

        <TrendChart
          series={w.series}
          metric={metric}
          target={metric === "weight" ? w.targetWeight : null}
        />

        <p style={body(13, { marginTop: 10 })}>
          Showing {m.label.toLowerCase()} in {m.unit}.
        </p>
      </div>

      <Spine>Daily net calories</Spine>
      <div style={{ ...PANEL, padding: "18px" }}>
        <p style={body(13, { margin: "0 0 14px" })}>
          In {fmt(data.calories.avgIn)}, out {fmt(data.calories.avgOut)} a day on average,
          against a target of {data.calories.target}.
        </p>
        <CalorieChart data={data.calories} />
      </div>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                    marginTop: 26 }}>
        <div style={{ ...PANEL, padding: 18 }}>
          <p style={label(12, { display: "block", marginBottom: 14 })}>Macros, average against target</p>
          <Meter name="Protein" value={data.macros.avg.protein} target={data.macros.target.protein} on />
          <Meter name="Carbs" value={data.macros.avg.carbs} target={data.macros.target.carbs} on={false} />
          <Meter name="Fat" value={data.macros.avg.fat} target={data.macros.target.fat} on={false} />
        </div>

        <div style={{ ...PANEL, padding: 18 }}>
          <p style={label(12, { display: "block", marginBottom: 14 })}>Consistency this week</p>
          {data.consistency ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
                <span style={figure(34, { color: C.lime })}>{data.consistency.score}</span>
                <span style={num(12, { color: C.dim })}>of 100, {data.consistency.label.toLowerCase()}</span>
              </div>
              {data.consistency.components.map((c) => (
                <Meter key={c.label} name={c.label} value={c.points} target={c.max} on={c.points >= c.max * 0.6} />
              ))}
            </>
          ) : (
            <Empty>No active plan this week, so there is nothing to score.</Empty>
          )}
        </div>
      </div>

      <Spine>Adherence</Spine>
      <div style={{ display: "grid", gap: 1, background: C.rule, border: `1px solid ${C.rule}`,
                    gridTemplateColumns: "repeat(auto-fit,minmax(136px,1fr))" }}>
        <Readout
          v={`${data.adherence.mealsLogged}/${data.adherence.mealsScheduled || 0}`}
          k="Plan meals eaten"
        />
        <Readout v={String(data.adherence.workoutsCompleted)} k="Workouts completed" />
        <Readout v={`${data.adherence.streakDays}d`} k="Logging streak" />
        <Readout v={String(data.adherence.daysActive)} k="Active days, 30 day window" />
      </div>
    </>
  );
}
