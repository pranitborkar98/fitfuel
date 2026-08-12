// app/_hp/Network.tsx
//
// THE NETWORK: everyone who sends us customers, and what they get for it.
//
// Partners, referrals and the franchise question each had a full chapter on the
// old homepage — four separate audiences competing with the person who just
// wants dinner. They are real revenue lines and they were then cut to a single
// link each, which was an overcorrection. One section, one table: enough for a
// gym owner to see themselves and click, not enough to derail the main argument.
//
// Reward figures come from lib/partners.ts (REFERRER_REWARD_RS = 500) and the
// PartnerType enum in the schema. Nothing invented.
//
// SERVER COMPONENT.

import Link from "next/link";

import s from "./hp.module.css";
import Idx from "./Idx";
import { WRAP, SECTION, DIM, LIME, display, sub, body } from "./theme";

type Row = { who: string; what: string; gets: string; href: string };

const ROWS: Row[] = [
  {
    who: "Customers",
    what: "Share your code with a friend",
    gets: "Rs 500 credit to you, Rs 500 off for them, paid when their first order completes",
    href: "/dashboard/referrals",
  },
  {
    who: "Gyms",
    what: "Your members eat to the programme you already wrote",
    gets: "Commission per converted member, tracked in your own partner console",
    href: "/partners",
  },
  {
    who: "Trainers",
    what: "Hand nutrition to a kitchen that reports back",
    gets: "Commission, plus your clients' consistency scores where they consent to share",
    href: "/partners",
  },
  {
    who: "Dieticians and doctors",
    what: "Prescribe a condition plan instead of a printout",
    gets: "Referral tracking on 70 condition plans built to a nutritionist's spec",
    href: "/partners",
  },
  {
    who: "Offices",
    what: "Put the whole team on it, on one invoice",
    gets: "Consolidated GST billing, aggregate reporting, per-employee personalisation",
    href: "/corporate",
  },
  {
    who: "Residences",
    what: "Society-wide delivery to one gate",
    gets: "Route density discount, a single drop point, one contact",
    href: "/partners",
  },
  {
    who: "Operators",
    what: "Run a FitFuel kitchen in your city",
    gets: "The production system, the recipe tree and the plan catalogue behind it",
    href: "/contact",
  },
  {
    who: "Events & exhibitions",
    what: "Invite us to your expo, society mela or wellness fair",
    gets: "A staffed FitFuel stall, live sampling and on-the-spot onboarding",
    href: "/contact",
  },
];

export default function Network() {
  return (
    <section aria-labelledby="hp-net" style={SECTION}>
      <div style={WRAP}>
        <Idx label="The network" />

        <div className={s.reveal}>
          <h2 id="hp-net" style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "16ch" }}>
            If you send people to us, you get paid for it
          </h2>
          <p style={{ ...body(16.5), marginTop: 20 }}>
            Referrals, rewards and payouts run on a real ledger with a real status machine:
            clicked, signed up, first order, reward paid. You can see every stage of it from
            your own console rather than asking us for a screenshot.
          </p>
        </div>

        <div className={s.specWrap} style={{ marginTop: "clamp(26px,3.4vw,44px)" }}>
          <table className={s.spec}>
            <caption className="sr-only">Partner types, what they do, and what they earn</caption>
            <thead>
              <tr>
                <th scope="col">Who</th>
                <th scope="col">What you do</th>
                <th scope="col">What you get</th>
                <th scope="col">Where</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.who}>
                  <th scope="row">{r.who}</th>
                  <td>{r.what}</td>
                  <td style={{ color: "#f7f7f5" }}>{r.gets}</td>
                  <td>
                    <Link href={r.href} className={s.link}>
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`${s.stats} ${s.stats3}`} style={{ marginTop: 1 }}>
          <div className={s.stat}>
            <span style={{ ...body(14.5), color: LIME, fontWeight: 600 }}>Status machine</span>
            <div style={{ ...sub("clamp(1.05rem,1.6vw,1.2rem)"), marginTop: 10 }}>
              Clicked → signed up → first order → reward paid
            </div>
          </div>
          <div className={s.stat}>
            <span style={{ ...body(14.5), color: LIME, fontWeight: 600 }}>Reward types</span>
            <div style={{ ...sub("clamp(1.05rem,1.6vw,1.2rem)"), marginTop: 10 }}>
              Credit, cash, meal voucher, discount, or a hybrid
            </div>
          </div>
          <div className={s.stat}>
            <span style={{ ...body(14.5), color: LIME, fontWeight: 600 }}>Your own landing page</span>
            <div style={{ ...sub("clamp(1.05rem,1.6vw,1.2rem)"), marginTop: 10 }}>
              Every partner code gets one at fitfuel.in/p/YOURCODE
            </div>
          </div>
        </div>

        {/* Six invented gym names captioned "Placeholder" removed for the same
            reason as the corporate wall: the grid read as a fabricated partner
            list before anyone got to the caption explaining it wasn't one. The
            heading was also the strongest claim on this section — "already
            talking to us" — resting entirely on fictional tiles. */}
        <div style={{ marginTop: "clamp(30px,4vw,50px)" }}>
          <h3 style={{ ...sub("clamp(1.2rem,2vw,1.5rem)"), marginBottom: 14 }}>
            No partner wall yet
          </h3>
          <p style={{ ...body(15), maxWidth: "68ch" }}>
            A gym&rsquo;s name goes here when it has signed and agreed to appear, and none
            has, so the space is empty rather than filled. The terms above are real and the
            ledger behind them is live &mdash;{" "}
            <Link href="/partners/apply" style={{ color: LIME }}>
              apply to partner
            </Link>{" "}
            and yours is the first.
          </p>
        </div>

        <div className={s.actions} style={{ marginTop: 26 }}>
          <Link href="/partners/apply" className={s.btn}>
            Apply to partner
          </Link>
          <Link href="/partners" className={s.ghost}>
            How the programme works
          </Link>
        </div>

        <p style={{ ...body(13.5), color: DIM, marginTop: 20 }}>
          Customer referrals need no application: your code is already in your dashboard.
        </p>
      </div>
    </section>
  );
}
