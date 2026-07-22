# FitFuel — Full Audit (Design + Feature-Surfacing + Security)

**Date:** July 22, 2026 · **Mode:** report-only (no code changed) · **For:** Chintu

---

## Executive summary — the one thing that explains almost everything

**The site chrome was built, wired, and then regressed away.** At commit `04324fa` (the F6/F29/F30/F31 launch batch), `app/layout.tsx` rendered `Navbar`, `Footer`, `ChromeGate`, `SessionProvider` (server-hydrated), `ReferralCapture`, Vercel `Analytics`/`SpeedInsights`, a skip-to-content link, and the Barlow Condensed font preload. The five commits that followed (`5aac26e` "CRITICAL FIX" → `3b927d3` "Remove missing imports (providers/toast) to fix build crash") stripped **all of it** while firefighting a build crash. The current root layout renders bare `{children}` with Inter and three raw analytics `<script>` tags.

Consequences on the live site today:

1. **No Navbar, no Footer anywhere** — `components/Navbar.tsx` (442-line flagship mega-menu) and `components/Footer.tsx` (full sitemap footer) are imported by **zero** files. Every page built after the homepage is invisible unless you know its URL.
2. **No `SessionProvider`** — nothing in `app/` mounts one, so any client component calling `useSession()` (the Navbar, notably) would crash if re-mounted as-is. This is almost certainly *why* the Navbar was unplugged rather than fixed.
3. **`ReferralCapture` unmounted** — `?ref=` codes on ordinary URLs are no longer captured and the auto-attribution POST to `/api/attribute-ref` on login never fires. **Partner/referral attribution (a revenue system, Phase 17) is silently broken** except for the `/p/[code]` landing path, which sets its own cookie.
4. **The hardened SEC-6 middleware was replaced** by a naive in-memory rate limiter: all security headers gone, the `/admin`+`/dashboard` cookie gate gone, and a 20 req/min per-IP cap now applies to **all** of `/api/*` — low enough to 429 a normal dashboard session, and ineffective anyway (per-isolate memory on Vercel edge).
5. Marketing pages still reserve `padding-top: 68px` for a fixed navbar that no longer renders — a dead gap at the top of pages like plan detail.

The fix session should start by **restoring the `04324fa` layout + middleware pattern** (with a working `SessionProvider`), not by rebuilding anything from scratch. The chrome already exists and is good.

Two more cross-cutting notes:

- The brief's design reference `.claude/skills/fitfuel-design-system/SKILL.md` **does not exist in the repo** (there is no `.claude/` directory at all). This audit used the tracker's DESIGN SYSTEM section as the reference. Recreating the skill file is itself a gap to log.
- The working tree has four junk **tracked** files deleted but uncommitted (`20)`, `git`, `main`, `plain`) — commit the deletion; also `prisma.zip`, `progress.json`, `seed-progress.json`, `tsconfig.tsbuildinfo` are tracked and shouldn't be (no secrets inside `prisma.zip` — verified, it's a prisma-dir snapshot).

---

## Phase 1 — Feature inventory (ground truth)

### 1a. The feature table

"Reachable from nav" is answered for the **live site as deployed** (navbar/footer unmounted). Parenthetical = would it be reachable if the built Navbar/Footer were restored.

| Feature | Built | Dedicated page | Reachable from nav today | Depth |
|---|---|---|---|---|
| Meal plans catalog (126 plans, master/detail browser) | Y | `/plans`, `/plans/[slug]` | N (Y if navbar restored) — homepage links to `/plans` | Full page |
| Trial day (₹400) | Y | via `/plans?trial=true` | N — homepage CTA only | One section |
| Checkout + COD + coupons + credit | Y | `/checkout` | Via plan detail only | Full page |
| Digital plans (PDF, Starter/Pro) | Y | `/plans/digital`, `/checkout/digital` | N — one homepage feature-rail CTA | Full page |
| Digital PDF generation + Blob caching | Y | `/api/digital-plan/[slug]/pdf` | Dashboard download link | Full (backend) |
| Corporate / B2B | Partial | `/corporate` | N — one homepage link | Thin page; CTA is a **personal Gmail mailto** (`pranitborkar98@gmail.com`) — the #206 contact fix missed it |
| Franchise | N | none | N | **One phrase** in homepage copy ("franchise-ready operating system"); admin-auth comments mention future scoping. Nothing else |
| Gym / partner program (8 partner types incl. GYM, TRAINER, DOCTOR, CORPORATE, RESIDENCE) | Y — full flow: apply, admin CRUD, QR, payouts, `/p/[code]` landings, dashboard | `/partners/apply`, `/dashboard/partners`, `/p/[code]` | N — apply page linked only from unmounted Navbar/Footer | Full flow, invisible; **attribution regression** (see exec summary) |
| P2P referrals + credits | Y | `/dashboard/referrals` | Dashboard nav Y | Full page |
| BLE smart scale (FitDays) | **N** (hardware pending per tracker I.6) | none | — | Homepage has a full "SCALE SYNCED" feature section **presenting it as live**; body-metrics entry is manual. Marketing is ahead of the product |
| Body metrics tracking (incl. BMI) | Y | `/dashboard/body-metrics` | Dashboard nav Y | Full page, but several captured fields never displayed (see 1b) |
| Progress charts (Phase 11) | Y | `/dashboard/progress` | **N — orphaned even inside dashboard nav** | Full page, invisible |
| Nutrition diary + water + goals | Y | `/dashboard/nutrition` | Dashboard nav Y | Full page |
| Exercise library + workout sessions | Y | `/dashboard/exercises` | Dashboard nav Y | Full page |
| Supplements catalog + recommender (LOOP-7/F13) | Y | `/supplements`, `/dashboard/supplements` | N public (homepage rail CTA only); **`/dashboard/supplements` orphaned from dashboard nav** | Full pages |
| Supplement affiliate links + click tracking | Y (10 products seeded; Nutrabay URLs pending — F5 data-entry) | admin surface | — | Full (backend) |
| AI coach — deterministic (weekly review, recalibration, nudges, morning/evening crons) | Y | dashboard card + `/api/coach/*` | Dashboard | Live, no dedicated page (by design) |
| AI trainer — LLM chat + all Phase-12 sub-phases (FOOD-VISION, SLEEP, MOOD, WORKOUT-MODE, MEMORY, LANGUAGE, CYCLE, BLOODWORK, RETENTION, COMMUNITY, COMPLIANCE, IMPORT) | **N** (parked, API-key gated — Block C) | none (`/dashboard/trainer` not built) | — | Nothing (correctly per roadmap) |
| Delivery dispatch + drivers + token portal | Y | `/admin`, `/admin/drivers`, `/driver/[token]` | Admin nav Y | Full flow |
| Delivery generation cron + windows | Y | `/api/cron/generate-deliveries` | — | Full (backend) |
| Notifications (email templates, logs, prefs) | Y | `/admin/notifications`, `/dashboard/notification-settings` | Admin Y; **user prefs page orphaned from dashboard nav** | Full pages |
| WhatsApp notifications | N (deferred, F9/WAHA) | — | — | Nothing |
| Onboarding (5-step, TDEE, plan assignment) | Y | `/onboarding` | Dashboard prompts it | Full flow |
| TDEE calculator (F8 acquisition funnel) | Y | `/tdee-calculator` | **N — orphaned**; in sitemap only (and unmounted Navbar) | Full page, invisible — defeats its acquisition purpose |
| Blog + admin CMS | Y | `/blog`, `/blog/[slug]`, `/admin/content` | N — footer/nav unmounted; linked from a couple of pages | Full pages |
| Testimonials / Results | Y | `/testimonials`, `/results` | **N — orphaned** | Full pages, invisible |
| Trust pages (about, kitchen, ingredients, team, locations, FAQ, how-it-works) | Y | 7 pages | **N — all orphaned** (homepage links only `/our-kitchen`) | Full pages, invisible |
| Legal set (terms, privacy, refund, medical disclaimer, allergen) | Y | 5 pages | N — cross-linked among themselves; footer unmounted | Full pages |
| Admin command center (13 surfaces, RBAC) | Y | `/admin/*` | Admin nav Y | Full |
| Waitlist (Premium/Luxury tiers) | Y | modal in `/plans` | Y via plans | Component |
| Coupons | Y | `/admin/coupons` + checkout validate | Y | Full |
| Sitemap/robots/OG image/icon/manifest/404/error/loading | Y | `app/` root files | — | Present ✓ |

### 1b. Schema fields written but never read anywhere in the frontend

- **`BodyMetric`**: `boneMassKg`, `metabolicAge`, `proteinPct`, `waterPct` — captured by the model (and shown as *fake data* in the homepage scale mock) but never rendered in body-metrics UI. `visceralFat` **is** shown; `muscleMass`/`weight`/`bodyFat` shown via API mapping.
- **`UserProfile`**: `healthConditions`, `dietaryRestrictions`, `allergies` — **collected in onboarding, stored, then read by nothing** (no meal filtering, no display, no kitchen surface). This is collected medical-ish data with zero visible output — both a UX gap and a data-minimization liability. `medicalNotes` is never written or read at all (dead field).
- **`MealPlan.imageUrl`** — tracker-known (F32): exists on every plan, used nowhere.
- `User.avatarUrl` duplicates `User.image` (only `image` is used).

### 1c. Components built but imported by nothing

`Navbar.tsx`, `Footer.tsx`, `ChromeGate.tsx`, `ReferralCapture.tsx` — all four were mounted in the pre-regression layout and are now dead. (`DeliveryWindowToggle` and `ImageUpload` are in use.)

---

## Phase 2 — Frontend surface / IA audit

**Top-priority structural gap (confirmed):** `app/layout.tsx` renders no global Nav/Footer; `app/dashboard/layout.tsx` is a bare passthrough (no dashboard shell either — each page renders its own back-links). Only `/admin` has a real layout shell.

**What a visitor can actually reach by clicking from `/` today:**
`/plans` (→ plan details → checkout), `/plans?trial=true`, `/our-kitchen`, `/corporate`, `/contact`, `/supplements` + `/plans/digital` (feature-rail CTAs), `#finder` (→ plan slugs). From `/plans`: `/plans/digital`. Legal pages cross-link each other once you land on one. That's it — roughly **14 of 55 pages** are reachable; the rest are dark.

**Orphaned public routes** (exist, unreachable by clicking; most are in the unmounted Navbar/Footer and would be cured by restoring them):
`/about`, `/how-it-works`, `/our-ingredients` (one link from allergen-policy only), `/our-team`, `/locations`, `/faq`, `/testimonials`, `/results`, `/blog` (two stray links), `/tdee-calculator`, `/partners/apply`, `/auth/signin` (reachable only when a guarded page bounces you).

**Orphaned inside the dashboard** (needs dashboard-nav additions, not just the global navbar): `/dashboard/progress`, `/dashboard/supplements`, `/dashboard/notification-settings`.

**"Real feature, one line of copy" pattern — confirmed instances:**
- Corporate: full B2B pitch reduced to one homepage link + thin page with a personal-Gmail CTA.
- Gym/partner program: an entire 8-type partner economy (QR codes, payouts, landings) with **zero** public surfacing beyond the unmounted footer link.
- BMI/body-composition tracking: real dashboard feature; publicly appears only inside a homepage mock.
- TDEE calculator: built as an acquisition funnel, linked from nowhere.
- Digital plans: full product with its own checkout; surfaced as one card in a homepage rail.
- BLE scale: the inverse problem — homepage presents as live a feature that is **not built**.

---

## Phase 3 — Design consistency audit

Reference: tracker DESIGN SYSTEM section (the SKILL.md in the brief is missing from the repo — flag to recreate).

1. **Font system is fragmented.** Root layout loads **Inter only**. Twelve files `@import` Google Fonts client-side inside `<style>` tags (FOUC + duplicate network hits). Actual usage by surface: marketing/homepage = Barlow Condensed (+Inter); plans catalog = Barlow Condensed + Space Mono; plan detail = **all five** (Barlow, Syne, DM Sans, Space Mono, Inter); dashboard = Barlow Condensed (tracker says dashboard should be Syne + DM Sans); onboarding = Syne + DM Sans; corporate = Barlow + Syne + DM Sans. The pre-regression layout preloaded Barlow Condensed globally — that's gone too. Needs one decision (which pairing per surface) enforced in the root layout with `next/font`.
2. **Background token split:** `#0a0a0a` (89 uses) vs `#080808` (62 uses, the tracker-locked value) vs `#0d0d0d` (14) vs `#050505` (2). Pages visibly disagree on the base black.
3. **Lime accent** `#84cc16`/`#a3e635` is consistent everywhere ✓. Per-condition accent colors follow the tracker table ✓. Inline-style convention is followed consistently ✓.
4. **"Plating your page…"** is correctly implemented as a transient `app/loading.tsx` route state. If it appears as static content on the live site, that is a **hanging server component** (most likely a DB query blocking a page like `/plans`) — a runtime issue to reproduce during the fix session, not a copy bug.
5. Dead chrome spacing: `PlanDetailClient` (and others) pad 68px for the missing fixed navbar.
6. Placeholder leakage on live pages: `wa.me/91XXXXXXXXXX` in the plan-detail WhatsApp CTA (the #206 fix covered Footer/contact but missed this file); corporate mailto → personal Gmail.
7. Component-pattern drift: plan pricing cards (catalog browser), digital-plan cards, and tier cards each have distinct shapes — acceptable per-surface, but checkout and plan-detail CTAs differ in radius/weight from the locked `.btn-lime` pattern in places. Admin intentionally uses a plain system-ui look (fine, internal).

---

## Phase 4 — Security audit

### Middleware / headers (regression — highest security priority)
Current `middleware.ts` = in-memory Map rate limiter keyed on spoofable-ish headers, 20 req/min across `/api/*` + `/auth/*`. Problems: (a) all SEC-6 security headers removed (X-Frame-Options, nosniff, HSTS, Referrer-Policy, Permissions-Policy); (b) `/admin`+`/dashboard` anonymous-bounce gate removed (pages still self-guard — verified — so this is defence-in-depth loss, not exposure); (c) per-isolate memory = no real limiting on Vercel; (d) 20 req/min will 429 legitimate dashboard usage (the dashboard fires many API calls per view); (e) it shadows the proper shared Upstash limiter (`lib/rate-limit.ts`) that authed routes already use. **Restore the `04324fa` middleware.**

### API route authorization — verified route-by-route
- All 19 `/api/admin/*` routes call `requireApiRole(<surface>)` (fresh DB role read, per-surface RBAC) ✓. `/admin` pages gated by layout + per-page surface checks ✓. Staff surface OWNER-only ✓.
- All `/api/user/*`, `/api/nutrition/*`, `/api/workout/*`, `/api/coach/*`, checkout, partners-apply, PDF routes check `await auth()` ✓; 13 of them additionally rate-limited + Zod-validated (F1) ✓.
- All 5 `/api/cron/*` routes verify QStash signature / CRON_SECRET ✓.
- Intentionally public and acceptable: NextAuth handler; `/api/exercises*` (read-only library); `/api/plans/[slug]/schedule` (read-only public catalog data); `/api/waitlist` + `/api/coupon/validate` (rate-limited); `/api/driver/[token]/*` (capability-URL auth + verifies delivery belongs to that driver ✓ — token in URL is a known accepted trade-off; fine for launch).

### Payments (PayU)
- `success` route: verifies the SHA-512 reverse hash with the merchant salt ✓, idempotent via CONFIRMED early-return ✓, coupon redemption + credit commit idempotent ✓. It does **not** cross-check the posted `amount` against `order.totalRs` — the hash covers amount so forgery requires the salt; add the belt-and-braces check in the fix session anyway.
- `failed` route: no hash verification and unauthenticated — impact is limited to a redirect + log noise, but the `msg` query param is attacker-controlled and reflected on the checkout page; sanitize/verify later. Its "log failure to DB" is still a TODO.

### Secrets / credentials
- No `.env*` files tracked in git ✓. No API keys/passwords found hardcoded in source ✓. Google OAuth via env vars ✓.
- GA / Meta Pixel / Microsoft Clarity IDs are hardcoded raw `<script>`s in the layout (public-by-nature IDs, but they replaced the tracker-chosen Vercel Analytics — decide which stack is canonical).
- Hardcoded DB cuids in seed files (FI blocks, e.g. `seed-recipes-weight-loss-veg.ts`) — known accepted pattern per tracker, but breaks silently on any DB reseed; keep the gate-check scripts in use.
- **F3 (rotate the exposed Upstash token) is still open in the tracker** — ops action, do it.
- `allowDangerousEmailAccountLinking: true` — documented, accepted (SEC-5) while Google is the sole provider; revisit trigger stands.
- Install/patch scripts do **not** write `.env` (checked `install-phase11.ps1`, `patch-schema.ps1`, `migrate-phase7.ps1`, `prisma/patch-seed.ps1`) — the past GOOGLE_CLIENT_ID overwrite incident is not reproducible from current scripts.
- Repo hygiene: tracked junk (`20)`, `git`, `main`, `plain` — deletions staged but uncommitted — plus `prisma.zip`, `progress.json`, `seed-progress.json`, `tsconfig.tsbuildinfo`, and local `.env.local.pulled` lying around untracked.

### Abuse exposure on public forms
`waitlist` and `coupon/validate` rate-limited ✓; `partners/apply` requires session + rate limit ✓; onboarding requires session + rate limit + Zod ✓; contact page has no form (mailto/WhatsApp links) ✓. With the middleware regression, *unauthed* public GETs (plans schedule, exercises) have only the broken in-memory limiter in front of them — restoring proper middleware and/or adding the shared `read` preset there closes it.

### Error handling
No `err.message`/stack leakage to clients found in any API route ✓ (errors are logged server-side, generic messages returned).

---

## Suggested priority order for the fix session

1. **Restore the regressed root layout** from `04324fa`: SessionProvider (server-hydrated) + ChromeGate(Navbar, Footer) + ReferralCapture + skip-link + font strategy — and fix the underlying providers/toast build crash properly instead of deleting the imports. This single item un-hides ~40 pages and un-breaks referral attribution.
2. **Restore the SEC-6 middleware** (security headers + admin/dashboard cookie gate) and delete the in-memory limiter; public read routes get the shared Upstash `read` preset if desired.
3. **Decide the analytics stack** (Vercel Analytics per tracker vs the injected GA/Pixel/Clarity scripts) and keep exactly one setup.
4. **Live-copy bugs:** plan-detail `wa.me/91XXXXXXXXXX` placeholder; corporate mailto → `contact@fitfuel.in`; remove the 68px dead padding once navbar is back (verify, it should then be correct again).
5. **Dashboard IA:** add `/dashboard/progress`, `/dashboard/supplements`, `/dashboard/notification-settings` to the dashboard nav (or build the missing dashboard shell in `app/dashboard/layout.tsx`).
6. **Feature-surfacing pass** (the original complaint): dedicated homepage/nav sections for corporate, partner program, digital plans, TDEE tool; either build BLE-scale honestly as "coming soon" or soften the homepage claim.
7. **Design consolidation:** one background black, `next/font` loading in the layout, per-surface font pairing decision; recreate `.claude/skills/fitfuel-design-system/SKILL.md` so the locked system is enforceable again.
8. **Collected-but-unused data:** wire `healthConditions`/`allergies`/`dietaryRestrictions` into something visible (kitchen/production surface at minimum) or stop collecting; display or drop the extra BodyMetric fields.
9. **Hygiene + ops:** commit the junk-file deletions, untrack `prisma.zip`/build artifacts, rotate the Upstash token (F3), PayU amount cross-check + failed-handler logging.
10. Then the remaining tracker launch items (F4 recipe seeding, F5 Nutrabay URLs, F9 WhatsApp, F12 launch gate) continue as planned.

*Items 1–2 are restorations of code that already exists in git history — they are hours, not days, and everything else in this report assumes they land first.*
