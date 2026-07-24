// app/plans/PlansCatalog.tsx
// Configurator: diet → duration → meals → live 3-tier pricing → browse grid.
//
// House style per DESIGN.md: Barlow Condensed display, Archivo body, square
// corners, lime as the only chromatic accent. The header comment here used to
// say "Inter, rounded" which is no longer true of anything on the site.
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
  initialCategory?: Plan["category"];
  startTrial?: boolean;
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
// This used to hand each category its own hue: purple #c084fc for medical,
// sky #38bdf8 for sports, amber #f59e0b for corporate, plus a per-card glow
// derived from it. That is a five-colour secondary palette on the page every
// homepage CTA lands on, against DESIGN.md's "lime is the only chromatic
// value" and its "accent colour used decoratively" reject. Category is now
// carried by the label, which is what people actually read.
//
// `accentColor` from the DB is deliberately ignored rather than dropped from
// the query: the column still feeds the admin preview.
const accentFor = (_p: Plan): string => "#a3e635";

// ─── Selectable chip ─────────────────────────────────────────────────────────
function Chip({
  active, onClick, label, sub, dot,
}: { active: boolean; onClick: () => void; label: string; sub?: string; dot?: string }) {
  return (
    <button onClick={onClick}
      aria-pressed={active}
      style={{
        textAlign: "left",
        padding: "12px 16px",
        minHeight: 44,
        background: active ? "rgba(132,204,22,0.08)" : "var(--bg-card)",
        border: active ? "1px solid rgba(132,204,22,0.5)" : "1px solid var(--border)",
        borderRadius: 0,
        cursor: "pointer",
        transition: "border-color 0.2s ease, background 0.2s ease",
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
  // Was 13px Archivo semibold. Step headings are display type like every
  // other heading on the site.
  return (
    <h2 style={{ fontFamily: "var(--ff-cond)", fontSize: 15, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ff-dim)", marginBottom: 14 }}>
      {label}
    </h2>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function PlansCatalog({ plans, pricesByPlan, initialCategory, startTrial }: Props) {
  const [diet, setDiet] = useState<DietKey>("VEG");
  const [dur, setDur]   = useState<DurationKey>(startTrial ? "TRIAL_DAY" : "ONE_MONTH");
  const [meal, setMeal] = useState<MealKey>("ALL_FOUR");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"ALL" | Plan["category"]>(initialCategory ?? "ALL");

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
    <main style={{ background: "var(--bg-primary)", minHeight: "100vh", padding: "64px 20px 96px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Hero */}
        <div style={{ marginBottom: 56, textAlign: "center" }}>
          <h1 className="heading-lg" style={{ marginBottom: 14 }}>Build your plan</h1>
          <p className="body-lg" style={{ maxWidth: 540, margin: "0 auto" }}>
            {plans.length} meal plans across three tiers, delivered daily in Pune. Pick your diet, duration and meals, then choose your goal.
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
                      fontSize: 12, fontWeight: 700, color: "var(--text-dim)",
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

        {/* Browse: master/detail browser */}
        <div id="browse" className="ffb" style={{ marginBottom: 24, scrollMarginTop: 24 }}>
          <style>{`

            .ffb{ --bd:#1c1c1c; }
            .ffb-top{ display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; margin-bottom:14px; }
            .ffb-title{ font-family:var(--ff-cond); font-weight:800; font-size:30px; letter-spacing:.4px; text-transform:uppercase; color:#f4f3ee; margin:0; }
            .ffb-search{ flex:1; min-width:220px; max-width:360px; font-family:var(--ff-cond); font-size:16px; color:#f4f3ee; background:#0d0d0d; border:1px solid var(--bd); border-radius:0; padding:12px 14px; min-height:44px; outline:none; }
            .ffb-search::placeholder{ color:#85857e; }
            .ffb-cats{ display:flex; gap:7px; flex-wrap:wrap; margin-bottom:16px; }
            /* Was 7px/13px padding at radius 999px: a 34px-tall pill, under
               the 44px touch target, and a rounded chip in a square system.
               Square now, and tall enough to hit on a phone. */
            .ffb-cat-pill{ font-family:var(--ff-cond); font-size:13px; letter-spacing:.06em; padding:0 15px; min-height:44px; display:inline-flex; align-items:center; border-radius:0; cursor:pointer; border:1px solid var(--bd); background:transparent; color:#c9c9c2; transition:border-color .18s, background .18s, color .18s; }
            .ffb-cat-pill.on{ background:#a3e635; color:#0a0a0a; border-color:#a3e635; font-weight:700; }
            /* Removed a radial-gradient glow wash behind every plan card. */
            .ffb-edge{ position:absolute; top:0; left:0; right:0; height:2px; background:var(--ac); }
            .ffb-cta{ font-family:var(--ff-cond); font-size:14px; letter-spacing:.1em; text-transform:uppercase; background:var(--ac); color:#0a0a0a; font-weight:800; padding:0 22px; min-height:44px; display:inline-flex; align-items:center; border-radius:0; text-decoration:none; transition:background .2s; }
            .ffb-cta:hover{ background:#bef264; }
            .ffb-empty{ text-align:center; padding:56px 20px; border:1px solid var(--bd); border-radius:12px; color:#85857e; font-size:13px; }

            /* ── CARDS ────────────────────────────────────────────────────
               This was a 57-row text list plus ONE detail panel: you could
               see a single plan at a time, and the page every homepage CTA
               lands on showed no food, no macros and no price until you
               clicked something. A catalogue should let you compare.

               There is deliberately no photo slot. All 126 plans have
               imageUrl = null and only ~3% of recipes carry an image (the
               tracker's F4 seeding job), so a photo card would render a
               placeholder 97% of the time — worse than the list it replaced.
               The card therefore leads on the data we DO have and always
               have: calories, the macro split, the cycle and the real price
               for the currently selected duration and meal combo. */
            .ffb-sec{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin:26px 0 12px; padding-bottom:9px; border-bottom:1px solid var(--bd); }
            .ffb-sec h3{ font-family:var(--ff-cond); font-weight:800; font-size:19px; letter-spacing:.14em; text-transform:uppercase; color:#f4f3ee; margin:0; }
            .ffb-sec span{ font-family:var(--ff-cond); font-size:12.5px; letter-spacing:.13em; text-transform:uppercase; color:#85857e; }
            .ffb-cards{ display:grid; grid-template-columns:repeat(auto-fill,minmax(268px,1fr)); gap:12px; }
            .ffb-card{ position:relative; display:flex; flex-direction:column; gap:13px; padding:19px 18px 17px; border:1px solid var(--bd); background:#0b0b0a; text-decoration:none; transition:border-color .18s, background .18s; }
            .ffb-card:hover{ background:#0f0f0d; border-color:color-mix(in srgb, var(--ac) 50%, var(--bd)); }
            .ffb-card:focus-visible{ outline:2px solid var(--ac); outline-offset:2px; }
            .ffb-cname{ font-family:var(--ff-cond); font-weight:800; font-size:23px; line-height:.95; letter-spacing:.3px; text-transform:uppercase; color:#f4f3ee; margin:0; }
            .ffb-ctag{ font-size:12.5px; color:#85857e; line-height:1.55; margin:0; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
            .ffb-cnums{ display:flex; align-items:flex-end; gap:12px; }
            .ffb-ckcal{ font-family:var(--ff-cond); font-weight:800; font-size:33px; line-height:.82; color:var(--ac); }
            .ffb-ckcal i{ font-style:normal; font-family:var(--ff-cond); font-size:11.5px; letter-spacing:.13em; color:#85857e; display:block; margin-top:5px; }
            .ffb-cmac{ flex:1; min-width:0; }
            .ffb-cmacrow{ display:flex; justify-content:space-between; font-family:var(--ff-cond); font-size:11.5px; letter-spacing:.06em; color:#85857e; margin-bottom:6px; }
            .ffb-cbar{ display:flex; height:5px; overflow:hidden; background:#161616; }
            .ffb-cfoot{ display:flex; align-items:flex-end; justify-content:space-between; gap:10px; margin-top:auto; padding-top:13px; border-top:1px solid var(--bd); }
            .ffb-cprice b{ font-family:var(--ff-cond); font-weight:800; font-size:21px; color:#f4f3ee; }
            .ffb-cprice span{ font-family:var(--ff-cond); font-size:11.5px; color:#85857e; margin-left:3px; }
            .ffb-cprice small{ display:block; font-family:var(--ff-cond); font-size:11.5px; color:#85857e; margin-top:3px; }
            .ffb-cgo{ font-family:var(--ff-cond); font-weight:800; font-size:12.5px; letter-spacing:.11em; text-transform:uppercase; color:var(--ac); white-space:nowrap; }
          `}</style>

          <div className="ffb-top">
            <h2 className="ffb-title">{browsePlans.length} {dietMeta.label} Plans</h2>
            <input className="ffb-search" type="text" placeholder="Search: PCOS, cricket, keto…"
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
            <div>
              {orderedCategories.map((cat) => (
                <section key={cat}>
                  <div className="ffb-sec">
                    <h3>{CATEGORY_LABELS[cat].label}</h3>
                    <span>{grouped[cat].length} plans</span>
                  </div>
                  <div className="ffb-cards">
                    {grouped[cat].map((plan) => {
                      const ac = accentFor(plan);
                      const price = getTierPrice(pricesByPlan[plan.id] ?? [], "STANDARD", dur, meal);
                      const days = durMeta.days;
                      const meals = mealsInCombo(meal);
                      const perMeal = price !== null ? Math.round(price / Math.max(days * meals, 1)) : null;
                      const b = price !== null ? decomposePrice({ subtotalRs: price, duration: dur }) : null;
                      const P = plan.avgProteinGrams, C = plan.avgCarbsGrams, F = plan.avgFatGrams;
                      const totalCal = P * 4 + C * 4 + F * 9 || 1;
                      return (
                        <Link
                          key={plan.id}
                          href={`/plans/${plan.slug}`}
                          className="ffb-card"
                          style={cssVars({ "--ac": ac })}
                        >
                          <span className="ffb-edge" />
                          <div>
                            <h4 className="ffb-cname">{plan.displayName}</h4>
                            <p className="ffb-ctag">{plan.tagline || plan.description || `${plan.cycleLengthDays}-day cycle, cooked to your macros.`}</p>
                          </div>

                          <div className="ffb-cnums">
                            <div className="ffb-ckcal">
                              {plan.avgCaloriesPerDay.toLocaleString("en-IN")}
                              <i>KCAL / DAY</i>
                            </div>
                            <div className="ffb-cmac">
                              <div className="ffb-cmacrow"><span>P {P}g</span><span>C {C}g</span><span>F {F}g</span></div>
                              {/* Same three-part split as the detail panel, so a
                                  card and its plan page tell one story. */}
                              <div className="ffb-cbar">
                                <span style={{ width: `${(P * 4 / totalCal) * 100}%`, background: ac }} />
                                <span style={{ width: `${(C * 4 / totalCal) * 100}%`, background: "#6f6d5e" }} />
                                <span style={{ width: `${(F * 9 / totalCal) * 100}%`, background: "#3a3a35" }} />
                              </div>
                            </div>
                          </div>

                          <div className="ffb-cfoot">
                            <div className="ffb-cprice">
                              {perMeal !== null ? (
                                <><b>{fmt(perMeal)}</b><span>/ meal</span><small>{b ? fmt(b.baseRs) : ""} · {days}d · {meals} meals</small></>
                              ) : (
                                <small>Not sold in this combo</small>
                              )}
                            </div>
                            <span className="ffb-cgo">View →</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
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
              Get the full 30-day plan as a downloadable PDF: recipes, macros, grocery list.
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
                {/* #ef4444 computed to ~4.2:1 on this background, just under
                    AA. #fca5a5 clears it and still reads as an error. */}
                {wlStatus === "error" && wlErr && (
                  <p role="alert" style={{ marginTop: 10, fontSize: 13, color: "#fca5a5" }}>{wlErr}</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}