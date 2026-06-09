// app/admin/production/page.tsx
// Phase 15B -- Kitchen Production Dashboard (full SOP). For a date (default
// tomorrow): portions per recipe (by window + slot), a consolidated prep /
// shopping list (raw grams, scaled to portions), and per-recipe scaled
// ingredients + step-by-step cooking SOP. Reads the SHARED resolver in
// lib/production.ts (same source of truth as the delivery cron).
//   ?date=YYYY-MM-DD  -> any date     ?print=1 -> clean white sheet, auto-prints

import Link from "next/link";
import {
  buildProductionReport,
  targetDayUTC,
  ymd,
  SLOT_ORDER,
  type MealSlotValue,
} from "@/lib/production";

import { requireSurface } from "@/lib/admin-auth";

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

// raw grams -> kitchen-friendly (kg when large)
function grams(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(2)} kg`;
  return `${Math.round(n)} g`;
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
  await requireSurface("production");
  const sp = await searchParams;
  const printMode = sp.print === "1";
  const date = targetDayUTC(sp.date ?? null);
  const report = await buildProductionReport(date);

  const prev = ymd(addDays(date, -1));
  const next = ymd(addDays(date, 1));
  const tomorrowStr = ymd(targetDayUTC());

  const C = printMode
    ? { bg: "#ffffff", card: "#ffffff", border: "#cccccc", text: "#000000", muted: "#555555", accent: "#3f6212", head: "#f3f4f6", soft: "#fafafa" }
    : { bg: "transparent", card: "#101010", border: "#222222", text: "#ffffff", muted: "#888888", accent: "#84cc16", head: "#161616", soft: "#0c0c0c" };

  const dateLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(date);

  const groups = (["BREAKFAST", "LUNCH", "SNACK", "DINNER"] as MealSlotValue[])
    .map((slot) => ({ slot, lines: report.lines.filter((l) => l.primarySlot === slot) }))
    .filter((g) => g.lines.length > 0)
    .sort((a, b) => SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot]);

  const tile = (label: string, value: string | number) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", minWidth: 110 }}>
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
          .ff-prod details { break-inside: avoid; }
        }
        .ff-prod table { border-collapse: collapse; width: 100%; }
        .ff-prod th, .ff-prod td { text-align: left; padding: 8px 12px; font-size: 13.5px; }
        .ff-prod th { font-size: 10.5px; letter-spacing: 1px; text-transform: uppercase; }
        .ff-prod td.num, .ff-prod th.num { text-align: right; font-variant-numeric: tabular-nums; }
        .ff-prod details > summary { list-style: none; cursor: pointer; }
        .ff-prod details > summary::-webkit-details-marker { display: none; }
      `}</style>

      {printMode && (
        <script dangerouslySetInnerHTML={{ __html: "window.addEventListener('load',function(){setTimeout(function(){window.print();},300);});" }} />
      )}

      {/* Header + controls */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: C.accent, fontWeight: 700 }}>Kitchen Production · SOP</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: "6px 0 0", color: C.text }}>{dateLabel}</h1>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Cook sheet · portions, prep list &amp; step-by-step for this delivery date</div>
        </div>
        <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href={`/admin/production?date=${prev}`} style={btn(C)}>← Prev</Link>
          <Link href="/admin/production" style={btn(C, ymd(date) === tomorrowStr)}>Tomorrow</Link>
          <Link href={`/admin/production?date=${next}`} style={btn(C)}>Next →</Link>
          <form method="get" style={{ display: "inline-flex", gap: 6, marginLeft: 4 }}>
            <input type="date" name="date" defaultValue={ymd(date)} style={{ background: C.card, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13 }} />
            <button type="submit" style={btn(C)}>Go</button>
          </form>
          <Link href={`/admin/production?date=${ymd(date)}&print=1`} style={{ ...btn(C, true), marginLeft: 4 }}>🖨 Print SOP</Link>
        </div>
      </div>

      {/* Tiles */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
        {tile("Subscribers", report.headcount.total)}
        {tile("Morning", report.headcount.MORNING)}
        {tile("Evening", report.headcount.EVENING)}
        {tile("Total portions", fmt(report.totalPortions))}
        {tile("Recipes", report.lines.length)}
        {tile("Prep items", report.shoppingList.length)}
      </div>

      {/* Warnings */}
      {report.warnings.length > 0 && (
        <div style={{ background: printMode ? "#fff7ed" : "#2a1d05", border: `1px solid ${printMode ? "#fdba74" : "#7c5e10"}`, color: printMode ? "#7c2d12" : "#fbbf24", borderRadius: 10, padding: "12px 16px", marginBottom: 22, fontSize: 13 }}>
          <strong>Schedule / data gaps ({report.warnings.length}):</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
            {report.warnings.map((w) => <li key={w} style={{ marginBottom: 3 }}>{w}</li>)}
          </ul>
        </div>
      )}

      {report.lines.length === 0 ? (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "40px 24px", textAlign: "center", color: C.muted }}>
          No active deliveries scheduled for this date.
        </div>
      ) : (
        <>
          {/* Consolidated prep / shopping list */}
          {report.shoppingList.length > 0 && (
            <details open={printMode} style={{ border: `1px solid ${C.border}`, borderRadius: 12, background: C.card, marginBottom: 26, overflow: "hidden" }}>
              <summary style={{ padding: "14px 18px", fontWeight: 700, color: C.text, display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: C.accent, letterSpacing: 1, textTransform: "uppercase", fontSize: 13 }}>Prep / Shopping list</span>
                <span style={{ color: C.muted, fontSize: 12 }}>{report.shoppingList.length} ingredients · raw weight</span>
              </summary>
              <table>
                <thead>
                  <tr style={{ background: C.head, color: C.muted }}>
                    <th>Ingredient</th>
                    <th>Category</th>
                    <th className="num">Total (raw)</th>
                  </tr>
                </thead>
                <tbody>
                  {report.shoppingList.map((s) => (
                    <tr key={`${s.name}|${s.category}`} style={{ borderTop: `1px solid ${C.border}`, background: C.card }}>
                      <td style={{ fontWeight: 600, color: C.text }}>{s.name}</td>
                      <td style={{ color: C.muted }}>{s.category ?? "—"}</td>
                      <td className="num" style={{ fontWeight: 700, color: C.accent }}>{grams(s.totalGrams)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          )}

          {/* Cook sheet — per slot, per recipe expandable SOP */}
          {groups.map((g) => (
            <div key={g.slot} style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: C.accent, fontWeight: 700, marginBottom: 8 }}>{SLOT_LABEL[g.slot]}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {g.lines.map((l) => (
                  <details key={l.recipeId} open={printMode} style={{ border: `1px solid ${C.border}`, borderRadius: 12, background: C.card, overflow: "hidden" }}>
                    <summary style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>
                        {l.recipeName}
                        <span style={{ color: C.muted, fontWeight: 400, fontSize: 13 }}> · {l.cuisineType} · {l.servingSizeGrams} g · {l.caloriesPerServing} kcal</span>
                      </span>
                      <span style={{ display: "flex", gap: 14, alignItems: "baseline", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 12, color: C.muted }}>M {fmt(l.byWindow.MORNING)} · E {fmt(l.byWindow.EVENING)}</span>
                        <span style={{ fontSize: 22, fontWeight: 800, color: C.accent }}>{fmt(l.totalPortions)}<span style={{ fontSize: 12, color: C.muted, fontWeight: 400 }}> portions</span></span>
                      </span>
                    </summary>

                    <div style={{ borderTop: `1px solid ${C.border}`, padding: "4px 0" }}>
                      {/* Ingredients scaled to total portions */}
                      {l.ingredients.length > 0 ? (
                        <table>
                          <thead>
                            <tr style={{ background: C.head, color: C.muted }}>
                              <th>Ingredient</th>
                              <th className="num">Per serving</th>
                              <th className="num">× {fmt(l.totalPortions)} = total</th>
                              <th>Prep</th>
                            </tr>
                          </thead>
                          <tbody>
                            {l.ingredients.map((ing, i) => (
                              <tr key={`${l.recipeId}-${i}`} style={{ borderTop: `1px solid ${C.border}` }}>
                                <td style={{ color: C.text }}>
                                  {ing.name}{ing.isOptional ? <span style={{ color: C.muted }}> (optional)</span> : null}
                                </td>
                                <td className="num" style={{ color: C.muted }}>{grams(ing.gramsPerServing)}</td>
                                <td className="num" style={{ fontWeight: 700, color: C.accent }}>{grams(ing.totalGrams)}</td>
                                <td style={{ color: C.muted }}>{ing.prepNote ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{ padding: "12px 18px", color: C.muted, fontSize: 13 }}>No ingredients defined for this recipe.</div>
                      )}

                      {/* Cooking steps */}
                      {l.steps.length > 0 && (
                        <div style={{ padding: "14px 18px", borderTop: `1px solid ${C.border}`, background: C.soft }}>
                          <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>Method</div>
                          <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                            {l.steps.map((st) => (
                              <li key={st.stepNumber} style={{ fontSize: 13.5, lineHeight: 1.55, color: C.text }}>
                                <span style={{ fontWeight: 700 }}>{st.title}</span>
                                {st.durationMins ? <span style={{ color: C.muted, fontWeight: 400 }}> · {st.durationMins} min</span> : null}
                                {st.technique ? <span style={{ color: C.muted, fontWeight: 400 }}> · {st.technique}</span> : null}
                                <div style={{ color: C.muted, marginTop: 2 }}>{st.instruction}</div>
                                {st.kitchenNote ? <div style={{ color: C.accent, marginTop: 3, fontSize: 12.5 }}>⚑ {st.kitchenNote}</div> : null}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
        Generated {ymd(new Date())} · menu day is calendar-based from each subscriber&rsquo;s start date · totals are raw weight × portions · figures match the nightly delivery generator.
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
