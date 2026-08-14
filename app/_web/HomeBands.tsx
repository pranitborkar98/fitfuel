// app/_web/HomeBands.tsx
//
// THE MOAT CONTENT, AT APP DENSITY.
//
// A sweep of app/_hp found 26 of 37 components with zero importers — sections
// written for the v2 homepage and then left on no route at all. The strongest
// of them were never landing-page decoration; they carry the arguments that
// make FitFuel hard to copy, and the app homepage had none of them.
//
// THESE ARE NOT THOSE COMPONENTS REMOUNTED. The v2 sections render at
// clamp(2.1rem, 5.6vw, 4.2rem) display headings inside full-bleed panels —
// correct for a page someone reads once, hostile in a surface someone opens
// three times a week. AGENTS.md draws that line explicitly: the app half and
// the marketing half may look different, and density that is right in one is
// wrong in the other. So the content is rebuilt at app scale on --fk-* tokens.
//
// EVERYTHING HERE IS A NUMBER THE DATABASE CAN PRODUCE. 70 of 126 plans really
// are LIFESTYLE_MEDICAL, there really are 952 Exercise rows and 46 Supplement
// rows, and the quotes are Testimonial rows with isFeatured set — not copy.
// Counts arrive as props from the server so a figure on this page can never
// disagree with the catalogue it describes.
//
// They sit BELOW the catalog. AGENTS.md: the offer is a row, not a hero, and
// nothing pushes food down the page.

import Link from "next/link";

import s from "./app.module.css";

export type Quote = {
  id: string;
  name: string;
  location: string;
  planLabel: string;
  resultLabel: string;
  quote: string;
};

export type BandCounts = {
  dishes: number;
  plans: number;
  conditionPlans: number;
  exercises: number;
  supplements: number;
  recipes: number;
};

/* The 29 named conditions the kitchen cooks for. This list is the one in
   app/_hp/Conditions.tsx, kept as the single copy now that that component is
   dead code rather than duplicated between the two. */
const CONDITIONS = [
  "Diabetes", "Pre-diabetes", "Thyroid", "PCOS", "PCOD", "Hypertension",
  "Heart health", "Fatty liver", "Kidney health", "Gout", "Cholesterol",
  "Anaemia", "Vitamin D", "B12 deficiency", "Obesity", "Post-surgery",
  "Post-Covid", "Cancer recovery", "Postpartum", "Menopause", "Fertility",
  "PMS", "Hormonal acne", "Gut health", "Seniors", "Kids and teens",
  "Ramadan", "Navratri", "Shravan",
];

export default function HomeBands({
  counts,
  quotes,
}: {
  counts: BandCounts;
  quotes: Quote[];
}) {
  return (
    <>
      {/* ── The scale of the catalogue ──────────────────────────────────────
          Six figures, flat. This is Ticker.tsx and Counts.tsx rebuilt without
          the marquee the owner rejected: a number that slides past cannot be
          read, and these are the whole argument for the price. */}
      <section className={s.band} aria-labelledby="band-counts">
        <div className={s.bandInner}>
          <h2 id="band-counts" className={s.bandH}>
            What the kitchen actually runs
          </h2>
          <ul className={s.countRow}>
            {[
              [counts.dishes, "dishes on the menu"],
              [counts.plans, "meal plans"],
              [counts.conditionPlans, "built for a condition"],
              [counts.recipes, "weighed recipes"],
              [counts.exercises, "exercises programmed"],
              [counts.supplements, "supplements researched"],
            ].map(([n, label]) => (
              <li key={String(label)}>
                <b className="fk-num">{Number(n).toLocaleString("en-IN")}</b>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Conditions ──────────────────────────────────────────────────────
          The hardest thing here for a tiffin service to copy, and the reason a
          diabetic or PCOS customer picks us over a cheaper box. It was on no
          route at all. */}
      <section className={s.band} aria-labelledby="band-conditions">
        <div className={s.bandInner}>
          <h2 id="band-conditions" className={s.bandH}>
            {counts.conditionPlans} of the {counts.plans} plans are built for a condition
          </h2>
          <p className={s.bandP}>
            Not a low-calorie box with a label on it. A diabetic plan holds its
            glycaemic load, a PCOS plan splits carbohydrate around insulin, a
            kidney plan watches potassium and protein together. The kitchen cooks
            to the sheet the condition needs.
          </p>
          <ul className={s.condRow}>
            {CONDITIONS.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <Link href="/plans" className={s.bandLink}>
            See every plan
          </Link>
        </div>
      </section>

      {/* ── Proof ───────────────────────────────────────────────────────────
          Testimonial rows with isFeatured set, carrying the three things a
          prospect scans for: the result, the plan, and the area. Renders
          nothing at all when the table is empty rather than showing an
          encouraging blank. */}
      {quotes.length > 0 ? (
        <section className={s.band} aria-labelledby="band-proof">
          <div className={s.bandInner}>
            <h2 id="band-proof" className={s.bandH}>
              From people eating it
            </h2>
            <ul className={s.quoteRow}>
              {quotes.map((q) => (
                <li key={q.id}>
                  <p className={s.quoteText}>“{q.quote}”</p>
                  <p className={s.quoteWho}>
                    <b>{q.name}</b>
                    <span>{q.location}</span>
                  </p>
                  <p className={s.quoteMeta}>
                    <span className={s.quoteResult}>{q.resultLabel}</span>
                    <span>{q.planLabel}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
