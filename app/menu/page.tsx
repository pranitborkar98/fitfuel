import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { cutoffLabel } from "@/lib/order-cutoff";
import { TRIAL_TOTAL_GLYPH } from "@/lib/trial-price";
import { getWeek, PLAN_SLUG } from "@/app/_hp/menu-data";
import AppChrome from "@/app/_web/AppChrome";
import Areas from "@/app/_hp/Areas";
import WeekMenu from "./WeekMenu";

/* ══════════════════════════════════════════════════════════════════════════
   /menu — WHAT THE KITCHEN IS COOKING THIS WEEK.

   IT USED TO BE A SECOND CATALOGUE. All 48 à la carte dishes, grouped by
   course, with a basket — which is exactly what `/` is, and `/` does it better
   because it also searches, filters and carries the day target. Two URLs
   answering one question, and the one with less on it was the one named
   "menu".

   So this page took the question `/` cannot answer. Not "what can I buy" —
   "what are you actually cooking". Seven days, four meals each, out of the
   PlanScheduleSlot rows.

   THE TWO DATASETS ARE NOT THE SAME LIST, which is the thing to know before
   editing either page:

     lib/menu-alacarte.ts   the 48 singles, priced, buyable. Still on `/`.
     PlanScheduleSlot       the plan's rotation. Different recipes entirely —
                            "Maharashtrian Moong Dal Chilla" is here and is not
                            one of the 48 — on a 60-day no-repeat cycle, and
                            not sold singly.

   That is why there is no basket on this page and no price on a dish. Adding
   one would sell something the kitchen does not sell.

   ONE PLAN OF 126 HAS A SEEDED SCHEDULE (weight-loss-veg, 120 slots against 30
   Recipe rows). The plan is NAMED in the copy rather than left implicit, so
   nobody reads this as every plan's week. Seed more schedules and this page
   grows a plan picker; nothing here has to change to make that possible.

   MenuClient.tsx is left on disk and is no longer imported. It holds the à la
   carte grid, the enquiry list and the basket wiring — all of which now live
   only on `/`. Deleting it is a separate decision from this one.
   ══════════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  title: "This week's menu",
  description:
    "Seven days of the FitFuel kitchen, four meals a day, with the macros for each. Cooked in Kharadi and delivered across east Pune.",
  alternates: { canonical: "/menu" },
};

/** The plan whose week this is. Named, not implied. */
async function getPlan(): Promise<{ name: string; slug: string } | null> {
  try {
    const p = await prisma.mealPlan.findUnique({
      where: { slug: PLAN_SLUG },
      select: { name: true, slug: true },
    });
    return p ?? null;
  } catch {
    return null;
  }
}

export default async function MenuPage() {
  const [week, plan] = await Promise.all([getWeek(), getPlan()]);

  return (
    <AppChrome
      cutoff={cutoffLabel()}
      areaPanel={<Areas />}
    >
      {week.length && plan ? (
        <WeekMenu
          week={week}
          planName={plan.name}
          planSlug={plan.slug}
          trialTotal={TRIAL_TOTAL_GLYPH}
          cutoff={cutoffLabel()}
        />
      ) : (
        /* SAYS SO, rather than rendering an empty page or inventing a week.
           The whole claim of this page is that the rotation is real; a
           placeholder week would falsify it. */
        <div className="fk" style={{ padding: "clamp(48px,8vw,96px) var(--fk-gutter)" }}>
          <h1
            style={{
              fontFamily: "var(--fk-display)",
              fontSize: "clamp(1.5rem,1.2rem + 1.4vw,2rem)",
              fontWeight: 600,
              color: "var(--fk-ink)",
              margin: 0,
            }}
          >
            This week&apos;s menu is being set.
          </h1>
          <p
            style={{
              marginTop: 12,
              maxWidth: "52ch",
              fontSize: "var(--fk-t-base)",
              lineHeight: 1.55,
              color: "var(--fk-ink-3)",
            }}
          >
            The kitchen publishes the week once the rotation is locked. In the
            meantime the full catalogue is on the{" "}
            <Link href="/" style={{ color: "var(--fk-green-deep)" }}>
              order page
            </Link>
            , and every plan carries its own schedule.
          </p>
        </div>
      )}
    </AppChrome>
  );
}
