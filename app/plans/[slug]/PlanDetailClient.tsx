'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Recipe {
  id: string
  name: string
  slug: string
  description?: string
  shortDescription?: string
  caloriesPerServing: number
  proteinGrams: number | string
  carbsGrams: number | string
  fatGrams: number | string
  fibreGrams?: number | string
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
  accentColor?: string
}

interface Props {
  plan: Plan
  schedule: Record<number, Slot[]>
  day1Slots: Slot[]
}

const SLOT_LABEL: Record<string, string> = { BREAKFAST: 'Breakfast', LUNCH: 'Lunch', SNACK: 'Snack', DINNER: 'Dinner' }
const SLOT_TIME: Record<string, string> = { BREAKFAST: '7:00 – 9:00 am', LUNCH: '12:30 – 2:00 pm', SNACK: '4:00 – 5:00 pm', DINNER: '7:00 – 8:30 pm' }
const SLOT_COLOR: Record<string, string> = { BREAKFAST: '#f59e0b', LUNCH: '#a3e635', SNACK: '#38bdf8', DINNER: '#c084fc' }
const SLOT_BG: Record<string, string> = { BREAKFAST: '#f59e0b18', LUNCH: '#a3e63518', SNACK: '#38bdf818', DINNER: '#c084fc18' }

const PRICING = [
  { label: 'Trial', sub: '1 day', days: 1, price: 750, perDay: 750 },
  { label: '1 Week', sub: '7 days', days: 7, price: 4900, perDay: 700 },
  { label: '2 Weeks', sub: '15 days', days: 15, price: 9720, perDay: 648 },
  { label: '1 Month', sub: '30 days', days: 30, price: 16999, perDay: 567, popular: true },
  { label: '2 Months', sub: '60 days', days: 60, price: 33000, perDay: 550 },
  { label: '3 Months', sub: '90 days', days: 90, price: 47250, perDay: 525 },
]

const FAQ = [
  { q: 'How many meals per day?', a: '4 meals daily — Breakfast, Lunch, Snack, Dinner. Every box also includes your Morning Boost (coffee sachet). All freshly prepped and delivered by 8am.' },
  { q: 'Is the 30-day menu really non-repeating?', a: 'Yes. 8 breakfast variations, 10 lunch, 5 snack, 7 dinner — rotating across 30 days. No dish repeats in a full month.' },
  { q: 'How does tracking work?', a: 'Every meal is pre-loaded in your dashboard. Tap "I ate this" — macros auto-populate. Your calorie ring updates instantly. Zero manual entry.' },
  { q: 'Can I skip or pause?', a: 'Yes. Skip individual dates or pause from the dashboard. Paused days extend your end date at no extra cost.' },
  { q: 'What time is delivery?', a: 'By 8am daily. Kharadi and surrounding areas in Pune. 4am kitchen start, fresh-sourced every day.' },
  { q: 'Can I switch plans mid-month?', a: 'Yes. Plan switch from dashboard — new plan starts next delivery. Calorie targets recalculated for your current profile.' },
  { q: 'Minimum commitment?', a: 'Trial Day at ₹750 — zero commitment. Weekly and monthly options available. Longer plans unlock lower per-day rates.' },
  { q: 'What about allergies?', a: 'Declare during onboarding — nuts, dairy, gluten, shellfish. Flagged on your account, kitchen accommodates. See Allergen Policy.' },
]

export default function PlanDetailClient({ plan, schedule, day1Slots }: Props) {
  const [activeWeek, setActiveWeek] = useState(1)
  const [showFullCalendar, setShowFullCalendar] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [selectedPricing, setSelectedPricing] = useState(3)
  const [mounted, setMounted] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const totalDays = Object.keys(schedule).length
  const weekDays = Array.from({ length: 7 }, (_, i) => (activeWeek - 1) * 7 + i + 1).filter(d => d <= totalDays)
  const g = (v: number | string) => Math.round(Number(v))

  const dietLabel = plan.dietaryVariant === 'VEG' ? 'Vegetarian' : plan.dietaryVariant === 'EGG' ? 'Eggetarian' : plan.dietaryVariant === 'NON_VEG' ? 'Non-Veg' : plan.dietaryVariant === 'JAIN' ? 'Jain' : 'Vegan'
  const dietDot = plan.dietaryVariant === 'VEG' || plan.dietaryVariant === 'JAIN' || plan.dietaryVariant === 'VEGAN' ? '#4ade80' : plan.dietaryVariant === 'EGG' ? '#fbbf24' : '#f87171'

  return (
    <div style={{ background: '#060606', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ff-wrap { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        /* ── Noise texture overlay ── */
        .ff-noise::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.025;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Glow orbs ── */
        .ff-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Hero ── */
        .ff-hero {
          position: relative;
          padding: 100px 0 80px;
          overflow: hidden;
          border-bottom: 1px solid #151515;
        }
        @media (max-width: 768px) { .ff-hero { padding: 64px 0 56px; } }

        .ff-hero-inner {
          position: relative; z-index: 1;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 64px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .ff-hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .ff-hero-card { display: none; }
        }

        /* ── Stats strip ── */
        .ff-stats { display: flex; gap: 40px; flex-wrap: wrap; margin: 36px 0 40px; }
        .ff-stat-val { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 900; line-height: 1; color: #a3e635; letter-spacing: -0.02em; }
        .ff-stat-lbl { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; }

        /* ── Section header ── */
        .ff-label { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #a3e635; margin-bottom: 12px; }
        .ff-h2 { font-family: 'Syne', sans-serif; font-size: clamp(28px, 4vw, 48px); font-weight: 800; line-height: 1.05; letter-spacing: -0.02em; }
        .ff-section { padding: 88px 0; border-bottom: 1px solid #111; position: relative; overflow: hidden; }
        @media (max-width: 768px) { .ff-section { padding: 56px 0; } }

        /* ── Two-col layout ── */
        .ff-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        @media (max-width: 768px) { .ff-2col { grid-template-columns: 1fr; gap: 48px; } }

        /* ── Tags ── */
        .ff-tag {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 100px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
          border: 1px solid;
        }

        /* ── CTA buttons ── */
        .ff-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #a3e635; color: #060606;
          padding: 16px 36px; border-radius: 100px;
          font-weight: 700; font-size: 15px; text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 0 0 #a3e63540;
        }
        .ff-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px #a3e63530; }

        .ff-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #fff;
          padding: 16px 32px; border-radius: 100px;
          font-weight: 600; font-size: 15px; text-decoration: none;
          border: 1px solid #2a2a2a;
          transition: border-color 0.2s, background 0.2s;
        }
        .ff-btn-ghost:hover { border-color: #444; background: #111; }

        /* ── Meal slot cards ── */
        .ff-slot-card {
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #1a1a1a;
          background: #0c0c0c;
          transition: transform 0.2s, border-color 0.2s;
          position: relative;
          overflow: hidden;
        }
        .ff-slot-card:hover { transform: translateY(-3px); border-color: #282828; }
        .ff-slot-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          border-radius: 16px 16px 0 0;
        }

        /* ── Day row ── */
        .ff-day-row { border-radius: 12px; border: 1px solid #141414; background: #0a0a0a; overflow: hidden; margin-bottom: 8px; transition: border-color 0.15s; }
        .ff-day-row:hover { border-color: #1e1e1e; }
        .ff-day-meals { display: grid; grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 640px) { .ff-day-meals { grid-template-columns: repeat(2, 1fr); } }

        /* ── Macro pill ── */
        .ff-macro { display: flex; flex-direction: column; align-items: center; background: #111; border-radius: 10px; padding: 10px 8px; }
        .ff-macro-val { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 800; line-height: 1; }
        .ff-macro-lbl { font-size: 10px; color: #555; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.06em; }

        /* ── Pricing card ── */
        .ff-price-card {
          background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 14px;
          padding: 20px 16px; cursor: pointer; text-align: left;
          transition: all 0.2s; position: relative;
        }
        .ff-price-card:hover { border-color: #333; }
        .ff-price-card.active { background: #0f1a00; border-color: #a3e635; box-shadow: 0 0 0 1px #a3e63540; }
        .ff-price-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 28px; }
        @media (max-width: 640px) { .ff-price-grid { grid-template-columns: repeat(2, 1fr); } }

        /* ── FAQ ── */
        .ff-faq-item { border-bottom: 1px solid #141414; }
        .ff-faq-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 22px 0; background: none; border: none; color: #fff; font-size: 16px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; text-align: left; gap: 16px; }
        .ff-faq-body { padding-bottom: 20px; color: #777; font-size: 14px; line-height: 1.8; }

        /* ── Dashboard mockup ── */
        .ff-mock { background: #0c0c0c; border: 1px solid #1e1e1e; border-radius: 20px; padding: 24px; overflow: hidden; }
        .ff-mock-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #131313; }
        .ff-mock-row:last-child { border-bottom: none; }

        /* ── Scroll fade in ── */
        .ff-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .ff-reveal.visible { opacity: 1; transform: translateY(0); }

        /* ── Animated count number ── */
        @keyframes ff-count { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .ff-count { animation: ff-count 0.5s ease both; }

        /* ── Horizontal scroll pills ── */
        .ff-week-tabs { display: flex; gap: 8px; margin-bottom: 28px; flex-wrap: wrap; }
        .ff-week-tab { padding: 8px 20px; border-radius: 100px; border: 1px solid #1e1e1e; background: transparent; color: #666; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
        .ff-week-tab:hover { color: #aaa; border-color: #333; }
        .ff-week-tab.active { background: #a3e6351a; border-color: #a3e635; color: #a3e635; }

        /* ── Who-is section bullet ── */
        .ff-bullet { display: flex; gap: 16px; padding: 20px; background: #0a0a0a; border: 1px solid #141414; border-radius: 14px; margin-bottom: 12px; transition: border-color 0.15s; }
        .ff-bullet:hover { border-color: #222; }
        .ff-bullet-dot { width: 10px; height: 10px; border-radius: 50%; background: #a3e635; flex-shrink: 0; margin-top: 5px; box-shadow: 0 0 8px #a3e63580; }

        /* ── Testimonial card ── */
        .ff-testi { background: #0a0a0a; border: 1px solid #141414; border-radius: 18px; padding: 28px; position: relative; overflow: hidden; }
        .ff-testi::after { content: '"'; position: absolute; top: -20px; right: 20px; font-size: 160px; font-family: 'Syne', sans-serif; color: #a3e63508; font-weight: 900; line-height: 1; pointer-events: none; }

        /* ── Bottom CTA ── */
        .ff-cta-section { padding: 100px 0 120px; text-align: center; position: relative; overflow: hidden; }
        @media (max-width: 768px) { .ff-cta-section { padding: 72px 0 88px; } }

        /* ── Principles grid ── */
        .ff-principles-col { display: flex; flex-direction: column; gap: 14px; }
        .ff-principle { display: flex; gap: 12px; align-items: flex-start; font-size: 14px; color: #bbb; line-height: 1.6; }

        /* ── Big number section ── */
        .ff-big-num { font-family: 'Syne', sans-serif; font-size: clamp(72px, 12vw, 140px); font-weight: 900; line-height: 0.85; letter-spacing: -0.04em; }

        /* ── Feature checklist badge ── */
        .ff-feature { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #aaa; margin-bottom: 10px; }
        .ff-feature-icon { width: 28px; height: 28px; border-radius: 8px; background: #a3e6351a; border: 1px solid #a3e63530; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px; }

        /* ── Day number badge ── */
        .ff-day-badge { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 800; color: #a3e635; letter-spacing: 0.04em; }

        /* ── Divider line ── */
        .ff-divider { height: 1px; background: linear-gradient(90deg, transparent, #1e1e1e 30%, #1e1e1e 70%, transparent); margin: 0; }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="ff-hero ff-noise" ref={heroRef}>
        {/* Background glows */}
        <div className="ff-orb" style={{ width: 600, height: 600, background: '#a3e635', opacity: 0.04, top: -200, right: -100 }} />
        <div className="ff-orb" style={{ width: 400, height: 400, background: '#38bdf8', opacity: 0.03, bottom: -100, left: 100 }} />

        <div className="ff-wrap">
          {/* Breadcrumb */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 40, opacity: 0.4, fontSize: 12, letterSpacing: '0.04em' }}>
            <Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: '#333' }}>›</span>
            <Link href="/plans" style={{ color: '#fff', textDecoration: 'none' }}>Plans</Link>
            <span style={{ color: '#333' }}>›</span>
            <span style={{ color: '#a3e635' }}>{plan.name}</span>
          </div>

          <div className="ff-hero-inner">
            {/* Left — main content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Tags */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                <span className="ff-tag" style={{ color: '#a3e635', borderColor: '#a3e63530', background: '#a3e63510' }}>
                  Standard Plan
                </span>
                <span className="ff-tag" style={{ color: '#aaa', borderColor: '#222', background: 'transparent' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: dietDot, display: 'inline-block', boxShadow: `0 0 6px ${dietDot}` }} />
                  {dietLabel}
                </span>
                <span className="ff-tag" style={{ color: '#aaa', borderColor: '#222', background: 'transparent' }}>
                  30 Days · No Repeats
                </span>
              </div>

              {/* Headline */}
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(44px, 7vw, 88px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.03em', marginBottom: 24 }}>
                <span style={{ display: 'block' }}>{plan.name}</span>
                <span style={{ display: 'block', WebkitTextStroke: '1px #333', color: 'transparent', fontSize: '0.7em' }}>Plan</span>
              </h1>

              <p style={{ fontSize: 17, lineHeight: 1.75, color: '#888', maxWidth: 500, marginBottom: 0 }}>
                {plan.tagline ?? plan.description ?? 'A 30-day personalised meal system — freshly cooked, macro-tracked, and delivered by 8am. Built around Indian food. Powered by data.'}
              </p>

              {/* Stats */}
              <div className="ff-stats">
                {[
                  { val: `${plan.avgCaloriesPerDay}`, unit: 'kcal', lbl: 'Per Day' },
                  { val: `${plan.avgProteinGrams}g`, unit: '', lbl: 'Protein' },
                  { val: '4', unit: '', lbl: 'Meals Daily' },
                  { val: '30', unit: '', lbl: 'Day Menu' },
                ].map(s => (
                  <div key={s.lbl}>
                    <div className="ff-stat-val">{s.val}<span style={{ fontSize: '0.5em', color: '#a3e63599' }}>{s.unit}</span></div>
                    <div className="ff-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/onboarding" className="ff-btn-primary">
                  Start Your Plan <span>→</span>
                </Link>
                <a href="#pricing" className="ff-btn-ghost">
                  Trial Day ₹750
                </a>
              </div>
            </div>

            {/* Right — hero card */}
            <div className="ff-hero-card" style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #a3e635, #4ade80)' }} />
                <div style={{ fontSize: 12, color: '#555', marginBottom: 4, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>What you get</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 24, color: '#fff' }}>Every single day</div>
                {[
                  { icon: '🥗', title: 'Zero repeats', sub: '30 unique days of food' },
                  { icon: '📦', title: 'Delivered by 8am', sub: 'Fresh from 4am kitchen' },
                  { icon: '📲', title: 'Per-gram tracking', sub: 'One tap — fully logged' },
                  { icon: '🔁', title: 'Auto-recalibrates', sub: 'Adjusts as you progress' },
                  { icon: '⭐', title: 'Living menu', sub: 'Rates → menu evolves' },
                  { icon: '🫙', title: 'No frying ever', sub: 'Olive oil only' },
                ].map(item => (
                  <div key={item.title} style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: '#555', marginTop: 1 }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BIG NUMBER BAND ─────────────────────────────────────────── */}
      <div style={{ background: '#0a0a0a', borderBottom: '1px solid #111', padding: '0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #111' }}>
          {[
            { num: '30', label: 'Days', sub: 'Zero dish repeats' },
            { num: '4', label: 'Meals', sub: 'Delivered daily' },
            { num: '120', label: 'Slots', sub: 'Tracked to the gram' },
            { num: '8am', label: '', sub: 'At your door' },
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, padding: '32px 24px', borderRight: i < 3 ? '1px solid #111' : 'none', textAlign: 'center' }}>
              <div className="ff-big-num" style={{ color: i === 0 ? '#a3e635' : '#fff', fontSize: 'clamp(32px, 4vw, 56px)' }}>{item.num}<span style={{ fontSize: '0.45em', color: '#444', fontWeight: 700 }}>{item.label}</span></div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── WHO IS THIS FOR ─────────────────────────────────────────── */}
      <section className="ff-section">
        <div className="ff-orb" style={{ width: 500, height: 500, background: '#a3e635', opacity: 0.03, top: -100, left: -200 }} />
        <div className="ff-wrap">
          <div className="ff-2col">
            <div>
              <div className="ff-label">Who is this for</div>
              <h2 className="ff-h2" style={{ marginBottom: 20 }}>Built for people<br /><span style={{ color: '#a3e635' }}>done winging it</span></h2>
              <p style={{ color: '#666', lineHeight: 1.8, fontSize: 15, marginBottom: 32 }}>
                {plan.whoIsItFor ?? 'Not a quick fix. This is a 30-day system. The food does the heavy lifting — you eat it, tap "I ate this", and watch the data build.'}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['Weight loss', 'No manual tracking', 'Indian food', 'Data-driven'].map(tag => (
                  <span key={tag} style={{ padding: '6px 14px', background: '#111', border: '1px solid #1e1e1e', borderRadius: 100, fontSize: 13, color: '#777' }}>{tag}</span>
                ))}
              </div>
            </div>
            <div>
              {[
                { t: 'Tired of tracking manually', d: 'Every meal pre-logged. Tap one button. Macros auto-populated — no MyFitnessPal hell.' },
                { t: 'Want Indian food, not rabbit food', d: '80% regional Indian cuisine. Dal, sabzi, roti, rice — done nutritionally right.' },
                { t: 'Serious about the scale moving', d: '1600 kcal/day structured across 4 meals. High protein keeps you full. The deficit is engineered in.' },
                { t: 'Want progress you can see', d: 'Weight trend, consistency score, calorie ring — your transformation is visible daily.' },
              ].map(item => (
                <div key={item.t} className="ff-bullet">
                  <div className="ff-bullet-dot" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.t}</div>
                    <div style={{ color: '#666', fontSize: 13, lineHeight: 1.6 }}>{item.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ────────────────────────────────────────────── */}
      <section className="ff-section" style={{ background: '#070707' }}>
        <div className="ff-wrap">
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 56px' }}>
            <div className="ff-label">What you get</div>
            <h2 className="ff-h2">4 meals. Every day.<br /><span style={{ color: '#a3e635' }}>Delivered by 8am.</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {(['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'] as const).map(slot => (
              <div key={slot} className="ff-slot-card" style={{ background: SLOT_BG[slot] + '66' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '16px 16px 0 0', background: SLOT_COLOR[slot] }} />
                <div style={{ fontSize: 32, marginBottom: 14 }}>
                  {slot === 'BREAKFAST' ? '🌅' : slot === 'LUNCH' ? '☀️' : slot === 'SNACK' ? '🍎' : '🌙'}
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 4, color: SLOT_COLOR[slot] }}>{SLOT_LABEL[slot]}</div>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 16, fontWeight: 500, letterSpacing: '0.04em' }}>{SLOT_TIME[slot]}</div>
                <div style={{ fontSize: 13, color: '#888', lineHeight: 1.7 }}>
                  {slot === 'BREAKFAST' && 'High-protein Indian breakfast. Moong chilla, poha variations, upma, idli — never boring, always filling.'}
                  {slot === 'LUNCH' && 'Full dal-sabzi-roti or rice meal. Your largest calorie window. Engineered for satisfaction.'}
                  {slot === 'SNACK' && 'Low-cal, high-satiety. Makhana, roasted chana, fruit bowls — kills the 6pm pantry raid.'}
                  {slot === 'DINNER' && 'Light but satisfying. Lower carb, higher protein. Palak paneer, dal tadka, grilled options.'}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: '20px 24px', background: '#0c0c0c', border: '1px solid #1a1a1a', borderRadius: 14, display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 24 }}>☕</span>
            <div>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Morning Boost included</span>
              <span style={{ color: '#555', fontSize: 13, marginLeft: 10 }}>Every box ships with a coffee sachet. The one thing that makes opening the box feel like a ritual.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 30-DAY MENU ─────────────────────────────────────────────── */}
      <section id="menu" className="ff-section">
        <div className="ff-orb" style={{ width: 700, height: 700, background: '#a3e635', opacity: 0.025, top: -200, right: -300 }} />
        <div className="ff-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div className="ff-label">The Full Menu</div>
              <h2 className="ff-h2">{totalDays} days. Zero repeats.<br /><span style={{ color: '#a3e635' }}>Every macro, right here.</span></h2>
            </div>
            <div style={{ background: '#0c0c0c', border: '1px solid #1a1a1a', borderRadius: 12, padding: '12px 20px', fontSize: 13, color: '#555', maxWidth: 240, lineHeight: 1.6 }}>
              Full menu is 100% public. No blur. No auth wall. The food is the proof.
            </div>
          </div>

          {/* Week tabs */}
          <div className="ff-week-tabs">
            {[1, 2, 3, 4].map(w => (
              <button key={w} className={`ff-week-tab${activeWeek === w ? ' active' : ''}`} onClick={() => { setActiveWeek(w); setShowFullCalendar(false); }}>
                Week {w}
              </button>
            ))}
            <button className={`ff-week-tab${showFullCalendar ? ' active' : ''}`} onClick={() => setShowFullCalendar(!showFullCalendar)} style={{ marginLeft: 'auto' }}>
              {showFullCalendar ? '↑ Collapse' : '↓ All 30 days'}
            </button>
          </div>

          {/* Week view */}
          {!showFullCalendar && weekDays.map(day => {
            const daySlots = schedule[day] ?? []
            const totalCal = daySlots.reduce((s, sl) => s + sl.recipe.caloriesPerServing, 0)
            return (
              <div key={day} className="ff-day-row">
                <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #0f0f0f' }}>
                  <span className="ff-day-badge">Day {day}</span>
                  <span style={{ fontSize: 12, color: '#444' }}>{totalCal} kcal</span>
                </div>
                <div className="ff-day-meals">
                  {daySlots.map((slot, i) => (
                    <div key={slot.id} style={{ padding: '14px 16px', borderRight: i < daySlots.length - 1 ? '1px solid #0f0f0f' : 'none' }}>
                      <div style={{ fontSize: 10, color: SLOT_COLOR[slot.mealSlot], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
                        {SLOT_LABEL[slot.mealSlot]}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 5, lineHeight: 1.3, color: '#ddd' }}>{slot.recipe.name}</div>
                      <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#555', flexWrap: 'wrap' }}>
                        <span style={{ color: '#a3e635' }}>{slot.recipe.caloriesPerServing} kcal</span>
                        <span>{g(slot.recipe.proteinGrams)}P</span>
                        <span>{g(slot.recipe.carbsGrams)}C</span>
                        <span>{g(slot.recipe.fatGrams)}F</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Full 30-day calendar */}
          {showFullCalendar && Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
            const daySlots = schedule[day] ?? []
            return (
              <div key={day} className="ff-day-row">
                <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #0f0f0f' }}>
                  <span className="ff-day-badge" style={{ fontSize: 11 }}>Day {day}</span>
                  <span style={{ fontSize: 11, color: '#333' }}>{daySlots.reduce((s, sl) => s + sl.recipe.caloriesPerServing, 0)} kcal</span>
                </div>
                <div className="ff-day-meals">
                  {daySlots.map((slot, i) => (
                    <div key={slot.id} style={{ padding: '10px 14px', borderRight: i < daySlots.length - 1 ? '1px solid #0f0f0f' : 'none' }}>
                      <div style={{ fontSize: 9, color: SLOT_COLOR[slot.mealSlot], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{SLOT_LABEL[slot.mealSlot]}</div>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#ccc', lineHeight: 1.3 }}>{slot.recipe.name}</div>
                      <div style={{ fontSize: 10, color: '#444', marginTop: 3 }}>{slot.recipe.caloriesPerServing} kcal · {g(slot.recipe.proteinGrams)}g P</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── DAY 1 PREVIEW ───────────────────────────────────────────── */}
      {day1Slots.length > 0 && (
        <section className="ff-section" style={{ background: '#070707' }}>
          <div className="ff-wrap">
            <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 56px' }}>
              <div className="ff-label">Day 1 Preview</div>
              <h2 className="ff-h2">Exactly what arrives<br /><span style={{ color: '#a3e635' }}>on Day 1</span></h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {day1Slots.map(slot => (
                <div key={slot.id} style={{ background: '#0c0c0c', border: `1px solid ${SLOT_COLOR[slot.mealSlot]}22`, borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${SLOT_COLOR[slot.mealSlot]}, ${SLOT_COLOR[slot.mealSlot]}44)` }} />
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: SLOT_BG[slot.mealSlot], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                      {slot.mealSlot === 'BREAKFAST' ? '🌅' : slot.mealSlot === 'LUNCH' ? '☀️' : slot.mealSlot === 'SNACK' ? '🍎' : '🌙'}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: SLOT_COLOR[slot.mealSlot], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{SLOT_LABEL[slot.mealSlot]}</div>
                      <div style={{ fontSize: 11, color: '#444' }}>{SLOT_TIME[slot.mealSlot]}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 8, lineHeight: 1.2, color: '#fff' }}>{slot.recipe.name}</div>
                  {slot.recipe.description && <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6, marginBottom: 16 }}>{slot.recipe.description}</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
                    {[
                      { val: slot.recipe.caloriesPerServing, lbl: 'kcal', col: '#a3e635' },
                      { val: `${g(slot.recipe.proteinGrams)}g`, lbl: 'Protein', col: '#f59e0b' },
                      { val: `${g(slot.recipe.carbsGrams)}g`, lbl: 'Carbs', col: '#38bdf8' },
                      { val: `${g(slot.recipe.fatGrams)}g`, lbl: 'Fat', col: '#f472b6' },
                    ].map(m => (
                      <div key={m.lbl} className="ff-macro">
                        <div className="ff-macro-val" style={{ color: m.col }}>{m.val}</div>
                        <div className="ff-macro-lbl">{m.lbl}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#444', flexWrap: 'wrap' }}>
                    {slot.recipe.cuisineType && <span>🍽 {slot.recipe.cuisineType}</span>}
                    {slot.recipe.prepTimeMins && <span>⏱ {slot.recipe.prepTimeMins + (slot.recipe.cookTimeMins ?? 0)} min</span>}
                    {slot.recipe.servingSizeGrams && <span>⚖️ {slot.recipe.servingSizeGrams}g</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── NUTRITIONAL PRINCIPLES ──────────────────────────────────── */}
      <section className="ff-section">
        <div className="ff-orb" style={{ width: 500, height: 500, background: '#38bdf8', opacity: 0.025, bottom: -100, right: -100 }} />
        <div className="ff-wrap">
          <div className="ff-2col">
            <div>
              <div className="ff-label">Nutritional Principles</div>
              <h2 className="ff-h2" style={{ marginBottom: 16 }}>What goes into<br /><span style={{ color: '#a3e635' }}>every meal</span></h2>
              <p style={{ color: '#666', fontSize: 14, lineHeight: 1.8, marginBottom: 32 }}>
                {plan.avgCaloriesPerDay} kcal/day — engineered for sustainable fat loss. Aggressive enough to produce results, conservative enough to preserve muscle.
              </p>
              <div className="ff-principles-col">
                {(plan.keyPrinciples?.length ? plan.keyPrinciples : [
                  'High protein — preserves muscle during deficit',
                  'Moderate complex carbs — dal, roti, rice not eliminated',
                  'Low saturated fat — olive oil only, zero frying',
                  'High fibre — gut health + satiety',
                  'Zero refined sugar in plan meals',
                  'Pune APMC sourced — no imported ingredients',
                ]).map(item => (
                  <div key={item} className="ff-principle">
                    <span style={{ color: '#a3e635', fontWeight: 700, flexShrink: 0, fontSize: 16 }}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="ff-label" style={{ color: '#ef4444' }}>Not Included</div>
              <h2 className="ff-h2" style={{ marginBottom: 16, fontSize: 'clamp(24px, 3vw, 36px)' }}>What we<br />leave out</h2>
              <p style={{ color: '#666', fontSize: 14, lineHeight: 1.8, marginBottom: 32 }}>
                No mystery macros. No international ingredients you won't find at a kirana. No frying, ever.
              </p>
              <div className="ff-principles-col">
                {(plan.whatIsAvoided?.length ? plan.whatIsAvoided : [
                  'No international-only ingredients (tahini, miso, avocado)',
                  'No deep-fried foods',
                  'No refined sugar or maida',
                  'No artificial flavours or preservatives',
                  'No mystery macros — every gram is declared',
                ]).map(item => (
                  <div key={item} className="ff-principle">
                    <span style={{ color: '#ef4444', fontWeight: 700, flexShrink: 0, fontSize: 16 }}>✕</span>
                    <span style={{ color: '#666' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRACKING SYSTEM ─────────────────────────────────────────── */}
      <section className="ff-section" style={{ background: '#070707' }}>
        <div className="ff-wrap">
          <div className="ff-2col">
            {/* Dashboard mockup */}
            <div className="ff-mock">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #141414' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Today — Day 3 of 30</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: '#fff' }}>Weight Loss Veg</div>
                </div>
                <div style={{ background: '#a3e6351a', border: '1px solid #a3e63530', borderRadius: 100, padding: '4px 12px', fontSize: 11, color: '#a3e635', fontWeight: 600 }}>Standard</div>
              </div>
              {[
                { slot: 'BREAKFAST', name: 'Moong Dal Chilla', cal: 289, done: true },
                { slot: 'LUNCH', name: 'Rajma + Roti', cal: 380, done: true },
                { slot: 'SNACK', name: 'Makhana Chaat', cal: 156, done: false },
                { slot: 'DINNER', name: 'Palak Paneer + Jowar Roti', cal: 360, done: false },
              ].map(m => (
                <div key={m.slot} className="ff-mock-row" style={{ opacity: m.done ? 1 : 0.5 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: SLOT_BG[m.slot], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                      {m.slot === 'BREAKFAST' ? '🌅' : m.slot === 'LUNCH' ? '☀️' : m.slot === 'SNACK' ? '🍎' : '🌙'}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: SLOT_COLOR[m.slot], fontWeight: 600, marginBottom: 1 }}>{SLOT_LABEL[m.slot]}</div>
                      <div style={{ fontSize: 13, color: m.done ? '#ddd' : '#888' }}>{m.name}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: '#a3e635', fontWeight: 600 }}>{m.cal} kcal</div>
                    {m.done
                      ? <div style={{ fontSize: 10, color: '#4ade80', marginTop: 2 }}>✓ Logged</div>
                      : <div style={{ fontSize: 10, color: '#333', marginTop: 2, border: '1px solid #252525', padding: '2px 8px', borderRadius: 4 }}>I ate this</div>
                    }
                  </div>
                </div>
              ))}
              <div style={{ paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                  <span style={{ color: '#555' }}>669 / 1600 kcal logged</span>
                  <span style={{ color: '#a3e635', fontWeight: 600 }}>42%</span>
                </div>
                <div style={{ height: 6, background: '#151515', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '42%', height: '100%', background: 'linear-gradient(90deg, #a3e635, #4ade80)', borderRadius: 3 }} />
                </div>
              </div>
            </div>

            <div>
              <div className="ff-label">The Tracking System</div>
              <h2 className="ff-h2" style={{ marginBottom: 24 }}>One tap.<br /><span style={{ color: '#a3e635' }}>Every macro logged.</span></h2>
              {[
                { icon: '👆', title: 'No manual entry', desc: 'Every meal pre-loaded. Tap "I ate this" — macros auto-populate in your diary.' },
                { icon: '🔴', title: 'Live calorie ring', desc: 'Calories in vs target updates in real time. Add a workout and net calories adjust.' },
                { icon: '📊', title: 'Consistency score', desc: 'Your 0–100 weekly score from meals logged, workouts, weigh-ins. What the AI watches.' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
                  <div className="ff-feature-icon">{item.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 5, fontSize: 15 }}>{item.title}</div>
                    <div style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────── */}
      <section id="pricing" className="ff-section">
        <div className="ff-orb" style={{ width: 600, height: 600, background: '#a3e635', opacity: 0.04, top: -200, left: '50%', transform: 'translateX(-50%)' }} />
        <div className="ff-wrap">
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 56px' }}>
            <div className="ff-label">Pricing</div>
            <h2 className="ff-h2" style={{ marginBottom: 16 }}>Start with a trial.<br /><span style={{ color: '#a3e635' }}>Stay for the results.</span></h2>
            <p style={{ color: '#666', fontSize: 15 }}>All 4 meals. 4am prep. Delivered by 8am. No delivery charge.</p>
          </div>

          <div className="ff-price-grid">
            {PRICING.map((p, i) => (
              <button key={p.label} className={`ff-price-card${selectedPricing === i ? ' active' : ''}`} onClick={() => setSelectedPricing(i)}>
                {p.popular && (
                  <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#a3e635', color: '#060606', fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontSize: 11, color: selectedPricing === i ? '#a3e63599' : '#555', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.sub}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: selectedPricing === i ? '#a3e635' : '#fff', marginBottom: 2 }}>{p.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 2 }}>₹{p.price.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 12, color: '#555' }}>₹{p.perDay}/day</div>
              </button>
            ))}
          </div>

          {/* Selected CTA */}
          <div style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 20, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #a3e635, #4ade80)' }} />
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 28, lineHeight: 1 }}>{PRICING[selectedPricing].label} Plan</div>
              <div style={{ color: '#555', fontSize: 14, marginTop: 6 }}>
                {PRICING[selectedPricing].days} {PRICING[selectedPricing].days === 1 ? 'day' : 'days'} · All 4 meals · ₹{PRICING[selectedPricing].perDay}/day
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 900, color: '#a3e635', lineHeight: 1 }}>
                ₹{PRICING[selectedPricing].price.toLocaleString('en-IN')}
              </div>
              <Link href="/onboarding" className="ff-btn-primary">Order Now →</Link>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#333', marginTop: 16 }}>PayU · UPI · Credit/Debit · Cash on Delivery available</p>
        </div>
      </section>

      {/* ── LIVING MENU ─────────────────────────────────────────────── */}
      <section className="ff-section" style={{ background: '#070707' }}>
        <div className="ff-wrap">
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 56px' }}>
            <div className="ff-label">Living Menu</div>
            <h2 className="ff-h2">Rate your meals.<br /><span style={{ color: '#a3e635' }}>The menu evolves.</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { icon: '⭐', step: '01', title: 'Rate every meal', desc: '1–5 stars + optional note after each "I ate this" tap.' },
              { icon: '📊', step: '02', title: 'Data aggregates', desc: 'Per-recipe avg rating tracked across all subscribers.' },
              { icon: '🔄', step: '03', title: 'Menu improves', desc: 'Below 3.0 avg after 20+ ratings → flagged for replacement.' },
            ].map(item => (
              <div key={item.step} style={{ background: '#0c0c0c', border: '1px solid #141414', borderRadius: 18, padding: 28, position: 'relative' }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 56, fontWeight: 900, color: '#111', lineHeight: 1, position: 'absolute', top: 16, right: 20 }}>{item.step}</div>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{item.title}</div>
                <div style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────── */}
      <section className="ff-section">
        <div className="ff-wrap">
          <div style={{ marginBottom: 48 }}>
            <div className="ff-label">Results</div>
            <h2 className="ff-h2">Real people.<br /><span style={{ color: '#a3e635' }}>Real data.</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { name: 'Priya M.', loc: 'Kharadi, Pune', result: '−6.2 kg / 30 days', text: "I have tried every diet. This is the first time I did not have to think. Food showed up, I logged it, and the numbers moved.", stars: 5 },
              { name: 'Rahul S.', loc: 'Viman Nagar, Pune', result: '−4.8 kg · 91% consistency', text: 'The consistency score changed me. Watching it go 60 to 91 over 4 weeks rewired how I think about habits.', stars: 5 },
              { name: 'Sneha K.', loc: 'Koregaon Park, Pune', result: '30 days completed', text: 'Not tiffin portions — full meals with proper macros. Rajma and dal are genuinely good. I was not expecting that.', stars: 5 },
            ].map(t => (
              <div key={t.name} className="ff-testi">
                <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i} style={{ color: '#a3e635', fontSize: 14 }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: '#bbb', marginBottom: 20 }}>"{t.text}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ color: '#555', fontSize: 12 }}>{t.loc}</div>
                  </div>
                  <div style={{ background: '#a3e6351a', color: '#a3e635', border: '1px solid #a3e63525', borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 700 }}>{t.result}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section className="ff-section" style={{ background: '#070707' }}>
        <div className="ff-wrap" style={{ maxWidth: 760 }}>
          <div style={{ marginBottom: 48 }}>
            <div className="ff-label">FAQ</div>
            <h2 className="ff-h2">Common questions</h2>
          </div>
          {FAQ.map((item, i) => (
            <div key={i} className="ff-faq-item">
              <button className="ff-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{item.q}</span>
                <span style={{ color: '#a3e635', fontSize: 20, fontWeight: 300, flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {openFaq === i && <div className="ff-faq-body">{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────── */}
      <section className="ff-cta-section ff-noise">
        <div className="ff-orb" style={{ width: 800, height: 800, background: '#a3e635', opacity: 0.06, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        <div className="ff-wrap" style={{ position: 'relative', zIndex: 1 }}>
          <div className="ff-label" style={{ justifyContent: 'center', display: 'flex' }}>Start today</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(36px, 7vw, 80px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.03em', marginBottom: 24, textAlign: 'center' }}>
            Start eating right<br />
            <span style={{ WebkitTextStroke: '1px #a3e635', color: 'transparent' }}>tomorrow.</span>
          </h2>
          <p style={{ color: '#666', fontSize: 16, marginBottom: 48, textAlign: 'center', lineHeight: 1.7 }}>
            2-minute onboarding. Calorie target calculated automatically.<br />First delivery next morning.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            <Link href="/onboarding" className="ff-btn-primary" style={{ fontSize: 17, padding: '18px 44px' }}>
              Start Your Plan →
            </Link>
            <a href={`https://wa.me/91XXXXXXXXXX?text=Hi, I want to know more about the ${encodeURIComponent(plan.name)} plan`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', padding: '18px 36px', borderRadius: 100, fontWeight: 700, fontSize: 15, textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              💬 WhatsApp Us
            </a>
          </div>
          <p style={{ fontSize: 12, color: '#333', textAlign: 'center' }}>FSSAI License: 21523035002815 · Pune, Maharashtra</p>
        </div>
      </section>

    </div>
  )
}