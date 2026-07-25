// app/_hp/Faq.tsx
//
// Objection handling, from the Faq table (admin-editable at /admin/content).
// Native <details>, so it works with zero JavaScript and is keyboard-accessible
// for free. Capped at eight — the rest live on /faq.
//
// answerHtml is owner-authored light HTML from the admin panel, same trust
// boundary the existing FAQ surface uses.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import s from "./hp.module.css";
import { WRAP, SECTION, GREEN, display, body, label } from "./theme";

const MAX = 8;

async function getFaqs() {
  try {
    const rows = await (prisma as any).faq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { question: "asc" }],
      take: MAX,
      select: { id: true, question: true, answerHtml: true },
    });
    return rows as { id: string; question: string; answerHtml: string }[];
  } catch {
    return [];
  }
}

export default async function Faq() {
  const faqs = await getFaqs();
  if (!faqs.length) return null;

  return (
    <section aria-labelledby="hp-faq" style={{ ...SECTION, background: "#ebe6dc" }}>
      <div style={WRAP}>
        <div className={s.reveal}>
          <span style={label(GREEN)}>Before you ask</span>
          <h2 id="hp-faq" style={{ ...display("clamp(2.1rem,4.6vw,3.5rem)"), marginTop: 14, maxWidth: "18ch" }}>
            The questions you were going to ask
          </h2>
        </div>

        <div className={s.faq}>
          {faqs.map((f) => (
            <details key={f.id} className={s.faqItem}>
              <summary>{f.question}</summary>
              <div className={s.faqBody} dangerouslySetInnerHTML={{ __html: f.answerHtml }} />
            </details>
          ))}
        </div>

        <div className={s.actions} style={{ marginTop: 28 }}>
          <Link href="/faq" className={s.btnGhost}>
            Every question we get <ArrowRight size={16} />
          </Link>
          <Link href="/contact" className={s.btnGhost}>
            Ask us on WhatsApp <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
