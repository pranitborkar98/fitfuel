import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      /* ── /menu HAS NO JOB ──────────────────────────────────────────────
         It was a second copy of the catalogue (`/` is that, and searches and
         filters it), then briefly "this week's menu" — one plan's rotation
         presented as the kitchen's single menu, which misreads the product:
         there are 59 plans and each has its own week, so there is no such
         thing as THE menu.

         The 48 singles live on `/`. Each plan's rotation lives on its own
         plan page. The index in between had nothing left to be.

         EXACT MATCH ONLY. `source: "/menu"` does not catch `/menu/:dish` —
         those 48 product pages are real, are linked from the catalogue, and
         must keep resolving. Verified after this landed.

         Permanent, because the decision is: it is a 308 rather than a 307 so
         search engines move their index to `/` instead of holding the old URL
         and re-checking it forever. */
      { source: "/menu", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
