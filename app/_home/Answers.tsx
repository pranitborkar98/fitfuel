// app/_home/Answers.tsx
//
// THE FAQ, AND THE JOURNAL. The last two models with no homepage presence.
//
// A full cross-check of all 52 models in prisma/schema.prisma against the
// rendered homepage left exactly two uncovered: `Faq` and `BlogPost`. Both have
// admin CRUD (app/admin/content), both have public pages (/faq, /blog), and
// neither was reachable from the homepage by anything other than a text link in
// the footer index.
//
// The FAQ matters commercially. Every competitor in this category runs one on
// the homepage, because the questions a cold visitor has (do you deliver to me,
// can I pause, what about allergies, how do I pay) are objections, and an
// objection answered on the page is a conversion that does not need a WhatsApp
// message first.
//
// SOURCE OF TRUTH: the Faq table, isActive, ordered by sortOrder. Not a
// hand-written list, so answering a new question in admin puts it here.
//
// answerHtml is owner-authored light HTML with inline links to legal pages.
// It is rendered through dangerouslySetInnerHTML, which is correct here and
// worth being explicit about: the ONLY writer is an authenticated admin through
// app/admin/content, the field is not user-submitted, and stripping the tags
// would break the legal links the answers depend on. If this table ever accepts
// public input, this render has to be sanitised first.
//
// <details>/<summary> rather than JS accordion state: it opens and closes with
// no client bundle, it is keyboard operable and screen-reader announced for
// free, and it stays open when someone hits ctrl-F on the page.
//
// FAILURE BEHAVIOUR: an empty or failed query still renders the heading and the
// link to /faq. Same rule as TrialDay. Sections do not silently delete
// themselves.
//
// SERVER COMPONENT. Prisma runs at build; the page stays static.

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { prisma } from "@/lib/prisma";
import Reveal from "./Reveal";
import { WRAP, RULE, LIME, DIM, huge, mid, copy, tag } from "./theme";

const SHOWN = 8;

type Q = { id: string; category: string; question: string; answerHtml: string };
type Post = { slug: string; title: string; excerpt: string; category: string; readMinutes: number };

async function getFaqs(): Promise<Q[]> {
  try {
    const db = prisma as any;
    return await db.faq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: SHOWN,
      select: { id: true, category: true, question: true, answerHtml: true },
    });
  } catch {
    return [];
  }
}

async function getPosts(): Promise<Post[]> {
  try {
    const db = prisma as any;
    return await db.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      take: 3,
      select: { slug: true, title: true, excerpt: true, category: true, readMinutes: true },
    });
  } catch {
    return [];
  }
}

export default async function Answers() {
  const [faqs, posts] = await Promise.all([getFaqs(), getPosts()]);

  return (
    <section
      aria-labelledby="answers-heading"
      style={{ borderTop: `1px solid ${RULE}`, padding: "clamp(70px,9vw,120px) 0" }}
    >
      <div style={WRAP}>
        <Reveal>
          <span style={tag(LIME)}>Before you ask</span>
          <h2 id="answers-heading" style={{ ...huge("clamp(2.4rem,6.4vw,5.2rem)"), maxWidth: "15ch", marginTop: 16 }}>
            The questions you were going to ask
          </h2>
        </Reveal>

        {faqs.length > 0 && (
          <Reveal delay={0.06}>
            <div className="ff-qa">
              {faqs.map((f) => (
                <details key={f.id} className="ff-qa-item">
                  <summary className="ff-qa-q">
                    <span className="ff-qa-cat">{f.category}</span>
                    <span className="ff-qa-text">{f.question}</span>
                    <span className="ff-qa-mark" aria-hidden />
                  </summary>
                  {/* See the file header on why this is dangerouslySetInnerHTML. */}
                  <div className="ff-qa-a" dangerouslySetInnerHTML={{ __html: f.answerHtml }} />
                </details>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal delay={0.12}>
          <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap", marginTop: "clamp(24px,3vw,36px)" }}>
            <Link href="/faq" className="ff-a">Every question, answered <ArrowRight size={17} /></Link>
            <Link href="/contact" className="ff-a">Still stuck? Ask us <ArrowRight size={17} /></Link>
          </div>
        </Reveal>

        {posts.length > 0 && (
          <>
            <Reveal delay={0.16}>
              <div className="ff-journal-head">
                <h3 style={{ ...mid("clamp(1.4rem,2.4vw,1.9rem)") }}>From the journal</h3>
                <Link href="/blog" className="ff-a">All posts <ArrowRight size={16} /></Link>
              </div>
            </Reveal>
            <div className="ff-journal">
              {posts.map((p, i) => (
                <Reveal key={p.slug} delay={0.18 + i * 0.05}>
                  <Link href={`/blog/${p.slug}`} className="ff-post">
                    <div className="ff-post-meta">
                      <span style={{ ...tag(LIME), fontSize: 11 }}>{p.category}</span>
                      <span style={{ ...tag(DIM), fontSize: 11 }}>{p.readMinutes} min</span>
                    </div>
                    <h4 style={{ ...mid("clamp(1.1rem,1.7vw,1.35rem)"), marginTop: 14 }}>{p.title}</h4>
                    <p style={{ ...copy(13.5), marginTop: 10 }}>{p.excerpt}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
