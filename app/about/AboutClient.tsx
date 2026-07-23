"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Shield, ChefHat, Heart, Truck, Star, Users, Zap } from "lucide-react";

// ─── Constants — matching page.tsx ───────────────────────────────────────────

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

const WRAP: React.CSSProperties = {
  width: "100%",
  maxWidth: 1280,
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: 40,
  paddingRight: 40,
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "2019",  label: "Founded"            },
  { value: "145+",  label: "Happy Customers"    },
  { value: "5★",    label: "Avg. Rating"        },
  { value: "FSSAI", label: "Licensed Kitchen"   },
];

const VALUES = [
  {
    icon: ChefHat,
    title: "Chef-Cooked Daily",
    desc: "Every meal is prepared fresh each morning in our FSSAI-certified kitchen in Kharadi. No frozen food, no reheating — ever.",
  },
  {
    icon: Heart,
    title: "Nutritionist-Designed",
    desc: "Our meal plans are built around real nutrition science — the right macros for your specific goal, not just calorie counting.",
  },
  {
    icon: Shield,
    title: "FSSAI Certified",
    desc: "We operate under FSSAI license 21523035002815. Clean, hygienic, compliant — because your health depends on it.",
  },
  {
    icon: Truck,
    title: "Daily 7am–10am",
    desc: "Fresh meals delivered to your door every morning between 7am and 10am. Consistent, reliable, on your schedule.",
  },
  {
    icon: Star,
    title: "Quality Ingredients",
    desc: "We source locally and carefully. Natural ingredients, no artificial preservatives, no frying — just clean food that tastes good.",
  },
  {
    icon: Users,
    title: "Built for Pune",
    desc: "We understand Pune's lifestyle — working professionals, students, families, fitness enthusiasts. We cook for all of them.",
  },
];

const TIMELINE = [
  {
    year: "2019",
    title: "FitFuel is born",
    desc: "Pranit Borkar starts FitFuel out of a simple belief — nutritious food should be accessible, affordable, and actually delicious. Operations begin in Kharadi, Pune.",
  },
  {
    year: "2021",
    title: "Plans expand",
    desc: "Growing demand leads to the full suite of meal plans — Muscle Gain, Weight Loss, Balanced Diet, Office Employee, and Jain Diet — each with dedicated menus.",
  },
  {
    year: "2024",
    title: "FSSAI certified kitchen",
    desc: "Official FSSAI certification secured. Kitchen operations formalised, delivery zones expanded across Kharadi and surrounding Pune areas.",
  },
  {
    year: "2026",
    title: "Full platform revamp",
    desc: "FitFuel moves beyond meal delivery — rebuilding from the ground up as a health platform with nutrition tracking, supplements, and AI coaching coming next.",
  },
];

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 32, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

const stagger = { visible: { transition: { staggerChildren: 0.09 } } };

function FadeSection({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function FadeItem({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <motion.div variants={fadeUp} style={style}>
      {children}
    </motion.div>
  );
}

// ─── Section label — matches page.tsx exactly ─────────────────────────────────

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

// ─── Animated stat counter ────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <FadeItem>
      <div style={{
        textAlign: "center",
        background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
        border: "1px solid #1e1e1e",
        borderRadius: 16, padding: "28px 20px",
        transition: "border-color 0.3s",
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(132,204,22,0.25)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e1e1e")}
      >
        <div style={{
          fontFamily: "var(--ff-cond)",
          fontSize: 44, fontWeight: 900, color: "#84cc16",
          lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 8,
        }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: "#9a9a94", fontWeight: 500, letterSpacing: "0.05em" }}>
          {label}
        </div>
      </div>
    </FadeItem>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#f9fafb" }}>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 140, paddingBottom: 100 }}>
        <div style={WRAP}>
          <motion.div initial="hidden" animate="visible" variants={stagger}>

            <FadeItem>
              <SectionLabel>Our story</SectionLabel>
            </FadeItem>

            <FadeItem>
              <h1 style={{
                fontFamily: "var(--ff-cond)",
                fontSize: "clamp(3rem, 8vw, 6.5rem)",
                fontWeight: 900,
                textTransform: "uppercase",
                lineHeight: 0.95,
                letterSpacing: "-0.01em",
                color: "#f9fafb",
                marginBottom: 32,
                maxWidth: 900,
              }}>
                Fuel built in{" "}
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
              <p style={{
                fontSize: 18, color: "#9a9a94", lineHeight: 1.8,
                maxWidth: 640, marginBottom: 48,
              }}>
                FitFuel started in 2019 with one conviction — that eating right shouldn't require a degree in nutrition, hours in the kitchen, or a compromise on taste. Five years and thousands of meals later, that conviction runs every kitchen operation we do.
              </p>
            </FadeItem>

            <FadeItem>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Link
                  href="/plans"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#84cc16", color: "#000",
                    fontWeight: 900, fontSize: 13,
                    padding: "13px 28px", borderRadius: 10,
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
                  See our plans <ArrowRight size={14} />
                </Link>
                <Link
                  href="/contact"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "rgba(132,204,22,0.06)", color: "#a3e635",
                    fontWeight: 800, fontSize: 13,
                    padding: "13px 28px", borderRadius: 10,
                    textDecoration: "none",
                    border: "1px solid rgba(132,204,22,0.28)",
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    transition: "all 0.22s ease",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(132,204,22,0.12)";
                    el.style.borderColor = "rgba(132,204,22,0.55)";
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(132,204,22,0.06)";
                    el.style.borderColor = "rgba(132,204,22,0.28)";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  Talk to us
                </Link>
              </div>
            </FadeItem>
          </motion.div>
        </div>
      </section>

      {/* Glow divider */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #84cc16, transparent)", opacity: 0.3 }} />

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 0" }}>
        <div style={WRAP}>
          <FadeSection>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {STATS.map(s => <StatCard key={s.label} {...s} />)}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 0" }}>
        <div style={WRAP}>
          <FadeSection>
            <div style={{
              background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
              border: "1px solid #1e1e1e",
              borderRadius: 24,
              padding: "60px 56px",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Lime top accent */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: "linear-gradient(90deg, #84cc16, transparent)",
              }} />
              {/* Subtle glow */}
              <div style={{
                position: "absolute", top: -80, left: -80,
                width: 320, height: 320, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(132,204,22,0.06) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

              <FadeItem>
                <SectionLabel>Mission</SectionLabel>
              </FadeItem>
              <FadeItem>
                <p style={{
                  fontFamily: "var(--ff-cond)",
                  fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                  fontWeight: 700,
                  color: "#f9fafb",
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                  maxWidth: 780,
                  position: "relative", zIndex: 1,
                }}>
                  "To revolutionize the way people nourish themselves — providing convenient access to wholesome, nutritious meals, delivered daily, empowering individuals to lead healthier, more fulfilling lives."
                </p>
              </FadeItem>
              <FadeItem>
                <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "rgba(132,204,22,0.12)",
                    border: "1px solid rgba(132,204,22,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Zap size={18} color="#84cc16" fill="#84cc16" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#f9fafb" }}>Pranit Borkar</div>
                    <div style={{ fontSize: 12, color: "#85857e" }}>Founder, FitFuel</div>
                  </div>
                </div>
              </FadeItem>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── Story ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 0" }}>
        <div style={WRAP}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>

            {/* Left — text */}
            <FadeSection>
              <FadeItem>
                <SectionLabel>How it started</SectionLabel>
              </FadeItem>
              <FadeItem>
                <h2 style={{
                  fontFamily: "var(--ff-cond)",
                  fontSize: "clamp(2rem, 4vw, 3.25rem)",
                  fontWeight: 900, textTransform: "uppercase",
                  color: "#f9fafb", lineHeight: 1, letterSpacing: "-0.01em",
                  marginBottom: 28,
                }}>
                  From a small kitchen<br />
                  <span style={{ color: "#84cc16" }}>to your doorstep.</span>
                </h2>
              </FadeItem>
              <FadeItem>
                <p style={{ fontSize: 15, color: "#9a9a94", lineHeight: 1.8, marginBottom: 20 }}>
                  FitFuel was founded by Pranit Borkar in 2019 with a passion for healthy living and a belief that nutritious food should be both accessible and enjoyable. What started as a small kitchen operation in Kharadi has grown into a full-fledged meal delivery service trusted by hundreds of Pune residents.
                </p>
              </FadeItem>
              <FadeItem>
                <p style={{ fontSize: 15, color: "#9a9a94", lineHeight: 1.8, marginBottom: 20 }}>
                  We've spent years honing our recipes, building systems, and listening to customers. Every meal plan — from Muscle Gain to Jain Diet — was built from real feedback, real nutrition science, and real kitchen experience.
                </p>
              </FadeItem>
              <FadeItem>
                <p style={{ fontSize: 15, color: "#9a9a94", lineHeight: 1.8 }}>
                  Now in 2026, we're going further. The same kitchen quality, the same daily delivery promise — built on a platform that tracks your nutrition, supports your training, and grows with your goals.
                </p>
              </FadeItem>
            </FadeSection>

            {/* Right — founder card + kitchen info */}
            <FadeSection>
              <FadeItem>
                {/* Founder card */}
                <div style={{
                  background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
                  border: "1px solid #1e1e1e",
                  borderRadius: 20, padding: 32,
                  marginBottom: 16,
                }}>
                  {/* Avatar placeholder */}
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(132,204,22,0.2), rgba(132,204,22,0.05))",
                    border: "1px solid rgba(132,204,22,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 20, fontSize: 28,
                  }}>
                    👨‍🍳
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: "#84cc16", textTransform: "uppercase", marginBottom: 6 }}>
                    Founder & CEO
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#f9fafb", marginBottom: 8 }}>
                    Pranit Borkar
                  </div>
                  <p style={{ fontSize: 14, color: "#9a9a94", lineHeight: 1.7 }}>
                    Started FitFuel with a single mission — make healthy eating effortless for Pune. Leads everything from kitchen operations to product development.
                  </p>
                </div>
              </FadeItem>

              <FadeItem>
                {/* Kitchen / FSSAI card */}
                <div style={{
                  background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
                  border: "1px solid #1e1e1e",
                  borderRadius: 20, padding: 28,
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[
                      { label: "Kitchen location", value: "Kharadi, Pune 412207" },
                      { label: "FSSAI License",    value: "21523035002815" },
                      { label: "Delivery hours",   value: "7:00am – 10:00am daily" },
                      { label: "Operating since",  value: "2019" },
                    ].map(item => (
                      <div key={item.label} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                        <span style={{ fontSize: 12, color: "#85857e", fontWeight: 500, minWidth: 120 }}>{item.label}</span>
                        <span style={{ fontSize: 13, color: "#d1d5db", fontWeight: 600, textAlign: "right" }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeItem>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 0" }}>
        <div style={WRAP}>
          <FadeSection>
            <FadeItem>
              <SectionLabel>Timeline</SectionLabel>
            </FadeItem>
            <FadeItem>
              <h2 style={{
                fontFamily: "var(--ff-cond)",
                fontSize: "clamp(2rem, 4vw, 3.25rem)",
                fontWeight: 900, textTransform: "uppercase",
                color: "#f9fafb", lineHeight: 1, letterSpacing: "-0.01em",
                marginBottom: 56,
              }}>
                Five years in the making.
              </h2>
            </FadeItem>
          </FadeSection>

          <div style={{ position: "relative" }}>
            {/* Vertical line */}
            <div style={{
              position: "absolute", left: 28, top: 0, bottom: 0,
              width: 1,
              background: "linear-gradient(to bottom, #84cc16, rgba(132,204,22,0.1))",
            }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {TIMELINE.map((item, i) => (
                <FadeSection key={item.year}>
                  <FadeItem>
                    <div style={{ display: "flex", gap: 40, paddingBottom: i < TIMELINE.length - 1 ? 48 : 0 }}>
                      {/* Dot */}
                      <div style={{ flexShrink: 0, position: "relative", zIndex: 1 }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: "50%",
                          background: i === TIMELINE.length - 1 ? "#84cc16" : "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
                          border: `1px solid ${i === TIMELINE.length - 1 ? "#84cc16" : "rgba(132,204,22,0.3)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: i === TIMELINE.length - 1 ? "0 0 24px rgba(132,204,22,0.4)" : "none",
                        }}>
                          <span style={{
                            fontFamily: "var(--ff-cond)",
                            fontSize: 14, fontWeight: 900,
                            color: i === TIMELINE.length - 1 ? "#000" : "#84cc16",
                            letterSpacing: "0.02em",
                          }}>
                            {item.year}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{ paddingTop: 12, flex: 1 }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#f9fafb", marginBottom: 8 }}>
                          {item.title}
                        </div>
                        <p style={{ fontSize: 14, color: "#9a9a94", lineHeight: 1.75, maxWidth: 560 }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </FadeItem>
                </FadeSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values / Why us ──────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 0" }}>
        <div style={WRAP}>
          <FadeSection>
            <FadeItem>
              <SectionLabel>What we stand for</SectionLabel>
            </FadeItem>
            <FadeItem>
              <h2 style={{
                fontFamily: "var(--ff-cond)",
                fontSize: "clamp(2rem, 4vw, 3.25rem)",
                fontWeight: 900, textTransform: "uppercase",
                color: "#f9fafb", lineHeight: 1, letterSpacing: "-0.01em",
                marginBottom: 48,
              }}>
                Why FitFuel.
              </h2>
            </FadeItem>
          </FadeSection>

          <FadeSection>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {VALUES.map(v => {
                const Icon = v.icon;
                return (
                  <FadeItem key={v.title}>
                    <div
                      style={{
                        background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
                        border: "1px solid #1e1e1e",
                        borderRadius: 18, padding: "28px 28px 32px",
                        height: "100%",
                        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = "rgba(132,204,22,0.25)";
                        el.style.transform = "translateY(-4px)";
                        el.style.boxShadow = "0 12px 48px rgba(132,204,22,0.09)";
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = "#1e1e1e";
                        el.style.transform = "translateY(0)";
                        el.style.boxShadow = "none";
                      }}
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: "rgba(132,204,22,0.08)",
                        border: "1px solid rgba(132,204,22,0.18)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: 20,
                      }}>
                        <Icon size={20} color="#84cc16" />
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#f9fafb", marginBottom: 10 }}>
                        {v.title}
                      </div>
                      <p style={{ fontSize: 14, color: "#9a9a94", lineHeight: 1.75 }}>
                        {v.desc}
                      </p>
                    </div>
                  </FadeItem>
                );
              })}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 0 120px" }}>
        <div style={WRAP}>
          <FadeSection>
            <FadeItem>
              <div style={{
                background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
                border: "1px solid rgba(132,204,22,0.2)",
                borderRadius: 24,
                padding: "60px 56px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: 32,
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: "linear-gradient(90deg, #84cc16, transparent)",
                }} />
                <div style={{
                  position: "absolute", bottom: -120, right: -80,
                  width: 400, height: 400, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(132,204,22,0.06) 0%, transparent 70%)",
                  pointerEvents: "none",
                }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#84cc16", textTransform: "uppercase", marginBottom: 14 }}>
                    — Start today
                  </div>
                  <h2 style={{
                    fontFamily: "var(--ff-cond)",
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    fontWeight: 900, textTransform: "uppercase",
                    color: "#f9fafb", lineHeight: 1, letterSpacing: "-0.01em",
                    marginBottom: 12,
                  }}>
                    Try a day for ₹400.
                  </h2>
                  <p style={{ fontSize: 15, color: "#9a9a94", maxWidth: 420, lineHeight: 1.7 }}>
                    No commitment, no subscription. One trial day to experience fresh, goal-based meals delivered to your door.
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
                      transition: "all 0.22s ease",
                      whiteSpace: "nowrap",
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
                  <Link
                    href="/contact"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: "transparent", color: "#9a9a94",
                      fontWeight: 700, fontSize: 13,
                      padding: "14px 24px", borderRadius: 10,
                      textDecoration: "none",
                      border: "1px solid #242424",
                      letterSpacing: "0.06em", textTransform: "uppercase",
                      transition: "all 0.22s ease",
                      whiteSpace: "nowrap",
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
                    Contact us
                  </Link>
                </div>
              </div>
            </FadeItem>
          </FadeSection>
        </div>
      </section>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 860px) {
          .about-story-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .about-values-grid { grid-template-columns: 1fr 1fr !important; }
          .about-stats-grid  { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          .about-values-grid { grid-template-columns: 1fr !important; }
          .about-stats-grid  { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
