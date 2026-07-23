import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
  title: "Blog",
  description:
    "Nutrition, training and fat-loss guidance for Pune, written by the team that cooks your meals. Practical, India-first, no fad diets.",
  openGraph: {
    title: "FitFuel Blog",
    description: "Practical nutrition and training guidance, India-first.",
    url: "https://fitfuel.in/blog",
    siteName: "FitFuel",
    type: "website",
  },
};

const C = {
  bg: "#080808",
  bg2: "#060606",
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
    month: "short",
    year: "numeric",
  }).format(d);
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
  });

  const categories = Array.from(new Set(posts.map((p) => p.category))).sort();
  const active = category && categories.includes(category) ? category : null;
  const visible = active ? posts.filter((p) => p.category === active) : posts;

  const featured = !active ? visible.find((p) => p.isFeatured) ?? visible[0] : null;
  const rest = featured ? visible.filter((p) => p.id !== featured.id) : visible;

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
      <style>{`
        .ff-blog-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        .ff-blog-card { transition: border-color .2s ease, transform .2s ease; }
        .ff-blog-card:hover { border-color:${C.accent2}66 !important; transform: translateY(-3px); }
        .ff-pill { transition: all .15s ease; }
        .ff-pill:hover { color:${C.text} !important; border-color:${C.accent2}66 !important; }
        @media (max-width: 900px){ .ff-blog-grid { grid-template-columns:repeat(2,1fr);} }
        @media (max-width: 600px){ .ff-blog-grid { grid-template-columns:1fr;} }
      `}</style>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "120px 24px 96px" }}>
        {/* Header */}
        <div style={{ marginBottom: 44 }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: C.accent2,
              marginBottom: 14,
            }}
          >
            The FitFuel Journal
          </div>
          <h1
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: "clamp(38px, 6vw, 64px)",
              lineHeight: 0.98,
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Eat smarter,
            <br />
            <span style={{ color: C.accent }}>train sharper.</span>
          </h1>
          <p
            style={{
              color: C.sub,
              fontSize: 16,
              lineHeight: 1.7,
              maxWidth: 560,
              marginTop: 18,
            }}
          >
            Practical nutrition and training guidance from the team that cooks your
            meals. India-first, no fad diets, no nonsense.
          </p>
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 40 }}>
            <Link
              href="/blog"
              className="ff-pill"
              style={{
                fontFamily: MONO,
                fontSize: 12,
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: 999,
                border: `1px solid ${!active ? C.accent2 : C.border}`,
                color: !active ? C.accent : C.sub,
                background: !active ? `${C.accent2}14` : "transparent",
              }}
            >
              All
            </Link>
            {categories.map((cat) => {
              const on = active === cat;
              return (
                <Link
                  key={cat}
                  href={`/blog?category=${encodeURIComponent(cat)}`}
                  className="ff-pill"
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    textDecoration: "none",
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: `1px solid ${on ? C.accent2 : C.border}`,
                    color: on ? C.accent : C.sub,
                    background: on ? `${C.accent2}14` : "transparent",
                  }}
                >
                  {cat}
                </Link>
              );
            })}
          </div>
        )}

        {visible.length === 0 ? (
          <p style={{ color: C.muted, fontSize: 15 }}>
            No articles here yet. Check back soon.
          </p>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="ff-blog-card"
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  border: `1px solid ${C.border}`,
                  borderRadius: 18,
                  overflow: "hidden",
                  background: C.card,
                  marginBottom: 36,
                }}
              >
                <div
                  style={{
                    height: 4,
                    background: `linear-gradient(90deg, ${C.accent2}, ${C.accent})`,
                  }}
                />
                <div style={{ padding: "34px 36px 38px" }}>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      color: C.accent2,
                      marginBottom: 14,
                    }}
                  >
                    Featured · {featured.category}
                  </div>
                  <h2
                    style={{
                      fontFamily: DISPLAY,
                      fontWeight: 800,
                      fontSize: "clamp(26px, 3.6vw, 40px)",
                      lineHeight: 1.04,
                      textTransform: "uppercase",
                      letterSpacing: "-0.01em",
                      margin: "0 0 14px",
                      maxWidth: 760,
                    }}
                  >
                    {featured.title}
                  </h2>
                  <p
                    style={{
                      color: C.sub,
                      fontSize: 16,
                      lineHeight: 1.7,
                      maxWidth: 680,
                      margin: "0 0 18px",
                    }}
                  >
                    {featured.excerpt}
                  </p>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      color: C.muted,
                      display: "flex",
                      gap: 14,
                    }}
                  >
                    <span>{featured.authorName}</span>
                    <span>·</span>
                    <span>{fmtDate(featured.publishedAt)}</span>
                    <span>·</span>
                    <span>{featured.readMinutes} min read</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            <div className="ff-blog-grid">
              {rest.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="ff-blog-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    textDecoration: "none",
                    color: "inherit",
                    border: `1px solid ${C.border}`,
                    borderRadius: 16,
                    background: C.card,
                    padding: "26px 24px 24px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 12.5,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      color: C.accent2,
                      marginBottom: 12,
                    }}
                  >
                    {p.category}
                  </div>
                  <h3
                    style={{
                      fontFamily: DISPLAY,
                      fontWeight: 700,
                      fontSize: 23,
                      lineHeight: 1.1,
                      textTransform: "uppercase",
                      letterSpacing: "-0.005em",
                      margin: "0 0 12px",
                    }}
                  >
                    {p.title}
                  </h3>
                  <p
                    style={{
                      color: C.sub,
                      fontSize: 14.5,
                      lineHeight: 1.65,
                      margin: "0 0 18px",
                      flexGrow: 1,
                    }}
                  >
                    {p.excerpt}
                  </p>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 12.5,
                      color: C.muted,
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    <span>{fmtDate(p.publishedAt)}</span>
                    <span>·</span>
                    <span>{p.readMinutes} min</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
