// components/TrustStrip.tsx
//
// The external-mark layer: where you can order, what you can pay with, who
// licenses the kitchen, what the stack runs on.
//
// This is the row a customer looks for before trusting a food site they have
// never heard of, and FitFuel had none of it. Not a single payment mark, no
// aggregator, and the FSSAI licence buried as fine print in the footer rather
// than stated as the credential it is.
//
// Marks are typographic and monochrome by design, not image files. That is
// what a good press strip looks like anyway, and it avoids reproducing a third
// party's mark inaccurately at 40px, avoids an external asset request, and
// keeps the whole row on the two typefaces the system allows.
//
// SOON marks render dimmed and print the word. A Swiggy mark shown as live
// before we are on Swiggy sends a hungry customer to search for us there and
// find nothing, which is worse than not showing it at all.
//
// SERVER COMPONENT.

import { TRUST_GROUPS, type Mark } from "@/lib/trust-marks";
import { RULE, LIME, DIM, tag, copy, huge } from "@/app/_home/theme";

function MarkCell({ m }: { m: Mark }) {
  const soon = m.status === "SOON";
  /* A mark with an href is a real destination, so it becomes an anchor and
     picks up focus, hover and a new tab. Without one it stays a div: a
     clickable-looking cell that goes nowhere is worse than a plain one.
     rel="noopener" because these open cross-origin. */
  const Tag = m.href ? "a" : "div";
  const linkProps = m.href
    ? { href: m.href, target: "_blank" as const, rel: "noopener noreferrer" }
    : {};
  return (
    <Tag className="ff-mark" data-soon={soon ? "" : undefined} data-link={m.href ? "" : undefined} {...linkProps}>
      <span
        className="ff-mark-name"
        style={{
          fontWeight: m.weight ?? 800,
          letterSpacing: m.tracking ?? "0",
          textTransform: m.lower ? "lowercase" : "none",
        }}
      >
        {m.name}
      </span>
      <span className="ff-mark-note">{m.note}</span>
      {/* The word, not a colour. A dimmed mark alone would encode the whole
          live/pending distinction in contrast, which fails at a glance and
          fails outright for anyone who cannot see the difference. */}
      {soon && <span className="ff-mark-soon">Not yet live</span>}
      {m.href && <span className="ff-mark-soon" data-go="">Order now</span>}
    </Tag>
  );
}

export default function TrustStrip() {
  return (
    <section
      aria-labelledby="trust-heading"
      style={{ borderTop: `1px solid ${RULE}`, padding: "clamp(60px,7.5vw,100px) 0" }}
    >
      <div style={{ width: "100%", maxWidth: 1400, margin: "0 auto", padding: "0 clamp(18px,4vw,56px)" }}>
        {/* The heading is the claim, at the page's display scale. The first
            pass set this as a 12px tracked-out label with a "[ 006 ]" index
            beside it, which belonged to the numbered-dossier generation that
            commit 067dcb6 unified away. A row this load-bearing does not
            whisper. */}
        <h2 id="trust-heading" style={{ ...huge("clamp(2.2rem,6vw,4.6rem)"), maxWidth: "18ch" }}>
          Order it anywhere. <span style={{ color: LIME }}>Cooked in one kitchen.</span>
        </h2>
        <p style={{ ...copy(16), maxWidth: "60ch", margin: "20px 0 clamp(34px,4.4vw,56px)" }}>
          Swiggy and Zomato for a single meal, FitFuel for the plan behind it. Same kitchen,
          same licence, same weighed macros.
        </p>

        {TRUST_GROUPS.map((g) => (
          <div key={g.key} style={{ marginBottom: "clamp(34px,4.2vw,56px)" }}>
            <div className="ff-markhead">
              <h3 style={{ ...tag(DIM), fontSize: 12.5, margin: 0, whiteSpace: "nowrap" }}>{g.label}</h3>
              <p style={{ ...copy(13.5), color: DIM, margin: 0, maxWidth: "68ch" }}>{g.note}</p>
            </div>
            <div className="ff-marks">
              {g.marks.map((m) => (
                <MarkCell key={m.name} m={m} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
