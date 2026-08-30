// app/admin/content/page.tsx
// Phase 15D — content management hub (blog / FAQ / testimonials).

import { requireSurface } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import ContentClient from "./ContentClient";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  await requireSurface("content");
  const [posts, faqs, testimonials] = await Promise.all([
    prisma.blogPost.findMany({
      orderBy: { publishedAt: "desc" },
      select: { id: true, slug: true, title: true, excerpt: true, contentHtml: true, coverImageUrl: true, category: true, tags: true, authorName: true, readMinutes: true, status: true, isFeatured: true },
    }),
    prisma.faq.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      select: { id: true, category: true, question: true, answerHtml: true, sortOrder: true, isActive: true },
    }),
    prisma.testimonial.findMany({
      orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }],
      select: { id: true, name: true, location: true, planLabel: true, goal: true, resultLabel: true, rating: true, quote: true, avatarUrl: true, isFeatured: true, isActive: true, sortOrder: true },
    }),
  ]);

  return (
    <ContentClient
      posts={posts}
      faqs={faqs}
      testimonials={testimonials}
    />
  );
}
