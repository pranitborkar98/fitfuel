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
import { CoachSection, ChecksSection, CoverageSection, AiDock } from "@/app/_hp/v2/Sections";
import {
  FLOOR, GOAL_RATE, KCAL_PER_KG, MAX_SWING, PUNE_PLACES, TARGET, WEIGH_INS,
  replyFor,
} from "@/app/_hp/v2/data";

const MONO = "var(--font-mono), monospace";
const COND = "var(--ff-cond), sans-serif";
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

export default function V2Sections({ licence }: { licence: string }) {
  const [aiOpen, setAiOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [chat, setChat] = useState<Msg[]>(OPENING);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // The barcode ChecksSection stamps its licence panel with. Same generator
  // Home calls, not a second derivation that would drift from it.
  const barcode = useMemo(() => barcodeBars(), []);

  const h2 = (max: string) => ({
    fontFamily: COND, fontWeight: 900, fontSize: "clamp(2.4rem,6.6vw,5.4rem)", lineHeight: 0.82,
    letterSpacing: "-0.03em", textTransform: "uppercase" as const, color: "#f7f7f5", margin: 0, maxWidth: max,
  });
  const deck = { fontFamily: SANS, fontSize: 16.5, lineHeight: 1.62, color: "#9a9a94", margin: 0, maxWidth: "48ch" };
  const WRAP = { width: "100%", maxWidth: 1240, margin: "0 auto", padding: "0 clamp(18px,4vw,40px)" } as const;
  const RULE = { height: 1, background: "#232320", margin: "14px 0 clamp(26px,4vw,44px)" } as const;

  return (
    <>
      <CoachSection
        chat={chat} thinking={thinking} draft={draft} setDraft={setDraft} ask={ask}
        engine={{ plateau, actualRate, raw, capped, capBit, proposed, floorBit, sign }}
        wrap={WRAP} rule={RULE} h2={h2} deck={deck}
      />

      <ChecksSection barcode={barcode} licence={licence} wrap={WRAP} rule={RULE} h2={h2} deck={deck} />

      <CoverageSection map={map} wrap={WRAP} rule={RULE} h2={h2} deck={deck} />

      {/* The dock is fixed-position and sits above the storefront's own bottom
          tab bar, which is why its offset is clamped to 86px and not 0. */}
      <AiDock
        open={aiOpen} toggle={() => setAiOpen((v) => !v)} chat={chat} draft={draft} setDraft={setDraft} ask={ask}
      />
    </>
  );
}

export { MONO };
