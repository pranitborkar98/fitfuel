"use client";

// app/_hp/v2/Sections.tsx
//
// The rest of design/FitFuel Homepage v2.dc.html: the finder, the price
// builder, the day as a rotating drum, the coach console, the four checks, the
// coverage map, the nine products, the FAQ panel, the footer and the AI dock.
//
// Split out of Home.tsx only so neither file is unreadable. Everything here is
// presentational and takes its state by prop; Home owns the state, exactly as
// the prototype's single component does.

import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from "react";
import Link from "next/link";

import s from "./home.module.css";
import { EngineChart } from "./graphics";
import {
  ACTS, AI_JOBS, COACH_STRIP, DAY_STEPS, DAY_LABELS, DIARY_ROWS, DIETS, DROP_ROWS,
  FAQ_CATS, FAQ_LABEL, FEEDS, FOOD, FOOTER_COLS, INVOICE_ROWS, LEGAL, LOGOS, LOG_ROWS,
  MATHS, MENU_PEEK, METRIC_CELLS, PARTNER_TYPES, PLACE, PROMPTS, RECAP_BARS, REGIONS,
  SHELF, SUPP_GRADES, TDEE_ROWS, TRAIN_BARS, TRAIN_ROWS, WEIGH_INS, WEIGH_ROWS,
  decompose, money, type Door, type Faq,
} from "./data";

export const c = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).map((n) => s[n as string] ?? "").join(" ");

const MONO = "var(--font-mono), monospace";
const COND = "var(--fk-display), Georgia, serif";
const SANS = "var(--font-archivo), sans-serif";

type Wrap = CSSProperties;
type H2 = (max: string) => CSSProperties;

/** The typographic stand-in an <image-slot> renders while no file exists. */
export function ImageSlot({ placeholder }: { placeholder: string }) {
  return (
    <span className={c("v2-slot")} aria-hidden="true">
      {placeholder}
    </span>
  );
}

/* Both helpers CLAMP rather than trust their caller.
   `size` is passed as a literal at ~90 call sites, many of them 9–11.5px, which
   is below the project's stated 12px legibility floor — unreadable on the
   mid-range Android phones these customers order from. Clamping here fixes all
   of them at once and stops the next call site reintroducing it.
   `weight` is clamped for a different reason: Newsreader ships 400/500/600 in
   this project, so a 900 default made every heading a synthesised fake-bold. */
const mono = (size: number, ls = "0.06em", color = "var(--fk-ink-3)"): CSSProperties => ({
  fontFamily: SANS, fontSize: Math.max(size, 12), letterSpacing: ls, textTransform: "none", color,
});
const cond = (size: string, weight = 600, color = "var(--fk-ink)"): CSSProperties => ({
  fontFamily: COND, fontWeight: Math.min(weight, 600), fontSize: size, lineHeight: 1.06,
  letterSpacing: "-0.02em", textTransform: "none", color, margin: 0,
});
/** The one-line section sub-head: a label and a hairline under it. */
const sub = (): CSSProperties => ({
  display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 14, flexWrap: "wrap",
  paddingBottom: 12, borderBottom: "1px solid var(--fk-line)", ...mono(11), color: "var(--fk-ink-3)",
});

/* ══════════════════════════════════════════════════════════ FINDER ══ */
export function FinderSection({
  doors, door, setDoor, plan, activeDoor, sex, setSex, wt, setWt, ht, setHt, age, setAge,
  act, setAct, diet, setDiet, wrap, rule, h2, deck,
}: {
  doors: Door[]; door: number; setDoor: (n: number) => void;
  plan: {
    accent: string; name: string; matches: number; target: string; rate: string;
    macros: { name: string; v: string; color: string; pct: number; g: number }[];
    ledger: { k: string; v: string; fg: string; vfg: string }[];
    meals: { name: string; share: number; kcal: number; bg: string; fg: string }[];
  };
  activeDoor: Door;
  sex: string; setSex: (v: string) => void;
  wt: number; setWt: (n: number) => void; ht: number; setHt: (n: number) => void;
  age: number; setAge: (n: number) => void;
  act: number; setAct: (n: number) => void; diet: number; setDiet: (n: number) => void;
  wrap: Wrap; rule: CSSProperties; h2: H2; deck: CSSProperties;
}) {
  const dials: [string, string, number, (n: number) => void, string, number, number][] = [
    ["v2-wt", "Weight", wt, setWt, wt + " kg", 40, 150],
    ["v2-ht", "Height", ht, setHt, ht + " cm", 140, 205],
    ["v2-age", "Age", age, setAge, age + " yrs", 16, 75],
  ];

  return (
    <section id="v2-finder" aria-labelledby="v2-finder-h" style={{ padding: "clamp(48px,6.5vw,90px) 0" }}>
      <div style={wrap}>
        <div aria-hidden="true" style={rule} />
        <div className={c("v2-rise")}>
          <h2 id="v2-finder-h" style={h2("16ch")}>126 plans is useless until you know which are yours</h2>
        </div>
        <p className={c("v2-rise")} style={{ ...deck, margin: "clamp(18px,2.4vw,26px) 0 0", maxWidth: "60ch" }}>
          Pick a goal, set your numbers, and watch the target it produces. This is the same arithmetic the plan builder runs: Mifflin St Jeor for the resting figure, your activity multiplier, then the goal adjustment, held above the 1,200 kcal floor.
        </p>

        <div role="radiogroup" aria-label="Your goal" style={{ marginTop: "clamp(28px,3.6vw,46px)", borderTop: "1px solid var(--fk-line)" }}>
          {doors.map((d, i) => {
            const on = i === door;
            return (
              <button key={d.goal} type="button" role="radio" aria-checked={on} onClick={() => setDoor(i)} className={c("v2-row", "v2-dir-row")}
                style={{ width: "100%", display: "grid", gridTemplateColumns: "52px minmax(0,0.9fr) minmax(0,1.5fr) 120px auto", gap: "clamp(12px,2vw,26px)", alignItems: "center", textAlign: "left", cursor: "pointer", background: on ? "var(--fk-warm)" : "var(--fk-paper)", border: 0, borderBottom: "1px solid var(--fk-line)", borderLeft: `2px solid ${on ? d.accent : "transparent"}`, padding: "clamp(18px,2vw,24px) clamp(14px,1.6vw,20px)", minHeight: 68 }}>
                <span className={c("v2-num")} style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0.1em", color: "var(--fk-ink-3)" }}>{String(i + 1).padStart(2, "0")}</span>
                <h3 style={{ ...cond("clamp(1.25rem,2.1vw,1.7rem)", 800, d.accent) }}>{d.goal}</h3>
                <p className={c("v2-hide-sm")} style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.5, color: "var(--fk-ink-2)", margin: 0 }}>{d.who}</p>
                <span aria-hidden="true" className={c("v2-mini")} style={{ display: "flex", height: 6, gap: 1, background: "var(--fk-warm)" }}>
                  {d.split.map(([n, , pct, color]) => (
                    <span key={n} style={{ width: `${pct}%`, background: on ? color : "var(--fk-line-2)" }} />
                  ))}
                </span>
                <span className={c("v2-num")} style={{ textAlign: "right", ...mono(11, "0.16em", d.accent), whiteSpace: "nowrap" }}>{d.count} plans {on ? "◂" : "→"}</span>
              </button>
            );
          })}
        </div>

        <div className={c("v2-split")} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,0.95fr)", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)", borderTop: 0 }}>
          <div style={{ background: "var(--fk-warm)", padding: "clamp(22px,3vw,38px)", display: "flex", flexDirection: "column", gap: "clamp(20px,2.6vw,30px)" }}>
            <div>
              <span style={mono(10.5, "0.2em")}>Your numbers</span>
              <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: "var(--fk-ink)", margin: "12px 0 0", maxWidth: "52ch" }}>{activeDoor.what}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={mono(10, "0.18em")}>Sex, for the resting figure</span>
              <div role="radiogroup" aria-label="Sex" style={{ display: "flex", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)" }}>
                {[["m", "Male"], ["f", "Female"]].map(([v, l]) => (
                  <button key={v} type="button" role="radio" aria-checked={sex === v} onClick={() => setSex(v!)} className={c("v2-seg")}
                    style={{ flex: 1, cursor: "pointer", border: 0, padding: "13px 10px", minHeight: 46, background: sex === v ? "var(--fk-ink)" : "var(--fk-paper)", color: sex === v ? "var(--fk-paper)" : "var(--fk-ink-2)", fontFamily: COND, fontWeight: 600, fontSize: 14, letterSpacing: "0", textTransform: "none" }}>{l}</button>
                ))}
              </div>
            </div>

            {dials.map(([id, label, value, set, shown, min, max]) => (
              <div key={id}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                  <label htmlFor={id} style={mono(10, "0.18em")}>{label}</label>
                  <b className={c("v2-num")} style={{ ...cond("clamp(1.3rem,2.2vw,1.9rem)"), letterSpacing: "-0.03em" }}>{shown}</b>
                </div>
                <input className={c("v2-range")} type="range" id={id} min={min} max={max} step={1} value={value} aria-valuetext={shown} onChange={(e) => set(Number(e.currentTarget.value))} />
                {/* The slider's min/max. These were set in a line colour, which
                    on the dark ground was a faint grey and on paper is 1.33:1 —
                    a number nobody can read is not a number. Ink-3 is 6.76:1. */}
                <div className={c("v2-num")} style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 12, letterSpacing: "0", color: "var(--fk-ink-3)" }}>
                  <span>{min}</span><span>{max}</span>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={mono(10, "0.18em")}>How your week actually moves</span>
              <div role="radiogroup" aria-label="Activity" style={{ display: "flex", flexWrap: "wrap", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)" }}>
                {ACTS.map(([l], i) => (
                  <button key={l} type="button" role="radio" aria-checked={act === i} onClick={() => setAct(i)} className={c("v2-seg")}
                    style={{ flex: "1 1 auto", minWidth: 104, cursor: "pointer", border: 0, padding: "12px 8px", minHeight: 46, background: act === i ? "var(--fk-green)" : "var(--fk-paper)", ...mono(10.5, "0.12em"), color: act === i ? "var(--fk-paper)" : "var(--fk-ink-2)" }}>{l}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={mono(10, "0.18em")}>Diet, as the plans are named</span>
              <div role="radiogroup" aria-label="Diet" style={{ display: "flex", flexWrap: "wrap", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)" }}>
                {DIETS.map((l, i) => (
                  <button key={l} type="button" role="radio" aria-checked={diet === i} onClick={() => setDiet(i)} className={c("v2-seg")}
                    style={{ flex: "1 1 auto", minWidth: 92, cursor: "pointer", border: 0, padding: "12px 8px", minHeight: 46, background: diet === i ? "var(--fk-ink)" : "var(--fk-paper)", ...mono(10.5, "0.12em"), color: diet === i ? "var(--fk-paper)" : "var(--fk-ink-2)" }}>{l}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: "var(--fk-paper)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "clamp(22px,3vw,38px) clamp(22px,3vw,38px) clamp(16px,2vw,22px)", borderBottom: "1px solid var(--fk-line)" }}>
              <span style={mono(10.5, "0.2em")}>Your target, computed live</span>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "clamp(14px,2vw,24px)", marginTop: 14, flexWrap: "wrap" }}>
                <b className={c("v2-num")} style={{ ...cond("clamp(3.4rem,8vw,6rem)", 900, plan.accent), lineHeight: 1.06, letterSpacing: "-0.04em" }}>{plan.target}</b>
                <span style={{ ...mono(11, "0.16em"), paddingBottom: 8 }}>kcal per day<br />{plan.rate}</span>
              </div>
              <div className={c("v2-num")} style={{ display: "flex", flexWrap: "wrap", gap: "clamp(12px,2vw,22px)", marginTop: 16 }}>
                {plan.macros.map((m) => (
                  <span key={m.name} style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 76 }}>
                    <b style={{ ...cond("clamp(1.2rem,2vw,1.7rem)", 900, m.color) }}>{m.g}g</b>
                    <span style={mono(9.5, "0.16em")}>{m.name} · {m.v}</span>
                    <span aria-hidden="true" style={{ height: 4, background: "var(--fk-warm)" }}>
                      <span className={c("v2-bar")} style={{ display: "block", height: "100%", width: `${m.pct}%`, background: m.color }} />
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {plan.ledger.map((l) => (
                <li key={l.k} className={c("v2-row")} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 14, alignItems: "baseline", padding: "13px clamp(22px,3vw,38px)", borderBottom: "1px solid var(--fk-line)", borderLeft: "2px solid transparent" }}>
                  <span style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.5, color: l.fg }}>{l.k}</span>
                  <b className={c("v2-num")} style={{ fontFamily: SANS, fontSize: 13, color: l.vfg, whiteSpace: "nowrap" }}>{l.v}</b>
                </li>
              ))}
            </ol>

            <div style={{ padding: "clamp(20px,2.6vw,30px) clamp(22px,3vw,38px)", display: "flex", flexDirection: "column", gap: 14 }}>
              <span style={mono(10.5, "0.2em")}>The four meals it is spent on</span>
              <div style={{ display: "flex", gap: 1, height: 34, background: "var(--fk-line)" }}>
                {plan.meals.map((m) => (
                  <span key={m.name} title={m.name} style={{ flexGrow: m.share, display: "flex", alignItems: "center", justifyContent: "center", background: m.bg, fontFamily: SANS, fontSize: 12, letterSpacing: "0", color: m.fg, overflow: "hidden", whiteSpace: "nowrap" }}>{m.kcal}</span>
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {activeDoor.tags.map((t) => (
                  <span key={t} style={{ ...mono(10.5, "0.12em", "var(--fk-ink-2)"), border: "1px solid var(--fk-line-2)", padding: "8px 12px" }}>{t}</span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 6 }}>
                <Link href={activeDoor.href} className={c("v2-btn")} style={{ display: "inline-flex", alignItems: "center", background: "var(--fk-green)", color: "var(--fk-paper)", fontFamily: COND, fontWeight: 600, fontSize: 15, letterSpacing: "0", textTransform: "none", padding: "15px 26px", minHeight: 50, border: "1px solid var(--fk-green)" }}><span>Price {plan.name}</span></Link>
                <span style={mono(10.5, "0.14em", "var(--fk-ink-3)")}>{plan.matches} plans match</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════ PRICE ══ */
export function PriceSection({
  durations, dur, setDur, p, dName, dCount, dBlurb, coupons, wrap, rule, h2, deck,
}: {
  durations: [string, number, number, string][]; dur: number; setDur: (n: number) => void;
  p: ReturnType<typeof decompose>; dName: string; dCount: number; dBlurb: string;
  coupons: { code: string; headline: string; terms: string }[];
  wrap: Wrap; rule: CSSProperties; h2: H2; deck: CSSProperties;
}) {
  const rows: [string, number, boolean][] = [
    ["The food", p.base, false], ["Delivery, to your door by 08:00", p.delivery, false],
    ["Sealed compartment packaging", p.packaging, false], ["Subtotal", p.subtotal, false],
    ["GST at 5%", p.gst, false], ["Total collected", p.total, true],
  ];
  return (
    <section id="v2-price" aria-labelledby="v2-price-h" style={{ padding: "clamp(80px,11vw,160px) 0", background: "var(--fk-surface)", borderTop: "1px solid var(--fk-line)" }}>
      <div style={wrap}>
        <div aria-hidden="true" style={rule} />
        <div className={c("v2-split")} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)", gap: "clamp(24px,4vw,56px)", alignItems: "end" }}>
          <div className={c("v2-rise")}><h2 id="v2-price-h" style={h2("13ch")}>Build the receipt before you pay</h2></div>
          <p className={c("v2-rise")} style={deck}>Delivery and packaging are named, not buried. GST is stated at 5% instead of appearing on the last screen. Pick a duration: this is the same arithmetic checkout runs.</p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)", marginTop: "clamp(30px,4vw,52px)" }}>
          {durations.map(([label], i) => (
            <button key={label} type="button" onClick={() => setDur(i)} aria-pressed={i === dur} className={c("v2-chip")}
              style={{ flex: "1 1 auto", minWidth: 120, cursor: "pointer", border: 0, padding: "15px 14px", background: i === dur ? "var(--fk-green)" : "var(--fk-paper)", color: i === dur ? "var(--fk-paper)" : "var(--fk-ink-2)", fontFamily: COND, fontWeight: 600, fontSize: 15, letterSpacing: "0", textTransform: "none", minHeight: 52 }}>{label}</button>
          ))}
        </div>

        <div className={c("v2-split")} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)", borderTop: 0 }}>
          <div style={{ background: "var(--fk-paper)", padding: "clamp(24px,3.2vw,42px)" }}>
            <span style={mono(10.5, "0.2em")}>{dName} · {dCount === 1 ? "1 delivery" : dCount + " deliveries"}</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
              <s style={{ fontFamily: SANS, fontSize: "clamp(1.1rem,2vw,1.6rem)", color: "var(--fk-ink-3)", textDecorationThickness: 1 }}>{money(p.mrp)}</s>
              <span style={{ ...cond("clamp(3rem,7vw,5.4rem)"), lineHeight: 1.06, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>{money(p.base)}</span>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: "var(--fk-ink-2)", margin: "16px 0 0", maxWidth: "46ch" }}>{dBlurb}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 22, paddingTop: 20, borderTop: "1px solid var(--fk-line)" }}>
              <span style={{ ...cond("clamp(1.6rem,3vw,2.4rem)"), letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{money(Math.round(p.total / dCount))}</span>
              <span style={mono(11, "0.14em")}>per day, all in, four meals</span>
            </div>
            <Link href="/plans" className={c("v2-btn")} style={{ display: "inline-flex", alignItems: "center", marginTop: 26, background: "var(--fk-green)", color: "var(--fk-paper)", fontFamily: COND, fontWeight: 600, fontSize: 16, letterSpacing: "0", textTransform: "none", padding: "16px 28px", minHeight: 52, border: "1px solid var(--fk-green)" }}><span>Order · {money(p.total)}</span></Link>
          </div>

          <div style={{ background: "var(--fk-warm)", padding: "clamp(24px,3.2vw,42px)" }}>
            <span style={mono(10.5, "0.2em")}>What you actually pay</span>
            <div style={{ marginTop: 18, border: "1px solid var(--fk-line)" }}>
              {rows.map(([k, v, strong]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 20, padding: "14px clamp(14px,2vw,20px)", borderBottom: "1px solid var(--fk-line)", fontFamily: SANS, fontSize: 14.5, color: strong ? "var(--fk-ink)" : "var(--fk-ink-2)", background: strong ? "var(--fk-surface)" : "transparent" }}>
                  <span style={{ fontWeight: strong ? 700 : 400 }}>{k}</span>
                  <span style={{ fontFamily: MONO, color: "var(--fk-ink)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", fontWeight: strong ? 700 : 400 }}>{money(v)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)", marginTop: 20 }}>
              {coupons.map((cp) => (
                <div key={cp.code} style={{ flex: "1 1 auto", minWidth: 150, background: "var(--fk-paper)", padding: "14px 16px" }}>
                  <span style={{ display: "block", fontFamily: SANS, fontWeight: 700, fontSize: 15, letterSpacing: "0", color: "var(--fk-green)" }}>{cp.code}</span>
                  <span style={{ display: "block", fontFamily: SANS, fontSize: 12.5, lineHeight: 1.5, color: "var(--fk-ink-3)", marginTop: 6 }}>{cp.headline} · {cp.terms}</span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.6, color: "var(--fk-ink-3)", margin: "18px 0 0" }}>Cards, UPI and net banking clear through PayU; cash on delivery is handled by us. Codes are live in the database right now, with the terms checkout applies.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════ FILM ══ */
export function FilmSection({
  hour, setHour, stageRef, wrap, rule, deck,
}: {
  hour: number; setHour: Dispatch<SetStateAction<number>>;
  stageRef: React.RefObject<HTMLDivElement | null>;
  wrap: Wrap; rule: CSSProperties; deck: CSSProperties;
}) {
  const photo = (src: string, alt: string) => (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.08)" }} />
      <span aria-hidden="true" style={{ position: "absolute", inset: 0, background: "var(--fk-green)", mixBlendMode: "color", opacity: 0.5 }} />
      <span aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(7,7,7,0.15),rgba(7,7,7,0.96) 64%)" }} />
    </>
  );
  const hourMark = (t: string, colour = "var(--fk-ink)") => (
    <span style={{ position: "absolute", top: 0, left: 0, padding: 20, fontFamily: COND, fontWeight: 600, fontSize: 52, lineHeight: 1, letterSpacing: "-0.03em", color: colour }}>{t}</span>
  );
  const cap = (title: string, body: string, bodyColour = "var(--fk-ink-2)") => (
    <figcaption style={{ position: "absolute", inset: "auto 0 0 0", padding: 22 }}>
      <b style={{ display: "block", ...cond("26px"), letterSpacing: "-0.02em" }}>{title}</b>
      <p style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.55, color: bodyColour, margin: "10px 0 0" }}>{body}</p>
    </figcaption>
  );
  const face = (i: number, children: ReactNode) => (
    <figure key={i} style={{ transform: `rotateY(${(i * 51.4286).toFixed(2)}deg) translateZ(370px)` }} className={c("v2-face")}>{children}</figure>
  );

  return (
    <section aria-labelledby="v2-film-h">
      <div style={{ ...wrap, padding: "clamp(56px,8vw,110px) clamp(18px,4vw,40px) clamp(26px,3.4vw,42px)" }}>
        <div aria-hidden="true" style={rule} />
        <div className={c("v2-split")} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)", gap: "clamp(24px,4vw,56px)", alignItems: "end" }}>
          <h2 id="v2-film-h" style={{ fontFamily: COND, fontWeight: 600, fontSize: "clamp(2.2rem,6vw,4.8rem)", lineHeight: 1.06, letterSpacing: "-0.03em", textTransform: "none", color: "var(--fk-ink)", margin: 0, maxWidth: "16ch" }}>Everything we built, in the order you meet it</h2>
          <p style={{ ...deck, maxWidth: "44ch" }}>One rotation of the drum is one day: 04:00 in the kitchen to the Sunday recalibration. Pick an hour and it turns to it.</p>
        </div>

        <div className={c("v2-daygrid")} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.02fr) minmax(0,0.98fr)", gap: "clamp(26px,4vw,60px)", alignItems: "center", marginTop: "clamp(30px,4vw,56px)" }}>
          <div ref={stageRef} className={c("v2-stage")} style={{ position: "relative", height: "min(62vh,540px)", minHeight: 420 }}>
            <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", width: 520, height: 520, margin: "-260px 0 0 -260px", border: "1px solid var(--fk-surface)", borderRadius: "50%" }} />
            <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", width: 340, height: 340, margin: "-170px 0 0 -170px", border: "1px solid var(--fk-surface)", borderRadius: "50%" }} />
            <div className={c("v2-drum")} style={{ position: "absolute", inset: 0, transform: `translateZ(-370px) rotateY(${(-hour * 51.4286).toFixed(2)}deg)` }}>
              {face(0, <>{photo("/images/kitchen.jpg", "The kitchen before dawn")}{hourMark("04:00")}{cap("The kitchen wakes", "Tonight's cook sheet was computed from every active plan, portion by portion. Nothing is cooked to an average.")}</>)}
              {face(1, <>{photo("/images/chef-hands.jpg", "Ingredients weighed on a prep board")}{hourMark("06:30")}{cap("Your food is weighed", "Every portion hits your macros on a scale before the compartment is sealed. That single act is the whole product.")}</>)}
              {face(2, (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 22 }}>
                  <span style={{ ...cond("52px"), letterSpacing: "-0.03em" }}>08:00</span>
                  <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 0" }}>
                    <span style={{ width: 12, height: 12, background: "var(--fk-green)" }} />
                    <span style={{ flex: 1, height: 1, background: "var(--fk-line)", position: "relative", overflow: "hidden" }}>
                      <span className={c("v2-loop", "aSweep32")} style={{ position: "absolute", inset: 0, background: "var(--fk-green)", width: "22%" }} />
                    </span>
                    <span style={{ width: 12, height: 12, border: "1px solid var(--fk-line-2)" }} />
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    {DROP_ROWS.map((r) => (
                      <span key={r.k} style={{ display: "flex", justifyContent: "space-between", ...mono(11, "0.08em"), borderBottom: "1px solid var(--fk-warm)", paddingBottom: 5 }}>{r.k}<b style={{ color: "var(--fk-ink-2)", fontWeight: 400 }}>{r.v}</b></span>
                    ))}
                  </div>
                  {cap("It is at your door", "Fifteen areas of east Pune, six days a week, one bundled drop.", "var(--fk-ink-2)")}
                </div>
              ))}
              {face(3, (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 22 }}>
                  <span style={{ ...cond("52px"), letterSpacing: "-0.03em" }}>08:02</span>
                  <div style={{ display: "grid", gap: 8 }}>
                    {LOG_ROWS.map((r) => (
                      <span key={r.k} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", padding: "9px 10px", background: "var(--fk-surface)", borderLeft: "2px solid var(--fk-green)", fontFamily: SANS, fontSize: 12, letterSpacing: "0", color: "var(--fk-ink-2)" }}>{r.k}<b style={{ color: "var(--fk-green)", fontWeight: 400 }}>{r.v}</b></span>
                    ))}
                  </div>
                  {cap("It logs itself", "The meal lands in your diary with the macros it was weighed to. No app opened, no portion guessed.", "var(--fk-ink-2)")}
                </div>
              ))}
              {face(4, <>{photo("/images/training.jpg", "A training session in progress")}{hourMark("18:30")}{cap("You train to the plan", "Sets and reps go in from a 952-exercise library, the burn comes back as one net-calorie figure.")}</>)}
              {face(5, (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 22 }}>
                  <span style={{ ...cond("52px"), letterSpacing: "-0.03em" }}>21:00</span>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 120 }}>
                    {RECAP_BARS.map((h, i) => (<span key={i} style={{ flex: 1, background: i === 5 ? "var(--fk-green)" : "var(--fk-line)", height: `${h}%` }} />))}
                  </div>
                  {cap("The day closes itself", "Eaten against target, trained against scheduled, water, weight. One recap on WhatsApp, unasked for.", "var(--fk-ink-2)")}
                </div>
              ))}
              {face(6, (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 22 }}>
                  <span style={{ ...cond("52px", 900, "var(--fk-green)"), letterSpacing: "-0.03em" }}>SUN</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, fontFamily: COND, fontWeight: 600, letterSpacing: "-0.03em", color: "var(--fk-ink)" }}>
                    <span style={{ fontSize: 40 }}>1,800</span>
                    <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 400, color: "var(--fk-ink-3)" }}>→</span>
                    <span style={{ fontSize: 40, color: "var(--fk-green)" }}>1,690</span>
                  </div>
                  {cap("The target moves", "Flat for a fortnight? The target is recalculated from numbers we already hold. You did not have to notice the plateau.", "var(--fk-ink-2)")}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 12, borderBottom: "1px solid var(--fk-line)", ...mono(10.5) }}>
              <span>Seven stops, one rotation</span><span style={{ color: "var(--fk-green)" }}>{DAY_LABELS[hour]}</span>
            </div>
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {DAY_STEPS.map(([t, l, tag], i) => {
                const on = i === hour;
                return (
                  <li key={t}>
                    <button type="button" onClick={() => setHour(i)} className={c("v2-row", "v2-hourbtn")}
                      style={{ width: "100%", display: "grid", gridTemplateColumns: "82px minmax(0,1fr) auto", gap: 14, alignItems: "center", textAlign: "left", cursor: "pointer", background: on ? "var(--fk-warm)" : "transparent", border: 0, borderBottom: "1px solid var(--fk-line)", borderLeft: `2px solid ${on ? "var(--fk-green)" : "transparent"}`, padding: "15px 12px", minHeight: 56 }}>
                      <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0.1em", color: on ? "var(--fk-ink)" : "var(--fk-ink-3)" }}>{t}</span>
                      <span style={{ ...cond("19px", 800, on ? "var(--fk-ink)" : "var(--fk-ink-2)"), lineHeight: 1, letterSpacing: "-0.01em" }}>{l}</span>
                      <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0", color: on ? "var(--fk-green)" : "transparent" }}>{tag}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div style={{ display: "flex", gap: 10, marginTop: 18, alignItems: "center" }}>
              <button type="button" onClick={() => setHour((h) => (h + 6) % 7)} className={c("v2-ghost")} style={{ cursor: "pointer", background: "transparent", border: "1px solid var(--fk-line)", color: "var(--fk-ink-2)", fontFamily: SANS, fontSize: 12, letterSpacing: "0", padding: "12px 16px", minHeight: 44 }}>◀ PREV</button>
              <button type="button" onClick={() => setHour((h) => (h + 1) % 7)} className={c("v2-ghost")} style={{ cursor: "pointer", background: "transparent", border: "1px solid var(--fk-line)", color: "var(--fk-ink-2)", fontFamily: SANS, fontSize: 12, letterSpacing: "0", padding: "12px 16px", minHeight: 44 }}>NEXT ▶</button>
              <span style={{ ...mono(10, "0.14em", "var(--fk-ink-3)"), marginLeft: "auto" }}>Auto-turns every 6s</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════ COACH ══ */
export function CoachSection({
  chat, thinking, draft, setDraft, ask, engine, wrap, rule, h2, deck,
}: {
  chat: { who: string; text: string; figures?: string[] }[];
  thinking: boolean; draft: string; setDraft: (v: string) => void; ask: (q: string) => void;
  engine: { plateau: boolean; actualRate: number; raw: number; capped: number; capBit: boolean; proposed: number; floorBit: boolean; sign: (n: number) => string };
  wrap: Wrap; rule: CSSProperties; h2: H2; deck: CSSProperties;
}) {
  const { plateau, actualRate, raw, capped, capBit, proposed, floorBit, sign } = engine;
  const steps = [
    { value: (actualRate >= 0 ? "−" : "+") + Math.abs(actualRate).toFixed(2) + " kg/wk", note: "your actual rate over the fortnight" },
    { value: "0.50 kg/wk", note: "the rate your goal needs" },
    { value: sign(raw) + " kcal", note: "the gap, through 7,700 kcal per kg" },
    { value: sign(capped) + " kcal", note: capBit ? "capped at ±300, the cap is biting" : "inside the ±300 cap" },
  ];
  return (
    <section id="v2-coach" aria-labelledby="v2-coach-h" style={{ padding: "clamp(56px,8vw,112px) 0" }}>
      <div style={wrap}>
        <div aria-hidden="true" style={rule} />
        <div className={c("v2-split")} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)", gap: "clamp(24px,4vw,56px)", alignItems: "end" }}>
          <div className={c("v2-rise")}><h2 id="v2-coach-h" style={h2("14ch")}>Your <span style={{ color: "var(--fk-green)" }}>AI coach</span> shows its working</h2></div>
          <p className={c("v2-rise")} style={deck}>Three numbers govern every change to your target: the constant, the cap and the floor. Here is the arithmetic, run on a real fortnight of weigh-ins.</p>
        </div>

        <div className={c("v2-ai")} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.35fr) minmax(0,1fr)", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)", marginTop: "clamp(30px,4vw,52px)" }}>
          <div style={{ background: "var(--fk-warm)", display: "flex", flexDirection: "column", minHeight: 440 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px clamp(16px,2vw,24px)", borderBottom: "1px solid var(--fk-line)" }}>
              <span style={{ position: "relative", width: 9, height: 9, background: "var(--fk-green)", flex: "none" }}>
                <span aria-hidden="true" className={c("v2-loop", "aPulse24")} style={{ position: "absolute", inset: 0, background: "var(--fk-green)" }} />
              </span>
              <span style={mono(11, "0.18em", "var(--fk-ink)")}>FitFuel Coach</span>
              <span style={{ ...mono(10, "0.14em"), border: "1px solid var(--fk-line)", padding: "4px 8px" }}>Model integration pending</span>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, padding: "clamp(16px,2vw,24px)", overflow: "hidden" }}>
              {chat.map((m, i) => {
                const you = m.who === "you";
                return (
                  <div key={i} style={{ display: "flex", justifyContent: you ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "74%", background: you ? "var(--fk-warm)" : "var(--fk-paper)", border: "1px solid var(--fk-line)", borderLeft: `2px solid ${you ? "var(--fk-ink-3)" : "var(--fk-green)"}`, padding: "13px 15px" }}>
                      <span style={{ display: "block", ...mono(9.5, "0.18em", you ? "var(--fk-ink-3)" : "var(--fk-green)"), marginBottom: 7 }}>{you ? "You" : "Coach"}</span>
                      <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.58, color: you ? "var(--fk-ink-2)" : "var(--fk-ink)", margin: 0 }}>{m.text}</p>
                      {m.figures && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                          {m.figures.map((f) => (<span key={f} style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0", color: "var(--fk-green)", border: "1px solid var(--fk-line)", background: "var(--fk-warm)", padding: "6px 9px" }}>{f}</span>))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {thinking && (
                <div style={{ display: "flex", alignItems: "center", gap: 9, ...mono(11, "0.16em") }}>
                  Coach is reading your numbers
                  <span className={c("v2-loop", "aBlink1")} style={{ width: 7, height: 14, background: "var(--fk-green)" }} />
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "0 clamp(16px,2vw,24px) 14px" }}>
              {PROMPTS.map((q) => (
                <button key={q} type="button" onClick={() => ask(q)} className={c("v2-ghost")} style={{ cursor: "pointer", background: "transparent", border: "1px solid var(--fk-line)", color: "var(--fk-ink-2)", fontFamily: SANS, fontSize: 12, letterSpacing: "0", padding: "9px 11px", minHeight: 44 }}>{q}</button>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); ask(draft); }} style={{ display: "flex", gap: 1, background: "var(--fk-line)", borderTop: "1px solid var(--fk-line)" }}>
              <input type="text" value={draft} onChange={(e) => setDraft(e.currentTarget.value)} placeholder="Ask about your target, a plateau, a dish…" aria-label="Ask the FitFuel coach" style={{ flex: 1, minWidth: 0, background: "var(--fk-paper)", border: 0, padding: "16px clamp(16px,2vw,24px)", color: "var(--fk-ink)", fontFamily: SANS, fontSize: 14.5, minHeight: 52, outline: "none" }} />
              <button type="submit" className={c("v2-btn")} style={{ cursor: "pointer", background: "var(--fk-green)", border: 0, color: "var(--fk-paper)", fontFamily: COND, fontWeight: 600, fontSize: 14, letterSpacing: "0", textTransform: "none", padding: "0 clamp(18px,2.4vw,28px)", minHeight: 52 }}><span>Ask</span></button>
            </form>
          </div>

          <div style={{ background: "var(--fk-paper)", padding: "clamp(18px,2.2vw,26px)", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={mono(10.5)}>What it is allowed to read</div>
            {FEEDS.map((f) => (
              <div key={f.k}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, fontFamily: SANS, fontSize: 12, letterSpacing: "0", color: "var(--fk-ink-2)" }}>{f.k}<span style={{ color: "var(--fk-ink-3)" }}>{f.v}</span></div>
                <span style={{ display: "block", height: 3, background: "var(--fk-warm)", marginTop: 8 }}><span className={c("v2-bar")} style={{ display: "block", height: 3, width: f.w, background: f.c }} /></span>
              </div>
            ))}
            <p style={{ fontFamily: SANS, fontSize: 12.5, lineHeight: 1.6, color: "var(--fk-ink-3)", margin: "auto 0 0" }}>The coach never invents a number. Every answer is drawn from the rows above and shows the arithmetic that produced it.</p>
          </div>
        </div>

        <div className={c("v2-g3")} style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)", borderTop: 0 }}>
          {AI_JOBS.map((j) => (
            <div key={j.n} className={c("v2-tile")} style={{ background: "var(--fk-paper)", padding: "clamp(18px,2.2vw,26px)", display: "flex", flexDirection: "column", gap: 10 }}>
              <b style={{ ...cond("clamp(1.05rem,1.7vw,1.35rem)", 800), lineHeight: 1.05, letterSpacing: "-0.01em" }}>{j.h}</b>
              <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: "var(--fk-ink-2)", margin: 0 }}>{j.p}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "clamp(30px,4vw,52px)", border: "1px solid var(--fk-line)", background: "var(--fk-warm)", padding: "clamp(20px,2.6vw,32px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", ...mono(11, "0.16em"), paddingBottom: 16, borderBottom: "1px solid var(--fk-line)" }}>
            <span>Four weigh-ins, a fortnight apart</span><span style={{ color: "var(--fk-ink)" }}>{plateau ? "Plateau detected" : "Moving, no change proposed"}</span>
          </div>

          <EngineChart w={WEIGH_INS} />

          <ol style={{ listStyle: "none", margin: "20px 0 0", padding: 0, borderTop: "1px solid var(--fk-line)" }}>
            {steps.map((st) => (
              <li key={st.note} className={c("v2-eng-step")} style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr)", gap: "clamp(14px,2vw,26px)", alignItems: "baseline", padding: "14px 0", borderBottom: "1px solid var(--fk-line)" }}>
                <b style={{ ...cond("clamp(18px,2.2vw,25px)"), fontVariantNumeric: "tabular-nums" }}>{st.value}</b>
                <span style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.5, color: "var(--fk-ink-2)" }}>{st.note}</span>
              </li>
            ))}
          </ol>

          <div style={{ display: "flex", alignItems: "flex-end", gap: "clamp(16px,3vw,34px)", marginTop: 26, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={mono(10, "0.16em")}>Target now</span>
              <b style={{ ...cond("clamp(32px,4.6vw,54px)"), lineHeight: 1.06, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>1,800</b>
            </div>
            <span aria-hidden="true" style={{ color: "var(--fk-ink-3)", fontSize: 28, paddingBottom: 6 }}>→</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={mono(10, "0.16em")}>{plateau ? "Proposed" : "Unchanged"}</span>
              <b style={{ ...cond("clamp(32px,4.6vw,54px)"), lineHeight: 1.06, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{(plateau ? proposed : 1800).toLocaleString("en-IN")}</b>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: "var(--fk-ink-3)", margin: 0, maxWidth: "44ch", flex: "1 1 260px" }}>
              {floorBit ? "Held at the 1,200 kcal floor. No recommendation goes below it, whatever the arithmetic says." : "You are shown this rationale and you choose whether to apply it. The target never changes behind your back."}
            </p>
          </div>
        </div>

        <div style={{ marginTop: "clamp(26px,3.4vw,44px)" }}>
          <div style={{ ...mono(11, "0.2em"), padding: "0 0 12px" }}>The constants, as shipped</div>
          <dl style={{ margin: 0, border: "1px solid var(--fk-line)", borderBottom: 0 }}>
            {MATHS.map((m) => (
              <div key={m.n} className={c("v2-row", "v2-const")} style={{ display: "grid", gridTemplateColumns: "minmax(120px,0.5fr) minmax(150px,0.7fr) minmax(0,2fr)", gap: "clamp(14px,2vw,26px)", alignItems: "baseline", padding: "clamp(14px,1.7vw,20px)", borderBottom: "1px solid var(--fk-line)", borderLeft: "2px solid transparent" }}>
                <dt style={{ ...cond("clamp(1.7rem,3.2vw,2.8rem)"), lineHeight: 1.06, letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums", margin: 0 }}>{m.n}</dt>
                <dd style={{ margin: 0, ...mono(11.5, "0.14em", "var(--fk-green)") }}>{m.unit}</dd>
                <dd style={{ margin: 0, fontFamily: SANS, fontSize: 13.5, lineHeight: 1.6, color: "var(--fk-ink-2)" }}>{m.note}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════ CHECKS ══ */
export function ChecksSection({
  barcode, licence, wrap, rule, h2, deck,
}: {
  barcode: { w: string; c: string }[]; licence: string;
  wrap: Wrap; rule: CSSProperties; h2: H2; deck: CSSProperties;
}) {
  const quotes = [
    { id: "rahul", before: "Rahul, day 1", after: "Rahul, day 30", result: "+3kg muscle", span: "30 days", quote: "Gained 3kg of muscle in a month. The food is actually delicious. I was expecting bland diet food but FitFuel proved me wrong completely.", who: "Rahul M. · Kharadi · Muscle gain, 1 month" },
    { id: "priya", before: "Priya, day 1", after: "Priya, day 15", result: "−4kg in 15 days", span: "15 days", quote: "Lost 4kg in 15 days while eating properly. No starvation, no boiled chicken. Real food that keeps me full until the next meal.", who: "Priya S. · Viman Nagar · Weight loss, bi-weekly" },
    { id: "amit", before: "Amit, day 1", after: "Amit, month 3", result: "Quit Zomato", span: "3 months", quote: "I used to order Zomato every day and still feel unhealthy. FitFuel changed my relationship with food completely.", who: "Amit K. · Kalyani Nagar · Office plan, monthly" },
  ];
  return (
    <section aria-labelledby="v2-why-h" style={{ padding: "clamp(72px,9.5vw,140px) 0", background: "var(--fk-surface)", borderTop: "1px solid var(--fk-line)" }}>
      <div style={wrap}>
        <div aria-hidden="true" style={rule} />
        <div className={c("v2-split")} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)", gap: "clamp(24px,4vw,56px)", alignItems: "end" }}>
          <div className={c("v2-rise")}><h2 id="v2-why-h" style={h2("14ch")}>Four things you can check before you trust us</h2></div>
          <p className={c("v2-rise")} style={deck}>Eight verified reviews. Read all eight.</p>
        </div>

        <div className={c("v2-proof")} style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)", marginTop: "clamp(28px,3.6vw,46px)" }}>
          <article className={c("v2-tile")} style={{ background: "var(--fk-paper)", padding: "clamp(20px,2.6vw,32px)", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, padding: 18, background: "var(--fk-warm)", border: "1px solid var(--fk-warm)" }}>
              {REGIONS.map(([k, n], i) => (
                <span key={k} style={{ display: "grid", gridTemplateColumns: "112px minmax(0,1fr) 26px", gap: 10, alignItems: "center", ...mono(10.5, "0.08em") }}>{k}
                  <span style={{ display: "block", height: 9, background: "var(--fk-surface)" }}><span className={c("v2-bar")} style={{ display: "block", height: 9, width: `${Math.round((n / 6) * 100)}%`, background: i < 3 ? "var(--fk-green)" : i < 6 ? "var(--fk-green-deep)" : "var(--fk-green-deep)" }} /></span>
                  <b style={{ color: "var(--fk-ink-2)", fontWeight: 400, textAlign: "right" }}>{n}</b>
                </span>
              ))}
              <span style={{ display: "flex", justifyContent: "space-between", marginTop: 6, paddingTop: 10, borderTop: "1px solid var(--fk-warm)", ...mono(10.5, "0.14em", "var(--fk-green)") }}>30 seeded recipes<span>no dish twice running</span></span>
            </div>
            <h3 style={cond("clamp(1.3rem,2.2vw,1.75rem)", 800)}>Cooked, not assembled</h3>
            <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.62, color: "var(--fk-ink-2)", margin: 0 }}>Thirty seeded recipes across Maharashtrian, Chettinad, Punjabi, Bengali, Gujarati and more. Not five variations on grilled chicken and broccoli.</p>
          </article>

          <article className={c("v2-tile")} style={{ background: "var(--fk-paper)", padding: "clamp(20px,2.6vw,32px)", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px,2vw,24px)", padding: 18, background: "var(--fk-warm)", border: "1px solid var(--fk-warm)" }}>
              <svg viewBox="0 0 120 74" width="132" height="82" role="img" aria-label="A kitchen scale settling on the portion weight" style={{ flex: "none" }}>
                <path d="M8 66 A52 52 0 0 1 112 66" fill="none" stroke="var(--fk-warm)" strokeWidth="8" />
                <path d="M8 66 A52 52 0 0 1 74 17.5" fill="none" stroke="var(--fk-green)" strokeWidth="8" />
                <g className={c("v2-loop", "aNeedle5")} style={{ transformOrigin: "60px 66px" }}>
                  <line x1="60" y1="66" x2="60" y2="22" stroke="var(--fk-ink)" strokeWidth="2.5" />
                </g>
                <circle cx="60" cy="66" r="5" fill="var(--fk-ink)" />
              </svg>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                <b style={{ ...cond("clamp(2rem,3.4vw,2.9rem)"), lineHeight: 1.06, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>182<span style={{ fontSize: "0.44em", color: "var(--fk-ink-3)", marginLeft: 6 }}>g</span></b>
                {WEIGH_ROWS.map((r) => (
                  <span key={r.k} style={{ display: "flex", justifyContent: "space-between", ...mono(10.5, "0.08em"), borderBottom: "1px solid var(--fk-warm)", paddingBottom: 5 }}>{r.k}<b style={{ color: "var(--fk-green)", fontWeight: 400 }}>{r.v}</b></span>
                ))}
              </div>
            </div>
            <h3 style={cond("clamp(1.3rem,2.2vw,1.75rem)", 800)}>Weighed, not estimated</h3>
            <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.62, color: "var(--fk-ink-2)", margin: 0 }}>Every portion hits your macros on a scale before the compartment is sealed. That single act is why the tracking can be automatic at all.</p>
          </article>

          <article className={c("v2-tile")} style={{ background: "var(--fk-paper)", padding: "clamp(20px,2.6vw,32px)", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ position: "relative", padding: 18, background: "var(--fk-warm)", border: "1px solid var(--fk-warm)", overflow: "hidden" }}>
              <span style={{ display: "block", ...mono(10, "0.2em") }}>FSSAI licence, held by us</span>
              <b style={{ display: "block", marginTop: 10, fontFamily: SANS, fontSize: "clamp(15px,2.2vw,21px)", letterSpacing: "0", color: "var(--fk-ink)" }}>{licence}</b>
              <span aria-hidden="true" style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 34, marginTop: 14 }}>
                {barcode.map((b, i) => (<span key={i} style={{ width: b.w, height: "100%", background: b.c }} />))}
              </span>
              <span style={{ display: "flex", justifyContent: "space-between", marginTop: 12, ...mono(10, "0.14em", "var(--fk-ink-3)") }}>Kharadi, Pune<span style={{ color: "var(--fk-green)" }}>Our kitchen, our shift</span></span>
            </div>
            <h3 style={cond("clamp(1.3rem,2.2vw,1.75rem)", 800)}>Our own licensed kitchen</h3>
            <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.62, color: "var(--fk-ink-2)", margin: 0 }}>Not a cloud kitchen rented by the shift, not a restaurant cooking your food between other orders. One licence, one address, checkable on the FSSAI register.</p>
          </article>

          <article className={c("v2-tile")} style={{ background: "var(--fk-paper)", padding: "clamp(20px,2.6vw,32px)", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,0.72fr)", gap: 12, padding: 18, background: "var(--fk-warm)", border: "1px solid var(--fk-warm)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {MENU_PEEK.map((m) => (
                  <span key={m.k} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontFamily: SANS, fontSize: 12, letterSpacing: "0.04em", color: "var(--fk-ink-2)", borderBottom: "1px solid var(--fk-warm)", paddingBottom: 6 }}>{m.k}<b style={{ color: "var(--fk-green)", fontWeight: 400, whiteSpace: "nowrap" }}>{m.v}</b></span>
                ))}
                <span style={{ ...mono(10, "0.14em", "var(--fk-green)"), marginTop: 4 }}>All 30 days, no account</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 9, borderLeft: "1px solid var(--fk-warm)", paddingLeft: 12, opacity: 0.55 }}>
                <span style={{ ...mono(10, "0.14em", "var(--fk-ink-3)"), textDecoration: "line-through" }}>Sign up to see</span>
                <span style={{ height: 8, background: "var(--fk-surface)" }} />
                <span style={{ height: 8, background: "var(--fk-surface)", width: "72%" }} />
                <span style={{ height: 8, background: "var(--fk-surface)", width: "54%" }} />
                <span style={mono(9.5, "0.12em", "var(--fk-ink-3)")}>What the others show</span>
              </div>
            </div>
            <h3 style={cond("clamp(1.3rem,2.2vw,1.75rem)", 800)}>The menu is public before you pay</h3>
            <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.62, color: "var(--fk-ink-2)", margin: 0 }}>Every dish, every macro, no signup wall. Most services show you a photo and a promise, and the real menu after your card clears.</p>
          </article>
        </div>

        <div style={{ ...sub(), marginTop: "clamp(40px,5vw,72px)" }}><span>Three of the eight, with their own photographs</span></div>

        <div className={c("v2-g3")} style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)", borderTop: 0 }}>
          {quotes.map((q) => (
            <figure key={q.id} style={{ background: "var(--fk-warm)", margin: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 1, background: "var(--fk-line)" }}>
                <div className={c("v2-slotwrap")} style={{ minWidth: 0, position: "relative", aspectRatio: "3/4", background: "var(--fk-paper)", border: "1px solid transparent" }}>
                  <ImageSlot placeholder={q.before} />
                  <span aria-hidden="true" style={{ position: "absolute", left: 0, bottom: 0, padding: "6px 9px", background: "var(--fk-paper)", ...mono(9.5, "0.18em") }}>Before</span>
                </div>
                <div className={c("v2-slotwrap")} style={{ minWidth: 0, position: "relative", aspectRatio: "3/4", background: "var(--fk-paper)", border: "1px solid transparent" }}>
                  <ImageSlot placeholder={q.after} />
                  <span aria-hidden="true" style={{ position: "absolute", left: 0, bottom: 0, padding: "6px 9px", background: "var(--fk-green)", ...mono(9.5, "0.18em", "var(--fk-paper)") }}>After</span>
                </div>
              </div>
              <div style={{ padding: "clamp(20px,2.4vw,28px)", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ ...cond("clamp(1.5rem,2.8vw,2.2rem)", 900, "var(--fk-green)"), lineHeight: 1.06, letterSpacing: "-0.03em" }}>{q.result}</span>
                  <span style={mono(10, "0.14em", "var(--fk-ink-3)")}>{q.span}</span>
                </div>
                <blockquote style={{ margin: 0 }}><p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.62, color: "var(--fk-ink)", margin: 0 }}>&ldquo;{q.quote}&rdquo;</p></blockquote>
                <figcaption style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--fk-line)", ...mono(11, "0.12em") }}>{q.who}</figcaption>
              </div>
            </figure>
          ))}
        </div>

        <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.6, color: "var(--fk-ink-3)", margin: "18px 0 0", maxWidth: "78ch" }}>Results vary with adherence, starting point and medical history. These are individual outcomes, not an average and not a promise.</p>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════ COVERAGE ══ */
export function CoverageSection({ map, wrap, rule, h2, deck }: { map: ReactNode; wrap: Wrap; rule: CSSProperties; h2: H2; deck: CSSProperties }) {
  return (
    <section aria-labelledby="v2-areas-h" style={{ padding: "clamp(40px,5vw,72px) 0 clamp(56px,7vw,96px)", background: "var(--fk-surface)" }}>
      <div style={wrap}>
        <div aria-hidden="true" style={rule} />
        <div className={c("v2-split")} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)", gap: "clamp(24px,4vw,56px)", alignItems: "end" }}>
          <div className={c("v2-rise")}><h2 id="v2-areas-h" style={h2("12ch")}>Do we deliver to you?</h2></div>
          <p className={c("v2-rise")} style={deck}>Cooked from 04:00 in Kharadi, at your door by 08:00. Fifteen areas, one kitchen. We would rather serve east Pune properly than the whole city badly.</p>
        </div>

        <figure style={{ margin: "clamp(30px,4vw,52px) 0 0", border: "1px solid var(--fk-line)", background: "var(--fk-paper)", padding: "clamp(14px,2.2vw,30px)" }}>
          {map}
          <figcaption style={{ display: "flex", flexWrap: "wrap", gap: "clamp(14px,2.4vw,30px)", marginTop: "clamp(12px,1.6vw,20px)", paddingTop: "clamp(12px,1.6vw,18px)", borderTop: "1px solid var(--fk-line)", ...mono(10.5, "0.16em") }}>
            <span style={{ color: "var(--fk-green)" }}>Kitchen</span><span>Delivered area</span><span>Rings at 3, 6 and 9 km</span><span>Grid 2 km</span><span>Plotted from coordinates</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════ MORE ══ */
export function MoreSection({ wrap, rule, h2, deck }: { wrap: Wrap; rule: CSSProperties; h2: H2; deck: CSSProperties }) {
  const band: [string, string, string, string, boolean][] = [
    ["/images/produce.jpg", "Ingredients weighed into the food database", "The diary", "154 foods, per gram", false],
    ["/images/gym.jpg", "The training floor the programme is written for", "Training", "952 exercises", true],
    ["/images/supplements.jpg", "Supplements researched, not stocked", "Supplements", "46 researched, none sold", true],
    ["/images/corporate.jpg", "A team eating on one corporate invoice", "Corporate", "One GST invoice", true],
  ];
  const line = (k: string, v: string, col = "var(--fk-green)") => (
    <span key={k} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 8, alignItems: "baseline", paddingBottom: 7, borderBottom: "1px solid var(--fk-surface)", fontFamily: SANS, fontSize: 12, letterSpacing: "0.04em", color: "var(--fk-ink-2)" }}>{k}<b style={{ color: col, fontWeight: 400, whiteSpace: "nowrap" }}>{v}</b></span>
  );
  const card = (href: string, top: ReactNode, title: string, body: string) => (
    <Link href={href} className={c("v2-tile")} style={{ background: "var(--fk-paper)", display: "flex", flexDirection: "column", textDecoration: "none" }}>
      <div style={{ background: "var(--fk-warm)", borderBottom: "1px solid var(--fk-line)", padding: 16, display: "flex", flexDirection: "column", gap: 11, minHeight: 212 }}>{top}</div>
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
        <b style={{ ...cond("1.35rem", 800), letterSpacing: "-0.01em" }}>{title}</b>
        <p style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.55, color: "var(--fk-ink-2)", margin: 0 }}>{body}</p>
      </div>
    </Link>
  );

  return (
    <section aria-labelledby="v2-more-h" style={{ padding: "clamp(64px,8.5vw,120px) 0", borderTop: "1px solid var(--fk-line)" }}>
      <div style={wrap}>
        <div aria-hidden="true" style={rule} />
        <div className={c("v2-split")} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)", gap: "clamp(24px,4vw,56px)", alignItems: "end" }}>
          <div className={c("v2-rise")}><h2 id="v2-more-h" style={h2("14ch")}>The food is the front of a much bigger thing</h2></div>
          <p className={c("v2-rise")} style={deck}>All of it is included with a plan and none of it is a second subscription. It gets a tile each rather than a chapter, because you came to find out about dinner.</p>
        </div>

        <div className={c("v2-band")} style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)", marginTop: "clamp(30px,4vw,52px)" }}>
          {band.map(([src, alt, title, note, duo]) => (
            <figure key={title} style={{ position: "relative", margin: 0, aspectRatio: "4/5", overflow: "hidden", background: "var(--fk-surface)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: duo ? PLACE : FOOD }} />
              {duo && <span aria-hidden="true" style={{ position: "absolute", inset: 0, background: "var(--fk-green)", mixBlendMode: "color", opacity: 0.55, pointerEvents: "none" }} />}
              <span aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(7,7,7,0.08),rgba(7,7,7,0.92) 70%)" }} />
              <figcaption style={{ position: "absolute", inset: "auto 0 0 0", padding: "clamp(14px,1.8vw,22px)" }}>
                <b style={{ display: "block", ...cond("clamp(1.5rem,2.6vw,2.2rem)"), lineHeight: 1.06, letterSpacing: "-0.03em" }}>{title}</b>
                <span style={{ display: "block", marginTop: 7, ...mono(10.5, "0.16em", "var(--fk-green)") }}>{note}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div style={{ ...sub(), marginTop: "clamp(38px,4.6vw,64px)" }}><span>The supplement shelf</span></div>
        <div className={c("v2-shelf")} style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)", borderTop: 0 }}>
          {SHELF.map((sh) => (
            <figure key={sh.id} className={c("v2-slotwrap")} style={{ margin: 0, background: "var(--fk-paper)", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", aspectRatio: "1/1", background: "var(--fk-warm)" }}><ImageSlot placeholder={sh.ph} /></div>
              <figcaption style={{ padding: "13px 14px 16px", borderTop: "1px solid var(--fk-warm)" }}>
                <b style={{ display: "block", ...cond("17px", 800), letterSpacing: "-0.01em" }}>{sh.name}</b>
                <span style={{ display: "block", marginTop: 7, ...mono(9.5, "0.14em", "var(--fk-green)") }}>{sh.note}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.6, color: "var(--fk-ink-3)", margin: "14px 0 clamp(34px,4vw,56px)", maxWidth: "80ch" }}>Product photographs go in these six slots. We own no supplement brand and hold no stock: the coach tells you what the evidence supports, at what dose, and links the cheapest verified seller.</p>

        <div style={sub()}><span>Nine products, one plan</span></div>
        <div className={c("v2-moat")} style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)", borderTop: 0 }}>
          {card("/dashboard/nutrition", (
            <>
              <span style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--fk-line)", background: "var(--fk-paper)", padding: "9px 11px", fontFamily: SANS, fontSize: 12, letterSpacing: "0", color: "var(--fk-ink-3)" }}>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--fk-green)" strokeWidth="2.4" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" /></svg>
                poha, 1 katori
              </span>
              {DIARY_ROWS.map((d) => line(d.k, d.v, d.c))}
              <span style={{ marginTop: "auto", display: "block" }}>
                <span style={{ display: "flex", justifyContent: "space-between", ...mono(9.5, "0.14em"), marginBottom: 6 }}>Eaten today<b style={{ color: "var(--fk-ink)", fontWeight: 400 }}>1,412 / 1,800</b></span>
                <span style={{ display: "block", height: 6, background: "var(--fk-surface)" }}><span className={c("v2-bar")} style={{ display: "block", height: 6, width: "78%", background: "var(--fk-green)" }} /></span>
              </span>
            </>
          ), "The diary", "Your meals arrive pre-logged. Anything else you eat, you add per gram from an Indian food database.")}

          {card("/dashboard/exercises", (
            <>
              <span style={{ display: "flex", justifyContent: "space-between", ...mono(9.5, "0.14em") }}>Push day · week 3<span style={{ color: "var(--fk-green)" }}>4 of 5 done</span></span>
              {TRAIN_ROWS.map((t) => (
                <span key={t.k} style={{ display: "grid", gridTemplateColumns: "14px minmax(0,1fr) auto", gap: 9, alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--fk-surface)", fontFamily: SANS, fontSize: 12, letterSpacing: "0.04em", color: "var(--fk-ink-2)" }}>
                  <span style={{ width: 11, height: 11, border: `1px solid ${t.c}`, background: t.fill }} />{t.k}<b style={{ color: "var(--fk-ink-3)", fontWeight: 400 }}>{t.v}</b>
                </span>
              ))}
              <span style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", gap: 4, height: 40 }}>
                {TRAIN_BARS.map((h, i) => (<span key={i} style={{ flex: 1, background: i > 8 ? "#f59e0b" : "var(--fk-line)", height: `${h}%` }} />))}
              </span>
            </>
          ), "Training", "A programme built around your plan, not a video library you scroll through. Volume feeds straight back into the target.")}

          {card("/dashboard/body-metrics", (
            <>
              <span style={{ display: "flex", alignItems: "center", gap: 9, border: "1px solid var(--fk-line)", padding: "9px 11px", ...mono(10, "0.14em", "#38bdf8") }}>
                <span className={c("v2-loop", "aBlink16")} style={{ width: 7, height: 7, background: "#38bdf8" }} />
                Scale paired over bluetooth
              </span>
              <svg viewBox="0 0 200 54" preserveAspectRatio="none" role="img" aria-label="Weight trending down over six weeks" style={{ width: "100%", height: 54, display: "block" }}>
                <polyline points="0,14 33,18 66,12 100,24 133,30 166,27 200,38" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinejoin="round" />
                <circle cx="200" cy="38" r="4" fill="var(--fk-paper)" stroke="#38bdf8" strokeWidth="2.5" />
              </svg>
              <span style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--fk-surface)", marginTop: "auto" }}>
                {METRIC_CELLS.map((m) => (
                  <span key={m.k} style={{ background: "var(--fk-warm)", padding: "9px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
                    <b style={{ ...cond("17px"), letterSpacing: "-0.02em" }}>{m.v}</b>
                    <span style={mono(8.5, "0.12em", "var(--fk-ink-3)")}>{m.k}</span>
                  </span>
                ))}
              </span>
            </>
          ), "Body metrics", "Your Bluetooth scale talks to FitFuel in the browser. No companion app, no typing, no re-entering yesterday.")}

          {card("/dashboard/progress", (
            <>
              <span style={{ display: "flex", alignItems: "center", gap: 8, ...mono(9.5, "0.16em", "var(--fk-green)") }}>
                <span style={{ position: "relative", width: 7, height: 7, background: "var(--fk-green)" }}><span aria-hidden="true" className={c("v2-loop", "aPulse24")} style={{ position: "absolute", inset: 0, background: "var(--fk-green)" }} /></span>
                Plateau called
              </span>
              <span style={{ display: "flex", alignItems: "baseline", gap: 10, fontFamily: COND, fontWeight: 600, letterSpacing: "-0.03em" }}>
                <b style={{ fontSize: 30, color: "var(--fk-ink-3)", textDecoration: "line-through" }}>1,800</b>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 400, color: "var(--fk-ink-3)" }}>→</span>
                <b style={{ fontSize: 34, color: "var(--fk-green)" }}>1,690</b>
              </span>
              {COACH_STRIP.map((cs) => (
                <span key={cs.k} style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 12, letterSpacing: "0.04em", color: "var(--fk-ink-3)", borderBottom: "1px solid var(--fk-surface)", paddingBottom: 6 }}>{cs.k}<b style={{ color: "var(--fk-ink-2)", fontWeight: 400 }}>{cs.v}</b></span>
              ))}
              <span style={{ marginTop: "auto", display: "flex", gap: 7 }}>
                <span style={{ flex: 1, textAlign: "center", background: "var(--fk-green)", color: "var(--fk-paper)", fontFamily: COND, fontWeight: 600, fontSize: 12, letterSpacing: "0", textTransform: "none", padding: 9 }}>Apply</span>
                <span style={{ flex: 1, textAlign: "center", border: "1px solid var(--fk-line)", color: "var(--fk-ink-3)", fontFamily: COND, fontWeight: 600, fontSize: 12, letterSpacing: "0", textTransform: "none", padding: 9 }}>Keep 1,800</span>
              </span>
            </>
          ), "The coach", "Spots a plateau, recalculates your target from your own numbers, shows the arithmetic and waits for your yes.")}

          {card("/supplements", (
            <>
              <span style={{ display: "flex", justifyContent: "space-between", ...mono(9.5, "0.14em") }}>Evidence grade<span style={{ color: "#38bdf8" }}>we sell none of it</span></span>
              {SUPP_GRADES.map((g) => (
                <span key={g.k} style={{ display: "grid", gridTemplateColumns: "78px minmax(0,1fr) 34px", gap: 9, alignItems: "center", ...mono(10, "0.08em", "var(--fk-ink-2)") }}>{g.k}
                  <span style={{ display: "block", height: 7, background: "var(--fk-surface)" }}><span className={c("v2-bar")} style={{ display: "block", height: 7, width: g.w, background: g.c }} /></span>
                  <b style={{ color: g.c, fontWeight: 400, textAlign: "right" }}>{g.n}</b>
                </span>
              ))}
              <span style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid var(--fk-surface)", paddingTop: 12 }}>
                <span className={c("v2-slotwrap")} style={{ display: "block", position: "relative", width: 88, height: 34, border: "1px solid var(--fk-line)", flex: "none", background: "var(--fk-paper)" }}><ImageSlot placeholder="Nutrabay" /></span>
                <span style={mono(9.5, "0.1em", "var(--fk-ink-3)")}>Bought at the cheapest verified seller</span>
              </span>
            </>
          ), "Supplements", "Researched properly, bought at Nutrabay. We hold no stock and own no supplement brand, so there is nothing to push.")}

          {card("/corporate", (
            <>
              <span style={{ display: "flex", justifyContent: "space-between", ...mono(9.5, "0.14em") }}>Invoice · Aug 2026<span style={{ color: "var(--fk-ink)" }}>GSTIN 27AAB…</span></span>
              {INVOICE_ROWS.map((r) => line(r.k, r.v, r.c))}
              <span style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
                {["Client logo", "Client logo", "Client logo"].map((ph, i) => (
                  <span key={i} className={c("v2-slotwrap")} style={{ display: "block", position: "relative", height: 34, border: "1px solid var(--fk-line)", background: "var(--fk-paper)" }}><ImageSlot placeholder={ph} /></span>
                ))}
              </span>
            </>
          ), "Corporate", "Your whole team, personalised per employee, billed once. Finance gets one line, each person gets their own macros.")}

          {card("/partners", (
            <>
              <span style={{ display: "flex", justifyContent: "space-between", ...mono(9.5, "0.14em") }}>Partner console<span style={{ color: "var(--fk-green)" }}>payout 01 Sep</span></span>
              <span style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                <b style={{ ...cond("32px"), letterSpacing: "-0.03em" }}>₹18,400</b>
                <span style={mono(9.5, "0.12em", "var(--fk-green)")}>this month</span>
              </span>
              <span style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {PARTNER_TYPES.map((pt) => (<span key={pt} style={{ border: "1px solid var(--fk-line)", padding: "5px 7px", ...mono(9, "0.1em", "var(--fk-ink-2)") }}>{pt}</span>))}
              </span>
              <span style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
                {["Gym logo", "Clinic logo", "Studio logo"].map((ph, i) => (
                  <span key={i} className={c("v2-slotwrap")} style={{ display: "block", position: "relative", height: 34, border: "1px solid var(--fk-line)", background: "var(--fk-paper)" }}><ImageSlot placeholder={ph} /></span>
                ))}
              </span>
            </>
          ), "Partners", "Gyms, trainers, dieticians, doctors, offices and residences. Commission tracked in your own console, paid monthly.")}

          {card("/dashboard/referrals", (
            <>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, border: "1px dashed var(--fk-line-2)", padding: "11px 12px", fontFamily: SANS, fontSize: 13, letterSpacing: "0.22em", color: "var(--fk-ink)" }}>RAHUL500<span style={mono(9, "0.14em", "var(--fk-green)")}>Copy</span></span>
              <span style={{ display: "grid", gridTemplateColumns: "1fr 18px 1fr", gap: 8, alignItems: "center", textAlign: "center" }}>
                <span style={{ border: "1px solid var(--fk-line)", padding: "12px 8px" }}>
                  <b style={{ display: "block", ...cond("22px", 900, "var(--fk-green)") }}>₹500</b>
                  <span style={{ display: "block", marginTop: 6, ...mono(8.5, "0.12em", "var(--fk-ink-3)") }}>credit to you</span>
                </span>
                <span aria-hidden="true" style={{ fontFamily: SANS, fontSize: 12, color: "var(--fk-ink-3)" }}>↔</span>
                <span style={{ border: "1px solid var(--fk-line)", padding: "12px 8px" }}>
                  <b style={{ display: "block", ...cond("22px", 900, "var(--fk-green)") }}>₹500</b>
                  <span style={{ display: "block", marginTop: 6, ...mono(8.5, "0.12em", "var(--fk-ink-3)") }}>off for them</span>
                </span>
              </span>
              <span style={{ marginTop: "auto", ...mono(9.5, "0.12em", "var(--fk-ink-3)") }}>Paid when their first order completes</span>
            </>
          ), "Refer a friend", "One code, two credits, nothing paid out until the food actually arrives at their door.")}

          {card("/tdee-calculator", (
            <>
              <span style={{ display: "flex", justifyContent: "space-between", ...mono(9.5, "0.14em") }}>TDEE calculator<span style={{ color: "var(--fk-green)" }}>free, no account</span></span>
              {TDEE_ROWS.map((t) => (
                <span key={t.k} style={{ display: "grid", gridTemplateColumns: "56px minmax(0,1fr) 44px", gap: 9, alignItems: "center", ...mono(10, "0.1em") }}>{t.k}
                  <span style={{ display: "block", height: 3, background: "var(--fk-line)", position: "relative" }}><span style={{ position: "absolute", left: t.w, top: -6, width: 9, height: 15, background: "var(--fk-ink)" }} /></span>
                  <b style={{ color: "var(--fk-ink-2)", fontWeight: 400, textAlign: "right" }}>{t.v}</b>
                </span>
              ))}
              <span style={{ marginTop: "auto", borderTop: "1px solid var(--fk-surface)", paddingTop: 11, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span style={mono(9.5, "0.14em")}>Maintenance</span>
                <b style={{ ...cond("30px"), letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>2,214</b>
              </span>
            </>
          ), "TDEE calculator", "No account, no email. Work out your numbers before you decide anything, and keep them if you never order.")}
        </div>

        <div style={{ ...sub(), marginTop: "clamp(38px,4.6vw,64px)" }}><span>Where we plug in</span></div>
        <div className={c("v2-shelf")} style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)", borderTop: 0 }}>
          {LOGOS.map((l) => (
            <span key={l.id} className={c("v2-slotwrap")} style={{ position: "relative", height: 96, background: "var(--fk-paper)", display: "block" }}><ImageSlot placeholder={l.ph} /></span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════ FAQ ══ */
export function FaqSection({
  faqList, faqs, faqCat, setFaqCat, faqQuery, setFaqQuery, faqOpen, setFaqOpen, openAi, waHref, wrap, rule, h2, deck,
}: {
  faqList: Faq[]; faqs: Faq[]; faqCat: string; setFaqCat: (v: string) => void;
  faqQuery: string; setFaqQuery: (v: string) => void; faqOpen: number; setFaqOpen: (n: number) => void;
  openAi: () => void; waHref: string; wrap: Wrap; rule: CSSProperties; h2: H2; deck: CSSProperties;
}) {
  return (
    <section aria-labelledby="v2-faq-h" style={{ padding: "clamp(56px,7vw,104px) 0", background: "var(--fk-surface)", borderTop: "1px solid var(--fk-line)" }}>
      <div style={wrap}>
        <div aria-hidden="true" style={rule} />
        <div className={c("v2-split")} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)", gap: "clamp(24px,4vw,56px)", alignItems: "end" }}>
          <h2 id="v2-faq-h" className={c("v2-rise")} style={h2("14ch")}>The questions you were going to ask</h2>
          <p className={c("v2-rise")} style={{ ...deck, maxWidth: "46ch" }}>Search them, filter them, or ask the coach anything that is not here. Answers open in place, with the page they came from.</p>
        </div>

        <div className={c("v2-faq")} style={{ display: "grid", gridTemplateColumns: "288px minmax(0,1fr)", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)", marginTop: "clamp(30px,4vw,52px)" }}>
          <div style={{ background: "var(--fk-warm)", padding: "clamp(18px,2.2vw,26px)", display: "flex", flexDirection: "column", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 9, border: "1px solid var(--fk-line)", background: "var(--fk-paper)", padding: "0 12px", minHeight: 48 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--fk-green)" strokeWidth="2.4" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" /></svg>
              <input type="search" value={faqQuery} onChange={(e) => { setFaqQuery(e.currentTarget.value); setFaqOpen(-1); }} placeholder="Search the questions" aria-label="Search the questions" style={{ flex: 1, minWidth: 0, minHeight: 44, background: "transparent", border: 0, outline: "none", color: "var(--fk-ink)", fontFamily: SANS, fontSize: 16, letterSpacing: "0" }} />
            </label>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {FAQ_CATS.map(([id, lab]) => {
                const on = faqCat === id;
                const n = id === "all" ? faqs.length : faqs.filter((f) => f.cat === id).length;
                return (
                  <button key={id} type="button" onClick={() => { setFaqCat(id); setFaqOpen(-1); }} className={c("v2-row")}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, width: "100%", cursor: "pointer", background: on ? "var(--fk-warm)" : "transparent", border: 0, borderBottom: "1px solid var(--fk-warm)", borderLeft: `2px solid ${on ? "var(--fk-green)" : "transparent"}`, padding: "13px 12px", minHeight: 48, textAlign: "left", ...mono(11.5, "0.1em", on ? "var(--fk-ink)" : "var(--fk-ink-2)") }}>
                    {lab}<b style={{ fontWeight: 400, color: on ? "var(--fk-green)" : "var(--fk-ink-3)" }}>{n}</b>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: "auto", border: "1px solid var(--fk-line)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <b style={cond("20px")}>Not answered here?</b>
              <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: "var(--fk-ink-2)", margin: 0 }}>The coach answers from your own numbers. A human reads WhatsApp until 9pm.</p>
              <button type="button" onClick={openAi} className={c("v2-btn")} style={{ cursor: "pointer", background: "var(--fk-green)", border: 0, color: "var(--fk-paper)", fontFamily: COND, fontWeight: 600, fontSize: 13, letterSpacing: "0", textTransform: "none", padding: "0 16px", minHeight: 46 }}><span>Ask the coach</span></button>
              <a href={waHref} target="_blank" rel="noopener noreferrer" className={c("v2-ghost")} style={{ display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--fk-line)", color: "var(--fk-ink)", fontFamily: COND, fontWeight: 600, fontSize: 13, letterSpacing: "0", textTransform: "none", minHeight: 46 }}>WhatsApp</a>
            </div>
          </div>

          <div style={{ background: "var(--fk-paper)" }}>
            {faqList.map((f) => {
              const i = faqs.indexOf(f);
              const open = faqOpen === i;
              return (
                <div key={f.q} style={{ borderBottom: "1px solid var(--fk-line)", background: open ? "var(--fk-warm)" : "transparent" }}>
                  <button type="button" onClick={() => setFaqOpen(open ? -1 : i)} aria-expanded={open}
                    style={{ width: "100%", display: "grid", gridTemplateColumns: "minmax(0,1fr) 30px", gap: 14, alignItems: "center", textAlign: "left", cursor: "pointer", background: "transparent", border: 0, borderLeft: `2px solid ${open ? "var(--fk-green)" : "transparent"}`, padding: "20px clamp(16px,2vw,24px)", minHeight: 56 }}>
                    <span style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                      <span style={mono(9.5, "0.18em", open ? "var(--fk-green)" : "var(--fk-ink-3)")}>{FAQ_LABEL[f.cat]}</span>
                      <span style={{ ...cond("clamp(1.1rem,1.9vw,1.45rem)", 800, open ? "var(--fk-ink)" : "var(--fk-ink-2)"), lineHeight: 1.05, letterSpacing: "-0.01em" }}>{f.q}</span>
                    </span>
                    <span aria-hidden="true" style={{ justifySelf: "end", fontFamily: SANS, fontSize: 20, lineHeight: 1, color: "var(--fk-green)", transform: `rotate(${open ? "45deg" : "0deg"})`, transition: "transform .3s cubic-bezier(.16,1,.3,1)" }}>+</span>
                  </button>
                  <div style={{ display: open ? "block" : "none", padding: "0 clamp(16px,2vw,24px) 24px", borderLeft: `2px solid ${open ? "var(--fk-green)" : "transparent"}` }}>
                    <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.68, color: "var(--fk-ink-2)", margin: 0, maxWidth: "70ch" }}>{f.a}</p>
                    <span style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                      {f.chips.map((ch) => (<span key={ch} style={{ ...mono(10, "0.12em", "var(--fk-green)"), border: "1px solid var(--fk-line)", padding: "7px 9px" }}>{ch}</span>))}
                    </span>
                  </div>
                </div>
              );
            })}
            {faqList.length === 0 && (
              <div style={{ padding: "clamp(26px,3vw,40px)", display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
                <b style={cond("24px")}>Nothing matches that</b>
                <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: "var(--fk-ink-2)", margin: 0, maxWidth: "46ch" }}>Ask it in your own words instead. The coach reads the same pages these answers came from.</p>
                <button type="button" onClick={openAi} className={c("v2-ghost")} style={{ cursor: "pointer", background: "transparent", border: "1px solid var(--fk-line)", color: "var(--fk-ink)", fontFamily: SANS, fontSize: 12, letterSpacing: "0", textTransform: "none", padding: "0 16px", minHeight: 46 }}>Ask the coach</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════ FOOTER ══ */
export function SiteFooter({ licence }: { licence: string }) {
  return (
    <footer style={{ background: "var(--fk-surface)", borderTop: "1px solid var(--fk-warm)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(44px,6vw,72px) clamp(18px,4vw,40px) 40px" }}>
        <div className={c("v2-g4")} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: "clamp(26px,4vw,44px)" }}>
          <div>
            <a href="#v2-top" style={{ display: "inline-flex", alignItems: "center", gap: 11, minHeight: 44, marginBottom: 18 }}>
              <span style={{ width: 32, height: 32, border: "1px solid var(--fk-line)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 24 24" width="17" height="17" fill="var(--fk-ink)" stroke="var(--fk-ink)" strokeWidth="2" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              </span>
              <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.03em", color: "var(--fk-ink)" }}>FitFuel</span>
            </a>
            <p style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.72, color: "var(--fk-ink-3)", margin: "0 0 20px", maxWidth: "38ch" }}>The only health coach that controls the plate. Chef-cooked, condition-specific meals delivered daily in Pune. Verified intake, not self-reported.</p>
            <p style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0", color: "var(--fk-ink-3)", margin: "0 0 10px" }}>FSSAI {licence} · Kharadi, Pune</p>
            <p style={{ fontFamily: SANS, fontSize: 12.5, lineHeight: 1.6, color: "var(--fk-ink-3)", margin: 0, maxWidth: "44ch" }}>Food photographs are illustrative and include stock and AI-generated imagery. Dish names, macros, ingredients and prices are real.</p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.head}>
              <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0", textTransform: "none", color: "var(--fk-ink)", marginBottom: 18 }}>{col.head}</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {col.links.map(([href, l]) => (
                  <Link key={href} href={href} style={{ fontFamily: SANS, fontSize: 13.5, color: "var(--fk-ink-3)", minHeight: 44, display: "flex", alignItems: "center" }}>{l}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "clamp(30px,4vw,52px)", paddingTop: 26, borderTop: "1px solid var(--fk-warm)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <p style={{ fontFamily: SANS, fontSize: 12, color: "var(--fk-ink-3)", margin: 0 }}>© 2026 FitFuel · GST 5% applicable on all meal plans</p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {LEGAL.map(([href, l]) => (
              <Link key={href} href={href} style={{ fontFamily: SANS, fontSize: 12, color: "var(--fk-ink-3)", minHeight: 44, display: "inline-flex", alignItems: "center" }}>{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═════════════════════════════════════════════════════════ AI DOCK ══ */
export function AiDock({
  open, toggle, chat, draft, setDraft, ask,
}: {
  open: boolean; toggle: () => void; chat: { who: string; text: string }[];
  draft: string; setDraft: (v: string) => void; ask: (q: string) => void;
}) {
  return (
    <div style={{ position: "fixed", right: "clamp(12px,3vw,28px)", bottom: "clamp(86px,10vw,104px)", zIndex: 61, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
      <div role="dialog" aria-label="Ask the FitFuel coach" style={{ display: open ? "flex" : "none", flexDirection: "column", maxHeight: "calc(100vh - 180px)", width: "min(360px,calc(100vw - 28px))", background: "var(--fk-paper)", border: "1px solid var(--fk-line-2)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--fk-line)" }}>
          <span style={{ position: "relative", width: 8, height: 8, background: "var(--fk-green)", flex: "none" }}>
            <span aria-hidden="true" className={c("v2-loop", "aPulse24")} style={{ position: "absolute", inset: 0, background: "var(--fk-green)" }} />
          </span>
          <span style={mono(10.5, "0.18em", "var(--fk-ink)")}>FitFuel Coach</span>
          <button type="button" onClick={toggle} aria-label="Close the coach" style={{ marginLeft: "auto", cursor: "pointer", background: "transparent", border: 0, color: "var(--fk-ink-3)", fontFamily: SANS, fontSize: 16, lineHeight: 1, padding: 8, minHeight: 44 }}>×</button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {chat.map((m, i) => {
            const you = m.who === "you";
            return (
              <div key={i} style={{ alignSelf: you ? "flex-end" : "flex-start", maxWidth: "88%", background: you ? "var(--fk-warm)" : "var(--fk-paper)", borderLeft: `2px solid ${you ? "var(--fk-ink-3)" : "var(--fk-green)"}`, padding: "11px 13px" }}>
                <span style={{ display: "block", ...mono(9, "0.18em", you ? "var(--fk-ink-3)" : "var(--fk-green)"), marginBottom: 6 }}>{you ? "You" : "Coach"}</span>
                <p style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.55, color: you ? "var(--fk-ink-2)" : "var(--fk-ink)", margin: 0 }}>{m.text}</p>
              </div>
            );
          })}
        </div>
        <div style={{ flex: "none", display: "flex", flexWrap: "wrap", gap: 7, padding: "0 16px 12px" }}>
          {PROMPTS.map((q) => (
            <button key={q} type="button" onClick={() => ask(q)} className={c("v2-ghost")} style={{ cursor: "pointer", background: "transparent", border: "1px solid var(--fk-line)", color: "var(--fk-ink-2)", fontFamily: SANS, fontSize: 12, letterSpacing: "0", padding: "8px 9px", minHeight: 44 }}>{q}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); ask(draft); }} style={{ flex: "none", display: "flex", gap: 1, background: "var(--fk-line)", borderTop: "1px solid var(--fk-line)" }}>
          <input type="text" value={draft} onChange={(e) => setDraft(e.currentTarget.value)} placeholder="Ask anything about your plan" aria-label="Ask the FitFuel coach" style={{ flex: 1, minWidth: 0, background: "var(--fk-paper)", border: 0, padding: "13px 16px", color: "var(--fk-ink)", fontFamily: SANS, fontSize: 13.5, minHeight: 48, outline: "none" }} />
          <button type="submit" style={{ cursor: "pointer", background: "var(--fk-green)", border: 0, color: "var(--fk-paper)", fontFamily: COND, fontWeight: 600, fontSize: 13, letterSpacing: "0", textTransform: "none", padding: "0 16px", minHeight: 48 }}>Ask</button>
        </form>
        <p style={{ flex: "none", ...mono(9, "0.14em", "var(--fk-ink-3)"), margin: 0, padding: "10px 16px", borderTop: "1px solid var(--fk-line)" }}>Front end ready · model not yet connected</p>
      </div>

      <button type="button" onClick={toggle} aria-expanded={open} className={c("v2-fab")} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", background: "var(--fk-green)", border: 0, color: "var(--fk-paper)", fontFamily: COND, fontWeight: 600, fontSize: 14, letterSpacing: "0", textTransform: "none", padding: "0 18px", height: 52 }}>
        <span aria-hidden="true" style={{ position: "absolute", inset: 0, border: "1px solid var(--fk-green)", pointerEvents: "none" }} className={c("v2-loop")} />
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" /><path d="M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z" />
        </svg>
        {open ? "Close" : "Ask the coach"}
      </button>
    </div>
  );
}
