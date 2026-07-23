import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const C = {
  bg: "#080808",
  accent: "#a3e635",
  accent2: "#84cc16",
  text: "#ffffff",
  sub: "#a3a3a3",
  muted: "#9a9a94",
  border: "#1f1f1f",
  card: "#111111",
};

const DISPLAY = "var(--ff-cond)";
const BODY = "inherit";
const MONO = "var(--ff-cond), monospace";

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
    where: {
      status: "PUBLISHED",
      category: post.category,
      id: { not: post.id },
    },
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
    <main
      style={{
        background: C.bg,
        color: C.text,
        minHeight: "100vh",
        fontFamily: BODY,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style>{`
        .ff-prose { color:${C.sub}; font-size:17px; line-height:1.8; }
        .ff-prose p { margin:0 0 20px; }
        .ff-prose h2 { font-family:${DISPLAY}; font-weight:800; text-transform:uppercase; letter-spacing:-0.01em; color:${C.text}; font-size:28px; line-height:1.1; margin:42px 0 16px; }
        .ff-prose h3 { font-family:${DISPLAY}; font-weight:700; text-transform:uppercase; color:${C.text}; font-size:21px; margin:32px 0 12px; }
        .ff-prose ul, .ff-prose ol { margin:0 0 22px; padding-left:22px; }
        .ff-prose li { margin:0 0 10px; }
        .ff-prose strong { color:${C.text}; font-weight:600; }
        .ff-prose a { color:${C.accent}; text-decoration:none; border-bottom:1px solid ${C.accent}40; }
        .ff-prose a:hover { border-bottom-color:${C.accent}; }
        .ff-prose blockquote { border-left:3px solid ${C.accent2}; margin:24px 0; padding:4px 0 4px 18px; color:${C.muted}; font-style:italic; }
        .ff-prose em { color:${C.muted}; }
        .ff-related-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .ff-rel-card { transition:border-color .2s ease, transform .2s ease; }
        .ff-rel-card:hover { border-color:${C.accent2}66 !important; transform:translateY(-3px); }
        @media (max-width:760px){ .ff-related-grid { grid-template-columns:1fr; } }
      `}</style>

      <article style={{ maxWidth: 760, margin: "0 auto", padding: "120px 24px 40px" }}>
        <Link
          href="/blog"
          style={{
            fontFamily: MONO,
            fontSize: 12,
            color: C.muted,
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 28,
          }}
        >
          ← All articles
        </Link>

        <div
          style={{
            fontFamily: MONO,
            fontSize: 12,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: C.accent2,
            marginBottom: 16,
          }}
        >
          {post.category}
        </div>

        <h1
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: "clamp(32px, 5.2vw, 52px)",
            lineHeight: 1.02,
            letterSpacing: "-0.015em",
            textTransform: "uppercase",
            margin: "0 0 22px",
          }}
        >
          {post.title}
        </h1>

        <div
          style={{
            fontFamily: MONO,
            fontSize: 12.5,
            color: C.muted,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            paddingBottom: 28,
            marginBottom: 36,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <span>{post.authorName}</span>
          <span>·</span>
          <span>{fmtDate(post.publishedAt)}</span>
          <span>·</span>
          <span>{post.readMinutes} min read</span>
        </div>

        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt={post.title}
            style={{
              width: "100%",
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              marginBottom: 36,
              display: "block",
            }}
          />
        )}

        <div
          className="ff-prose"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {post.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 36 }}>
            {post.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  color: C.muted,
                  border: `1px solid ${C.border}`,
                  borderRadius: 999,
                  padding: "5px 12px",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div
          style={{
            marginTop: 48,
            padding: "32px 30px",
            borderRadius: 18,
            background: C.card,
            border: `1px solid ${C.border}`,
          }}
        >
          <h3
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              textTransform: "uppercase",
              fontSize: 26,
              margin: "0 0 10px",
            }}
          >
            Stop guessing. <span style={{ color: C.accent }}>Start eating right.</span>
          </h3>
          <p style={{ color: C.sub, fontSize: 15.5, lineHeight: 1.7, margin: "0 0 20px", maxWidth: 480 }}>
            We do the calculation and the cooking. You eat, log, and watch the trend.
          </p>
          <Link
            href="/plans"
            style={{
              display: "inline-block",
              fontFamily: MONO,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              color: "#080808",
              background: C.accent,
              padding: "13px 26px",
              borderRadius: 999,
              textDecoration: "none",
            }}
          >
            Browse plans →
          </Link>
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section style={{ maxWidth: 1120, margin: "0 auto", padding: "20px 24px 96px" }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: C.accent2,
              marginBottom: 22,
            }}
          >
            More in {post.category}
          </div>
          <div className="ff-related-grid">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/blog/${r.slug}`}
                className="ff-rel-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textDecoration: "none",
                  color: "inherit",
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  background: C.card,
                  padding: "24px 22px",
                }}
              >
                <h4
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontSize: 20,
                    lineHeight: 1.1,
                    margin: "0 0 10px",
                  }}
                >
                  {r.title}
                </h4>
                <p style={{ color: C.sub, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  {r.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
