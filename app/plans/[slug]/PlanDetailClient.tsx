'use client'

import { useState } from 'react'
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
  fiberGrams?: number
  cuisineType?: string
  prepTimeMins?: number
  cookTimeMins?: number
  servingSizeGrams?: number
  difficultyLevel?: string
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
  dietaryVariant: string
  tier: string
  category: string
  targetCalories: number
  proteinTarget?: number
  carbTarget?: number
  fatTarget?: number
  durationDays: number
}

interface Props {
  plan: Plan
  schedule: Record<number, Slot[]>
  day1Slots: Slot[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SLOT_LABEL: Record<string, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  SNACK: 'Snack',
  DINNER: 'Dinner',
}
const SLOT_TIME: Record<string, string> = {
  BREAKFAST: '7:00 – 9:00 am',
  LUNCH: '12:30 – 2:00 pm',
  SNACK: '4:00 – 5:00 pm',
  DINNER: '7:00 – 8:30 pm',
}
const SLOT_EMOJI: Record<string, string> = {
  BREAKFAST: '🌅',
  LUNCH: '☀️',
  SNACK: '🍎',
  DINNER: '🌙',
}
const SLOT_COLOR: Record<string, string> = {
  BREAKFAST: '#f59e0b',
  LUNCH: '#a3e635',
  SNACK: '#38bdf8',
  DINNER: '#a78bfa',
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlanDetailClient({ plan, schedule, day1Slots }: Props) {
  const [activeWeek, setActiveWeek] = useState(1)
  const [showFullCalendar, setShowFullCalendar] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [selectedPricing, setSelectedPricing] = useState(3) // 1 Month default

  const totalDays = Object.keys(schedule).length
  const weeks = [1, 2, 3, 4]

  // Days for the current week tab (1–7, 8–14, etc.)
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

  return (
    <div
      style={{
        background: '#080808',
        color: '#fff',
        minHeight: '100vh',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Section 1: Hero ─────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '80px 24px 64px',
          borderBottom: '1px solid #1a1a1a',
        }}
      >
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 32, opacity: 0.5, fontSize: 13 }}>
          <Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/plans" style={{ color: '#fff', textDecoration: 'none' }}>Plans</Link>
          <span>/</span>
          <span style={{ color: '#a3e635' }}>{plan.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }}>
          <div>
            {/* Tag */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <span style={{
                background: '#a3e6351a',
                color: '#a3e635',
                border: '1px solid #a3e63540',
                borderRadius: 6,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                Standard Plan
              </span>
              <span style={{
                background: '#ffffff0d',
                color: '#aaa',
                border: '1px solid #ffffff15',
                borderRadius: 6,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 500,
              }}>
                {dietLabel}
              </span>
              <span style={{
                background: '#ffffff0d',
                color: '#aaa',
                border: '1px solid #ffffff15',
                borderRadius: 6,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 500,
              }}>
                30-Day Plan
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(36px, 5vw, 60px)',
              fontWeight: 800,
              lineHeight: 1.05,
              marginBottom: 20,
              letterSpacing: '-0.02em',
            }}>
              {plan.name}
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.7, color: '#aaa', maxWidth: 560, marginBottom: 32 }}>
              {plan.description ?? 'A personalised 30-day meal plan crafted to hit your exact calorie and macro targets — freshly cooked and delivered to your door by 8am daily.'}
            </p>

            {/* Key stats */}
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 40 }}>
              {[
                { label: 'Calories/day', value: `${plan.targetCalories} kcal` },
                { label: 'Protein target', value: `${plan.proteinTarget ?? Math.round(plan.targetCalories * 0.3 / 4)}g` },
                { label: 'Meals/day', value: '4 meals' },
                { label: 'Duration', value: '30 days' },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: 26, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#a3e635' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link
                href="/onboarding"
                style={{
                  background: '#a3e635',
                  color: '#080808',
                  padding: '14px 32px',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: 'none',
                  display: 'inline-block',
                  letterSpacing: '0.02em',
                }}
              >
                Start Your Plan →
              </Link>
              <a
                href="#pricing"
                style={{
                  background: 'transparent',
                  color: '#fff',
                  padding: '14px 32px',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: 'none',
                  border: '1px solid #333',
                  display: 'inline-block',
                }}
              >
                Trial Day ₹750
              </a>
            </div>
          </div>

          {/* Side card */}
          <div
            style={{
              background: '#101010',
              border: '1px solid #1e1e1e',
              borderRadius: 16,
              padding: '28px 24px',
              minWidth: 220,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {[
              { icon: '🥗', text: 'No dish repeats in 30 days' },
              { icon: '📦', text: 'Delivered by 8am daily' },
              { icon: '📲', text: 'Per-gram tracking on dashboard' },
              { icon: '🔁', text: 'Adaptive calorie recalibration' },
              { icon: '⭐', text: 'Rate meals — menu evolves' },
              { icon: '🫙', text: 'No frying · Olive oil only' },
            ].map((item) => (
              <div key={item.text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, color: '#ccc' }}>
                <span style={{ fontSize: 16, lineHeight: 1.4 }}>{item.icon}</span>
                <span style={{ lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: Who Is This For ──────────────────────────────────── */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <p style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
              Who Is This For
            </p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
              Built for people who are serious about results
            </h2>
            <p style={{ color: '#888', lineHeight: 1.8, fontSize: 15 }}>
              Not a quick fix. This is a 30-day system that works when you follow it. The food does the heavy lifting — you just eat it, tap "I ate this", and watch the data build.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { title: 'You want to lose weight without starving', desc: '1600 kcal/day with 4 filling meals. High protein keeps you satiated.' },
              { title: 'You\'re tired of tracking manually', desc: 'Every meal pre-logged. Tap one button. Macros auto-populated.' },
              { title: 'You want Indian food, not rabbit food', desc: '80% regional Indian cuisine. Dal, sabzi, roti, rice — done right.' },
              { title: 'You want progress you can measure', desc: 'Weight trend, consistency score, calorie ring — all on your dashboard.' },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: '#0e0e0e',
                  border: '1px solid #1a1a1a',
                  borderRadius: 12,
                  padding: '20px 20px',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a3e635', marginTop: 7, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ color: '#666', fontSize: 13, lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: What You Get ─────────────────────────────────────── */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px', borderBottom: '1px solid #1a1a1a' }}>
        <p style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
          What You Get
        </p>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 48, letterSpacing: '-0.02em' }}>
          4 meals. Every day. Delivered by 8am.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
          {(['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'] as const).map((slot) => (
            <div
              key={slot}
              style={{
                background: '#0e0e0e',
                border: `1px solid ${SLOT_COLOR[slot]}30`,
                borderTop: `3px solid ${SLOT_COLOR[slot]}`,
                borderRadius: 12,
                padding: '24px 20px',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{SLOT_EMOJI[slot]}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                {SLOT_LABEL[slot]}
              </div>
              <div style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>{SLOT_TIME[slot]}</div>
              <div style={{ color: '#aaa', fontSize: 13, lineHeight: 1.6 }}>
                {slot === 'BREAKFAST' && 'High-protein Indian breakfast. Moong chilla, poha variations, upma, idli — never boring, always filling.'}
                {slot === 'LUNCH' && 'Full dal-sabzi-roti or rice meal. Designed around your largest calorie window of the day.'}
                {slot === 'SNACK' && 'Low-calorie, high-satiety. Makhana, roasted chana, fruit bowls — keeps you from raiding the pantry at 6pm.'}
                {slot === 'DINNER' && 'Light but satisfying. Lower carb, higher protein. Palak paneer, dal tadka, grilled options.'}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: '#0e0e0e',
            border: '1px solid #1e1e1e',
            borderRadius: 12,
            padding: '20px 24px',
            display: 'flex',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 24 }}>☕</span>
          <div>
            <span style={{ fontWeight: 600 }}>Every box includes your Morning Boost</span>
            <span style={{ color: '#666', fontSize: 14, marginLeft: 12 }}>
              A coffee sachet (Standard) — the one thing that makes opening the box feel like a ritual.
            </span>
          </div>
        </div>
      </section>

      {/* ── Section 4 + 5: 30-Day Menu ──────────────────────────────────── */}
      <section id="menu" style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px', borderBottom: '1px solid #1a1a1a' }}>
        <p style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
          The Full Menu
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {totalDays} days. Zero repeats.
            <br />
            <span style={{ color: '#a3e635' }}>Every dish, every macro — right here.</span>
          </h2>
          <div style={{ fontSize: 13, color: '#555', maxWidth: 260, lineHeight: 1.6 }}>
            No auth wall. No blur. The full menu is public — because the food is the proof.
          </div>
        </div>

        {/* Week tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {weeks.map((w) => (
            <button
              key={w}
              onClick={() => setActiveWeek(w)}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: activeWeek === w ? '1px solid #a3e635' : '1px solid #222',
                background: activeWeek === w ? '#a3e6351a' : 'transparent',
                color: activeWeek === w ? '#a3e635' : '#666',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Week {w}
            </button>
          ))}
          <button
            onClick={() => setShowFullCalendar(!showFullCalendar)}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: showFullCalendar ? '1px solid #a3e635' : '1px solid #222',
              background: showFullCalendar ? '#a3e6351a' : 'transparent',
              color: showFullCalendar ? '#a3e635' : '#666',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              marginLeft: 'auto',
              transition: 'all 0.15s',
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
                  style={{
                    background: '#0d0d0d',
                    border: '1px solid #1a1a1a',
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  {/* Day header */}
                  <div
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid #1a1a1a',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>
                      Day {day}
                    </span>
                    <span style={{ fontSize: 12, color: '#555' }}>
                      {daySlots.reduce((sum, s) => sum + s.recipe.caloriesPerServing, 0)} kcal total
                    </span>
                  </div>
                  {/* Meals grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    {daySlots.map((slot, i) => (
                      <div
                        key={slot.id}
                        style={{
                          padding: '16px 20px',
                          borderRight: i < daySlots.length - 1 ? '1px solid #1a1a1a' : 'none',
                          borderBottom: 'none',
                        }}
                      >
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 14 }}>{SLOT_EMOJI[slot.mealSlot]}</span>
                          <span style={{ fontSize: 11, color: SLOT_COLOR[slot.mealSlot], fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {SLOT_LABEL[slot.mealSlot]}
                          </span>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, lineHeight: 1.4 }}>
                          {slot.recipe.name}
                        </div>
                        <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#666' }}>
                          <span style={{ color: '#a3e635' }}>{slot.recipe.caloriesPerServing} kcal</span>
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
                  style={{
                    background: '#0d0d0d',
                    border: '1px solid #161616',
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '12px 20px', borderBottom: '1px solid #161616', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>Day {day}</span>
                    <span style={{ fontSize: 11, color: '#444' }}>
                      {daySlots.reduce((sum, s) => sum + s.recipe.caloriesPerServing, 0)} kcal
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    {daySlots.map((slot, i) => (
                      <div
                        key={slot.id}
                        style={{
                          padding: '12px 16px',
                          borderRight: i < daySlots.length - 1 ? '1px solid #161616' : 'none',
                        }}
                      >
                        <div style={{ fontSize: 10, color: SLOT_COLOR[slot.mealSlot], fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                          {SLOT_EMOJI[slot.mealSlot]} {SLOT_LABEL[slot.mealSlot]}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, lineHeight: 1.3 }}>
                          {slot.recipe.name}
                        </div>
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
        <section style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px', borderBottom: '1px solid #1a1a1a' }}>
          <p style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            Day 1 Preview
          </p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 40, letterSpacing: '-0.02em' }}>
            Here's exactly what arrives on Day 1
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {day1Slots.map((slot) => (
              <div
                key={slot.id}
                style={{
                  background: '#0e0e0e',
                  border: '1px solid #1e1e1e',
                  borderTop: `3px solid ${SLOT_COLOR[slot.mealSlot]}`,
                  borderRadius: 12,
                  padding: '24px 20px',
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>{SLOT_EMOJI[slot.mealSlot]}</span>
                  <div>
                    <div style={{ fontSize: 11, color: SLOT_COLOR[slot.mealSlot], fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {SLOT_LABEL[slot.mealSlot]}
                    </div>
                    <div style={{ fontSize: 11, color: '#555' }}>{SLOT_TIME[slot.mealSlot]}</div>
                  </div>
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 8, lineHeight: 1.3 }}>
                  {slot.recipe.name}
                </div>
                {slot.recipe.description && (
                  <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 16 }}>
                    {slot.recipe.description}
                  </div>
                )}
                {/* Macros */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                  {[
                    { label: 'kcal', value: slot.recipe.caloriesPerServing, color: '#a3e635' },
                    { label: 'Protein', value: `${slot.recipe.proteinGrams}g`, color: '#f59e0b' },
                    { label: 'Carbs', value: `${slot.recipe.carbsGrams}g`, color: '#38bdf8' },
                    { label: 'Fat', value: `${slot.recipe.fatGrams}g`, color: '#f472b6' },
                  ].map((m) => (
                    <div
                      key={m.label}
                      style={{
                        background: '#161616',
                        borderRadius: 8,
                        padding: '8px 6px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ color: m.color, fontWeight: 700, fontSize: 15 }}>{m.value}</div>
                      <div style={{ color: '#555', fontSize: 10, marginTop: 2 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                {/* Meta */}
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#555', flexWrap: 'wrap' }}>
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
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
          <div>
            <p style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
              Nutritional Principles
            </p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
              What goes into every meal
            </h2>
            <p style={{ color: '#777', lineHeight: 1.8, fontSize: 14, marginBottom: 24 }}>
              {plan.targetCalories} kcal/day is a science-backed deficit for sustainable fat loss — aggressive enough to produce results, conservative enough to preserve muscle and energy.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'High protein (preserves muscle during deficit)',
                'Moderate complex carbs (dal, roti, rice — not eliminated)',
                'Low saturated fat (olive oil only, no frying)',
                'High fibre (keeps you full, gut health)',
                'Zero refined sugar in plan meals',
                'Sourced from Pune APMC — no imported ingredients',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: '#ccc' }}>
                  <span style={{ color: '#a3e635', fontWeight: 700, marginTop: 1 }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
              Not Included
            </p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
              What we deliberately leave out
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'No international-only ingredients (tahini, miso, couscous, avocado)',
                'No deep-fried foods',
                'No refined sugar or maida',
                'No artificial flavours or preservatives',
                'No heavy cream or full-fat cheeses in base meals',
                'No mystery macros — every gram is declared',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: '#666' }}>
                  <span style={{ color: '#ef4444', fontWeight: 700, marginTop: 1 }}>✕</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 7: Per-Gram Tracking ─────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '64px 24px',
          borderBottom: '1px solid #1a1a1a',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          {/* Dashboard mockup */}
          <div
            style={{
              background: '#0d0d0d',
              border: '1px solid #1e1e1e',
              borderRadius: 16,
              padding: 24,
              fontFamily: 'monospace',
            }}
          >
            <div style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>Today's Meals — Day 3 of 30</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>Weight Loss Veg · Standard</div>
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
                  padding: '10px 0',
                  borderBottom: '1px solid #141414',
                  opacity: m.done ? 1 : 0.6,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: SLOT_COLOR[m.slot], fontWeight: 600, marginBottom: 2 }}>
                    {SLOT_EMOJI[m.slot]} {SLOT_LABEL[m.slot]}
                  </div>
                  <div style={{ fontSize: 13, color: m.done ? '#fff' : '#777' }}>{m.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#a3e635' }}>{m.cal} kcal</div>
                  {m.done ? (
                    <div style={{ fontSize: 10, color: '#4ade80', marginTop: 2 }}>✓ Logged</div>
                  ) : (
                    <div style={{ fontSize: 10, color: '#333', marginTop: 2, border: '1px solid #333', padding: '2px 6px', borderRadius: 4 }}>
                      I ate this
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div style={{ paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#555', marginBottom: 8 }}>
                <span>669 / 1600 kcal</span>
                <span>42%</span>
              </div>
              <div style={{ height: 6, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '42%', height: '100%', background: '#a3e635', borderRadius: 3 }} />
              </div>
            </div>
          </div>

          <div>
            <p style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
              The Tracking System
            </p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
              One tap. Every macro logged.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                {
                  title: 'No manual entry',
                  desc: 'Every meal pre-loaded. Tap "I ate this" and the macros auto-populate in your diary.',
                },
                {
                  title: 'Calorie ring updates live',
                  desc: 'Your dashboard shows calories in vs target in real time. Add a workout and the ring adjusts for net calories.',
                },
                {
                  title: 'Consistency score',
                  desc: "Your weekly 0–100 score tracks meals logged, workouts done, and weigh-ins. It's the number your AI trainer watches.",
                },
              ].map((item) => (
                <div key={item.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#a3e6351a', border: '1px solid #a3e63530', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a3e635' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 8: Pricing ──────────────────────────────────────────── */}
      <section id="pricing" style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px', borderBottom: '1px solid #1a1a1a' }}>
        <p style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
          Pricing
        </p>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 12, letterSpacing: '-0.02em' }}>
          Start with a trial. Stay for the results.
        </h2>
        <p style={{ color: '#666', fontSize: 15, marginBottom: 48 }}>All 4 meals included. 4am prep. Delivered by 8am. No delivery charge.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
          {PRICING.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setSelectedPricing(i)}
              style={{
                background: selectedPricing === i ? '#a3e6351a' : '#0d0d0d',
                border: selectedPricing === i ? '2px solid #a3e635' : '1px solid #1e1e1e',
                borderRadius: 12,
                padding: '20px 16px',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                transition: 'all 0.15s',
              }}
            >
              {p.popular && (
                <div style={{
                  position: 'absolute',
                  top: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#a3e635',
                  color: '#080808',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 20,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  Most Popular
                </div>
              )}
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: selectedPricing === i ? '#a3e635' : '#fff', marginBottom: 4 }}>
                {p.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 2 }}>
                ₹{p.price.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 12, color: '#555' }}>
                ₹{p.perDay}/day
              </div>
            </button>
          ))}
        </div>

        {/* Selected plan CTA */}
        <div
          style={{
            background: '#0d0d0d',
            border: '1px solid #1e1e1e',
            borderRadius: 16,
            padding: '28px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24 }}>
              {PRICING[selectedPricing].label} Plan
            </div>
            <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>
              {PRICING[selectedPricing].days} {PRICING[selectedPricing].days === 1 ? 'day' : 'days'} · All 4 meals · Delivered daily ·{' '}
              ₹{PRICING[selectedPricing].perDay}/day
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#a3e635' }}>
                ₹{PRICING[selectedPricing].price.toLocaleString('en-IN')}
              </div>
            </div>
            <Link
              href="/onboarding"
              style={{
                background: '#a3e635',
                color: '#080808',
                padding: '14px 28px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Order Now →
            </Link>
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#444', marginTop: 16, textAlign: 'center' }}>
          PayU · UPI · Credit/Debit Card · Cash on Delivery available
        </p>
      </section>

      {/* ── Section 9: Meal Feedback Loop ───────────────────────────────── */}
      <section
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '64px 24px',
          borderBottom: '1px solid #1a1a1a',
          textAlign: 'center',
        }}
      >
        <p style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
          Living Menu
        </p>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.02em' }}>
          Rate your meals. The menu evolves.
        </h2>
        <p style={{ color: '#666', maxWidth: 540, margin: '0 auto 48px', lineHeight: 1.8 }}>
          Every "I ate this" tap asks for a 1–5 star rating. Low-rated dishes get flagged and replaced. After 30 days, the menu is smarter than when you started.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[
            { icon: '⭐', label: 'Rate every meal', sub: '1–5 stars, optional note' },
            { icon: '📊', label: 'Data aggregates', sub: 'Per-recipe avg rating tracked' },
            { icon: '🔄', label: 'Menu improves', sub: 'Low-rated recipes replaced monthly' },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.label}</div>
              <div style={{ color: '#555', fontSize: 13 }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 10: Testimonials ─────────────────────────────────────── */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px', borderBottom: '1px solid #1a1a1a' }}>
        <p style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
          Results
        </p>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 48, letterSpacing: '-0.02em' }}>
          Real people. Real data.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
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
          ].map((t) => (
            <div
              key={t.name}
              style={{
                background: '#0e0e0e',
                border: '1px solid #1e1e1e',
                borderRadius: 14,
                padding: '28px 24px',
              }}
            >
              <div style={{ color: '#a3e635', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                {'★'.repeat(t.stars)}
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.7, color: '#ccc', marginBottom: 20 }}>
                "{t.text}"
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                  <div style={{ color: '#555', fontSize: 12 }}>{t.location}</div>
                </div>
                <div style={{ background: '#a3e6351a', color: '#a3e635', border: '1px solid #a3e63530', borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                  {t.result}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 11: FAQ ──────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px', borderBottom: '1px solid #1a1a1a' }}>
        <p style={{ color: '#a3e635', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
          FAQ
        </p>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 48, letterSpacing: '-0.02em' }}>
          Common questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FAQ.map((item, i) => (
            <div
              key={i}
              style={{
                background: '#0d0d0d',
                border: '1px solid #1a1a1a',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 15,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {item.q}
                <span style={{ color: '#a3e635', fontSize: 18, fontWeight: 300, marginLeft: 16, flexShrink: 0 }}>
                  {openFaq === i ? '−' : '+'}
                </span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 24px 20px', color: '#777', fontSize: 14, lineHeight: 1.8 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 12: Final CTA ────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '80px 24px 100px',
          textAlign: 'center',
        }}
      >
        <h2 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 800,
          lineHeight: 1.05,
          marginBottom: 20,
          letterSpacing: '-0.02em',
        }}>
          Start eating right tomorrow.
          <br />
          <span style={{ color: '#a3e635' }}>Not next Monday.</span>
        </h2>
        <p style={{ color: '#666', fontSize: 16, marginBottom: 40, lineHeight: 1.7 }}>
          Complete onboarding in 2 minutes. Your calorie target is calculated automatically.
          <br />
          First delivery next morning.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          <Link
            href="/onboarding"
            style={{
              background: '#a3e635',
              color: '#080808',
              padding: '16px 40px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              textDecoration: 'none',
            }}
          >
            Start Your Plan →
          </Link>
          <a
            href={`https://wa.me/91XXXXXXXXXX?text=Hi, I want to know more about the ${encodeURIComponent(plan.name)} plan`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#25D366',
              color: '#fff',
              padding: '16px 32px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
            }}
          >
            💬 WhatsApp Us
          </a>
        </div>
        <p style={{ fontSize: 12, color: '#333' }}>
          FSSAI License: 21523035002815 · Pune, Maharashtra
        </p>
      </section>
    </div>
  )
}