"use client";

// app/_web/WeightChart.tsx
//
// ONE SVG LINE CHART, THREE VIEWS (v2 §3.6, §3.7, §3.8).
//
// The weight trend is the product's proof, so it is drawn from real series
// data — the 30-day example series (buildWeightSeries) or the four coach
// weeks — never from CSS bars. The line draws in on first view (900ms);
// under prefers-reduced-motion it renders in its final state.

import { useEffect, useId, useRef, useState } from "react";

import type { WeightPoint } from "./homepage-v2-data";

const W = 600;
const H = 220;
const PAD = { top: 28, right: 16, bottom: 30, left: 44 };

export default function WeightChart({
  series,
  stallDay,
  compact = false,
  label,
}: {
  series: WeightPoint[];
  /** Day value of the stall annotation (week 3). Omit for no annotation. */
  stallDay?: number;
  /** Shorter chart for the coach band. */
  compact?: boolean;
  label: string;
}) {
  const height = compact ? 160 : H;
  const gradientId = useId();
  const pathRef = useRef<SVGPathElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setDrawn(true);
      return;
    }
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
    const raf = requestAnimationFrame(() => {
      path.style.transition = "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)";
      path.style.strokeDashoffset = "0";
    });
    const done = window.setTimeout(() => setDrawn(true), 950);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(done);
    };
  }, [reducedMotion, series]);

  if (series.length < 2) return null;

  const days = series.map((p) => p.day);
  const kgs = series.map((p) => p.kg);
  const minDay = Math.min(...days);
  const maxDay = Math.max(...days);
  const minKg = Math.min(...kgs);
  const maxKg = Math.max(...kgs);
  const padKg = 0.4;
  const lo = minKg - padKg;
  const hi = maxKg + padKg;

  const x = (day: number) =>
    PAD.left + ((day - minDay) / (maxDay - minDay || 1)) * (W - PAD.left - PAD.right);
  const y = (kg: number) =>
    PAD.top + (1 - (kg - lo) / (hi - lo)) * (height - PAD.top - PAD.bottom);

  const line = series
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.day).toFixed(1)},${y(p.kg).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(maxDay).toFixed(1)},${y(lo).toFixed(1)} L${x(minDay).toFixed(1)},${y(lo).toFixed(1)} Z`;
  const stall = stallDay !== undefined ? series.find((p) => p.day === stallDay) : undefined;
  const first = series[0]!;
  const last = series[series.length - 1]!;
  const gridKgs = [lo + (hi - lo) * 0.25, lo + (hi - lo) * 0.5, lo + (hi - lo) * 0.75];

  return (
    <figure
      style={{ margin: 0 }}
      role="img"
      aria-label={`${label}. Weight from ${first.kg.toFixed(1)} kg to ${last.kg.toFixed(1)} kg${stall ? ", with a stall flagged" : ""}.`}
    >
      <svg
        viewBox={`0 0 ${W} ${height}`}
        width="100%"
        style={{ display: "block", height: "auto" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E5B3A" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1E5B3A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridKgs.map((kg) => (
          <g key={kg}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(kg)}
              y2={y(kg)}
              stroke="var(--fk-line)"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 8}
              y={y(kg) + 4}
              textAnchor="end"
              fontSize="12"
              style={{ fill: "var(--fk-ink-3)" }}
            >
              {kg.toFixed(1)}
            </text>
          </g>
        ))}

        <path d={area} fill={`url(#${gradientId})`} opacity={drawn || reducedMotion ? 1 : 0} />
        <path
          ref={pathRef}
          d={line}
          fill="none"
          stroke="#1E5B3A"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {stall ? (
          <g>
            <circle cx={x(stall.day)} cy={y(stall.kg)} r="9" fill="#C14E1D" opacity="0.18" />
            <circle cx={x(stall.day)} cy={y(stall.kg)} r="5" fill="#C14E1D" stroke="#FFFFFF" strokeWidth="2" />
            <text
              x={x(stall.day)}
              y={Math.max(14, y(stall.kg) - 16)}
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill="#C14E1D"
            >
              Stall flagged
            </text>
          </g>
        ) : null}

        <circle cx={x(last.day)} cy={y(last.kg)} r="5" fill="#1E5B3A" stroke="#FFFFFF" strokeWidth="2" />
        <text x={x(first.day)} y={height - 8} textAnchor="start" fontSize="12" style={{ fill: "var(--fk-ink-3)" }}>
          {compact ? "Week 1" : "30 days ago"}
        </text>
        <text x={x(last.day)} y={height - 8} textAnchor="end" fontSize="12" style={{ fill: "var(--fk-ink-3)" }}>
          {compact ? "Week 4" : "Today"}
        </text>
        <text
          x={x(last.day)}
          y={Math.max(14, y(last.kg) - 12)}
          textAnchor="end"
          fontSize="14"
          fontWeight="700"
          style={{ fill: "var(--fk-ink)" }}
        >
          {last.kg.toFixed(1)} kg
        </text>
      </svg>
      <figcaption style={{ fontSize: 13, color: "var(--fk-ink-3)", marginTop: 8 }}>
        {label}
      </figcaption>
    </figure>
  );
}
