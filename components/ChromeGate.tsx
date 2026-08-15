"use client";

// components/ChromeGate.tsx
// Hides the marketing navbar/footer on standalone surfaces (driver view, etc.)
// so they don't bleed into full-screen app pages. Navbar/Footer are still
// created by the server layout and passed in as props â€” this only decides
// whether to render them based on the current path.

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Path prefixes that render WITHOUT the marketing nav/footer.
//
// /dashboard joined this list when it grew its own shell (app/_app/AppShell).
// Before that it carried the marketing navbar and footer on top of an app
// surface, which meant two navigations on screen at once and a footer full of
// company links under a nutrition log.
const BARE_PREFIXES = ["/driver", "/admin", "/dashboard"];

// Routes that draw their OWN header and footer, so the site chrome would be a
// second one. "/" is the shop: design/FitFuel Shop.dc.html specifies a header
// with the wordmark, a search field, the basket, a six-item nav and the live
// cut-off strip, plus a six-tab bottom bar and a four-column footer. Those are
// the composition, not decoration around it, and mounting the site navbar as
// well would put two fixed bars and ~134px of chrome above the trial panel.
// Now a PREFIX list, not an exact-match list. /menu/<dish> is 48 product pages
// that a customer reaches by tapping a card on `/`, and they were dropping out
// of the app onto the marketing site: different header, no search, no location,
// no basket, no tab bar. They render app/_web/AppChrome instead, so the site
// navbar here would be a second header.
const SELF_CHROMED = ["/", "/menu"];

// Path prefixes that are the logged-in APPLICATION, not marketing pages.
// These keep their own denser UI conventions, so the marketing-side
// art-direction resets in globals.css must not reach them.
const APP_PREFIXES = ["/driver", "/admin", "/dashboard"];

export default function ChromeGate({
  navbar,
  footer,
  children,
}: {
  navbar: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname() || "";
  /* SELF_CHROMED is matched as a prefix now — "/" exactly, anything else by
     startsWith — so /menu and its 48 dish pages are covered without listing
     each one. */
  const bare =
    BARE_PREFIXES.some((p) => pathname.startsWith(p)) ||
    SELF_CHROMED.some((p) => (p === "/" ? pathname === "/" : pathname.startsWith(p)));
  const marketing = !APP_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <>
      {!bare && navbar}
      {/* data-surface drives the square-corner reset in globals.css. */}
      <main className="min-h-screen" data-surface={marketing ? "marketing" : "app"}>
        {children}
      </main>
      {!bare && footer}
    </>
  );
}
