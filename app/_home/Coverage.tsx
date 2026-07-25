// app/_home/Coverage.tsx
//
// Where the food actually goes. Fifteen named areas, out from the Kharadi
// kitchen, six days a week.
//
// Every competitor in this category runs this section, because "do you deliver
// to me" is the first question a cold visitor has and the one a homepage full
// of macros never answers. parafit.in runs it as "Our Food Is Delivered To ..."
// across six cities. Ours is one city, deeply, which is the stronger claim when
// the pitch is a 04:00 cook and an 08:00 door: we are not shipping cold boxes
// across the country, we are driving them across east Pune.
//
// The names are also the highest-intent local-SEO surface the site has. They
// existed only on /locations, which nothing linked to.
//
// SERVER COMPONENT. No state, no motion beyond the shared Reveal.

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { DELIVERY_AREAS } from "@/lib/partner-network";
import Reveal from "./Reveal";
import { RULE, LIME, DIM, INK, WRAP, huge, copy, tag } from "./theme";

export default function Coverage() {
  return (
    <section
      aria-labelledby="coverage-heading"
      style={{ borderTop: `1px solid ${RULE}`, padding: "clamp(64px,8vw,104px) 0" }}
    >
      <div style={WRAP}>
        <Reveal>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <h2 id="coverage-heading" style={{ ...huge("clamp(2.2rem,6vw,4.6rem)"), maxWidth: "14ch" }}>
              Fifteen areas. <span style={{ color: LIME }}>One kitchen.</span>
            </h2>
            <Link href="/locations" className="ff-a">
              Check your pincode <ArrowRight size={17} />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <p style={{ ...copy(16), maxWidth: "58ch", margin: "20px 0 clamp(30px,3.8vw,46px)" }}>
            Cooked from 04:00 in Kharadi and at your door by 08:00, six days a week. We deliver
            east Pune properly rather than the whole city badly.
          </p>
        </Reveal>

        {/* A hairline grid of place names, not a map image: the names are the
            thing a reader scans for their own, and they stay legible at every
            width, cost nothing to load, and are readable by a crawler. */}
        <Reveal delay={0.1}>
          <ul className="ff-areas">
            {DELIVERY_AREAS.map((a) => (
              <li key={a.name} className="ff-area" data-base={a.base ? "" : undefined}>
                <span style={{ color: a.base ? LIME : INK }}>{a.name}</span>
                {/* The kitchen is one of the fifteen. Saying which one turns a
                    list of places into a map with an origin. */}
                {a.base && <span className="ff-area-base">The kitchen</span>}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.14}>
          <p style={{ ...tag(DIM), fontSize: 12, marginTop: 20 }}>
            Not on the list? Tell us and we will say honestly when we reach you.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
