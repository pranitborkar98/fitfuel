import Link from "next/link";
import { ArrowRight, BookOpen, Check, Dumbbell, ShoppingBasket } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { computePrice, formatRs } from "@/lib/pricing";
import { getWorkoutPlanData } from "@/lib/workout-plan";

import styles from "./digital-plans.module.css";

const DURATION_KEYS: Record<string, string> = {
  TRIAL_DAY: "trial",
  WEEKLY: "weekly",
  BI_WEEKLY: "biweekly",
  MONTHLY_EXCL_WEEKENDS: "monthly_ex",
  ONE_MONTH: "monthly",
  TWO_MONTH: "two_month",
  THREE_MONTH: "three_month",
};

const DURATION_LABELS: Record<string, string> = {
  TRIAL_DAY: "1 day of access",
  WEEKLY: "1 week of access",
  BI_WEEKLY: "2 weeks of access",
  MONTHLY_EXCL_WEEKENDS: "1 month, weekdays",
  ONE_MONTH: "1 month of access",
  TWO_MONTH: "2 months of access",
  THREE_MONTH: "3 months of access",
};

const TIER_COPY = {
  STARTER: { name: "Starter", intro: "The complete food plan for cooking at home." },
  PRO: { name: "Pro", intro: "The food plan plus a matching training schedule." },
} as const;

export const metadata = {
  title: "Digital meal plans",
  description:
    "FitFuel meal schedules, recipes, macros and grocery lists in a downloadable plan for people cooking outside our Pune delivery area.",
  alternates: { canonical: "/plans/digital" },
};

export const revalidate = 3600;

function safeImageUrl(value: unknown) {
  if (typeof value !== "string") return null;
  return value.startsWith("/") || /^https?:\/\//i.test(value) ? value : null;
}

export default async function DigitalPlansPage() {
  const prices = await prisma.planPrice.findMany({
    where: { isDigital: true, isActive: true, mealPlanId: { not: null } },
    include: {
      mealPlan: {
        include: {
          scheduleSlots: {
            orderBy: [{ dayNumber: "asc" }, { mealSlot: "asc" }],
            take: 8,
            include: { recipe: { select: { name: true, imageUrl: true } } },
          },
        },
      },
    },
    orderBy: [{ priceRs: "asc" }],
  });

  const offers = await Promise.all(
    prices.map(async (price) => {
        const mealPlan = price.mealPlan;
        if (!mealPlan || !DURATION_KEYS[price.duration]) return null;
        const bundle: keyof typeof TIER_COPY = price.bundle === "PRO" ? "PRO" : "STARTER";
        const workout = bundle === "PRO"
          ? await getWorkoutPlanData(String(mealPlan.subCategory || ""), String(mealPlan.tier || ""))
          : null;
        const breakdown = computePrice({
          items: [{ mrpRs: price.mrpRs ?? price.priceRs, saleRs: price.priceRs, qty: 1 }],
          discountRs: 0,
          gstPercent: price.gstPercent,
          priceIsTaxInclusive: price.priceIsTaxInclusive,
          buyerStateCode: "MH",
          sellerStateCode: "MH",
        });
        const photos = mealPlan.scheduleSlots
          .map((slot) => ({ name: slot.recipe.name, url: safeImageUrl(slot.recipe.imageUrl) }))
          .filter((photo): photo is { name: string; url: string } => photo.url !== null)
          .slice(0, 3);

        return { price, mealPlan, bundle, workout, breakdown, photos };
      }),
  );
  const publishedOffers = offers.filter((offer): offer is NonNullable<typeof offer> => offer !== null);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div>
            <p className={styles.kicker}>Digital FitFuel</p>
            <h1>Cook the same planned food, wherever you live.</h1>
            <p className={styles.deck}>
              Get the meal schedule, measured recipes, per-meal macros and one consolidated grocery list. It is built from the same plan data that powers our Pune kitchen and member diary.
            </p>
            <a className={styles.primaryAction} href="#digital-options">
              See digital options <ArrowRight aria-hidden="true" size={18} />
            </a>
          </div>

          <aside className={styles.outputCard} aria-label="What your digital plan contains">
            <div>
              <BookOpen aria-hidden="true" />
              <span><strong>Cook from it</strong>Measured ingredients and clear steps for every scheduled meal.</span>
            </div>
            <div>
              <ShoppingBasket aria-hidden="true" />
              <span><strong>Shop from it</strong>One grocery list rolled up from the recipes in your plan.</span>
            </div>
            <div>
              <Dumbbell aria-hidden="true" />
              <span><strong>Train with Pro</strong>A matching exercise schedule when one is ready for the selected plan.</span>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.options} id="digital-options">
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.kicker}>Choose your download</p>
            <h2>Food plan first. Training only when it is genuinely connected.</h2>
          </div>
          <p>Every amount below is calculated from the active price in FitFuel, including tax where the price is tax-inclusive.</p>
        </div>

        {publishedOffers.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>Digital plans are being prepared.</h2>
            <p>We have not published a complete, purchasable download yet.</p>
            <Link href="/plans">See delivered meal plans</Link>
          </div>
        ) : (
          <div className={styles.offerGrid}>
            {publishedOffers.map(({ price, mealPlan, bundle, workout, breakdown, photos }) => {
              const copy = TIER_COPY[bundle];
              const ready = bundle === "STARTER" || Boolean(workout);
              const durationKey = DURATION_KEYS[price.duration];
              const href = `/checkout/digital?planSlug=${encodeURIComponent(mealPlan.slug)}&dur=${durationKey}&bundle=${bundle}`;
              const features = [
                `${mealPlan.cycleLengthDays} planned days`,
                "Recipes with measured ingredients and steps",
                "Per-meal macros and daily totals",
                "A grocery list generated from the plan",
                "Download access from your FitFuel dashboard",
                ...(bundle === "PRO" && workout
                  ? [`${workout.daysPerWeek}-day weekly training schedule`, "Exercises, sets, reps and rest guidance"]
                  : []),
              ];

              return (
                <article className={styles.offerCard} key={price.id}>
                  {photos.length > 0 && (
                    <div className={styles.photoStrip} aria-label="Meals from this plan">
                      {photos.map((photo: { name: string; url: string }, index: number) => (
                        // Kitchen-managed URLs can be local or remote; keep both usable.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={`${photo.url}-${index}`} src={photo.url} alt={photo.name} />
                      ))}
                    </div>
                  )}
                  <div className={styles.offerBody}>
                    <div className={styles.offerHeading}>
                      <div>
                        <p>{copy.name}</p>
                        <h2>{mealPlan.displayName}</h2>
                      </div>
                      <span>{DURATION_LABELS[price.duration] ?? price.duration}</span>
                    </div>
                    <p className={styles.offerIntro}>{copy.intro}</p>
                    <div className={styles.priceLine}>
                      <strong>{formatRs(breakdown.totalRs)}</strong>
                      <span>{price.priceIsTaxInclusive ? `Includes ${price.gstPercent}% GST` : `Total with ${price.gstPercent}% GST`}</span>
                    </div>
                    <ul>
                      {features.map((feature) => (
                        <li key={feature}><Check aria-hidden="true" size={17} /> {feature}</li>
                      ))}
                    </ul>
                    {ready ? (
                      <Link className={styles.offerAction} href={href}>
                        Choose {copy.name} <ArrowRight aria-hidden="true" size={18} />
                      </Link>
                    ) : (
                      <div className={styles.notReady} role="status">
                        Pro checkout is paused until this plan has a matching training schedule.
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.howItWorks}>
        <div>
          <p className={styles.kicker}>After payment</p>
          <h2>Your download stays attached to your account.</h2>
        </div>
        <ol>
          <li><span>1</span><div><strong>Pay through PayU</strong><p>We confirm the final server price before opening the payment page.</p></div></li>
          <li><span>2</span><div><strong>Sign in with the same email</strong><p>The plan is activated on your FitFuel dashboard after payment confirmation.</p></div></li>
          <li><span>3</span><div><strong>Download your PDF</strong><p>Your recipes, macros and grocery list are generated from the purchased plan.</p></div></li>
        </ol>
      </section>
    </main>
  );
}
