// app/plans/PlansCatalog.tsx — Phase 19A (house-style, restrained)
// Configurator: diet → duration → meals → live 3-tier pricing → browse grid.
// Uses the site's own design tokens from globals.css (Inter, rounded, lime accent).
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { decomposePrice } from "@/lib/pricing-decomposition";
import {
  TIERS,
  MEALS,
  DIETS,
  DURATIONS,
  getTierPrice,
  type Tier,
  type MealKey,
  type DietKey,
  type DurationKey,
  type PriceRow,
} from "@/lib/plan-tier-pricing";

interface Plan {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  tagline?: string | null;
  description?: string | null;
  category: "STANDARD" | "LIFESTYLE_MEDICAL" | "SPORTS" | "CORPORATE" | "DIGITAL";
  subCategory: string;
  dietaryVariant: DietKey;
  tier: "STANDARD" | "PREMIUM" | "LUXURY";
  avgCaloriesPerDay: number;
  avgProteinGrams: number;
  avgCarbsGrams: number;
  avgFatGrams: number;
  cycleLengthDays: number;
  mealsPerDay: number;
  isActive: boolean;
  imageUrl?: string | null;
  accentColor?: string | null;
}

interface Props {
  plans: Plan[];
  pricesByPlan: Record<string, PriceRow[]>;
}

const CATEGORY_LABELS: Record<Plan["category"], { label: string; desc: string }> = {
  STANDARD: { label: "Goal-based", desc: "Weight loss, muscle gain, general fitness" },
  LIFESTYLE_MEDICAL: { label: "Lifestyle & medical", desc: "PCOS, diabetes, thyroid, recovery" },
  SPORTS: { label: "Sports nutrition", desc: "Cricket, football, gym, endurance" },
  CORPORATE: { label: "Corporate", desc: "Office wellness" },
  DIGITAL: { label: "Digital", desc: "PDF-only plans" },
};

const fmt = (n: number) => "\u20B9" + n.toLocaleString("en-IN");

// ─── Browser helpers ─────────────────────────────────────────────────────────
const mealsInCombo = (meal: MealKey): number => (meal === "ALL_FOUR" ? 4 : 2);
const cssVars = (o: Record<string, string | number>) => o as unknown as CSSProperties;
const CATEGORY_ACCENT: Record<Plan["category"], string> = {
  STANDARD: "#a3e635",
  LIFESTYLE_MEDICAL: "#c084fc",
  SPORTS: "#38bdf8",
  CORPORATE: "#f59e0b",
  DIGITAL: "#9ca3af",
};
const accentFor = (p: Plan): string => p.accentColor || CATEGORY_ACCENT[p.category] || "#a3e635";
const glowOf = (c: string): string => (/^#[0-9a-fA-F]{6}$/.test(c) ? c + "22" : "rgba(163,230,53,.13)");

// ─── Selectable chip ─────────────────────────────────────────────────────────
function Chip({
  active, onClick, label, sub, dot,
}: { active: boolean; onClick: () => void; label: string; sub?: string; dot?: string }) {
  return (
    <button onClick={onClick}
      style={{
        textAlign: "left",
        padding: "12px 16px",
        background: active ? "rgba(132,204,22,0.08)" : "var(--bg-card)",
        border: active ? "1px solid rgba(132,204,22,0.5)" : "1px solid var(--border)",
        borderRadius: 12,
        cursor: "pointer",
        transition: "all 0.2s ease",
        minWidth: 0,
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-hover)"; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {dot && <span style={{ width: 7, height: 7, background: dot, borderRadius: 999, flexShrink: 0 }} />}
        <span style={{ fontSize: 15, fontWeight: 600, color: active ? "var(--lime-light)" : "var(--text-primary)" }}>
          {label}
        </span>
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 3, marginLeft: dot ? 15 : 0 }}>
          {sub}
        </div>
      )}
    </button>
  );
}

// ─── Section heading ─────────────────────────────────────────────────────────
function Step({ label }: { label: string }) {
  return (
    <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginBottom: 14, letterSpacing: "0.01em" }}>
      {label}
    </h2>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function PlansCatalog({ plans, pricesByPlan }: Props) {
  const [diet, setDiet] = useState<DietKey>("VEG");
  const [dur, setDur]   = useState<DurationKey>("ONE_MONTH");
  const [meal, setMeal] = useState<MealKey>("ALL_FOUR");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"ALL" | Plan["category"]>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [wlTier, setWlTier] = useState<Tier | null>(null);
  const [wlEmail, setWlEmail] = useState("");
  const [wlStatus, setWlStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [wlErr, setWlErr] = useState("");

  async function submitWaitlist() {
    if (!wlTier) return;
    if (!wlEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wlEmail)) {
      setWlErr("Enter a valid email"); setWlStatus("error"); return;
    }
    setWlStatus("submitting"); setWlErr("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: wlEmail, tier: wlTier }),
      });
      if (!res.ok) throw new Error("Request failed");
      setWlStatus("success");
    } catch {
      setWlErr("Could not submit. Try again."); setWlStatus("error");
    }
  }

  const browsePlans = useMemo(() => {
    return plans.filter((p) => {
      if (p.dietaryVariant !== diet) return false;
      if (activeCategory !== "ALL" && p.category !== activeCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.displayName.toLowerCase().includes(q) &&
            !p.subCategory.toLowerCase().includes(q) &&
            !(p.tagline ?? "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [plans, diet, activeCategory, search]);

  const grouped = useMemo(() => {
    const g: Record<string, Plan[]> = {};
    for (const p of browsePlans) { if (!g[p.category]) g[p.category] = []; g[p.category].push(p); }
    return g;
  }, [browsePlans]);

  const categoryOrder: Plan["category"][] = ["STANDARD", "LIFESTYLE_MEDICAL", "SPORTS", "CORPORATE", "DIGITAL"];
  const orderedCategories = categoryOrder.filter((c) => grouped[c]);

  const selected = useMemo(
    () => browsePlans.find((p) => p.id === selectedId) ?? browsePlans[0] ?? null,
    [browsePlans, selectedId],
  );

  const pricesForCombo = useMemo(() => {
    for (const p of plans) {
      if (p.dietaryVariant === diet) {
        const rows = pricesByPlan[p.id];
        if (rows && rows.length) return rows;
      }
    }
    for (const p of plans) {
      const rows = pricesByPlan[p.id];
      if (rows && rows.length) return rows;
    }
    return [];
  }, [plans, pricesByPlan, diet]);

  const dietMeta = DIETS.find((d) => d.key === diet)!;
  const durMeta  = DURATIONS.find((d) => d.key === dur)!;
  const mealMeta = MEALS.find((m) => m.key === meal)!;

  const dietCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of plans) m[p.dietaryVariant] = (m[p.dietaryVariant] ?? 0) + 1;
    return m;
  }, [plans]);

  const grid3 = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 } as const;

  return (
    <main style={{ background: "var(--bg-primary)", minHeight: "100vh", padding: "64px 20px 96px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Hero */}
        <div style={{ marginBottom: 56, textAlign: "center" }}>
          <h1 className="heading-lg" style={{ marginBottom: 14 }}>Build your plan</h1>
          <p className="body-lg" style={{ maxWidth: 540, margin: "0 auto" }}>
            {plans.length} meal plans across three tiers, delivered daily in Pune. Pick your diet, duration and meals — then choose your goal.
          </p>
        </div>

        {/* Configurator */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 16, padding: 28, marginBottom: 28,
        }}>
          <div style={{ marginBottom: 24 }}>
            <Step label="Diet" />
            <div style={grid3}>
              {DIETS.map((d) => (
                <Chip key={d.key} active={diet === d.key} onClick={() => setDiet(d.key)}
                  label={d.label} sub={`${dietCounts[d.key] ?? 0} plans`} dot={d.dot} />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <Step label="Duration" />
            <div style={grid3}>
              {DURATIONS.map((d) => (
                <Chip key={d.key} active={dur === d.key} onClick={() => setDur(d.key)}
                  label={d.label} sub={`${d.days} ${d.days === 1 ? "day" : "days"}`} />
              ))}
            </div>
          </div>

          <div>
            <Step label="Meals" />
            <div style={grid3}>
              {MEALS.map((m) => (
                <Chip key={m.key} active={meal === m.key} onClick={() => setMeal(m.key)}
                  label={m.label} sub={m.time} />
              ))}
            </div>
          </div>
        </div>

        {/* Tier pricing for current combo */}
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            {dietMeta.label} · {durMeta.label} · {mealMeta.label}
          </p>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16, marginBottom: 64,
        }}>
          {TIERS.map((tier) => {
            const price = getTierPrice(pricesForCombo, tier.key, dur, meal);
            const perDay = price !== null ? Math.round(price / durMeta.days) : null;
            const isStandard = tier.key === "STANDARD";
            return (
              <div key={tier.key} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 16, padding: 24, display: "flex", flexDirection: "column",
                position: "relative",
                ...(isStandard ? { boxShadow: "0 0 0 1px rgba(132,204,22,0.2)" } : {}),
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 8, height: 8, background: tier.accent, borderRadius: 999 }} />
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{tier.label}</h3>
                  {!tier.available && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "var(--text-dim)",
                      background: "var(--bg-elevated)", border: "1px solid var(--border-mid)",
                      padding: "3px 9px", borderRadius: 999, marginLeft: "auto",
                      letterSpacing: "0.06em", textTransform: "uppercase",
                    }}>Soon</span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 18, minHeight: 38 }}>
                  {tier.tagline}
                </p>

                <div style={{ marginBottom: 20 }}>
                  {price !== null ? (() => {
                    const b = decomposePrice({ subtotalRs: price, duration: dur });
                    return (
                      <>
                        {b.mrpRs > b.baseRs && (
                          <div style={{ fontSize: 15, color: "var(--text-dim)", textDecoration: "line-through", marginBottom: 2 }}>{fmt(b.mrpRs)}</div>
                        )}
                        <span style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)" }}>{fmt(b.baseRs)}</span>
                        <span style={{ fontSize: 13, color: "var(--text-dim)", marginLeft: 8 }}>
                          ₹{perDay?.toLocaleString("en-IN")}/day
                        </span>
                      </>
                    );
                  })() : (
                    <span style={{ fontSize: 14, color: "var(--text-dim)" }}>Unavailable for this combo</span>
                  )}
                </div>

                <div style={{ marginTop: "auto" }}>
                  {isStandard ? (
                    <a href="#browse" style={{
                      display: "block", textAlign: "center", textDecoration: "none",
                      background: "var(--lime)", color: "#000", fontWeight: 800,
                      fontSize: 13, padding: "12px 0", borderRadius: 9,
                      letterSpacing: "0.06em", textTransform: "uppercase",
                    }}>
                      Choose a plan
                    </a>
                  ) : (
                    <button onClick={() => { setWlTier(tier.key); setWlStatus("idle"); setWlEmail(""); setWlErr(""); }}
                      style={{
                        width: "100%", textAlign: "center",
                        background: "rgba(132,204,22,0.06)", color: "var(--lime-light)",
                        fontWeight: 800, fontSize: 13, padding: "12px 0", borderRadius: 9,
                        border: "1px solid rgba(132,204,22,0.28)", cursor: "pointer",
                        letterSpacing: "0.06em", textTransform: "uppercase",
                      }}>
                      Join waitlist
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Browse — master/detail browser */}
        <div id="browse" className="ffb" style={{ marginBottom: 24, scrollMarginTop: 24 }}>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Space+Mono:wght@400;700&display=swap');
            .ffb{ --bd:#1c1c1c; }
            .ffb-top{ display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; margin-bottom:14px; }
            .ffb-title{ font-family:'Barlow Condensed',sans-serif; font-weight:800; font-size:30px; letter-spacing:.4px; text-transform:uppercase; color:#f4f3ee; margin:0; }
            .ffb-search{ flex:1; min-width:220px; max-width:360px; font-family:'Space Mono',monospace; font-size:12px; color:#c9c3ac; background:#0d0d0d; border:1px solid var(--bd); border-radius:7px; padding:11px 14px; outline:none; }
            .ffb-search::placeholder{ color:#56564f; }
            .ffb-cats{ display:flex; gap:7px; flex-wrap:wrap; margin-bottom:16px; }
            .ffb-cat-pill{ font-family:'Space Mono',monospace; font-size:10.5px; letter-spacing:.06em; padding:7px 13px; border-radius:999px; cursor:pointer; border:1px solid var(--bd); background:transparent; color:#8d8d87; transition:all .18s; }
            .ffb-cat-pill.on{ background:#a3e635; color:#0a0a0a; border-color:#a3e635; font-weight:700; }
            .ffb-grid{ display:grid; grid-template-columns:270px 1fr; gap:14px; }
            @media (max-width:760px){ .ffb-grid{ grid-template-columns:1fr; } .ffb-list{ max-height:260px; } }
            .ffb-list{ border:1px solid var(--bd); border-radius:9px; padding:7px; max-height:520px; overflow:auto; }
            .ffb-listcat{ font-family:'Space Mono',monospace; font-size:9px; letter-spacing:.16em; text-transform:uppercase; color:#56564f; padding:13px 9px 5px; display:flex; justify-content:space-between; }
            .ffb-row{ display:grid; grid-template-columns:8px 1fr auto; align-items:center; gap:10px; width:100%; text-align:left; padding:9px 10px; border:0; background:transparent; border-radius:6px; cursor:pointer; transition:background .15s; }
            .ffb-row:hover{ background:#101010; }
            .ffb-row.on{ background:color-mix(in srgb, var(--ac) 12%, transparent); }
            .ffb-dot{ width:7px; height:7px; border-radius:999px; }
            .ffb-rname{ font-family:'Barlow Condensed',sans-serif; font-weight:600; font-size:16px; letter-spacing:.3px; text-transform:uppercase; color:#b9b8b0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            .ffb-row.on .ffb-rname{ color:#f4f3ee; }
            .ffb-rk{ font-family:'Space Mono',monospace; font-size:10px; color:#56564f; }
            .ffb-panel{ position:relative; border:1px solid var(--bd); border-radius:9px; padding:24px; overflow:hidden; min-height:360px; }
            .ffb-panel:before{ content:""; position:absolute; inset:0; background:radial-gradient(120% 90% at 85% 0%, var(--gl), transparent 55%); pointer-events:none; }
            .ffb-edge{ position:absolute; top:0; left:0; right:0; height:2px; background:var(--ac); }
            .ffb-pills{ display:flex; gap:7px; flex-wrap:wrap; margin-bottom:18px; position:relative; }
            .ffb-pill{ font-family:'Space Mono',monospace; font-size:9px; letter-spacing:.12em; text-transform:uppercase; padding:5px 10px; border-radius:3px; border:1px solid #262626; color:#8d8d87; }
            .ffb-pill.ac{ color:var(--ac); border-color:color-mix(in srgb, var(--ac) 35%, #262626); }
            .ffb-name{ font-family:'Barlow Condensed',sans-serif; font-weight:800; font-size:clamp(32px,5vw,46px); line-height:.9; letter-spacing:.5px; text-transform:uppercase; color:#f4f3ee; position:relative; margin:0 0 12px; }
            .ffb-who{ font-size:13px; color:#8d8d87; line-height:1.6; max-width:420px; position:relative; margin:0 0 22px; }
            .ffb-mid{ display:flex; align-items:center; gap:24px; position:relative; margin-bottom:22px; flex-wrap:wrap; }
            .ffb-ring{ position:relative; width:108px; height:108px; flex-shrink:0; }
            .ffb-ringc{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
            .ffb-ringc b{ font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:29px; color:#f4f3ee; line-height:.9; }
            .ffb-ringc i{ font-family:'Space Mono',monospace; font-style:normal; font-size:8px; letter-spacing:.13em; color:#6b6b64; margin-top:3px; }
            .ffb-mac{ flex:1; min-width:160px; }
            .ffb-macrow{ display:flex; justify-content:space-between; font-family:'Space Mono',monospace; font-size:10.5px; color:#8d8d87; margin-bottom:8px; }
            .ffb-macbar{ display:flex; height:6px; border-radius:99px; overflow:hidden; background:#161616; }
            .ffb-foot{ display:flex; align-items:center; justify-content:space-between; gap:14px; border-top:1px solid var(--bd); padding-top:18px; position:relative; flex-wrap:wrap; }
            .ffb-price b{ font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:27px; color:#f4f3ee; }
            .ffb-price span{ font-family:'Space Mono',monospace; font-size:10px; color:#6b6b64; margin-left:4px; }
            .ffb-price small{ display:block; font-family:'Space Mono',monospace; font-size:9.5px; color:#56564f; margin-top:3px; }
            .ffb-cta{ font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.1em; text-transform:uppercase; background:var(--ac); color:#0a0a0a; font-weight:700; padding:12px 20px; border-radius:5px; text-decoration:none; transition:transform .2s; }
            .ffb-cta:hover{ transform:translateX(2px); }
            .ffb-empty{ text-align:center; padding:56px 20px; border:1px solid var(--bd); border-radius:12px; color:#8d8d87; font-size:13px; }
          `}</style>

          <div className="ffb-top">
            <h2 className="ffb-title">{browsePlans.length} {dietMeta.label} Plans</h2>
            <input className="ffb-search" type="text" placeholder="Search — PCOS, cricket, keto…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="ffb-cats">
            {(["ALL", "STANDARD", "LIFESTYLE_MEDICAL", "SPORTS"] as const).map((c) => {
              const count = c === "ALL" ? browsePlans.length : browsePlans.filter((p) => p.category === c).length;
              if (c !== "ALL" && count === 0) return null;
              const label = c === "ALL" ? "All" : CATEGORY_LABELS[c].label;
              return (
                <button key={c} className={"ffb-cat-pill" + (activeCategory === c ? " on" : "")}
                  onClick={() => setActiveCategory(c)}>{label} ({count})</button>
              );
            })}
          </div>

          {browsePlans.length === 0 ? (
            <div className="ffb-empty">No {dietMeta.label.toLowerCase()} plans match. Try another diet or clear the search.</div>
          ) : (
            <div className="ffb-grid">
              {/* LEFT — scannable list */}
              <div className="ffb-list">
                {orderedCategories.map((cat) => (
                  <div key={cat}>
                    <div className="ffb-listcat"><span>{CATEGORY_LABELS[cat].label}</span><span>{grouped[cat].length}</span></div>
                    {grouped[cat].map((plan) => {
                      const ac = accentFor(plan);
                      const on = selected?.id === plan.id;
                      return (
                        <button key={plan.id} className={"ffb-row" + (on ? " on" : "")}
                          style={cssVars({ "--ac": ac })}
                          onMouseEnter={() => setSelectedId(plan.id)}
                          onClick={() => setSelectedId(plan.id)}>
                          <span className="ffb-dot" style={{ background: ac }} />
                          <span className="ffb-rname">{plan.displayName}</span>
                          <span className="ffb-rk">{plan.avgCaloriesPerDay}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* RIGHT — live spec panel */}
              {selected && (() => {
                const ac = accentFor(selected);
                const price = getTierPrice(pricesByPlan[selected.id] ?? [], "STANDARD", dur, meal);
                const days = durMeta.days;
                const meals = mealsInCombo(meal);
                const b = price !== null ? decomposePrice({ subtotalRs: price, duration: dur }) : null;
                const perMeal = price !== null ? Math.round(price / Math.max(days * meals, 1)) : null;
                const P = selected.avgProteinGrams, C = selected.avgCarbsGrams, F = selected.avgFatGrams;
                const totalCal = P * 4 + C * 4 + F * 9 || 1;
                const circ = 2 * Math.PI * 46;
                return (
                  <div className="ffb-panel" style={cssVars({ "--ac": ac, "--gl": glowOf(ac) })}>
                    <span className="ffb-edge" />
                    <div className="ffb-pills">
                      <span className="ffb-pill ac">Standard</span>
                      <span className="ffb-pill">{dietMeta.label}</span>
                      <span className="ffb-pill">{selected.cycleLengthDays}-day cycle</span>
                    </div>
                    <h3 className="ffb-name">{selected.displayName}</h3>
                    <p className="ffb-who">{selected.description || selected.tagline || ""}</p>
                    <div className="ffb-mid">
                      <div className="ffb-ring">
                        <svg width="108" height="108" viewBox="0 0 108 108">
                          <circle cx="54" cy="54" r="46" fill="none" stroke="#1a1a1a" strokeWidth="6" />
                          <circle cx="54" cy="54" r="46" fill="none" stroke={ac} strokeWidth="6" strokeLinecap="round"
                            strokeDasharray={circ} strokeDashoffset={circ * 0.22} transform="rotate(-90 54 54)" />
                        </svg>
                        <div className="ffb-ringc"><b>{selected.avgCaloriesPerDay.toLocaleString("en-IN")}</b><i>KCAL / DAY</i></div>
                      </div>
                      <div className="ffb-mac">
                        <div className="ffb-macrow"><span>P {P}g</span><span>C {C}g</span><span>F {F}g</span></div>
                        <div className="ffb-macbar">
                          <span style={{ width: `${(P * 4 / totalCal) * 100}%`, background: ac }} />
                          <span style={{ width: `${(C * 4 / totalCal) * 100}%`, background: "#6f6d5e" }} />
                          <span style={{ width: `${(F * 9 / totalCal) * 100}%`, background: "#3a3a35" }} />
                        </div>
                      </div>
                    </div>
                    <div className="ffb-foot">
                      <div className="ffb-price">
                        {perMeal !== null ? (
                          <><b>{fmt(perMeal)}</b><span>/ meal</span><small>{b ? fmt(b.baseRs) : ""} · {days}d · {meals} meals</small></>
                        ) : <b>—</b>}
                      </div>
                      <Link href={`/plans/${selected.slug}`} className="ffb-cta">Start plan →</Link>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Digital link */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14,
          padding: "20px 24px", marginTop: 32, display: "flex",
          alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
              Outside Pune?
            </h3>
            <p className="body-sm" style={{ margin: 0 }}>
              Get the full 30-day plan as a downloadable PDF — recipes, macros, grocery list.
            </p>
          </div>
          <Link href="/plans/digital" className="btn-secondary" style={{ textDecoration: "none" }}>
            Digital plans →
          </Link>
        </div>
      </div>

      {/* Waitlist modal */}
      {wlTier && (
        <div onClick={() => setWlTier(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 20,
          }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 440, width: "100%", background: "var(--bg-card)",
              border: "1px solid var(--border-mid)", borderRadius: 20, padding: 28, position: "relative",
            }}>
            <button onClick={() => setWlTier(null)}
              style={{
                position: "absolute", top: 16, right: 18, background: "none", border: "none",
                color: "var(--text-dim)", cursor: "pointer", fontSize: 22, lineHeight: 1,
              }} aria-label="Close">×</button>

            {wlStatus === "success" ? (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                  You&apos;re on the list
                </h3>
                <p className="body-sm" style={{ marginBottom: 24 }}>
                  We&apos;ll email {wlEmail} the moment {wlTier === "PREMIUM" ? "Premium" : "Luxury"} launches.
                </p>
                <button onClick={() => setWlTier(null)}
                  style={{ fontSize: 13, color: "var(--lime-light)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 8, height: 8, background: TIERS.find((t) => t.key === wlTier)!.accent, borderRadius: 999 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {wlTier} tier
                  </span>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                  Join the waitlist
                </h3>
                <p className="body-sm" style={{ marginBottom: 22 }}>
                  {TIERS.find((t) => t.key === wlTier)!.tagline} One email when it launches, no spam.
                </p>
                <input type="email" placeholder="your@email.com" value={wlEmail}
                  onChange={(e) => setWlEmail(e.target.value)} disabled={wlStatus === "submitting"}
                  style={{
                    width: "100%", padding: "12px 14px", background: "var(--bg-elevated)",
                    border: "1px solid var(--border-mid)", borderRadius: 10,
                    color: "var(--text-primary)", fontSize: 14, outline: "none",
                    marginBottom: 12, boxSizing: "border-box",
                  }} />
                <button onClick={submitWaitlist} disabled={wlStatus === "submitting"}
                  style={{
                    width: "100%", background: "var(--lime)", color: "#000",
                    fontWeight: 800, fontSize: 13, padding: "12px 0", borderRadius: 10,
                    border: "none", cursor: wlStatus === "submitting" ? "wait" : "pointer",
                    letterSpacing: "0.07em", textTransform: "uppercase",
                    opacity: wlStatus === "submitting" ? 0.7 : 1,
                  }}>
                  {wlStatus === "submitting" ? "…" : "Notify me"}
                </button>
                {wlStatus === "error" && wlErr && (
                  <p style={{ marginTop: 10, fontSize: 12, color: "#ef4444" }}>{wlErr}</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}