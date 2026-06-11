'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── Types (unchanged — drop-in compatible) ─────────────────────────────────

interface Recipe {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string | null
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

type MealSlotKey = 'BREAKFAST' | 'LUNCH' | 'SNACK' | 'DINNER'

// ─── Constants ────────────────────────────────────────────────────────────────

const SLOT_LABEL: Record<string, string> = {
  BREAKFAST: 'Breakfast', LUNCH: 'Lunch', SNACK: 'Snack', DINNER: 'Dinner',
}
const SLOT_TIME: Record<string, string> = {
  BREAKFAST: '07:00 — 09:00', LUNCH: '12:30 — 14:00',
  SNACK: '16:00 — 17:00', DINNER: '19:00 — 20:30',
}
const SLOT_DESC: Record<string, string> = {
  BREAKFAST: 'High-protein Indian start. Moong chilla, poha, upma, idli — never boring, always filling.',
  LUNCH: 'A full dal–sabzi–roti or rice plate, built around your largest calorie window of the day.',
  SNACK: 'Low-calorie, high-satiety. Makhana, roasted chana, fruit — kills the 6pm pantry raid.',
  DINNER: 'Light but satisfying. Lower carb, higher protein. Palak paneer, dal tadka, grilled options.',
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
  { q: 'How many meals do I get per day?', a: 'Four meals daily — Breakfast, Lunch, Snack and Dinner. Every box also includes your Morning Boost (a coffee or green-tea sachet). All four are freshly prepared and delivered by 8am.' },
  { q: 'Is the 30-day menu really non-repeating?', a: 'Yes. Every plan runs 30 unique days — 8 breakfast, 10 lunch, 5 snack and 7 dinner variations rotate across the month. No dish repeats in a full cycle.' },
  { q: 'How do I track what I eat?', a: 'After signing in, your dashboard shows today\u2019s four meals. Tap \u201CI ate this\u201D on any meal and it logs the macros automatically and updates your calorie ring. Every gram tracked without manual entry.' },
  { q: 'Can I skip a day or pause the plan?', a: 'Yes. Skip individual dates or pause from the dashboard. Paused days are pushed to your plan end date at no extra cost.' },
  { q: 'What time is delivery?', a: 'All meals arrive by 8am daily across Kharadi and surrounding Pune areas. We prep from 4am using fresh-sourced ingredients.' },
  { q: 'Can I switch plans mid-month?', a: 'Yes. Request a plan switch from your dashboard — the new plan starts from the next delivery day and your calorie targets recalculate against your current profile.' },
  { q: 'Is there a minimum commitment?', a: 'Start with a Trial Day at \u20B9750 — no commitment. Weekly, bi-weekly and monthly options are available, with a lower per-day rate the longer you go.' },
  { q: 'What if I have allergies?', a: 'You declare allergies during onboarding (nuts, dairy, gluten, shellfish). These are flagged on your account and the kitchen accommodates them. See our Allergen Policy for full details.' },
]

const TESTIMONIALS = [
  { name: 'Priya M.', location: 'Kharadi, Pune', result: '\u22126.2 kg / 30 days', text: 'I\u2019ve tried every diet. This is the first time I didn\u2019t have to think. The food showed up, I logged it, and the numbers moved.' },
  { name: 'Rahul S.', location: 'Viman Nagar, Pune', result: 'Consistency 91%', text: 'The tracking is what got me. Watching my consistency score climb from 60 to 91 over four weeks changed how I think about habits.' },
  { name: 'Sneha K.', location: 'Koregaon Park, Pune', result: '30 days completed', text: 'I was sceptical about tiffin food. These aren\u2019t tiffin portions — they\u2019re full meals with proper macros. The rajma and dal are genuinely good.' },
]

// ─── Inline icon set (no emoji — line-drawn, currentColor) ────────────────────

type IconProps = { size?: number; stroke?: number; style?: React.CSSProperties }
const svgBase = (size: number, stroke: number, style?: React.CSSProperties): React.SVGProps<SVGSVGElement> => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', style,
})

const IconSunrise = ({ size = 22, stroke = 1.6, style }: IconProps) => (
  <svg {...svgBase(size, stroke, style)}><path d="M12 3v3M5.6 9.6l-1.4-1.4M18.4 9.6l1.4-1.4M3 15h2M19 15h2M8 15a4 4 0 0 1 8 0" /><path d="M2 19h20" /></svg>
)
const IconSun = ({ size = 22, stroke = 1.6, style }: IconProps) => (
  <svg {...svgBase(size, stroke, style)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
)
const IconSprout = ({ size = 22, stroke = 1.6, style }: IconProps) => (
  <svg {...svgBase(size, stroke, style)}><path d="M12 21v-8" /><path d="M12 13c0-3-2-5-5-5 0 3 2 5 5 5Z" /><path d="M12 11c0-2.5 1.8-4.5 4.5-4.5 0 2.7-2 4.5-4.5 4.5Z" /></svg>
)
const IconMoon = ({ size = 22, stroke = 1.6, style }: IconProps) => (
  <svg {...svgBase(size, stroke, style)}><path d="M20 14.5A8 8 0 0 1 9.5 4 6.5 6.5 0 1 0 20 14.5Z" /></svg>
)
const SLOT_ICON: Record<string, (p: IconProps) => React.ReactElement> = {
  BREAKFAST: IconSunrise, LUNCH: IconSun, SNACK: IconSprout, DINNER: IconMoon,
}

const IconCheck = ({ size = 16, stroke = 2.2, style }: IconProps) => (
  <svg {...svgBase(size, stroke, style)}><path d="M4 12.5l5 5 11-12" /></svg>
)
const IconArrow = ({ size = 16, stroke = 2, style }: IconProps) => (
  <svg {...svgBase(size, stroke, style)}><path d="M4 12h15M13 6l6 6-6 6" /></svg>
)
const IconStar = ({ size = 14, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}><path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6.1 21.3l1.2-6.6L2.5 9.5l6.6-.9L12 2.5Z" /></svg>
)
const IconBars = ({ size = 22, stroke = 1.6, style }: IconProps) => (
  <svg {...svgBase(size, stroke, style)}><path d="M5 20V11M12 20V4M19 20v-6" /></svg>
)
const IconCycle = ({ size = 22, stroke = 1.6, style }: IconProps) => (
  <svg {...svgBase(size, stroke, style)}><path d="M3 11a9 9 0 0 1 15-5.5L21 8M21 13a9 9 0 0 1-15 5.5L3 16" /><path d="M21 4v4h-4M3 20v-4h4" /></svg>
)
const IconTruck = ({ size = 18, stroke = 1.6, style }: IconProps) => (
  <svg {...svgBase(size, stroke, style)}><path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" /></svg>
)
const IconBolt = ({ size = 18, stroke = 1.6, style }: IconProps) => (
  <svg {...svgBase(size, stroke, style)}><path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" /></svg>
)
const IconWhats = ({ size = 18, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4-.1.7.5l.7 1.7c.1.2.1.4 0 .6l-.4.5c-.1.2-.3.3-.1.6.1.3.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.3.1.5.1.6-.1l.6-.7c.2-.3.4-.2.6-.1l1.6.8c.3.1.5.2.5.4.1.1.1.7-.1 1.3Z" /></svg>
)

// Indian veg / non-veg mark (square + dot) — culturally precise, not an emoji
const DietMark = ({ veg }: { veg: boolean }) => {
  const c = veg ? '#3da35a' : '#c0392b'
  return (
    <span style={{ display: 'inline-grid', placeItems: 'center', width: 14, height: 14, border: `1.5px solid ${c}`, borderRadius: 2 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
    </span>
  )
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration = 1300) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setCount(Math.round(eased * target))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])
  return { count, ref }
}

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target) }
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

function useInViewOnce<T extends Element>() {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); obs.disconnect() } }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, seen }
}

// ─── Small composed pieces ────────────────────────────────────────────────────

function Eyebrow({ index, label, color = '#a3e635' }: { index: string; label: string; color?: string }) {
  return (
    <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5, letterSpacing: '0.18em', color, textTransform: 'uppercase', marginBottom: 18 }}>
      <span style={{ color: '#3a3a36' }}>[ {index} ]</span>
      <span style={{ width: 28, height: 1, background: color, opacity: 0.5 }} />
      <span>{label}</span>
    </div>
  )
}

function MacroBar({ p, c, f, height = 8 }: { p: number; c: number; f: number; height?: number }) {
  const pk = p * 4, ck = c * 4, fk = f * 9
  const total = pk + ck + fk || 1
  const seg = (v: number, col: string, key: string) => (
    <div key={key} style={{ width: `${(v / total) * 100}%`, background: col, height: '100%' }} />
  )
  return (
    <div style={{ display: 'flex', height, borderRadius: 99, overflow: 'hidden', background: '#161616', border: '1px solid #1f1f1f' }}>
      {seg(pk, '#a3e635', 'p')}{seg(ck, '#c9c3ac', 'c')}{seg(fk, '#5d5d57', 'f')}
    </div>
  )
}

function CalorieRing({ kcal }: { kcal: number }) {
  const { ref, seen } = useInViewOnce<HTMLDivElement>()
  const R = 78
  const C = 2 * Math.PI * R
  const pct = 0.78 // visual fill for the daily target arc
  return (
    <div ref={ref} style={{ position: 'relative', width: 196, height: 196, margin: '0 auto' }}>
      <svg width="196" height="196" viewBox="0 0 196 196" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="98" cy="98" r={R} fill="none" stroke="#1c1c1c" strokeWidth="10" />
        <circle
          cx="98" cy="98" r={R} fill="none" stroke="url(#ring)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={seen ? C * (1 - pct) : C}
          style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1)', filter: 'drop-shadow(0 0 8px rgba(163,230,53,0.35))' }}
        />
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a3e635" /><stop offset="100%" stopColor="#65a30d" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center' }}>
        <div className="cond" style={{ fontSize: 52, lineHeight: 0.9, color: '#fff', fontWeight: 600 }}>{kcal.toLocaleString('en-IN')}</div>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.22em', color: '#a3e635', marginTop: 6 }}>KCAL / DAY</div>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlanDetailClient({ plan, schedule, day1Slots }: Props) {
  const [activeWeek, setActiveWeek] = useState(1)
  const [showAll, setShowAll] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [pick, setPick] = useState(3)
  const [loaded, setLoaded] = useState(false)
  const [sel, setSel] = useState<Recipe | null>(null)

  useScrollReveal()
  useEffect(() => { setLoaded(true) }, [])

  const totalDays = Object.keys(schedule).length || 30
  const weeks = [1, 2, 3, 4]
  const weekDays = Array.from({ length: 7 }, (_, i) => (activeWeek - 1) * 7 + i + 1).filter((d) => d <= totalDays)

  const isVeg = ['VEG', 'VEGAN', 'JAIN'].includes(plan.dietaryVariant)
  const dietLabel =
    plan.dietaryVariant === 'VEG' ? 'Vegetarian'
    : plan.dietaryVariant === 'EGG' ? 'Eggetarian'
    : plan.dietaryVariant === 'NON_VEG' ? 'Non-Vegetarian'
    : plan.dietaryVariant === 'JAIN' ? 'Jain'
    : 'Vegan'

  const tierLabel = (plan.tier || 'STANDARD').charAt(0) + (plan.tier || 'STANDARD').slice(1).toLowerCase() + ' Plan'

  const calAnim = useAnimatedCounter(plan.avgCaloriesPerDay)
  const proAnim = useAnimatedCounter(plan.avgProteinGrams)

  const heroStats = [
    { value: calAnim.count, ref: calAnim.ref, unit: 'kcal', label: 'Per day' },
    { value: proAnim.count, ref: proAnim.ref, unit: 'g', label: 'Protein' },
    { value: plan.mealsPerDay || 4, unit: '', label: 'Meals / day' },
    { value: plan.cycleLengthDays || 30, unit: '', label: 'Day menu' },
  ]

  const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    background: '#0c0c0c', border: '1px solid #191919', borderRadius: 4, ...extra,
  })

  return (
    <div className="ff-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Barlow+Condensed:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        .ff-root {
          --bg:#080808; --panel:#0c0c0c; --line:#191919; --line-2:#262626;
          --lime:#a3e635; --lime-d:#84cc16; --ink:#f4f3ee; --dim:#8d8d87; --faint:#565651;
          --bone:#efece3; --bone-ink:#16160f; --ember:#e7643c;
          background:var(--bg); color:var(--ink); min-height:100vh; position:relative;
          overflow-x:hidden; font-family:'DM Sans',-apple-system,sans-serif;
          -webkit-font-smoothing:antialiased;
        }
        .ff-root .syne{ font-family:'Syne',sans-serif; }
        .ff-root .cond{ font-family:'Barlow Condensed',sans-serif; font-variant-numeric:tabular-nums; }
        .ff-root .mono{ font-family:'Space Mono',monospace; }

        .grain{ position:fixed; inset:0; z-index:1; pointer-events:none; opacity:.04; mix-blend-mode:overlay;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
        .gridlines{ position:fixed; inset:0; z-index:0; pointer-events:none; opacity:.5;
          background-image:linear-gradient(#ffffff05 1px,transparent 1px),linear-gradient(90deg,#ffffff05 1px,transparent 1px);
          background-size:64px 64px; mask-image:radial-gradient(ellipse 100% 70% at 50% 0%, #000 0%, transparent 75%); }
        .glow-tl{ position:fixed; top:-15%; left:-10%; width:55vw; height:55vw; z-index:0; pointer-events:none;
          background:radial-gradient(circle, rgba(163,230,53,.10) 0%, transparent 60%); filter:blur(20px); }

        .wrap{ max-width:1180px; margin:0 auto; padding:0 32px; position:relative; z-index:2; }
        .sec{ padding:104px 0; border-top:1px solid var(--line); position:relative; z-index:2; }
        .sec:first-of-type{ border-top:none; }

        .reveal{ opacity:0; transform:translateY(34px); transition:opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1); }
        .reveal.is-in{ opacity:1; transform:none; }
        .d1{transition-delay:.08s}.d2{transition-delay:.16s}.d3{transition-delay:.24s}.d4{transition-delay:.32s}

        .enter{ opacity:0; transform:translateY(22px); animation:enter .9s cubic-bezier(.16,1,.3,1) forwards; }
        @keyframes enter{ to{ opacity:1; transform:none; } }
        .e1{animation-delay:.05s}.e2{animation-delay:.13s}.e3{animation-delay:.21s}.e4{animation-delay:.29s}.e5{animation-delay:.37s}.e6{animation-delay:.45s}

        .h1{ font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(44px,7.5vw,92px); line-height:.93; letter-spacing:-.03em; }
        .h2{ font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(30px,4vw,52px); line-height:1.02; letter-spacing:-.025em; }
        .h3{ font-family:'Syne',sans-serif; font-weight:700; font-size:clamp(22px,2.4vw,30px); line-height:1.08; letter-spacing:-.02em; }

        .btn{ display:inline-flex; align-items:center; gap:9px; font-weight:700; font-size:14.5px; text-decoration:none; border-radius:3px; transition:transform .25s cubic-bezier(.16,1,.3,1), box-shadow .25s, background .25s, border-color .25s; cursor:pointer; }
        .btn-lime{ background:var(--lime); color:#0a0a0a; padding:15px 30px; box-shadow:0 0 0 1px rgba(163,230,53,.4), 0 10px 30px -8px rgba(163,230,53,.5); }
        .btn-lime:hover{ transform:translateY(-2px); box-shadow:0 0 0 1px rgba(163,230,53,.6), 0 16px 44px -8px rgba(163,230,53,.65); }
        .btn-ghost{ background:transparent; color:var(--ink); padding:15px 26px; border:1px solid var(--line-2); }
        .btn-ghost:hover{ border-color:#3a3a3a; background:#101010; }
        .btn-wa{ background:#101512; color:#dcf2e3; padding:15px 24px; border:1px solid #1f3a2a; }
        .btn-wa:hover{ border-color:#2c5a3e; background:#0f1a13; }

        .ticker-wrap{ border-top:1px solid var(--line); border-bottom:1px solid var(--line); overflow:hidden; padding:18px 0; position:relative; z-index:2; background:#0a0a0a; }
        .ticker{ display:inline-flex; white-space:nowrap; animation:tick 32s linear infinite; }
        .ticker span{ font-family:'Barlow Condensed',sans-serif; font-weight:600; font-size:18px; letter-spacing:.04em; color:#5a5a55; text-transform:uppercase; padding:0 22px; display:inline-flex; align-items:center; gap:22px; }
        .ticker b{ color:var(--lime); font-weight:600; }
        @keyframes tick{ to{ transform:translateX(-50%); } }

        .ledger-row{ display:grid; grid-template-columns:96px repeat(4,1fr); border:1px solid var(--line); border-top:none; transition:background .25s; }
        .ledger-row:first-child{ border-top:1px solid var(--line); border-radius:4px 4px 0 0; }
        .ledger-row:last-child{ border-radius:0 0 4px 4px; }
        .ledger-row:hover{ background:#0d0d0d; }
        .ledger-cell{ padding:16px 18px; border-left:1px solid var(--line); }
        .ledger-cell:first-child{ border-left:none; }

        .seg{ font-family:'Space Mono',monospace; font-size:11.5px; letter-spacing:.05em; padding:11px 20px; border:1px solid var(--line-2); border-radius:3px; background:transparent; color:var(--dim); cursor:pointer; transition:all .25s; text-transform:uppercase; }
        .seg:hover{ color:var(--ink); border-color:#3a3a3a; }
        .seg.on{ background:var(--lime); color:#0a0a0a; border-color:var(--lime); font-weight:700; }

        .faq-q{ width:100%; text-align:left; background:transparent; border:none; cursor:pointer; padding:22px 0; display:flex; justify-content:space-between; align-items:center; gap:20px; color:var(--ink); font-weight:600; font-size:16px; }
        .faq-body{ max-height:0; overflow:hidden; opacity:0; transition:max-height .5s cubic-bezier(.16,1,.3,1), opacity .4s, padding .4s; }
        .faq-body.open{ max-height:340px; opacity:1; }

        .grid-2{ display:grid; grid-template-columns:1.05fr .95fr; gap:72px; align-items:center; }
        .grid-2-top{ display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:start; }
        .hero-grid{ display:grid; grid-template-columns:1.25fr .75fr; gap:56px; align-items:end; }
        .four{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        .three{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        .day1-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }

        @media (max-width:960px){
          .hero-grid{ grid-template-columns:1fr; gap:44px; }
          .grid-2,.grid-2-top{ grid-template-columns:1fr; gap:44px; }
          .four{ grid-template-columns:1fr 1fr; }
          .three{ grid-template-columns:1fr; }
          .day1-grid{ grid-template-columns:1fr; }
        }
        @media (max-width:640px){
          .wrap{ padding:0 18px; } .sec{ padding:72px 0; }
          .four{ grid-template-columns:1fr 1fr; }
          .ledger-row{ grid-template-columns:1fr; }
          .ledger-cell{ border-left:none; border-top:1px solid var(--line); }
          .ledger-cell:first-child{ border-top:none; }
        }
      `}</style>

      <div className="gridlines" />
      <div className="glow-tl" />
      <div className="grain" />

      {/* ── Document header bar ─────────────────────────────────────────── */}
      <div className="wrap enter" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 32px', borderBottom: '1px solid var(--line)' }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', display: 'flex', gap: 10, alignItems: 'center', color: 'var(--dim)' }}>
          <Link href="/" style={{ color: 'var(--dim)', textDecoration: 'none' }}>FITFUEL</Link>
          <span style={{ color: '#2e2e2e' }}>/</span>
          <Link href="/plans" style={{ color: 'var(--dim)', textDecoration: 'none' }}>PLANS</Link>
          <span style={{ color: '#2e2e2e' }}>/</span>
          <span style={{ color: 'var(--lime)' }}>{plan.slug}</span>
        </div>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.18em', color: 'var(--faint)' }}>PUNE · IND</div>
      </div>

      {/* ── 01 · Hero ───────────────────────────────────────────────────── */}
      <section className="sec" style={{ borderTop: 'none', paddingTop: 76 }}>
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <div className="enter e1" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
                <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--lime)', border: '1px solid #2c3a14', background: '#121807', padding: '6px 13px', borderRadius: 3 }}>{tierLabel}</span>
                <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dim)', border: '1px solid var(--line-2)', padding: '6px 13px', borderRadius: 3, display: 'inline-flex', gap: 8, alignItems: 'center' }}><DietMark veg={isVeg} />{dietLabel}</span>
                <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dim)', border: '1px solid var(--line-2)', padding: '6px 13px', borderRadius: 3 }}>{plan.cycleLengthDays || 30}-Day Cycle</span>
              </div>

              <h1 className="h1 enter e2">{plan.name}</h1>

              <p className="enter e3 mono" style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--dim)', maxWidth: 540, marginTop: 26, letterSpacing: '0.01em' }}>
                {plan.tagline ?? plan.description ?? 'A 30-day meal system engineered to your exact calorie and macro targets — freshly cooked, delivered by 8am, every gram tracked.'}
              </p>

              {/* Spec strip — instrument readout */}
              <div className="enter e4" style={{ display: 'flex', flexWrap: 'wrap', marginTop: 40, border: '1px solid var(--line)', borderRadius: 4, background: '#0a0a0a' }}>
                {heroStats.map((s, i) => (
                  <div key={i} ref={(s as { ref?: React.RefObject<HTMLDivElement> }).ref} style={{ flex: '1 1 130px', padding: '20px 22px', borderLeft: i === 0 ? 'none' : '1px solid var(--line)' }}>
                    <div className="cond" style={{ fontSize: 46, lineHeight: 0.85, color: 'var(--ink)', fontWeight: 600 }}>
                      {s.value}<span style={{ fontSize: 18, color: 'var(--lime)', marginLeft: 3 }}>{s.unit}</span>
                    </div>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--faint)', marginTop: 10 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="enter e5" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 36 }}>
                <Link href="/onboarding" className="btn btn-lime">Start your plan <IconArrow /></Link>
                <a href="#pricing" className="btn btn-ghost">Trial day · ₹750</a>
              </div>
            </div>

            {/* Daily readout instrument card */}
            <div className="enter e4" style={{ ...card({ padding: 28, position: 'relative', overflow: 'hidden' }) }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--lime),transparent)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.2em', color: 'var(--faint)' }}>FITFUEL // DAILY SPEC</div>
                <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.12em', color: 'var(--lime)' }}>LIVE</div>
              </div>

              <CalorieRing kcal={plan.avgCaloriesPerDay} />

              <div style={{ marginTop: 26 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }} className="mono">
                  {[
                    { k: 'P', v: plan.avgProteinGrams, c: '#a3e635' },
                    { k: 'C', v: plan.avgCarbsGrams, c: '#c9c3ac' },
                    { k: 'F', v: plan.avgFatGrams, c: '#5d5d57' },
                  ].map((m) => (
                    <span key={m.k} style={{ fontSize: 12, color: 'var(--dim)' }}>
                      <span style={{ color: m.c }}>{m.k}</span> {m.v}g
                    </span>
                  ))}
                </div>
                <MacroBar p={plan.avgProteinGrams} c={plan.avgCarbsGrams} f={plan.avgFatGrams} />
              </div>

              <div style={{ marginTop: 24, borderTop: '1px solid var(--line)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['No dish repeats in 30 days', 'Delivered by 8am · no fee', 'Per-gram tracking built in'].map((t) => (
                  <div key={t} style={{ display: 'flex', gap: 11, alignItems: 'center', fontSize: 13, color: 'var(--dim)' }}>
                    <span style={{ color: 'var(--lime)', display: 'grid', placeItems: 'center' }}><IconCheck size={14} /></span>{t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ──────────────────────────────────────────────────────── */}
      <div className="ticker-wrap">
        <div className="ticker">
          {[0, 1].map((dup) => (
            <span key={dup}>
              <b>Zero repeats in 30 days</b> — Delivered by 8am — <b>Per-gram tracked</b> — Sourced from Pune APMC — <b>No frying · olive oil only</b> — Adaptive recalibration — <b>The menu is the proof</b> —
            </span>
          ))}
        </div>
      </div>

      {/* ── 02 · Who is this for ────────────────────────────────────────── */}
      <section className="sec">
        <div className="wrap grid-2">
          <div className="reveal">
            <Eyebrow index="02" label="Who is this for" />
            <h2 className="h2">Built for people serious about results.</h2>
            <p style={{ color: 'var(--dim)', lineHeight: 1.85, fontSize: 15.5, marginTop: 24, maxWidth: 460 }}>
              {plan.whoIsItFor ?? 'Not a quick fix — a 30-day system that works when you follow it. The food does the heavy lifting. You eat it, tap \u201CI ate this\u201D, and watch the data build.'}
            </p>
          </div>
          <div className="reveal d2">
            {[
              { t: 'You want to lose weight without starving', d: `${plan.avgCaloriesPerDay} kcal/day across 4 filling meals. High protein keeps you satiated.` },
              { t: 'You\u2019re tired of tracking manually', d: 'Every meal pre-logged. One tap. Macros auto-populated to your diary.' },
              { t: 'You want Indian food, not rabbit food', d: '80% regional Indian cuisine — dal, sabzi, roti, rice, done right.' },
              { t: 'You want progress you can measure', d: 'Weight trend, consistency score and calorie ring, all on one dashboard.' },
            ].map((item, i) => (
              <div key={item.t} style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 18, padding: '22px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)', alignItems: 'baseline' }}>
                <span className="cond" style={{ fontSize: 24, color: 'var(--lime)', fontWeight: 600 }}>0{i + 1}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16.5, color: 'var(--ink)', marginBottom: 6 }}>{item.t}</div>
                  <div style={{ color: 'var(--faint)', fontSize: 13.5, lineHeight: 1.65 }}>{item.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 · What you get ───────────────────────────────────────────── */}
      <section className="sec">
        <div className="wrap">
          <div className="reveal" style={{ marginBottom: 48 }}>
            <Eyebrow index="03" label="What you get" />
            <h2 className="h2">Four meals. Every day.<br />Delivered by 8am.</h2>
          </div>

          <div className="four reveal d1">
            {(['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'] as MealSlotKey[]).map((slot, i) => {
              const Icon = SLOT_ICON[slot]
              return (
                <div key={slot} style={{ ...card({ padding: '26px 22px', display: 'flex', flexDirection: 'column', gap: 14, transition: 'border-color .3s, transform .3s' }) }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2f3a18'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--lime)' }}><Icon size={26} /></span>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--faint)' }}>0{i + 1}</span>
                  </div>
                  <div>
                    <div className="syne" style={{ fontWeight: 700, fontSize: 20, color: 'var(--ink)' }}>{SLOT_LABEL[slot]}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--lime)', letterSpacing: '0.05em', marginTop: 4 }}>{SLOT_TIME[slot]}</div>
                  </div>
                  <div style={{ color: 'var(--dim)', fontSize: 13, lineHeight: 1.65 }}>{SLOT_DESC[slot]}</div>
                </div>
              )
            })}
          </div>

          <div className="reveal d2" style={{ ...card({ marginTop: 16, padding: '18px 24px', display: 'flex', gap: 16, alignItems: 'center' }) }}>
            <span style={{ color: 'var(--lime)' }}><IconBolt size={20} /></span>
            <div style={{ fontSize: 14, color: 'var(--dim)' }}>
              <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Every box includes your Morning Boost</span>
              <span style={{ color: 'var(--faint)', marginLeft: 12 }}>— a coffee or green-tea sachet. The ritual that makes opening the box feel like a start, not a chore.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 04 · The 30-day menu (the proof) ────────────────────────────── */}
      <section id="menu" className="sec">
        <div className="wrap">
          <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 18, marginBottom: 40 }}>
            <div>
              <Eyebrow index="04" label="The full menu" />
              <h2 className="h2">{totalDays} days. Zero repeats.<br /><span style={{ color: 'var(--lime)' }}>Every dish, every macro.</span></h2>
            </div>
            <p className="mono" style={{ fontSize: 12, color: 'var(--faint)', maxWidth: 250, lineHeight: 1.7, letterSpacing: '0.02em' }}>
              No auth wall. No blur. The whole menu is public — because the food is the sales pitch.
            </p>
          </div>

          <div className="reveal d1" style={{ display: 'flex', gap: 8, marginBottom: 26, flexWrap: 'wrap' }}>
            {weeks.map((w) => (
              <button key={w} className={`seg ${activeWeek === w && !showAll ? 'on' : ''}`} onClick={() => { setActiveWeek(w); setShowAll(false) }}>Week {w}</button>
            ))}
            <button className={`seg ${showAll ? 'on' : ''}`} style={{ marginLeft: 'auto' }} onClick={() => setShowAll(!showAll)}>
              {showAll ? '\u2212 Collapse' : '+ All 30 days'}
            </button>
          </div>

          {/* Ledger header */}
          <div className="ledger-row" style={{ background: '#0a0a0a' }}>
            <div className="ledger-cell mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--faint)' }}>DAY</div>
            {(['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'] as MealSlotKey[]).map((s) => (
              <div key={s} className="ledger-cell mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--faint)', textTransform: 'uppercase' }}>{SLOT_LABEL[s]}</div>
            ))}
          </div>

          <div>
            {(showAll ? Array.from({ length: totalDays }, (_, i) => i + 1) : weekDays).map((day) => {
              const daySlots = schedule[day] ?? []
              const byKey: Partial<Record<MealSlotKey, Slot>> = {}
              daySlots.forEach((s) => { byKey[s.mealSlot] = s })
              return (
                <div key={day} className="ledger-row">
                  <div className="ledger-cell" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span className="cond" style={{ fontSize: 30, fontWeight: 600, color: 'var(--ink)', lineHeight: 0.9 }}>{String(day).padStart(2, '0')}</span>
                    <span className="mono" style={{ fontSize: 9.5, color: 'var(--faint)', marginTop: 6 }}>
                      {daySlots.reduce((a, s) => a + s.recipe.caloriesPerServing, 0)} KCAL
                    </span>
                  </div>
                  {(['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'] as MealSlotKey[]).map((sk) => {
                    const s = byKey[sk]
                    return (
                      <div key={sk} className="ledger-cell" onClick={s ? () => setSel(s.recipe) : undefined} onMouseEnter={(e) => { if (s) e.currentTarget.style.background = '#0c0c0c' }} onMouseLeave={(e) => { e.currentTarget.style.background = '' }} style={s ? { cursor: 'pointer' } : undefined}>
                        {s ? (
                          <>
                            <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.35, marginBottom: 7 }}>{s.recipe.name}{s.recipe.imageUrl && <span style={{ color: 'var(--lime)', fontSize: 10, marginLeft: 6 }}>{'\u25C9'}</span>}</div>
                            <div className="mono" style={{ fontSize: 10.5, color: 'var(--faint)', letterSpacing: '0.02em' }}>
                              <span style={{ color: 'var(--lime)' }}>{s.recipe.caloriesPerServing}</span> kcal · {s.recipe.proteinGrams}P {s.recipe.carbsGrams}C {s.recipe.fatGrams}F
                            </div>
                          </>
                        ) : <span className="mono" style={{ fontSize: 11, color: '#2c2c2c' }}>—</span>}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 05 · Day 1 preview ──────────────────────────────────────────── */}
      {day1Slots.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <div className="reveal" style={{ marginBottom: 44 }}>
              <Eyebrow index="05" label="Day 1 preview" />
              <h2 className="h2">Exactly what arrives on Day 1.</h2>
            </div>
            <div className="day1-grid">
              {day1Slots.map((slot, i) => {
                const Icon = SLOT_ICON[slot.mealSlot]
                const r = slot.recipe
                return (
                  <div key={slot.id} className={`reveal d${Math.min(i + 1, 4)}`} style={{ ...card({ padding: 26, transition: 'border-color .3s' }) }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2f3a18' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)' }}>
                    {r.imageUrl && <div style={{ margin: '-26px -26px 18px', height: 160, overflow: 'hidden', borderRadius: '3px 3px 0 0' }}><img src={r.imageUrl} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ color: 'var(--lime)' }}><Icon size={22} /></span>
                        <div>
                          <div className="mono" style={{ fontSize: 11, color: 'var(--lime)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{SLOT_LABEL[slot.mealSlot]}</div>
                          <div className="mono" style={{ fontSize: 10.5, color: 'var(--faint)', marginTop: 3 }}>{SLOT_TIME[slot.mealSlot]}</div>
                        </div>
                      </div>
                      <div className="cond" style={{ fontSize: 38, fontWeight: 600, color: 'var(--ink)', lineHeight: 0.85 }}>
                        {r.caloriesPerServing}<span className="mono" style={{ fontSize: 11, color: 'var(--faint)', marginLeft: 4 }}>kcal</span>
                      </div>
                    </div>

                    <div className="syne" style={{ fontWeight: 700, fontSize: 19, color: 'var(--ink)', lineHeight: 1.25, marginBottom: r.description ? 8 : 16 }}>{r.name}</div>
                    {r.description && <div style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.6, marginBottom: 16 }}>{r.description}</div>}

                    <div className="four" style={{ gap: 8, marginBottom: 14 }}>
                      {[
                        { l: 'Protein', v: `${r.proteinGrams}g`, c: '#a3e635' },
                        { l: 'Carbs', v: `${r.carbsGrams}g`, c: '#c9c3ac' },
                        { l: 'Fat', v: `${r.fatGrams}g`, c: '#8d8d87' },
                        { l: 'Fibre', v: r.fibreGrams != null ? `${r.fibreGrams}g` : '—', c: '#8d8d87' },
                      ].map((m) => (
                        <div key={m.l} style={{ background: '#0f0f0f', border: '1px solid var(--line)', borderRadius: 3, padding: '11px 8px', textAlign: 'center' }}>
                          <div className="cond" style={{ fontSize: 20, fontWeight: 600, color: m.c }}>{m.v}</div>
                          <div className="mono" style={{ fontSize: 8.5, color: 'var(--faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3 }}>{m.l}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mono" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 10.5, color: 'var(--faint)', letterSpacing: '0.03em' }}>
                      {r.cuisineType && <span>{r.cuisineType}</span>}
                      {(r.prepTimeMins || r.cookTimeMins) && <span>{(r.prepTimeMins ?? 0) + (r.cookTimeMins ?? 0)} MIN</span>}
                      {r.servingSizeGrams && <span>{r.servingSizeGrams}G SERVE</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 06 · Nutritional principles (inverted "spec document") ──────── */}
      <section className="sec">
        <div className="wrap grid-2-top">
          {/* The bone document — the unexpected light panel */}
          <div className="reveal" style={{ background: 'var(--bone)', color: 'var(--bone-ink)', borderRadius: 5, padding: '34px 32px', position: 'relative', boxShadow: '0 30px 80px -30px rgba(0,0,0,.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid rgba(20,20,15,.18)', paddingBottom: 16, marginBottom: 22 }}>
              <div>
                <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.18em', color: '#4a5a22' }}>NUTRITIONAL SPEC</div>
                <div className="syne" style={{ fontWeight: 800, fontSize: 23, marginTop: 6, letterSpacing: '-0.02em' }}>In every meal</div>
              </div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '0.1em', textAlign: 'right', color: '#5c5c50', border: '1px solid rgba(20,20,15,.25)', padding: '6px 9px', borderRadius: 3, lineHeight: 1.5 }}>
                FITFUEL<br />VERIFIED
              </div>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#3a3a30', marginBottom: 22 }}>
              {plan.avgCaloriesPerDay} kcal/day is a science-backed target — aggressive enough to move the needle, conservative enough to protect muscle and energy.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {(plan.keyPrinciples?.length ? plan.keyPrinciples : [
                'High protein — preserves muscle during a deficit',
                'Moderate complex carbs — dal, roti, rice, not eliminated',
                'Low saturated fat — olive oil only, zero frying',
                'High fibre — keeps you full, supports gut health',
                'Zero refined sugar in any plan meal',
                'Sourced from Pune APMC — no imported ingredients',
              ]).map((item, i, arr) => (
                <div key={item} style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: 12, alignItems: 'start', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(20,20,15,.1)' : 'none' }}>
                  <span style={{ width: 20, height: 20, borderRadius: 3, background: '#1c2b07', color: 'var(--lime)', display: 'grid', placeItems: 'center', marginTop: 1 }}><IconCheck size={13} stroke={2.6} /></span>
                  <span style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--bone-ink)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What we leave out — dark counterpart */}
          <div className="reveal d2">
            <Eyebrow index="06" label="What we leave out" color="var(--ember)" />
            <h2 className="h2" style={{ fontSize: 'clamp(26px,3vw,38px)', marginBottom: 24 }}>Deliberately not on the plate.</h2>
            <div style={{ ...card({ borderRadius: 5, overflow: 'hidden' }) }}>
              {(plan.whatIsAvoided?.length ? plan.whatIsAvoided : [
                'International-only ingredients (tahini, miso, couscous)',
                'Deep-fried foods of any kind',
                'Refined sugar or maida',
                'Artificial flavours and preservatives',
                'Heavy cream and full-fat cheese in base meals',
                'Mystery macros — every gram is declared',
              ]).map((item, i, arr) => (
                <div key={item} style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: 12, alignItems: 'center', padding: '15px 20px', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <span style={{ color: 'var(--ember)', fontSize: 18, lineHeight: 1 }}>×</span>
                  <span style={{ fontSize: 13.5, color: 'var(--dim)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 07 · Per-gram tracking (the moat) ───────────────────────────── */}
      <section className="sec">
        <div className="wrap grid-2">
          {/* Product UI mockup */}
          <div className="reveal" style={{ ...card({ padding: 24, position: 'relative', overflow: 'hidden' }) }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--lime),transparent)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: 16, marginBottom: 16 }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--faint)' }}>TODAY · DAY 03 / 30</div>
                <div className="syne" style={{ fontWeight: 700, fontSize: 15, marginTop: 5 }}>{plan.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="cond" style={{ fontSize: 30, fontWeight: 600, color: 'var(--lime)', lineHeight: 0.9 }}>669</div>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--faint)', marginTop: 3 }}>/ 1600 KCAL</div>
              </div>
            </div>
            {[
              { slot: 'BREAKFAST', name: 'Moong Dal Chilla', cal: 289, done: true },
              { slot: 'LUNCH', name: 'Rajma Masala + Roti', cal: 380, done: true },
              { slot: 'SNACK', name: 'Makhana Chaat', cal: 156, done: false },
              { slot: 'DINNER', name: 'Palak Paneer + Jowar Roti', cal: 360, done: false },
            ].map((m) => {
              const Icon = SLOT_ICON[m.slot]
              return (
                <div key={m.slot} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid #131313', opacity: m.done ? 1 : 0.55 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ color: m.done ? 'var(--lime)' : 'var(--faint)' }}><Icon size={18} /></span>
                    <div>
                      <div className="mono" style={{ fontSize: 9.5, color: 'var(--faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{SLOT_LABEL[m.slot]}</div>
                      <div style={{ fontSize: 13.5, color: 'var(--ink)', marginTop: 2 }}>{m.name}</div>
                    </div>
                  </div>
                  {m.done
                    ? <span className="mono" style={{ fontSize: 10, color: 'var(--lime)', display: 'flex', alignItems: 'center', gap: 5 }}><IconCheck size={12} /> LOGGED</span>
                    : <span className="mono" style={{ fontSize: 10, color: 'var(--dim)', border: '1px solid var(--line-2)', padding: '5px 11px', borderRadius: 3 }}>I ATE THIS</span>}
                </div>
              )
            })}
            <div style={{ marginTop: 16 }}>
              <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--faint)', marginBottom: 8 }}>
                <span>NET PROGRESS</span><span style={{ color: 'var(--lime)' }}>42%</span>
              </div>
              <div style={{ height: 6, background: '#161616', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: '42%', height: '100%', background: 'linear-gradient(90deg,var(--lime),var(--lime-d))', boxShadow: '0 0 10px rgba(163,230,53,.4)' }} />
              </div>
            </div>
          </div>

          <div className="reveal d2">
            <Eyebrow index="07" label="The data loop" />
            <h2 className="h2">One tap. Every macro logged.</h2>
            <p style={{ color: 'var(--dim)', fontSize: 15, lineHeight: 1.8, margin: '22px 0 30px', maxWidth: 440 }}>
              The food is the door. The loop is the product — every meal, workout and weigh-in feeds an engine that knows you better than any nutritionist.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { t: 'No manual entry', d: 'Every meal pre-loaded. Tap \u201CI ate this\u201D and the macros land in your diary instantly.' },
                { t: 'Calorie ring updates live', d: 'Calories in vs target in real time. Log a workout and the ring adjusts for net calories.' },
                { t: 'Consistency score', d: 'A weekly 0–100 score across meals, workouts and weigh-ins — the number your AI trainer watches.' },
              ].map((item, i, arr) => (
                <div key={item.t} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 16, padding: '18px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <span className="cond" style={{ fontSize: 22, color: 'var(--lime)', fontWeight: 600 }}>0{i + 1}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--ink)', marginBottom: 5 }}>{item.t}</div>
                    <div style={{ color: 'var(--faint)', fontSize: 13.5, lineHeight: 1.65 }}>{item.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 08 · Pricing ────────────────────────────────────────────────── */}
      <section id="pricing" className="sec">
        <div className="wrap">
          <div className="reveal" style={{ marginBottom: 44 }}>
            <Eyebrow index="08" label="Pricing" />
            <h2 className="h2">Start with a trial.<br />Stay for the results.</h2>
            <p className="mono" style={{ color: 'var(--faint)', fontSize: 12.5, marginTop: 18, letterSpacing: '0.02em' }}>ALL 4 MEALS · 4AM PREP · DELIVERED BY 8AM · NO DELIVERY CHARGE</p>
          </div>

          <div className="reveal d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(168px,1fr))', gap: 12, marginBottom: 20 }}>
            {PRICING.map((p, i) => (
              <button key={p.label} onClick={() => setPick(i)} style={{
                background: pick === i ? '#101807' : '#0a0a0a',
                border: pick === i ? '1px solid var(--lime)' : '1px solid var(--line)',
                borderRadius: 4, padding: '22px 18px', cursor: 'pointer', textAlign: 'left', position: 'relative',
                transition: 'all .3s cubic-bezier(.16,1,.3,1)',
                boxShadow: pick === i ? '0 0 0 1px var(--lime), 0 14px 40px -16px rgba(163,230,53,.5)' : 'none',
              }}
                onMouseEnter={(e) => { if (pick !== i) e.currentTarget.style.borderColor = '#333' }}
                onMouseLeave={(e) => { if (pick !== i) e.currentTarget.style.borderColor = 'var(--line)' }}>
                {p.popular && (
                  <span className="mono" style={{ position: 'absolute', top: -9, left: 16, background: 'var(--lime)', color: '#0a0a0a', fontSize: 9, fontWeight: 700, padding: '3px 9px', borderRadius: 2, letterSpacing: '0.1em' }}>POPULAR</span>
                )}
                <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: pick === i ? 'var(--lime)' : 'var(--dim)', marginBottom: 12 }}>{p.label}</div>
                <div className="cond" style={{ fontSize: 34, fontWeight: 600, color: 'var(--ink)', lineHeight: 0.85 }}>₹{p.price.toLocaleString('en-IN')}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--faint)', marginTop: 8 }}>₹{p.perDay}/day</div>
              </button>
            ))}
          </div>

          <div className="reveal d2" style={{ ...card({ borderColor: '#222', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, position: 'relative', overflow: 'hidden' }) }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--lime)' }} />
            <div>
              <div className="syne" style={{ fontWeight: 800, fontSize: 24, color: 'var(--ink)' }}>{PRICING[pick].label} Plan</div>
              <div className="mono" style={{ color: 'var(--faint)', fontSize: 12, marginTop: 8, letterSpacing: '0.02em' }}>
                {PRICING[pick].days} {PRICING[pick].days === 1 ? 'DAY' : 'DAYS'} · ALL 4 MEALS · ₹{PRICING[pick].perDay}/DAY
              </div>
            </div>
            <div style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="cond" style={{ fontSize: 46, fontWeight: 700, color: 'var(--lime)', lineHeight: 0.85 }}>₹{PRICING[pick].price.toLocaleString('en-IN')}</div>
              <Link href="/onboarding" className="btn btn-lime">Order now <IconArrow /></Link>
            </div>
          </div>
          <p className="mono" style={{ fontSize: 11, color: 'var(--faint)', marginTop: 18, letterSpacing: '0.04em' }}>PAYU · UPI · CREDIT / DEBIT · CASH ON DELIVERY</p>
        </div>
      </section>

      {/* ── 09 · Living menu / feedback loop ────────────────────────────── */}
      <section className="sec">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <div className="reveal" style={{ marginBottom: 52, display: 'inline-block' }}>
            <Eyebrow index="09" label="Living menu" />
            <h2 className="h2">Rate your meals. The menu evolves.</h2>
            <p style={{ color: 'var(--dim)', maxWidth: 540, margin: '20px auto 0', lineHeight: 1.8, fontSize: 15 }}>
              Every \u201CI ate this\u201D asks for a 1–5 rating. Low-rated dishes get flagged and replaced. After 30 days, the menu is smarter than the day you started.
            </p>
          </div>
          <div className="three reveal d1" style={{ maxWidth: 880, margin: '0 auto', position: 'relative' }}>
            {[
              { Icon: IconStar, t: 'Rate every meal', d: '1–5 stars, optional note' },
              { Icon: IconBars, t: 'Data aggregates', d: 'Per-recipe average tracked' },
              { Icon: IconCycle, t: 'Menu improves', d: 'Sub-3.0 recipes replaced monthly' },
            ].map(({ Icon, t, d }, i) => (
              <div key={t} style={{ ...card({ padding: '32px 24px' }) }}>
                <div style={{ width: 48, height: 48, borderRadius: 4, border: '1px solid #2c3a18', background: '#101807', color: 'var(--lime)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}><Icon size={22} /></div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--faint)', letterSpacing: '0.14em', marginBottom: 8 }}>STEP 0{i + 1}</div>
                <div className="syne" style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{t}</div>
                <div style={{ color: 'var(--faint)', fontSize: 13 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10 · Testimonials ───────────────────────────────────────────── */}
      <section className="sec">
        <div className="wrap">
          <div className="reveal" style={{ marginBottom: 44 }}>
            <Eyebrow index="10" label="Results" />
            <h2 className="h2">Real people. Real data.</h2>
          </div>
          <div className="three">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={`reveal d${i + 1}`} style={{ ...card({ padding: 28, display: 'flex', flexDirection: 'column', transition: 'border-color .3s' }) }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2a2a2a' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)' }}>
                <div style={{ display: 'flex', gap: 3, color: 'var(--lime)', marginBottom: 18 }}>
                  {Array.from({ length: 5 }).map((_, s) => <IconStar key={s} size={13} />)}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--ink)', marginBottom: 24, flex: 1 }}>“{t.text}”</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 18 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{t.name}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--faint)', marginTop: 3, letterSpacing: '0.04em' }}>{t.location}</div>
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--lime)', border: '1px solid #2c3a18', background: '#101807', padding: '6px 12px', borderRadius: 3, fontWeight: 700 }}>{t.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11 · FAQ ────────────────────────────────────────────────────── */}
      <section className="sec">
        <div className="wrap" style={{ maxWidth: 860 }}>
          <div className="reveal" style={{ marginBottom: 32 }}>
            <Eyebrow index="11" label="FAQ" />
            <h2 className="h2">Common questions.</h2>
          </div>
          <div className="reveal d1">
            {FAQ.map((item, i) => (
              <div key={i} style={{ borderTop: i === 0 ? '1px solid var(--line)' : 'none', borderBottom: '1px solid var(--line)' }}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span className="mono" style={{ fontSize: 11, color: openFaq === i ? 'var(--lime)' : 'var(--faint)' }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ color: openFaq === i ? 'var(--lime)' : 'var(--ink)' }}>{item.q}</span>
                  </span>
                  <span style={{ color: 'var(--lime)', fontSize: 22, fontWeight: 300, flexShrink: 0, transition: 'transform .4s cubic-bezier(.16,1,.3,1)', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                <div className={`faq-body ${openFaq === i ? 'open' : ''}`} style={{ paddingBottom: openFaq === i ? 24 : 0, paddingLeft: 43 }}>
                  <div style={{ color: 'var(--dim)', fontSize: 14.5, lineHeight: 1.8 }}>{item.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12 · Final CTA ──────────────────────────────────────────────── */}
      <section className="sec" style={{ paddingBottom: 120, textAlign: 'center' }}>
        <div className="wrap reveal">
          <h2 className="syne" style={{ fontWeight: 800, fontSize: 'clamp(36px,6vw,72px)', lineHeight: 0.98, letterSpacing: '-0.03em', marginBottom: 22 }}>
            Start eating right tomorrow.<br /><span style={{ color: 'var(--lime)' }}>Not next Monday.</span>
          </h2>
          <p style={{ color: 'var(--dim)', fontSize: 16, lineHeight: 1.7, maxWidth: 480, margin: '0 auto 40px' }}>
            Onboarding takes two minutes. Your calorie target is calculated automatically. First delivery, next morning.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
            <Link href="/onboarding" className="btn btn-lime" style={{ padding: '17px 38px', fontSize: 15.5 }}>Start your plan <IconArrow /></Link>
            <a href={`https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(`Hi, I want to know more about the ${plan.name} plan`)}`} target="_blank" rel="noopener noreferrer" className="btn btn-wa" style={{ padding: '17px 30px' }}>
              <IconWhats size={17} /> WhatsApp us
            </a>
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--faint)', letterSpacing: '0.1em', display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', gap: 7, alignItems: 'center' }}><IconTruck size={14} /> KHARADI · PUNE</span>
            <span>FSSAI 21523035002815</span>
          </div>
        </div>
      </section>

      {sel && (
        <div onClick={() => setSel(null)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 14, maxWidth: 480, width: '100%', maxHeight: '88vh', overflow: 'auto' }}>
            {sel.imageUrl && <img src={sel.imageUrl} alt={sel.name} style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block', borderRadius: '14px 14px 0 0' }} />}
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <h3 className="syne" style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2, margin: 0 }}>{sel.name}</h3>
                <button onClick={() => setSel(null)} style={{ background: 'transparent', border: '1px solid #222', color: 'var(--dim)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{'\u00D7'}</button>
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--faint)', marginTop: 8, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {sel.cuisineType && <span>{sel.cuisineType}</span>}
                {(sel.prepTimeMins || sel.cookTimeMins) && <span>{(sel.prepTimeMins ?? 0) + (sel.cookTimeMins ?? 0)} MIN</span>}
                {sel.servingSizeGrams && <span>{sel.servingSizeGrams}G SERVE</span>}
              </div>
              {sel.description && <p style={{ fontSize: 14, color: 'var(--dim)', lineHeight: 1.65, marginTop: 14 }}>{sel.description}</p>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 18 }}>
                {[
                  { l: 'Kcal', v: String(sel.caloriesPerServing), c: 'var(--lime)' },
                  { l: 'Protein', v: `${sel.proteinGrams}g`, c: '#a3e635' },
                  { l: 'Carbs', v: `${sel.carbsGrams}g`, c: '#c9c3ac' },
                  { l: 'Fat', v: `${sel.fatGrams}g`, c: '#8d8d87' },
                ].map((m) => (
                  <div key={m.l} style={{ background: '#0f0f0f', border: '1px solid #222', borderRadius: 6, padding: '12px 8px', textAlign: 'center' }}>
                    <div className="cond" style={{ fontSize: 20, fontWeight: 600, color: m.c }}>{m.v}</div>
                    <div className="mono" style={{ fontSize: 8.5, color: 'var(--faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3 }}>{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}