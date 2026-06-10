// app/api/admin/content/route.ts
// Phase 15D — content CRUD for blog posts, FAQs, testimonials.
// POST { type, action, id?, data } — type: 'blog'|'faq'|'testimonial',
// action: 'create'|'update'|'delete'. Content surface (OWNER/ADMIN).

import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const db = prisma as any;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function int(v: any, def = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : def;
}

function str(v: any): string {
  return typeof v === "string" ? v.trim() : "";
}

// ── field builders per type ──
function blogData(d: any) {
  return {
    title: str(d.title),
    slug: str(d.slug) || slugify(str(d.title)),
    excerpt: str(d.excerpt),
    contentHtml: typeof d.contentHtml === "string" ? d.contentHtml : "",
    coverImageUrl: str(d.coverImageUrl) || null,
    category: str(d.category) || "Guides",
    tags: Array.isArray(d.tags)
      ? d.tags.map((t: any) => str(t)).filter(Boolean)
      : str(d.tags).split(",").map((t) => t.trim()).filter(Boolean),
    authorName: str(d.authorName) || "Team FitFuel",
    readMinutes: int(d.readMinutes, 5),
    status: d.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
    isFeatured: !!d.isFeatured,
  };
}

function faqData(d: any) {
  return {
    category: str(d.category) || "General",
    question: str(d.question),
    answerHtml: typeof d.answerHtml === "string" ? d.answerHtml : "",
    sortOrder: int(d.sortOrder, 0),
    isActive: d.isActive !== false,
  };
}

function testimonialData(d: any) {
  return {
    name: str(d.name),
    location: str(d.location),
    planLabel: str(d.planLabel),
    goal: str(d.goal) || null,
    resultLabel: str(d.resultLabel),
    rating: Math.min(5, Math.max(1, int(d.rating, 5))),
    quote: str(d.quote),
    avatarUrl: str(d.avatarUrl) || null,
    isFeatured: !!d.isFeatured,
    isActive: d.isActive !== false,
    sortOrder: int(d.sortOrder, 0),
  };
}

const MODELS: Record<string, { model: string; build: (d: any) => any; required: (d: any) => string | null }> = {
  blog: {
    model: "blogPost",
    build: blogData,
    required: (d) => (!str(d.title) ? "Title is required" : null),
  },
  faq: {
    model: "faq",
    build: faqData,
    required: (d) => (!str(d.question) ? "Question is required" : !str(d.answerHtml) ? "Answer is required" : null),
  },
  testimonial: {
    model: "testimonial",
    build: testimonialData,
    required: (d) => (!str(d.name) ? "Name is required" : !str(d.quote) ? "Quote is required" : null),
  },
};

export async function POST(req: NextRequest) {
  const admin = await requireApiRole("content");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as {
    type?: string;
    action?: string;
    id?: string;
    data?: any;
  };

  const cfg = MODELS[body.type ?? ""];
  if (!cfg) return NextResponse.json({ error: "Unknown content type" }, { status: 400 });

  try {
    if (body.action === "delete") {
      if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
      await db[cfg.model].delete({ where: { id: body.id } });
      return NextResponse.json({ ok: true, deleted: body.id });
    }

    if (body.action === "create" || body.action === "update") {
      const reqErr = cfg.required(body.data ?? {});
      if (reqErr) return NextResponse.json({ error: reqErr }, { status: 400 });
      const data = cfg.build(body.data ?? {});

      if (body.action === "create") {
        const record = await db[cfg.model].create({ data });
        return NextResponse.json({ ok: true, record });
      } else {
        if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
        const record = await db[cfg.model].update({ where: { id: body.id }, data });
        return NextResponse.json({ ok: true, record });
      }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    // unique-slug clashes etc.
    const msg = e?.code === "P2002" ? "That slug is already taken — choose another." : "Save failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
