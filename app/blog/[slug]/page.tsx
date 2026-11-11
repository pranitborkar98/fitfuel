// app/blog/[slug]/page.tsx
//
// A single article, on the Instrument System.
//
// The article body is the one place on this site where long-form prose is the
// whole point, so the measure is the constraint: 66ch, flush left. It reuses
// the shared .prose block rather than redefining a .ff-prose in a style tag.
//
// Removed: radius 16/18 and three border-radius:999px runs (the tag row, the
// CTA button and the related cards), the var(--fk-surface) CTA card, and `MONO` declared
// as "var(--ff-cond), monospace" — the fourth file carrying that same
// copy-paste, so the byline and every tag were set in the display face rather
// than in JetBrains Mono.
//
// The related posts were a three-up card grid; they are directory rows now,
// which is what an index of articles is.
//
// JSON-LD (BlogPosting) is unchanged: this page states facts about a published
// work, so it keeps its structured data. A canonical was added, because
// every public page needs one and this one did not have it.

import Breadcrumb from "@/components/Breadcrumb";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { safeJsonLd, sanitizeRichHtml } from "@/lib/content-safety";
import { Go, Idx, Row, k } from "@/app/_ui/Kit";
import { Band, Shell, Wrap, p as pg } from "@/app/_ui/Page";
import { DIM, INK, SECTION, body, display, label, num } from "@/app/_ui/theme";

// See app/blog/page.tsx: a published post is the most cacheable thing on the
// site. Re-rendering it per request was pure cost.
export const revalidate = 300;

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || post.status !== "PUBLISHED") {
    return { title: "Article not found" };
  }
  return {
    title: `${post.title}`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://fitfuel.in/blog/${post.slug}`,
      siteName: "FitFuel",
      type: "article",
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || post.status !== "PUBLISHED") notFound();

  const related = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", category: post.category, id: { not: post.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: post.authorName },
    publisher: { "@type": "Organization", name: "FitFuel" },
    mainEntityOfPage: `https://fitfuel.in/blog/${post.slug}`,
  };

  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      <article>
        <Wrap style={{ paddingTop: "clamp(96px,13vw,150px)" }}>
          {/* Was the site's only lone back-link, in its own style. Now the
              same breadcrumb the dish and plan pages draw. */}
          <div style={{ marginBottom: 28 }}>
            <Breadcrumb
              trail={[
                { href: "/", label: "FitFuel" },
                { href: "/blog", label: "All articles" },
              ]}
              current={post.category}
            />
          </div>

          <div style={{ maxWidth: 900 }}>
            <span style={label("var(--fk-green)")}>{post.category}</span>
            <h1 style={{ ...display("clamp(2.2rem,6.4vw,5rem)"), margin: "18px 0 24px", maxWidth: "20ch" }}>
              {post.title}
            </h1>
            <p style={{ ...body(17.5), maxWidth: "58ch", marginBottom: 26 }}>{post.excerpt}</p>
          </div>

          {/* Byline as a mono metadata line on a hairline, matching the meta
              row every other page's masthead opens with. */}
          <div style={BYLINE}>
            <span>{post.authorName}</span>
            <span style={{ color: DIM }}>/</span>
            <span>{fmtDate(post.publishedAt)}</span>
            <span style={{ color: DIM }}>/</span>
            <span style={num("12px", INK)}>{post.readMinutes} min read</span>
          </div>

          {post.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImageUrl}
              alt=""
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                border: "1px solid var(--fk-line)",
                margin: "clamp(28px,4vw,44px) 0",
                /* The house grade: food keeps its colour, lifted slightly. */
                filter: "saturate(1.06) contrast(1.07)",
              }}
            />
          )}

          <div
            className={pg.prose}
            style={{ marginTop: post.coverImageUrl ? 0 : "clamp(28px,4vw,44px)" }}
            dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(post.contentHtml) }}
          />

          {post.tags.length > 0 && (
            <div style={TAGS}>
              {post.tags.map((tag) => (
                <span key={tag} style={TAG}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Wrap>
      </article>

      {related.length > 0 && (
        <section style={{ ...SECTION, paddingBottom: 0 }}>
          <Wrap>
            <Idx label={`More in ${post.category}`} />
            <div className={k.rows}>
              {related.map((r) => (
                <Row key={r.id} href={`/blog/${r.slug}`} cols="minmax(0,1.5fr) minmax(0,1.5fr) 78px 28px">
                  <h2
                    style={{
                      fontFamily: "var(--fk-display)",
                      fontWeight: 600,
                      fontSize: "clamp(1.1rem,2vw,1.45rem)",
                      lineHeight: 1.2,
                      letterSpacing: "-0.015em",
                      textTransform: "none",
                      color: INK,
                      margin: 0,
                    }}
                  >
                    {r.title}
                  </h2>
                  <p style={{ ...body(14), maxWidth: "46ch" }}>{r.excerpt}</p>
                  <span style={num("13px", DIM)}>{r.readMinutes} min</span>
                  <Go />
                </Row>
              ))}
            </div>
          </Wrap>
        </section>
      )}

      <Band
        title="Stop guessing, start eating right"
        body="We do the calculation and the cooking. You eat, log, and watch the trend."
        href="/plans"
        cta="Browse plans"
        secondary={{ href: "/tdee-calculator", label: "Find your numbers" }}
      />
    </Shell>
  );
}

const BYLINE = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px 14px",
  alignItems: "baseline",
  paddingTop: 14,
  borderTop: "1px solid var(--fk-line)",
  fontFamily: "var(--font-mono), monospace",
  fontSize: 12,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--fk-ink-3)",
} as const;

/* Tags were border-radius:999px chips. They are a hairline-jointed mono rail
   now: square, and the leading # is dropped because the word is the tag. */
const TAGS = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
  background: "var(--fk-line)",
  border: "1px solid var(--fk-line)",
  marginTop: "clamp(34px,4.5vw,52px)",
} as const;

const TAG = {
  flex: "1 1 auto",
  textAlign: "center",
  background: "var(--fk-paper)",
  padding: "12px 15px",
  fontFamily: "var(--font-mono), monospace",
  fontSize: 12,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--fk-ink-3)",
} as const;
