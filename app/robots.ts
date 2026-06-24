// app/robots.ts — WS-4 / F7.
import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_BASE_URL || "https://fitfuel.in").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api", "/auth"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
