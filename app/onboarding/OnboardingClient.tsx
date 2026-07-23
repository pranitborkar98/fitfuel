'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Target, Zap, Heart, CheckCircle2,
  ChevronRight, ChevronLeft, Flame, Dumbbell,
  Activity, Scale, Apple
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────
interface FormData {
  // Step 1
  weightKg: string
  heightCm: string
  age: string
  gender: 'male' | 'female' | 'other' | ''
  // Step 2
  goal: string
  targetWeightKg: string
  // Step 3
  activityLevel: string
  dietaryPreference: string
  // Step 4
  healthConditions: string[]
  allergies: string[]
  // Step 5 (computed)
  tdee: number
  calorieTarget: number
  planName: string
}

interface Props {
  userName: string
  userEmail: string
  userImage: string
}

// ── Constants ─────────────────────────────────────────────────
const GOALS = [
  { value: 'weight_loss',            label: 'Lose Weight',        icon: '🔥', desc: 'Burn fat, stay full' },
  { value: 'aggressive_weight_loss', label: 'Aggressive Cut',     icon: '⚡', desc: 'Faster deficit, higher protein' },
  { value: 'muscle_gain',            label: 'Build Muscle',       icon: '💪', desc: 'Calorie surplus, high protein' },
  { value: 'lean_bulk',              label: 'Lean Bulk',          icon: '📈', desc: 'Slow, clean mass gain' },
  { value: 'maintenance',            label: 'Maintain',           icon: '⚖️', desc: 'Eat at your TDEE' },
  { value: 'performance',            label: 'Performance',        icon: '🏆', desc: 'Fuel training and sport' },
]

const ACTIVITY_LEVELS = [
  { value: 'sedentary',        label: 'Sedentary',         desc: 'Desk job, little to no exercise', multiplier: '1.2×' },
  { value: 'lightly_active',   label: 'Lightly Active',    desc: 'Light exercise 1–3 days/week',   multiplier: '1.375×' },
  { value: 'moderately_active',label: 'Moderately Active', desc: 'Moderate exercise 3–5 days/week', multiplier: '1.55×' },
  { value: 'very_active',      label: 'Very Active',       desc: 'Hard exercise 6–7 days/week',    multiplier: '1.725×' },
  { value: 'extremely_active', label: 'Athlete',           desc: 'Twice daily or physical job',    multiplier: '1.9×' },
]

const DIETS = [
  { value: 'vegetarian',    label: 'Vegetarian',    emoji: '🥗' },
  { value: 'eggetarian',    label: 'Eggetarian',    emoji: '🥚' },
  { value: 'non_vegetarian',label: 'Non-Vegetarian', emoji: '🍗' },
  { value: 'jain',          label: 'Jain',          emoji: '🌿' },
  { value: 'vegan',         label: 'Vegan',         emoji: '🌱' },
]

const CONDITIONS = [
  { value: 'none',     label: 'None',            emoji: '✅' },
  { value: 'pcos',     label: 'PCOS',            emoji: '🩷' },
  { value: 'diabetic', label: 'Diabetic',         emoji: '💉' },
  { value: 'thyroid',  label: 'Thyroid',          emoji: '🦋' },
  { value: 'heart',    label: 'Heart Condition',  emoji: '❤️' },
  { value: 'obesity',  label: 'Obesity (BMI 30+)', emoji: '⚕️' },
  { value: 'gut',      label: 'Gut / IBS',        emoji: '🌿' },
  { value: 'other',    label: 'Other',            emoji: '🏥' },
]

const ALLERGIES = [
  { value: 'none',      label: 'No Allergies' },
  { value: 'nuts',      label: 'Tree Nuts' },
  { value: 'dairy',     label: 'Dairy' },
  { value: 'gluten',    label: 'Gluten' },
  { value: 'shellfish', label: 'Shellfish' },
]

const STEPS = [
  { label: 'Your Body',     icon: Scale },
  { label: 'Your Goal',     icon: Target },
  { label: 'Your Lifestyle',icon: Zap },
  { label: 'Health Check',  icon: Heart },
  { label: 'Your Numbers',  icon: CheckCircle2 },
]

// ── Client-side TDEE calculation (mirrors lib/tdee.ts) ────────
function calcTDEE(data: FormData): { tdee: number; target: number } {
  const w = parseFloat(data.weightKg)
  const h = parseFloat(data.heightCm)
  const a = parseInt(data.age)
  if (!w || !h || !a) return { tdee: 0, target: 0 }

  const bmr = data.gender === 'male'
    ? 10 * w + 6.25 * h - 5 * a + 5
    : 10 * w + 6.25 * h - 5 * a - 161

  const multipliers: Record<string, number> = {
    sedentary: 1.2, lightly_active: 1.375,
    moderately_active: 1.55, very_active: 1.725, extremely_active: 1.9,
  }
  const tdee = Math.round(bmr * (multipliers[data.activityLevel] ?? 1.55))

  const adjustments: Record<string, number> = {
    weight_loss: -500, aggressive_weight_loss: -750,
    muscle_gain: 500, lean_bulk: 300,
    maintenance: 0, performance: 200,
  }
  const target = Math.max(1200, tdee + (adjustments[data.goal] ?? 0))

  return { tdee, target }
}

// ── Main Component ─────────────────────────────────────────────
export default function OnboardingClient({ userName }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ tdee: number; calorieTarget: number; planName: string; requiresOrder: boolean } | null>(null)

  const [form, setForm] = useState<FormData>({
    weightKg: '', heightCm: '', age: '', gender: '',
    goal: '', targetWeightKg: '',
    activityLevel: '', dietaryPreference: '',
    healthConditions: [], allergies: [],
    tdee: 0, calorieTarget: 0, planName: '',
  })

  const set = (field: keyof FormData, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const toggleArray = (field: 'healthConditions' | 'allergies', value: string) => {
    setForm(prev => {
      const arr = prev[field] as string[]
      // "none" clears everything else; selecting anything clears "none"
      if (value === 'none') return { ...prev, [field]: ['none'] }
      const without = arr.filter(v => v !== 'none')
      return {
        ...prev,
        [field]: without.includes(value)
          ? without.filter(v => v !== value)
          : [...without, value],
      }
    })
  }

  // ── Validation per step ──────────────────────────────────────
  const canProceed = (): boolean => {
    if (step === 0) return !!(form.weightKg && form.heightCm && form.age && form.gender)
    if (step === 1) return !!form.goal
    if (step === 2) return !!(form.activityLevel && form.dietaryPreference)
    if (step === 3) return form.healthConditions.length > 0 && form.allergies.length > 0
    return true
  }

  // ── Step 4 → 5: compute then show results ───────────────────
  const handleNext = async () => {
    if (step === 3) {
      // Compute before showing step 5
      const { tdee, target } = calcTDEE(form)
      setForm(prev => ({ ...prev, tdee, calorieTarget: target }))
      setStep(4)
      return
    }
    if (step < 4) { setStep(s => s + 1); return }
  }

  // ── Final submit ─────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightKg: parseFloat(form.weightKg),
          heightCm: parseFloat(form.heightCm),
          age: parseInt(form.age),
          gender: form.gender,
          activityLevel: form.activityLevel,
          goal: form.goal,
          dietaryPreference: form.dietaryPreference,
          healthConditions: form.healthConditions.filter(c => c !== 'none'),
          allergies: form.allergies.filter(a => a !== 'none'),
          targetWeightKg: form.targetWeightKg ? parseFloat(form.targetWeightKg) : null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')

      setResult({
        tdee: data.tdee,
        calorieTarget: data.calorieTarget,
        planName: data.plan.displayName,
        requiresOrder: data.requiresOrder ?? false,
      })

      // requiresOrder = true  → profile saved, but no confirmed order found
      //                          send to plans so they can purchase
      // requiresOrder = false → confirmed order existed, plan is live now
      //                          send to dashboard
      setTimeout(
        () => router.push(data.requiresOrder ? '/plans' : '/dashboard'),
        2000
      )
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const { tdee, target: calorieTarget } = calcTDEE(form)

  // ── Styles ────────────────────────────────────────────────────
  const s = {
    wrap: {
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'inherit',
    },
    card: {
      width: '100%',
      maxWidth: 560,
      background: '#101010',
      border: '1px solid #1f1f1f',
      borderRadius: 20,
      overflow: 'hidden',
    },
    progressBar: {
      height: 3,
      background: '#1a1a1a',
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #a3e635, #84cc16)',
      width: `${((step + 1) / 5) * 100}%`,
      transition: 'width 0.4s ease',
    },
    header: {
      padding: '28px 32px 0',
    },
    stepLabel: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.12em',
      color: '#a3e635',
      textTransform: 'uppercase' as const,
      marginBottom: 8,
    },
    title: {
      fontSize: 26,
      fontWeight: 700,
      color: '#ffffff',
      fontFamily: 'var(--ff-cond)',
      lineHeight: 1.2,
      margin: 0,
    },
    subtitle: {
      fontSize: 14,
      color: '#666',
      marginTop: 6,
    },
    body: {
      padding: '24px 32px 32px',
    },
    label: {
      fontSize: 12,
      fontWeight: 600,
      color: '#888',
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
      marginBottom: 8,
      display: 'block',
    },
    input: {
      width: '100%',
      background: '#161616',
      border: '1px solid #2a2a2a',
      borderRadius: 10,
      padding: '12px 16px',
      fontSize: 15,
      color: '#fff',
      outline: 'none',
      boxSizing: 'border-box' as const,
      transition: 'border-color 0.2s',
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
    },
    grid3: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 10,
    },
    optBtn: (active: boolean) => ({
      padding: '14px 12px',
      background: active ? 'rgba(163,230,53,0.12)' : '#161616',
      border: `1.5px solid ${active ? '#a3e635' : '#2a2a2a'}`,
      borderRadius: 12,
      cursor: 'pointer',
      textAlign: 'center' as const,
      transition: 'all 0.15s',
      color: active ? '#a3e635' : '#888',
    }),
    optBtnFull: (active: boolean) => ({
      width: '100%',
      padding: '14px 16px',
      background: active ? 'rgba(163,230,53,0.08)' : '#161616',
      border: `1.5px solid ${active ? '#a3e635' : '#222'}`,
      borderRadius: 12,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      transition: 'all 0.15s',
      marginBottom: 8,
      textAlign: 'left' as const,
    }),
    nextBtn: (disabled: boolean) => ({
      width: '100%',
      padding: '15px',
      background: disabled ? '#1a1a1a' : 'linear-gradient(135deg, #a3e635, #84cc16)',
      border: 'none',
      borderRadius: 12,
      fontSize: 15,
      fontWeight: 700,
      color: disabled ? '#444' : '#080808',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 24,
      transition: 'all 0.2s',
      fontFamily: 'var(--ff-cond)',
    }),
    backBtn: {
      background: 'none',
      border: 'none',
      color: '#555',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 13,
      padding: '8px 0',
      marginBottom: 4,
    },
    statBox: {
      background: '#161616',
      border: '1px solid #222',
      borderRadius: 14,
      padding: '20px 24px',
      textAlign: 'center' as const,
    },
    statNum: {
      fontSize: 36,
      fontWeight: 800,
      color: '#a3e635',
      fontFamily: 'var(--ff-cond)',
      lineHeight: 1,
    },
    statLabel: {
      fontSize: 12,
      color: '#666',
      marginTop: 4,
      letterSpacing: '0.06em',
    },
    errorBox: {
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: 10,
      padding: '12px 16px',
      color: '#f87171',
      fontSize: 13,
      marginTop: 12,
    },
  }

  return (
    <>
      <div style={s.wrap}>
        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center' }}>
          {STEPS.map((st, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: i === step ? '#a3e635' : i < step ? 'rgba(163,230,53,0.2)' : '#161616',
                border: `1.5px solid ${i <= step ? '#a3e635' : '#2a2a2a'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
              }}>
                <st.icon size={14} color={i === step ? '#080808' : i < step ? '#a3e635' : '#444'} />
              </div>
              {i < 4 && <div style={{ width: 20, height: 1, background: i < step ? '#a3e635' : '#222' }} />}
            </div>
          ))}
        </div>

        <div style={s.card}>
          {/* Progress bar */}
          <div style={s.progressBar}>
            <div style={s.progressFill} />
          </div>

          <div style={s.header}>
            {step > 0 && (
              <button style={s.backBtn} onClick={() => setStep(s => s - 1)}>
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <p style={s.stepLabel}>Step {step + 1} of 5 — {STEPS[step].label}</p>
            <h1 style={s.title}>
              {step === 0 && `Hey${userName ? ` ${userName.split(' ')[0]}` : ''}! Tell us about your body`}
              {step === 1 && 'What is your primary goal?'}
              {step === 2 && 'Your lifestyle & diet'}
              {step === 3 && 'Any health conditions?'}
              {step === 4 && 'Your personalised plan'}
            </h1>
            <p style={s.subtitle}>
              {step === 0 && 'We use this to calculate your exact calorie needs.'}
              {step === 1 && 'This determines your calorie target and plan assignment.'}
              {step === 2 && 'Activity level and diet preference shape your daily menu.'}
              {step === 3 && 'Medical conditions get their own specialised plan.'}
              {step === 4 && 'Based on your answers, here\'s your FitFuel plan.'}
            </p>
          </div>

          <div style={s.body}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* ── STEP 0: Body ── */}
                {step === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={s.grid2}>
                      <div>
                        <label style={s.label}>Weight (kg)</label>
                        <input
                          style={s.input}
                          type="number"
                          placeholder="72"
                          value={form.weightKg}
                          onChange={e => set('weightKg', e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={s.label}>Height (cm)</label>
                        <input
                          style={s.input}
                          type="number"
                          placeholder="170"
                          value={form.heightCm}
                          onChange={e => set('heightCm', e.target.value)}
                        />
                      </div>
                    </div>
                    <div style={s.grid2}>
                      <div>
                        <label style={s.label}>Age</label>
                        <input
                          style={s.input}
                          type="number"
                          placeholder="28"
                          value={form.age}
                          onChange={e => set('age', e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={s.label}>Target Weight (kg) — optional</label>
                        <input
                          style={s.input}
                          type="number"
                          placeholder="65"
                          value={form.targetWeightKg}
                          onChange={e => set('targetWeightKg', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={s.label}>Gender</label>
                      <div style={s.grid3}>
                        {(['male', 'female', 'other'] as const).map(g => (
                          <button
                            key={g}
                            style={s.optBtn(form.gender === g)}
                            onClick={() => set('gender', g)}
                          >
                            <div style={{ fontSize: 20, marginBottom: 4 }}>
                              {g === 'male' ? '♂️' : g === 'female' ? '♀️' : '⚧'}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{g}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 1: Goal ── */}
                {step === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {GOALS.map(g => (
                      <button
                        key={g.value}
                        style={s.optBtnFull(form.goal === g.value)}
                        onClick={() => set('goal', g.value)}
                      >
                        <span style={{ fontSize: 22 }}>{g.icon}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: form.goal === g.value ? '#a3e635' : '#ddd' }}>
                            {g.label}
                          </div>
                          <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{g.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* ── STEP 2: Lifestyle ── */}
                {step === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <label style={s.label}>Activity Level</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {ACTIVITY_LEVELS.map(a => (
                          <button
                            key={a.value}
                            style={s.optBtnFull(form.activityLevel === a.value)}
                            onClick={() => set('activityLevel', a.value)}
                          >
                            <div style={{
                              width: 36, height: 36, borderRadius: 8,
                              background: form.activityLevel === a.value ? 'rgba(163,230,53,0.2)' : '#1a1a1a',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              <Activity size={16} color={form.activityLevel === a.value ? '#a3e635' : '#444'} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: form.activityLevel === a.value ? '#a3e635' : '#ddd' }}>
                                {a.label}
                              </div>
                              <div style={{ fontSize: 12, color: '#555', marginTop: 1 }}>{a.desc}</div>
                            </div>
                            <div style={{ fontSize: 12, color: '#444', fontFamily: 'var(--ff-cond)' }}>{a.multiplier}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={s.label}>Dietary Preference</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                        {DIETS.map(d => (
                          <button
                            key={d.value}
                            style={{
                              ...s.optBtn(form.dietaryPreference === d.value),
                              padding: '12px 16px',
                              display: 'flex',
                              flexDirection: 'column' as const,
                              alignItems: 'center',
                              gap: 4,
                              flex: 1,
                              minWidth: 80,
                            }}
                            onClick={() => set('dietaryPreference', d.value)}
                          >
                            <span style={{ fontSize: 22 }}>{d.emoji}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' as const }}>{d.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Health ── */}
                {step === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <label style={s.label}>Health Conditions (select all that apply)</label>
                      <div style={s.grid2}>
                        {CONDITIONS.map(c => (
                          <button
                            key={c.value}
                            style={{
                              ...s.optBtn(form.healthConditions.includes(c.value)),
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '12px 14px',
                              textAlign: 'left' as const,
                            }}
                            onClick={() => toggleArray('healthConditions', c.value)}
                          >
                            <span style={{ fontSize: 18 }}>{c.emoji}</span>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={s.label}>Allergies (select all that apply)</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                        {ALLERGIES.map(a => (
                          <button
                            key={a.value}
                            style={{
                              ...s.optBtn(form.allergies.includes(a.value)),
                              padding: '10px 16px',
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                            onClick={() => toggleArray('allergies', a.value)}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: Results ── */}
                {step === 4 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* TDEE + target */}
                    <div style={s.grid2}>
                      <div style={s.statBox}>
                        <div style={s.statNum}>{tdee.toLocaleString()}</div>
                        <div style={s.statLabel}>YOUR TDEE</div>
                        <div style={{ fontSize: 12, color: '#444', marginTop: 4 }}>calories/day to maintain</div>
                      </div>
                      <div style={{ ...s.statBox, border: '1.5px solid #a3e635', background: 'rgba(163,230,53,0.05)' }}>
                        <div style={s.statNum}>{calorieTarget.toLocaleString()}</div>
                        <div style={{ ...s.statLabel, color: '#a3e635' }}>YOUR TARGET</div>
                        <div style={{ fontSize: 12, color: '#444', marginTop: 4 }}>personalised to your goal</div>
                      </div>
                    </div>

                    {/* Macro preview */}
                    <div style={{ background: '#161616', border: '1px solid #222', borderRadius: 14, padding: 20 }}>
                      <div style={{ fontSize: 12, color: '#555', marginBottom: 12, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
                        Daily Macro Targets
                      </div>
                      <div style={{ display: 'flex', gap: 16 }}>
                        {[
                          // was #60a5fa (blue), the last off-palette hue on a public surface
                          { label: 'Protein', value: Math.round((calorieTarget * 0.30) / 4), unit: 'g', color: '#a3e635' },
                          { label: 'Carbs',   value: Math.round((calorieTarget * 0.43) / 4), unit: 'g', color: '#f59e0b' },
                          { label: 'Fat',     value: Math.round((calorieTarget * 0.27) / 9), unit: 'g', color: '#f87171' },
                        ].map(m => (
                          <div key={m.label} style={{ flex: 1, textAlign: 'center' as const }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: m.color, fontFamily: 'var(--ff-cond)' }}>
                              {m.value}{m.unit}
                            </div>
                            <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Plan assignment */}
                    <div style={{
                      background: 'rgba(163,230,53,0.06)',
                      border: '1px solid rgba(163,230,53,0.2)',
                      borderRadius: 14,
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'rgba(163,230,53,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Apple size={20} color="#a3e635" />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 3 }}>YOUR ASSIGNED PLAN</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'var(--ff-cond)' }}>
                          {/* Will be confirmed by server — show best guess */}
                          {form.goal === 'weight_loss' || form.goal === 'aggressive_weight_loss'
                            ? 'Weight Loss Plan'
                            : form.goal === 'muscle_gain' || form.goal === 'lean_bulk'
                            ? 'Muscle Gain Plan'
                            : 'Balanced Nutrition Plan'
                          }
                        </div>
                        <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                          30-day rotating menu · {calorieTarget.toLocaleString()} kcal/day
                        </div>
                      </div>
                    </div>

                    {error && <div style={s.errorBox}>{error}</div>}

                    {/* Complete button */}
                    <button
                      style={s.nextBtn(loading)}
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span style={{
                            width: 16, height: 16, border: '2px solid #080808',
                            borderTop: '2px solid transparent', borderRadius: '50%',
                            display: 'inline-block', animation: 'spin 0.8s linear infinite',
                          }} />
                          Setting up your plan...
                        </>
                      ) : result?.requiresOrder ? (
                        <>Choose Your Plan &amp; Order <ChevronRight size={18} /></>
                      ) : (
                        <>Start My FitFuel Plan <ChevronRight size={18} /></>
                      )}
                    </button>

                    <p style={{ fontSize: 12, color: '#444', textAlign: 'center' as const, margin: 0 }}>
                      {result?.requiresOrder
                        ? 'Your targets are saved. Complete your order to activate meals.'
                        : 'You can update these details anytime from your profile.'
                      }
                    </p>
                  </div>
                )}

                {/* Next button (steps 0-3) */}
                {step < 4 && (
                  <button
                    style={s.nextBtn(!canProceed())}
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    Continue <ChevronRight size={18} />
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontSize: 12, color: '#333', marginTop: 20, textAlign: 'center' }}>
          FitFuel · FSSAI 21523035002815 · Pune
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: #a3e635 !important; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
        button:hover { opacity: 0.92; }
      `}</style>
    </>
  )
}