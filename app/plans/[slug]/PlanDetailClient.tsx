'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Recipe {
  id: string
  name: string
  slug: string
  description?: string
  caloriesPerServing: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
  fibreGrams?: number
  cuisineType?: string
  prepTimeMins?: number
  cookTimeMins?: number
  servingSizeGrams?: number
  difficulty?: string
}

interface Slot {
  id: string
  dayNumber: number
  mealSlot: 'BREAKFAST' | 'LUNCH' | 'SNACK' | 'DINNER'
  recipe: Recipe
}

interface Plan {
  id: string
  name: string
  slug: string
  description?: string
  tagline?: string
  whoIsItFor?: string
  keyPrinciples?: string[]
  whatIsAvoided?: string[]
  dietaryVariant: string
  tier: string
  category: string
  avgCaloriesPerDay: number
  avgProteinGrams: number
  avgCarbsGrams: number
  avgFatGrams: number
  cycleLengthDays: number
  mealsPerDay: number
}

interface Props {
  plan: Plan
  schedule: Record<number, Slot[]>
  day1Slots: Slot[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SLOT_LABEL: Record<string, string> = {
  BREAKFAST: 'Breakfast', LUNCH: 'Lunch', SNACK: 'Snack', DINNER: 'Dinner',
}
const SLOT_TIME: Record<string, string> = {
  BREAKFAST: '7:00 – 9:00 am', LUNCH: '12:30 – 2:00 pm',
  SNACK: '4:00 – 5:00 pm', DINNER: '7:00 – 8:30 pm',
}
const SLOT_EMOJI: Record<string, string> = {
  BREAKFAST: '🌅', LUNCH: '☀️', SNACK: '🍎', DINNER: '🌙',
}
const SLOT_COLOR: Record<string, string> = {
  BREAKFAST: '#f59e0b', LUNCH: '#a3e635', SNACK: '#38bdf8', DINNER: '#a78bfa',
}
const SLOT_GRADIENT: Record<string, string> = {
  BREAKFAST: 'linear-gradient(135deg, #f59e0b20, #f9731620)',
  LUNCH: 'linear-gradient(135deg, #a3e63520, #22c55e20)',
  SNACK: 'linear-gradient(135deg, #38bdf820, #818cf820)',
  DINNER: 'linear-gradient(135deg, #a78bfa20, #c084fc20)',
}

const PRICING = [
  { label: 'Trial Day', days: 1, price: 750, perDay: 750 },
  { label: '1 Week', days: 7, price: 4900, perDay: 700 },
  { label: '2 Weeks', days: 15, price: 9720, perDay: 648 },
  { label: '1 Month', days: 30, price: 16999, perDay: 567, popular: true },
  { label: '2 Months', days: 60, price: 33000, perDay: 550 },
  { label: '3 Months', days: 90, price: 47250, perDay: 525 },
]

const FAQ = [
  {
    q: 'How many meals do I get per day?',
    a: 'You get 4 meals daily — Breakfast, Lunch, Snack, and Dinner. Every box also includes your Morning Boost (a coffee or green tea sachet). All 4 meals are freshly prepared and delivered by 8am.',
  },
  {
    q: 'Is the 30-day menu really non-repeating?',
    a: 'Yes. Every meal plan has 30 unique days — 8 breakfast variations, 10 lunch variations, 5 snack variations, and 7 dinner variations rotating across the 30 days. No dish repeats in a full month.',
  },
  {
    q: 'How do I track what I eat?',
    a: 'After signing in, your dashboard shows today\'s 4 meals. Tap "I ate this" on any meal — it logs the macros automatically and updates your daily calorie ring. Every gram tracked without manual entry.',
  },
  {
    q: 'Can I skip a day or pause the plan?',
    a: 'Yes. You can skip individual dates or pause your plan from the dashboard. Paused days are added to your plan end date at no extra cost.',
  },
  {
    q: 'What time is delivery?',
    a: 'All meals are delivered by 8am daily. Delivery covers Kharadi and surrounding areas in Pune. We prep from 4am using fresh-sourced ingredients.',
  },
  {
    q: 'Can I switch to a different plan mid-month?',
    a: 'Yes. You can request a plan switch from your dashboard. The new plan starts from the next delivery day. Calorie targets are recalculated based on your current profile.',
  },
  {
    q: 'Is there a minimum commitment?',
    a: 'You can start with a Trial Day at ₹750 — no commitment. Weekly, bi-weekly, and monthly options are available. Longer plans give you a lower per-day rate.',
  },
  {
    q: 'What if I have allergies?',
    a: 'You declare allergies during onboarding (nuts, dairy, gluten, shellfish). These are flagged on your account and the kitchen accommodates them. See our Allergen Policy for full details.',
  },
]

// ─── Animated Counter Hook ──────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const start = performance.now()
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}

// ─── Scroll Reveal Hook ─────────────────────────────────────────────────────

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

// ─── 3D Tilt Component ──────────────────────────────────────────────────────

function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -6
    const rotateY = ((x - centerX) / centerX) * 6
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'
  }, [])

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)', willChange: 'transform' }}
    >
      {children}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlanDetailClient({ plan, schedule, day1Slots }: Props) {
  const [activeWeek, setActiveWeek] = useState(1)
  const [showFullCalendar, setShowFullCalendar] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [selectedPricing, setSelectedPricing] = useState(3)
  const [heroLoaded, setHeroLoaded] = useState(false)

  useScrollReveal()
  useEffect(() => { setHeroLoaded(true) }, [])

  const totalDays = Object.keys(schedule).length
  const weeks = [1, 2, 3, 4]
  const weekDays = Array.from({ length: 7 }, (_, i) => (activeWeek - 1) * 7 + i + 1).filter(
    (d) => d <= totalDays
  )

  const dietLabel =
    plan.dietaryVariant === 'VEG'
      ? '🌿 Vegetarian'
      : plan.dietaryVariant === 'EGG'
      ? '🥚 Eggetarian'
      : plan.dietaryVariant === 'NON_VEG'
      ? '🍗 Non-Vegetarian'
      : plan.dietaryVariant === 'JAIN'
      ? '🪷 Jain'
      : '🌱 Vegan'

  const calAnim = useAnimatedCounter(plan.avgCaloriesPerDay, 1200)
  const proAnim = useAnimatedCounter(plan.avgProteinGrams, 1200)

  return (
    <div
      style={{
        background: '#080808',
        color: '#fff',
        minHeight: '100vh',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* ── Global Styles & Animations ─────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --accent: #a3e635;
          --accent-dim: #a3e63520;
          --accent-glow: #a3e63540;
          --surface: #0e0e0e;
          --surface-elevated: #141414;
          --border: #1e1e1e;
          --border-hover: #2a2a2a;
          --text-primary: #ffffff;
          --text-secondary: #a0a0a0;
          --text-muted: #555555;
        }

        /* Animated gradient mesh background */
        .gradient-mesh {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 80% 50% at 20% 40%, #a3e63508 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, #38bdf808 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 50% 100%, #a3e63505 0%, transparent 50%);
          animation: meshShift 20s ease-in-out infinite alternate;
        }
        @keyframes meshShift {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(2%, -1%) scale(1.02); }
          66% { transform: translate(-1%, 2%) scale(0.98); }
          100% { transform: translate(1%, 1%) scale(1.01); }
        }

        /* Noise texture */
        .noise-overlay {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* Scroll reveal */
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s cubic-bezier(0.23, 1, 0.32, 1), transform 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .reveal-on-scroll.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }

        /* Hero entrance */
        .hero-enter {
          opacity: 0;
          transform: translateY(30px);
          animation: heroEnter 1s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        .hero-enter-delay-1 { animation-delay: 0.1s; }
        .hero-enter-delay-2 { animation-delay: 0.2s; }
        .hero-enter-delay-3 { animation-delay: 0.3s; }
        .hero-enter-delay-4 { animation-delay: 0.4s; }
        .hero-enter-delay-5 { animation-delay: 0.5s; }
        @keyframes heroEnter {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Glassmorphism */
        .glass {
          background: rgba(14, 14, 14, 0.6);
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .glass-strong {
          background: rgba(14, 14, 14, 0.85);
          backdrop-filter: blur(40px) saturate(1.6);
          -webkit-backdrop-filter: blur(40px) saturate(1.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        /* Glow effects */
        .glow-accent {
          box-shadow: 0 0 0 0 var(--accent-glow);
          transition: box-shadow 0.3s ease;
        }
        .glow-accent:hover {
          box-shadow: 0 0 30px var(--accent-glow), 0 0 60px var(--accent-dim);
        }

        /* Gradient border animation */
        .gradient-border {
          position: relative;
          background: var(--surface);
          border-radius: 16px;
          z-index: 1;
        }
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 17px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(163,230,53,0.3), rgba(56,189,248,0.1), rgba(163,230,53,0.1));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .gradient-border:hover::before {
          opacity: 1;
        }

        /* Shimmer effect for popular badge */
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%);
          animation: shimmer 3s infinite;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }

        /* Floating animation */
        .float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* Pulse glow for active elements */
        .pulse-glow {
          animation: pulseGlow 2s ease-in-out infinite;
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(163,230,53,0.15); }
          50% { box-shadow: 0 0 40px rgba(163,230,53,0.3); }
        }

        /* Section label underline animation */
        .section-label {
          position: relative;
          display: inline-block;
        }
        .section-label::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent), transparent);
          transition: width 0.6s ease;
        }
        .revealed .section-label::after {
          width: 40px;
        }

        /* Tab switch animation */
        .tab-switch {
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .tab-switch:hover {
          transform: translateY(-2px);
        }

        /* FAQ smooth height */
        .faq-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.5s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s ease, padding 0.4s ease;
          opacity: 0;
        }
        .faq-body.open {
          max-height: 500px;
          opacity: 1;
        }

        /* Responsive grids */
        .pd-hero-grid { display: grid; grid-template-columns: 1fr auto; gap: 48px; align-items: start; }
        .pd-hero-sidecard { display: flex; flex-direction: column; gap: 16px; }
        .pd-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .pd-two-col-top { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; }
        .pd-section { padding: 80px 24px; position: relative; z-index: 2; }
        .pd-hero-section { padding: 100px 24px 80px; position: relative; z-index: 2; }
        .pd-day-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
        .pd-macro-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }

        @media (max-width: 900px) {
          .pd-hero-grid { grid-template-columns: 1fr; gap: 32px; }
          .pd-hero-sidecard { display: none; }
        }
        @media (max-width: 768px) {
          .pd-two-col { grid-template-columns: 1fr; gap: 40px; }
          .pd-two-col-top { grid-template-columns: 1fr; gap: 40px; }
          .pd-section { padding: 56px 16px; }
          .pd-hero-section { padding: 56px 16px 48px; }
          .pd-day-grid { grid-template-columns: 1fr; }
          .pd-macro-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* Background effects */}
      <div className="gradient-mesh" />
      <div className="noise-overlay" />

      {/* ── Section 1: Hero ─────────────────────────────────────────────── */}
      <section className="pd-hero-section" style={{ maxWidth: 1120, margin: '0 auto', borderBottom: '1px solid #1a1a1a' }}>
        {/* Breadcrumb */}
        <div className={`hero-enter ${heroLoaded ? '' : ''}`} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 32, opacity: 0.5, fontSize: 13 }}>
          <Link href="/" style={{ color: '#fff', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#a3e635')} onMouseLeave={(e) => (e.currentTarget.style.color = '#fff')}>Home</Link>
          <span style={{ color: '#333' }}>/</span>
          <Link href="/plans" style={{ color: '#fff', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#a3e635')} onMouseLeave={(e) => (e.currentTarget.style.color = '#fff')}>Plans</Link>
          <span style={{ color: '#333' }}>/</span>
          <span style={{ color: '#a3e635' }}>{plan.name}</span>
        </div>

        <div className="pd-hero-grid">
          <div>
            {/* Tags */}
            <div className="hero-enter hero-enter-delay-1" style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <span style={{
                background: 'linear-gradient(135deg, #a3e63520, #a3e63510)',
                color: '#a3e635',
                border: '1px solid #a3e63540',
                borderRadius: 8,
                padding: '5px 14px',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                backdropFilter: 'blur(10px)',
              }}>
                Standard Plan
              </span>
              <span className="glass" style={{
                color: '#aaa',
                borderRadius: 8,
                padding: '5px 14px',
                fontSize: 12,
                fontWeight: 500,
              }}>
                {dietLabel}
              </span>
              <span className="glass" style={{
                color: '#aaa',
                borderRadius: 8,
                padding: '5px 14px',
                fontSize: 12,
                fontWeight: 500,
              }}>
                30-Day Plan
              </span>
            </div>

            {/* Headline */}
            <h1 className="hero-enter hero-enter-delay-2" style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 800,
              lineHeight: 1.05,
              marginBottom: 20,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {plan.name}
            </h1>

            <p className="hero-enter hero-enter-delay-3" style={{ fontSize: 18, lineHeight: 1.7, color: '#aaa', maxWidth: 560, marginBottom: 32 }}>
              {plan.tagline ?? plan.description ?? 'A personalised 30-day meal plan crafted to hit your exact calorie and macro targets — freshly cooked and delivered to your door by 8am daily.'}
            </p>

            {/* Key stats with animated counters */}
            <div className="hero-enter hero-enter-delay-4" style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 40 }}>
              <div ref={calAnim.ref}>
                <div style={{ fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#a3e635', lineHeight: 1 }}>
                  {calAnim.count}<span style={{ fontSize: 16, color: '#a3e63580' }}> kcal</span>
                </div>
                <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>Per Day</div>
              </div>
              <div ref={proAnim.ref}>
                <div style={{ fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#a3e635', lineHeight: 1 }}>
                  {proAnim.count}<span style={{ fontSize: 16, color: '#a3e63580' }}>g</span>
                </div>
                <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>Protein</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#a3e635', lineHeight: 1 }}>4</div>
                <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>Meals/Day</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#a3e635', lineHeight: 1 }}>30</div>
                <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>Day Menu</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="hero-enter hero-enter-delay-5" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link
                href="/onboarding"
                className="glow-accent"
                style={{
                  background: 'linear-gradient(135deg, #a3e635, #84cc16)',
                  color: '#080808',
                  padding: '15px 36px',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  letterSpacing: '0.02em',
                  transition: 'transform 0.2s, box-shadow 0.3s',
                  boxShadow: '0 4px 24px rgba(163,230,53,0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 40px rgba(163,230,53,0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(163,230,53,0.25)'
                }}
              >
                Start Your Plan <span>→</span>
              </Link>
              <a
                href="#pricing"
                className="glass"
                style={{
                  color: '#fff',
                  padding: '15px 32px',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.background = 'rgba(20,20,20,0.9)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.background = 'rgba(14,14,14,0.6)'
                }}
              >
                Trial Day ₹750
              </a>
            </div>
          </div>

          {/* Side card — glassmorphism */}
          <div className="pd-hero-sidecard float">
            <div className="glass-strong" style={{ borderRadius: 20, padding: 28, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #a3e635, #84cc16)' }} />
              <div style={{ fontSize: 12, color: '#555', marginBottom: 4, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>What you get</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 24, color: '#fff' }}>Every single day</div>
              {[
                { icon: '🥗', text: 'No dish repeats in 30 days' },
                { icon: '📦', text: 'Delivered by 8am daily' },
                { icon: '📲', text: 'Per-gram tracking on dashboard' },
                { icon: '🔁', text: 'Adaptive calorie recalibration' },
                { icon: '⭐', text: 'Rate meals — menu evolves' },
                { icon: '🫙', text: 'No frying · Olive oil only' },
              ].map((item, i) => (
                <div key={item.text} className="hero-enter" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, color: '#ccc', marginBottom: i < 5 ? 14 : 0, animationDelay: `${0.6 + i * 0.08}s` }}>
                  <span style={{ fontSize: 16, lineHeight: 1.4, filter: 'drop-shadow(0 0 4px rgba(163,230,53,0.3))' }}>{item.icon}</span>
                  <span style={{ lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Who Is This For ──────────────────────────────────── */}
      <section className="pd-section" style={{ maxWidth: 1120, margin: '0 auto', borderBottom: '1px solid #1a1a1a' }}>
        <div className="pd-two-col">
          <div className="reveal-on-scroll">
            <p className="section-label" style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
              Who Is This For
            </p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
              Built for people who are serious about results
            </h2>
            <p style={{ color: '#888', lineHeight: 1.8, fontSize: 15 }}>
              {plan.whoIsItFor ?? 'Not a quick fix. This is a 30-day system that works when you follow it. The food does the heavy lifting — you just eat it, tap "I ate this", and watch the data build.'}
            </p>
          </div>
          <div className="reveal-on-scroll reveal-delay-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { title: 'You want to lose weight without starving', desc: '1600 kcal/day with 4 filling meals. High protein keeps you satiated.' },
                { title: "You're tired of tracking manually", desc: 'Every meal pre-logged. Tap one button. Macros auto-populated.' },
                { title: 'You want Indian food, not rabbit food', desc: '80% regional Indian cuisine. Dal, sabzi, roti, rice — done right.' },
                { title: 'You want progress you can measure', desc: 'Weight trend, consistency score, calorie ring — all on your dashboard.' },
              ].map((item, i) => (
                <TiltCard key={item.title} className="gradient-border">
                  <div style={{
                    background: 'var(--surface)',
                    borderRadius: 16,
                    padding: '22px 20px',
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                    transition: 'background 0.3s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-elevated)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)' }}
                  >
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#a3e635', marginTop: 6, flexShrink: 0, boxShadow: '0 0 12px rgba(163,230,53,0.5)' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5, color: '#eee' }}>{item.title}</div>
                      <div style={{ color: '#666', fontSize: 13, lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: What You Get ─────────────────────────────────────── */}
      <section className="pd-section" style={{ maxWidth: 1120, margin: '0 auto', borderBottom: '1px solid #1a1a1a' }}>
        <div className="reveal-on-scroll" style={{ marginBottom: 48 }}>
          <p className="section-label" style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            What You Get
          </p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            4 meals. Every day. Delivered by 8am.
          </h2>
        </div>

        <div className="reveal-on-scroll reveal-delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
          {(['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'] as const).map((slot) => (
            <TiltCard key={slot}>
              <div
                style={{
                  background: SLOT_GRADIENT[slot],
                  border: `1px solid ${SLOT_COLOR[slot]}30`,
                  borderTop: `3px solid ${SLOT_COLOR[slot]}`,
                  borderRadius: 16,
                  padding: '28px 24px',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = `0 20px 40px ${SLOT_COLOR[slot]}15`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>{SLOT_EMOJI[slot]}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 4, color: '#fff' }}>
                  {SLOT_LABEL[slot]}
                </div>
                <div style={{ color: '#666', fontSize: 13, marginBottom: 16, fontWeight: 500 }}>{SLOT_TIME[slot]}</div>
                <div style={{ color: '#aaa', fontSize: 14, lineHeight: 1.7 }}>
                  {slot === 'BREAKFAST' && 'High-protein Indian breakfast. Moong chilla, poha variations, upma, idli — never boring, always filling.'}
                  {slot === 'LUNCH' && 'Full dal-sabzi-roti or rice meal. Designed around your largest calorie window of the day.'}
                  {slot === 'SNACK' && 'Low-calorie, high-satiety. Makhana, roasted chana, fruit bowls — keeps you from raiding the pantry at 6pm.'}
                  {slot === 'DINNER' && 'Light but satisfying. Lower carb, higher protein. Palak paneer, dal tadka, grilled options.'}
                </div>
              </div>
            </TiltCard>
          ))}
        </div>

        <div className="reveal-on-scroll reveal-delay-2" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', background: 'linear-gradient(135deg, #0e0e0e, #141414)', border: '1px solid #1e1e1e', borderRadius: 16 }}>
          <span style={{ fontSize: 24, filter: 'drop-shadow(0 0 8px rgba(163,230,53,0.3))' }}>☕</span>
          <div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#eee' }}>Every box includes your Morning Boost</span>
            <span style={{ color: '#555', fontSize: 14, marginLeft: 12 }}>
              A coffee sachet (Standard) — the one thing that makes opening the box feel like a ritual.
            </span>
          </div>
        </div>
      </section>

      {/* ── Section 4 + 5: 30-Day Menu ──────────────────────────────────── */}
      <section id="menu" className="pd-section" style={{ maxWidth: 1120, margin: '0 auto', borderBottom: '1px solid #1a1a1a' }}>
        <div className="reveal-on-scroll" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p className="section-label" style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
              The Full Menu
            </p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {totalDays} days. Zero repeats.
              <br />
              <span style={{ color: '#a3e635' }}>Every dish, every macro — right here.</span>
            </h2>
          </div>
          <div className="glass" style={{ fontSize: 13, color: '#555', maxWidth: 260, lineHeight: 1.6, padding: '12px 16px', borderRadius: 12 }}>
            No auth wall. No blur. The full menu is public — because the food is the proof.
          </div>
        </div>

        {/* Week tabs */}
        <div className="reveal-on-scroll reveal-delay-1" style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {weeks.map((w) => (
            <button
              key={w}
              onClick={() => { setActiveWeek(w); setShowFullCalendar(false); }}
              className="tab-switch"
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: activeWeek === w ? '1px solid #a3e635' : '1px solid #222',
                background: activeWeek === w ? 'linear-gradient(135deg, #a3e63520, #a3e63510)' : 'transparent',
                color: activeWeek === w ? '#a3e635' : '#666',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: activeWeek === w ? '0 4px 20px rgba(163,230,53,0.15)' : 'none',
              }}
            >
              Week {w}
            </button>
          ))}
          <button
            onClick={() => setShowFullCalendar(!showFullCalendar)}
            className="tab-switch"
            style={{
              padding: '10px 24px',
              borderRadius: 10,
              border: showFullCalendar ? '1px solid #a3e635' : '1px solid #222',
              background: showFullCalendar ? 'linear-gradient(135deg, #a3e63520, #a3e63510)' : 'transparent',
              color: showFullCalendar ? '#a3e635' : '#666',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              marginLeft: 'auto',
              transition: 'all 0.3s',
              boxShadow: showFullCalendar ? '0 4px 20px rgba(163,230,53,0.15)' : 'none',
            }}
          >
            {showFullCalendar ? '▲ Collapse all 30 days' : '▼ See all 30 days'}
          </button>
        </div>

        {/* Week view */}
        {!showFullCalendar && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {weekDays.map((day) => {
              const daySlots = schedule[day] ?? []
              return (
                <div
                  key={day}
                  className="reveal-on-scroll"
                  style={{
                    background: 'linear-gradient(135deg, #0d0d0d, #111)',
                    border: '1px solid #1a1a1a',
                    borderRadius: 16,
                    overflow: 'hidden',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2a2a2a'
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1a1a1a'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: '#fff' }}>Day {day}</span>
                    <span style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                      {daySlots.reduce((sum, s) => sum + s.recipe.caloriesPerServing, 0)} kcal total
                    </span>
                  </div>
                  <div className="pd-day-grid">
                    {daySlots.map((slot, i) => (
                      <div
                        key={slot.id}
                        style={{
                          padding: '18px 20px',
                          borderRight: i < daySlots.length - 1 ? '1px solid #1a1a1a' : 'none',
                          transition: 'background 0.3s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(163,230,53,0.03)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 16 }}>{SLOT_EMOJI[slot.mealSlot]}</span>
                          <span style={{ fontSize: 11, color: SLOT_COLOR[slot.mealSlot], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {SLOT_LABEL[slot.mealSlot]}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, lineHeight: 1.4, color: '#eee' }}>{slot.recipe.name}</div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#666' }}>
                          <span style={{ color: '#a3e635', fontWeight: 600 }}>{slot.recipe.caloriesPerServing} kcal</span>
                          <span>{slot.recipe.proteinGrams}g P</span>
                          <span>{slot.recipe.carbsGrams}g C</span>
                          <span>{slot.recipe.fatGrams}g F</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Full 30-day calendar */}
        {showFullCalendar && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
              const daySlots = schedule[day] ?? []
              return (
                <div
                  key={day}
                  className="reveal-on-scroll"
                  style={{
                    background: 'linear-gradient(135deg, #0d0d0d, #111)',
                    border: '1px solid #161616',
                    borderRadius: 12,
                    overflow: 'hidden',
                    transition: 'border-color 0.3s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#222' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#161616' }}
                >
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #161616', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: '#fff' }}>Day {day}</span>
                    <span style={{ fontSize: 12, color: '#444', fontWeight: 600 }}>
                      {daySlots.reduce((sum, s) => sum + s.recipe.caloriesPerServing, 0)} kcal
                    </span>
                  </div>
                  <div className="pd-day-grid">
                    {daySlots.map((slot, i) => (
                      <div
                        key={slot.id}
                        style={{
                          padding: '14px 16px',
                          borderRight: i < daySlots.length - 1 ? '1px solid #161616' : 'none',
                          transition: 'background 0.3s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(163,230,53,0.03)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <div style={{ fontSize: 10, color: SLOT_COLOR[slot.mealSlot], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                          {SLOT_EMOJI[slot.mealSlot]} {SLOT_LABEL[slot.mealSlot]}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, lineHeight: 1.3, color: '#ddd' }}>{slot.recipe.name}</div>
                        <div style={{ fontSize: 11, color: '#555' }}>
                          {slot.recipe.caloriesPerServing} kcal · {slot.recipe.proteinGrams}g P
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Section 5b: Day 1 full recipe ───────────────────────────────── */}
      {day1Slots.length > 0 && (
        <section className="pd-section" style={{ maxWidth: 1120, margin: '0 auto', borderBottom: '1px solid #1a1a1a' }}>
          <div className="reveal-on-scroll" style={{ marginBottom: 40 }}>
            <p className="section-label" style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
              Day 1 Preview
            </p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Here's exactly what arrives on Day 1
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {day1Slots.map((slot, i) => (
              <div
                key={slot.id}
                className={`reveal-on-scroll reveal-delay-${Math.min(i + 1, 4)}`}
                style={{
                  background: 'linear-gradient(135deg, #0e0e0e, #141414)',
                  border: `1px solid ${SLOT_COLOR[slot.mealSlot]}25`,
                  borderTop: `3px solid ${SLOT_COLOR[slot.mealSlot]}`,
                  borderRadius: 16,
                  padding: '28px 24px',
                  transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)'
                  e.currentTarget.style.boxShadow = `0 24px 48px ${SLOT_COLOR[slot.mealSlot]}15`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: SLOT_GRADIENT[slot.mealSlot],
                    border: `1px solid ${SLOT_COLOR[slot.mealSlot]}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>
                    {SLOT_EMOJI[slot.mealSlot]}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: SLOT_COLOR[slot.mealSlot], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {SLOT_LABEL[slot.mealSlot]}
                    </div>
                    <div style={{ fontSize: 11, color: '#555' }}>{SLOT_TIME[slot.mealSlot]}</div>
                  </div>
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 8, lineHeight: 1.3, color: '#fff' }}>
                  {slot.recipe.name}
                </div>
                {slot.recipe.description && (
                  <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 16 }}>{slot.recipe.description}</div>
                )}
                <div className="pd-macro-grid">
                  {[
                    { label: 'kcal', value: slot.recipe.caloriesPerServing, color: '#a3e635' },
                    { label: 'Protein', value: `${slot.recipe.proteinGrams}g`, color: '#f59e0b' },
                    { label: 'Carbs', value: `${slot.recipe.carbsGrams}g`, color: '#38bdf8' },
                    { label: 'Fat', value: `${slot.recipe.fatGrams}g`, color: '#f472b6' },
                  ].map((m) => (
                    <div
                      key={m.label}
                      style={{
                        background: 'linear-gradient(135deg, #161616, #1a1a1a)',
                        borderRadius: 10,
                        padding: '10px 8px',
                        textAlign: 'center',
                        border: '1px solid #1e1e1e',
                        transition: 'border-color 0.3s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = m.color + '40' }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e1e1e' }}
                    >
                      <div style={{ color: m.color, fontWeight: 800, fontSize: 15, fontFamily: "'Syne', sans-serif" }}>{m.value}</div>
                      <div style={{ color: '#555', fontSize: 10, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#555', flexWrap: 'wrap', marginTop: 4 }}>
                  {slot.recipe.cuisineType && <span>🍽 {slot.recipe.cuisineType}</span>}
                  {slot.recipe.prepTimeMins && <span>⏱ {slot.recipe.prepTimeMins + (slot.recipe.cookTimeMins ?? 0)} min</span>}
                  {slot.recipe.servingSizeGrams && <span>⚖️ {slot.recipe.servingSizeGrams}g serving</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Section 6: Nutritional Principles ───────────────────────────── */}
      <section className="pd-section" style={{ maxWidth: 1120, margin: '0 auto', borderBottom: '1px solid #1a1a1a' }}>
        <div className="pd-two-col-top">
          <div className="reveal-on-scroll">
            <p className="section-label" style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
              Nutritional Principles
            </p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
              What goes into every meal
            </h2>
            <p style={{ color: '#777', lineHeight: 1.8, fontSize: 14, marginBottom: 24 }}>
              {plan.avgCaloriesPerDay} kcal/day is a science-backed deficit for sustainable fat loss — aggressive enough to produce results, conservative enough to preserve muscle and energy.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(plan.keyPrinciples?.length ? plan.keyPrinciples : [
                'High protein (preserves muscle during deficit)',
                'Moderate complex carbs (dal, roti, rice — not eliminated)',
                'Low saturated fat (olive oil only, no frying)',
                'High fibre (keeps you full, gut health)',
                'Zero refined sugar in plan meals',
                'Sourced from Pune APMC — no imported ingredients',
              ]).map((item) => (
                <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, color: '#ccc' }}>
                  <span style={{ color: '#a3e635', fontWeight: 800, fontSize: 18, lineHeight: 1, marginTop: 1 }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal-on-scroll reveal-delay-2">
            <p className="section-label" style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
              Not Included
            </p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
              What we deliberately leave out
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(plan.whatIsAvoided?.length ? plan.whatIsAvoided : [
                'No international-only ingredients (tahini, miso, couscous, avocado)',
                'No deep-fried foods',
                'No refined sugar or maida',
                'No artificial flavours or preservatives',
                'No heavy cream or full-fat cheeses in base meals',
                'No mystery macros — every gram is declared',
              ]).map((item) => (
                <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, color: '#666' }}>
                  <span style={{ color: '#ef4444', fontWeight: 800, fontSize: 18, lineHeight: 1, marginTop: 1 }}>✕</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 7: Per-Gram Tracking ─────────────────────────────────── */}
      <section className="pd-section" style={{ maxWidth: 1120, margin: '0 auto', borderBottom: '1px solid #1a1a1a' }}>
        <div className="pd-two-col">
          {/* Dashboard mockup */}
          <div className="reveal-on-scroll">
            <div className="glass-strong" style={{ borderRadius: 20, padding: 28, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #a3e635, #84cc16)' }} />
              <div style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Today's Meals — Day 3 of 30</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: '#fff' }}>Weight Loss Veg · Standard</div>
              </div>
              {[
                { slot: 'BREAKFAST', name: 'Moong Dal Chilla', cal: 289, done: true },
                { slot: 'LUNCH', name: 'Rajma Masala + Roti', cal: 380, done: true },
                { slot: 'SNACK', name: 'Makhana Chaat', cal: 156, done: false },
                { slot: 'DINNER', name: 'Palak Paneer + Jowar Roti', cal: 360, done: false },
              ].map((m) => (
                <div
                  key={m.slot}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #141414',
                    opacity: m.done ? 1 : 0.6,
                    transition: 'opacity 0.3s',
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: SLOT_GRADIENT[m.slot],
                      border: `1px solid ${SLOT_COLOR[m.slot]}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    }}>
                      {SLOT_EMOJI[m.slot]}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: SLOT_COLOR[m.slot], fontWeight: 700, marginBottom: 2 }}>{SLOT_LABEL[m.slot]}</div>
                      <div style={{ fontSize: 13, color: m.done ? '#fff' : '#777' }}>{m.name}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: '#a3e635', fontWeight: 700 }}>{m.cal} kcal</div>
                    {m.done ? (
                      <div style={{ fontSize: 10, color: '#4ade80', marginTop: 2, fontWeight: 600 }}>✓ Logged</div>
                    ) : (
                      <div className="glass" style={{ fontSize: 10, color: '#888', marginTop: 2, padding: '3px 10px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.3s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
                      >
                        I ate this
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#555', marginBottom: 8, fontWeight: 600 }}>
                  <span>669 / 1600 kcal</span>
                  <span style={{ color: '#a3e635' }}>42%</span>
                </div>
                <div style={{ height: 8, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    width: '42%', height: '100%',
                    background: 'linear-gradient(90deg, #a3e635, #84cc16)',
                    borderRadius: 4,
                    boxShadow: '0 0 12px rgba(163,230,53,0.4)',
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            </div>
          </div>

          <div className="reveal-on-scroll reveal-delay-2">
            <p className="section-label" style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
              The Tracking System
            </p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 28, letterSpacing: '-0.02em' }}>
              One tap. Every macro logged.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                { title: 'No manual entry', desc: 'Every meal pre-loaded. Tap "I ate this" and the macros auto-populate in your diary.' },
                { title: 'Calorie ring updates live', desc: 'Your dashboard shows calories in vs target in real time. Add a workout and the ring adjusts for net calories.' },
                { title: 'Consistency score', desc: "Your weekly 0–100 score tracks meals logged, workouts done, and weigh-ins. It's the number your AI trainer watches." },
              ].map((item, i) => (
                <div key={item.title} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'linear-gradient(135deg, #a3e63520, #a3e63510)',
                    border: '1px solid #a3e63530',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, boxShadow: '0 4px 12px rgba(163,230,53,0.1)',
                  }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#a3e635', boxShadow: '0 0 8px rgba(163,230,53,0.5)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 5, fontSize: 16, color: '#eee' }}>{item.title}</div>
                    <div style={{ color: '#666', fontSize: 14, lineHeight: 1.7 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 8: Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="pd-section" style={{ maxWidth: 1120, margin: '0 auto', borderBottom: '1px solid #1a1a1a' }}>
        <div className="reveal-on-scroll" style={{ marginBottom: 48 }}>
          <p className="section-label" style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            Pricing
          </p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 12, letterSpacing: '-0.02em' }}>
            Start with a trial. Stay for the results.
          </h2>
          <p style={{ color: '#666', fontSize: 15 }}>All 4 meals included. 4am prep. Delivered by 8am. No delivery charge.</p>
        </div>

        <div className="reveal-on-scroll reveal-delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
          {PRICING.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setSelectedPricing(i)}
              className={p.popular ? 'shimmer' : ''}
              style={{
                background: selectedPricing === i ? 'linear-gradient(135deg, #a3e63520, #a3e63510)' : 'linear-gradient(135deg, #0d0d0d, #111)',
                border: selectedPricing === i ? '2px solid #a3e635' : '1px solid #1e1e1e',
                borderRadius: 16,
                padding: '24px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                boxShadow: selectedPricing === i ? '0 8px 32px rgba(163,230,53,0.15)' : 'none',
                transform: selectedPricing === i ? 'translateY(-4px)' : 'translateY(0)',
              }}
              onMouseEnter={(e) => {
                if (selectedPricing !== i) {
                  e.currentTarget.style.borderColor = '#2a2a2a'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPricing !== i) {
                  e.currentTarget.style.borderColor = '#1e1e1e'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              {p.popular && (
                <div style={{
                  position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #a3e635, #84cc16)',
                  color: '#080808', fontSize: 10, fontWeight: 800,
                  padding: '4px 14px', borderRadius: 20,
                  letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(163,230,53,0.3)',
                }}>
                  Most Popular
                </div>
              )}
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: selectedPricing === i ? '#a3e635' : '#fff', marginBottom: 8 }}>
                {p.label}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4, fontFamily: "'Syne', sans-serif" }}>
                ₹{p.price.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 12, color: '#555', fontWeight: 500 }}>₹{p.perDay}/day</div>
            </button>
          ))}
        </div>

        {/* Selected plan CTA */}
        <div className="reveal-on-scroll reveal-delay-2 pulse-glow" style={{
          background: 'linear-gradient(135deg, #0d0d0d, #141414)',
          border: '1px solid #1e1e1e',
          borderRadius: 20,
          padding: '32px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #a3e635, #84cc16)' }} />
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 26, color: '#fff', lineHeight: 1 }}>
              {PRICING[selectedPricing].label} Plan
            </div>
            <div style={{ color: '#666', fontSize: 14, marginTop: 6 }}>
              {PRICING[selectedPricing].days} {PRICING[selectedPricing].days === 1 ? 'day' : 'days'} · All 4 meals · Delivered daily ·{' '}
              ₹{PRICING[selectedPricing].perDay}/day
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#a3e635', fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>
                ₹{PRICING[selectedPricing].price.toLocaleString('en-IN')}
              </div>
            </div>
            <Link
              href="/onboarding"
              style={{
                background: 'linear-gradient(135deg, #a3e635, #84cc16)',
                color: '#080808',
                padding: '16px 32px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 15,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 24px rgba(163,230,53,0.3)',
                transition: 'transform 0.2s, box-shadow 0.3s',
                display: 'inline-block',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 40px rgba(163,230,53,0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(163,230,53,0.3)'
              }}
            >
              Order Now →
            </Link>
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#444', marginTop: 20, textAlign: 'center' }}>
          PayU · UPI · Credit/Debit Card · Cash on Delivery available
        </p>
      </section>

      {/* ── Section 9: Meal Feedback Loop ───────────────────────────────── */}
      <section className="pd-section" style={{ maxWidth: 1120, margin: '0 auto', borderBottom: '1px solid #1a1a1a', textAlign: 'center' }}>
        <div className="reveal-on-scroll" style={{ marginBottom: 48 }}>
          <p className="section-label" style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            Living Menu
          </p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Rate your meals. The menu evolves.
          </h2>
          <p style={{ color: '#666', maxWidth: 540, margin: '0 auto', lineHeight: 1.8, fontSize: 15 }}>
            Every "I ate this" tap asks for a 1–5 star rating. Low-rated dishes get flagged and replaced. After 30 days, the menu is smarter than when you started.
          </p>
        </div>
        <div className="reveal-on-scroll reveal-delay-1" style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[
            { icon: '⭐', label: 'Rate every meal', sub: '1–5 stars, optional note' },
            { icon: '📊', label: 'Data aggregates', sub: 'Per-recipe avg rating tracked' },
            { icon: '🔄', label: 'Menu improves', sub: 'Low-rated recipes replaced monthly' },
          ].map((item, i) => (
            <div key={item.label} style={{ textAlign: 'center', maxWidth: 200 }}>
              <div style={{
                fontSize: 40, marginBottom: 16,
                filter: 'drop-shadow(0 8px 16px rgba(163,230,53,0.15))',
                animation: `float 6s ease-in-out ${i * 0.5}s infinite`,
              }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: '#eee' }}>{item.label}</div>
              <div style={{ color: '#555', fontSize: 13, lineHeight: 1.6 }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 10: Testimonials ─────────────────────────────────────── */}
      <section className="pd-section" style={{ maxWidth: 1120, margin: '0 auto', borderBottom: '1px solid #1a1a1a' }}>
        <div className="reveal-on-scroll" style={{ marginBottom: 48 }}>
          <p className="section-label" style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            Results
          </p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Real people. Real data.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {[
            {
              name: 'Priya M.',
              location: 'Kharadi, Pune',
              result: '-6.2 kg in 30 days',
              text: "I've tried every diet. This is the first time I didn't have to think. The food just showed up, I logged it, and the numbers moved.",
              stars: 5,
            },
            {
              name: 'Rahul S.',
              location: 'Viman Nagar, Pune',
              result: '-4.8 kg · consistency 91%',
              text: 'The tracking is what got me. Seeing my consistency score go from 60 to 91 over 4 weeks changed how I think about habits.',
              stars: 5,
            },
            {
              name: 'Sneha K.',
              location: 'Koregaon Park, Pune',
              result: '30 days completed',
              text: "I was skeptical about tiffin food. But these aren't tiffin portions — they're full meals with proper macros. Rajma and dal are genuinely good.",
              stars: 5,
            },
          ].map((t, i) => (
            <TiltCard key={t.name}>
              <div className={`reveal-on-scroll reveal-delay-${i + 1}`} style={{
                background: 'linear-gradient(135deg, #0e0e0e, #141414)',
                border: '1px solid #1e1e1e',
                borderRadius: 20,
                padding: '32px 28px',
                height: '100%',
                transition: 'border-color 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2a2a2a'
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1e1e1e'
                e.currentTarget.style.boxShadow = 'none'
              }}
              >
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <span key={si} style={{ color: '#a3e635', fontSize: 14, filter: 'drop-shadow(0 0 4px rgba(163,230,53,0.3))' }}>★</span>
                  ))}
                </div>
                <div style={{ fontSize: 15, lineHeight: 1.75, color: '#bbb', marginBottom: 24, fontStyle: 'italic' }}>
                  "{t.text}"
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#eee' }}>{t.name}</div>
                    <div style={{ color: '#555', fontSize: 12, marginTop: 2 }}>{t.location}</div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #a3e63520, #a3e63510)',
                    color: '#a3e635', border: '1px solid #a3e63530',
                    borderRadius: 100, padding: '6px 16px', fontSize: 12, fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(163,230,53,0.1)',
                  }}>
                    {t.result}
                  </div>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ── Section 11: FAQ ──────────────────────────────────────────────── */}
      <section className="pd-section" style={{ maxWidth: 1120, margin: '0 auto', borderBottom: '1px solid #1a1a1a' }}>
        <div className="reveal-on-scroll" style={{ marginBottom: 48 }}>
          <p className="section-label" style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            FAQ
          </p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Common questions
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQ.map((item, i) => (
            <div
              key={i}
              className="reveal-on-scroll"
              style={{
                background: 'linear-gradient(135deg, #0d0d0d, #111)',
                border: '1px solid #1a1a1a',
                borderRadius: 14,
                overflow: 'hidden',
                transition: 'border-color 0.3s',
              }}
              onMouseEnter={(e) => { if (openFaq !== i) e.currentTarget.style.borderColor = '#222' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a1a1a' }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%',
                  padding: '22px 28px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 15,
                  fontFamily: "'DM Sans', sans-serif",
                  gap: 16,
                  transition: 'color 0.3s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#a3e635' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = openFaq === i ? '#a3e635' : '#fff' }}
              >
                <span>{item.q}</span>
                <span style={{
                  color: '#a3e635',
                  fontSize: 22,
                  fontWeight: 300,
                  flexShrink: 0,
                  transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                  transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)',
                  display: 'inline-block',
                }}>+</span>
              </button>
              <div className={`faq-body ${openFaq === i ? 'open' : ''}`} style={{ padding: openFaq === i ? '0 28px 24px' : '0 28px' }}>
                <div style={{ color: '#888', fontSize: 14, lineHeight: 1.8 }}>
                  {item.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 12: Final CTA ────────────────────────────────────────── */}
      <section className="pd-section" style={{ maxWidth: 1120, margin: '0 auto', textAlign: 'center', paddingBottom: 120 }}>
        <div className="reveal-on-scroll">
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 900,
            lineHeight: 1.05,
            marginBottom: 20,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #ffffff 0%, #a3e635 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Start eating right tomorrow.
            <br />
            <span style={{ WebkitTextFillColor: '#a3e635' }}>Not next Monday.</span>
          </h2>
          <p style={{ color: '#666', fontSize: 16, marginBottom: 48, lineHeight: 1.7, maxWidth: 500, margin: '0 auto 48px' }}>
            Complete onboarding in 2 minutes. Your calorie target is calculated automatically.
            <br />
            First delivery next morning.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            <Link
              href="/onboarding"
              style={{
                background: 'linear-gradient(135deg, #a3e635, #84cc16)',
                color: '#080808',
                padding: '18px 44px',
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 16,
                textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(163,230,53,0.35)',
                transition: 'transform 0.2s, box-shadow 0.3s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(163,230,53,0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(163,230,53,0.35)'
              }}
            >
              Start Your Plan →
            </Link>
            <a
              href={`https://wa.me/91XXXXXXXXXX?text=Hi, I want to know more about the ${encodeURIComponent(plan.name)} plan`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                color: '#fff',
                padding: '18px 36px',
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 8px 32px rgba(37,211,102,0.25)',
                transition: 'transform 0.2s, box-shadow 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(37,211,102,0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,211,102,0.25)'
              }}
            >
              💬 WhatsApp Us
            </a>
          </div>
          <p style={{ fontSize: 12, color: '#333' }}>
            FSSAI License: 21523035002815 · Pune, Maharashtra
          </p>
        </div>
      </section>
    </div>
  )
}