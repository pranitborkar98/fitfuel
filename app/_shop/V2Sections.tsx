"use client";

// app/_shop/V2Sections.tsx
//
// The parts of the v2 homepage the storefront was missing, mounted into it.
//
// WHAT THIS FIXES. app/_hp/v2/Home.tsx and Sections.tsx are ~1,900 lines of
// finished, working homepage: the AI coach console with its arithmetic shown,
// the Pune coverage map, the four checks, the nine products. cfdf494 replaced
// the v2 page with the storefront and nothing imported those sections again, so
// they have sat on disk, compiling, rendering nowhere. The storefront sells the
// food well and then argues the moat in seven blocks of static prose, which is
// the thinnest possible version of the thing v2 already demonstrates live.
//
// So this is NOT a revert to v2. The storefront stays the page: trial day,
// aisles, dishes, basket, plans, corporate, digital. These sections are appended
// where its static moat prose used to do all the work, so the page still sells
// first and only then argues, which was the point of the swap.
//
// The v2 sections are presentational and take their state by prop, exactly as
// Home.tsx passes it. This component owns that state and nothing else, so the
// coach behaves here identically to the prototype rather than being a second
// implementation that drifts.

import { useMemo, useRef, useState } from "react";

import { PuneMap, barcodeBars } from "@/app/_hp/v2/graphics";
import {
  CoachSection, ChecksSection, CoverageSection, AiDock,
  FinderSection, PriceSection, FilmSection, MoreSection, FaqSection,
} from "@/app/_hp/v2/Sections";
import {
  ACTS, DIETS, DOORS, DURATIONS, FALLBACK_COUPONS, FAQS, FLOOR, GOAL_ADJ as ADJ,
  GOAL_RATE, KCAL_PER_KG, MAX_SWING, PUNE_PLACES, SLOTS, TARGET, WEIGH_INS,
  decompose, replyFor,
} from "@/app/_hp/v2/data";

const MONO = "var(--font-mono), monospace";
const COND = "var(--fk-display), Georgia, serif";
const SANS = "var(--font-archivo), sans-serif";

type Msg = { who: string; text: string; figures?: string[] };

/** The opening exchange, as the prototype ships it. It is a worked example
 *  rather than a greeting: the whole claim of the section is that the coach
 *  shows its arithmetic, so the first thing on screen has to be arithmetic. */
const OPENING: Msg[] = [
  { who: "you", text: "I have not lost anything for two weeks. Am I doing something wrong?" },
  {
    who: "coach",
    text: "No. Four weigh-ins say 78.4, 78.2, 78.3, 78.2 kg, so your actual rate is 0.05 kg a week against the 0.50 your goal needs. Through 7,700 kcal per kg that gap is 495 kcal a day, which the ±300 cap holds at 300. Your target moves from 1,800 to 1,690 kcal if you accept it.",
    figures: ["−0.45 kg/wk gap", "cap: ±300 kcal", "1,800 → 1,690"],
  },
];

/** Only the shape the finder reads. Kept structural rather than importing
 *  ShopDay so this file does not couple the v2 sections to the storefront's
 *  own types, which change for storefront reasons. */
type DayLike = { dishes: { kcal: number }[] };

export default function V2Sections({
  licence,
  waHref,
  days,
}: {
  licence: string;
  waHref: string;
  days: DayLike[];
}) {
  const [aiOpen, setAiOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [chat, setChat] = useState<Msg[]>(OPENING);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The finder, the price builder, the day drum and the FAQ each own a slice
  // of state, exactly as Home.tsx holds it. Same initial values, so the
  // sections open on the same frame the prototype opens on.
  const [door, setDoor] = useState(0);
  const [dur, setDur] = useState(0);
  const [sex, setSex] = useState("m");
  const [wt, setWt] = useState(78);
  const [ht, setHt] = useState(174);
  const [age, setAge] = useState(31);
  const [act, setAct] = useState(2);
  const [diet, setDiet] = useState(0);
  const [hour, setHour] = useState(0);
  const [faqCat, setFaqCat] = useState("all");
  const [faqQuery, setFaqQuery] = useState("");
  const [faqOpen, setFaqOpen] = useState(0);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const ask = (q: string) => {
    const question = String(q || "").trim();
    if (!question) return;
    const a = replyFor(question);
    setChat((prev) => prev.concat([{ who: "you", text: question }]));
    setDraft("");
    setThinking(true);
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      setChat((prev) => prev.concat([{ who: "coach", text: a.text, figures: a.figures }]));
      setThinking(false);
    }, 850);
  };

  // The engine, run on the same fortnight of weigh-ins the prototype uses. The
  // constant, the cap and the floor are imported rather than restated, so a
  // change to the real policy moves this section with it.
  const w = WEIGH_INS;
  const actualRate = (w[1]! - w[3]!) / 2;
  const plateau = Math.abs(w[1]! - w[3]!) < 0.5;
  const raw = Math.round(((GOAL_RATE - actualRate) * KCAL_PER_KG) / 7);
  const capped = Math.max(-MAX_SWING, Math.min(MAX_SWING, raw));
  const capBit = Math.abs(raw) > MAX_SWING;
  const proposed = Math.max(FLOOR, Math.round(TARGET - capped));
  const floorBit = Math.round(TARGET - capped) < FLOOR;
  const sign = (n: number) => (n > 0 ? "−" : "+") + Math.abs(n);

  const map = useMemo(() => <PuneMap places={PUNE_PLACES} />, []);

  /* ── the price builder ── */
  const [dName, dCount, dSub, dBlurb] = DURATIONS[dur]!;
  const p = decompose(dSub, dCount);

  /* ── the finder ── */
  const activeDoor = DOORS[door]!;
  const plan = useMemo(() => {
    const bmr = Math.round(10 * wt + 6.25 * ht - 5 * age + (sex === "m" ? 5 : -161));
    const mult = ACTS[act]![1];
    const tdee = Math.round(bmr * mult);
    const adj = ADJ[door] ?? 0;
    const swing = Math.round(tdee * adj);
    const rawT = tdee + swing;
    const target = Math.max(FLOOR, Math.round(rawT / 10) * 10);
    const kpg: Record<string, number> = { Protein: 4, Carbohydrate: 4, Fat: 9 };
    const shares = days[0]!.dishes.map((d) => d.kcal);
    const shareSum = shares.reduce((a, b) => a + b, 0) || 1;
    return {
      accent: activeDoor.accent,
      name: activeDoor.goal + " (" + DIETS[diet] + ")",
      matches: activeDoor.count,
      target: target.toLocaleString("en-IN"),
      rate: adj < 0 ? "a held deficit" : adj > 0 ? "a finishable surplus" : "maintenance",
      macros: activeDoor.split.map(([name, v, pct, color]) => ({
        name, v, color, pct, g: Math.round((target * pct) / 100 / (kpg[name] || 4)),
      })),
      ledger: [
        { k: "Resting energy, Mifflin St Jeor", v: bmr.toLocaleString("en-IN") + " kcal", fg: "var(--fk-ink-2)", vfg: "var(--fk-ink)" },
        { k: ACTS[act]![0] + " week, × " + mult.toFixed(3), v: tdee.toLocaleString("en-IN") + " kcal", fg: "var(--fk-ink-2)", vfg: "var(--fk-ink)" },
        {
          k: adj === 0 ? "No goal adjustment on maintenance" : (adj < 0 ? "Deficit for " + activeDoor.goal.toLowerCase() : "Surplus for " + activeDoor.goal.toLowerCase()) + ", " + Math.round(Math.abs(adj) * 100) + "%",
          v: (swing > 0 ? "+" : swing < 0 ? "−" : "") + Math.abs(swing).toLocaleString("en-IN") + " kcal",
          fg: "var(--fk-ink-2)", vfg: swing === 0 ? "var(--fk-ink-3)" : activeDoor.accent,
        },
        { k: rawT < FLOOR ? "Held at the 1,200 kcal floor" : "Above the 1,200 kcal floor", v: rawT < FLOOR ? "floor applied" : "no floor needed", fg: "var(--fk-ink-3)", vfg: rawT < FLOOR ? "var(--fk-warn)" : "var(--fk-ink-3)" },
        { k: "Your target, rounded to ten", v: target.toLocaleString("en-IN") + " kcal", fg: "var(--fk-ink)", vfg: activeDoor.accent },
      ],
      meals: SLOTS.map((name, i) => ({
        name, share: shares[i] ?? 0,
        kcal: Math.round((target * (shares[i] ?? 0)) / shareSum),
        bg: ["#e6f0e8", "#cfe4d5", "#a9cfb6", "#7fb694"][i]!, fg: "var(--fk-ink)",
      })),
    };
  }, [wt, ht, age, sex, act, door, diet, activeDoor, days]);

  /* ── the faq ── */
  const faqQ = faqQuery.trim().toLowerCase();
  const faqList = FAQS.filter(
    (f) => (faqCat === "all" || f.cat === faqCat) && (!faqQ || (f.q + " " + f.a).toLowerCase().includes(faqQ)),
  );

  // The barcode ChecksSection stamps its licence panel with. Same generator
  // Home calls, not a second derivation that would drift from it.
  const barcode = useMemo(() => barcodeBars(), []);

  const h2 = (max: string) => ({
    fontFamily: COND, fontWeight: 600, fontSize: "clamp(2.4rem,6.6vw,5.4rem)", lineHeight: 1.06,
    letterSpacing: "-0.03em", textTransform: "none" as const, color: "var(--fk-ink)", margin: 0, maxWidth: max,
  });
  const deck = { fontFamily: SANS, fontSize: 16.5, lineHeight: 1.62, color: "var(--fk-ink-2)", margin: 0, maxWidth: "48ch" };
  const WRAP = { width: "100%", maxWidth: 1240, margin: "0 auto", padding: "0 clamp(18px,4vw,40px)" } as const;
  const RULE = { height: 1, background: "var(--fk-line)", margin: "14px 0 clamp(26px,4vw,44px)" } as const;

  return (
    <>
      {/* The finder answers "which plan is mine" with arithmetic rather than a
          quiz, and the price builder shows the invoice decomposed. Both were
          the reason v2 existed and neither has been on the site since cfdf494. */}
      <FinderSection
        doors={DOORS} door={door} setDoor={setDoor} plan={plan} activeDoor={activeDoor}
        sex={sex} setSex={setSex} wt={wt} setWt={setWt} ht={ht} setHt={setHt}
        age={age} setAge={setAge} act={act} setAct={setAct} diet={diet} setDiet={setDiet}
        wrap={WRAP} rule={RULE} h2={h2} deck={deck}
      />

      <PriceSection
        durations={DURATIONS} dur={dur} setDur={setDur} p={p}
        dName={dName} dCount={dCount} dBlurb={dBlurb} coupons={FALLBACK_COUPONS}
        wrap={WRAP} rule={RULE} h2={h2} deck={deck}
      />

      <FilmSection hour={hour} setHour={setHour} stageRef={stageRef} wrap={WRAP} rule={RULE} deck={deck} />

      <CoachSection
        chat={chat} thinking={thinking} draft={draft} setDraft={setDraft} ask={ask}
        engine={{ plateau, actualRate, raw, capped, capBit, proposed, floorBit, sign }}
        wrap={WRAP} rule={RULE} h2={h2} deck={deck}
      />

      <ChecksSection barcode={barcode} licence={licence} wrap={WRAP} rule={RULE} h2={h2} deck={deck} />

      <CoverageSection map={map} wrap={WRAP} rule={RULE} h2={h2} deck={deck} />

      {/* The nine products: the diary, training, supplements, corporate. This
          is the section carrying the gym and partnership photography, and the
          only one on the page today that has real images behind it. */}
      <MoreSection wrap={WRAP} rule={RULE} h2={h2} deck={deck} />

      <FaqSection
        faqList={faqList} faqs={FAQS} faqCat={faqCat} setFaqCat={setFaqCat} faqQuery={faqQuery}
        setFaqQuery={setFaqQuery} faqOpen={faqOpen} setFaqOpen={setFaqOpen}
        openAi={() => setAiOpen(true)} waHref={waHref}
        wrap={WRAP} rule={RULE} h2={h2} deck={deck}
      />

      {/* The dock is fixed-position and sits above the storefront's own bottom
          tab bar, which is why its offset is clamped to 86px and not 0. */}
      <AiDock
        open={aiOpen} toggle={() => setAiOpen((v) => !v)} chat={chat} draft={draft} setDraft={setDraft} ask={ask}
      />
    </>
  );
}

export { MONO };
