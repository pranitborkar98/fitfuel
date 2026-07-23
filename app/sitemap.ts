// app/sitemap.ts — WS-4 / F7. Static routes + live plan & blog slugs.
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL as BASE } from "@/lib/site";

export const revalidate = 86400; // refresh daily

// Every indexable public route, with an explicit priority. This list used to
// hold 11 entries and silently omitted 12 live pages, including /faq (the one
// page carrying FAQPage structured data, so the single best rich-result and
// answer-engine candidate on the site) and every trust page.
//
// Anything reachable without an account belongs here. If a page is worth
// shipping it is worth indexing; if it is not, it should not be public.
const STATIC_ROUTES: { path: string; priority: number; freq: "daily" | "weekly" | "monthly" | "yearly" }[] = [
  { path: "",                    priority: 1.0,  freq: "daily"   },
  // Money pages
  { path: "/plans",              priority: 0.9,  freq: "daily"   },
  { path: "/plans/digital",      priority: 0.7,  freq: "weekly"  },
  { path: "/supplements",        priority: 0.7,  freq: "weekly"  },
  { path: "/corporate",          priority: 0.7,  freq: "monthly" },
  { path: "/partners/apply",     priority: 0.7,  freq: "monthly" },
  // Local SEO and intent
  { path: "/locations",          priority: 0.8,  freq: "weekly"  },
  { path: "/how-it-works",       priority: 0.8,  freq: "monthly" },
  { path: "/faq",                priority: 0.8,  freq: "weekly"  },
  { path: "/tdee-calculator",    priority: 0.7,  freq: "monthly" },
  // Trust
  { path: "/about",              priority: 0.6,  freq: "monthly" },
  { path: "/our-kitchen",        priority: 0.6,  freq: "monthly" },
  { path: "/our-ingredients",    priority: 0.6,  freq: "monthly" },
  { path: "/our-team",           priority: 0.5,  freq: "monthly" },
  { path: "/results",            priority: 0.6,  freq: "weekly"  },
  { path: "/testimonials",       priority: 0.6,  freq: "weekly"  },
  { path: "/contact",            priority: 0.5,  freq: "monthly" },
  { path: "/blog",               priority: 0.6,  freq: "weekly"  },
  // Policy. Low priority but indexable: these are the pages that answer
  // "is this safe / can I get a refund", and they carry real trust weight.
  { path: "/privacy",            priority: 0.3,  freq: "yearly"  },
  { path: "/terms",              priority: 0.3,  freq: "yearly"  },
  { path: "/refund-policy",      priority: 0.4,  freq: "yearly"  },
  { path: "/medical-disclaimer", priority: 0.4,  freq: "yearly"  },
  { path: "/allergen-policy",    priority: 0.4,  freq: "yearly"  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${BASE}${r.path || "/"}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  // Meal plans → /plans/[slug]
  //
  // This used to filter on `isActive: true` and consequently emitted ZERO
  // plan URLs: all 126 rows currently have isActive = false, despite the
  // column defaulting to true. The catalog at /plans does not filter on the
  // flag either, so every one of those plans is live, purchasable and
  // linked, and none of them was in the sitemap.
  //
  // Matching the catalog's behaviour here so the two agree. The flag itself
  // needs a decision: either it means something and /plans should honour it,
  // or it is vestigial and should be dropped. Until then, "what the catalog
  // publishes" is the operative definition of live.
  try {
    const plans = await (prisma as any).mealPlan.findMany({
      select: { slug: true, updatedAt: true },
    });
    for (const pl of plans) {
      entries.push({
        url: `${BASE}/plans/${pl.slug}`,
        lastModified: pl.updatedAt ?? now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch { /* model/db unavailable at build — skip */ }

  // Published blog posts → /blog/[slug]
  try {
    const posts = await (prisma as any).blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, publishedAt: true },
    });
    for (const b of posts) {
      entries.push({
        url: `${BASE}/blog/${b.slug}`,
        lastModified: b.publishedAt ?? now,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch { /* skip */ }

  return entries;
}
