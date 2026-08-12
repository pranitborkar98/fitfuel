// app/_hp/v2/graphics.tsx
//
// The four generated graphics from design/FitFuel Homepage v2.dc.html, ported
// from its React.createElement calls to JSX. The arithmetic is unchanged.
//
//   Ring   the macro ring: radius scales with calories, arcs with the real
//          gram split
//   Marks  a tally field, one mark per unit or per N when the count is large,
//          tiled with <pattern> so 154 marks is two rects and not 154 nodes
//   PuneMap  fifteen delivery areas projected from real coordinates
//   BandChart  the thirty-day rotation as calories per day
//
// All four are pure and memoised by the caller, exactly as the prototype's
// once() does: the tally fields alone are ~600 nodes if rebuilt per render.

import type { ReactNode } from "react";

/* ── the macro ring ─────────────────────────────────────────────────────── */
export function Ring({
  kcal,
  protein,
  carbs,
  fat,
  sw,
  pal,
}: {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  sw: number;
  pal?: string[];
}) {
  const r = Math.max(26, Math.min(46, 26 + (kcal / 500) * 18));
  const C = 2 * Math.PI * r;
  const total = protein + carbs + fat || 1;
  const palette = pal || ["#84cc16", "#9a9a94", "#5f5f59"];
  let acc = 0;
  const arcs: ReactNode[] = [];
  ([[protein, palette[0]!], [carbs, palette[1]!], [fat, palette[2]!]] as [number, string][]).forEach(
    ([v, color], i) => {
      const len = (v / total) * C;
      arcs.push(
        <circle
          key={i}
          cx={60}
          cy={60}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeDasharray={`${Math.max(0, len - 1.6)} ${C}`}
          strokeDashoffset={-acc}
          transform="rotate(-90 60 60)"
        />,
      );
      acc += len;
    },
  );

  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={`${Math.round(kcal)} kcal · ${protein}g protein · ${carbs}g carbohydrate · ${fat}g fat`}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
    >
      <circle cx={60} cy={60} r={r} fill="none" stroke="rgba(247,247,245,0.09)" strokeWidth={sw} />
      {arcs}
    </svg>
  );
}

/* ── a tally field ──────────────────────────────────────────────────────── */
export function Marks({
  count,
  per,
  cols,
  accent,
  className,
}: {
  count: number;
  per: number;
  cols: number;
  accent: string;
  className?: string;
}) {
  const cells = Math.max(1, Math.round(count / per));
  const rows = Math.ceil(cells / cols);
  const gap = 1.6;
  const cw = (100 - gap * (cols - 1)) / cols;
  const chh = (62 - gap * (rows - 1)) / rows;
  /* Tiled, not enumerated: a field of 154 marks is 2 rects, not 154. */
  const last = cells % cols || cols;
  const uid = `tf${cols}-${cells}`;
  const tailY = (rows - 1) * (chh + gap);

  return (
    <svg
      viewBox="0 0 100 62"
      preserveAspectRatio="none"
      role="img"
      aria-label={`${count} counted`}
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <pattern id={`${uid}a`} width={cw + gap} height={chh + gap} patternUnits="userSpaceOnUse">
          <rect width={cw} height={chh} fill="#33332f" />
        </pattern>
        <pattern id={`${uid}b`} width={cw + gap} height={chh + gap} patternUnits="userSpaceOnUse">
          <rect width={cw} height={chh} fill={accent} />
        </pattern>
      </defs>
      {rows > 1 && (
        <rect x={0} y={0} width={100} height={(rows - 1) * (chh + gap) - gap + 0.01} fill={`url(#${uid}a)`} />
      )}
      <rect x={0} y={tailY} width={last * (cw + gap) - gap} height={chh} fill={`url(#${uid}b)`} opacity={0.9} />
    </svg>
  );
}

/* ── the coverage map ───────────────────────────────────────────────────── */
export function PuneMap({ places }: { places: { name: string; lat: number; lng: number }[] }) {
  const R0 = { lat: 18.5515, lng: 73.9412 };
  const kx = (lng: number) => (lng - R0.lng) * 111.32 * Math.cos((R0.lat * Math.PI) / 180);
  const ky = (lat: number) => (lat - R0.lat) * 110.57;
  const pts = places.map((a) => ({ ...a, x: kx(a.lng), y: ky(a.lat) }));
  const span = Math.max(...pts.map((q) => Math.max(Math.abs(q.x), Math.abs(q.y)))) + 1.6;
  const W = 900;
  const H = 620;
  const s = Math.min((W - 120) / (span * 2), (H - 90) / (span * 2));
  const px = (q: { x: number }) => W / 2 + q.x * s;
  const py = (q: { y: number }) => H / 2 - q.y * s;

  const grid: ReactNode[] = [];
  for (let k = -10; k <= 10; k += 2) {
    grid.push(<line key={`gx${k}`} x1={W / 2 + k * s} y1={0} x2={W / 2 + k * s} y2={H} stroke="#171715" strokeWidth={1} />);
    grid.push(<line key={`gy${k}`} x1={0} y1={H / 2 + k * s} x2={W} y2={H / 2 + k * s} stroke="#171715" strokeWidth={1} />);
  }

  const rings = [3, 6, 9].map((km) => (
    <g key={`r${km}`}>
      <circle cx={W / 2} cy={H / 2} r={km * s} fill="none" stroke="#232320" strokeWidth={1} />
      <text
        x={W / 2 + 6}
        y={H / 2 - km * s - 7}
        fill="#5f5f59"
        fontFamily="var(--font-mono), monospace"
        fontSize={12}
        letterSpacing={1.4}
      >
        {km} km
      </text>
    </g>
  ));

  const spokes = pts.map((q, i) => (
    <line key={`s${i}`} x1={W / 2} y1={H / 2} x2={px(q)} y2={py(q)} stroke="#1f1f1c" strokeWidth={1} />
  ));

  /* Labels point away from the kitchen, then get nudged apart per side. */
  const placed: Record<string, number[]> = { left: [], right: [] };
  const labels: ReactNode[] = [];
  const nodes = pts
    .map((q, i) => ({ q, i, right: q.x >= 0 }))
    .sort((a, b) => py(a.q) - py(b.q))
    .map(({ q, i, right }) => {
      const side = right ? "right" : "left";
      let ly = py(q) + 4.5;
      const arr = placed[side]!;
      const last = arr[arr.length - 1];
      if (last !== undefined && ly - last < 16) ly = last + 16;
      arr.push(ly);
      const lx = px(q) + (right ? 13 : -13);
      labels.push(
        <text
          key={`t${i}`}
          x={lx}
          y={ly}
          textAnchor={right ? "start" : "end"}
          fill="#c6c6c0"
          fontFamily="var(--font-mono), monospace"
          fontSize={13}
          letterSpacing={0.6}
          stroke="#070707"
          strokeWidth={4}
          paintOrder="stroke"
          strokeLinejoin="round"
        >
          {q.name}
        </text>,
      );
      return (
        <g key={`n${i}`}>
          <rect x={px(q) - 4} y={py(q) - 4} width={8} height={8} fill="#f7f7f5" />
          {Math.abs(ly - (py(q) + 4.5)) > 3 && (
            <polyline
              points={`${px(q)},${py(q)} ${px(q) + (right ? 7 : -7)},${ly - 4} ${lx},${ly - 4}`}
              fill="none"
              stroke="#4c4c46"
              strokeWidth={1}
            />
          )}
        </g>
      );
    });

  return (
    <svg
      viewBox="0 0 900 620"
      role="img"
      aria-label="Fifteen delivery areas of east Pune plotted by coordinate around the Kharadi kitchen"
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      {grid}
      {rings}
      {spokes}
      <g>
        <rect x={W / 2 - 7} y={H / 2 - 7} width={14} height={14} fill="#84cc16" />
        <text
          x={W / 2 + 20}
          y={H / 2 + 5}
          fill="#84cc16"
          fontFamily="var(--font-mono), monospace"
          fontSize={14}
          letterSpacing={0.8}
          stroke="#070707"
          strokeWidth={4.5}
          paintOrder="stroke"
          strokeLinejoin="round"
        >
          KHARADI · THE KITCHEN
        </text>
      </g>
      {nodes}
      {labels}
    </svg>
  );
}

/* ── the thirty-day band ────────────────────────────────────────────────── */
export function BandChart({ k }: { k: number[] }) {
  const avg = Math.round(k.reduce((a, b) => a + b, 0) / k.length);
  const hiV = Math.max(...k);
  const loV = Math.min(...k);
  const lo = Math.floor((loV - 90) / 100) * 100;
  const hi = Math.ceil((hiV + 90) / 100) * 100;
  const W = 1000;
  const H = 260;
  const L = 74;
  const Rr = 26;
  const T = 18;
  const B = 34;
  const X = (i: number) => L + (i / 29) * (W - L - Rr);
  const Y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);

  const grid: ReactNode[] = [];
  for (let v = lo; v <= hi; v += 100) {
    grid.push(<line key={`g${v}`} x1={L} y1={Y(v)} x2={W - Rr} y2={Y(v)} stroke={v === lo ? "#2b2b26" : "#1a1a17"} strokeWidth={1} />);
    grid.push(
      <text key={`t${v}`} x={L - 12} y={Y(v) + 4} textAnchor="end" fill="#5f5f59" fontFamily="var(--font-mono), monospace" fontSize={12}>
        {v.toLocaleString("en-IN")}
      </text>,
    );
  }

  const note = (v: number, i: number, fill: string, txt: string) => (
    <text
      key={txt}
      x={X(i) + (i > 20 ? -9 : 9)}
      y={Y(v) - 9}
      textAnchor={i > 20 ? "end" : "start"}
      fill={fill}
      fontFamily="var(--font-mono), monospace"
      fontSize={12}
      letterSpacing={0.6}
      stroke="#070707"
      strokeWidth={3.5}
      paintOrder="stroke"
    >
      {txt}
    </text>
  );

  return (
    <svg
      viewBox="0 0 1000 260"
      role="img"
      aria-label="Calories per day across the thirty-day rotation"
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      {grid}
      {k.map((v, i) => (
        <line key={`s${i}`} x1={X(i)} y1={Y(v)} x2={X(i)} y2={H - B} stroke={i < 7 ? "#3f4a26" : "#232320"} strokeWidth={i < 7 ? 2 : 1} />
      ))}
      <line x1={L} y1={Y(avg)} x2={W - Rr} y2={Y(avg)} stroke="#85857e" strokeWidth={1} strokeDasharray="5 6" />
      <text x={W - Rr} y={Y(avg) - 8} textAnchor="end" fill="#85857e" fontFamily="var(--font-mono), monospace" fontSize={12} letterSpacing={1}>
        AVERAGE {avg.toLocaleString("en-IN")}
      </text>
      <polyline points={k.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} fill="none" stroke="#84cc16" strokeWidth={2.2} strokeLinejoin="round" />
      {k.map((v, i) => (
        <rect key={`d${i}`} x={X(i) - 2.5} y={Y(v) - 2.5} width={5} height={5} fill={v === hiV ? "#f7f7f5" : v === loV ? "#f59e0b" : "#84cc16"} />
      ))}
      {note(hiV, k.indexOf(hiV), "#f7f7f5", `PEAK ${hiV.toLocaleString("en-IN")}`)}
      {note(loV, k.indexOf(loV), "#f59e0b", `LOW ${loV.toLocaleString("en-IN")}`)}
      {[0, 6, 14, 22, 29].map((i) => (
        <text key={`x${i}`} x={X(i)} y={H - 12} textAnchor="middle" fill="#5f5f59" fontFamily="var(--font-mono), monospace" fontSize={12}>
          D{i + 1}
        </text>
      ))}
      <text x={L} y={T - 4} fill="#3f4a26" fontFamily="var(--font-mono), monospace" fontSize={11} letterSpacing={1.4}>
        WEEK ONE, BELOW
      </text>
    </svg>
  );
}

/** Left edge of the active-day marker, as a percentage of the band's width. */
export function bandActiveLeft(day: number) {
  const W = 1000;
  const L = 74;
  const Rr = 26;
  return (((L + (day / 29) * (W - L - Rr)) / W) * 100).toFixed(2) + "%";
}

/* ── the engine's weigh-in chart ────────────────────────────────────────── */
export function EngineChart({ w }: { w: number[] }) {
  const lo = Math.min(...w) - 0.4;
  const hi = Math.max(...w) + 0.4;
  const y = (kg: number) => 96 - ((kg - lo) / (hi - lo || 1)) * 82;
  return (
    <svg
      viewBox="0 0 320 110"
      style={{ width: "100%", height: "auto", margin: "20px 0 6px", display: "block" }}
      role="img"
      aria-label={`Four weigh-ins: ${w.join(", ")} kilograms`}
    >
      <line x1={0} y1={y(w[0]!)} x2={320} y2={y(w[0]!)} stroke="#232320" strokeWidth={1} strokeDasharray="3 4" />
      <polyline
        points={w.map((kg, i) => `${16 + i * 96},${y(kg)}`).join(" ")}
        fill="none"
        stroke="#84cc16"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {w.map((kg, i) => (
        <g key={i}>
          <circle cx={16 + i * 96} cy={y(kg)} r={5} fill="#070707" stroke="#84cc16" strokeWidth={2.5} />
          <text x={16 + i * 96} y={y(kg) - 13} fill="#f7f7f5" fontFamily="var(--font-mono), monospace" fontSize={11} textAnchor="middle">
            {kg.toFixed(1)}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** The barcode strip on the licence card, seeded from the licence number. */
export function barcodeBars() {
  const a: { w: string; c: string }[] = [];
  let seed = 21523035002815 % 9973;
  for (let i = 0; i < 34; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const w = 1 + (seed % 4);
    a.push({ w: w + "px", c: seed % 5 === 0 ? "#84cc16" : w > 2 ? "#c6c6c0" : "#4a4a45" });
  }
  return a;
}
