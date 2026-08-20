// components/Breadcrumb.tsx
//
// ONE WAY BACK, ON EVERY DETAIL PAGE.
//
// The three detail-page types a customer reaches had three different answers:
//
//   /menu/[dish]   x48   a sentence-case breadcrumb at the top — AND a second,
//                        contradicting link at the very bottom, inside the
//                        FSSAI legal footnote, reading "Back to the menu" but
//                        pointing at `/` while the breadcrumb's own "Menu"
//                        pointed at `/menu`
//   /plans/[slug]  x59   an UPPERCASE mono breadcrumb whose current-page node
//                        printed the raw slug — "gout-veg" — at the reader
//   /blog/[slug]         no breadcrumb at all, a lone "← All articles" link
//
// SETTLED 2026-08-20: one component, sentence case, at the top of the page.
// The parent link IS the back button — a breadcrumb subsumes "back" and also
// says where "back" goes, which matters because most detail-page traffic
// arrives cold from search rather than by clicking through, and those readers
// have no "back" to return to.
//
// NOT router.back(). On a cold arrival history.back() leaves the site or does
// nothing at all. Real hrefs always go somewhere real and are right-clickable.
//
// UPPERCASE IS GONE. AGENTS.md rejects uppercase-everything by name, and a
// breadcrumb set in 12px mono with 0.2em tracking is the exact trading-terminal
// texture the 2026-08-12 verdict was about.
//
// The separators are aria-hidden: a screen reader walking an <ol> already
// announces the list and its position, and the previous version had them read
// aloud as "slash" between every step.
//
// SERVER COMPONENT. No hooks.

import Link from "next/link";

const DIM = "var(--fk-ink-3, var(--ff-dim, #9a9a94))";
const INK = "var(--fk-ink-2, var(--ff-ink, #c6c6c0))";
const SANS = "var(--fk-sans, var(--ff-sans, system-ui, sans-serif))";

export type Crumb = { href: string; label: string };

export default function Breadcrumb({
  trail,
  current,
  className,
}: {
  /** The ancestors, nearest-last. The LAST one is the page's "back". */
  trail: Crumb[];
  /** The page itself. Never a slug — the name a human would say. */
  current: string;
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          listStyle: "none",
          margin: 0,
          padding: 0,
          fontFamily: SANS,
          fontSize: 14,
        }}
      >
        {trail.map((c, i) => (
          <li key={c.href} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Link
              href={c.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                /* 44px on the last crumb only — it is the back button and sits
                   alone at the top of the page, where a missed tap has nothing
                   adjacent to absorb it. The ancestors are secondary. */
                minHeight: i === trail.length - 1 ? 44 : 0,
                color: DIM,
                fontWeight: i === trail.length - 1 ? 600 : 400,
                textDecoration: "none",
              }}
            >
              {/* The arrow marks the one crumb that is the way back, and is
                  decorative — the label beside it already names the place. */}
              {i === trail.length - 1 ? (
                <span aria-hidden="true" style={{ marginRight: 7, fontSize: 15 }}>
                  &larr;
                </span>
              ) : null}
              {c.label}
            </Link>
            <span aria-hidden="true" style={{ color: DIM, opacity: 0.5 }}>
              /
            </span>
          </li>
        ))}
        <li>
          <span aria-current="page" style={{ color: INK }}>
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
}
