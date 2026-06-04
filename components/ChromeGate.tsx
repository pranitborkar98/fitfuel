"use client";

// components/ChromeGate.tsx
// Hides the marketing navbar/footer on standalone surfaces (driver view, etc.)
// so they don't bleed into full-screen app pages. Navbar/Footer are still
// created by the server layout and passed in as props — this only decides
// whether to render them based on the current path.

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Path prefixes that render WITHOUT the marketing nav/footer.
const BARE_PREFIXES = ["/driver"];

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

  return (
    <>
      {!bare && navbar}
      <main className="min-h-screen">{children}</main>
      {!bare && footer}
    </>
  );
}
