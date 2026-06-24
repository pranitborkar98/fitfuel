// app/plans/PlansCatalog.tsx
// Configurator: diet → duration → meals → live 3-tier pricing → browse grid.
// Uses the site's own design tokens from globals.css (Inter, rounded, lime accent).
"use client";

import { useMemo, useState } from "react";
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

// ─── Plan card (redesigned — per-meal hero) ────────────────────
function mealsInCombo(meal: MealKey): number {
  return meal === "ALL_FOUR" ? 4 : 2;
}

function PlanCard({
  plan, prices, dur, meal,
}: { plan: Plan; prices: PriceRow[]; dur: DurationKey; meal: MealKey }) {
  const price = getTierPrice(prices, "STANDARD", dur, meal);
  const diet  = DIETS.find((d) => d.key === plan.dietaryVariant);
  const days  = DURATIONS.find((d) => d.key === dur)?.days ?? 30;
  const meals = mealsInCombo(meal);
  const accent = plan.accentColor || "#a3e635";
  const b = price !== null ? decomposePrice({ subtotalRs: price, duration: dur }) : null;
  const perMeal = price !== null ? Math.round(price / Math.max(days * meals, 1)) : null;

  return (
    <Link href={`/plans/${plan.slug}`} className="ff-card" style={{ ["--accent" as never]: accent } as React.CSSProperties}>
      <span className="ff-card-edge" />

      <div className="ff-spec">
        {diet && <span className="ff-dot" style={{ background: diet.dot }} />}
        <span>{diet?.short}</span><i>·</i>
        <span>{plan.avgCaloriesPerDay} kcal</span><i>·</i>
        <span>{plan.avgProteinGrams}g protein</span>
      </div>

      <h3 className="ff-card-title">{plan.displayName}</h3>
      {plan.tagline && <p className="ff-card-tag">{plan.tagline}</p>}

      <div className="ff-card-foot">
        <div>
          {perMeal !== null ? (
            <>
              <div className="ff-permeal">
                <span className="ff-permeal-num cond">{fmt(perMeal)}</span>
                <span className="ff-permeal-unit">/ meal</span>
              </div>
              <div className="ff-card-sub">
                <span>{fmt(b!.baseRs)} · {days}d · {meals} meals</span>
                {b!.mrpRs > b!.baseRs && <span className="ff-strike">{fmt(b!.mrpRs)}</span>}
              </div>
            </>
          ) : (
            <span className="ff-permeal-num cond">—</span>
          )}
        </div>
        <span className="ff-card-go">→</span>
      </div>
    </Link>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function PlansCatalog({ plans, pricesByPlan }: Props) {
  const [diet, setDiet] = useState<DietKey>("VEG");
  const [dur, setDur]   = useState<DurationKey>("ONE_MONTH");
  const [meal, setMeal] = useState<MealKey>("ALL_FOUR");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"ALL" | Plan["category"]>("ALL");

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
    <main className="ff-cat" style={{ background: "var(--bg-primary)", minHeight: "100vh", padding: "64px 20px 96px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        .ff-cat .cond{ font-family:'Barlow Condensed',sans-serif; }
        .ff-cat .ff-spec{ font-family:'Space Mono',monospace; }
        .ff-card{
          position:relative; display:flex; flex-direction:column; min-height:190px;
          background:var(--bg-card); border:1px solid var(--border); border-radius:6px;
          padding:18px 18px 15px; text-decoration:none; color:inherit; overflow:hidden;
          transition:transform .28s cubic-bezier(.16,1,.3,1), border-color .25s, background .25s;
        }
        .ff-card:hover{ transform:translateY(-3px); border-color:var(--accent); background:var(--bg-card-hover); }
        .ff-card-edge{ position:absolute; top:0; left:0; right:0; height:2px; background:var(--accent); opacity:0; transition:opacity .25s; }
        .ff-card:hover .ff-card-edge{ opacity:.95; }
        .ff-spec{ display:flex; align-items:center; gap:7px; font-size:10px; letter-spacing:.09em; text-transform:uppercase; color:var(--text-dim); margin-bottom:13px; }
        .ff-spec i{ color:var(--text-faint); font-style:normal; }
        .ff-dot{ width:6px; height:6px; border-radius:999px; flex-shrink:0; }
        .ff-card-title{ font-size:19px; font-weight:700; letter-spacing:-.01em; color:var(--text-primary); line-height:1.18; margin-bottom:6px; }
        .ff-card-tag{ font-size:12.5px; color:var(--text-muted); line-height:1.5; margin-bottom:16px; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden; flex-grow:1; }
        .ff-card-foot{ display:flex; align-items:flex-end; justify-content:space-between; gap:10px; border-top:1px solid var(--border); padding-top:13px; margin-top:auto; }
        .ff-permeal{ display:flex; align-items:baseline; gap:5px; }
        .ff-permeal-num{ font-size:33px; font-weight:700; line-height:.85; color:var(--text-primary); letter-spacing:.3px; }
        .ff-permeal-unit{ font-size:12px; color:var(--lime-light); font-weight:600; }
        .ff-card-sub{ display:flex; align-items:baseline; gap:8px; margin-top:6px; font-size:11px; color:var(--text-dim); }
        .ff-strike{ text-decoration:line-through; color:var(--text-faint); }
        .ff-card-go{ font-size:18px; color:var(--text-faint); transition:color .25s, transform .25s; }
        .ff-card:hover .ff-card-go{ color:var(--accent); transform:translateX(3px); }
      `}</style>
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
            const perMealT = price !== null ? Math.round(price / durMeta.days / mealsInCombo(meal)) : null;
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
                          ₹{perDay?.toLocaleString("en-IN")}/day · <span style={{ color: "var(--lime-light)" }}>₹{perMealT?.toLocaleString("en-IN")}/meal</span>
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

        {/* Browse */}
        <div id="browse" style={{ marginBottom: 24, scrollMarginTop: 24 }}>
          <h2 className="heading-md" style={{ marginBottom: 8 }}>
            {browsePlans.length} {dietMeta.label.toLowerCase()} plan{browsePlans.length === 1 ? "" : "s"}
          </h2>
          <p className="body-sm" style={{ marginBottom: 20 }}>
            Prices shown for {durMeta.label} · {mealMeta.label} · Standard. Open any plan for the full tier breakdown.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
            <input type="text" placeholder="Search goals — PCOS, cricket, postnatal…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: "1 1 260px", padding: "11px 14px", background: "var(--bg-card)",
                border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-primary)",
                fontSize: 14, outline: "none",
              }} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["ALL", "STANDARD", "LIFESTYLE_MEDICAL", "SPORTS"] as const).map((c) => {
              const count = c === "ALL" ? browsePlans.length : browsePlans.filter((p) => p.category === c).length;
              if (c !== "ALL" && count === 0) return null;
              const label = c === "ALL" ? "All" : CATEGORY_LABELS[c].label;
              const active = activeCategory === c;
              return (
                <button key={c} onClick={() => setActiveCategory(c)}
                  style={{
                    padding: "7px 14px", fontSize: 13, fontWeight: 600,
                    background: active ? "var(--lime)" : "transparent",
                    color: active ? "#000" : "var(--text-muted)",
                    border: active ? "1px solid var(--lime)" : "1px solid var(--border)",
                    borderRadius: 999, cursor: "pointer", transition: "all 0.2s ease",
                  }}>
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {browsePlans.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "56px 20px",
            background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14,
          }}>
            <p className="body-sm">No {dietMeta.label.toLowerCase()} plans match. Try another diet or clear the search.</p>
          </div>
        ) : (
          <div style={{ marginTop: 28 }}>
            {orderedCategories.map((cat) => (
              <div key={cat} style={{ marginBottom: 40 }}>
                <div style={{ marginBottom: 16 }}>
                  <h3 className="heading-sm">{CATEGORY_LABELS[cat].label}</h3>
                  <p className="body-sm">{CATEGORY_LABELS[cat].desc}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
                  {grouped[cat].map((plan) => (
                    <PlanCard key={plan.id} plan={plan}
                      prices={pricesByPlan[plan.id] ?? []} dur={dur} meal={meal} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

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