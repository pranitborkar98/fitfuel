// app/api/waitlist/route.ts — Phase 19A · WS-3 hardened (SEC-1/2/3)
// Captures Premium/Luxury waitlist signups. One row per (email, tier).
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enforceRateLimit } from '@/lib/rate-limit'
import { readJson } from '@/lib/validation/core'
import { waitlistSchema } from '@/lib/validation/schemas'

export async function POST(req: NextRequest) {
  try {
    // SEC-1/3: this is the headline spam target — limit hard, by IP.
    const rl = await enforceRateLimit(req, 'waitlist')
    if (!rl.ok) return rl.response

    // SEC-2: size-capped, schema-validated body. email is lower-cased and
    // tier is upper-cased + enum-checked by the schema.
    const parsed = await readJson(req, waitlistSchema)
    if (!parsed.ok) return parsed.response
    const { email, tier } = parsed.data

    const db = prisma as any
    await db.waitlistSignup.upsert({
      where:  { email_tier: { email, tier } },
      create: { email, tier, source: 'plans_page' },
      update: { updatedAt: new Date() },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[/api/waitlist]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
