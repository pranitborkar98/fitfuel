'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Target, Zap, Heart, CheckCircle2,
  ChevronRight, ChevronLeft,
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
  { value: 'weight_loss',            label: 'Lose Weight', desc: 'Burn fat, stay full' },
  { value: 'aggressive_weight_loss', label: 'Aggressive Cut', desc: 'Faster deficit, higher protein' },
  { value: 'muscle_gain',            label: 'Build Muscle', desc: 'Calorie surplus, high protein' },
  { value: 'lean_bulk',              label: 'Lean Bulk', desc: 'Slow, clean mass gain' },
  { value: 'maintenance',            label: 'Maintain', desc: 'Eat at your TDEE' },
  { value: 'performance',            label: 'Performance', desc: 'Fuel training and sport' },
]

const ACTIVITY_LEVELS = [
  { value: 'sedentary',        label: 'Sedentary',         desc: 'Desk job, little to no exercise', multiplier: '1.2×' },
  { value: 'lightly_active',   label: 'Lightly Active',    desc: 'Light exercise 1–3 days/week',   multiplier: '1.375×' },
  { value: 'moderately_active',label: 'Moderately Active', desc: 'Moderate exercise 3–5 days/week', multiplier: '1.55×' },
  { value: 'very_active',      label: 'Very Active',       desc: 'Hard exercise 6–7 days/week',    multiplier: '1.725×' },
  { value: 'extremely_active', label: 'Athlete',           desc: 'Twice daily or physical job',    multiplier: '1.9×' },
]

const DIETS = [
  { value: 'vegetarian',    label: 'Vegetarian' },
  { value: 'eggetarian',    label: 'Eggetarian' },
  { value: 'non_vegetarian',label: 'Non-Vegetarian' },
  { value: 'jain',          label: 'Jain' },
  { value: 'vegan',         label: 'Vegan' },
]

const CONDITIONS = [
  { value: 'none',     label: 'None' },
  { value: 'pcos',     label: 'PCOS' },
  { value: 'diabetic', label: 'Diabetic' },
  { value: 'thyroid',  label: 'Thyroid' },
  { value: 'heart',    label: 'Heart Condition' },
  { value: 'obesity',  label: 'Obesity (BMI 30+)' },
  { value: 'gut',      label: 'Gut / IBS' },
  { value: 'other',    label: 'Other' },
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

  const set = <K extends keyof FormData>(field: K, value: FormData[K]) =>
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

      const raw: unknown = await res.json().catch(() => ({}))
      const data = typeof raw === 'object' && raw !== null
        ? raw as Record<string, unknown>
        : {}
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Something went wrong')
      const plan = typeof data.plan === 'object' && data.plan !== null
        ? data.plan as Record<string, unknown>
        : null

      setResult({
        tdee: typeof data.tdee === 'number' ? data.tdee : 0,
        calorieTarget: typeof data.calorieTarget === 'number' ? data.calorieTarget : 0,
        planName: plan && typeof plan.displayName === 'string' ? plan.displayName : 'Best-fit plan',
        requiresOrder: data.requiresOrder === true,
      })

      // requiresOrder = true  → profile saved, but no confirmed order found
      //                          send to plans so they can purchase
      // requiresOrder = false → confirmed order existed, plan is live now
      //                          send to dashboard
      setTimeout(
        () => router.push(data.requiresOrder === true ? '/plans' : '/dashboard'),
        2000
      )
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Your profile could not be saved.')
      setLoading(false)
    }
  }

  const { tdee, target: calorieTarget } = calcTDEE(form)

  // ── Styles ────────────────────────────────────────────────────
  const s = {
    wrap: {
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% -10%, rgba(132,204,22,0.10), transparent 28rem), var(--fk-paper)',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(20px, 5vw, 56px) 16px',
      fontFamily: 'inherit',
    },
    card: {
      width: '100%',
      maxWidth: 680,
      background: 'var(--fk-surface)',
      border: '1px solid var(--fk-line-2)',
      borderRadius: 'var(--fk-r-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--fk-shadow-2)',
    },
    progressBar: {
      height: 3,
      background: 'var(--fk-trough)',
    },
    progressFill: {
      height: '100%',
      background: 'var(--fk-green)',
      width: `${((step + 1) / 5) * 100}%`,
      transition: 'width 0.4s ease',
    },
    header: {
      padding: 'clamp(24px, 5vw, 38px) clamp(20px, 5vw, 42px) 0',
    },
    stepLabel: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--fk-green)',
      marginBottom: 8,
    },
    title: {
      fontSize: 'clamp(28px, 6vw, 42px)',
      fontWeight: 580,
      color: 'var(--fk-ink)',
      fontFamily: "var(--fk-display), Georgia, serif",
      letterSpacing: '-0.045em',
      lineHeight: 1.05,
      margin: 0,
    },
    subtitle: {
      fontSize: 14,
      color: 'var(--fk-ink-2)',
      lineHeight: 1.55,
      marginTop: 10,
    },
    body: {
      padding: '28px clamp(20px, 5vw, 42px) clamp(24px, 5vw, 42px)',
    },
    label: {
      fontSize: 13,
      fontWeight: 650,
      color: 'var(--fk-ink-2)',
      marginBottom: 8,
      display: 'block',
    },
    input: {
      width: '100%',
      minHeight: 48,
      background: 'var(--fk-paper)',
      border: '1px solid var(--fk-line-strong)',
      borderRadius: 'var(--fk-r)',
      padding: '12px 16px',
      fontSize: 16,
      color: 'var(--fk-ink)',
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
      minHeight: 48,
      padding: '14px 12px',
      background: active ? 'var(--fk-green-wash)' : 'var(--fk-paper)',
      border: `1.5px solid ${active ? 'var(--fk-green)' : 'var(--fk-line-2)'}`,
      borderRadius: 'var(--fk-r)',
      cursor: 'pointer',
      textAlign: 'center' as const,
      transition: 'all 0.15s',
      color: active ? 'var(--fk-green)' : 'var(--fk-ink-2)',
    }),
    optBtnFull: (active: boolean) => ({
      width: '100%',
      minHeight: 58,
      padding: '14px 16px',
      background: active ? 'var(--fk-green-wash)' : 'var(--fk-paper)',
      border: `1.5px solid ${active ? 'var(--fk-green)' : 'var(--fk-line-2)'}`,
      borderRadius: 'var(--fk-r)',
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
      minHeight: 52,
      padding: '0 18px',
      background: disabled ? 'var(--fk-trough)' : 'var(--fk-green)',
      border: 'none',
      borderRadius: 'var(--fk-r)',
      fontSize: 15,
      fontWeight: 700,
      color: disabled ? 'var(--fk-ink-3)' : 'var(--fk-on-green)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 24,
      transition: 'all 0.2s',
      fontFamily: 'var(--fk-sans)',
    }),
    backBtn: {
      minHeight: 44,
      background: 'none',
      border: 'none',
      color: 'var(--fk-ink-2)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 13,
      padding: '8px 0',
      marginBottom: 4,
    },
    statBox: {
      background: 'var(--fk-paper)',
      border: '1px solid var(--fk-line-2)',
      borderRadius: 'var(--fk-r)',
      padding: '20px 24px',
      textAlign: 'center' as const,
    },
    statNum: {
      fontSize: 36,
      fontWeight: 700,
      color: 'var(--fk-green)',
      fontFamily: 'var(--fk-sans)',
      lineHeight: 1,
    },
    statLabel: {
      fontSize: 12,
      color: 'var(--fk-ink-3)',
      marginTop: 4,
    },
    errorBox: {
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: 'var(--fk-r)',
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
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center' }} aria-label={`Step ${step + 1} of 5`}>
          {STEPS.map((st, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 'var(--fk-r)',
                background: i === step ? 'var(--fk-green)' : i < step ? 'var(--fk-green-wash)' : 'var(--fk-surface)',
                border: `1.5px solid ${i <= step ? 'var(--fk-green)' : 'var(--fk-line-2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
              }}>
                <st.icon size={15} color={i === step ? 'var(--fk-on-green)' : i < step ? 'var(--fk-green)' : 'var(--fk-ink-3)'} />
              </div>
              {i < 4 && <div style={{ width: 20, height: 1, background: i < step ? 'var(--fk-green)' : 'var(--fk-line-2)' }} />}
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
              <button type="button" style={s.backBtn} onClick={() => setStep(s => s - 1)}>
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <p style={s.stepLabel}>Step {step + 1} of 5: {STEPS[step].label}</p>
            <h1 style={s.title}>
              {step === 0 && `Hey${userName ? ` ${userName.split(' ')[0]}` : ''}! Tell us about your body`}
              {step === 1 && 'What is your primary goal?'}
              {step === 2 && 'Your lifestyle & diet'}
              {step === 3 && 'Any health conditions?'}
              {step === 4 && 'Your personalised plan'}
            </h1>
            <p style={s.subtitle}>
              {step === 0 && 'We use this to estimate your daily energy needs.'}
              {step === 1 && 'This determines your calorie target and plan assignment.'}
              {step === 2 && 'Activity level and diet preference shape your daily menu.'}
              {step === 3 && 'Medical conditions get their own specialised plan.'}
              {step === 4 && 'Based on your answers, here\'s your FitFuel plan.'}
            </p>
          </div>

          <div style={s.body}>
            <div key={step}>
                {/* ── STEP 0: Body ── */}
                {step === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={s.grid2}>
                      <div>
                        <label htmlFor="onboarding-weight" style={s.label}>Weight (kg)</label>
                        <input
                          id="onboarding-weight"
                          style={s.input}
                          type="number"
                          placeholder="72"
                          value={form.weightKg}
                          onChange={e => set('weightKg', e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="onboarding-height" style={s.label}>Height (cm)</label>
                        <input
                          id="onboarding-height"
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
                        <label htmlFor="onboarding-age" style={s.label}>Age</label>
                        <input
                          id="onboarding-age"
                          style={s.input}
                          type="number"
                          placeholder="28"
                          value={form.age}
                          onChange={e => set('age', e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="onboarding-target" style={s.label}>Target weight (kg), optional</label>
                        <input
                          id="onboarding-target"
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
                            type="button"
                            aria-pressed={form.gender === g}
                            style={s.optBtn(form.gender === g)}
                            onClick={() => set('gender', g)}
                          >
                            <div style={{ fontSize: 14, fontWeight: 650, textTransform: 'capitalize' }}>{g}</div>
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
                        type="button"
                        aria-pressed={form.goal === g.value}
                        style={s.optBtnFull(form.goal === g.value)}
                        onClick={() => set('goal', g.value)}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 650, color: form.goal === g.value ? 'var(--fk-green)' : 'var(--fk-ink)' }}>
                            {g.label}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--fk-ink-3)', marginTop: 2 }}>{g.desc}</div>
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
                            type="button"
                            aria-pressed={form.activityLevel === a.value}
                            style={s.optBtnFull(form.activityLevel === a.value)}
                            onClick={() => set('activityLevel', a.value)}
                          >
                            <div style={{
                              width: 36, height: 36, borderRadius: 'var(--fk-r)',
                              background: form.activityLevel === a.value ? 'var(--fk-green-wash)' : 'var(--fk-trough)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              <Activity size={16} color={form.activityLevel === a.value ? '#84cc16' : '#85857e'} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 650, color: form.activityLevel === a.value ? 'var(--fk-green)' : 'var(--fk-ink)' }}>
                                {a.label}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--fk-ink-3)', marginTop: 1 }}>{a.desc}</div>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--fk-ink-3)', fontVariantNumeric: 'tabular-nums' }}>{a.multiplier}</div>
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
                            type="button"
                            aria-pressed={form.dietaryPreference === d.value}
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
                            type="button"
                            aria-pressed={form.healthConditions.includes(c.value)}
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
                            type="button"
                            aria-pressed={form.allergies.includes(a.value)}
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
                        <div style={s.statLabel}>Estimated maintenance</div>
                        <div style={{ fontSize: 12, color: 'var(--fk-ink-3)', marginTop: 4 }}>kcal a day</div>
                      </div>
                      <div style={{ ...s.statBox, border: '1.5px solid #84cc16', background: 'rgba(163,230,53,0.05)' }}>
                        <div style={s.statNum}>{calorieTarget.toLocaleString()}</div>
                        <div style={{ ...s.statLabel, color: 'var(--fk-green)' }}>Starting target</div>
                        <div style={{ fontSize: 12, color: 'var(--fk-ink-3)', marginTop: 4 }}>personalised to your goal</div>
                      </div>
                    </div>

                    {/* Macro preview */}
                    <div style={{ background: 'var(--fk-paper)', border: '1px solid var(--fk-line-2)', borderRadius: 'var(--fk-r)', padding: 20 }}>
                      <div style={{ fontSize: 13, color: 'var(--fk-ink-2)', fontWeight: 650, marginBottom: 12 }}>
                        Daily macro targets
                      </div>
                      <div style={{ display: 'flex', gap: 16 }}>
                        {[
                          // was #60a5fa (blue), the last off-palette hue on a public surface
                          { label: 'Protein', value: Math.round((calorieTarget * 0.30) / 4), unit: 'g', color: 'var(--fk-green)' },
                          { label: 'Carbs',   value: Math.round((calorieTarget * 0.43) / 4), unit: 'g', color: 'var(--fk-ink)' },
                          { label: 'Fat',     value: Math.round((calorieTarget * 0.27) / 9), unit: 'g', color: 'var(--fk-ink-2)' },
                        ].map(m => (
                          <div key={m.label} style={{ flex: 1, textAlign: 'center' as const }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: m.color, fontFamily: "var(--fk-display), Georgia, serif" }}>
                              {m.value}{m.unit}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--fk-ink-3)', marginTop: 2 }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Plan assignment */}
                    <div style={{
                      background: 'rgba(163,230,53,0.06)',
                      border: '1px solid rgba(163,230,53,0.2)',
                      borderRadius: 'var(--fk-r)',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 'var(--fk-r)',
                        background: 'rgba(163,230,53,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Apple size={20} color="#84cc16" />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--fk-ink-3)', marginBottom: 3 }}>Recommended starting plan</div>
                        <div style={{ fontSize: 16, fontWeight: 650, color: 'var(--fk-ink)', fontFamily: "var(--fk-display), Georgia, serif" }}>
                          {/* Will be confirmed by server — show best guess */}
                          {form.goal === 'weight_loss' || form.goal === 'aggressive_weight_loss'
                            ? 'Weight Loss Plan'
                            : form.goal === 'muscle_gain' || form.goal === 'lean_bulk'
                            ? 'Muscle Gain Plan'
                            : 'Balanced Nutrition Plan'
                          }
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--fk-ink-3)', marginTop: 2 }}>
                          30-day rotating menu · around {calorieTarget.toLocaleString()} kcal/day
                        </div>
                      </div>
                    </div>

                    {error && <div style={s.errorBox}>{error}</div>}

                    {/* Complete button */}
                    <button
                      type="button"
                      style={s.nextBtn(loading)}
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span style={{
                            width: 16, height: 16, border: '2px solid #070707',
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

                    <p style={{ fontSize: 12, color: 'var(--fk-ink-3)', textAlign: 'center' as const, margin: 0 }}>
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
                    type="button"
                    style={s.nextBtn(!canProceed())}
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    Continue <ChevronRight size={18} />
                  </button>
                )}
              </div>
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontSize: 12, color: 'var(--fk-ink-3)', marginTop: 20, textAlign: 'center' }}>
          FitFuel · FSSAI 21523035002815 · Pune
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: #84cc16 !important; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
        button:hover { opacity: 0.92; }
      `}</style>
    </>
  )
}
