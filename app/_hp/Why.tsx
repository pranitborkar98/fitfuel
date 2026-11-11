// app/_hp/Why.tsx
//
// FOUR THINGS YOU CAN CHECK, EACH WITH THE INSTRUMENT THAT PROVES IT.
//
// The claims are unchanged and they are the same four this section has always
// made. What the prototype adds, and it is the whole improvement, is that each
// one now carries a drawn artefact rather than a paragraph asserting it: the
// cuisine spread, the scale, the licence, the published menu against the signup
// wall everyone else puts there.
//
// THE REFUSAL STANDS. Both outside reviews asked for "Rated 4.8/5 by 500+",
// "Join 200+ Punekars", "500+ meals weekly", "free delivery", "no
// preservatives". The database has 8 testimonials, delivery is Rs 50 and
// itemised on the receipt further up this page, and no preservative test has
// been run. None of those lines are here. On a licensed food business an
// invented trust claim is not a growth tactic.
//
// BUT THE APOLOGISING IS GONE. Feedback §4 counted seven passages on this page
// explaining what the product does not have yet, and this section carried the
// worst of them: "We are not going to tell you five hundred people love us.
// There are eight reviews in our database and you can read all eight." The rule
// is never advertise what you do not ship. It is not an instruction to narrate
// the backlog to a first-time visitor. Say the true thing and stop: eight
// verified reviews, read all eight.
//
// THE TESTIMONIALS HAVE NO PHOTOGRAPHS, so they render without them. The
// prototype gives each quote a before/after pair of image slots; there are no
// such files and no consent on record to publish a customer's body, so the
// quote, the result and the area carry the tile. Area matters more than it
// looks: "Kharadi" tells a Kharadi reader this is a real local business, which
// is the hardest thing for a national brand to fake.
//
// SERVER COMPONENT.

import Link from "next/link";

import { prisma } from "@/lib/prisma";
import s from "./hp.module.css";
import v from "./v2.module.css";
import Idx from "./Idx";
import { FSSAI_LICENCE } from "@/lib/trust-marks";
import { KITCHEN } from "./areas-data";
import { WRAP, PANEL, INK, MUTE, DIM, LIME, RULE_2, MONO, display, sub, body, label, figure } from "./theme";

/* The cuisine spread, from prisma/seed-recipes-weight-loss-veg.ts. Counts of the
   30 seeded recipes, so the bars are a census and not an impression. */
const CUISINES: [string, number][] = [
  ["Maharashtrian", 7],
  ["North Indian", 6],
  ["South Indian", 5],
  ["Chettinad", 4],
  ["Gujarati", 3],
  ["Bengali", 3],
  ["Punjabi", 2],
];

type Quote = {
  id: string;
  name: string;
  location: string;
  planLabel: string;
  resultLabel: string;
  quote: string;
};

/* The seed wrote HTML entities into these plain-text columns, so they printed
   literally as "&mdash;". Decoded at the read boundary; the real fix is in the
   seed. Deliberately a fixed table rather than a generic HTML decoder: this is
   plain text, and running it through a parser is how markup gets back in. */
const ENTITIES: Record<string, string> = {
  "&mdash;": ",",
  "&ndash;": "–",
  "&middot;": "·",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&rsquo;": "’",
  "&lsquo;": "‘",
  "&nbsp;": " ",
};
const decode = (val: string) =>
  val.replace(/&(?:mdash|ndash|middot|amp|quot|#39|rsquo|lsquo|nbsp);/g, (m) => ENTITIES[m] ?? m);

async function getQuotes(): Promise<{ rows: Quote[]; total: number }> {
  try {
    const [rows, total] = await Promise.all([
      prisma.testimonial.findMany({
        where: { isActive: true },
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
        take: 3,
        select: {
          id: true,
          name: true,
          location: true,
          planLabel: true,
          resultLabel: true,
          quote: true,
        },
      }),
      prisma.testimonial.count({ where: { isActive: true } }),
    ]);
    return {
      rows: rows.map((r) => ({
        ...r,
        quote: decode(r.quote),
        planLabel: decode(r.planLabel),
        resultLabel: decode(r.resultLabel),
      })),
      total,
    };
  } catch {
    return { rows: [], total: 0 };
  }
}

export default async function Why() {
  const { rows, total } = await getQuotes();
  const spread = CUISINES.reduce((n, [, c]) => n + c, 0);

  return (
    <section
      aria-labelledby="hp-why"
      style={{ padding: "clamp(72px,9.5vw,140px) 0", background: PANEL, borderTop: "1px solid #232320" }}
    >
      <div style={WRAP}>
        <Idx label="Why this and not a tiffin" />

        <div className={v.head}>
          <div className={v.rise}>
            <h2 id="hp-why" style={{ ...display("clamp(2.4rem,6.6vw,5.4rem)"), maxWidth: "14ch" }}>
              Four things you can check before you trust us
            </h2>
          </div>
          {total > 0 && (
            <p className={v.rise} style={{ ...body(16.5), maxWidth: "48ch" }}>
              {total} verified {total === 1 ? "review" : "reviews"}. Read all {total}.
            </p>
          )}
        </div>

        <div className={v.tiles} style={{ marginTop: "clamp(28px,3.6vw,46px)" }}>
          <article className={v.tile}>
            <div className={v.inset}>
              {CUISINES.map(([name, n], i) => (
                <span key={name} className={v.insetRow}>
                  {name}
                  <span className={v.insetTrack}>
                    <span
                      className={v.meter}
                      style={{
                        width: `${(n / CUISINES[0]![1]) * 100}%`,
                        background: i === 0 ? LIME : MUTE,
                        opacity: 1 - i * 0.09,
                      }}
                    />
                  </span>
                  <b>{n}</b>
                </span>
              ))}
              <span
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 6,
                  paddingTop: 10,
                  borderTop: "1px solid #1b1b19",
                  fontFamily: MONO,
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: LIME,
                }}
              >
                {spread} seeded recipes<span>no dish twice running</span>
              </span>
            </div>
            <h3 style={sub("clamp(1.3rem,2.2vw,1.75rem)")}>Cooked, not assembled</h3>
            <p style={{ ...body(14.5), maxWidth: "none" }}>
              Thirty seeded recipes across Maharashtrian, Chettinad, Punjabi, Bengali,
              Gujarati and more. Not five variations on grilled chicken and broccoli.
            </p>
          </article>

          <article className={v.tile}>
            <div className={v.inset} style={{ flexDirection: "row", alignItems: "center", gap: "clamp(14px,2vw,24px)" }}>
              {/* A dial settling on the portion weight. Static: the needle sits
                  where the reading is, because a needle that sweeps forever is
                  the infinite motion this system does not do. */}
              <svg
                viewBox="0 0 120 74"
                width="132"
                height="82"
                role="img"
                aria-label="A kitchen scale reading 182 grams"
                style={{ flex: "none" }}
              >
                <path d="M8 66 A52 52 0 0 1 112 66" fill="none" stroke="#1b1b19" strokeWidth="8" />
                <path d="M8 66 A52 52 0 0 1 74 17.5" fill="none" stroke={LIME} strokeWidth="8" />
                <line x1="60" y1="66" x2="74" y2="26" stroke={INK} strokeWidth="2.5" />
                <circle cx="60" cy="66" r="5" fill={INK} />
              </svg>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                <b style={figure("clamp(2rem,3.4vw,2.9rem)")}>
                  182<span style={{ fontSize: "0.44em", color: DIM, marginLeft: 6 }}>g</span>
                </b>
                {(
                  [
                    ["Target", "180g"],
                    ["Tolerance", "±5g"],
                    ["Sealed at", "06:31"],
                  ] as const
                ).map(([k, val]) => (
                  <span key={k} className={v.insetLine}>
                    {k}
                    <b>{val}</b>
                  </span>
                ))}
              </div>
            </div>
            <h3 style={sub("clamp(1.3rem,2.2vw,1.75rem)")}>Weighed, not estimated</h3>
            <p style={{ ...body(14.5), maxWidth: "none" }}>
              Every portion hits your macros on a scale before the compartment is sealed. That
              single act is why the tracking can be automatic at all.
            </p>
          </article>

          <article className={v.tile}>
            <div className={v.inset}>
              <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.2em" }}>
                FSSAI licence, held by us
              </span>
              <b
                style={{
                  fontFamily: MONO,
                  fontSize: "clamp(15px,2.2vw,21px)",
                  letterSpacing: "0.16em",
                  color: INK,
                  fontWeight: 700,
                }}
              >
                {FSSAI_LICENCE}
              </b>
              {/* The licence as a code strip. Bar widths are its own digits, so
                  it encodes the number rather than decorating it. */}
              <span
                aria-hidden="true"
                style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 34, marginTop: 8 }}
              >
                {FSSAI_LICENCE.split("").flatMap((d, i) => [
                  <span key={`a${i}`} style={{ width: 1 + (Number(d) % 3), height: "100%", background: RULE_2 }} />,
                  <span key={`b${i}`} style={{ width: 1, height: "100%", background: Number(d) % 2 ? LIME : "#151513" }} />,
                ])}
              </span>
              <span
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 12,
                  fontFamily: MONO,
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: DIM,
                }}
              >
                {KITCHEN}, Pune<span style={{ color: LIME }}>Our kitchen, our shift</span>
              </span>
            </div>
            <h3 style={sub("clamp(1.3rem,2.2vw,1.75rem)")}>Our own licensed kitchen</h3>
            <p style={{ ...body(14.5), maxWidth: "none" }}>
              Not a cloud kitchen rented by the shift, not a restaurant cooking your food
              between other orders. One licence, one address, checkable on the FSSAI register.
            </p>
          </article>

          <article className={v.tile}>
            <div
              className={v.inset}
              style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,0.72fr)", gap: 12 }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {(
                  [
                    ["Day 1 · Breakfast", "412 kcal"],
                    ["Day 1 · Lunch", "486 kcal"],
                    ["Day 12 · Dinner", "395 kcal"],
                    ["Day 30 · Snack", "168 kcal"],
                  ] as const
                ).map(([k, val]) => (
                  <span key={k} className={v.insetLine} style={{ letterSpacing: "0.03em" }}>
                    {k}
                    <b>{val}</b>
                  </span>
                ))}
                <span style={{ ...label(LIME), fontSize: 12, letterSpacing: "0.14em", marginTop: 4 }}>
                  All 30 days, no account
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 9,
                  borderLeft: "1px solid #1b1b19",
                  paddingLeft: 12,
                }}
              >
                <span
                  style={{
                    ...label(DIM),
                    fontSize: 12,
                    letterSpacing: "0.14em",
                    textDecoration: "line-through",
                  }}
                >
                  Sign up to see
                </span>
                <span style={{ height: 8, background: "#151513" }} />
                <span style={{ height: 8, background: "#151513", width: "72%" }} />
                <span style={{ height: 8, background: "#151513", width: "54%" }} />
                <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.12em" }}>
                  What the others show
                </span>
              </div>
            </div>
            <h3 style={sub("clamp(1.3rem,2.2vw,1.75rem)")}>The menu is public before you pay</h3>
            <p style={{ ...body(14.5), maxWidth: "none" }}>
              Every dish, every macro, no signup wall. Most services show you a photo and a
              promise, and the real menu after your card clears.
            </p>
          </article>
        </div>

        {rows.length > 0 && (
          <>
            <div className={v.subHead} style={{ marginTop: "clamp(40px,5vw,72px)" }}>
              <span>
                {rows.length} of the {total}, in their own words
              </span>
            </div>

            <div className={v.tiles} style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))", borderTop: 0 }}>
              {rows.map((q) => (
                <figure key={q.id} className={v.tile} style={{ margin: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ ...sub("clamp(1.5rem,2.8vw,2.2rem)"), color: LIME }}>
                      {q.resultLabel}
                    </span>
                  </div>
                  <blockquote style={{ margin: 0 }}>
                    <p style={{ ...body(15), color: INK, maxWidth: "none" }}>{q.quote}</p>
                  </blockquote>
                  <figcaption
                    style={{
                      marginTop: "auto",
                      paddingTop: 16,
                      borderTop: "1px solid #232320",
                      fontFamily: MONO,
                      fontSize: 12,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: DIM,
                    }}
                  >
                    {q.name} · {q.location} · {q.planLabel}
                  </figcaption>
                </figure>
              ))}
            </div>

            <p style={{ ...body(13), color: DIM, margin: "18px 0 0", maxWidth: "78ch" }}>
              Results vary with adherence, starting point and medical history. These are
              individual outcomes, not an average and not a promise.
            </p>
          </>
        )}

        <div className={s.actions} style={{ marginTop: 26 }}>
          <Link href="/testimonials" className={s.ghost}>
            Read every review
          </Link>
          <Link href="/our-kitchen" className={s.link}>
            See the kitchen
          </Link>
        </div>
      </div>
    </section>
  );
}
