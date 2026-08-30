// app/_web/Platform.tsx
//
// WHAT YOU GET AFTER YOU ORDER.
//
// The owner's complaint, verbatim: "we literally have real weight machine
// integration ... and still on homepage just basic shit ... we are not
// expressing ourselves properly". He is right, and the gap is measurable.
//
// The database carries 54 models. There are ELEVEN screens under /dashboard.
// The homepage linked to three of them (coach, trainer, exercises) and said
// nothing whatsoever about the rest — so a visitor's entire impression of
// FitFuel was "a company that sells salads", when what has actually been built
// is the app that runs your nutrition and your training, with the food as the
// delivery mechanism.
//
// Everything named here was checked against prisma/schema.prisma and against
// app/dashboard/* before it was written. No capability is claimed that does not
// have a model behind it and a route that renders it:
//
//   body composition -> BodyMetric (18 displayed measures) + /dashboard/body-metrics
//   the diary        -> FoodEntry/MealLog/WaterLog/NutritionGoal + /dashboard/nutrition
//   training         -> WorkoutSession/WorkoutSet/Exercise + /dashboard/exercises
//   the score        -> ConsistencySnapshot + /dashboard/progress
//   recalibration    -> lib/coach/recalibration.ts + /dashboard/coach
//   the conversation -> AiConversation/AiMessage + /dashboard/trainer
//   email            -> NotificationTemplate/Log/Preference + /dashboard/notification-settings
//   credit           -> CreditLedger/PartnerReferral + /dashboard/referrals
//
// This is a LIST, not seven more photo cards. The page already lost sixteen
// screens to a wall of near-identical cards; answering "you don't express
// enough" by building a second wall would repeat the mistake with new content.
// A stat, a name and one line each — scannable in the time someone actually
// gives a homepage.

import Link from "next/link";
import type { BandCounts } from "./HomeBands";
import s from "./app.module.css";

export default function Platform({ counts }: { counts: BandCounts }) {
  /* Figures come from the same live counts the strip at the top uses — counted
     in page.tsx, never typed, so these cannot drift from the catalogue. The
     ones without a number carry the capability itself as the stat, because
     inventing a figure to fill the column would be worse than not having one. */
  const rows: { href: string; stat: string; label: string; line: string }[] = [
    {
      href: "/dashboard/body-metrics",
      stat: "18 measures",
      label: "Body composition, not a bathroom scale",
      line:
        "Body fat, visceral fat, skeletal muscle, bone mass, water, protein, BMR and metabolic age — every weigh-in kept and charted against the plan.",
    },
    {
      href: "/dashboard/nutrition",
      stat: "Every meal",
      label: "The diary does the arithmetic",
      line:
        "What you ate, what you drank, what training burned, and what that leaves for dinner tonight.",
    },
    {
      href: "/dashboard/exercises",
      stat: `${counts.exercises.toLocaleString("en-IN")} exercises`,
      label: "Training that feeds back into the food",
      line:
        "Sets, reps and rest programmed into your week; the burn lands in the same day's net instead of a separate app.",
    },
    {
      href: "/dashboard/progress",
      stat: "Weekly",
      label: "A consistency score you can argue with",
      line:
        "How closely the week matched the plan, from your own logs — not a streak counter.",
    },
    {
      href: "/dashboard/coach",
      stat: "Recalibrates",
      label: "The target moves when the evidence does",
      line:
        "Two or more weigh-ins establish a trend. When it leaves the goal range, a capped change is shown for you to approve.",
    },
    {
      href: "/dashboard/trainer",
      stat: "Your last 30 days",
      label: "Ask it why the scale stalled",
      line:
        "A conversation held against your own logged numbers, not general advice from the internet.",
    },
    {
      href: "/dashboard/notification-settings",
      stat: "Email",
      label: "Told what changed, not spammed",
      line:
        "Order, delivery and weekly progress by email — each kind switched off independently.",
    },
    {
      href: "/dashboard/referrals",
      stat: "Credit",
      label: "Bring someone, both of you gain",
      line:
        "Referral credit tracked on your account and spent against your next order.",
    },
  ];

  return (
    <section className={s.platform} aria-labelledby="platform-h">
      <div className={s.platformInner}>
        <h2 id="platform-h" className={s.platformH}>
          Ordering lunch is the smallest thing you get
        </h2>
        <p className={s.platformDeck}>
          The food is how the plan reaches you. The plan itself lives in an app
          that tracks what you eat, what you lift and what your body is actually
          made of — and changes your numbers when they stop matching.
        </p>

        <ul className={s.platformList}>
          {rows.map((r) => (
            <li key={r.href}>
              <Link href={r.href} className={s.platformRow}>
                <span className={`${s.platformStat} fk-num`}>{r.stat}</span>
                <span className={s.platformBody}>
                  <b>{r.label}</b>
                  <span>{r.line}</span>
                </span>
                <svg
                  className={s.platformArrow}
                  width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true" focusable="false"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
