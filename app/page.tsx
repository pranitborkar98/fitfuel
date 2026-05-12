"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Star, Truck, ChefHat, Target, Clock, Shield, Zap } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const plans = [
  { name: "Muscle Gain", slug: "muscle-gain", emoji: "💪", tagline: "High protein. Heavy lifts. Real gains.", description: "Calorie-dense, protein-packed meals engineered for muscle growth. Every meal hits your macros.", from: 400, accentColor: "#f97316", borderHover: "hover:border-orange-500/40", glowHover: "hover:shadow-[0_0_40px_rgba(249,115,22,0.12)]", gradientHover: "from-orange-500/8" },
  { name: "Weight Loss", slug: "weight-loss", emoji: "🔥", tagline: "Burn fat. Keep muscle. Feel alive.", description: "Calorie-controlled, nutrient-dense meals that keep you full and burning fat all day.", from: 400, accentColor: "#ef4444", borderHover: "hover:border-red-500/40", glowHover: "hover:shadow-[0_0_40px_rgba(239,68,68,0.12)]", gradientHover: "from-red-500/8" },
  { name: "Balanced Diet", slug: "balanced-diet", emoji: "⚖️", tagline: "Clean eating. Sustained energy.", description: "Perfectly balanced macros for a healthy, energetic lifestyle. No extremes, just results.", from: 400, accentColor: "#84cc16", borderHover: "hover:border-[#84cc16]/40", glowHover: "hover:shadow-[0_0_40px_rgba(132,204,22,0.12)]", gradientHover: "from-[#84cc16]/8" },
  { name: "Office Employee", slug: "office-employee", emoji: "💼", tagline: "Fuel your 9–6. Mon to Fri.", description: "Weekday-only delivery. No cooking, no planning, just healthy fuel for your work week.", from: 400, accentColor: "#3b82f6", borderHover: "hover:border-blue-500/40", glowHover: "hover:shadow-[0_0_40px_rgba(59,130,246,0.12)]", gradientHover: "from-blue-500/8" },
  { name: "Jain Diet", slug: "jain-diet", emoji: "🌿", tagline: "Pure. Sattvic. Nourishing.", description: "100% Jain-compliant meals — no root vegetables, no compromises. Purity in every bite.", from: 400, accentColor: "#22c55e", borderHover: "hover:border-green-500/40", glowHover: "hover:shadow-[0_0_40px_rgba(34,197,94,0.12)]", gradientHover: "from-green-500/8" },
];

const stats = [
  { value: "145+", label: "Happy Customers" },
  { value: "5", label: "Meal Plans" },
  { value: "3", label: "Diet Types" },
  { value: "4.9★", label: "Avg Rating" },
];

const steps = [
  { number: "01", icon: Target, title: "Choose Your Goal", description: "Pick a plan that matches your goal — Muscle Gain, Weight Loss, Balanced Diet, Office Plan, or Jain Diet." },
  { number: "02", icon: ChefHat, title: "We Cook Fresh", description: "Our chefs prepare your meals fresh every morning using quality ingredients sourced locally in Pune." },
  { number: "03", icon: Truck, title: "Delivered to You", description: "Hot, fresh meals delivered to your door in Kharadi and surrounding Pune areas. Daily, without fail." },
];

const usps = [
  { icon: ChefHat, title: "Chef-Cooked Daily", description: "No frozen meals. Every dish prepared fresh every morning by our in-house chefs." },
  { icon: Target, title: "Goal-Based Nutrition", description: "Meals designed by nutritionists, calibrated to your specific fitness goal." },
  { icon: Zap, title: "Trial for ₹400", description: "Start with a single trial day. No commitment, no subscription required." },
  { icon: Clock, title: "On-Time Delivery", description: "Consistent delivery schedule so you can plan your day without worrying about food." },
  { icon: Shield, title: "Hygienic Kitchen", description: "FSSAI-compliant kitchen. Clean, safe, and transparent food preparation." },
  { icon: CheckCircle, title: "No Lock-In", description: "Pause, change, or cancel your plan anytime. You're always in control." },
];

const testimonials = [
  { name: "Rahul M.", location: "Kharadi, Pune", plan: "Muscle Gain — 1 Month", rating: 5, text: "Gained 3kg of muscle in a month. The food is actually delicious — I was expecting diet food to be bland but FitFuel proved me wrong. Delivery is always on time." },
  { name: "Priya S.", location: "Viman Nagar, Pune", plan: "Weight Loss — Bi-Weekly", rating: 5, text: "Lost 4kg in 15 days while eating properly. No starvation, no boiled chicken. Real food that actually tastes good and keeps me full until the next meal." },
  { name: "Amit K.", location: "Kalyani Nagar, Pune", plan: "Office Plan — Monthly", rating: 5, text: "Best decision for my work week. I used to order Zomato every day and still feel unhealthy. FitFuel changed that completely. The office plan is exactly what I needed." },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: `linear-gradient(#84cc16 1px, transparent 1px), linear-gradient(90deg, #84cc16 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#84cc16]/6 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />

        <div className="container mx-auto px-6 max-w-[1200px] pt-28 pb-20 relative z-20">
          <motion.div className="max-w-4xl mx-auto text-center" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 bg-[rgba(132,204,22,0.08)] text-[#84cc16] text-sm font-semibold px-5 py-2.5 rounded-full border border-[rgba(132,204,22,0.2)]">
                <span className="w-2 h-2 bg-[#84cc16] rounded-full animate-pulse" />
                Now delivering in Kharadi &amp; Viman Nagar, Pune
              </div>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-extrabold leading-[1.02] tracking-tight mb-6">
              Eat Right.<br />
              <span className="text-[#84cc16]">Train Hard.</span><br />
              Look Great.
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-[#a3a3a3] max-w-2xl mx-auto mb-10 leading-relaxed">
              Pune's premium goal-based meal delivery. Chef-cooked, nutritionist-designed meals delivered to your door — every single day.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/plans" className="btn-primary text-base px-8 py-4 w-full sm:w-auto justify-center">
                View Meal Plans <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/plans?trial=true" className="btn-secondary text-base px-8 py-4 w-full sm:w-auto justify-center">
                Try 1 Day — ₹400
              </Link>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {stats.map((s) => (
                <motion.div key={s.label} variants={fadeUp} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">{s.value}</div>
                  <div className="text-sm text-[#525252] mt-1">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="glow-line" />

      {/* MEAL PLANS */}
      <section className="py-24 bg-[#0a0a0a]" id="plans">
        <div className="container mx-auto px-6 max-w-[1200px]">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center mb-4"><span className="badge">Goal-Based Plans</span></motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Choose Your <span className="text-[#84cc16]">Plan</span></motion.h2>
            <motion.p variants={fadeUp} className="text-[#a3a3a3] text-lg max-w-xl mx-auto">Every plan is built around your specific goal. Not one-size-fits-all — your goal, your food.</motion.p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            {plans.map((plan) => (
              <motion.div key={plan.slug} variants={fadeUp}>
                <Link href={`/plans/${plan.slug}`} className={`relative overflow-hidden block bg-[#111111] border border-[#1f1f1f] ${plan.borderHover} ${plan.glowHover} rounded-2xl p-6 group cursor-pointer transition-all duration-300 hover:-translate-y-1`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradientHover} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative">
                    <div className="text-4xl mb-5">{plan.emoji}</div>
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-sm font-semibold mb-3" style={{ color: plan.accentColor }}>{plan.tagline}</p>
                    <p className="text-[#a3a3a3] text-sm leading-relaxed mb-6">{plan.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[#525252] text-xs mb-0.5">Starting from</div>
                        <div className="text-white font-bold text-xl">₹{plan.from.toLocaleString("en-IN")}</div>
                      </div>
                      <div className="w-10 h-10 rounded-xl border border-[#2a2a2a] flex items-center justify-center transition-all duration-300 group-hover:border-white/20">
                        <ArrowRight className="w-4 h-4 text-[#525252] group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            <motion.div variants={fadeUp}>
              <div className="relative overflow-hidden bg-[#0d0d0d] border border-[#161616] rounded-2xl p-6 opacity-40 cursor-not-allowed">
                <div className="text-4xl mb-5">🏥</div>
                <div className="inline-block bg-[#1a1a1a] text-[#444] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#222] mb-3">Coming Soon</div>
                <h3 className="text-xl font-bold text-[#333] mb-2">Lifestyle Plans</h3>
                <p className="text-[#2a2a2a] text-sm leading-relaxed">PCOS, Diabetes, Thyroid, Alcohol Recovery &amp; more specialized plans launching soon.</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div className="text-center mt-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Link href="/plans" className="btn-secondary inline-flex items-center gap-2">See All Plans &amp; Pricing <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-[#070707]" id="how-it-works">
        <div className="glow-line" />
        <div className="container mx-auto px-6 max-w-[1200px] mt-16">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center mb-4"><span className="badge">Simple Process</span></motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">How <span className="text-[#84cc16]">It Works</span></motion.h2>
            <motion.p variants={fadeUp} className="text-[#a3a3a3] text-lg max-w-xl mx-auto">Three steps between you and the best food of your life.</motion.p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-transparent via-[#84cc16]/25 to-transparent" />
            {steps.map((step) => (
              <motion.div key={step.number} variants={fadeUp} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="w-full h-full bg-[#111111] border border-[#1f1f1f] rounded-2xl flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-[#84cc16]" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#84cc16] rounded-full flex items-center justify-center">
                    <span className="text-black text-xs font-bold">{parseInt(step.number)}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-[#a3a3a3] text-sm leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <div className="glow-line mt-24" />
      </section>

      {/* WHY FITFUEL */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-6 max-w-[1200px]">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center mb-4"><span className="badge">Why FitFuel</span></motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Built Different. <span className="text-[#84cc16]">By Design.</span></motion.h2>
            <motion.p variants={fadeUp} className="text-[#a3a3a3] text-lg max-w-xl mx-auto">Not just another tiffin service. A complete nutrition system built around your goals.</motion.p>
          </motion.div>

          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            {usps.map((usp) => (
              <motion.div key={usp.title} variants={fadeUp} className="bg-[#111111] border border-[#1f1f1f] hover:border-[rgba(132,204,22,0.25)] rounded-2xl p-6 group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_32px_rgba(132,204,22,0.06)]">
                <div className="w-12 h-12 rounded-xl bg-[rgba(132,204,22,0.08)] border border-[rgba(132,204,22,0.15)] flex items-center justify-center mb-4 group-hover:bg-[#84cc16] group-hover:border-[#84cc16] transition-all duration-300">
                  <usp.icon className="w-5 h-5 text-[#84cc16] group-hover:text-black transition-colors duration-300" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{usp.title}</h3>
                <p className="text-[#a3a3a3] text-sm leading-relaxed">{usp.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-[#070707]">
        <div className="glow-line" />
        <div className="container mx-auto px-6 max-w-[1200px] mt-16">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center mb-4"><span className="badge">Real Results</span></motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">What Our <span className="text-[#84cc16]">Customers Say</span></motion.h2>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 hover:border-[rgba(132,204,22,0.2)] transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#84cc16]" fill="#84cc16" />
                  ))}
                </div>
                <p className="text-[#a3a3a3] text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="border-t border-[#1f1f1f] pt-4">
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-[#525252] text-xs mt-0.5">{t.location}</div>
                  <div className="text-[#84cc16] text-xs mt-1.5 font-medium">{t.plan}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <div className="glow-line mt-24" />
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-6 max-w-[1200px]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
            <div className="relative overflow-hidden rounded-3xl border border-[rgba(132,204,22,0.2)] bg-[#0d0d0d] p-12 md:p-20 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(132,204,22,0.06)] via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-[#84cc16]/50 to-transparent" />
              <div className="relative">
                <div className="flex justify-center mb-6"><span className="badge">No Risk, No Commitment</span></div>
                <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
                  Start Today.<br />
                  <span className="text-[#84cc16]">Trial Day — ₹400.</span>
                </h2>
                <p className="text-[#a3a3a3] text-lg max-w-lg mx-auto mb-10">Breakfast + Lunch delivered tomorrow. No subscription, no lock-in. Just great food.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/plans?trial=true" className="btn-primary text-base px-10 py-4 w-full sm:w-auto justify-center">
                    Order Trial Day <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/plans" className="btn-ghost text-base px-8 py-4 w-full sm:w-auto justify-center">View All Plans</Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
