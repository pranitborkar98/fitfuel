import type { Metadata } from "next";

import StructuredData from "@/components/StructuredData";
import s from "./_hp/hp.module.css";
import Hero from "./_hp/Hero";
import Readout from "./_hp/Readout";
import Counts from "./_hp/Counts";
import TrialDay from "./_hp/TrialDay";
import Week from "./_hp/Week";
import Pick from "./_hp/Pick";
import Offers from "./_hp/Offers";
import Day from "./_hp/Day";
import Coach from "./_hp/Coach";
import Why from "./_hp/Why";
import Areas from "./_hp/Areas";
import More from "./_hp/More";
import Faq from "./_hp/Faq";
import Close from "./_hp/Close";
import OrderBar from "./_hp/OrderBar";
import { BG, INK } from "./_hp/theme";

/* ══════════════════════════════════════════════════════════════════════
   FITFUEL HOMEPAGE — the Claude Design v2 structure, on real data.

   WHAT THIS IS. design/FitFuel Homepage v2.dc.html, implemented. That file
   is the third round of a design that has been through two written reviews
   in this repo (DESIGN-FEEDBACK-HOMEPAGE-V2.md, DESIGN-PROMPT-HOMEPAGE-V3.md),
   and this page is its geometry wired to Postgres.

   WHAT CHANGED FROM THE PREVIOUS HOMEPAGE. Not the palette and not the
   corner radius. The shape:

     WELDED, NOT STACKED. The readout bar has no top gap against the hero
       and runs to both viewport edges, and the counts strip does the same
       under it. Three sections now break the alternating-band rhythm that
       feedback §2.8 called out as twelve identical containers in a row.
     INSTRUMENTS, NOT STAT TILES. Every figure that used to be a number and
       a caption now carries the thing that proves it: the delivery day as a
       24h rule, the receipt as a stacked bar, the coverage as a plotted map,
       the licence as its own digits.
     ONE INTERACTION EARNED, THREE REFUSED. Feedback §5 said pick one and
       cut the rest. The week picker is the one, because it shows the real
       data the customer is buying. The finder and the price builder survived
       too — both run the SHIPPED functions (lib/tdee, decomposePrice)
       against real rows rather than demonstrating an idea.

   FOUR THINGS IN THE PROTOTYPE ARE DELIBERATELY NOT HERE. Each was rejected
   by name in round 2, and each came back when round 3 was applied:

     the 3D drum       perspective + a 6s auto-advance, on the film section.
                       Flat frame switcher instead, same seven beats.
     the chat console  an input box with no model behind it. Coach.tsx keeps
                       the console shape and loses the dead half.
     twelve infinite   v2Pulse and v2Spin were deleted by name in §2.5.
       animations      Motion here is one reveal and one meter, both
                       scroll-driven, both dead under reduced-motion.
     nineteen empty    before/after customer photos, six supplement shots,
       image slots     twelve partner logos. No files exist for any of them,
                       and a slot with no honest photograph renders type.

   PER-CATEGORY ACCENT, ONE PLACE ONLY. The prototype spreads #f59e0b,
   #38bdf8 and #2dd4bf across meal slots, counts glyphs, coach feeds and
   supplement grades. DESIGN.md bans those by hex. They survive on the four
   goal doors and nowhere else, because there they encode the catalogue's own
   taxonomy and Pick.tsx has shipped them with a written carve-out since the
   plan surfaces were built.

   STILL ON DISK, NOT IMPORTED: Proof (merged into Why), Corporate and
   Network (tiles in More), Hungry, Steps, Ticker, Loop, Inside, Supplements,
   Wedge, Conditions, Aggregators, ShopRow, HeroDial. Nothing is deleted;
   every destination is a real page one click away.

   EVERY NUMBER COMES FROM POSTGRES. Dishes and the week are
   PlanScheduleSlot joined to Recipe. Durations are PlanPrice rows and the
   receipt is decomposePrice(). Coupons are the Coupon table under the same
   validity gate checkout applies. Quotes are Testimonial, questions are Faq,
   counts are lib/site-counts. Anything that cannot be read fails soft: the
   section drops rather than printing a figure we cannot stand behind.

   STILL OPEN, and it is not a code problem: real food photography. Every
   slot is wired (lib/site-images.ts) and all 104 prompts are written
   (IMAGE-BRIEF-V2.md). What is missing is the files.
   `node scripts/image-status.mjs` prints what has landed.
══════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div style={{ background: BG, color: INK, minHeight: "100vh", overflowX: "clip" }}>
      <div className={s.grain} aria-hidden="true" />

      <StructuredData />

      {/* ── the offer, welded ────────────────────────────────────────
          Hero, readout and counts are one continuous band: no section
          padding between them and no gap where a rule would normally sit.
          This is the run that breaks the twelve-identical-containers
          rhythm, and it is why the readout reads as part of the promise
          rather than as a stat strip underneath it. */}
      <Hero />
      <Readout />
      <Counts />

      {/* ── the food ─────────────────────────────────────────────────
          Four plates, then the week. The trial day is the unit you can
          buy without a subscription, so it leads; the week comes next,
          once the reader has agreed the day is real. */}
      <TrialDay />
      <Week />

      {/* ── which one is you, and what does it cost ──────────────────
          The finder runs lib/tdee's own Mifflin St Jeor and prints the
          ledger; the price builder runs decomposePrice() across every
          seeded duration. Both are controls rather than claims. */}
      <Pick />
      <Offers />

      {/* ── how, and who says so ─────────────────────────────────────
          Day is OUR side of the counter (the 04:00 cook sheet, the scale,
          dispatch) and it only earns its place after someone has decided
          about theirs. Coach then shows the arithmetic nobody else
          publishes, and Why carries the four checkable claims. */}
      <Day />
      <Coach />
      <Why />

      {/* ── can I get it, and what else is there ─────────────────────
          Areas is the plotted map: one kitchen, a tight cluster, and the
          decision not to serve the whole city badly. More is the other
          eight products as tiles rather than eight more sections. */}
      <Areas />
      <More />

      {/* ── close ────────────────────────────────────────────────────── */}
      <Faq />
      <Close />

      {/* The price and both order paths, always in reach. Replaces the
          floating WhatsApp bubble on this page: two fixed elements in the
          same corner is how a phone loses its bottom 140px. */}
      <OrderBar />
    </div>
  );
}
