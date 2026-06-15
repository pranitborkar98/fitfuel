// app/api/waitlist/route.ts — Phase 19A
// Captures Premium/Luxury waitlist signups. One row per (email, tier).
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ALLOWED_TIERS = new Set(['PREMIUM', 'LUXURY'])

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as { email?: string; tier?: string } | null
    if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

    const email = (body.email ?? '').trim().toLowerCase()
    const tier  = (body.tier ?? '').trim().toUpperCase()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    if (!ALLOWED_TIERS.has(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

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
