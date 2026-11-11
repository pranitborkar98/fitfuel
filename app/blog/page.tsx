// app/blog/page.tsx
//
// The journal index, on the Instrument System.
//
// The card grid is gone. An index of articles is the exact case the directory
// row exists for: hairline-separated rows you scan down, rather
// than a three-up grid of radius-18 cards that each lift 3px on hover. The
// category filters were border-radius:999px pills and are now the chip rail.
//
// The featured post keeps its prominence by being set at display scale above
// the rule, not by having a lime gradient bar welded to the top of a card.
//
// `MONO` was declared here as "var(--ff-cond), monospace" as well, so the
// eyebrow and every filter label were rendering in Barlow Condensed rather
// than JetBrains Mono. Third file with that same copy-paste.

import Link from "next/link";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { Idx, Row, Go, k } from "@/app/_ui/Kit";
import { Masthead, Shell, Wrap } from "@/app/_ui/Page";
import { DIM, INK, SECTION, body, display, label, num } from "@/app/_ui/theme";

// Stays dynamic: this page reads ?category to filter, so it is rendered per
// request regardless of what is declared here. The cacheable half of the blog
// is app/blog/[slug], which is now on revalidate.
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

  const featured = !active ? (visible.find((p) => p.isFeatured) ?? visible[0]) : null;
  const rest = featured ? visible.filter((p) => p.id !== featured.id) : visible;

  return (
    <Shell>
      <Masthead
        label="The FitFuel journal"
        title="Eat smarter, train sharper"
        deck="Practical nutrition and training guidance from the team that cooks your meals. India-first, no fad diets, no nonsense."
        meta={[
          { k: "Articles", v: String(posts.length) },
          { k: "Categories", v: String(categories.length) },
        ]}
      />

      <section style={{ ...SECTION, paddingTop: 0 }}>
        <Wrap>
          {/* The chip rail, not pills. */}
          {categories.length > 0 && (
            <>
              <Idx label="Filter by category" />
              <div className={k.chips} style={{ marginBottom: "clamp(30px,4vw,48px)" }}>
                <Link
                  href="/blog"
                  className={!active ? `${k.chip} ${k.chipOn}` : k.chip}
                  style={CHIP_LINK}
                  aria-current={!active ? "page" : undefined}
                >
                  All
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/blog?category=${encodeURIComponent(cat)}`}
                    className={active === cat ? `${k.chip} ${k.chipOn}` : k.chip}
                    style={CHIP_LINK}
                    aria-current={active === cat ? "page" : undefined}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </>
          )}

          {visible.length === 0 ? (
            <p style={body(15.5)}>No articles here yet. Check back soon.</p>
          ) : (
            <>
              {/* The lead. Prominence from scale and position, not from a
                  gradient bar on a card. */}
              {featured && (
                <Link href={`/blog/${featured.slug}`} className={k.rows} style={LEAD}>
                  <span style={label("var(--fk-green)")}>{featured.category}</span>
                  <h2 style={{ ...display("clamp(2.1rem,6vw,4.6rem)"), maxWidth: "18ch", margin: "16px 0 18px" }}>
                    {featured.title}
                  </h2>
                  <p style={{ ...body(16.5), maxWidth: "62ch" }}>{featured.excerpt}</p>
                  <span style={{ ...label(), marginTop: 20 }}>
                    {featured.authorName} &middot; {fmtDate(featured.publishedAt ?? new Date())}{" "}
                    &middot; {featured.readMinutes} min read
                  </span>
                </Link>
              )}

              {rest.length > 0 && (
                <div className={k.rows} style={{ marginTop: featured ? "clamp(40px,5vw,64px)" : 0 }}>
                  {rest.map((p) => (
                    <Row
                      key={p.id}
                      href={`/blog/${p.slug}`}
                      cols="minmax(0,1.6fr) minmax(0,1.4fr) 120px 78px 28px"
                    >
                      <h3
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
                        {p.title}
                      </h3>
                      <p style={{ ...body(14), maxWidth: "46ch" }}>{p.excerpt}</p>
                      <span style={label()}>{p.category}</span>
                      {/* Read time is a number in a column, so it is mono and
                          tabular: these line up down the page. */}
                      <span style={num("13px", DIM)}>{p.readMinutes} min</span>
                      <Go />
                    </Row>
                  ))}
                </div>
              )}
            </>
          )}
        </Wrap>
      </section>
    </Shell>
  );
}

const CHIP_LINK = {
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

/* The lead article: a directory row that has been allowed to breathe. Same
   hairline top and bottom as the rows under it, so it reads as the first
   entry in the list rather than as a separate card floating above it. */
const LEAD = {
  display: "block",
  textDecoration: "none",
  color: "inherit",
  borderBottom: "1px solid var(--fk-line)",
  padding: "clamp(28px,4vw,44px) 0",
} as const;
