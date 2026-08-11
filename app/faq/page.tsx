// app/faq/page.tsx
//
// The FAQ, on the Instrument System.
//
// It was a stack of radius-14 cards with a 12px gap between each, which reads
// as N separate objects rather than one list you scan, and closed on a centred
// card with a border-radius:999px pill in it. Both gone: the questions are a
// hairline directory that takes a lime edge when open, and the close is the
// standard band.
//
// The file also declared `MONO = "var(--ff-cond), monospace"`, so every "mono"
// label on the page was actually rendering in Barlow Condensed. Labels are
// JetBrains Mono now, which is what the data voice is.
//
// The JSON-LD FAQPage block is unchanged and still required: this page states
// facts, so it carries structured data.

import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { Idx } from "@/app/_ui/Kit";
import { Band, Masthead, Shell, Wrap, p } from "@/app/_ui/Page";
import { SECTION } from "@/app/_ui/theme";

// The FAQ is prose in the repo. Nothing about it is per-request, and it carries
// FAQPage JSON-LD that crawlers should get from the edge, not from Postgres.
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/faq" },
  title: "FAQ",
  description:
    "Answers about FitFuel meal plans, delivery in Pune, tracking, dietary options, payments, allergens and more.",
};

/** Strip HTML to plain text for the JSON-LD answer field. */
function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/gi, " ")
    .trim();
}

export default async function FAQPage() {
  const faqs = await prisma.faq.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  // Preserve first-seen category order.
  const order: string[] = [];
  const groups: Record<string, typeof faqs> = {};
  for (const f of faqs) {
    if (!groups[f.category]) {
      groups[f.category] = [];
      order.push(f.category);
    }
    groups[f.category].push(f);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: stripHtml(f.answerHtml) },
    })),
  };

  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Masthead
        label="Questions, answered"
        title="Frequently asked questions"
        deck="Everything about plans, delivery, tracking and payments, grouped by what you are actually trying to find out."
        meta={[
          { k: "Questions", v: String(faqs.length) },
          { k: "Categories", v: String(order.length) },
        ]}
      />

      <section style={{ ...SECTION, paddingTop: 0 }}>
        <Wrap>
          {faqs.length === 0 ? (
            <p style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: 15.5, color: "#9a9a94" }}>
              FAQs are being prepared. Check back soon.
            </p>
          ) : (
            order.map((cat) => (
              <section key={cat} style={{ marginBottom: "clamp(40px,5vw,64px)" }}>
                {/* One mono label on a hairline per group. The category was an
                    <h2> in the display face at 12px, which is a heading that
                    does not look like one. */}
                <Idx label={cat} />
                <div className={p.qa}>
                  {groups[cat].map((f) => (
                    <details key={f.id}>
                      <summary>
                        <span>{f.question}</span>
                        <span className={p.qaMark} aria-hidden="true">
                          +
                        </span>
                      </summary>
                      <div className={p.qaBody} dangerouslySetInnerHTML={{ __html: f.answerHtml }} />
                    </details>
                  ))}
                </div>
              </section>
            ))
          )}
        </Wrap>
      </section>

      <Band
        title="Still stuck?"
        body="Ask us directly, or put it to the test with a single trial day and no lock-in."
        href="/plans"
        cta="Browse plans"
        secondary={{ href: "/contact", label: "Get in touch" }}
      />
    </Shell>
  );
}
