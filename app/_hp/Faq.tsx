// app/_hp/Faq.tsx
//
// Objection handling, from the Faq table (admin-editable at /admin/content).
// Native <details>, so it works with zero JavaScript and is keyboard accessible
// for free. Capped at eight; the other nine live on /faq.
//
// answerHtml is owner-authored light HTML from the admin panel, the same trust
// boundary the existing /faq surface uses.
//
// SERVER COMPONENT.

import Link from "next/link";

import { prisma } from "@/lib/prisma";
import s from "./hp.module.css";
import Idx from "./Idx";
import { WRAP, SECTION, display, body } from "./theme";

const MAX = 8;

async function getFaqs() {
  try {
    return await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { question: "asc" }],
      take: MAX,
      select: { id: true, question: true, answerHtml: true },
    });
  } catch {
    return [];
  }
}

export default async function Faq() {
  const faqs = await getFaqs();
  if (!faqs.length) return null;

  return (
    <section aria-labelledby="hp-faq" style={SECTION}>
      <div style={WRAP}>
        <Idx label="Questions" />

        <div className={`${s.duo} ${s.reveal}`}>
          <h2 id="hp-faq" style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "14ch" }}>
            The questions you were going to ask
          </h2>
          <p style={{ ...body(16.5) }}>
            Answered here rather than after you have paid. If yours is not below, the full
            list is on the FAQ page and we answer on WhatsApp within the working day.
          </p>
        </div>

        <div className={s.faq} style={{ marginTop: "clamp(26px,3.4vw,44px)" }}>
          {faqs.map((f) => (
            <details key={f.id} className={s.faqItem}>
              <summary>{f.question}</summary>
              <div className={s.faqBody} dangerouslySetInnerHTML={{ __html: f.answerHtml }} />
            </details>
          ))}
        </div>

        <div className={s.actions} style={{ marginTop: 26 }}>
          <Link href="/faq" className={s.ghost}>
            Every question we get
          </Link>
          <Link href="/contact" className={s.link}>
            Ask us directly
          </Link>
        </div>
      </div>
    </section>
  );
}
