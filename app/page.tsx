import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import StructuredData from "@/components/StructuredData";
import Frame from "./_home/Frame";
import Hero from "./_home/Hero";
import Finder from "./_home/Finder";
import LoopDial from "./_home/LoopDial";
import Coach from "./_home/Coach";
import Conditions from "./_home/Conditions";
import Diary from "./_home/Diary";
import Refer from "./_home/Refer";
import Terms from "./_home/Terms";
import Franchise from "./_home/Franchise";
import OpenMenu from "./_home/OpenMenu";
import Chapter from "./_home/Chapter";
import TheDay from "./_home/TheDay";
import Reveal from "./_home/Reveal";
import CountUp from "./_home/CountUp";
import { BG, INK, MUTE, DIM, RULE, LIME, COND, WRAP, huge, mid, copy, tag } from "./_home/theme";

/* ══════════════════════════════════════════════════════════════════
   FITFUEL HOMEPAGE

   This is a SERVER component. It used to carry "use client" at the top,
   which pushed all 570 lines plus framer-motion into the browser bundle
   for a page that is ~95% static. Only four things here actually need
   the client, and they now live in ./_home as islands: Hero (scroll
   parallax), Finder (selection state), CountUp (rAF), and Reveal (the
   in-view fade, which takes server-rendered children so wrapping a
   section in it does not drag that section's markup client-side).

   Anti-slop constraints, held deliberately:
   · Body type is Archivo (set in layout), never Inter.
   · Square corners. Radius 0. No rounded-card grids.
   · Extreme type scale: display runs to 11rem against 15px body.
     Weights are 900 or 400, never the lukewarm middle.
   · No "kicker label + headline + paragraph + three cards" rhythm.
     Every block is structured differently on purpose.
   · Photography is art-directed full-bleed with one unified grade
     (food keeps colour for appetite, people/places take a lime
     duotone) so it reads as designed, not as stock dropped in slots.
   · Every service the business runs is on this page, linked, and
     reachable WITHOUT an account.
   No em dashes.
══════════════════════════════════════════════════════════════════ */

export default function Home() {
  return (
    // overflow-x is `clip`, NOT `hidden`. `hidden` on one axis forces the
    // other axis to compute to `auto`, which silently turns this wrapper
    // into a scroll container. That broke the loop dial: its ViewTimeline
    // bound to this div as its scroll source instead of the document, and
    // since the div is sized to its content it never scrolls, so the
    // timeline stayed inactive and the ring never turned. `clip` clips
    // without establishing a scroll container.
    <div style={{ background: BG, color: INK, overflowX: "clip" }}>
      {/* Organization / FoodEstablishment / Service / WebSite graph.
          Server-rendered, so it is in the initial HTML for crawlers and
          answer engines rather than appearing after hydration. */}
      <StructuredData />

      {/* ── OPENING: what it is, one clear breath ─────────────────────────
          Hero states the offer plainly; Pillars is the whole thing in four
          numbers; Finder lets you try it; Statement is the thesis for why one
          system beats three separate tools. Then the four chapters below
          organise the deep dives so the long page has a spine and a reader
          always knows which act they are in. Nothing is cut. */}
      <Hero />
      {/* ACT ONE: the film. One day, told as a pinned horizontal sequence
          on desktop and a native swipe carousel on mobile. The page opens
          as a story before it opens as a catalogue. */}
      <TheDay />
      <Pillars />
      {/* Finder sits directly under the hero: it is the cheapest
          conversion step on the page and the hero subhead describes it. */}
      <Finder />
      <Statement />

      {/* ── 01 · EAT ─────────────────────────────────────────────────── */}
      <Chapter n="01" label="Eat" line="Food built for your body, cooked and delivered daily" id="eat" />
      {/* 70 of 126 plans are condition-specific across 38 conditions. */}
      <Conditions />
      {/* 60-day cycle, 100% public menu (Decision #43): nobody else shows
          the whole menu. */}
      <OpenMenu />
      <Kitchen />
      {/* Supplements are part of what you eat, matched to your plan, so they
          live in the Eat chapter rather than mid-Track. */}
      <Supplements />

      {/* ── 02 · TRACK ───────────────────────────────────────────────── */}
      <Chapter n="02" label="Track" line="Every gram measured, not guessed" id="track" />
      <AppBlock />
      {/* 154-food diary + water tracking. */}
      <Diary />

      {/* ── 03 · THE SYSTEM ──────────────────────────────────────────── */}
      <Chapter n="03" label="The system" line="It watches the week so you do not have to" id="system" />
      <LoopDial />
      {/* The coach and the daily comms loop. Runs the loop, so it follows it. */}
      <Coach />

      {/* ── 04 · JOIN ────────────────────────────────────────────────── */}
      <Chapter n="04" label="Join" line="Eat with us, earn with us, build with us" id="join" />
      <Partners />
      <Franchise />
      <Membership />
      {/* 7 durations, delivery windows, PayU + COD, digital plans. */}
      <Terms />
      <Voices />
      {/* Rs 500 referral credit loop. */}
      <Refer />
      {/* Trimmed index near the foot; the Footer carries full completeness. */}
      <ServiceMap />
      <Close />
    </div>
  );
}

/* ═══ PILLARS: four hard columns ═══ */
function Pillars() {
  /* Was four names over four one-line captions. The captions already
     contained the numbers that make the claim land, so the figure now
     leads at display scale and the caption explains it. Same information,
     an order of magnitude more weight. */
  const p: [string, string, string, string, string][] = [
    ["Kitchen", "126", "plans", "Cooked daily in Kharadi", "/plans"],
    ["App", "952", "exercises", "Logged with your meals", "/how-it-works"],
    ["Supplements", "46", "in the stack", "Matched, bought via Nutrabay", "/supplements"],
    ["Partners", "15", "areas served", "Gyms, offices, franchise", "/partners/apply"],
  ];
  return (
    // These four are the top-level map of the business, so they carry
    // heading semantics rather than being anonymous divs. The section
    // heading itself is visually redundant next to the hero, so it is
    // available to assistive tech only.
    <section aria-labelledby="pillars-heading" style={{ borderBottom: `1px solid ${RULE}` }}>
      <h2 id="pillars-heading" className="sr-only">What FitFuel runs</h2>
      <div style={{ ...WRAP, display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: 0 }} className="ff-4col">
        {p.map(([t, fig, unit, d, href], i) => (
          <Link key={t} href={href} className="ff-strip ff-pillar" style={{ display: "block", padding: "clamp(24px,3vw,38px) clamp(16px,2vw,32px) clamp(26px,3.2vw,40px)", borderLeft: i === 0 ? "none" : `1px solid ${RULE}`, textDecoration: "none", transition: "background .2s" }}>
            <h3 style={{ ...tag(DIM), fontSize: 12.5 }}>{t}</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 14 }}>
              <span style={{ ...huge("clamp(2.6rem,4.6vw,3.9rem)"), lineHeight: 0.82 }}>{fig}</span>
              <span style={{ ...mid("clamp(.95rem,1.3vw,1.15rem)"), color: MUTE }}>{unit}</span>
            </div>
            <div style={{ ...copy(13.5), marginTop: 12 }}>{d}</div>
            {/* The rule draws in as the column enters, walking the eye
                left to right instead of landing all four at once. */}
            <span className="ff-pillar-rule" aria-hidden style={{ ["--i" as string]: i }} />
            <span className="ff-pillar-go" aria-hidden style={{ ...tag(LIME), fontSize: 12, display: "inline-block", marginTop: 14 }}>
              View <ArrowRight size={12} style={{ verticalAlign: "-1px" }} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ═══ STATEMENT ═══
   Was a headline plus one right-floated paragraph inside 150px of padding
   top and bottom: a 716px-tall section holding two text nodes and a lot of
   nothing. The copy was already making a three-against-one argument in
   prose, so it is drawn as one now. Depth from the idea, not from ornament.
*/
function Statement() {
  const them: [string, string, string][] = [
    ["A tiffin", "Cooks your food", "Never tracks it"],
    ["An app", "Tracks your food", "Only what you type in"],
    ["A supplement brand", "Sells you pills", "With no plan behind them"],
  ];
  return (
    <section style={{ padding: "clamp(70px,8vw,110px) 0 0" }}>
      <div style={WRAP}>
        <Reveal>
          <h2 style={{ ...huge("clamp(2.4rem,7.5vw,6.4rem)"), maxWidth: "17ch" }}>
            Every app trusts you to log it. <span style={{ color: LIME }}>We already know.</span>
          </h2>
        </Reveal>
      </div>

      {/* Three columns of what everyone else stops short of, then the one
          row that does all of it. The rule between them is the argument. */}
      <div style={{ marginTop: "clamp(40px,5vw,72px)", borderTop: `1px solid ${RULE}` }}>
        <div style={{ ...WRAP, padding: 0 }}>
          <div className="ff-vs" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
            {them.map(([who, does, stops], i) => (
              <Reveal key={who} delay={i * 0.07}>
                <div style={{ padding: "clamp(26px,3vw,42px) clamp(18px,2.4vw,36px) clamp(30px,3.6vw,52px)", borderLeft: i === 0 ? "none" : `1px solid ${RULE}`, height: "100%" }}>
                  <div style={{ ...mid("clamp(1.3rem,2.1vw,1.75rem)"), color: DIM }}>{who}</div>
                  <div style={{ ...copy(15), marginTop: 18, color: MUTE }}>{does}</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginTop: 8 }}>
                    {/* The gap in each competitor's offer.
                        Hierarchy is carried by the strike-through and the
                        wording, NOT by dimming the text: the first pass at
                        this used #6f6f69 and #4a4a45, which read as
                        "lesser" but computed to 3.98:1 and 2.26:1 and
                        failed AA. Both are on the audited ramp now. */}
                    <span aria-hidden style={{ color: DIM, fontSize: 15 }}>&times;</span>
                    <span className="ff-strike" style={{ ...copy(15), color: DIM, textDecoration: "line-through", textDecorationColor: "#55554f" }}>{stops}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* The answer row, welded across the full width and lit. */}
      <Reveal delay={0.12}>
        <div style={{ borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, background: "rgba(132,204,22,.05)" }}>
          <div style={{ ...WRAP, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "clamp(18px,4vw,56px)", padding: "clamp(26px,3.4vw,44px) clamp(18px,4vw,56px)" }}>
            <div style={{ ...huge("clamp(1.9rem,4vw,3.2rem)"), color: LIME, flexShrink: 0 }}>FitFuel</div>
            <div style={{ ...copy(16.5), maxWidth: "52ch", color: INK }}>
              Cooks it, weighs it, and matches the stack. The macros are measured in our kitchen, not guessed at by you.
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ═══ SERVICE MAP: everything the business runs, linked ═══ */
function ServiceMap() {
  /* Every href here must be reachable LOGGED OUT. Five of these used to
     point at /dashboard/* routes, which 307 to the sign-in wall: a third of
     a section that presents itself as a public index of the business was
     bouncing prospects into a login form. Public equivalents only. */
  const cols: [string, [string, string][]][] = [
    ["Eat", [
      ["All 126 meal plans", "/plans"],
      ["Medical and lifestyle", "/plans?category=LIFESTYLE_MEDICAL"],
      ["Sports nutrition", "/plans?category=SPORTS"],
      ["Digital PDF plans", "/plans/digital"],
      ["Trial day, Rs 400", "/plans?trial=true"],
      ["Delivery areas in Pune", "/locations"],
    ]],
    ["Track", [
      ["How the system works", "/how-it-works"],
      ["TDEE calculator, free", "/tdee-calculator"],
      ["Member results", "/results"],
      ["Reviews", "/testimonials"],
      ["Questions, answered", "/faq"],
    ]],
    ["Supplement", [
      ["The stack, via Nutrabay", "/supplements"],
      ["Our ingredients", "/our-ingredients"],
      ["Inside our kitchen", "/our-kitchen"],
      ["Journal", "/blog"],
    ]],
    ["Partner", [
      ["Corporate wellness", "/corporate"],
      ["Gyms and trainers", "/partners/apply"],
      ["Franchise enquiry", "/contact"],
      ["About FitFuel", "/about"],
      ["The team", "/our-team"],
    ]],
  ];
  return (
    <section style={{ padding: "clamp(70px,9vw,120px) 0", borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, background: "#050504" }}>
      <div style={WRAP}>
        <Reveal>
          <h2 style={{ ...huge("clamp(2.2rem,6vw,4.6rem)"), maxWidth: "20ch" }}>Everything we run, end to end</h2>
        </Reveal>
        <div className="ff-svcmap" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "clamp(24px,3vw,44px)", marginTop: "clamp(36px,5vw,64px)" }}>
          {cols.map(([head, items]) => (
            <div key={head} className="ff-svc-col">
              <div className="ff-svc-head" style={{ ...tag(LIME), paddingBottom: 12, borderBottom: `2px solid ${LIME}`, marginBottom: 6 }}>{head}</div>
              {items.map(([label, href]) => (
                <Link key={label + href} href={href} className="ff-svc">{label}</Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* Reusable full-bleed editorial block. Alternates side, no cards. */
function Bleed({ src, alt, duo, flip, title, body, href, cta, points }: {
  src: string; alt: string; duo?: boolean; flip?: boolean; title: string; body: string; href: string; cta: string; points?: string[];
}) {
  return (
    <section className="ff-hov" style={{ borderTop: `1px solid ${RULE}` }}>
      <div className="ff-2col" style={{ display: "grid", gridTemplateColumns: flip ? "1fr 1.1fr" : "1.1fr 1fr", direction: flip ? "rtl" : "ltr" }}>
        {/* The photo drifts slower than the page as it passes, so the two
            halves of the block separate in depth instead of sliding as one
            flat slab. Seventh mechanism: scroll-driven translate on the
            image inside an overflow-clipped frame. */}
        <div className="ff-bleed ff-para" style={{ position: "relative", minHeight: "clamp(360px,46vw,620px)", direction: "ltr", overflow: "hidden" }}>
          <Frame src={src} alt={alt} sizes="(max-width:1000px) 100vw, 52vw" duo={duo} />
        </div>
        <div style={{ direction: "ltr", display: "flex", alignItems: "center", padding: "clamp(38px,6vw,84px) clamp(20px,4vw,64px)", background: BG }}>
          <div style={{ maxWidth: 540 }}>
            <Reveal>
              <h2 style={huge("clamp(2.1rem,5.4vw,4.2rem)")}>{title}</h2>
              <p style={{ ...copy(16), marginTop: 22 }}>{body}</p>
              {points ? (
                <div style={{ marginTop: 28, borderTop: `1px solid ${RULE}` }}>
                  {points.map((p) => (
                    <div key={p} style={{ display: "flex", gap: 14, padding: "11px 0", borderBottom: `1px solid ${RULE}` }}>
                      <span style={{ color: LIME, fontFamily: COND, fontWeight: 900, fontSize: 15 }}>/</span>
                      <span style={copy(14.5)}>{p}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              <div style={{ marginTop: 30 }}><Link href={href} className="ff-a">{cta} <ArrowRight size={17} /></Link></div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Kitchen() {
  return <Bleed src="/images/kitchen.jpg" alt="A chef plating meals in the FitFuel kitchen" title="The kitchen"
    body="Cooked from 04:00 in our FSSAI-licensed Kharadi kitchen and at your door by 08:00, six days a week. Every portion is weighed to your macros before it is sealed."
    points={["126 goal and condition plans", "Veg, egg, non-veg and Jain", "Delivery, packaging and GST included"]}
    href="/our-kitchen" cta="Inside our kitchen" />;
}

function AppBlock() {
  return <Bleed src="/images/training.jpg" alt="An athlete training, tracked in the FitFuel app" duo flip title="The app"
    body="Your meals arrive already logged. Train from 59 programs built around your plan, drawing on a 952-exercise library, and the burn feeds one net-calorie figure against a target that moves when you plateau."
    points={["59 programs, 413 training days, sets and reps set", "Net calories, water and body metrics", "One consistency score, zero to a hundred"]}
    href="/how-it-works" cta="See the system" />;
}

function Supplements() {
  return <Bleed src="/images/supplements.jpg" alt="Preparing a protein shake" title="The supplements"
    body="A stack matched to your plan and your condition, not a wall of pills. Each one carries its evidence grade, the trial count behind it, the clinical dose, the interactions to avoid and whether you can actually buy it in India. Then you order through Nutrabay at their price."
    points={["46 supplements, graded by evidence", "Clinical doses, warnings and interactions", "India availability, ordered via Nutrabay"]}
    href="/supplements" cta="Browse the stack" />;
}

function Partners() {
  return (
    <section style={{ borderTop: `1px solid ${RULE}`, padding: "clamp(70px,9vw,120px) 0" }}>
      <div style={WRAP}>
        <Reveal><h2 style={{ ...huge("clamp(2.2rem,6vw,4.6rem)"), maxWidth: "16ch" }}>We also feed teams and gyms</h2></Reveal>
        {/* The partner program takes seven professional types, not two.
            Naming them makes the breadth legible; the two cards below are
            the entry points. */}
        <Reveal delay={0.04}>
          <p style={{ ...copy(16), maxWidth: "62ch", marginTop: 20 }}>
            Gyms, personal trainers, influencers, dieticians, doctors, offices and residential
            societies all run on FitFuel. QR onboarding, live client tracking and monthly payouts,
            with a commission on every member who eats to their macros.
          </p>
        </Reveal>
        <div className="ff-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginTop: "clamp(28px,3.4vw,44px)" }}>
          {[
            { src: "/images/corporate.jpg", alt: "A team at work in a Pune office", t: "Corporate wellness", d: "Subsidised, condition-specific meal programs for Pune offices, with reporting your HR team can actually use.", href: "/corporate", cta: "For your team" },
            { src: "/images/gym.jpg", alt: "A gym floor with dumbbells", t: "Gyms and trainers", d: "Your members eat to their macros and you earn on every one. QR onboarding, live client tracking and monthly payouts.", href: "/partners/apply", cta: "Become a partner" },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 0.08}>
              <Link href={c.href} className="ff-hov" style={{ display: "block", position: "relative", minHeight: "clamp(360px,38vw,480px)", height: "100%", textDecoration: "none" }}>
                <Frame src={c.src} alt={c.alt} sizes="(max-width:1000px) 100vw, 50vw" duo className="ff-unveil" />
                <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(5,5,4,.94) 6%, rgba(5,5,4,.3) 62%)" }} />
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "clamp(24px,3vw,40px)" }}>
                  <h3 style={mid("clamp(1.7rem,3.2vw,2.6rem)")}>{c.t}</h3>
                  <p style={{ ...copy(14.5), color: "#c6c6c0", marginTop: 12, maxWidth: "42ch" }}>{c.d}</p>
                  <span className="ff-a" style={{ marginTop: 20, fontSize: 16 }}>{c.cta} <ArrowRight size={15} /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ═══ MEMBERSHIP ═══ */
function Membership() {
  const tiers = [
    { name: "Free", price: "Rs 0", href: "/auth/signin", cta: "Create account" },
    { name: "Standard", price: "from Rs 112 / meal", href: "/plans", cta: "Start a plan", on: true },
    { name: "Premium", price: "Waitlist", href: "/plans", cta: "Join waitlist" },
    { name: "Luxury", price: "Waitlist", href: "/plans", cta: "Join waitlist" },
  ];
  /* "AI trainer chat" was listed as a shipping Luxury feature. There is no
     AI anywhere in the codebase, so it has been removed rather than sold. */
  const matrix: [string, boolean[]][] = [
    ["Full menus and macros", [true, true, true, true]],
    ["Meal delivery", [false, true, true, true]],
    ["Per-gram logging and net calories", [false, true, true, true]],
    ["Body metrics and recalibration", [false, true, true, true]],
    ["Consistency score and digest", [false, true, true, true]],
    ["Linked workout schedule", [false, false, true, true]],
    ["Personalised supplement stack", [false, false, true, true]],
    ["Weekly progress PDF", [false, false, true, true]],
    ["Nutritionist consult", [false, false, false, true]],
  ];
  const cell: CSSProperties = { padding: "14px 12px", textAlign: "center", borderLeft: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}` };
  return (
    <section style={{ padding: "clamp(70px,9vw,120px) 0", borderTop: `1px solid ${RULE}`, background: "#050504" }}>
      <div style={WRAP}>
        <Reveal><h2 id="tiers-heading" style={huge("clamp(2.2rem,6vw,4.6rem)")}>Pick your level</h2></Reveal>
        <Reveal delay={0.05} style={{ marginTop: "clamp(30px,4vw,52px)" }}>
          {/* This was ten rows by four tiers of comparison data built out of
              CSS-grid divs, with inclusion encoded as a bare "✓" or "·"
              glyph. A screen reader got an unassociated stream of "check,
              middle dot" with no idea which tier a cell belonged to, and the
              "·" sat at 1.5:1 so sighted low-vision users saw nothing either.
              It is a real <table> now, with scoped headers and a text
              alternative on every cell.

              tabIndex + role=group make the horizontal scroller keyboard
              reachable, which an overflow container is not by default. */}
          {/* The scan line lives on this OUTER wrapper, not on the
              horizontal scroller below it: an overflow container would clip
              the line's glow and scroll it sideways with the table. */}
          <div className="ff-tiers-wrap">
          <div
            role="group"
            aria-labelledby="tiers-heading"
            tabIndex={0}
            style={{ overflowX: "auto", borderTop: `1px solid ${RULE}` }}
          >
            <table className="ff-tiers" style={{ minWidth: 680, width: "100%", borderCollapse: "collapse" }}>
              <caption className="sr-only">
                Feature comparison across the Free, Standard, Premium and Luxury membership tiers.
              </caption>
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">Feature</span></th>
                  {tiers.map((t) => (
                    <th key={t.name} scope="col" style={{ padding: "20px 12px", textAlign: "left", verticalAlign: "top", borderLeft: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, background: t.on ? "rgba(132,204,22,.07)" : "transparent" }}>
                      <span style={{ ...mid("1.7rem"), display: "block", color: t.on ? LIME : INK }}>{t.name}</span>
                      <span style={{ ...copy(12.5), display: "block", color: DIM, marginTop: 5 }}>{t.price}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map(([label, marks]) => (
                  <tr key={label} className="ff-strip" style={{ transition: "background .2s" }}>
                    <th scope="row" style={{ ...copy(14), fontWeight: 400, textAlign: "left", padding: "14px 16px 14px 0", borderBottom: `1px solid ${RULE}` }}>{label}</th>
                    {marks.map((m, ci) => (
                      <td key={tiers[ci].name} style={{ ...cell, background: ci === 1 ? "rgba(132,204,22,.04)" : "transparent" }}>
                        <span aria-hidden style={{ color: m ? (ci === 1 ? LIME : MUTE) : DIM, fontSize: 15 }}>{m ? "✓" : "—"}</span>
                        <span className="sr-only">{m ? "Included" : "Not included"}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td />
                  {tiers.map((t) => (
                    <td key={t.name} style={{ padding: "16px 10px", borderLeft: `1px solid ${RULE}` }}>
                      {t.on
                        ? <Link href={t.href} className="ff-btn" style={{ display: "block", textAlign: "center", fontSize: 14, padding: "13px 8px" }}>{t.cta}</Link>
                        : <Link href={t.href} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 44, ...tag(MUTE), fontSize: 12.5, textDecoration: "none" }}>{t.cta} <span className="sr-only">, {t.name} tier</span></Link>}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
          </div>
          <p style={{ ...copy(13), color: DIM, marginTop: 14 }} className="ff-scroll-hint">Scroll the table sideways to compare all four tiers.</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ VOICES ═══
   Was three quotes floating under 120px of empty padding, with no heading
   and nothing to anchor the eye. The outcome is the actual proof, so the
   number now leads and the quote supports it. */
function Voices() {
  const q = [
    { fig: "9", unit: "kg down", months: "4 months", q: "Never felt like I was on a diet. The food just showed up and I ate it.", n: "Rhea M.", r: "Weight Loss, Kharadi" },
    { fig: "40", unit: "clients sent", months: "18 months", q: "As a trainer I send clients here. The macros are dialled in and my members stick to it.", n: "Aditya K.", r: "Partner, Baner" },
    { fig: "92", unit: "consistency", months: "6 months", q: "The PCOS plan sorted my energy and my cycles. Cooked, delivered, done.", n: "Sneha P.", r: "PCOS, Viman Nagar" },
  ];
  return (
    <section aria-labelledby="voices-heading" style={{ padding: "clamp(60px,7vw,96px) 0", borderTop: `1px solid ${RULE}`, background: "#050504" }}>
      <div style={WRAP}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: "clamp(28px,3.4vw,46px)" }}>
            <h2 id="voices-heading" style={{ ...huge("clamp(2.2rem,6vw,4.6rem)"), maxWidth: "16ch" }}>People who stopped guessing</h2>
            <Link href="/results" className="ff-a">See the results <ArrowRight size={17} /></Link>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", borderTop: `1px solid ${RULE}` }}>
          {q.map((t, i) => (
            <Reveal key={t.n} delay={i * 0.07}>
              <figure style={{ margin: 0, padding: "clamp(28px,3vw,40px) clamp(20px,2.2vw,34px) clamp(30px,3vw,40px)", borderLeft: i === 0 ? "none" : `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, height: "100%", display: "flex", flexDirection: "column" }}>
                {/* The result, at display scale. This is the claim the
                    quote underneath is evidence for. */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span className="ff-voice-fig" style={{ ...huge("clamp(3.2rem,6vw,4.8rem)"), color: LIME, lineHeight: 0.8, display: "inline-block", ["--i" as string]: i }}>{t.fig}</span>
                  <span style={{ ...mid("clamp(1rem,1.4vw,1.2rem)"), color: MUTE }}>{t.unit}</span>
                </div>
                <div style={{ ...copy(13.5), color: DIM, marginTop: 10, paddingBottom: 20, borderBottom: `1px solid ${RULE}` }}>in {t.months}</div>

                <blockquote style={{ margin: "22px 0 0", ...copy(15.5), color: MUTE, flex: 1 }}>{t.q}</blockquote>

                <figcaption style={{ marginTop: 24 }}>
                  <div style={{ ...copy(14), color: INK }}>{t.n}</div>
                  <div style={{ ...tag(DIM), fontSize: 12, marginTop: 4 }}>{t.r}</div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal style={{ marginTop: 30 }}><Link href="/testimonials" className="ff-a">All reviews <ArrowRight size={17} /></Link></Reveal>
      </div>
    </section>
  );
}

/* ═══ CLOSE ═══ */
function Close() {
  return (
    <section className="ff-close-push" style={{ position: "relative", overflow: "hidden", borderTop: `1px solid ${RULE}` }}>
      <div style={{ position: "relative", minHeight: "min(78vh,700px)", display: "flex", alignItems: "center" }}>
        <Frame src="/images/produce.jpg" alt="Fresh vegetables prepared for the kitchen" sizes="100vw" />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(7,7,7,.95) 12%, rgba(7,7,7,.6) 62%, rgba(7,7,7,.4))" }} />
        <div style={{ ...WRAP, position: "relative", padding: "clamp(60px,9vw,110px) clamp(18px,4vw,56px)" }}>
          <Reveal>
            <h2 style={huge("clamp(3rem,10vw,8.5rem)")}>Start the trial day.<br /><span style={{ color: LIME }}>Rs 400.</span></h2>
            <p style={{ ...copy(17), maxWidth: "42ch", marginTop: 26 }}>Breakfast plus lunch, delivered tomorrow. No lock-in, no commitment.</p>
            <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap", marginTop: 36 }}>
              <Link href="/plans?trial=true" className="ff-btn">Start your trial day</Link>
              <Link href="/plans" className="ff-a">All plans <ArrowRight size={17} /></Link>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 30px", marginTop: 44, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.14)" }}>
              {[[<CountUp key="a" to={126} />, "Plans"], [<CountUp key="b" to={952} />, "Exercises"], [<span key="c">04:00</span>, "Cooked from"], [<span key="d">08:00</span>, "At your door"]].map(([v, l], i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "baseline", gap: 9 }}>
                  <span style={{ fontFamily: COND, fontWeight: 900, fontSize: 26, color: INK }}>{v}</span>
                  <span style={{ ...tag(DIM), fontSize: 12 }}>{l}</span>
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
