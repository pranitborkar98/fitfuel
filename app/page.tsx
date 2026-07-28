import type { Metadata } from "next";

import StructuredData from "@/components/StructuredData";
import s from "./_hp/hp.module.css";
import Hero from "./_hp/Hero";
import Ticker from "./_hp/Ticker";
import Day from "./_hp/Day";
import TrialDay from "./_hp/TrialDay";
import Week from "./_hp/Week";
import Areas from "./_hp/Areas";
import Wedge from "./_hp/Wedge";
import Conditions from "./_hp/Conditions";
import Loop from "./_hp/Loop";
import Coach from "./_hp/Coach";
import Inside from "./_hp/Inside";
import Supplements from "./_hp/Supplements";
import Corporate from "./_hp/Corporate";
import Network from "./_hp/Network";
import Offers from "./_hp/Offers";
import Proof from "./_hp/Proof";
import Faq from "./_hp/Faq";
import Close from "./_hp/Close";
import { BG, INK } from "./_hp/theme";

/* ══════════════════════════════════════════════════════════════════════
   FITFUEL HOMEPAGE

   THE PROBLEM THIS SOLVES. Two failure modes, alternating, for months. The
   encyclopedia version reached 39,708px — 55 viewports, 35 sections, 35 <h2>s,
   because every system that shipped got a section on the day it shipped. The
   correction cut it to ten sections and dropped half the business: coupons,
   corporate, the affiliate, the partner network and every dashboard screen
   became a link in a footer. Neither version was the whole company.

   The resolution is not a length. It is a DEVICE. Every section opens with one
   label and a full-width hairline — COOKED FOR A DIAGNOSIS ──────── — so
   seventeen sections read as one document instead of seventeen landing pages
   stapled together, and structure varies from block to block (tables, a film,
   directory rows, chips, a receipt) so nothing repeats the kicker → headline →
   three-cards rhythm that made the old page feel infinite.

   ANNOTATION IS RATIONED, and this was a correction mid-build. The first pass
   of this rebuild gave every section a bracketed serial number and a right-hand
   caption, and hung a mono unit-label under every figure. The owner has already
   rejected exactly that pattern by name as reading machine-generated. So: one
   mono label per section, and inside a section mono appears only where it is
   labelling a real measured value that is ambiguous without it — meal slots,
   macro names, receipt lines, coupon terms. Everything else that was a caption
   is now a sentence or a heading.

   THE VISUAL RESET. The previous pass was rounded cards, 999px pills, radial
   glow blooms, coloured shadows and backdrop-blur glass. That list is, item for
   item, the "reject on sight" list in DESIGN.md, and it is also the house style
   of every dark SaaS landing page built between 2022 and 2025. The 2026
   direction is the opposite and it happens to be what DESIGN.md locked months
   ago: square corners, 1px hairlines as the only structural device, generated
   film grain instead of faked depth, viewport-scaled kinetic type carrying the
   page instead of a hero image, and every number set in mono. See _hp/theme.ts.

   EVERYTHING IS FROM THE DATABASE OR FROM lib/. The trial day and the week are
   PlanScheduleSlot joined to Recipe. The coupons are the Coupon table filtered
   by the same validity rules checkout applies, so an expired code cannot sit
   here looking live. The receipt is decomposePrice(). The supplement counts are
   SupplementCategory. The quotes are Testimonial, the questions are Faq. The
   consistency weights and the 7700 / ±300 / 1200 constants are read off
   lib/consistency-score.ts and lib/coach/recalibration.ts. Nothing on this page
   is a number someone typed into a marketing document.

   ORDER, and why:
     Hero        what it is, where, what it costs, plus the licence
     Ticker      the scale of it, scrubbed by your own scroll
     Day         the story and the mission, as one day moving sideways
     TrialDay    day one's real dishes. The trial is the unit you can buy
     Week        SEVEN days, not thirty. A week is what a person plans against
     Areas       "do you deliver to me", answered before the pitch continues
     Wedge       tiffin vs app vs supplement brand vs us, as an auditable table
     Conditions  70 of 126 plans. The thing nobody can copy quickly
     Loop        eat, train, measure, adjust, with the score's maths published
     Coach       the engine, and the constants behind every adjustment
     Inside      ten dashboard screens that come with the food
     Supplements 46 researched, bought at Nutrabay, affiliation stated in-section
     Corporate   the second revenue line, with an honest placeholder logo wall
     Network     eight partner types and what each one earns
     Offers      the receipt, the strike-through, and codes that work today
     Proof       testimonials, from the table
     Faq         objections, from the table
     Close       the ask, then a directory of the entire site

   The four other audiences (corporate, partners, operators, digital) now have
   real sections rather than a link each, and the whole site is reachable from
   the directory in Close.
══════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    /* 68px reserves the fixed 69px <header> from app/layout.tsx, which is
       position:fixed and would otherwise sit on top of the hero. minHeight
       keeps the page background covering the viewport on short pages.
       overflowX:clip contains the film's horizontal track. */
    <div style={{ background: BG, color: INK, paddingTop: 68, minHeight: "100vh", overflowX: "clip" }}>
      {/* Fixed grain over the whole page: one generated texture, no requests. */}
      <div className={s.grain} aria-hidden="true" />

      <StructuredData />

      <Hero />
      <Ticker />
      <Day />
      <TrialDay />
      <Week />
      <Areas />
      <Wedge />
      <Conditions />
      <Loop />
      <Coach />
      <Inside />
      <Supplements />
      <Corporate />
      <Network />
      <Offers />
      <Proof />
      <Faq />
      <Close />
    </div>
  );
}
