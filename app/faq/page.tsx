import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/faq" },
  title: "FAQ",
  description:
    "Answers about FitFuel meal plans, delivery in Pune, tracking, dietary options, payments, allergens and more.",
};

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

// Strip HTML to plain text for the JSON-LD answer field
function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

export default async function FAQPage() {
  const faqs = await prisma.faq.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  // Preserve first-seen category order
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
        .ff-faq details { border:1px solid ${C.border}; border-radius:14px; background:${C.card}; overflow:hidden; transition:border-color .2s ease; }
        .ff-faq details[open] { border-color:${C.accent2}55; }
        .ff-faq summary { list-style:none; cursor:pointer; padding:20px 22px; display:flex; justify-content:space-between; align-items:center; gap:16px; font-size:16px; font-weight:600; color:${C.text}; }
        .ff-faq summary::-webkit-details-marker { display:none; }
        .ff-faq summary .ff-chev { transition:transform .2s ease; color:${C.accent2}; flex-shrink:0; font-family:${MONO}; }
        .ff-faq details[open] summary .ff-chev { transform:rotate(45deg); }
        .ff-faq .ff-answer { padding:0 22px 22px; color:${C.sub}; font-size:15px; line-height:1.75; }
        .ff-faq .ff-answer a { color:${C.accent}; text-decoration:none; border-bottom:1px solid ${C.accent}40; }
        .ff-faq .ff-answer a:hover { border-bottom-color:${C.accent}; }
      `}</style>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "120px 24px 96px" }} className="ff-faq">
        {/* Header */}
        <div style={{ marginBottom: 12 }}>
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
            Questions, answered
          </div>
          <h1
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: "clamp(36px, 6vw, 58px)",
              lineHeight: 0.98,
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            Frequently asked
            <br />
            <span style={{ color: C.accent }}>questions.</span>
          </h1>
        </div>

        <p style={{ color: C.sub, fontSize: 16, lineHeight: 1.7, maxWidth: 560, margin: "16px 0 48px" }}>
          Everything about plans, delivery, tracking and payments. Still stuck?{" "}
          <Link href="/contact" style={{ color: C.accent, textDecoration: "none", borderBottom: `1px solid ${C.accent}40` }}>
            Get in touch
          </Link>
          .
        </p>

        {faqs.length === 0 ? (
          <p style={{ color: C.muted, fontSize: 15 }}>FAQs are being prepared. Check back soon.</p>
        ) : (
          order.map((cat) => (
            <section key={cat} style={{ marginBottom: 40 }}>
              <h2
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: C.muted,
                  margin: "0 0 16px",
                }}
              >
                {cat}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {groups[cat].map((f) => (
                  <details key={f.id}>
                    <summary>
                      <span>{f.question}</span>
                      <span className="ff-chev" aria-hidden>
                        +
                      </span>
                    </summary>
                    <div
                      className="ff-answer"
                      dangerouslySetInnerHTML={{ __html: f.answerHtml }}
                    />
                  </details>
                ))}
              </div>
            </section>
          ))
        )}

        {/* Footer CTA */}
        <div
          style={{
            marginTop: 44,
            padding: "28px 28px",
            borderRadius: 16,
            background: C.card,
            border: `1px solid ${C.border}`,
            textAlign: "center",
          }}
        >
          <p style={{ color: C.sub, fontSize: 15.5, lineHeight: 1.7, margin: "0 0 18px" }}>
            Ready to put it to the test? Start with a single trial day, no lock-in.
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
      </div>
    </main>
  );
}
