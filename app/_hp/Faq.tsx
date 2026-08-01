// app/_hp/Faq.tsx
//
// Objection handling, from the Faq table (admin-editable at /admin/content).
// Capped at eight; the other nine live on /faq.
//
// The panel below is a client island because it searches and filters, but every
// question and every answer is server-rendered into the DOM and merely hidden
// when filtered out. So this section works without JavaScript, it is crawlable,
// and the FAQPage JSON-LD on the page describes exactly what is rendered.
//
// SERVER COMPONENT.

import { prisma } from "@/lib/prisma";
import v from "./v2.module.css";
import Idx from "./Idx";
import FaqPanel, { type FaqRow } from "./FaqPanel";
import { WRAP, PANEL, display, body } from "./theme";

const MAX = 8;

async function getFaqs(): Promise<FaqRow[]> {
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
    <section
      aria-labelledby="hp-faq"
      style={{ padding: "clamp(56px,7vw,104px) 0", background: PANEL, borderTop: "1px solid #232320" }}
    >
      <div style={WRAP}>
        <Idx label="Questions" />

        <div className={v.head}>
          <h2 id="hp-faq" className={v.rise} style={{ ...display("clamp(2.4rem,6.6vw,5.4rem)"), maxWidth: "14ch" }}>
            The questions you were going to ask
          </h2>
          <p className={v.rise} style={{ ...body(16.5), maxWidth: "46ch" }}>
            Search them or filter them. Answered here rather than after you have paid, and the
            full list is one click away.
          </p>
        </div>

        <FaqPanel faqs={faqs} />
      </div>
    </section>
  );
}
