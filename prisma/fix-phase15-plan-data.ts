// prisma/fix-phase15-plan-data.ts
// Phase 15B data fix — makes the Kitchen Production Dashboard show real numbers.
//
// Problem found via the dashboard: active subscribers were attached to
// `weight-loss-vegan` (0 schedule slots), a stray active-but-empty duplicate of
// the real `weight-loss-veg` (120 slots). Onboarding routes by diet preference,
// so a "vegan" pick created subscribers on a menu-less plan.
//
// This script (idempotent, safe to re-run):
//   1. Repoints active non-digital subscribers OFF any 0-slot plan ONTO weight-loss-veg.
//   2. Deactivates any MealPlan that is isActive=true but has 0 schedule slots.
//   3. Sets weight-loss-veg.cycleLengthDays = the actual number of seeded menu days.
//
// DRY RUN by default — prints the plan, writes nothing.
//   npx tsx prisma/fix-phase15-plan-data.ts            (dry run, no writes)
//   APPLY=1 npx tsx prisma/fix-phase15-plan-data.ts    (apply changes)

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const APPLY = process.env.APPLY === '1'
const CANONICAL_SLUG = 'weight-loss-veg'

async function slotCountByPlan(): Promise<Map<string, number>> {
  const grouped = await prisma.planScheduleSlot.groupBy({
    by: ['mealPlanId'],
    _count: { _all: true },
  })
  const m = new Map<string, number>()
  for (const g of grouped) m.set(g.mealPlanId, g._count._all)
  return m
}

async function main() {
  console.log(`\n=== Phase 15 plan-data fix — ${APPLY ? 'APPLY (writing)' : 'DRY RUN (no writes)'} ===\n`)

  const canonical = await prisma.mealPlan.findUnique({ where: { slug: CANONICAL_SLUG } })
  if (!canonical) {
    console.error(`ABORT: canonical plan "${CANONICAL_SLUG}" not found.`)
    process.exit(1)
  }

  const slotCounts = await slotCountByPlan()
  const canonicalSlots = slotCounts.get(canonical.id) ?? 0
  if (canonicalSlots === 0) {
    console.error(`ABORT: canonical plan "${CANONICAL_SLUG}" has 0 slots — nothing safe to repoint to.`)
    process.exit(1)
  }
  console.log(`Canonical plan: ${canonical.name} (${canonical.slug}) id=${canonical.id} — ${canonicalSlots} slots\n`)

  // ── Snapshot: active physical subscribers grouped by plan ──
  const subs = await prisma.userActivePlan.findMany({
    where: { status: 'active', isDigital: false, orderId: { not: null } },
    select: { id: true, mealPlanId: true, mealPlan: { select: { name: true, slug: true } } },
  })
  const byPlan = new Map<string, { name: string; slug: string; ids: string[] }>()
  for (const s of subs) {
    const e = byPlan.get(s.mealPlanId) ?? { name: s.mealPlan.name, slug: s.mealPlan.slug, ids: [] }
    e.ids.push(s.id)
    byPlan.set(s.mealPlanId, e)
  }

  console.log('Active physical subscribers by plan:')
  for (const [pid, e] of byPlan) {
    console.log(`  ${e.name} (${e.slug}) — ${e.ids.length} subs — ${slotCounts.get(pid) ?? 0} slots${pid === canonical.id ? '  <- canonical' : ''}`)
  }
  console.log('')

  // ── 1. Repoint subscribers on 0-slot plans -> canonical ──
  const strandedIds: string[] = []
  for (const [pid, e] of byPlan) {
    if (pid === canonical.id) continue
    if ((slotCounts.get(pid) ?? 0) === 0) {
      strandedIds.push(...e.ids)
      console.log(`REPOINT: ${e.ids.length} subscribers off "${e.slug}" (0 slots) -> "${CANONICAL_SLUG}"`)
    }
  }
  if (strandedIds.length && APPLY) {
    await prisma.userActivePlan.updateMany({
      where: { id: { in: strandedIds } },
      data: { mealPlanId: canonical.id },
    })
  }
  if (!strandedIds.length) console.log('REPOINT: none needed.')

  // ── 2. Deactivate active-but-empty plans ──
  const emptyActive = await prisma.mealPlan.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
  })
  const toDeactivate = emptyActive.filter((p) => (slotCounts.get(p.id) ?? 0) === 0)
  for (const p of toDeactivate) {
    console.log(`DEACTIVATE: "${p.name}" (${p.slug}) is active but has 0 slots -> isActive=false`)
  }
  if (toDeactivate.length && APPLY) {
    await prisma.mealPlan.updateMany({
      where: { id: { in: toDeactivate.map((p) => p.id) } },
      data: { isActive: false },
    })
  }
  if (!toDeactivate.length) console.log('DEACTIVATE: none needed.')

  // ── 3. Align cycleLengthDays with actual seeded days ──
  const days = await prisma.planScheduleSlot.findMany({
    where: { mealPlanId: canonical.id },
    select: { dayNumber: true },
    distinct: ['dayNumber'],
  })
  const seededDays = days.length
  if (seededDays > 0 && canonical.cycleLengthDays !== seededDays) {
    console.log(`CYCLE: "${CANONICAL_SLUG}" cycleLengthDays ${canonical.cycleLengthDays} -> ${seededDays} (actual seeded days)`)
    if (APPLY) {
      await prisma.mealPlan.update({
        where: { id: canonical.id },
        data: { cycleLengthDays: seededDays },
      })
    }
  } else {
    console.log(`CYCLE: cycleLengthDays already matches seeded days (${seededDays}).`)
  }

  console.log(`\n${APPLY ? 'Applied.' : 'Dry run complete — re-run with APPLY=1 to write.'}\n`)
}

main()
  .catch((e) => {
    console.error('fix-phase15-plan-data failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
