// app/robots.ts — WS-4 / F7.
import type { MetadataRoute } from "next";

import { SITE_URL as BASE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/dashboard",
          "/api",
          "/auth",
          "/driver",
          // Transactional and single-use surfaces. These are "use client"
          // pages so they cannot export `robots` metadata of their own, and
          // they were previously crawlable: a checkout with a half-filled
          // cart or a one-time referral landing page is not a search result.
          "/checkout",
          "/order",
          "/onboarding",
          "/p/",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
