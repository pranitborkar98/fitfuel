"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, MapPin, CheckCircle, XCircle, MessageCircle, Truck, Clock } from "lucide-react";

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

const WA_NUMBER = "919579738811";

// ─── Delivery zones — source: fitfuel.in/delivery-locations ──────────────────

const ZONES = [
  { name: "Kharadi",        pincode: "411014", base: true  },  // Kitchen base
  { name: "Viman Nagar",    pincode: "411014", base: false },
  { name: "Kalyani Nagar",  pincode: "411014", base: false },
  { name: "Vadgaon Sheri",  pincode: "411014", base: false },
  { name: "Wagholi",        pincode: "412207", base: false },
  { name: "Yerwada",        pincode: "411006", base: false },
  { name: "Koregaon Park",  pincode: "411001", base: false },
  { name: "Sangamwadi",     pincode: "411003", base: false },
  { name: "Magarpatta City",pincode: "411028", base: false },
  { name: "Amanora",        pincode: "411028", base: false },
  { name: "Mundhwa",        pincode: "411036", base: false },
  { name: "Tingre Nagar",   pincode: "411032", base: false },
  { name: "Hadpsar",        pincode: "411028", base: false },
  { name: "Dhanori",        pincode: "411015", base: false },
  { name: "Lohegaon",       pincode: "411047", base: false },
];

// All serviceable pincodes
const SERVICEABLE_PINCODES = [...new Set(ZONES.map(z => z.pincode))];

// ─── Animation ────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 32, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

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

// ─── Pincode checker ─────────────────────────────────────────────────────────

type CheckState = "idle" | "yes" | "no";

function PincodeChecker() {
  const [input,  setInput]  = useState("");
  const [status, setStatus] = useState<CheckState>("idle");

  function check() {
    const trimmed = input.trim();
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) return;
    setStatus(SERVICEABLE_PINCODES.includes(trimmed) ? "yes" : "no");
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") check();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    setStatus("idle");
  }

  return (
    <div style={{
      background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
      border: "1px solid #1e1e1e",
      borderRadius: 20, padding: "32px 36px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Top lime accent */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #84cc16, transparent)" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "rgba(132,204,22,0.08)",
          border: "1px solid rgba(132,204,22,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <MapPin size={18} color="#84cc16" />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#f9fafb" }}>Check your pincode</div>
      </div>
      <p style={{ fontSize: 13, color: "#9a9a94", marginBottom: 24, lineHeight: 1.6 }}>
        Enter your 6-digit Pune pincode to instantly see if we deliver to you.
      </p>

      {/* Input row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKey}
          placeholder="e.g. 411014"
          style={{
            flex: 1, background: "#161616",
            border: `1px solid ${status === "yes" ? "rgba(132,204,22,0.5)" : status === "no" ? "rgba(239,68,68,0.5)" : "#242424"}`,
            borderRadius: 10, padding: "13px 16px",
            fontSize: 15, fontWeight: 600,
            color: "#f9fafb", outline: "none",
            letterSpacing: "0.1em", transition: "border-color 0.2s",
          }}
          onFocus={e => { if (status === "idle") e.target.style.borderColor = "rgba(132,204,22,0.5)"; }}
          onBlur={e  => { if (status === "idle") e.target.style.borderColor = "#242424"; }}
        />
        <button
          onClick={check}
          style={{
            background: "#84cc16", color: "#000",
            fontWeight: 900, fontSize: 13,
            padding: "13px 24px", borderRadius: 10,
            border: "none", cursor: "pointer",
            letterSpacing: "0.07em", textTransform: "uppercase",
            boxShadow: "0 4px 20px rgba(132,204,22,0.3)",
            transition: "all 0.2s", whiteSpace: "nowrap",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "#a3e635";
            el.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "#84cc16";
            el.style.transform = "translateY(0)";
          }}
        >
          Check
        </button>
      </div>

      {/* Result */}
      {status === "yes" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            background: "rgba(132,204,22,0.07)",
            border: "1px solid rgba(132,204,22,0.25)",
            borderRadius: 12, padding: "14px 18px",
          }}
        >
          <CheckCircle size={18} color="#84cc16" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f9fafb", marginBottom: 4 }}>
              Yes, we deliver to {input}!
            </div>
            <div style={{ fontSize: 13, color: "#9a9a94", lineHeight: 1.6 }}>
              Fresh meals arrive at your door between 7am–10am daily.{" "}
              <Link href="/plans" style={{ color: "#84cc16", fontWeight: 600, textDecoration: "none" }}>
                View plans →
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {status === "no" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 12, padding: "14px 18px",
          }}
        >
          <XCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f9fafb", marginBottom: 4 }}>
              Not in our zone yet
            </div>
            <div style={{ fontSize: 13, color: "#9a9a94", lineHeight: 1.6 }}>
              We&apos;re expanding, so WhatsApp us. Sometimes we can accommodate.{" "}
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi FitFuel! I'm at pincode ${input}. Do you deliver here?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#84cc16", fontWeight: 600, textDecoration: "none" }}
              >
                Ask us →
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LocationsPage() {
  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#f9fafb" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 140, paddingBottom: 80 }}>
        <div style={WRAP}>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <FadeItem>
              <SectionLabel>Delivery zones</SectionLabel>
            </FadeItem>
            <FadeItem>
              <h1 style={{
                fontFamily: "var(--ff-cond)",
                fontSize: "clamp(3rem, 8vw, 6.5rem)",
                fontWeight: 900, textTransform: "uppercase",
                lineHeight: 0.95, letterSpacing: "-0.01em",
                color: "#f9fafb", marginBottom: 24, maxWidth: 800,
              }}>
                Fresh meals across{" "}
                <span style={{
                  background: "linear-gradient(135deg, #ffffff 30%, #84cc16 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  Pune.
                </span>
              </h1>
            </FadeItem>
            <FadeItem>
              <p style={{ fontSize: 17, color: "#9a9a94", lineHeight: 1.8, maxWidth: 520, marginBottom: 0 }}>
                We deliver to 15 areas across East and Central Pune, every day, 7am to 10am. Kharadi is our home base.
              </p>
            </FadeItem>
          </motion.div>
        </div>
      </section>

      {/* Glow divider */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #84cc16, transparent)", opacity: 0.3 }} />

      {/* ── Stats strip ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "48px 0" }}>
        <div style={WRAP}>
          <FadeSection>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[
                { icon: MapPin,  value: "15",         label: "Delivery zones" },
                { icon: Truck,   value: "Daily",       label: "7 days a week"  },
                { icon: Clock,   value: "7–10am",      label: "Delivery window" },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <FadeItem key={s.label}>
                    <div style={{
                      background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
                      border: "1px solid #1e1e1e",
                      borderRadius: 16, padding: "24px 28px",
                      display: "flex", alignItems: "center", gap: 16,
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: "rgba(132,204,22,0.08)",
                        border: "1px solid rgba(132,204,22,0.18)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon size={20} color="#84cc16" />
                      </div>
                      <div>
                        <div style={{ fontFamily: "var(--ff-cond)", fontSize: 32, fontWeight: 900, color: "#84cc16", lineHeight: 1 }}>
                          {s.value}
                        </div>
                        <div style={{ fontSize: 12, color: "#9a9a94", marginTop: 2 }}>{s.label}</div>
                      </div>
                    </div>
                  </FadeItem>
                );
              })}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── Main content: zones + checker + map ──────────────────────────────── */}
      <section style={{ padding: "40px 0 80px" }}>
        <div style={WRAP}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>

            {/* Left — zones list */}
            <FadeSection>
              <FadeItem>
                <SectionLabel>Serviceable areas</SectionLabel>
              </FadeItem>
              <FadeItem>
                <h2 style={{
                  fontFamily: "var(--ff-cond)",
                  fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                  fontWeight: 900, textTransform: "uppercase",
                  color: "#f9fafb", lineHeight: 1, letterSpacing: "-0.01em",
                  marginBottom: 32,
                }}>
                  Where we deliver.
                </h2>
              </FadeItem>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {ZONES.map((zone, i) => (
                  <FadeItem key={zone.name}>
                    <div
                      style={{
                        background: zone.base
                          ? "rgba(132,204,22,0.07)"
                          : "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
                        border: `1px solid ${zone.base ? "rgba(132,204,22,0.3)" : "#1e1e1e"}`,
                        borderRadius: 12, padding: "14px 18px",
                        display: "flex", alignItems: "center", gap: 10,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = "rgba(132,204,22,0.3)";
                        el.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = zone.base ? "rgba(132,204,22,0.3)" : "#1e1e1e";
                        el.style.transform = "translateY(0)";
                      }}
                    >
                      <div style={{
                        width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                        background: zone.base ? "#84cc16" : "#3a3a3a",
                        boxShadow: zone.base ? "0 0 8px rgba(132,204,22,0.6)" : "none",
                      }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#f9fafb" }}>
                          {zone.name}
                          {zone.base && (
                            <span style={{
                              marginLeft: 6, fontSize: 12, fontWeight: 700,
                              color: "#84cc16", textTransform: "uppercase", letterSpacing: "0.1em",
                            }}>
                              Base
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "#85857e", marginTop: 1 }}>{zone.pincode}</div>
                      </div>
                    </div>
                  </FadeItem>
                ))}
              </div>

              <FadeItem>
                <div style={{
                  marginTop: 20, padding: "14px 18px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px dashed #2a2a2a",
                  borderRadius: 12,
                  fontSize: 13, color: "#85857e", lineHeight: 1.6,
                }}>
                  Don&apos;t see your area?{" "}
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi FitFuel! I want to check if you deliver to my area: ")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#84cc16", fontWeight: 600, textDecoration: "none" }}
                  >
                    WhatsApp us, we&apos;re expanding. →
                  </a>
                </div>
              </FadeItem>
            </FadeSection>

            {/* Right — pincode checker + map */}
            <FadeSection>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                <FadeItem>
                  <PincodeChecker />
                </FadeItem>

                {/* Google Maps embed */}
                <FadeItem>
                  <div style={{
                    background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
                    border: "1px solid #1e1e1e",
                    borderRadius: 20, overflow: "hidden",
                  }}>
                    <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid #1a1a1a" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#f9fafb" }}>Our kitchen, Kharadi, Pune</div>
                      <div style={{ fontSize: 12, color: "#85857e", marginTop: 2 }}>All deliveries dispatched from here daily at 7am</div>
                    </div>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30258.20!2d73.9440!3d18.5508!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c3e7b1f0d6b7%3A0x6a8e3e4b2c1d5e6f!2sKharadi%2C%20Pune%2C%20Maharashtra%20411014!5e0!3m2!1sen!2sin!4v1700000000000"
                      width="100%"
                      height="280"
                      style={{ border: 0, display: "block", filter: "grayscale(100%) invert(90%) contrast(90%)" }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="FitFuel kitchen location, Kharadi, Pune"
                    />
                    <div style={{ padding: "14px 24px" }}>
                      <a
                        href="https://maps.google.com/?q=Kharadi,Pune,Maharashtra,411014"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          fontSize: 12, fontWeight: 700, color: "#84cc16", textDecoration: "none",
                        }}
                      >
                        <MapPin size={12} /> Open in Google Maps <ArrowRight size={11} />
                      </a>
                    </div>
                  </div>
                </FadeItem>

              </div>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* ── Delivery info strip ───────────────────────────────────────────────── */}
      <section style={{ padding: "0 0 80px" }}>
        <div style={WRAP}>
          <FadeSection>
            <FadeItem>
              <div style={{
                background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
                border: "1px solid #1e1e1e",
                borderRadius: 20, padding: "36px 40px",
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                gap: 32, position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #84cc16, transparent)" }} />
                {[
                  {
                    title: "Free delivery",
                    desc: "No delivery charges on any plan. What you see on the pricing page is what you pay (+ 5% GST).",
                  },
                  {
                    title: "7am–10am window",
                    desc: "All meals dispatched fresh from Kharadi every morning. Arrive hot and ready to eat.",
                  },
                  {
                    title: "Eco-friendly packaging",
                    desc: "Meals packed in clean, food-safe, eco-conscious containers. No plastic where we can avoid it.",
                  },
                ].map(item => (
                  <div key={item.title}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#84cc16", marginBottom: 12, boxShadow: "0 0 8px rgba(132,204,22,0.5)" }} />
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#f9fafb", marginBottom: 8 }}>{item.title}</div>
                    <p style={{ fontSize: 13, color: "#9a9a94", lineHeight: 1.75 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </FadeItem>
          </FadeSection>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 0 120px" }}>
        <div style={WRAP}>
          <FadeSection>
            <FadeItem>
              <div style={{
                background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
                border: "1px solid rgba(132,204,22,0.2)",
                borderRadius: 24, padding: "56px 52px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap", gap: 32,
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #84cc16, transparent)" }} />
                <div style={{
                  position: "absolute", bottom: -120, right: -80,
                  width: 400, height: 400, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(132,204,22,0.05) 0%, transparent 70%)",
                  pointerEvents: "none",
                }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#84cc16", textTransform: "uppercase", marginBottom: 14 }}>
                    Ready to start
                  </div>
                  <h2 style={{
                    fontFamily: "var(--ff-cond)",
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    fontWeight: 900, textTransform: "uppercase",
                    color: "#f9fafb", lineHeight: 1, letterSpacing: "-0.01em",
                    marginBottom: 12,
                  }}>
                    We deliver to you.<br />Start for ₹400.
                  </h2>
                  <p style={{ fontSize: 15, color: "#9a9a94", maxWidth: 400, lineHeight: 1.7 }}>
                    Trial day, no commitment, no subscription. Just fresh food at your door tomorrow morning.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
                  <Link
                    href="/plans"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: "#84cc16", color: "#000",
                      fontWeight: 900, fontSize: 13,
                      padding: "14px 30px", borderRadius: 10,
                      textDecoration: "none",
                      letterSpacing: "0.08em", textTransform: "uppercase",
                      boxShadow: "0 4px 20px rgba(132,204,22,0.35)",
                      transition: "all 0.22s ease", whiteSpace: "nowrap",
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
                    Order trial day <ArrowRight size={14} />
                  </Link>
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi FitFuel! I want to check delivery to my area and get started.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: "transparent", color: "#9a9a94",
                      fontWeight: 700, fontSize: 13,
                      padding: "14px 24px", borderRadius: 10,
                      textDecoration: "none",
                      border: "1px solid #242424",
                      letterSpacing: "0.06em", textTransform: "uppercase",
                      transition: "all 0.22s ease", whiteSpace: "nowrap",
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.color = "#f9fafb";
                      el.style.borderColor = "#3a3a3a";
                      el.style.background = "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.color = "#9a9a94";
                      el.style.borderColor = "#242424";
                      el.style.background = "transparent";
                    }}
                  >
                    <MessageCircle size={14} />
                    WhatsApp us
                  </a>
                </div>
              </div>
            </FadeItem>
          </FadeSection>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .loc-main-grid  { grid-template-columns: 1fr !important; }
          .loc-stats-grid { grid-template-columns: 1fr !important; }
          .loc-info-strip { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
        @media (max-width: 560px) {
          .loc-zones-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}