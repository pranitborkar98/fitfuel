"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  motion, AnimatePresence, useMotionValue, useSpring, useTransform,
  useScroll, useReducedMotion
} from "framer-motion";
import { ArrowRight, CheckCircle, Star, Truck, ChefHat, Target, Clock, Shield, Zap, Flame } from "lucide-react";

/* ─── Font ─── */
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,800;1,900&display=swap');`;

/* ─── Easing ─── */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];
const EASE_IN_OUT  = [0.45, 0, 0.55, 1] as [number, number, number, number];

/* ─── Variants ─── */
const fadeUp  = {
  hidden:  { opacity: 0, y: 32, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};
const stagger = { visible: { transition: { staggerChildren: 0.09 } } };
const fadeIn  = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.9 } } };

/* ─── Hero card data ─── */
const heroCards = [
  {
    plan: "Muscle Gain", slug: "muscle-gain", accent: "#f97316", tag: "HIGH PROTEIN",
    meals: ["Grilled Chicken Quinoa Bowl", "Egg Bhurji Multigrain Wrap", "Tandoori Fish + Brown Rice"],
    macros: { protein: 42, carbs: 38, fat: 20, cal: "1,820", proteinG: "148g", carbsG: "210g", fatG: "42g" },
  },
  {
    plan: "Weight Loss", slug: "weight-loss", accent: "#ef4444", tag: "CALORIE DEFICIT",
    meals: ["Greek Yogurt Parfait", "Grilled Tofu Beetroot Bowl", "Methi Dal + Bajra Roti"],
    macros: { protein: 34, carbs: 45, fat: 21, cal: "1,380", proteinG: "108g", carbsG: "165g", fatG: "35g" },
  },
  {
    plan: "Balanced Diet", slug: "balanced-diet", accent: "#84cc16", tag: "CLEAN EATING",
    meals: ["Ragi Porridge + Almonds", "Rajma Brown Rice Bowl", "Paneer Tikka + Millet"],
    macros: { protein: 28, carbs: 50, fat: 22, cal: "1,600", proteinG: "96g", carbsG: "180g", fatG: "40g" },
  },
  {
    plan: "Office Plan", slug: "office-employee", accent: "#3b82f6", tag: "MON–FRI ONLY",
    meals: ["Multigrain Paratha + Curd", "Moong Dal Khichdi + Ghee", "Grilled Fish + Steamed Veggies"],
    macros: { protein: 30, carbs: 48, fat: 22, cal: "1,520", proteinG: "105g", carbsG: "172g", fatG: "38g" },
  },
  {
    plan: "Jain Diet", slug: "jain-diet", accent: "#22c55e", tag: "100% JAIN",
    meals: ["Quinoa Muesli + Coconut Yogurt", "Stuffed Capsicum Paneer Quinoa", "Chickpea Spinach Curry + Red Rice"],
    macros: { protein: 26, carbs: 52, fat: 22, cal: "1,490", proteinG: "90g", carbsG: "185g", fatG: "38g" },
  },
];

const plans = [
  { name: "Muscle Gain",     slug: "muscle-gain",     tagline: "Eat Big.\nLift Heavy.\nGrow Fast.",      short: "High-protein meals engineered to rebuild and grow muscle every single day.",  from: 400, tag: "POPULAR", accent: "#f97316", accentDim: "rgba(249,115,22,0.10)", border: "rgba(249,115,22,0.18)", borderHot: "rgba(249,115,22,0.55)", num: "01" },
  { name: "Weight Loss",     slug: "weight-loss",     tagline: "Burn Fat.\nKeep Muscle.\nFeel Alive.",   short: "Calorie-controlled, nutrient-dense meals that keep you full and burning fat.",    from: 400, tag: "",        accent: "#ef4444", accentDim: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.18)",   borderHot: "rgba(239,68,68,0.55)",   num: "02" },
  { name: "Balanced Diet",   slug: "balanced-diet",   tagline: "Clean Fuel.\nSustained\nEnergy.",        short: "Perfectly balanced macros for a healthy, energetic lifestyle — no extremes.",    from: 400, tag: "",        accent: "#84cc16", accentDim: "rgba(132,204,22,0.10)", border: "rgba(132,204,22,0.18)", borderHot: "rgba(132,204,22,0.55)", num: "03" },
  { name: "Office Employee", slug: "office-employee", tagline: "Fuel Your\n9–6. Mon\nto Fri.",           short: "Weekday-only delivery. Healthy fuel for your entire work week.",                   from: 400, tag: "",        accent: "#3b82f6", accentDim: "rgba(59,130,246,0.10)",  border: "rgba(59,130,246,0.18)",  borderHot: "rgba(59,130,246,0.55)",  num: "04" },
  { name: "Jain Diet",       slug: "jain-diet",       tagline: "Pure.\nSattvic.\nNourishing.",           short: "100% Jain-compliant meals. No root vegetables, no compromises.",                  from: 400, tag: "",        accent: "#22c55e", accentDim: "rgba(34,197,94,0.10)",   border: "rgba(34,197,94,0.18)",   borderHot: "rgba(34,197,94,0.55)",   num: "05" },
];

const stats = [
  { value: "145+", label: "Happy Customers" },
  { value: "5",    label: "Goal Plans"       },
  { value: "₹400", label: "Trial Day"        },
  { value: "4.9★", label: "Avg. Rating"      },
];

const steps = [
  { n: "01", icon: Target,  title: "Choose Your Goal", desc: "Pick the plan that matches your goal — Muscle Gain, Weight Loss, Balanced Diet, Office Plan, or Jain Diet. We handle the rest." },
  { n: "02", icon: ChefHat, title: "We Cook Fresh",    desc: "Our chefs prepare your meals fresh every morning using quality ingredients sourced locally in Pune. No frozen, no reheated." },
  { n: "03", icon: Truck,   title: "Delivered to You", desc: "Hot, fresh meals delivered to your door in Kharadi and surrounding Pune areas. Daily, without fail, on your schedule." },
];

const usps = [
  { icon: ChefHat,     title: "Chef-Cooked Daily",    desc: "No frozen meals. Every dish prepared fresh each morning by our in-house chefs." },
  { icon: Target,      title: "Goal-Based Nutrition", desc: "Meals designed by nutritionists, calibrated to your specific fitness goal." },
  { icon: Zap,         title: "Trial for ₹400",       desc: "Start with a single trial day. No commitment, no subscription required." },
  { icon: Clock,       title: "On-Time Delivery",     desc: "Consistent delivery schedule so you never have to worry about your food." },
  { icon: Shield,      title: "FSSAI Kitchen",        desc: "Hygienic, compliant kitchen. Clean, safe, and transparent food preparation." },
  { icon: CheckCircle, title: "No Lock-In",           desc: "Pause, change, or cancel your plan anytime. You're always in control." },
];

const testimonials = [
  { name: "Rahul M.",  loc: "Kharadi",       plan: "Muscle Gain · 1 Month",   result: "+3kg muscle",     rating: 5, text: "Gained 3kg of muscle in a month. The food is actually delicious — I was expecting bland diet food but FitFuel proved me wrong completely. Delivery is always on time." },
  { name: "Priya S.",  loc: "Viman Nagar",   plan: "Weight Loss · Bi-Weekly", result: "−4kg in 15 days", rating: 5, text: "Lost 4kg in 15 days while eating properly. No starvation, no boiled chicken. Real food that tastes good and keeps me full until the next meal." },
  { name: "Amit K.",   loc: "Kalyani Nagar", plan: "Office Plan · Monthly",   result: "Quit Zomato",     rating: 5, text: "Best decision for my work week. I used to order Zomato every day and still feel unhealthy. FitFuel changed my relationship with food completely." },
];

const WRAP: React.CSSProperties = {
  width: "100%", maxWidth: 1280,
  marginLeft: "auto", marginRight: "auto",
  paddingLeft: 40, paddingRight: 40,
};

/* ─── Section label — higher contrast ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <div style={{ width: 24, height: 2, background: "#84cc16", flexShrink: 0, borderRadius: 1 }} />
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "#84cc16", textTransform: "uppercase" }}>
        {children}
      </span>
    </div>
  );
}

/* ─── Magnetic button ─── */
function MagneticButton({ children, style, onClick, href, onMouseEnter, onMouseLeave }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLElement>) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width  / 2) * 0.35);
    y.set((e.clientY - r.top  - r.height / 2) * 0.35);
  }
  function onLeave(e: React.MouseEvent<HTMLElement>) {
    x.set(0); y.set(0);
    onMouseLeave?.(e);
  }

  const inner = (
    <motion.div ref={ref} style={{ x: sx, y: sy, display: "inline-flex" }}
      onMouseMove={onMove} onMouseLeave={onLeave}
      onMouseEnter={onMouseEnter as any}
    >
      <div style={style} onClick={onClick}>{children}</div>
    </motion.div>
  );

  return href ? <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link> : inner;
}

/* ═══ 3D HERO CARD — enhanced ═══ */
function HeroCard() {
  const [active,  setActive]  = useState(0);
  const [hovered, setHovered] = useState(false);
  const [shimmer, setShimmer] = useState(false);
  const [prevActive, setPrev] = useState(-1);
  const router  = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  /* Spring 3D tilt */
  const rotX  = useMotionValue(0);
  const rotY  = useMotionValue(0);
  const sRotX = useSpring(rotX, { stiffness: 200, damping: 28 });
  const sRotY = useSpring(rotY, { stiffness: 200, damping: 28 });

  /* Depth parallax — inner elements shift slightly */
  const depthX = useTransform(sRotY, [-14, 14], [8, -8]);
  const depthY = useTransform(sRotX, [-14, 14], [-8, 8]);

  /* Cursor glow */
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const sGX   = useSpring(glowX, { stiffness: 100, damping: 18 });
  const sGY   = useSpring(glowY, { stiffness: 100, damping: 18 });
  const glowBg = useTransform(
    [sGX, sGY] as const,
    ([x, y]: number[]) =>
      `radial-gradient(320px circle at ${x}% ${y}%, ${heroCards[active].accent}28 0%, transparent 68%)`
  );

  /* Specular highlight */
  const specBg = useTransform(
    [sGX, sGY] as const,
    ([x, y]: number[]) =>
      `radial-gradient(120px circle at ${x}% ${y}%, rgba(255,255,255,0.06) 0%, transparent 60%)`
  );

  useEffect(() => {
    if (prefersReducedMotion) return;
    const t = setInterval(() => {
      setPrev(active);
      setActive(a => (a + 1) % heroCards.length);
      setShimmer(true);
      setTimeout(() => setShimmer(false), 800);
    }, 4200);
    return () => clearInterval(t);
  }, [active, prefersReducedMotion]);

  const card = heroCards[active];

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el || prefersReducedMotion) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top)  / height;
    rotX.set((y - 0.5) * -16);
    rotY.set((x - 0.5) *  16);
    glowX.set(x * 100);
    glowY.set(y * 100);
  }

  function onMouseLeave() {
    setHovered(false);
    rotX.set(0); rotY.set(0);
    glowX.set(50); glowY.set(50);
  }

  const mealIcons = ["🌅", "☀️", "🌙"];
  const mealLabels = ["Breakfast", "Lunch", "Dinner"];

  return (
    <div style={{ position: "relative", userSelect: "none", perspective: 1200 }}>
      {/* Layered depth shadows */}
      {[
        { top: 28, left: 20, right: -20, bottom: -28, bg: "#080808", border: "#0e0e0e" },
        { top: 14, left: 10, right: -10, bottom: -14, bg: "#0b0b0b", border: "#141414" },
      ].map((s, i) => (
        <div key={i} style={{ position: "absolute", top: s.top, left: s.left, right: s.right, bottom: s.bottom, background: s.bg, borderRadius: 24, border: `1px solid ${s.border}` }} />
      ))}

      {/* Ambient glow beneath card */}
      <motion.div
        animate={{ opacity: hovered ? 0.7 : 0.35 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "absolute", bottom: -40, left: "10%", right: "10%", height: 80,
          background: `radial-gradient(ellipse, ${card.accent}50 0%, transparent 70%)`,
          filter: "blur(20px)", pointerEvents: "none",
          transition: "background 0.5s",
        }}
      />

      {/* Glow ring */}
      <motion.div
        animate={{
          boxShadow: hovered
            ? `0 0 0 1px ${card.accent}50, 0 12px 60px ${card.accent}40, 0 30px 100px ${card.accent}20`
            : `0 0 0 1px ${card.accent}20, 0 4px 30px ${card.accent}12`,
        }}
        transition={{ duration: 0.45, ease: EASE_IN_OUT }}
        style={{ position: "absolute", inset: 0, borderRadius: 24, pointerEvents: "none", zIndex: 2 }}
      />

      {/* 3D tilt */}
      <motion.div
        ref={cardRef}
        style={{ rotateX: sRotX, rotateY: sRotY, transformStyle: "preserve-3d", position: "relative", zIndex: 1 }}
        onMouseMove={onMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onMouseLeave}
        onClick={() => router.push(`/plans/${card.slug}`)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            style={{
              position: "relative", overflow: "hidden",
              background: "linear-gradient(145deg, #141414 0%, #0f0f0f 100%)",
              border: `1px solid ${hovered ? card.accent + "55" : card.accent + "25"}`,
              borderRadius: 24, padding: "30px 28px 24px",
              cursor: "pointer",
              transition: "border-color 0.35s",
            }}
          >
            {/* Dynamic cursor glow */}
            <motion.div style={{ position: "absolute", inset: 0, background: glowBg, pointerEvents: "none", borderRadius: 24 }} />
            {/* Specular highlight */}
            <motion.div style={{ position: "absolute", inset: 0, background: specBg, pointerEvents: "none", borderRadius: 24 }} />

            {/* Shimmer sweep */}
            {shimmer && !prefersReducedMotion && (
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none", borderRadius: 24, zIndex: 10,
                background: `linear-gradient(108deg, transparent 25%, ${card.accent}22 48%, rgba(255,255,255,0.06) 52%, transparent 72%)`,
                animation: "ff-shimmer 0.75s ease forwards",
              }} />
            )}

            {/* Top accent stripe */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${card.accent}, ${card.accent}55 60%, transparent 85%)`, borderRadius: "24px 24px 0 0" }} />

            {/* Corner ambient */}
            <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, background: `radial-gradient(circle, ${card.accent}18 0%, transparent 65%)`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, background: `radial-gradient(circle, ${card.accent}08 0%, transparent 65%)`, pointerEvents: "none" }} />

            {/* Parallax inner layer */}
            <motion.div style={{ x: depthX, y: depthY, position: "relative" }}>

              {/* ── Header ── */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "#6b7280", textTransform: "uppercase", marginBottom: 6 }}>
                    Tomorrow's Delivery
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 26, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.02em", color: "#ffffff", lineHeight: 1 }}>
                    {card.plan}
                  </div>
                </div>
                <motion.div
                  animate={{ color: card.accent, borderColor: card.accent + "45", background: card.accent + "14" }}
                  transition={{ duration: 0.4 }}
                  style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", padding: "5px 10px", borderRadius: 6, textTransform: "uppercase", flexShrink: 0, marginTop: 2, border: "1px solid" }}
                >
                  {card.tag}
                </motion.div>
              </div>

              {/* ── Meals ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {mealLabels.map((label, i) => (
                  <motion.div
                    key={label + active}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.08, ease: EASE_OUT_EXPO }}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: `${card.accent}16`, border: `1px solid ${card.accent}28`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                    }}>
                      {mealIcons[i]}
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2, fontWeight: 600 }}>{label}</div>
                      {/* ✅ HIGH CONTRAST meal name */}
                      <div style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.35, fontWeight: 500 }}>{card.meals[i]}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ── Macro bar ── */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>Macros</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: card.accent, letterSpacing: "0.05em" }}>{card.macros.cal} kcal</span>
                </div>
                <div style={{ display: "flex", height: 6, borderRadius: 4, overflow: "hidden", gap: 2, background: "#1c1c1c" }}>
                  {[
                    { w: card.macros.protein, color: "#84cc16", delay: 0.1 },
                    { w: card.macros.carbs,   color: "#3b82f6", delay: 0.19 },
                    { w: card.macros.fat,     color: "#4b5563", delay: 0.28 },
                  ].map((seg, i) => (
                    <motion.div
                      key={`seg-${active}-${i}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${seg.w}%` }}
                      transition={{ duration: 0.6, delay: seg.delay, ease: EASE_OUT_EXPO }}
                      style={{ background: seg.color, borderRadius: 2, height: "100%", flexShrink: 0 }}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
                  {[
                    { label: "Protein", val: card.macros.proteinG, color: "#84cc16" },
                    { label: "Carbs",   val: card.macros.carbsG,   color: "#3b82f6" },
                    { label: "Fat",     val: card.macros.fatG,     color: "#6b7280" },
                  ].map((m, i) => (
                    <motion.div
                      key={m.label + active}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.32, delay: 0.3 + i * 0.07 }}
                      style={{ display: "flex", alignItems: "center", gap: 7 }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: 2, background: m.color, flexShrink: 0 }} />
                      <div>
                        {/* ✅ Much more visible labels */}
                        <div style={{ fontSize: 9, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{m.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#e5e7eb" }}>{m.val}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* ── Footer ── */}
              <div style={{ paddingTop: 16, borderTop: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {/* ✅ Footer text — readable */}
                <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>₹400 trial · No commitment</span>
                <button
                  onClick={e => { e.stopPropagation(); router.push("/plans?trial=true"); }}
                  style={{
                    fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "#000", background: card.accent, border: "none", cursor: "pointer",
                    padding: "10px 18px", borderRadius: 8,
                    boxShadow: `0 4px 20px ${card.accent}60`,
                    transition: "opacity 0.18s, transform 0.15s, box-shadow 0.18s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "scale(1.06) translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${card.accent}70`; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1";    e.currentTarget.style.transform = "scale(1)";              e.currentTarget.style.boxShadow = `0 4px 20px ${card.accent}60`; }}
                >
                  Try Today →
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 7, justifyContent: "center", marginTop: 22 }}>
        {heroCards.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActive(i); setShimmer(true); setTimeout(() => setShimmer(false), 800); }}
            style={{
              height: 4, width: i === active ? 26 : 5, borderRadius: 2,
              background: i === active ? card.accent : "#2a2a2a",
              border: "none", cursor: "pointer",
              transition: "all 0.4s ease", padding: 0,
              boxShadow: i === active ? `0 0 10px ${card.accent}80` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══ PLAN CARD — enhanced ═══ */
function PlanCard({ plan, index }: { plan: typeof plans[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const isLarge = index < 2;

  return (
    <Link
      href={`/plans/${plan.slug}`}
      style={{
        display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
        background: hovered
          ? `linear-gradient(145deg, ${plan.accentDim}, rgba(10,10,10,0.95))`
          : "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
        border: `1px solid ${hovered ? plan.borderHot : plan.border}`,
        borderRadius: 18, padding: isLarge ? "34px 30px" : "26px 24px",
        textDecoration: "none", color: "inherit",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: hovered ? "translateY(-5px) scale(1.01)" : "translateY(0) scale(1)",
        boxShadow: hovered
          ? `0 24px 80px ${plan.accentDim}, 0 0 0 1px ${plan.borderHot}, inset 0 1px 0 rgba(255,255,255,0.04)`
          : `inset 0 1px 0 rgba(255,255,255,0.02)`,
        height: "100%",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Ghost number */}
      <div style={{
        position: "absolute", bottom: -8, right: 14,
        fontFamily: "'Barlow Condensed', Impact, sans-serif",
        fontSize: isLarge ? 130 : 96, fontWeight: 900,
        color: hovered ? plan.border : "rgba(255,255,255,0.022)",
        lineHeight: 1, userSelect: "none", transition: "color 0.4s", pointerEvents: "none",
        letterSpacing: "-0.02em",
      }}>
        {plan.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
      </div>

      {plan.tag && (
        <div style={{
          position: "absolute", top: isLarge ? 22 : 18, right: isLarge ? 22 : 18,
          fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: plan.accent,
          background: plan.accentDim, border: `1px solid ${plan.border}`,
          padding: "4px 9px", borderRadius: 5,
        }}>
          {plan.tag}
        </div>
      )}

      {/* Top gradient stripe */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${plan.accent} 0%, transparent 65%)`, opacity: hovered ? 1 : 0.35, transition: "opacity 0.35s", borderRadius: "18px 18px 0 0" }} />

      <div style={{ flex: 1, position: "relative" }}>
        {/* ✅ Highly legible tagline */}
        <div style={{
          fontSize: isLarge ? 34 : 26,
          fontFamily: "'Barlow Condensed', Impact, sans-serif",
          fontWeight: 900, textTransform: "uppercase",
          letterSpacing: "0.02em", lineHeight: 1.05,
          color: "#f9fafb", marginBottom: 12, whiteSpace: "pre-line",
        }}>
          {plan.tagline}
        </div>
        {/* ✅ Body text — good contrast */}
        <div style={{ fontSize: 13.5, color: "#9ca3af", lineHeight: 1.75, marginBottom: 22 }}>{plan.short}</div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: "auto",
      }}>
        <div>
          {/* ✅ "From" label — visible */}
          <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3, fontWeight: 600 }}>From</div>
          <div style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: isLarge ? 28 : 24, fontWeight: 800, color: plan.accent }}>
            ₹{plan.from.toLocaleString("en-IN")}
          </div>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: 10, border: `1px solid ${hovered ? plan.accent : "rgba(255,255,255,0.12)"}`,
          background: hovered ? plan.accent : "rgba(255,255,255,0)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.25s, border-color 0.25s",
        }}>
          <ArrowRight style={{ width: 15, height: 15, color: hovered ? "#000" : "#6b7280", transition: "color 0.25s" }} />
        </div>
      </div>
    </Link>
  );
}

/* ─── Animated counter ─── */
function AnimatedStat({ value, label }: { value: string; label: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.6 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.9 }}
        animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: "clamp(1.7rem, 3vw, 2.4rem)", fontWeight: 900, color: "#fff", lineHeight: 1 }}
      >
        {value}
      </motion.div>
      {/* ✅ Stat label — visible */}
      <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 6, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

/* ═══ PAGE ═══ */
export default function HomePage() {
  return (
    <div style={{ background: "#080808", color: "#fff", overflow: "hidden" }}>
      <style>{`
        ${FONT_IMPORT}
        @keyframes ff-pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} }
        @keyframes ff-float   { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
        @keyframes ff-shimmer { 0%{transform:translateX(-130%) skewX(-8deg)} 100%{transform:translateX(230%) skewX(-8deg)} }
        @keyframes ff-scan    { 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }
        @keyframes ff-rotate  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        /* Global text rendering improvements */
        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

        .ff-hero-headline {
          font-family: 'Barlow Condensed','Impact',sans-serif;
          font-weight:900; font-style:italic;
          text-transform:uppercase; letter-spacing:-0.015em;
          line-height:0.9; font-size:clamp(4rem,8vw,9.5rem);
        }
        .ff-section-title {
          font-family:'Barlow Condensed','Impact',sans-serif;
          font-weight:900; text-transform:uppercase;
          letter-spacing:0.01em; line-height:0.95;
          font-size:clamp(2.8rem,5.5vw,5.5rem);
          color: #f9fafb;
        }
        .ff-hero-grid         { display:grid; grid-template-columns:1.15fr 0.85fr; gap:64px; align-items:center; }
        .ff-plans-grid        { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; margin-bottom:12px; }
        .ff-plans-grid-3      { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        .ff-usps-grid         { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; }
        .ff-steps-grid        { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; }
        .ff-testimonials-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }

        @media(max-width:960px){
          .ff-hero-grid { grid-template-columns:1fr; gap:52px; }
          .ff-hero-card-col { order:-1; max-width:440px; margin:0 auto; width:100%; }
        }
        @media(max-width:900px){
          .ff-plans-grid        { grid-template-columns:1fr; }
          .ff-plans-grid-3      { grid-template-columns:1fr 1fr; }
          .ff-usps-grid         { grid-template-columns:repeat(2,1fr); }
          .ff-steps-grid        { grid-template-columns:1fr; }
          .ff-testimonials-grid { grid-template-columns:1fr; }
        }
        @media(max-width:640px){
          .ff-plans-grid-3  { grid-template-columns:1fr; }
          .ff-usps-grid     { grid-template-columns:1fr; }
          .ff-cta-inner     { grid-template-columns:1fr !important; }
          .ff-cta-inner > div:first-child { border-right:none !important; border-bottom:1px solid #1a1a1a !important; }
        }
      `}</style>

      {/* ══ HERO ══ */}
      <section style={{ position: "relative", minHeight: "90vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        {/* Background grain texture */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")", backgroundSize: "256px 256px", opacity: 0.5, pointerEvents: "none" }} />

        {/* Diagonal grid */}
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(-52deg,transparent,transparent 64px,rgba(132,204,22,0.014) 64px,rgba(132,204,22,0.014) 65px)", pointerEvents: "none" }} />

        {/* Radial glows */}
        <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: "65vw", height: "65vw", background: "radial-gradient(ellipse,rgba(132,204,22,0.065) 0%,transparent 62%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "0",     right: "-15%", width: "50vw", height: "50vw", background: "radial-gradient(ellipse,rgba(132,204,22,0.03) 0%,transparent 60%)", pointerEvents: "none" }} />

        {/* Large ghost text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 2.5, delay: 0.6, ease: EASE_OUT_EXPO }}
          style={{ position: "absolute", bottom: -30, left: -14, fontFamily: "'Barlow Condensed',Impact,sans-serif", fontSize: "clamp(200px,30vw,450px)", fontWeight: 900, fontStyle: "italic", lineHeight: 1, color: "rgba(255,255,255,0.016)", userSelect: "none", pointerEvents: "none", letterSpacing: "-0.05em" }}
        >
          FF
        </motion.div>

        <div style={{ ...WRAP, position: "relative", zIndex: 2, paddingTop: 108, paddingBottom: 72 }}>
          <div className="ff-hero-grid">
            {/* LEFT */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              {/* Live badge */}
              <motion.div variants={fadeUp} style={{ marginBottom: 40 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 9,
                  background: "rgba(132,204,22,0.07)", border: "1px solid rgba(132,204,22,0.22)",
                  color: "#a3e635", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", padding: "8px 18px", borderRadius: 6,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#84cc16", boxShadow: "0 0 10px #84cc16, 0 0 20px #84cc1660", animation: "ff-pulse 1.8s ease infinite" }} />
                  Now Delivering · Kharadi &amp; Viman Nagar
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1 className="ff-hero-headline" style={{ margin: "0 0 32px" }} variants={stagger}>
                {[
                  { text: "Eat Right.", color: "#f9fafb" },
                  { text: "Train Hard.", color: "#f9fafb" },
                  { text: "Look Great.", color: "#84cc16" },
                ].map(({ text, color }, idx) => (
                  <span key={text} style={{ display: "block", overflow: "hidden", lineHeight: 0.96, paddingBottom: "0.06em" }}>
                    <motion.span
                      initial={{ y: "115%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.8, delay: idx * 0.13, ease: EASE_OUT_EXPO }}
                      style={{ display: "block", color }}
                    >
                      {text}
                    </motion.span>
                  </span>
                ))}
              </motion.h1>

              {/* ✅ High contrast subheading */}
              <motion.p variants={fadeUp} style={{ fontSize: 16, color: "#9ca3af", lineHeight: 1.8, maxWidth: 420, margin: "0 0 34px", fontWeight: 400 }}>
                Pune's premium goal-based meal delivery. Chef-cooked, nutritionist-designed meals at your door — every single day.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 48 }}>
                <Link
                  href="/plans"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#84cc16", color: "#000", fontSize: 13, fontWeight: 900,
                    letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none",
                    padding: "14px 28px", borderRadius: 9,
                    boxShadow: "0 4px 28px rgba(132,204,22,0.4)",
                    transition: "all 0.22s ease",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#a3e635"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 36px rgba(132,204,22,0.5)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#84cc16"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)";  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 28px rgba(132,204,22,0.4)"; }}
                >
                  View Meal Plans <ArrowRight size={14} />
                </Link>
                <Link
                  href="/plans?trial=true"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "rgba(132,204,22,0.05)", color: "#a3e635", fontSize: 13, fontWeight: 800,
                    letterSpacing: "0.09em", textTransform: "uppercase", textDecoration: "none",
                    padding: "13px 24px", borderRadius: 9, border: "1px solid rgba(132,204,22,0.3)",
                    transition: "all 0.22s ease",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(132,204,22,0.10)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(132,204,22,0.6)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(132,204,22,0.05)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(132,204,22,0.3)"; }}
                >
                  Try 1 Day — ₹400
                </Link>
              </motion.div>

              {/* Stats — higher contrast */}
              <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", paddingTop: 32, borderTop: "1px solid #1c1c1c" }}>
                {stats.map((s, i) => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ paddingRight: 28, paddingLeft: i === 0 ? 0 : 28, borderLeft: i > 0 ? "1px solid #222" : "none" }}>
                      <AnimatedStat value={s.value} label={s.label} />
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* RIGHT — 3D card */}
            <motion.div
              className="ff-hero-card-col"
              initial={{ opacity: 0, x: 44, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1.0, delay: 0.55, ease: EASE_OUT_EXPO }}
              style={{ animation: "ff-float 7s ease-in-out 2s infinite" }}
            >
              <HeroCard />
            </motion.div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(to bottom, transparent, #080808)", pointerEvents: "none" }} />
      </section>

      {/* ══ PLANS ══ */}
      <section id="plans" style={{ padding: "110px 0 0", background: "#080808" }}>
        <div style={WRAP}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}><SectionLabel>Goal Plans</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="ff-section-title" style={{ marginBottom: 16 }}>
              Pick Your <span style={{ color: "#84cc16" }}>Mission</span>
            </motion.h2>
            {/* ✅ Section description — clear */}
            <motion.p variants={fadeUp} style={{ fontSize: 15, color: "#9ca3af", maxWidth: 500, marginBottom: 56, lineHeight: 1.7 }}>
              Five distinct plans, each engineered for a specific goal. All starting at ₹400 trial day.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            <div className="ff-plans-grid">
              {plans.slice(0, 2).map((plan, i) => (
                <motion.div key={plan.slug} variants={fadeUp} style={{ height: "100%" }}>
                  <PlanCard plan={plan} index={i} />
                </motion.div>
              ))}
            </div>
            <div className="ff-plans-grid-3">
              {plans.slice(2).map((plan, i) => (
                <motion.div key={plan.slug} variants={fadeUp} style={{ height: "100%" }}>
                  <PlanCard plan={plan} index={i + 2} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Coming soon bar — clearer text */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ marginTop: 12 }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 12, padding: "16px 24px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 22, opacity: 0.4 }}>🏥</span>
                <div>
                  {/* ✅ Title visible */}
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#9ca3af", marginBottom: 3 }}>Lifestyle Plans</div>
                  {/* ✅ Subtitle visible */}
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>PCOS, Diabetes, Thyroid, Alcohol Recovery &amp; more — launching soon</div>
                </div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#6b7280", background: "#161616", border: "1px solid #2a2a2a", padding: "5px 14px", borderRadius: 999, flexShrink: 0, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Coming Soon
              </span>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ textAlign: "center", padding: "52px 0 110px" }}>
            <Link href="/plans" style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              background: "rgba(132,204,22,0.06)", color: "#a3e635", fontSize: 13, fontWeight: 800,
              letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none",
              padding: "13px 26px", borderRadius: 9, border: "1px solid rgba(132,204,22,0.28)",
              transition: "all 0.22s ease",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(132,204,22,0.12)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(132,204,22,0.55)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(132,204,22,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(132,204,22,0.28)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              See All Plans &amp; Pricing <ArrowRight size={13} />
            </Link>
          </motion.div>

          <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)" }} />
        </div>
      </section>


      {/* ══ COOK AT HOME / DIGITAL PLANS ══ */}
      <section style={{ padding: "110px 0", background: "#060606" }}>
        <div style={WRAP}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}><SectionLabel>Cook At Home</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="ff-section-title" style={{ marginBottom: 16 }}>
              Not in Pune? Get the plan as a PDF.
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: "#9ca3af", fontSize: 16, lineHeight: 1.7, maxWidth: 560, marginBottom: 40 }}>
              The full 30-day plan — every recipe, macros, and a complete grocery list — delivered
              as a downloadable PDF. Cook it yourself, anywhere in India. Log your meals and stay on track.
            </motion.p>

            <motion.div variants={fadeUp} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24,
              background: "linear-gradient(145deg,#111,#0e0e0e)", border: "1px solid rgba(132,204,22,0.22)",
              borderRadius: 20, padding: "32px 36px",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                  <span style={{ fontSize: 38, fontWeight: 900, color: "#a3e635" }}>₹299</span>
                  <span style={{ fontSize: 18, color: "#6b7280", textDecoration: "line-through" }}>₹999</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#000", background: "#84cc16", padding: "3px 9px", borderRadius: 999 }}>70% OFF</span>
                </div>
                <p style={{ color: "#9ca3af", fontSize: 14 }}>1-month digital plan · all meals · instant download</p>
              </div>
              <Link href="/plans/digital" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#84cc16", color: "#000", fontSize: 14, fontWeight: 900,
                padding: "14px 26px", borderRadius: 10, textDecoration: "none",
                letterSpacing: "0.05em", textTransform: "uppercase",
                boxShadow: "0 4px 20px rgba(132,204,22,0.35)",
              }}>
                Browse Digital Plans <ArrowRight size={15} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" style={{ padding: "110px 0" }}>
        <div style={WRAP}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}><SectionLabel>Simple Process</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="ff-section-title" style={{ marginBottom: 56 }}>
              How It <span style={{ color: "#84cc16" }}>Works</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}
            style={{ background: "linear-gradient(145deg, #0e0e0e, #0b0b0b)", border: "1px solid #1e1e1e", borderRadius: 22, overflow: "hidden", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
          >
            <div className="ff-steps-grid">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.n} variants={fadeUp}
                    style={{ padding: "56px 44px", borderRight: i < 2 ? "1px solid #1a1a1a" : "none", position: "relative", overflow: "hidden" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(132,204,22,0.025)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Ghost number */}
                    <div style={{ position: "absolute", top: 18, right: 24, fontFamily: "'Barlow Condensed',Impact,sans-serif", fontSize: 72, fontWeight: 900, color: "rgba(255,255,255,0.04)", lineHeight: 1, userSelect: "none" }}>{step.n}</div>

                    {/* Hover glow */}
                    <div style={{ position: "absolute", bottom: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle,rgba(132,204,22,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />

                    <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(132,204,22,0.09)", border: "1px solid rgba(132,204,22,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
                      <Icon size={22} style={{ color: "#84cc16" }} />
                    </div>

                    {/* ✅ Step title — high contrast */}
                    <h3 style={{ fontFamily: "'Barlow Condensed',Impact,sans-serif", fontSize: 24, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em", color: "#f3f4f6", marginBottom: 14 }}>{step.title}</h3>
                    {/* ✅ Step desc — readable */}
                    <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.8 }}>{step.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
        <div style={{ height: 1, marginTop: 88, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)" }} />
      </section>

      {/* ══ USPs ══ */}
      <section style={{ padding: "110px 0", background: "#060606" }}>
        <div style={WRAP}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}><SectionLabel>Why FitFuel</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="ff-section-title" style={{ marginBottom: 56 }}>
              Built <span style={{ color: "#84cc16" }}>Different</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}
            style={{ border: "1px solid #1a1a1a", borderRadius: 22, overflow: "hidden" }}
          >
            <div className="ff-usps-grid">
              {usps.map((usp, i) => {
                const Icon = usp.icon;
                const row = Math.floor(i / 3);
                return (
                  <motion.div
                    key={usp.title} variants={fadeUp}
                    style={{ padding: "38px 34px", borderRight: (i % 3 < 2) ? "1px solid #1a1a1a" : "none", borderBottom: (row === 0) ? "1px solid #1a1a1a" : "none", background: "#0d0d0d", transition: "background 0.3s, box-shadow 0.3s", position: "relative", overflow: "hidden" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#111"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#0d0d0d"; }}
                  >
                    <div style={{ position: "absolute", bottom: -30, right: -30, width: 120, height: 120, background: "radial-gradient(circle,rgba(132,204,22,0.04) 0%,transparent 70%)", pointerEvents: "none" }} />
                    <Icon size={20} style={{ color: "#84cc16", marginBottom: 20, display: "block" }} />
                    {/* ✅ USP title — bright */}
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f3f4f6", marginBottom: 9 }}>{usp.title}</h3>
                    {/* ✅ USP desc — clear gray */}
                    <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.8 }}>{usp.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
        <div style={{ height: 1, marginTop: 88, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)" }} />
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ padding: "110px 0", background: "#080808" }}>
        <div style={WRAP}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}><SectionLabel>Results</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="ff-section-title" style={{ marginBottom: 56 }}>
              Real People. <span style={{ color: "#84cc16" }}>Real Results.</span>
            </motion.h2>

            <div className="ff-testimonials-grid">
              {testimonials.map((t, idx) => (
                <motion.div
                  key={t.name} variants={fadeUp}
                  style={{ position: "relative", overflow: "hidden", background: "linear-gradient(145deg, #0f0f0f, #0c0c0c)", border: "1px solid #1e1e1e", borderRadius: 18, padding: 30, display: "flex", flexDirection: "column", transition: "border-color 0.35s, box-shadow 0.35s, transform 0.35s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(132,204,22,0.28)"; e.currentTarget.style.boxShadow = "0 12px 50px rgba(132,204,22,0.09)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#84cc16 0%,transparent 55%)", opacity: 0.55 }} />

                  {/* Result badge */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(132,204,22,0.09)", color: "#a3e635", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", padding: "5px 11px", borderRadius: 5, border: "1px solid rgba(132,204,22,0.18)", textTransform: "uppercase", marginBottom: 18, alignSelf: "flex-start" }}>
                    <span style={{ width: 5, height: 5, background: "#84cc16", borderRadius: "50%" }} />
                    {t.result}
                  </div>

                  {/* Stars */}
                  <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={13} style={{ color: "#84cc16", fill: "#84cc16" }} />)}
                  </div>

                  {/* ✅ Quote text — highly legible */}
                  <p style={{ color: "#d1d5db", fontSize: 14, lineHeight: 1.8, flex: 1, marginBottom: 26, fontWeight: 400 }}>
                    "{t.text}"
                  </p>

                  <div style={{ borderTop: "1px solid #1e1e1e", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      {/* ✅ Name — white */}
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#f9fafb" }}>{t.name}</div>
                      {/* ✅ Location — visible */}
                      <div style={{ color: "#6b7280", fontSize: 12, marginTop: 3, fontWeight: 500 }}>{t.loc}, Pune</div>
                    </div>
                    {/* ✅ Plan text — readable */}
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textAlign: "right", maxWidth: 130, lineHeight: 1.5 }}>{t.plan}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        <div style={{ height: 1, marginTop: 88, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)" }} />
      </section>

      {/* ══ FINAL CTA ══ */}
      <section style={{ padding: "90px 0 72px", background: "#080808" }}>
        <div style={WRAP}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeIn}>
            <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(145deg, #0e0e0e 0%, #0a0a0a 100%)", border: "1px solid rgba(132,204,22,0.20)", borderRadius: 22, boxShadow: "0 0 0 1px rgba(132,204,22,0.05), inset 0 1px 0 rgba(255,255,255,0.03)" }}>
              {/* Ambient glows */}
              <div style={{ position: "absolute", bottom: -120, right: -120, width: 600, height: 600, background: "radial-gradient(circle,rgba(132,204,22,0.08) 0%,transparent 60%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: -80, left: -80, width: 400, height: 400, background: "radial-gradient(circle,rgba(132,204,22,0.045) 0%,transparent 60%)", pointerEvents: "none" }} />

              {/* Top accent line */}
              <div style={{ height: 2, background: "linear-gradient(90deg, transparent 0%, #84cc16 40%, transparent 100%)" }} />

              <div className="ff-cta-inner" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                {/* Left */}
                <div style={{ padding: "72px 60px", borderRight: "1px solid #1a1a1a" }}>
                  <div style={{ marginBottom: 28 }}><SectionLabel>No Risk</SectionLabel></div>
                  <h2 style={{
                    fontFamily: "'Barlow Condensed',Impact,sans-serif",
                    fontSize: "clamp(3.4rem,6.5vw,7rem)", fontWeight: 900, fontStyle: "italic",
                    textTransform: "uppercase", letterSpacing: "-0.015em", lineHeight: 0.88,
                    margin: "0 0 24px",
                    /* ✅ Gradient text */
                    background: "linear-gradient(135deg, #ffffff 40%, #84cc16 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>
                    Start<br />Today.<br />₹400.
                  </h2>
                  {/* ✅ CTA desc — legible */}
                  <p style={{ color: "#9ca3af", fontSize: 15, lineHeight: 1.75, maxWidth: 320 }}>
                    Breakfast + Lunch delivered tomorrow. No subscription, no lock-in. Just exceptional food.
                  </p>
                </div>

                {/* Right */}
                <div style={{ padding: "72px 60px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 32 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    {[
                      "Fresh, chef-cooked meals daily",
                      "Goal-based nutrition, not guesswork",
                      "Cancel anytime, no questions asked",
                    ].map(item => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(132,204,22,0.12)", border: "1px solid rgba(132,204,22,0.28)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <CheckCircle size={13} style={{ color: "#84cc16" }} />
                        </div>
                        {/* ✅ Checklist text — clearly visible */}
                        <span style={{ color: "#d1d5db", fontSize: 14, fontWeight: 500 }}>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    <Link
                      href="/plans?trial=true"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 9,
                        background: "#84cc16", color: "#000", fontSize: 13, fontWeight: 900,
                        letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none",
                        padding: "15px 30px", borderRadius: 9,
                        boxShadow: "0 4px 28px rgba(132,204,22,0.45)",
                        transition: "all 0.22s ease",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#a3e635"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 38px rgba(132,204,22,0.55)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#84cc16"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 28px rgba(132,204,22,0.45)"; }}
                    >
                      Order Trial Day <ArrowRight size={14} />
                    </Link>
                    <Link
                      href="/plans"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 9,
                        background: "transparent", color: "#9ca3af", fontSize: 13, fontWeight: 700,
                        letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none",
                        padding: "14px 24px", borderRadius: 9, border: "1px solid #2a2a2a",
                        transition: "all 0.22s ease",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f3f4f6"; (e.currentTarget as HTMLElement).style.borderColor = "#444"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      View All Plans
                    </Link>
                  </div>

                  {/* ✅ Fine print — readable */}
                  <p style={{ color: "#6b7280", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                    GST 5% applicable · Delivery in Kharadi &amp; Viman Nagar, Pune
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}