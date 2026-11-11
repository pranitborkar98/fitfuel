"use client";

// app/_hp/FaqPanel.tsx
//
// SEARCH, FILTER, OPEN IN PLACE.
//
// The old FAQ was eight native <details> in a column, which works with zero
// JavaScript and is the right default. What the prototype adds is worth the
// island: a visitor with a specific worry — is it veg, can I pause, do you
// deliver to Wagholi — should not have to read eight questions to find out we
// answered theirs. Search and a category rail do that.
//
// THE ANSWERS ARE ALWAYS IN THE DOM. Filtering hides matches with CSS rather
// than unmounting them, so a crawler and a screen reader in browse mode still
// see all eight questions and all eight answers whether or not this hydrates,
// and the FAQPage JSON-LD on the page describes exactly what is rendered.
//
// CATEGORIES ARE DERIVED, not a second admin-editable field nobody would
// maintain. Each question is bucketed by keyword at render time, so adding an
// FAQ in /admin/content lands in a bucket without a migration and without
// anyone remembering to tag it. A question matching nothing lands in "Everything
// else", which is why the rail never shows an empty category.
//
// answerHtml is owner-authored light HTML from the admin panel, the same trust
// boundary /faq already uses.
//
// CLIENT COMPONENT: it is a control.

import { useMemo, useState } from "react";
import Link from "next/link";

import s from "./hp.module.css";
import v from "./v2.module.css";
import { INK, MUTE, DIM, LIME, BG, PANEL_2, sub, body, label } from "./theme";

export type FaqRow = { id: string; question: string; answerHtml: string };

/* Bucket by the words a question actually uses. Order matters: the first match
   wins, so the more specific buckets are listed first. */
const BUCKETS: [string, RegExp][] = [
  ["Food", /veg|jain|diet|allerg|dish|menu|meal|cook|taste|spice|ingredient|macro|protein|calor/i],
  ["Delivery", /deliver|arriv|area|pincode|morning|late|window|driver|pune|together/i],
  ["Plans", /plan|pause|cancel|switch|subscri|duration|trial|renew|include/i],
  ["Money", /price|cost|pay|refund|gst|coupon|discount|charge|invoice/i],
];
const OTHER = "Everything else";

function bucketOf(q: string): string {
  return BUCKETS.find(([, re]) => re.test(q))?.[0] ?? OTHER;
}

/* Strip tags for searching so a query matches answer text without matching the
   markup around it: "strong" should not hit every <strong>. */
const plain = (html: string) => html.replace(/<[^>]*>/g, " ");

export default function FaqPanel({ faqs }: { faqs: FaqRow[] }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);

  const tagged = useMemo(
    () => faqs.map((f) => ({ ...f, cat: bucketOf(f.question), hay: `${f.question} ${plain(f.answerHtml)}`.toLowerCase() })),
    [faqs],
  );

  const cats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of tagged) counts.set(f.cat, (counts.get(f.cat) ?? 0) + 1);
    return [...counts.entries()];
  }, [tagged]);

  const q = query.trim().toLowerCase();
  const matches = (f: (typeof tagged)[number]) =>
    (!cat || f.cat === cat) && (!q || f.hay.includes(q));
  const hits = tagged.filter(matches).length;

  return (
    <div className={v.faq} style={{ marginTop: "clamp(30px,4vw,52px)" }}>
      <div className={v.faqSide}>
        <label className={v.search}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={LIME} strokeWidth="2.4" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.6-3.6" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the questions"
            aria-label="Search the questions"
          />
        </label>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <button
            type="button"
            onClick={() => setCat(null)}
            aria-pressed={cat === null}
            className={v.cat}
            style={{
              background: cat === null ? PANEL_2 : "transparent",
              borderLeftColor: cat === null ? LIME : "transparent",
              color: cat === null ? INK : MUTE,
            }}
          >
            All questions
            <b style={{ fontWeight: 400, color: DIM }}>{tagged.length}</b>
          </button>
          {cats.map(([name, n]) => {
            const on = cat === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setCat(on ? null : name)}
                aria-pressed={on}
                className={v.cat}
                style={{
                  background: on ? PANEL_2 : "transparent",
                  borderLeftColor: on ? LIME : "transparent",
                  color: on ? INK : MUTE,
                }}
              >
                {name}
                <b style={{ fontWeight: 400, color: DIM }}>{n}</b>
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: "auto",
            border: "1px solid #232320",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <b style={sub("20px")}>Not answered here?</b>
          <p style={{ ...body(13), maxWidth: "none" }}>
            The full list is on the FAQ page, and a human reads WhatsApp until 9pm.
          </p>
          <Link href="/faq" className={s.ghost} style={{ justifyContent: "center" }}>
            Every question
          </Link>
        </div>
      </div>

      <div className={v.faqList}>
        {tagged.map((f) => {
          const isOpen = open === f.id;
          const hidden = !matches(f);
          return (
            <div
              key={f.id}
              className={`${v.faqItem} ${isOpen ? v.faqOpen : ""}`}
              /* Hidden, not unmounted: the answers stay in the DOM for
                 crawlers and for anyone browsing without JavaScript. */
              hidden={hidden}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : f.id)}
                aria-expanded={isOpen}
                aria-controls={`hp-faq-a-${f.id}`}
                className={v.faqQ}
                style={{ borderLeftColor: isOpen ? LIME : "transparent", background: isOpen ? PANEL_2 : BG }}
              >
                <span style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                  <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.18em" }}>{f.cat}</span>
                  <span style={sub("clamp(1.1rem,1.9vw,1.45rem)")}>{f.question}</span>
                </span>
                <span aria-hidden="true" className={v.faqMark}>
                  +
                </span>
              </button>
              <div
                id={`hp-faq-a-${f.id}`}
                className={v.faqA}
                style={{ display: isOpen ? "block" : "none" }}
                dangerouslySetInnerHTML={{ __html: f.answerHtml }}
              />
            </div>
          );
        })}

        {hits === 0 && (
          <div style={{ padding: "clamp(26px,3vw,40px)", display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
            <b style={sub("24px")}>Nothing matches that</b>
            <p style={{ ...body(14.5), maxWidth: "46ch" }}>
              Try fewer words, or read the full list. We answer on WhatsApp within the working
              day.
            </p>
            <Link href="/faq" className={s.ghost}>
              Every question we get
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
