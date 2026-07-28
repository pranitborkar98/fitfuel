// app/_hp/Proof.tsx
//
// PROOF, from the Testimonial table rather than from a copywriter.
//
// Three featured quotes, each carrying the thing a prospect actually scans for:
// the result, the plan they were on, and the area they live in. Area matters
// more than it looks — "Kharadi" tells a Kharadi reader this is a real local
// business, which is the single hardest thing for a national brand to fake.
//
// Renders nothing if the table is empty. This is one of the few sections where
// disappearing is correct: an empty testimonials block is worse than no block.
//
// SERVER COMPONENT.

import Link from "next/link";

import { prisma } from "@/lib/prisma";
import s from "./hp.module.css";
import Idx from "./Idx";
import { WRAP, SECTION, PANEL, INK, DIM, display, body } from "./theme";

type Row = {
  id: string;
  name: string;
  location: string;
  planLabel: string;
  resultLabel: string;
  quote: string;
};

/* The seed wrote HTML entities into these columns ("&mdash;", "&middot;"), but
   quote / planLabel are plain-text fields rendered as text, so they were
   printing literally on the page as "&mdash;". Decoding at the read boundary
   fixes the display without rewriting rows in the database; the real fix is in
   prisma/seed-phase14.ts, which should be storing the characters. Deliberately
   a fixed table and not a generic HTML decoder: this is plain text, and running
   it through an HTML parser would be a way to reintroduce markup we then render
   as text anyway. */
const ENTITIES: Record<string, string> = {
  "&mdash;": "—",
  "&ndash;": "–",
  "&middot;": "·",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&rsquo;": "’",
  "&lsquo;": "‘",
  "&nbsp;": " ",
};

function decode(v: string): string {
  return v.replace(/&(?:mdash|ndash|middot|amp|quot|#39|rsquo|lsquo|nbsp);/g, (m) => ENTITIES[m] ?? m);
}

async function getQuotes(): Promise<Row[]> {
  try {
    const rows = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
      take: 3,
      select: {
        id: true,
        name: true,
        location: true,
        planLabel: true,
        resultLabel: true,
        quote: true,
      },
    });
    return rows.map((r) => ({
      ...r,
      location: decode(r.location),
      planLabel: decode(r.planLabel),
      resultLabel: decode(r.resultLabel),
      quote: decode(r.quote),
    }));
  } catch {
    return [];
  }
}

export default async function Proof() {
  const quotes = await getQuotes();
  if (!quotes.length) return null;

  return (
    <section aria-labelledby="hp-proof" style={{ ...SECTION, background: PANEL }}>
      <div style={WRAP}>
        <Idx label="Proof" />

        <div className={s.reveal}>
          <h2 id="hp-proof" style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "15ch" }}>
            People who stopped guessing
          </h2>
        </div>

        <div className={s.quotes} style={{ marginTop: "clamp(26px,3.4vw,44px)" }}>
          {quotes.map((q) => (
            <figure key={q.id} className={s.quote} style={{ margin: 0 }}>
              <div className={s.quoteResult}>{q.resultLabel}</div>
              <blockquote style={{ margin: 0 }}>
                <p style={{ ...body(15.5), color: INK }}>&ldquo;{q.quote}&rdquo;</p>
              </blockquote>
              <figcaption
                style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid #232320" }}
              >
                <span style={{ ...body(14.5), color: INK, fontWeight: 600 }}>{q.name}</span>
                <span style={{ ...body(13.5), color: DIM, marginTop: 4 }}>
                  {q.location}, {q.planLabel}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className={s.actions} style={{ marginTop: 26 }}>
          <Link href="/results" className={s.ghost}>
            More results
          </Link>
          <Link href="/testimonials" className={s.link}>
            Every review we have
          </Link>
        </div>

        <p style={{ ...body(13.5), color: DIM, marginTop: 20 }}>
          Results vary with adherence, starting point and medical history. These are
          individual outcomes, not an average and not a promise.
        </p>
      </div>
    </section>
  );
}
