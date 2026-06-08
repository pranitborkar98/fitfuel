// app/admin/production/page.tsx
// Phase 15B -- Kitchen Production Dashboard. The cook sheet: for a date (default
// tomorrow), how many portions of each recipe to make, split by delivery window
// and meal slot. Reads the SHARED resolver in lib/production.ts (same source of
// truth as the delivery cron). Gated by app/admin/layout.tsx (OWNER/ADMIN).
//   ?date=YYYY-MM-DD  -> any date
//   ?print=1          -> clean white A4 sheet, auto-prints

import Link from "next/link";
import {
  buildProductionReport,
  targetDayUTC,
  ymd,
  SLOT_ORDER,
  type MealSlotValue,
} from "@/lib/production";

export const dynamic = "force-dynamic";

const SLOT_LABEL: Record<MealSlotValue, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  SNACK: "Snack",
  DINNER: "Dinner",
};

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

export default async function ProductionPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; print?: string }>;
}) {
  const sp = await searchParams;
  const printMode = sp.print === "1";
  const date = targetDayUTC(sp.date ?? null);
  const report = await buildProductionReport(date);

  const prev = ymd(addDays(date, -1));
  const next = ymd(addDays(date, 1));
  const todayStr = ymd(targetDayUTC()); // tomorrow is the default "today's cook target"

  // theme: dark on screen, light for print
  const C = printMode
    ? { bg: "#ffffff", card: "#ffffff", border: "#cccccc", text: "#000000", muted: "#555555", accent: "#3f6212", head: "#f3f4f6" }
    : { bg: "transparent", card: "#101010", border: "#222222", text: "#ffffff", muted: "#888888", accent: "#84cc16", head: "#161616" };

  const dateLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  const groups = (["BREAKFAST", "LUNCH", "SNACK", "DINNER"] as MealSlotValue[])
    .map((slot) => ({ slot, lines: report.lines.filter((l) => l.primarySlot === slot) }))
    .filter((g) => g.lines.length > 0)
    .sort((a, b) => SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot]);

  const tile = (label: string, value: string | number) => (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "14px 18px",
        minWidth: 120,
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.muted }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.text, marginTop: 4 }}>{value}</div>
    </div>
  );

  return (
    <div className="ff-prod" style={{ background: C.bg, color: C.text, fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @media print {
          header { display: none !important; }
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }
        .ff-prod table { border-collapse: collapse; width: 100%; }
        .ff-prod th, .ff-prod td { text-align: left; padding: 9px 12px; font-size: 14px; }
        .ff-prod th { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
        .ff-prod td.num, .ff-prod th.num { text-align: right; font-variant-numeric: tabular-nums; }
      `}</style>

      {printMode && (
        <script dangerouslySetInnerHTML={{ __html: "window.addEventListener('load',function(){setTimeout(function(){window.print();},250);});" }} />
      )}

      {/* Header + controls */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: C.accent, fontWeight: 700 }}>
            Kitchen Production
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: "6px 0 0", color: C.text }}>{dateLabel}</h1>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            Cook sheet · portions to prepare for this delivery date
          </div>
        </div>

        <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href={`/admin/production?date=${prev}`} style={btn(C)}>← Prev</Link>
          <Link href="/admin/production" style={btn(C, ymd(date) === todayStr)}>Tomorrow</Link>
          <Link href={`/admin/production?date=${next}`} style={btn(C)}>Next →</Link>
          <form method="get" style={{ display: "inline-flex", gap: 6, marginLeft: 4 }}>
            <input
              type="date"
              name="date"
              defaultValue={ymd(date)}
              style={{ background: C.card, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
            />
            <button type="submit" style={btn(C)}>Go</button>
          </form>
          <Link href={`/admin/production?date=${ymd(date)}&print=1`} style={{ ...btn(C, true), marginLeft: 4 }}>
            🖨 Print SOP
          </Link>
        </div>
      </div>

      {/* Headcount tiles */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
        {tile("Subscribers", report.headcount.total)}
        {tile("Morning", report.headcount.MORNING)}
        {tile("Evening", report.headcount.EVENING)}
        {tile("Total portions", fmt(report.totalPortions))}
        {tile("Recipes", report.lines.length)}
      </div>

      {/* Warnings */}
      {report.warnings.length > 0 && (
        <div
          style={{
            background: printMode ? "#fff7ed" : "#2a1d05",
            border: `1px solid ${printMode ? "#fdba74" : "#7c5e10"}`,
            color: printMode ? "#7c2d12" : "#fbbf24",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 22,
            fontSize: 13,
          }}
        >
          <strong>Schedule gaps ({report.warnings.length}):</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
            {report.warnings.map((w) => (
              <li key={w} style={{ marginBottom: 3 }}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cook sheet */}
      {report.lines.length === 0 ? (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "40px 24px", textAlign: "center", color: C.muted }}>
          No active deliveries scheduled for this date.
        </div>
      ) : (
        groups.map((g) => (
          <div key={g.slot} style={{ marginBottom: 26 }}>
            <div style={{ fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: C.accent, fontWeight: 700, marginBottom: 8 }}>
              {SLOT_LABEL[g.slot]}
            </div>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
              <table>
                <thead>
                  <tr style={{ background: C.head, color: C.muted }}>
                    <th>Recipe</th>
                    <th>Cuisine</th>
                    <th className="num">Portions</th>
                    <th className="num">Morning</th>
                    <th className="num">Evening</th>
                    <th className="num">Serving (g)</th>
                    <th className="num">kcal</th>
                  </tr>
                </thead>
                <tbody>
                  {g.lines.map((l, i) => (
                    <tr key={l.recipeId} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.border}`, background: C.card }}>
                      <td style={{ fontWeight: 600, color: C.text }}>{l.recipeName}</td>
                      <td style={{ color: C.muted }}>{l.cuisineType}</td>
                      <td className="num" style={{ fontWeight: 800, color: C.accent }}>{fmt(l.totalPortions)}</td>
                      <td className="num" style={{ color: C.text }}>{fmt(l.byWindow.MORNING)}</td>
                      <td className="num" style={{ color: C.text }}>{fmt(l.byWindow.EVENING)}</td>
                      <td className="num" style={{ color: C.muted }}>{l.servingSizeGrams}</td>
                      <td className="num" style={{ color: C.muted }}>{l.caloriesPerServing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
        Generated {ymd(new Date())} · menu day is calendar-based from each subscriber&rsquo;s start date · figures match the nightly delivery generator.
      </div>
    </div>
  );
}

function btn(C: { card: string; border: string; text: string; accent: string }, active = false): React.CSSProperties {
  return {
    display: "inline-block",
    background: active ? C.accent : C.card,
    color: active ? "#080808" : C.text,
    border: `1px solid ${active ? C.accent : C.border}`,
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
  };
}
