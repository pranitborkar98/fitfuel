// Content CRUD for blog posts, FAQs, and testimonials. OWNER/ADMIN only.

import { requireApiRole } from "@/lib/admin-auth";
import { richHtmlToText, sanitizeRichHtml } from "@/lib/content-safety";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const idSchema = z.string().trim().min(1).max(60);
const contentRequestSchema = z
  .object({
    type: z.enum(["blog", "faq", "testimonial"]),
    action: z.enum(["create", "update", "delete"]),
    id: idSchema.optional().nullable(),
    data: z.unknown().optional().nullable(),
  })
  .strict();

const imageUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) => !value || value.startsWith("/") || /^https:\/\//i.test(value),
    "Use an HTTPS image URL or an app-relative path.",
  );

const blogSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(160),
    slug: z.string().trim().max(80).default(""),
    excerpt: z.string().trim().max(500).default(""),
    contentHtml: z.string().max(200_000).default(""),
    coverImageUrl: imageUrlSchema.default(""),
    category: z.string().trim().min(1).max(80).default("Guides"),
    tags: z
      .union([
        z.array(z.string().trim().min(1).max(50)).max(20),
        z.string().max(1_000),
      ])
      .default([]),
    authorName: z.string().trim().min(1).max(100).default("Team FitFuel"),
    readMinutes: z.coerce.number().int().min(1).max(120).default(5),
    status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
    isFeatured: z.boolean().default(false),
  })
  .strict();

const faqSchema = z
  .object({
    category: z.string().trim().min(1).max(80).default("General"),
    question: z.string().trim().min(1, "Question is required.").max(300),
    answerHtml: z.string().min(1, "Answer is required.").max(20_000),
    sortOrder: z.coerce.number().int().min(-10_000).max(10_000).default(0),
    isActive: z.boolean().default(true),
  })
  .strict();

const testimonialSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(100),
    location: z.string().trim().max(100).default(""),
    planLabel: z.string().trim().max(120).default(""),
    goal: z.string().trim().max(60).default(""),
    resultLabel: z.string().trim().max(160).default(""),
    rating: z.coerce.number().int().min(1).max(5).default(5),
    quote: z.string().trim().min(1, "Quote is required.").max(1_500),
    avatarUrl: imageUrlSchema.default(""),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
    sortOrder: z.coerce.number().int().min(-10_000).max(10_000).default(0),
  })
  .strict();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function invalidData(error: z.ZodError): NextResponse {
  return NextResponse.json(
    {
      error: error.issues[0]?.message || "Content is invalid.",
      issues: error.issues.slice(0, 12).map((issue) => ({
        field: issue.path.join(".") || "data",
        message: issue.message,
      })),
    },
    { status: 400 },
  );
}

function buildBlog(input: z.infer<typeof blogSchema>) {
  const slug = input.slug || slugify(input.title);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: "Slug must use lowercase letters, numbers, and hyphens only." } as const;
  }

  const contentHtml = sanitizeRichHtml(input.contentHtml);
  if (input.status === "PUBLISHED") {
    if (!input.excerpt) return { error: "Published posts need an excerpt." } as const;
    if (!richHtmlToText(contentHtml)) return { error: "Published posts need a body." } as const;
  }

  const tags = Array.isArray(input.tags)
    ? input.tags
    : input.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

  return {
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt,
      contentHtml,
      coverImageUrl: input.coverImageUrl || null,
      category: input.category,
      tags: [...new Set(tags)].slice(0, 20),
      authorName: input.authorName,
      readMinutes: input.readMinutes,
      status: input.status,
      isFeatured: input.isFeatured,
    },
  } as const;
}

function buildFaq(input: z.infer<typeof faqSchema>) {
  const answerHtml = sanitizeRichHtml(input.answerHtml);
  if (!richHtmlToText(answerHtml)) {
    return { error: "Answer cannot be empty after unsafe markup is removed." } as const;
  }
  return {
    data: {
      category: input.category,
      question: input.question,
      answerHtml,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    },
  } as const;
}

function buildTestimonial(input: z.infer<typeof testimonialSchema>) {
  return {
    name: input.name,
    location: input.location,
    planLabel: input.planLabel,
    goal: input.goal || null,
    resultLabel: input.resultLabel,
    rating: input.rating,
    quote: input.quote,
    avatarUrl: input.avatarUrl || null,
    isFeatured: input.isFeatured,
    isActive: input.isActive,
    sortOrder: input.sortOrder,
  };
}

async function remove(type: z.infer<typeof contentRequestSchema>["type"], id: string) {
  if (type === "blog") return prisma.blogPost.delete({ where: { id } });
  if (type === "faq") return prisma.faq.delete({ where: { id } });
  return prisma.testimonial.delete({ where: { id } });
}

export async function POST(req: NextRequest) {
  const admin = await requireApiRole("content");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = await readJson(req, contentRequestSchema, { maxBytes: 256 * 1024 });
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  try {
    if (body.action === "delete") {
      if (!body.id) return NextResponse.json({ error: "Content id is required." }, { status: 400 });
      await remove(body.type, body.id);
      return NextResponse.json({ ok: true, deleted: body.id });
    }

    if (!body.data) return NextResponse.json({ error: "Content data is required." }, { status: 400 });
    if (body.action === "update" && !body.id) {
      return NextResponse.json({ error: "Content id is required." }, { status: 400 });
    }

    if (body.type === "blog") {
      const input = blogSchema.safeParse(body.data);
      if (!input.success) return invalidData(input.error);
      const built = buildBlog(input.data);
      if ("error" in built) return NextResponse.json({ error: built.error }, { status: 400 });
      const record = body.action === "create"
        ? await prisma.blogPost.create({ data: built.data })
        : await prisma.blogPost.update({ where: { id: body.id! }, data: built.data });
      return NextResponse.json({ ok: true, record });
    }

    if (body.type === "faq") {
      const input = faqSchema.safeParse(body.data);
      if (!input.success) return invalidData(input.error);
      const built = buildFaq(input.data);
      if ("error" in built) return NextResponse.json({ error: built.error }, { status: 400 });
      const record = body.action === "create"
        ? await prisma.faq.create({ data: built.data })
        : await prisma.faq.update({ where: { id: body.id! }, data: built.data });
      return NextResponse.json({ ok: true, record });
    }

    const input = testimonialSchema.safeParse(body.data);
    if (!input.success) return invalidData(input.error);
    const data = buildTestimonial(input.data);
    const record = body.action === "create"
      ? await prisma.testimonial.create({ data })
      : await prisma.testimonial.update({ where: { id: body.id! }, data });
    return NextResponse.json({ ok: true, record });
  } catch (error: unknown) {
    const code = typeof error === "object" && error && "code" in error ? error.code : null;
    if (code === "P2002") {
      return NextResponse.json({ error: "That slug is already taken. Choose another." }, { status: 409 });
    }
    if (code === "P2025") {
      return NextResponse.json({ error: "Content was not found." }, { status: 404 });
    }
    console.error("[admin/content] operation failed", error);
    return NextResponse.json({ error: "Content operation failed." }, { status: 500 });
  }
}
