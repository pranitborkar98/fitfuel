"use client";

// app/contact/ContactClient.tsx
//
// Contact, on the Instrument System.
//
// WHAT THIS FILE WAS CARRYING. In one page: gradient text on the headline
// (background-clip on a 135deg white-to-lime ramp), a fading lime "glow
// divider", radius 10/11/12/14/16/24 across the controls, border-radius:50%
// radio dots, two lime box-shadow glows on the send button that grew on hover,
// a translateY lift on every card, and framer-motion fading each block in from
// blur(4px). Every one of those is on the reject list by name.
//
// A REAL BUG FIXED IN PASSING. The two-column layout's media query targeted
// `.contact-main-grid`, a class declared in the trailing <style> block but
// never applied to any element. The grid therefore stayed at 1.1fr / 0.9fr at
// every viewport, so on a phone the form and the contact list were each
// squeezed into half the screen. The breakpoint is real now, in the module.
//
// framer-motion is gone from this page. The reveal is the CSS scroll-driven
// one from the kit, which means these blocks no longer need JavaScript to
// become visible — and no longer stay invisible if it fails.

import { useState } from "react";

import { ArrowRight, Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

import { WHATSAPP_NUMBER } from "@/lib/site";
import { Head, Idx, k } from "@/app/_ui/Kit";
import { Masthead, Shell, Wrap, p as pg } from "@/app/_ui/Page";
import { SECTION, body, label } from "@/app/_ui/theme";
import s from "./contact.module.css";

const WA_NUMBER = WHATSAPP_NUMBER;

const QUICK_REASONS = [
  { label: "Start a trial day", message: "Hi FitFuel! I'd like to start with a trial day. Can you help me get started?" },
  { label: "Ask about meal plans", message: "Hi FitFuel! I'd like to know more about your meal plans. Can you help?" },
  { label: "Check delivery area", message: "Hi FitFuel! I want to check if you deliver to my area in Pune." },
  { label: "Pause or change my plan", message: "Hi FitFuel! I need help pausing or changing my current meal plan." },
  { label: "Bulk or corporate order", message: "Hi FitFuel! I'm interested in a bulk or corporate meal plan. Can we talk?" },
  { label: "Something else", message: "" },
];

const CONTACT_DETAILS = [
  {
    icon: Phone,
    label: "WhatsApp and phone",
    value: "+91 8850446348",
    sub: "Fastest response, usually within minutes",
    href: `https://wa.me/${WA_NUMBER}`,
    cta: "Open WhatsApp",
  },
  {
    icon: Mail,
    label: "Email",
    value: "contact@fitfuel.in",
    sub: "For formal queries, invoices and partnerships",
    href: "mailto:contact@fitfuel.in",
    cta: "Send email",
  },
  {
    icon: MapPin,
    label: "Kitchen and operations",
    value: "Kharadi, Pune 412207",
    sub: "FSSAI licence 21523035002815",
    href: "https://maps.google.com/?q=Kharadi,Pune,412207",
    cta: "View on map",
  },
  {
    icon: Clock,
    label: "Delivery hours",
    value: "7:00 to 10:00 daily",
    sub: "Fresh meals delivered every day",
    href: null,
    cta: null,
  },
];

const FAQS = [
  {
    q: "How do I place an order?",
    a: "WhatsApp us or use the Order Now button on the Plans page. We will confirm your diet, duration and delivery address and get you started.",
  },
  {
    q: "Can I pause or cancel my plan?",
    a: "Yes. Just WhatsApp us at least 24 hours before your next delivery. No penalties, no lock-in.",
  },
  {
    q: "Do you deliver on weekends?",
    a: "Yes, we deliver 7 days a week. The monthly plan excluding weekends is a specific option; standard plans include weekends.",
  },
  {
    q: "What areas do you deliver to?",
    a: "We currently serve Kharadi and surrounding Pune areas. WhatsApp us your pincode to confirm your zone.",
  },
  {
    q: "Can I customise my meals?",
    a: "Preferences like no onion, no garlic or extra protein can be noted when you order. WhatsApp us to discuss.",
  },
];

function buildWALink(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState("");

  function buildMessage(): string {
    if (selected === null) return "";
    const isCustomReason = selected === QUICK_REASONS.length - 1;
    if (!isCustomReason) {
      const base = QUICK_REASONS[selected].message;
      return name.trim() ? `${base} My name is ${name.trim()}.` : base;
    }
    const greeting = name.trim() ? `Hi FitFuel! My name is ${name.trim()}. ` : "Hi FitFuel! ";
    return greeting + (custom.trim() || "I have a question.");
  }

  function handleSend() {
    const msg = buildMessage();
    if (!msg) return;
    window.open(buildWALink(msg), "_blank", "noopener,noreferrer");
  }

  const isCustom = selected === QUICK_REASONS.length - 1;
  const canSend = selected !== null && (!isCustom || custom.trim().length > 0);
  const preview = buildMessage();

  return (
    <Shell>
      <Masthead
        label="Get in touch"
        title="We are one message away"
        deck="Questions about plans, delivery areas or your current order? WhatsApp us. We respond fast, usually within minutes."
        meta={[
          { k: "Typical reply", v: "Minutes" },
          { k: "Delivery hours", v: "07:00 to 10:00" },
        ]}
      />

      <section style={{ ...SECTION, paddingTop: 0 }}>
        <Wrap>
          <div className={s.grid}>
            {/* ── the composer ─────────────────────────────────────────── */}
            <div className={s.panel}>
              <span className={s.lbl}>Send us a message</span>

              <div style={{ marginBottom: 24 }}>
                <label htmlFor="ct-name" style={{ ...label(), marginBottom: 9 }}>
                  Your name, optional
                </label>
                <input
                  id="ct-name"
                  type="text"
                  className={s.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul"
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <span style={{ ...label(), marginBottom: 11 }} id="ct-reason">
                  What is it about?
                </span>
                <div className={s.reasons} role="radiogroup" aria-labelledby="ct-reason">
                  {QUICK_REASONS.map((r, i) => (
                    <button
                      key={r.label}
                      type="button"
                      role="radio"
                      aria-checked={selected === i}
                      className={selected === i ? `${s.reason} ${s.reasonOn}` : s.reason}
                      onClick={() => setSelected(i)}
                    >
                      <span className={s.mark} aria-hidden="true" />
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {isCustom && (
                <div style={{ marginBottom: 24 }}>
                  <label htmlFor="ct-msg" style={{ ...label(), marginBottom: 9 }}>
                    Your message
                  </label>
                  <textarea
                    id="ct-msg"
                    className={s.textarea}
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    placeholder="Type your question"
                    rows={3}
                  />
                </div>
              )}

              {preview && (
                <div className={s.preview} style={{ marginBottom: 24 }}>
                  <span style={label()}>Message preview</span>
                  <p>{preview}</p>
                </div>
              )}

              <button type="button" className={s.send} onClick={handleSend} disabled={!canSend}>
                <span>
                  <MessageCircle size={16} aria-hidden="true" />
                  Open WhatsApp
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </button>
              <p className={s.fine}>
                Opens WhatsApp with your message pre-filled. Works on desktop too.
              </p>
            </div>

            {/* ── the details ──────────────────────────────────────────── */}
            <div className={s.panelAside}>
              <div className={s.rows}>
                {CONTACT_DETAILS.map((item) => {
                  const Icon = item.icon;
                  const inner = (
                    <>
                      <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <Icon size={13} color="#85857e" aria-hidden="true" />
                        <span style={label()}>{item.label}</span>
                      </span>
                      <span className={s.rowVal}>{item.value}</span>
                      <span className={s.rowSub}>{item.sub}</span>
                      {item.cta && <span className={s.rowGo}>{item.cta}</span>}
                    </>
                  );
                  return item.href ? (
                    <a
                      key={item.label}
                      className={s.row}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div key={item.label} className={s.row}>
                      {inner}
                    </div>
                  );
                })}
              </div>

              <div style={{ padding: "clamp(18px,2.4vw,26px)" }}>
                <a
                  href={`https://wa.me/${WA_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={k.btn}
                  style={{ width: "100%" }}
                >
                  <span>WhatsApp us directly</span>
                </a>
              </div>
            </div>
          </div>
        </Wrap>
      </section>

      {/* ── quick answers ──────────────────────────────────────────────── */}
      <section style={{ ...SECTION, paddingTop: 0 }}>
        <Wrap>
          <Head
            label="Quick answers"
            title="Common questions"
            deck="The five we are asked most. The full set is on the FAQ."
            size="clamp(2rem,5vw,3.6rem)"
          />
          <div className={pg.qa} style={{ marginTop: "clamp(26px,3.6vw,42px)", maxWidth: 860 }}>
            {FAQS.map((faq) => (
              <details key={faq.q}>
                <summary>
                  <span>{faq.q}</span>
                  <span className={pg.qaMark} aria-hidden="true">
                    +
                  </span>
                </summary>
                <div className={pg.qaBody}>
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>

          <div style={{ marginTop: "clamp(24px,3vw,34px)" }}>
            <Idx label="Not answered here" />
            <p style={{ ...body(15) }}>
              <a
                href={buildWALink("Hi FitFuel! I have a question that wasn't in the FAQ: ")}
                target="_blank"
                rel="noopener noreferrer"
                className={k.link}
              >
                Ask us on WhatsApp
              </a>
            </p>
          </div>
        </Wrap>
      </section>
    </Shell>
  );
}
