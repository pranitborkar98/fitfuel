// app/partners/page.tsx
//
// The partner programme, readable without an account.
//
// Before this page existed, /partners was a 404 and every partner entry point
// on the site (the eight homepage tiles, the footer's "Partner Program", the
// Partners pillar, the service map) pointed straight at /partners/apply, whose
// first statement is redirect("/auth/signin"). A gym owner, a dietician or a
// company evaluating FitFuel hit a login wall before reading a single term.
// The programme was fully built in the database and completely unsellable.
//
// This is the surface that was missing: what the eight programmes are, how
// attribution actually runs, who is in the network, what the commercials are.
// /partners/apply stays exactly as it is, the signed-in form at the end of it.
//
// SERVER COMPONENT. The only client island is Reveal.

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/app/_home/Reveal";
import { WRAP, RULE, LIME, INK, MUTE, DIM, huge, mid, copy, tag } from "@/app/_home/theme";
import {
  PROGRAMS,
  ATTRIBUTION,
  NETWORK_GROUPS,
  INTEGRATIONS,
  PAYOUT_TERMS,
  NETWORK_STATS,
} from "@/lib/partner-network";

export const metadata: Metadata = {
  title: "Partner Programme",
  description:
    "Gyms, trainers, creators, dieticians, doctors, companies and societies earn on every " +
    "client who eats to their macros. Eight programmes, five reward models, QR attribution " +
    "and monthly payouts, run from a dashboard rather than a spreadsheet.",
  alternates: { canonical: "/partners" },
  openGraph: {
    title: "Partner with FitFuel",
    description:
      "Eight partner programmes, five reward models, QR attribution and monthly payouts.",
    url: "https://fitfuel.in/partners",
    type: "website",
  },
};

/* Index header: the spine of every page in this system.
   [ 001 ]  SECTION LABEL ──────────────────────────────── */
function IndexHead({ n, label }: { n: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "clamp(26px,3.4vw,44px)" }}>
      <span style={{ ...tag(LIME), fontSize: 12 }}>[ {n} ]</span>
      <span style={{ ...tag(DIM), fontSize: 12 }}>{label}</span>
      <span aria-hidden style={{ flex: 1, height: 1, background: RULE }} />
    </div>
  );
}

/* Status pill is a word, not a colour. Colour alone would fail the
   "never encode meaning in a glyph" rule, and these rows are the difference
   between a signed partner and a reserved slot. */
function Status({ live }: { live: boolean }) {
  return (
    <span
      style={{
        ...tag(live ? LIME : DIM),
        fontSize: 11.5,
        letterSpacing: "0.22em",
        whiteSpace: "nowrap",
      }}
    >
      {live ? "Live" : "In onboarding"}
    </span>
  );
}

export default function PartnersPage() {
  return (
    <div style={{ background: "var(--ff-bg)" }}>
      {/* ═══ MASTHEAD ═══ */}
      <section style={{ padding: "clamp(60px,8vw,110px) 0 0" }}>
        <div style={WRAP}>
          <Reveal>
            <span style={tag(LIME)}>Partner programme</span>
            <h1 style={{ ...huge("clamp(2.6rem,7.4vw,6.2rem)"), maxWidth: "14ch", marginTop: 18 }}>
              Everyone who sends us a client earns
            </h1>
          </Reveal>
          <Reveal delay={0.05}>
            <p style={{ ...copy(17), maxWidth: "58ch", marginTop: "clamp(22px,3vw,34px)" }}>
              Eight ways to work with FitFuel, all of them live in the product today. You get a
              code and a QR, every scan is attributed before the signup, and you watch the whole
              thing from your own dashboard. Payouts run monthly against records you can see from
              your side.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: "clamp(26px,3.4vw,40px)" }}>
              <Link href="/partners/apply" className="ff-btn">
                Apply to partner
              </Link>
              <Link href="/contact" className="ff-a" style={{ alignSelf: "center" }}>
                Talk to a founder <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Readout bar welded to the section edge. Every figure is computed
            from the data file or stated elsewhere on the site, never typed
            in by hand here. */}
        <div style={{ marginTop: "clamp(48px,6vw,84px)", borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}` }}>
          <div style={{ ...WRAP, display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: 0 }} className="ff-4col">
            {[
              [String(NETWORK_STATS.programmes), "Programmes"],
              [String(NETWORK_STATS.rewardModels), "Reward models"],
              [String(NETWORK_STATS.areasServed), "Areas served"],
              ["Monthly", "Payout cycle"],
            ].map(([fig, label], i) => (
              <div
                key={label}
                style={{
                  padding: "clamp(22px,2.8vw,34px) clamp(16px,2vw,30px)",
                  borderLeft: i === 0 ? "none" : `1px solid ${RULE}`,
                }}
              >
                <div style={{ ...huge("clamp(1.9rem,3.4vw,2.9rem)"), lineHeight: 0.84 }}>{fig}</div>
                <div style={{ ...tag(DIM), fontSize: 12, marginTop: 12 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 001 THE EIGHT PROGRAMMES ═══
          A real table, because this is tabular: eight rows against the same
          four attributes. A grid of eight cards would say the same thing and
          be unreadable to a screen reader. */}
      <section aria-labelledby="programmes-heading" style={{ padding: "clamp(64px,8vw,110px) 0" }}>
        <div style={WRAP}>
          <IndexHead n="001" label="The programmes" />
          <Reveal>
            <h2 id="programmes-heading" style={{ ...huge("clamp(2.1rem,5.4vw,4.2rem)"), maxWidth: "18ch" }}>
              Eight programmes, five reward models
            </h2>
          </Reveal>
          <Reveal delay={0.04}>
            <p style={{ ...copy(16), maxWidth: "62ch", marginTop: 20 }}>
              Each of these is a partner type in the database with its own reward model, and each
              is selectable on the application form. The reward model is set per partner, so a gym
              taking vouchers and a gym taking cash are both normal.
            </p>
          </Reveal>

          <div style={{ overflowX: "auto", marginTop: "clamp(30px,4vw,48px)" }}>
            <table className="ff-table ff-prog-table">
              <caption className="sr-only">
                The eight FitFuel partner programmes, who each is for, the reward model, and what
                the partner receives.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Programme</th>
                  <th scope="col">Who it is for</th>
                  <th scope="col">Reward</th>
                  <th scope="col">What you get</th>
                </tr>
              </thead>
              <tbody>
                {PROGRAMS.map((p) => (
                  <tr key={p.type}>
                    <th scope="row" style={{ ...mid("clamp(1.05rem,1.7vw,1.35rem)"), paddingRight: 24, whiteSpace: "nowrap" }}>
                      {p.label}
                    </th>
                    <td style={{ color: MUTE, minWidth: 220 }}>{p.who}</td>
                    <td style={{ color: INK, fontWeight: 600, minWidth: 150 }}>{p.rewardLine}</td>
                    <td style={{ color: MUTE, minWidth: 280 }}>{p.gets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ ...copy(13.5), color: DIM, marginTop: 22, maxWidth: "62ch" }}>
            Customers do not apply. Every FitFuel account already carries a referral code, on the
            referrals page inside the dashboard.
          </p>
        </div>
      </section>

      {/* ═══ 002 ATTRIBUTION ═══
          The differentiator. Each step names the mechanism, because the claim
          is that this is running software and not a monthly promise. */}
      <section
        aria-labelledby="attribution-heading"
        style={{ padding: "clamp(64px,8vw,110px) 0", borderTop: `1px solid ${RULE}`, background: "#050504" }}
      >
        <div style={WRAP}>
          <IndexHead n="002" label="How attribution runs" />
          <Reveal>
            <h2 id="attribution-heading" style={{ ...huge("clamp(2.1rem,5.4vw,4.2rem)"), maxWidth: "17ch" }}>
              You do not have to trust our arithmetic
            </h2>
          </Reveal>
          <Reveal delay={0.04}>
            <p style={{ ...copy(16), maxWidth: "62ch", marginTop: 20 }}>
              The usual referral deal asks you to send people somewhere and believe a number that
              arrives at the end of the month. Attribution here is a record at every step, and you
              hold a login to the same record.
            </p>
          </Reveal>

          <ol className="ff-attr" style={{ marginTop: "clamp(32px,4vw,52px)" }}>
            {ATTRIBUTION.map((s) => (
              <li key={s.n} className="ff-attr-row">
                <span aria-hidden style={{ ...huge("clamp(1.5rem,2.6vw,2.1rem)"), color: LIME }}>
                  {s.n}
                </span>
                <div>
                  <h3 style={mid("clamp(1.25rem,2.2vw,1.75rem)")}>{s.title}</h3>
                  <p style={{ ...copy(15), marginTop: 10, maxWidth: "54ch" }}>{s.body}</p>
                </div>
                <span style={{ ...tag(DIM), fontSize: 12, lineHeight: 1.5, letterSpacing: "0.16em" }}>
                  {s.backed}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══ 003 THE NETWORK ═══
          Reserved slots, printed as reserved slots. Every row states its own
          status, and the note below says what the names are. A placeholder
          rendered as a signed partner would be a false claim to a customer. */}
      <section aria-labelledby="network-heading" style={{ padding: "clamp(64px,8vw,110px) 0", borderTop: `1px solid ${RULE}` }}>
        <div style={WRAP}>
          <IndexHead n="003" label="The network" />
          <Reveal>
            <h2 id="network-heading" style={{ ...huge("clamp(2.1rem,5.4vw,4.2rem)"), maxWidth: "16ch" }}>
              Who we are onboarding
            </h2>
          </Reveal>
          <Reveal delay={0.04}>
            <p style={{ ...copy(16), maxWidth: "62ch", marginTop: 20 }}>
              The programme opened with the kitchen, so the network is being built now, across the
              15 areas we already deliver to. Every entry below carries its real status. Nothing on
              this page is described as a partner until it is one.
            </p>
          </Reveal>

          <div className="ff-netcols" style={{ marginTop: "clamp(32px,4vw,52px)" }}>
            {NETWORK_GROUPS.map((g) => (
              <div key={g.key} className="ff-netgroup">
                <h3 style={{ ...mid("clamp(1.3rem,2.2vw,1.7rem)"), paddingBottom: 14, borderBottom: `2px solid ${LIME}` }}>
                  {g.label}
                </h3>
                <p style={{ ...copy(13.5), color: DIM, marginTop: 14, maxWidth: "40ch" }}>{g.blurb}</p>
                <ul style={{ listStyle: "none", margin: "18px 0 0", padding: 0 }}>
                  {g.rows.map((o) => (
                    <li key={o.name} className="ff-netrow">
                      <div>
                        <div style={{ fontSize: 15, color: INK, fontWeight: 600 }}>{o.name}</div>
                        <div style={{ ...copy(13), color: DIM, marginTop: 4 }}>
                          {o.area}. {o.detail}.
                        </div>
                      </div>
                      <Status live={o.status === "LIVE"} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p style={{ ...copy(13.5), color: DIM, marginTop: "clamp(26px,3vw,40px)", maxWidth: "72ch" }}>
            Names marked in onboarding are reserved examples of the kind of outlet each programme
            takes, held in place while those conversations run. They are not signed partners and
            are not claimed as such. A row goes live the day the agreement does, and the status on
            it changes with it.
          </p>

          <div style={{ marginTop: "clamp(24px,3vw,36px)" }}>
            <Link href="/partners/apply" className="ff-a">
              Put your name on this list <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 004 INTEGRATIONS ═══ */}
      <section
        aria-labelledby="integrations-heading"
        style={{ padding: "clamp(64px,8vw,110px) 0", borderTop: `1px solid ${RULE}`, background: "#050504" }}
      >
        <div style={WRAP}>
          <IndexHead n="004" label="Integration partners" />
          <Reveal>
            <h2 id="integrations-heading" style={{ ...huge("clamp(2.1rem,5.4vw,4.2rem)"), maxWidth: "18ch" }}>
              What we plug into, and what we do not
            </h2>
          </Reveal>
          <Reveal delay={0.04}>
            <p style={{ ...copy(16), maxWidth: "62ch", marginTop: 20 }}>
              We cook, deliver and track in house. Everything else is somebody who does it better,
              and we would rather name them than pretend the stack is ours.
            </p>
          </Reveal>

          <ul style={{ listStyle: "none", margin: "clamp(30px,4vw,48px) 0 0", padding: 0 }}>
            {INTEGRATIONS.map((it) => (
              <li key={it.name} className="ff-introw">
                <div style={{ ...mid("clamp(1.3rem,2.2vw,1.8rem)") }}>{it.name}</div>
                <div style={{ ...tag(DIM), fontSize: 12 }}>{it.role}</div>
                <p style={{ ...copy(14.5), maxWidth: "56ch", margin: 0 }}>{it.detail}</p>
                <Status live={it.status === "LIVE"} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══ 005 COMMERCIALS ═══ */}
      <section aria-labelledby="terms-heading" style={{ padding: "clamp(64px,8vw,110px) 0", borderTop: `1px solid ${RULE}` }}>
        <div style={WRAP}>
          <IndexHead n="005" label="Commercials" />
          <Reveal>
            <h2 id="terms-heading" style={{ ...huge("clamp(2.1rem,5.4vw,4.2rem)"), maxWidth: "16ch" }}>
              The terms, before you apply
            </h2>
          </Reveal>

          <dl className="ff-terms" style={{ marginTop: "clamp(30px,4vw,48px)" }}>
            {PAYOUT_TERMS.map(([k, v]) => (
              <div key={k} className="ff-termrow">
                <dt style={{ ...tag(INK), fontSize: 13, letterSpacing: "0.2em" }}>{k}</dt>
                <dd style={{ ...copy(15), margin: 0, maxWidth: "62ch" }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ═══ CLOSE ═══ */}
      <section style={{ padding: "clamp(64px,8vw,120px) 0", borderTop: `1px solid ${RULE}`, background: "#050504" }}>
        <div style={WRAP}>
          <Reveal>
            <h2 style={{ ...huge("clamp(2.2rem,6vw,4.8rem)"), maxWidth: "15ch" }}>
              Send us one client and see what lands
            </h2>
          </Reveal>
          <p style={{ ...copy(16.5), maxWidth: "58ch", marginTop: 22 }}>
            Applications are read by a person, not a form robot, and approval is manual on purpose.
            Tell us who you work with and which reward model suits you, and we will set the code up
            on our side.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: "clamp(26px,3.4vw,40px)" }}>
            <Link href="/partners/apply" className="ff-btn">
              Apply to partner
            </Link>
            <Link href="/corporate" className="ff-a" style={{ alignSelf: "center" }}>
              Corporate wellness instead <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
