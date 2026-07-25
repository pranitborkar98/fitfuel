// app/_home/Menu.tsx
//
// THE À LA CARTE MENU, AND THE REVENUE ARGUMENT BEHIND IT.
//
// The site sold exactly one thing: a subscription. The kitchen also runs a
// single-dish menu, and that menu was visible ONLY on Swiggy and Zomato, which
// take roughly 40% of the order value. Every dish a customer bought there
// instead of here was sold at a fraction of the margin, and the homepage did
// not name a single one of those dishes.
//
// So this section names the food and takes the order direct. We stay listed on
// the aggregators, and TrustStrip says so, because presence there is discovery
// and proof. But nothing on this page sends a hungry customer to a channel that
// takes 40 paise of every rupee. That is why there are no aggregator links here
// and why the CTA is WhatsApp, which is a live ordering path today.
//
// The 40% is NOT stated on the page. It is a supplier term, not a customer
// concern, and "our competitors take a cut" is a weak pitch. The customer-facing
// reason is the true one and the better one: order from the kitchen that cooks
// it.
//
// PRICES. Salads and keto carry real prices. Bowls, breakfasts, bars and juices
// do not have prices yet, so they print "On request" rather than a number
// somebody invented. See the header of lib/menu-alacarte.ts.
//
// SERVER COMPONENT.

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MENU, MENU_STATS, MENU_FROM } from "@/lib/menu-alacarte";
import { waLink } from "@/lib/site";
import Reveal from "./Reveal";
import { WRAP, RULE, LIME, INK, DIM, huge, mid, copy, tag } from "./theme";

/* Three per category on the homepage. The full list is long enough to be its
   own page; this is a taste of each, not a catalogue dump. */
const PER_CATEGORY = 3;

export default function Menu() {
  return (
    <section
      aria-labelledby="menu-alacarte-heading"
      style={{ borderTop: `1px solid ${RULE}`, padding: "clamp(70px,9vw,120px) 0", background: "#050504" }}
    >
      <div style={WRAP}>
        <Reveal>
          <span style={tag(LIME)}>No subscription needed</span>
          <h2 id="menu-alacarte-heading" style={{ ...huge("clamp(2.4rem,6.4vw,5.2rem)"), maxWidth: "15ch", marginTop: 16 }}>
            Just hungry? <span style={{ color: LIME }}>Order one meal.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.05}>
          <p style={{ ...copy(16.5), maxWidth: "58ch", marginTop: 22 }}>
            {MENU_STATS.items} dishes across {MENU_STATS.categories} categories, from Rs {MENU_FROM}. Same kitchen,
            same licence, same weighing scale as the meal plans. Order it straight from the people
            who cook it.
          </p>
        </Reveal>

        <div className="ff-alc-cats">
          {MENU.map((cat, ci) => (
            <Reveal key={cat.key} delay={0.08 + ci * 0.04}>
              <div className="ff-alc-cat">
                <div className="ff-alc-cat-head">
                  <h3 style={{ ...mid("clamp(1.4rem,2.2vw,1.8rem)"), color: INK }}>{cat.label}</h3>
                  <span style={{ ...tag(DIM), fontSize: 11.5 }}>{cat.items.length} dishes</span>
                </div>
                <p style={{ ...copy(13.5), color: DIM, marginTop: 10 }}>{cat.note}</p>

                <ul className="ff-alc-items">
                  {cat.items.slice(0, PER_CATEGORY).map((it) => (
                    <li key={it.name} className="ff-alc-item">
                      <div className="ff-alc-item-top">
                        <span className="ff-alc-item-name">{it.name}</span>
                        {/* A dotted leader between dish and price is the one
                            piece of menu typography worth borrowing: it ties
                            the two ends of a wrapping line together. */}
                        <span className="ff-alc-dots" aria-hidden />
                        <span className="ff-alc-price" data-tbd={it.price == null ? "" : undefined}>
                          {it.price == null ? "On request" : `Rs ${it.price}`}
                        </span>
                      </div>
                      <p className="ff-alc-blurb">{it.blurb}</p>
                      {it.variantNote && <span className="ff-alc-variant">{it.variantNote}</span>}
                    </li>
                  ))}
                </ul>

                {cat.items.length > PER_CATEGORY && (
                  <span style={{ ...copy(12.5), color: DIM, display: "block", marginTop: 14 }}>
                    and {cat.items.length - PER_CATEGORY} more
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {/* The add-on ladder, stated once. It is the same on every priced dish,
            so repeating it per card would be noise. */}
        <Reveal delay={0.3}>
          <div className="ff-alc-addons">
            <span style={{ ...tag(DIM), fontSize: 11.5 }}>Make it a meal</span>
            <div className="ff-alc-addon-row">
              <span><strong>Veg</strong> paneer or tofu, from Rs 30</span>
              <span><strong>Egg</strong> boiled or omelette, Rs 50</span>
              <span><strong>Non-veg</strong> grilled chicken, from Rs 80</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.34}>
          <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap", marginTop: "clamp(28px,3.4vw,42px)" }}>
            <a
              href={waLink("Hi FitFuel, I would like to order from the a la carte menu.")}
              target="_blank"
              rel="noopener noreferrer"
              className="ff-btn"
            >
              Order on WhatsApp
            </a>
            <Link href="/plans?trial=true" className="ff-a">
              Or try a full day, Rs 400 <ArrowRight size={17} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
