// app/sitemap.ts — WS-4 / F7. Static routes + live plan & blog slugs.
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 86400; // refresh daily

const BASE = (process.env.NEXT_PUBLIC_BASE_URL || "https://fitfuel.in").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = [
    "", "/plans", "/plans/digital", "/how-it-works",
    "/about", "/locations", "/contact", "/supplements", "/blog",
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((p) => ({
    url: `${BASE}${p || "/"}`,
    lastModified: now,
    changeFrequency: p === "" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  // Active meal plans → /plans/[slug]
  try {
    const plans = await (prisma as any).mealPlan.findMany({
      where: { isActive: true },
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
