// app/testimonials/page.tsx
//
// Reviews, on the Instrument System.
//
// What changed beyond the palette: the goal filters were border-radius:999px
// pills, the reviews were radius-16 cards that lifted 3px on hover, and the
// close was a 135deg gradient card with another pill in the middle of it.
// Pills, lift and gradient are all on the reject list.
//
// The rating also stopped being carried by glyphs alone. It was five ★, with
// the unearned ones in #1f1f1f at about 1.1:1 against the card, so a 3-star
// review and a 5-star review were very nearly the same object visually and
// identical to anyone who cannot resolve that grey. The figure is printed as
// "3.0" in mono beside the stars now, and the stars are aria-hidden.
//
// `MONO` was defined as "var(--ff-cond), monospace" here too, so every mono
// label on the page was rendering in the display face.

import Link from "next/link";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { Idx, Tiles, Tile, k } from "@/app/_ui/Kit";
import { Band, Masthead, Shell, Wrap } from "@/app/_ui/Page";
import { DIM, INK, MUTE, SECTION, body, label, num } from "@/app/_ui/theme";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/testimonials" },
  title: "Reviews",
  description:
    "Real results from FitFuel members across Pune, weight loss, muscle gain and better daily eating, on plans we cook and deliver.",
  openGraph: {
    title: "FitFuel Reviews",
    description: "Real member results across Pune.",
    url: "https://fitfuel.in/testimonials",
    siteName: "FitFuel",
    type: "website",
  },
};

const GOAL_FILTERS: { label: string; value: string | null }[] = [
  { label: "All", value: null },
  { label: "Weight loss", value: "weight_loss" },
  { label: "Muscle gain", value: "muscle_gain" },
  { label: "Balanced", value: "balanced" },
  { label: "Office", value: "office" },
];

/** Stars are decoration over a printed figure, never the figure itself. */
function Rating({ n }: { n: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ ...num("15px", INK) }}>{n.toFixed(1)}</span>
      <span aria-hidden="true" style={{ color: "#84cc16", fontSize: 13, letterSpacing: 1 }}>
        {"★".repeat(n)}
        <span style={{ color: DIM }}>{"☆".repeat(5 - n)}</span>
      </span>
    </span>
  );
}

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ goal?: string }>;
}) {
  const { goal } = await searchParams;
  const activeGoal = GOAL_FILTERS.some((g) => g.value === goal) ? goal ?? null : null;

  const all = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
  });

  const visible = activeGoal ? all.filter((t) => t.goal === activeGoal) : all;
  const avg = all.length > 0 ? (all.reduce((s, t) => s + t.rating, 0) / all.length).toFixed(1) : "0.0";

  return (
    <Shell>
      <Masthead
        label="Reviews"
        title="Real food, real results"
        deck="Every review here is from a member who ate the plan. Filter by what they were training for."
        meta={[
          { k: "Average rating", v: `${avg} / 5` },
          { k: "Reviews", v: String(all.length) },
        ]}
      />

      <section style={{ ...SECTION, paddingTop: 0 }}>
        <Wrap>
          {/* The chip rail: a hairline-jointed row, never pills. These are
              links rather than buttons because each is a real URL the page
              can be shared at. */}
          <Idx label="Filter by goal" />
          <div className={k.chips}>
            {GOAL_FILTERS.map((g) => {
              const on = activeGoal === g.value;
              return (
                <Link
                  key={g.label}
                  href={g.value ? `/testimonials?goal=${g.value}` : "/testimonials"}
                  className={on ? `${k.chip} ${k.chipOn}` : k.chip}
                  style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
                  aria-current={on ? "page" : undefined}
                >
                  {g.label}
                </Link>
              );
            })}
          </div>

          <div style={{ marginTop: "clamp(26px,3.6vw,42px)" }}>
            {visible.length === 0 ? (
              <p style={{ ...body(15.5) }}>No reviews in this category yet.</p>
            ) : (
              <Tiles cols={3}>
                {visible.map((t) => (
                  <Tile key={t.id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <Rating n={t.rating} />
                      <span
                        style={{ ...label("#84cc16") }}
                        dangerouslySetInnerHTML={{ __html: t.resultLabel }}
                      />
                    </div>

                    <p
                      style={{ ...body(14.5), flexGrow: 1, marginTop: 6 }}
                      dangerouslySetInnerHTML={{ __html: `&ldquo;${t.quote}&rdquo;` }}
                    />

                    <div style={{ borderTop: "1px solid #232320", paddingTop: 13, marginTop: 4 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-barlow-condensed), sans-serif",
                          fontWeight: 800,
                          fontSize: 17,
                          letterSpacing: "-0.01em",
                          textTransform: "uppercase",
                          color: INK,
                        }}
                      >
                        {t.name}
                        <span style={{ color: MUTE, fontWeight: 400 }}> &middot; {t.location}</span>
                      </div>
                      <span
                        style={{ ...label(), marginTop: 6 }}
                        dangerouslySetInnerHTML={{ __html: t.planLabel }}
                      />
                    </div>
                  </Tile>
                ))}
              </Tiles>
            )}
          </div>
        </Wrap>
      </section>

      <Band
        title="Your result is next"
        body="Pick a goal, we cook and deliver it, and your progress writes its own review."
        href="/plans"
        cta="Start your plan"
        secondary={{ href: "/results", label: "How we measure" }}
      />
    </Shell>
  );
}
