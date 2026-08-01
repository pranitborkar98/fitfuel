// app/_hp/More.tsx
//
// NINE PRODUCTS, ONE PLAN. Everything else the business runs.
//
// This resolves a real contradiction in the brief. The owner asked, correctly,
// that nothing the business has built be invisible on the homepage: the app, the
// coach, the 952-exercise library, supplements, corporate, partners, referrals,
// the TDEE tool. Two outside reviews then said, also correctly, that eight more
// sections about systems is what buries the food.
//
// Both are right, and the resolution is that BREADTH DOES NOT REQUIRE CHAPTERS.
// Each of the nine gets a tile, not a section, and each tile shows the thing
// rather than describing it: the diary shows a logged meal against a target, the
// referral tile shows the code and both credits, the corporate tile shows an
// invoice line. A card with a title and a paragraph is the pattern the four
// signature devices exist to replace.
//
// WHAT IS NOT HERE, AND WHY. The prototype fills this section with empty image
// slots: six supplement product shots, three client logos, three gym logos, six
// partner logos, a Nutrabay mark. Nineteen slots, and there are no files behind
// any of them. Rendering them would put nineteen grey placeholder boxes on the
// homepage, which is the wallpaper-is-worse-than-whitespace rule from
// lib/site-images.ts applied at scale. The four graded photographs at the top
// ARE real, resolve through slot(), and each shows its own subject.
//
// It also carries figures we do not have: "Rs 18,400 this month" on a partner
// console and a masked GSTIN. Those are illustrative numbers dressed as a
// dashboard, and this page does not print a number it cannot stand behind. The
// tiles show shape and structure instead, which is the honest version of the
// same idea.
//
// SERVER COMPONENT.

import Link from "next/link";
import Image from "next/image";

import s from "./hp.module.css";
import v from "./v2.module.css";
import Idx from "./Idx";
import { slot } from "@/lib/site-images";
import { WRAP, INK, MUTE, DIM, LIME, RULE, RULE_2, MONO, display, sub, body, label, figure } from "./theme";

/* The four band images. Every one resolves to a photograph of its own subject
   through LEGACY, which is why there are four and not nine. */
const BAND: { name: string; slotName: string; note: string; alt: string; duo: boolean }[] = [
  {
    name: "The diary",
    slotName: "produce",
    note: "154 foods, per gram",
    alt: "Ingredients weighed into the food database",
    duo: false,
  },
  {
    name: "Training",
    slotName: "partners",
    note: "952 exercises",
    alt: "The training floor the programme is written for",
    duo: true,
  },
  {
    name: "Supplements",
    slotName: "supplements",
    note: "46 researched, none sold",
    alt: "Supplements researched, not stocked",
    duo: true,
  },
  {
    name: "Corporate",
    slotName: "corporate",
    note: "One GST invoice",
    alt: "A team eating on one corporate invoice",
    duo: true,
  },
];

const MONO_ROW = {
  display: "grid",
  gridTemplateColumns: "minmax(0,1fr) auto",
  gap: 8,
  alignItems: "baseline" as const,
  paddingBottom: 7,
  borderBottom: "1px solid #171715",
  fontFamily: MONO,
  fontSize: 12,
  letterSpacing: "0.03em",
  color: "#c6c6c0",
};

function Line({ k, val, colour = LIME }: { k: string; val: string; colour?: string }) {
  return (
    <span style={MONO_ROW}>
      {k}
      <b style={{ color: colour, fontWeight: 400, whiteSpace: "nowrap" }}>{val}</b>
    </span>
  );
}

export default function More() {
  return (
    <section
      aria-labelledby="hp-more"
      style={{ padding: "clamp(64px,8.5vw,120px) 0", borderTop: `1px solid ${RULE}` }}
    >
      <div style={WRAP}>
        <Idx label="Everything else we run" />

        <div className={v.head}>
          <div className={v.rise}>
            <h2 id="hp-more" style={{ ...display("clamp(2.4rem,6.6vw,5.4rem)"), maxWidth: "14ch" }}>
              The food is the front of a much bigger thing
            </h2>
          </div>
          <p className={v.rise} style={{ ...body(16.5), maxWidth: "48ch" }}>
            All of it is included with a plan and none of it is a second subscription. It gets
            a tile each rather than a chapter, because you came to find out about dinner.
          </p>
        </div>

        <div className={v.band} style={{ marginTop: "clamp(30px,4vw,52px)" }}>
          {BAND.flatMap((b) => {
            const img = slot("sections", b.slotName);
            if (!img) return [];
            return [
              /* gradeDuo paints the lime duotone via its own ::after and
                 grayscales the img beneath it, so it belongs on the figure
                 rather than on a sibling. Food keeps its colour; places and
                 people take the duotone. */
              <figure key={b.name} className={`${v.bandFig} ${b.duo ? s.gradeDuo : s.gradeFood}`}>
                <Image src={img.src} alt={b.alt} fill sizes="(max-width: 980px) 50vw, 25vw" quality={75} />
                <span className={v.bandScrim} aria-hidden="true" />
                <figcaption className={v.bandBody}>
                  <b style={{ ...figure("clamp(1.5rem,2.6vw,2.2rem)"), display: "block" }}>{b.name}</b>
                  <span style={{ ...label(LIME), fontSize: 12, letterSpacing: "0.16em", marginTop: 7 }}>
                    {b.note}
                  </span>
                </figcaption>
                {img.ai && <p className="sr-only">Illustrative AI-generated image.</p>}
              </figure>,
            ];
          })}
        </div>

        <div className={v.subHead} style={{ marginTop: "clamp(38px,4.6vw,64px)" }}>
          <span>Nine products, one plan</span>
        </div>

        <div className={v.moat}>
          <Link href="/dashboard/nutrition" className={v.moatCard} style={{ textDecoration: "none" }}>
            <div className={v.moatTop}>
              <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.14em" }}>
                Today, logged for you
              </span>
              <Line k="Poha, 1 katori" val="180 kcal" />
              <Line k="Moong dal chilla" val="243 kcal" />
              <Line k="Rajma, brown rice" val="486 kcal" />
              <span style={{ marginTop: "auto", display: "block" }}>
                <span
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    ...label(DIM),
                    fontSize: 12,
                    letterSpacing: "0.14em",
                    marginBottom: 6,
                  }}
                >
                  Eaten today
                  <b style={{ color: INK, fontWeight: 400 }}>1,412 / 1,800</b>
                </span>
                <span style={{ display: "block", height: 6, background: "#151513" }}>
                  <span className={v.meter} style={{ width: "78%", background: LIME }} />
                </span>
              </span>
            </div>
            <div className={v.moatBody}>
              <b style={sub("1.35rem")}>The diary</b>
              <p style={{ ...body(13.5), maxWidth: "none" }}>
                Your meals arrive pre-logged. Anything else you eat, you add per gram from an
                Indian food database.
              </p>
            </div>
          </Link>

          <Link href="/dashboard/exercises" className={v.moatCard} style={{ textDecoration: "none" }}>
            <div className={v.moatTop}>
              <span
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  ...label(DIM),
                  fontSize: 12,
                  letterSpacing: "0.14em",
                }}
              >
                Push day, week 3<span style={{ color: LIME }}>4 of 5 done</span>
              </span>
              {(
                [
                  ["Bench press", "4 × 8", true],
                  ["Incline dumbbell", "3 × 10", true],
                  ["Cable fly", "3 × 12", true],
                  ["Overhead press", "4 × 6", false],
                ] as const
              ).map(([k, val, done]) => (
                <span
                  key={k}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "14px minmax(0,1fr) auto",
                    gap: 9,
                    alignItems: "center",
                    padding: "7px 0",
                    borderBottom: "1px solid #171715",
                    fontFamily: MONO,
                    fontSize: 12,
                    color: "#c6c6c0",
                  }}
                >
                  <span
                    style={{
                      width: 11,
                      height: 11,
                      border: `1px solid ${done ? LIME : RULE_2}`,
                      background: done ? LIME : "transparent",
                    }}
                  />
                  {k}
                  <b style={{ color: DIM, fontWeight: 400 }}>{val}</b>
                </span>
              ))}
            </div>
            <div className={v.moatBody}>
              <b style={sub("1.35rem")}>Training</b>
              <p style={{ ...body(13.5), maxWidth: "none" }}>
                A programme built around your plan, not a video library you scroll through.
                Volume feeds straight back into the target.
              </p>
            </div>
          </Link>

          <Link href="/dashboard/body-metrics" className={v.moatCard} style={{ textDecoration: "none" }}>
            <div className={v.moatTop}>
              <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.14em" }}>
                Scale paired over bluetooth
              </span>
              {/* Weight over six weeks. Lime, like every other line on this
                  page: the prototype drew this one in sky, which is a hue with
                  no meaning attached to it. */}
              <svg
                viewBox="0 0 200 54"
                preserveAspectRatio="none"
                role="img"
                aria-label="Weight trending down over six weeks"
                style={{ width: "100%", height: 54, display: "block" }}
              >
                <polyline
                  points="0,14 33,18 66,12 100,24 133,30 166,27 200,38"
                  fill="none"
                  stroke={LIME}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <circle cx="200" cy="38" r="4" fill="#0c0c0a" stroke={LIME} strokeWidth="2.5" />
              </svg>
              <span
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 1,
                  background: "#171715",
                  marginTop: "auto",
                }}
              >
                {(
                  [
                    ["77.6", "kg"],
                    ["21.4", "% fat"],
                    ["34.2", "kg muscle"],
                  ] as const
                ).map(([val, k]) => (
                  <span key={k} style={{ background: "#0c0c0a", padding: "9px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
                    <b style={figure("17px")}>{val}</b>
                    <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.1em" }}>{k}</span>
                  </span>
                ))}
              </span>
            </div>
            <div className={v.moatBody}>
              <b style={sub("1.35rem")}>Body metrics</b>
              <p style={{ ...body(13.5), maxWidth: "none" }}>
                Your Bluetooth scale talks to FitFuel in the browser. No companion app, no
                typing, no re-entering yesterday.
              </p>
            </div>
          </Link>

          <Link href="/dashboard/progress" className={v.moatCard} style={{ textDecoration: "none" }}>
            <div className={v.moatTop}>
              <span style={{ ...label(LIME), fontSize: 12, letterSpacing: "0.16em" }}>
                Plateau called
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  fontFamily: "var(--ff-cond), sans-serif",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                }}
              >
                <b style={{ fontSize: 30, color: DIM, textDecoration: "line-through" }}>1,800</b>
                <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 400, color: DIM }}>&rarr;</span>
                <b style={{ fontSize: 34, color: LIME }}>1,690</b>
              </span>
              <Line k="Fortnight moved" val="0.3 kg" colour="#c6c6c0" />
              <Line k="Goal needs" val="1.0 kg" colour="#c6c6c0" />
              <Line k="Capped at" val="±300 kcal" colour="#c6c6c0" />
              <span style={{ marginTop: "auto", ...label(DIM), fontSize: 12, letterSpacing: "0.12em" }}>
                Applied only when you say so
              </span>
            </div>
            <div className={v.moatBody}>
              <b style={sub("1.35rem")}>The coach</b>
              <p style={{ ...body(13.5), maxWidth: "none" }}>
                Spots a plateau, recalculates your target from your own numbers, shows the
                arithmetic and waits for your yes.
              </p>
            </div>
          </Link>

          <Link href="/supplements" className={v.moatCard} style={{ textDecoration: "none" }}>
            <div className={v.moatTop}>
              <span
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  ...label(DIM),
                  fontSize: 12,
                  letterSpacing: "0.14em",
                }}
              >
                Evidence grade<span style={{ color: LIME }}>we sell none of it</span>
              </span>
              {(
                [
                  ["Creatine", "A", 92],
                  ["Whey", "A", 88],
                  ["Omega-3", "B", 64],
                ] as const
              ).map(([k, grade, w]) => (
                <span key={k} className={v.insetRow} style={{ gridTemplateColumns: "78px minmax(0,1fr) 34px" }}>
                  {k}
                  <span style={{ display: "block", height: 7, background: "#151513" }}>
                    <span className={v.meter} style={{ width: `${w}%`, background: LIME }} />
                  </span>
                  <b>{grade}</b>
                </span>
              ))}
              <span style={{ marginTop: "auto", ...label(DIM), fontSize: 12, letterSpacing: "0.1em" }}>
                Bought at the cheapest verified seller
              </span>
            </div>
            <div className={v.moatBody}>
              <b style={sub("1.35rem")}>Supplements</b>
              <p style={{ ...body(13.5), maxWidth: "none" }}>
                Researched properly, bought at Nutrabay. We hold no stock and own no
                supplement brand, so there is nothing to push.
              </p>
            </div>
          </Link>

          <Link href="/corporate" className={v.moatCard} style={{ textDecoration: "none" }}>
            <div className={v.moatTop}>
              <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.14em" }}>
                One invoice, per employee macros
              </span>
              <Line k="Employees" val="per head" colour="#c6c6c0" />
              <Line k="Plans" val="one each" colour="#c6c6c0" />
              <Line k="GST" val="5%, itemised" colour="#c6c6c0" />
              <Line k="Finance sees" val="one line" />
              <span style={{ marginTop: "auto", ...label(DIM), fontSize: 12, letterSpacing: "0.1em" }}>
                Billed monthly, cancel per head
              </span>
            </div>
            <div className={v.moatBody}>
              <b style={sub("1.35rem")}>Corporate</b>
              <p style={{ ...body(13.5), maxWidth: "none" }}>
                Your whole team, personalised per employee, billed once. Finance gets one line,
                each person gets their own macros.
              </p>
            </div>
          </Link>

          <Link href="/partners" className={v.moatCard} style={{ textDecoration: "none" }}>
            <div className={v.moatTop}>
              <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.14em" }}>
                Partner console
              </span>
              <span style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {["Gyms", "Trainers", "Dieticians", "Doctors", "Clinics", "Offices", "Residences", "Studios"].map(
                  (p) => (
                    <span
                      key={p}
                      style={{
                        border: `1px solid ${RULE}`,
                        padding: "5px 7px",
                        fontFamily: MONO,
                        fontSize: 12,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: MUTE,
                      }}
                    >
                      {p}
                    </span>
                  ),
                )}
              </span>
              <span style={{ marginTop: "auto", ...label(DIM), fontSize: 12, letterSpacing: "0.1em" }}>
                Commission tracked per referral, paid monthly
              </span>
            </div>
            <div className={v.moatBody}>
              <b style={sub("1.35rem")}>Partners</b>
              <p style={{ ...body(13.5), maxWidth: "none" }}>
                Eight kinds of partner, one console. Every referral tracked, every commission
                visible before it is paid.
              </p>
            </div>
          </Link>

          <Link href="/dashboard/referrals" className={v.moatCard} style={{ textDecoration: "none" }}>
            <div className={v.moatTop}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  border: `1px dashed ${RULE_2}`,
                  padding: "11px 12px",
                  fontFamily: MONO,
                  fontSize: 13,
                  letterSpacing: "0.22em",
                  color: INK,
                }}
              >
                YOURCODE
              </span>
              <span
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 18px 1fr",
                  gap: 8,
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <span style={{ border: `1px solid ${RULE}`, padding: "12px 8px" }}>
                  <b style={{ ...figure("22px", LIME), display: "block" }}>Rs 500</b>
                  <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.1em", marginTop: 6 }}>
                    credit to you
                  </span>
                </span>
                {/* dim, not rule-2: at #33332f this computed to 1.54:1. It is
                    the glyph that says the two credits are a pair. */}
                <span aria-hidden="true" style={{ fontFamily: MONO, fontSize: 12, color: DIM }}>
                  &harr;
                </span>
                <span style={{ border: `1px solid ${RULE}`, padding: "12px 8px" }}>
                  <b style={{ ...figure("22px", LIME), display: "block" }}>Rs 500</b>
                  <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.1em", marginTop: 6 }}>
                    off for them
                  </span>
                </span>
              </span>
              <span style={{ marginTop: "auto", ...label(DIM), fontSize: 12, letterSpacing: "0.1em" }}>
                Paid when their first order completes
              </span>
            </div>
            <div className={v.moatBody}>
              <b style={sub("1.35rem")}>Refer a friend</b>
              <p style={{ ...body(13.5), maxWidth: "none" }}>
                One code, two credits, nothing paid out until the food actually arrives at
                their door.
              </p>
            </div>
          </Link>

          <Link href="/tdee-calculator" className={v.moatCard} style={{ textDecoration: "none" }}>
            <div className={v.moatTop}>
              <span
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  ...label(DIM),
                  fontSize: 12,
                  letterSpacing: "0.14em",
                }}
              >
                TDEE calculator<span style={{ color: LIME }}>free, no account</span>
              </span>
              {(
                [
                  ["Age", "31", 32],
                  ["Height", "172cm", 58],
                  ["Weight", "78kg", 46],
                ] as const
              ).map(([k, val, w]) => (
                <span
                  key={k}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "56px minmax(0,1fr) 44px",
                    gap: 9,
                    alignItems: "center",
                    fontFamily: MONO,
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: DIM,
                  }}
                >
                  {k}
                  <span style={{ display: "block", height: 3, background: RULE, position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: `${w}%`,
                        top: -6,
                        width: 9,
                        height: 15,
                        background: INK,
                      }}
                    />
                  </span>
                  <b style={{ color: "#c6c6c0", fontWeight: 400, textAlign: "right" }}>{val}</b>
                </span>
              ))}
              <span
                style={{
                  marginTop: "auto",
                  borderTop: "1px solid #171715",
                  paddingTop: 11,
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.14em" }}>Maintenance</span>
                <b style={figure("30px")}>2,214</b>
              </span>
            </div>
            <div className={v.moatBody}>
              <b style={sub("1.35rem")}>TDEE calculator</b>
              <p style={{ ...body(13.5), maxWidth: "none" }}>
                No account, no email. Work out your numbers before you decide anything, and
                keep them if you never order.
              </p>
            </div>
          </Link>
        </div>

        <p style={{ ...body(13.5), color: DIM, marginTop: 20 }}>
          The tiles show the shape of each product, not a customer&rsquo;s real data. Want to
          run a FitFuel kitchen in your city?{" "}
          <Link href="/contact" style={{ color: LIME }}>
            Talk to us
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
