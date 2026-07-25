import type { Metadata } from "next";

import StructuredData from "@/components/StructuredData";
import Hero from "./_hp/Hero";
import Facts from "./_hp/Facts";
import Today from "./_hp/Today";
import Wedge from "./_hp/Wedge";
import Conditions from "./_hp/Conditions";
import System from "./_hp/System";
import Areas from "./_hp/Areas";
import Cost from "./_hp/Cost";
import Faq from "./_hp/Faq";
import Close from "./_hp/Close";
import { PAPER, INK } from "./_hp/theme";

/* ══════════════════════════════════════════════════════════════════
   FITFUEL HOMEPAGE — rebuilt.

   The previous version measured 39,708px tall: 55 viewports, 4,303 words,
   35 <section>s, 35 <h2>s and 118 links, with /plans, /how-it-works and
   /partners each appearing ten times. It had become an index of the backend
   rather than an argument for buying, because every system that shipped got
   a section on the day it shipped.

   This is ten sections making ONE argument to ONE reader: the person in east
   Pune deciding what to eat tomorrow. Everything cut still exists — the old
   composition is at app/_home/page.old.tsx.bak and every _home component is
   untouched on disk — and the four other audiences (partners, franchise,
   corporate, digital) keep a door in Close.tsx pointing at the pages they
   already have.

   Order is deliberate:
     1  Hero        what it is, where, what it costs
     2  Facts       four checkable numbers, licence included
     3  Today       REAL day-one dishes from the DB. The proof, moved to the top.
     4  Wedge       why one system beats a tiffin + an app + a supplement brand
     5  Conditions  70 of 126 plans — the thing nobody can copy quickly
     6  System      six old sections compressed into one: eat, train, measure, adjust
     7  Areas       "do you deliver to me", answered before the pitch continues
     8  Cost        the receipt, no invented prices
     9  Faq         objections, from the DB
    10  Close       doors for everyone else, then the ask

   Visual system in ./_hp/theme.ts — paper and ink instead of near-black and
   acid lime, and display type in SENTENCE CASE so a hierarchy can exist.
══════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    /* 68px reserves the fixed 69px <header> from app/layout.tsx, which is
       position:fixed and would otherwise sit on top of the hero. minHeight
       keeps the paper background covering the viewport on short pages. */
    <div style={{ background: PAPER, color: INK, paddingTop: 68, minHeight: "100vh" }}>
      <StructuredData />
      <Hero />
      <Facts />
      <Today />
      <Wedge />
      <Conditions />
      <System />
      <Areas />
      <Cost />
      <Faq />
      <Close />
    </div>
  );
}
