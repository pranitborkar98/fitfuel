// app/admin/content/page.tsx
// Phase 15D — content management hub (blog / FAQ / testimonials).

import { requireSurface } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import ContentClient from "./ContentClient";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  await requireSurface("content");
  const db = prisma as any;

  const [posts, faqs, testimonials] = await Promise.all([
    db.blogPost.findMany({ orderBy: { publishedAt: "desc" } }),
    db.faq.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] }),
    db.testimonial.findMany({ orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }] }),
  ]);

  // serialize Date -> string for client props
  const plain = (x: any) => JSON.parse(JSON.stringify(x));

  return (
    <ContentClient
      posts={plain(posts)}
      faqs={plain(faqs)}
      testimonials={plain(testimonials)}
    />
  );
}
