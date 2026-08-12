import type { Metadata } from "next";
import Link from "next/link";

import StructuredData from "@/components/StructuredData";

/* ══════════════════════════════════════════════════════════════════════
   / — DELIBERATELY BLANK, PENDING THE REBUILD.

   THIS FILE IS A STARTING POINT, NOT A DESIGN. It renders a legible,
   accessible page so the site is never broken while the homepage is
   rebuilt, and it renders nothing that anyone should feel obliged to
   keep.

   WHAT WAS HERE. Two full homepages, both deleted on 2026-08-12:

     app/_shop/   the storefront — trial day, eight aisles, sixteen
                  dishes, a basket. Live at "/" until this commit.
     app/_hp/     the v2 homepage it replaced — hero, then the argument.

   Both are recoverable in full:

     git show homepage-shop-2026-08-12:app/_shop/Shop.tsx
     git checkout homepage-shop-2026-08-12 -- app/_shop app/_hp

   WHY THEY WENT RATHER THAN BEING EDITED AGAIN. The homepage had been
   rebuilt twice and both rebuilds shipped. What survived each one was
   app/_ui/theme.ts — the near-black, acid-lime, no-radius token set the
   owner rejected on 2026-08-12 — because twenty-five other pages import
   it and every new homepage reached for it as the only thing in the repo
   that looked like a system. Deleting the homepage without cutting that
   cord would just have started a third lap.

   SO THE RULE FOR WHATEVER REPLACES THIS FILE: it imports no tokens from
   app/_ui, app/_home or app/_hp. Those still exist and still serve the
   marketing pages, and they are not the starting point for this one.
   AGENTS.md holds; the deleted DESIGN.md does not.

   THE BACKEND IS UNTOUCHED AND STAYS UNTOUCHED. lib/ (44 modules),
   app/api (72 routes) and prisma/schema.prisma (52 models) never
   imported a theme and were not part of any of this. Everything the old
   homepage queried is still there to query: the schedule lives in
   PlanScheduleSlot joined to Recipe, the ticker in lib/site-counts, the
   images in lib/site-images, the cut-off in lib/order-cutoff.
══════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** The pages that already work, so this one is a door rather than a wall. */
const LINKS = [
  { href: "/menu", label: "See the menu", note: "48 dishes, priced" },
  { href: "/plans", label: "Weekly plans", note: "Delivered across Pune" },
  { href: "/how-it-works", label: "How it works", note: "From kitchen to doorstep" },
];

export default function HomePage() {
  return (
    <>
      <StructuredData />
      {/* 124px top = the 68px fixed Navbar plus breathing room under it. */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "124px 24px 96px" }}>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", lineHeight: 1.15, margin: 0 }}>
          Fresh food, weighed and delivered in Pune.
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, margin: "20px 0 40px", maxWidth: "56ch" }}>
          We&rsquo;re rebuilding this page. Everything else works — the menu is
          priced, the plans are live, and orders are going out today.
        </p>

        <nav aria-label="Main sections">
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 16,
                    /* 44px minimum target, per AGENTS.md. */
                    minHeight: 44,
                    padding: "12px 16px",
                    border: "1px solid currentColor",
                    borderRadius: 8,
                    textDecoration: "none",
                  }}
                >
                  <span style={{ fontSize: 17, fontWeight: 600 }}>{l.label}</span>
                  <span style={{ fontSize: 14, opacity: 0.75 }}>{l.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
