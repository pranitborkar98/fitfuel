// app/preview/layout.tsx
//
// SCRATCH ROUTES. Three homepage directions, side by side, so a look can be
// chosen by looking at it instead of by arguing about adjectives.
//
// Everything under /preview is disposable and deliberately isolated: its own
// CSS modules, its own colour, its own type. Nothing here imports from _hp and
// nothing in _hp imports from here, so none of it can leak into the live site,
// and deleting this directory removes it completely.
//
// noindex because these are drafts, not pages.

import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
