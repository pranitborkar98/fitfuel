// app/_web/Behind.tsx
//
// THE OPERATION, AND THE PEOPLE WHO ARE NOT THE EATER.
//
// Two bands the homepage never had, both asked for by name after the owner
// listed what we fail to express. As with Platform.tsx, nothing here is claimed
// without a model behind it and a route that renders it — every clause below
// was read out of prisma/schema.prisma first:
//
//   production sheet -> Recipe.kitchenStation / servingSizeGrams / prepTimeMins
//                       / cookTimeMins / equipmentNeeded / allergens
//                       / shelfLifeHours / packagingType, and RecipeStep with
//                       stepNumber / temperatureC / technique / kitchenNote
//   the 60-day cycle -> Recipe.rotationGroup (1–60, "no repeat in 60-day cycle")
//   the chain        -> Delivery.assignedDriverId / dispatchNotifiedAt /
//                       customerConfirmedAt / customerIssueNote + Driver, with
//                       app/driver (tokenised link) and app/admin/production
//   gyms & trainers  -> Partner (GYM/TRAINER) .code / .customLandingSlug /
//                       .rewardValueRs / .refereeDiscountRs + PartnerPayout
//   offices          -> app/corporate
//
// WHY THE RECIPE BAND IS WORDED AROUND PRODUCTION AND NOT COOKING. A recipe
// blog has ingredients and steps. This schema also carries the station the dish
// is cooked at, its cost per serving, how many hours it keeps, how it is
// packed, and a note on each step written for kitchen staff rather than for the
// customer. That is not a recipe — it is the sheet a SECOND kitchen needs to
// produce the identical dish, which is the whole franchise argument. Saying
// "126 tasty recipes" would sell the least valuable thing in the model.

import Link from "next/link";
import type { BandCounts } from "./HomeBands";
import s from "./app.module.css";

export default function Behind({ counts }: { counts: BandCounts }) {
  return (
    <>
      {/* ── The operation ────────────────────────────────────────────────── */}
      <section className={s.behind} aria-labelledby="behind-h">
        <div className={s.behindInner}>
          <h2 id="behind-h" className={s.behindH}>
            What happens before the box reaches you
          </h2>
          <p className={s.behindDeck}>
            The part a tiffin service cannot copy by lowering its price.
          </p>

          <div className={s.behindGrid}>
            <div className={s.behindItem}>
              <b>Every dish is a production sheet, not a recipe</b>
              <p>
                Weighed to a canonical serving, numbered steps carrying
                temperature and technique, the station it is cooked at, how many
                hours it keeps, and how it is packed. Allergens and equipment are
                declared on the dish, not remembered by a cook.
              </p>
            </div>

            <div className={s.behindItem}>
              <b>Nothing repeats for sixty days</b>
              <p>
                Every recipe carries a rotation group, so the plan you are on
                cannot serve you the same lunch twice in two months. That is
                scheduled in the data, not left to whoever is cooking.
              </p>
            </div>

            <div className={s.behindItem}>
              <b>The box is tracked to your door</b>
              <p>
                A driver is assigned to your delivery, you get told when it is
                dispatched, and you confirm you received it. If something is
                wrong you say so on the delivery itself and it reaches a person
                rather than a support inbox.
              </p>
            </div>

            <div className={s.behindItem}>
              <b>{counts.recipes.toLocaleString("en-IN")} recipes written this way so far</b>
              <p>
                Which is also how a second kitchen, in a second city, cooks food
                that tastes the same. The sheet is the product.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The people who are not the eater ─────────────────────────────────
          A gym owner and an HR manager are buying something different from a
          person choosing lunch, and both had exactly one card each near the
          footer. They get their own band because the pitch is genuinely
          different: one earns money, the other feeds a floor. */}
      <section className={s.b2b} aria-labelledby="b2b-h">
        <div className={s.b2bInner}>
          <h2 id="b2b-h" className={s.b2bH}>Not only for one person at a time</h2>

          <div className={s.b2bGrid}>
            <Link href="/partners" className={s.b2bCard}>
              <span className={s.b2bKicker}>Gyms, trainers and coaches</span>
              <b>Put your client on a plan and get paid for it</b>
              <p>
                Your own code and your own landing page. Your client&apos;s plan
                lands on their FitFuel account, they get a discount for coming
                through you, and your referrals are tracked and paid out — not
                settled over WhatsApp at the end of the month.
              </p>
              <span className={s.b2bGo}>See how partnering works →</span>
            </Link>

            <Link href="/corporate" className={s.b2bCard}>
              <span className={s.b2bKicker}>Offices</span>
              <b>One hot lunch a day, personalised per desk</b>
              <p>
                Not a shared buffet in a corner. Each person&apos;s tray is built
                to their goal and their diet and labelled with their name, from
                ₹110 a meal, delivered to the floor.
              </p>
              <span className={s.b2bGo}>Corporate lunch →</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
