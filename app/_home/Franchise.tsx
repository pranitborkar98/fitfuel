// app/_home/Franchise.tsx
//
// THE MOAT.
//
// FitFuel is vertically integrated: the same operating system that cooks and
// ships its own kitchen every morning is the franchise product. This is not
// a pitch deck or a recipe binder, it is running software, and every layer
// below maps to real code:
//
//   Recipes as SOPs   -> model RecipeStep (step, technique, temp, timing,
//                        kitchen note, per-step image) + RecipeIngredient
//   Production board  -> app/admin/production + lib/production.ts: tomorrow's
//                        portions per recipe by window and slot, auto-computed
//                        from live subscriptions
//   Prep + procurement-> lib/production.ts scaled ingredient roll-up and a
//                        consolidated shopping list, exact to head count
//   Dispatch          -> api/cron/generate-deliveries + admin/drivers +
//                        driver/[token]; Driver.franchiseId is reserved so a
//                        second outlet is a row, not a rebuild
//
// The master tracker frames this consistently as the franchise foundation
// ("RecipeStep SOP + batch scaling + Kitchen Production Dashboard already
// built, franchise gets access"). The section says exactly that and nothing
// it cannot back.
//
// Mechanism 12: a four-layer stack that assembles on scroll. Each stratum
// clip-wipes up into place in sequence, so the operating system visibly
// builds itself from the kitchen up. Staggered via --l, same pattern as the
// spec sheet's per-row wipe. Base state is fully assembled, so an inactive
// timeline shows the whole stack.
//
// SERVER COMPONENT.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { WRAP, RULE, LIME, INK, MUTE, DIM, huge, mid, copy, tag } from "./theme";

const LAYERS: [string, string, string][] = [
  ["01", "Recipes as SOPs", "Every dish broken into steps: technique, temperature, timing, a note for the line and a photo. Not a binder, a database the kitchen cooks from."],
  ["02", "Production board", "Tomorrow's cook sheet, computed from live subscriptions before anyone asks: portions per recipe, split by delivery window and meal slot."],
  ["03", "Prep and procurement", "The ingredient roll-up and one consolidated shopping list, scaled to the exact head count. No guesswork, no waste."],
  ["04", "Outlet dispatch", "Delivery generation and a tokenised driver portal, ready to scope per outlet. A second kitchen is a row in the table, not a rebuild."],
];

export default function Franchise() {
  return (
    <section aria-labelledby="franchise-heading" style={{ padding: "clamp(70px,9vw,120px) 0", borderTop: `1px solid ${RULE}` }}>
      <div style={WRAP}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <div>
              <span style={tag(LIME)}>Franchise the whole system</span>
              <h2 id="franchise-heading" style={{ ...huge("clamp(2.4rem,6vw,5.2rem)"), maxWidth: "16ch", marginTop: 16 }}>
                The software that runs our kitchen is the franchise
              </h2>
            </div>
            <Link href="/contact" className="ff-a" style={{ marginBottom: 6 }}>Talk franchise <ArrowRight size={17} /></Link>
          </div>
        </Reveal>

        <p style={{ ...copy(16.5), maxWidth: "60ch", marginTop: "clamp(22px,3vw,34px)" }}>
          Most food franchises hand you a brand and a recipe book. FitFuel hands you the
          operating system it runs on: the same production board, SOPs and dispatch that
          cook and ship across Pune every morning. Proven in our own kitchen first, then
          scoped to yours.
        </p>

        {/* The four-layer stack. Bottom layer (the kitchen) is widest and
            darkest; each layer up is the software built on it. They assemble
            on scroll from the kitchen up. */}
        <ol className="ff-stack" style={{ marginTop: "clamp(38px,5vw,64px)" }}>
          {LAYERS.map(([n, title, body], i) => (
            <li key={n} className="ff-stack-layer" style={{ ["--l" as string]: LAYERS.length - 1 - i }}>
              <span aria-hidden className="ff-stack-n" style={{ ...huge("clamp(1.4rem,2.4vw,2rem)"), color: LIME }}>{n}</span>
              <h3 className="ff-stack-title" style={mid("clamp(1.5rem,2.8vw,2.3rem)")}>{title}</h3>
              <p className="ff-stack-body" style={{ ...copy(15), maxWidth: "52ch" }}>{body}</p>
            </li>
          ))}
        </ol>

        <p style={{ ...copy(13.5), color: DIM, marginTop: "clamp(24px,3vw,36px)", maxWidth: "62ch" }}>
          The franchise portal itself is the next phase; the operating system underneath it
          is live today, cooking every FitFuel box in Pune. Enquiries go to the founders
          directly.
        </p>
      </div>
    </section>
  );
}
