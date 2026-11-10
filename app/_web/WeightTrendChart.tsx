import type { WeightPoint } from "@/lib/progress";
import { C, body } from "@/app/_app/theme";

// app/_web/WeightTrendChart.tsx
//
// The weight-trend chart, extracted verbatim from
// app/dashboard/progress/ProgressClient.tsx (2026-11-10, homepage
// smart-scale track) so the homepage shows the same chart the dashboard
// draws, not a second drawing of the same line. ProgressClient imports
// this file now; the logic below is unchanged from the original, including
// the two-reading minimum, the dashed target line and the lime last-point
// dot. Renamed TrendChart -> WeightTrendChart on extraction so the shared
// name says what it plots.

export type MetricKey = "weight" | "bodyFat" | "muscle";

export const METRICS: Record<
  MetricKey,
  { label: string; unit: string; pick: (p: WeightPoint) => number | null }
> = {
  weight: { label: "Weight", unit: "kg", pick: (p) => p.weightKg },
  bodyFat: { label: "Body fat", unit: "%", pick: (p) => p.bodyFatPct },
  muscle: { label: "Muscle", unit: "kg", pick: (p) => p.muscleMassKg },
};

/** One line, hairline gridlines, no area fill. The fill was a lime gradient,
 *  which is the accent used decoratively, and §2 does not allow that. */
export function WeightTrendChart({
  series,
  metric,
  target,
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
      <p style={body(14, { padding: "24px 0", maxWidth: "62ch" })}>
        {`Two ${m.label.toLowerCase()} readings are needed before a trend means anything. ` +
          `Your scale sends them over Bluetooth from the Body screen.`}
      </p>
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
          <text x={4} y={y(g) + 4} fontSize="12" fontFamily="var(--fk-sans), sans-serif" fill={C.dim}>
            {g.toFixed(0)}
          </text>
        </g>
      ))}

      {target !== null && (
        <g>
          <line x1={padL} y1={y(target)} x2={W - padR} y2={y(target)}
                stroke={C.lime} strokeWidth="1" strokeDasharray="4 6" />
          <text x={W - padR} y={y(target) - 6} fontSize="12" textAnchor="end"
                fontFamily="var(--fk-sans), sans-serif" fill={C.lime}>
            target {target}{m.unit}
          </text>
        </g>
      )}

      <path d={path} fill="none" stroke={C.ink} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(pts.length - 1)} cy={y(pts[pts.length - 1].v)} r="4" fill={C.lime} />
    </svg>
  );
}
