import type { Metadata } from "next";

import StructuredData from "@/components/StructuredData";
import WhatsAppOrder from "@/components/WhatsAppOrder";
import s from "./_hp/hp.module.css";
import Hero from "./_hp/Hero";
import Coach from "./_hp/Coach";
import TrialDay from "./_hp/TrialDay";
import Week from "./_hp/Week";
import Pick from "./_hp/Pick";
import Steps from "./_hp/Steps";
import Why from "./_hp/Why";
import Proof from "./_hp/Proof";
import Areas from "./_hp/Areas";
import Offers from "./_hp/Offers";
import More from "./_hp/More";
import Faq from "./_hp/Faq";
import Close from "./_hp/Close";
import { BG, INK } from "./_hp/theme";

/* ══════════════════════════════════════════════════════════════════════
   FITFUEL HOMEPAGE — twelve sections, food first.

   WHAT WAS ACTUALLY WRONG, after three months of reskinning it.

   Not the palette, and not the corner radius. Two things:

   1. ORDER. The page explained our system before it showed anyone food. The
      first dish name used to sit four screens down, behind a film about our
      4am kitchen. Everyone who looked at it — the owner, and two independent
      outside reviews — reached the same verdict without conferring: it sells
      the system instead of the food.

   2. ASSETS. /public/images contains eight photographs and exactly ONE is a
      plated dish. That is the real reason every version of this page has been
      made of words: with one food photo there was nothing else to build with.
      No layout fixes that. Roughly fifteen photographs of real FitFuel boxes
      would change this page more than anything in this file.

   So this is short, and the food leads:

     Hero      full-bleed, one promise, the price, the licence
     TrialDay  the four real dishes that arrive tomorrow, from the DB
     Week      seven days of real dish names and macros, from the schedule
     Pick      which of these is you: fat, muscle, eat well, a condition
     Steps     three steps, from the customer's side of the counter
     Why       four claims that survive being checked
     Proof     the testimonials we actually have
     Areas     do we reach you
     Offers    the receipt, the strike-through, live coupon codes
     More      everything else the business runs, one line each
     Faq       objections, from the DB
     Close     the ask, then a directory of the whole site

   ON CUTTING. The previous version had nineteen sections because the brief was
   that nothing built should be invisible. That brief was right and the
   execution was wrong: BREADTH DOES NOT REQUIRE CHAPTERS. The app, the coach,
   the 952-exercise library, supplements, corporate, partners, franchise and
   the TDEE tool are all still one click from here — they live in More.tsx as a
   line each, and each destination is a real page that explains itself. Loop,
   Coach, Inside, Supplements, Corporate, Network, Wedge, Conditions, Day and
   Ticker remain on disk and can be re-seated at any time.

   ON WHAT IS NOT HERE. Two outside reviews asked for "Rated 4.8/5 by 500+",
   "Join 200+ Punekars", "500+ meals weekly", "free delivery" and "no
   preservatives". The database has 5 users and 8 testimonials, delivery is
   Rs 50 and itemised on the receipt below, and no preservative test has been
   run. None of those lines are on this page and none should be: on a licensed
   food business an invented trust claim is not a growth tactic.

   STILL OPEN, and neither is a code problem:
   - Real food photography. This is now the critical path.
   - The order cutoff time ("order by 8pm for next-day") is the cheapest
     urgency available and nobody has told me what it is.

   EVERY NUMBER COMES FROM POSTGRES. Dishes and the week are PlanScheduleSlot
   joined to Recipe. Coupons are the Coupon table under the same validity gate
   checkout applies. The receipt is decomposePrice(). Quotes are Testimonial,
   questions are Faq.
══════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    /* No paddingTop: the hero bleeds under the fixed header on purpose and
       re-adds the 68px inside itself, so the photograph starts at the top of
       the viewport instead of below a black bar. */
    <div style={{ background: BG, color: INK, minHeight: "100vh", overflowX: "clip" }}>
      <div className={s.grain} aria-hidden="true" />

      <StructuredData />

      {/* ── the food ─────────────────────────────────────────────── */}
      <Hero />
      <TrialDay />
      <Week />
      <Pick />

      {/* ── how, why, and who says so ────────────────────────────── */}
      <Steps />
      {/* The engine, restored to a full section. Demoting it to one line in
          More.tsx undersold the thing that actually separates this from a
          tiffin service: nobody else in the category will publish the constant,
          the cap and the floor their coaching arithmetic runs on. */}
      <Coach />
      <Why />
      <Proof />

      {/* ── can I get it, what does it cost ──────────────────────── */}
      <Areas />
      <Offers />

      {/* ── the rest of the business, one line each ──────────────── */}
      <More />

      {/* ── close ────────────────────────────────────────────────── */}
      <Faq />
      <Close />

      {/* India orders food on WhatsApp. The page had no WhatsApp path at all
          outside the footer, which for a Pune food business is the single
          biggest conversion leak on it. Appears after the first screen so it
          never covers the hero CTA. */}
      <WhatsAppOrder />
    </div>
  );
}
