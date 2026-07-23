"use client";

// components/ChromeGate.tsx
// Hides the marketing navbar/footer on standalone surfaces (driver view, etc.)
// so they don't bleed into full-screen app pages. Navbar/Footer are still
// created by the server layout and passed in as props â€” this only decides
// whether to render them based on the current path.

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Path prefixes that render WITHOUT the marketing nav/footer.
const BARE_PREFIXES = ["/driver", "/admin"];

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
  const bare = BARE_PREFIXES.some((p) => pathname.startsWith(p));
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
