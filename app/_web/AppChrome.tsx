"use client";

// app/_web/AppChrome.tsx
//
// THE APP SHELL, FOR EVERY ROUTE THAT IS NOT THE HOMEPAGE.
//
// Only `/` was ever webapp-shaped. Every other customer route — the 48 dish
// product pages included — got components/Navbar and components/Footer from
// ChromeGate, which is the marketing site's chrome. So tapping a dish on the
// homepage dropped you out of the app and onto a website: different header, no
// search, no location, no basket, no tab bar, and no way back except the
// browser button.
//
// This is the header and tab bar from FitFuelApp, reusable. It is NOT a second
// copy of the markup: both now render the same CSS module, and the pieces that
// only make sense on the catalog (mode chips, the live filter) are the pieces
// left behind.
//
// TWO DELIBERATE DIFFERENCES FROM THE HOMEPAGE HEADER:
//
//   THERE IS NO SEARCH FIELD. There used to be: it pushed to /?q=… and the
//   homepage picked the query up. The owner removed search from `/` on
//   2026-08-19, which left this box submitting a parameter nothing reads — a
//   customer on a dish page typed a name, pressed enter, landed on the homepage
//   and their search was silently discarded. Removed rather than repointed,
//   because the catalogue it used to search is now browsed by course chip.
//
//   The three catalog tabs are LINKS, not buttons. Mode is homepage state; from
//   here the honest thing is a link to the homepage in that mode, so /?mode=plans
//   opens the plans catalog rather than pretending to switch a view that is not
//   mounted — and `/` now READS that parameter, which it did not until the link
//   sweep of 2026-08-20 found all three of these pointing at nothing.
//
// The basket is the SAME cart: useCart is a context provider mounted in the
// layout, so the count and the drawer are shared, not duplicated per route.

import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/app/_cart/CartProvider";
import Sheet, { SheetClose } from "@/app/_shop/Sheet";
import s from "./app.module.css";

const I = {
  search: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35",
  x: "M18 6 6 18M6 6l12 12",
  pin: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  bag: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6ZM3 6h18M16 10a4 4 0 0 1-8 0",
  bowl: "M3 11h18a9 9 0 0 1-18 0Z M12 2v3",
  layers: "m12 2 9 5-9 5-9-5 9-5Z m-9 10 9 5 9-5 M3 17l9 5 9-5",
  spark: "M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4",
  user: "M20 21a8 8 0 1 0-16 0 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
};

function Icon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d.split(" M").map((seg, i) => (
        <path key={i} d={i === 0 ? seg : `M${seg}`} />
      ))}
    </svg>
  );
}

/* Mirrors NAV in FitFuelApp, with the three catalog modes expressed as links
   because mode is homepage state and this bar renders elsewhere. */
type Tab = { href: string; label: string; icon: string; match: string[] };

const TABS: Tab[] = [
  { href: "/", label: "Order tonight", icon: I.bowl, match: ["/", "/menu"] },
  { href: "/?mode=plans", label: "Meal plans", icon: I.layers, match: ["/plans"] },
  { href: "/?mode=supps", label: "Supplements", icon: I.spark, match: ["/supplements"] },
  { href: "/dashboard/coach", label: "Coach", icon: I.spark, match: ["/dashboard/coach"] },
  { href: "/dashboard", label: "Your account", icon: I.user, match: ["/dashboard"] },
];

/**
 * LONGEST MATCH WINS, and exactly one tab is current.
 *
 * Testing each tab independently is the obvious version and it is wrong here:
 * "/dashboard" is a prefix of "/dashboard/coach", so on the coach page BOTH
 * Coach and Your account light up, and aria-current appears twice in one nav.
 * Ordering the array does not help — each entry answers for itself.
 *
 * So the whole bar is resolved together: score every prefix, keep the longest,
 * and only that index is current. "/" scores only on the homepage itself,
 * otherwise it would win nothing and lose everything.
 */
function activeTab(pathname: string): number {
  let best = -1;
  let bestLen = 0;
  TABS.forEach((t, i) => {
    for (const m of t.match) {
      const hit = m === "/" ? pathname === "/" : pathname.startsWith(m);
      if (hit && m.length >= bestLen) {
        best = i;
        bestLen = m.length;
      }
    }
  });
  return best;
}

/* `dishCount` is gone with the search field it sized the placeholder for
   ("Search 48 dishes"). Nothing else in this header counted anything. */
export default function AppChrome({
  area = "Kharadi",
  cutoff,
  areaPanel,
  children,
}: {
  area?: string;
  cutoff?: string;
  areaPanel?: React.ReactNode;
  children: React.ReactNode;
}) {
  const cart = useCart();
  const pathname = usePathname() || "";
  const [areaOpen, setAreaOpen] = useState(false);
  const active = activeTab(pathname);
  /* badgeCount, not count: it includes price-on-request enquiries, so the
     header badge matches what the drawer actually holds. */
  const count = cart.badgeCount;

  return (
    <div className={`fk ${s.app}`}>
      <header className={s.top}>
        <div className={s.topRow}>
          <Wordmark className={s.brand} />



          <div className={s.topActions}>
            <button
              type="button"
              className={s.place}
              onClick={() => setAreaOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={areaOpen}
            >
              <Icon d={I.pin} size={16} />
              {area}
            </button>
            <button
              type="button"
              className={s.iconBtn}
              onClick={() => cart.setOpen(true)}
              aria-label={`Your order, ${count} item${count === 1 ? "" : "s"}`}
            >
              <Icon d={I.bag} size={18} />
              {count > 0 ? <span className={s.badge}>{count}</span> : null}
            </button>
          </div>
        </div>
        {/* A SENTENCE, not a time. Passing cutoffLabel() straight in rendered
            the strip as the bare word "9pm", which states nothing. This is the
            single-meal promise the homepage shows over the dish catalog — the
            9pm/8am line is the SUBSCRIPTION schedule and would be the wrong
            claim over one salad. */}
        <div className={s.cutoff}>
          <p className={s.cutoffRow}>
            <span>
              Cooked to order and delivered across <b>{area}</b> today.
              {cutoff ? <> Plans ordered by <b>{cutoff}</b> start tomorrow.</> : null}
            </span>
          </p>
        </div>
      </header>

      {/* THE RAIL IS NOT OPTIONAL. .tabs is display:none above 1024px — the
          homepage swaps it for a sidebar there — so a shell with tabs and no
          rail left these pages with NO navigation at all on a desktop: brand
          link and breadcrumb, nothing else. Same two-column body as the
          homepage, same breakpoint. */}
      <div className={s.body}>
        <nav className={s.rail} aria-label="Sections">
          <ul className={s.railList}>
            {TABS.map((t, i) => {
              const on = i === active;
              return (
                <li key={t.label}>
                  <Link
                    href={t.href}
                    className={`${s.railLink} ${on ? s.railOn : ""}`}
                    aria-current={on ? "page" : undefined}
                  >
                    <Icon d={t.icon} />
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* A <div>, not a <main>: components/ChromeGate already wraps every
            route in one, and a second would be a duplicate landmark. */}
        <div className={s.main}>{children}</div>
      </div>

      <nav className={s.tabs} aria-label="Sections">
        {TABS.map((t, i) => {
          const on = i === active;
          return (
            <Link
              key={t.label}
              href={t.href}
              className={`${s.tab} ${on ? s.tabOn : ""}`}
              aria-current={on ? "page" : undefined}
            >
              <Icon d={t.icon} size={22} />
              {t.label}
            </Link>
          );
        })}
      </nav>

      {areaOpen && areaPanel ? (
        <Sheet onClose={() => setAreaOpen(false)} labelledBy="chrome-area-title">
          <div className={s.areaSheetTop}>
            <h2 id="chrome-area-title" className={s.areaSheetH}>
              Where we deliver
            </h2>
            <SheetClose onClose={() => setAreaOpen(false)} />
          </div>
          <div className={s.areaSheet}>{areaPanel}</div>
        </Sheet>
      ) : null}
    </div>
  );
}
