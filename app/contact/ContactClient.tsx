"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

const WRAP: React.CSSProperties = {
  width: "100%",
  maxWidth: 1280,
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: 40,
  paddingRight: 40,
};

const WA_NUMBER = "918850446348";

// ─── Data ─────────────────────────────────────────────────────────────────────

const QUICK_REASONS = [
  { label: "Start a trial day",      message: "Hi FitFuel! I'd like to start with a trial day. Can you help me get started?" },
  { label: "Ask about meal plans",   message: "Hi FitFuel! I'd like to know more about your meal plans. Can you help?" },
  { label: "Check delivery area",    message: "Hi FitFuel! I want to check if you deliver to my area in Pune." },
  { label: "Pause / change my plan", message: "Hi FitFuel! I need help pausing or changing my current meal plan." },
  { label: "Bulk / corporate order", message: "Hi FitFuel! I'm interested in a bulk or corporate meal plan. Can we talk?" },
  { label: "Something else",         message: "" },
];

const CONTACT_DETAILS = [
  {
    icon: Phone,
    label: "WhatsApp & Phone",
    value: "+91 8850446348",
    sub: "Fastest response, usually within minutes",
    href: `https://wa.me/${WA_NUMBER}`,
    cta: "Open WhatsApp",
  },
  {
    icon: Mail,
    label: "Email",
    value: "contact@fitfuel.in",
    sub: "For formal queries, invoices, partnerships",
    href: "mailto:contact@fitfuel.in",
    cta: "Send email",
  },
  {
    icon: MapPin,
    label: "Kitchen & Operations",
    value: "Kharadi, Pune 412207",
    sub: "FSSAI License: 21523035002815",
    href: "https://maps.google.com/?q=Kharadi,Pune,412207",
    cta: "View on map",
  },
  {
    icon: Clock,
    label: "Delivery hours",
    value: "7:00am – 10:00am daily",
    sub: "Fresh meals delivered every day",
    href: null,
    cta: null,
  },
];

const FAQS = [
  { q: "How do I place an order?",         a: "WhatsApp us or use the Order Now button on the Plans page. We'll confirm your diet, duration, and delivery address and get you started." },
  { q: "Can I pause or cancel my plan?",   a: "Yes. Just WhatsApp us at least 24 hours before your next delivery. No penalties, no lock-in." },
  { q: "Do you deliver on weekends?",      a: "Yes, we deliver 7 days a week. The 'Monthly excl. weekends' plan is a specific option. Standard plans include weekends." },
  { q: "What areas do you deliver to?",    a: "We currently serve Kharadi and surrounding Pune areas. WhatsApp us your pincode to confirm your zone." },
  { q: "Can I customise my meals?",        a: "Preferences like no onion, no garlic, extra protein etc. can be noted when you order. WhatsApp us to discuss." },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildWALink(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

// ─── Animation ────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 32, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};
const stagger = { visible: { transition: { staggerChildren: 0.09 } } };

function FadeSection({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger}>
      {children}
    </motion.div>
  );
}

function FadeItem({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <motion.div variants={fadeUp} style={style}>{children}</motion.div>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <div style={{ width: 24, height: 2, background: "#84cc16", flexShrink: 0, borderRadius: 1 }} />
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#84cc16", textTransform: "uppercase" }}>
        {children}
      </span>
    </div>
  );
}

// ─── FAQ accordion item ───────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: `1px solid ${open ? "rgba(132,204,22,0.25)" : "#1e1e1e"}`,
      borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", textAlign: "left",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
          border: "none", cursor: "pointer", padding: "20px 24px",
          color: "#f9fafb", fontSize: 15, fontWeight: 600,
        }}
      >
        {q}
        <span style={{
          fontSize: 22, color: "#84cc16", flexShrink: 0,
          display: "inline-block", transition: "transform 0.25s",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}>+</span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
        style={{ overflow: "hidden" }}
      >
        <div style={{
          padding: "0 24px 20px",
          background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
          fontSize: 14, color: "#9a9a94", lineHeight: 1.75,
        }}>
          {a}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [name,     setName]     = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [custom,   setCustom]   = useState("");

  function buildMessage(): string {
    if (selected === null) return "";
    const isCustom = selected === QUICK_REASONS.length - 1;
    if (!isCustom) {
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
  const canSend  = selected !== null && (!isCustom || custom.trim().length > 0);

  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#f9fafb" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 140, paddingBottom: 80 }}>
        <div style={WRAP}>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <FadeItem>
              <SectionLabel>Get in touch</SectionLabel>
            </FadeItem>
            <FadeItem>
              <h1 style={{
                fontFamily: "var(--ff-cond)",
                fontSize: "clamp(3rem, 8vw, 6.5rem)",
                fontWeight: 900, textTransform: "uppercase",
                lineHeight: 0.95, letterSpacing: "-0.01em",
                color: "#f9fafb", marginBottom: 24, maxWidth: 800,
              }}>
                We&apos;re one{" "}
                <span style={{
                  background: "linear-gradient(135deg, #ffffff 30%, #84cc16 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  message away.
                </span>
              </h1>
            </FadeItem>
            <FadeItem>
              <p style={{ fontSize: 17, color: "#9a9a94", lineHeight: 1.8, maxWidth: 520 }}>
                Questions about plans, delivery areas or your current order? WhatsApp us. We respond fast, usually within minutes.
              </p>
            </FadeItem>
          </motion.div>
        </div>
      </section>

      {/* Glow divider */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #84cc16, transparent)", opacity: 0.3 }} />

      {/* ── Main grid ────────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 0" }}>
        <div style={WRAP}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 32, alignItems: "start" }}>

            {/* Left — WhatsApp form */}
            <FadeSection>
              <FadeItem>
                <div style={{
                  background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
                  border: "1px solid #1e1e1e",
                  borderRadius: 24, overflow: "hidden",
                }}>
                  {/* Header */}
                  <div style={{
                    padding: "28px 32px 24px", borderBottom: "1px solid #1a1a1a",
                    display: "flex", alignItems: "center", gap: 14,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: "rgba(132,204,22,0.08)",
                      border: "1px solid rgba(132,204,22,0.18)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <MessageCircle size={20} color="#84cc16" />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#f9fafb" }}>Send us a message</div>
                      <div style={{ fontSize: 12, color: "#85857e" }}>Opens WhatsApp with your message pre-filled</div>
                    </div>
                  </div>

                  <div style={{ padding: "28px 32px 32px" }}>

                    {/* Name */}
                    <div style={{ marginBottom: 24 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#9a9a94", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                        Your name (optional)
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Rahul"
                        style={{
                          width: "100%", background: "#161616",
                          border: "1px solid #242424", borderRadius: 10,
                          padding: "12px 16px", fontSize: 14,
                          color: "#f9fafb", outline: "none",
                          boxSizing: "border-box", transition: "border-color 0.2s",
                        }}
                        onFocus={e => (e.target.style.borderColor = "rgba(132,204,22,0.5)")}
                        onBlur={e  => (e.target.style.borderColor = "#242424")}
                      />
                    </div>

                    {/* Reason selector */}
                    <div style={{ marginBottom: 24 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#9a9a94", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                        What&apos;s it about?
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {QUICK_REASONS.map((r, i) => (
                          <button
                            key={r.label}
                            onClick={() => setSelected(i)}
                            style={{
                              textAlign: "left", padding: "12px 16px", borderRadius: 10,
                              border: `1px solid ${selected === i ? "rgba(132,204,22,0.5)" : "#1e1e1e"}`,
                              background: selected === i ? "rgba(132,204,22,0.07)" : "rgba(255,255,255,0.01)",
                              color: selected === i ? "#f9fafb" : "#9a9a94",
                              fontSize: 14, fontWeight: selected === i ? 600 : 400,
                              cursor: "pointer", transition: "all 0.15s",
                              display: "flex", alignItems: "center", gap: 10,
                            }}
                          >
                            <span style={{
                              width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                              border: `1.5px solid ${selected === i ? "#84cc16" : "#3a3a3a"}`,
                              background: selected === i ? "#84cc16" : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.15s",
                            }}>
                              {selected === i && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#000" }} />}
                            </span>
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom message field */}
                    {isCustom && (
                      <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#9a9a94", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                          Your message
                        </label>
                        <textarea
                          value={custom}
                          onChange={e => setCustom(e.target.value)}
                          placeholder="Type your question..."
                          rows={3}
                          style={{
                            width: "100%", background: "#161616",
                            border: "1px solid #242424", borderRadius: 10,
                            padding: "12px 16px", fontSize: 14,
                            color: "#f9fafb", outline: "none", resize: "vertical",
                            boxSizing: "border-box", transition: "border-color 0.2s",
                            fontFamily: "inherit",
                          }}
                          onFocus={e => (e.target.style.borderColor = "rgba(132,204,22,0.5)")}
                          onBlur={e  => (e.target.style.borderColor = "#242424")}
                        />
                      </div>
                    )}

                    {/* Message preview */}
                    {selected !== null && buildMessage() && (
                      <div style={{
                        background: "#111", border: "1px solid #1e1e1e",
                        borderRadius: 10, padding: "12px 16px", marginBottom: 24,
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#85857e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                          Message preview
                        </div>
                        <p style={{ fontSize: 13, color: "#9a9a94", lineHeight: 1.6, margin: 0 }}>
                          {buildMessage()}
                        </p>
                      </div>
                    )}

                    {/* Send button */}
                    <button
                      onClick={handleSend}
                      disabled={!canSend}
                      style={{
                        width: "100%",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        background: canSend ? "#84cc16" : "#1a1a1a",
                        color: canSend ? "#000" : "#85857e",
                        fontWeight: 900, fontSize: 13,
                        padding: "14px 0", borderRadius: 10,
                        border: "none", cursor: canSend ? "pointer" : "not-allowed",
                        letterSpacing: "0.08em", textTransform: "uppercase",
                        boxShadow: canSend ? "0 4px 20px rgba(132,204,22,0.35)" : "none",
                        transition: "all 0.22s ease",
                      }}
                      onMouseEnter={e => {
                        if (!canSend) return;
                        const el = e.currentTarget;
                        el.style.background = "#a3e635";
                        el.style.transform = "translateY(-2px)";
                        el.style.boxShadow = "0 8px 30px rgba(132,204,22,0.5)";
                      }}
                      onMouseLeave={e => {
                        if (!canSend) return;
                        const el = e.currentTarget;
                        el.style.background = "#84cc16";
                        el.style.transform = "translateY(0)";
                        el.style.boxShadow = "0 4px 20px rgba(132,204,22,0.35)";
                      }}
                    >
                      <MessageCircle size={16} />
                      Open WhatsApp
                      <ArrowRight size={14} />
                    </button>

                    <p style={{ textAlign: "center", fontSize: 12, color: "#85857e", marginTop: 12 }}>
                      Opens WhatsApp with your message pre-filled. Works on desktop too.
                    </p>
                  </div>
                </div>
              </FadeItem>
            </FadeSection>

            {/* Right — contact details */}
            <FadeSection>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {CONTACT_DETAILS.map(item => {
                  const Icon = item.icon;
                  const card = (
                    <div
                      style={{
                        background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
                        border: "1px solid #1e1e1e",
                        borderRadius: 16, padding: "22px 24px",
                        display: "flex", alignItems: "flex-start", gap: 16,
                        transition: "all 0.25s ease",
                        cursor: item.href ? "pointer" : "default",
                      }}
                      onMouseEnter={e => {
                        if (!item.href) return;
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = "rgba(132,204,22,0.25)";
                        el.style.transform = "translateY(-2px)";
                        el.style.boxShadow = "0 8px 32px rgba(132,204,22,0.08)";
                      }}
                      onMouseLeave={e => {
                        if (!item.href) return;
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = "#1e1e1e";
                        el.style.transform = "translateY(0)";
                        el.style.boxShadow = "none";
                      }}
                    >
                      <div style={{
                        width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                        background: "rgba(132,204,22,0.08)",
                        border: "1px solid rgba(132,204,22,0.18)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon size={18} color="#84cc16" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#85857e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#f9fafb", marginBottom: 4 }}>
                          {item.value}
                        </div>
                        <div style={{ fontSize: 12, color: "#85857e" }}>{item.sub}</div>
                        {item.cta && (
                          <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: "#84cc16", display: "flex", alignItems: "center", gap: 4 }}>
                            {item.cta} <ArrowRight size={11} />
                          </div>
                        )}
                      </div>
                    </div>
                  );

                  return (
                    <FadeItem key={item.label}>
                      {item.href
                        ? <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>{card}</a>
                        : card
                      }
                    </FadeItem>
                  );
                })}

                {/* Big WhatsApp CTA */}
                <FadeItem>
                  <a
                    href={`https://wa.me/${WA_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      background: "#84cc16", color: "#000",
                      fontWeight: 900, fontSize: 13,
                      padding: "15px 0", borderRadius: 12,
                      textDecoration: "none",
                      letterSpacing: "0.08em", textTransform: "uppercase",
                      boxShadow: "0 4px 20px rgba(132,204,22,0.35)",
                      transition: "all 0.22s ease",
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "#a3e635";
                      el.style.transform = "translateY(-2px)";
                      el.style.boxShadow = "0 8px 30px rgba(132,204,22,0.5)";
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "#84cc16";
                      el.style.transform = "translateY(0)";
                      el.style.boxShadow = "0 4px 20px rgba(132,204,22,0.35)";
                    }}
                  >
                    <MessageCircle size={16} />
                    WhatsApp us directly
                  </a>
                </FadeItem>
              </div>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 0 120px" }}>
        <div style={WRAP}>
          <FadeSection>
            <FadeItem>
              <SectionLabel>Quick answers</SectionLabel>
            </FadeItem>
            <FadeItem>
              <h2 style={{
                fontFamily: "var(--ff-cond)",
                fontSize: "clamp(2rem, 4vw, 3.25rem)",
                fontWeight: 900, textTransform: "uppercase",
                color: "#f9fafb", lineHeight: 1, letterSpacing: "-0.01em",
                marginBottom: 40,
              }}>
                Common questions.
              </h2>
            </FadeItem>
          </FadeSection>

          <FadeSection>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 800 }}>
              {FAQS.map(faq => (
                <FadeItem key={faq.q}>
                  <FAQItem {...faq} />
                </FadeItem>
              ))}
            </div>
          </FadeSection>

          <FadeSection>
            <FadeItem>
              <p style={{ marginTop: 32, fontSize: 14, color: "#85857e" }}>
                Didn&apos;t find your answer?{" "}
                <a
                  href={buildWALink("Hi FitFuel! I have a question that wasn't in the FAQ: ")}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#84cc16", fontWeight: 600, textDecoration: "none" }}
                >
                  Ask us on WhatsApp →
                </a>
              </p>
            </FadeItem>
          </FadeSection>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .contact-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
