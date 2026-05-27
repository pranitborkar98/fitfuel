# FITFUEL — MASTER PROJECT TRACKER

> **Last Updated: May 19, 2026 — Phase 8 COMPLETE — Supplement Guide live (public landing + dashboard). 50 supplements, personalised quiz stack, goal-based recommendations, India pricing, full catalogue.**
> **Platform:** Next.js (React) + Node.js + PostgreSQL (Neon)
> **Deployment:** Vercel — [fitfuel-eosin.vercel.app](https://fitfuel-eosin.vercel.app) → fitfuel.in after launch
> **Mission:** Best meal delivery + health platform in Pune. Meals today. Supplements + AI tomorrow. Empire after that.

---

## PHASE STATUS OVERVIEW

| Phase | Name | Status |
|-------|------|--------|
| 0 | Audit & Planning | Complete |
| 1 | Design System + Tech Stack + DB | Complete |
| 2 | Core Website Redesign | Complete |
| 3 | Meal Plans + Shop + PayU | Complete |
| 4 | User Profile + Dashboard + Auth | Complete |
| 5 | Body Metrics — FitDays BLE | Complete (scale hardware test pending) |
| 6 | Nutrition Tracker | Complete — pushed to main |
| 7 | Exercise Library + Workout Logger | Complete — pushed to main |
| **8** | **Supplement Guide** | **Complete — pushed to main** |
| 9 | Lifestyle Meal Plans (Medical, PCOS, etc.) | Pending |
| 10 | Live Delivery Tracking | Pending |
| 11 | Progress Tracking + Charts | Pending |
| 12 | AI Chatbot + AI Personal Trainer | Pending |
| 13 | Digital Meal Plans (PDF/downloadable) | Pending |
| 14 | Blog, FAQ, Testimonials | Pending |
| 15 | Admin Panel | Pending |
| 16 | Notifications — n8n (WhatsApp + Email) | Pending |
| 17 | QA, Performance, DNS cutover, Launch | Pending |

---

## PHASE 8 — SUPPLEMENT GUIDE — COMPLETE

### Commits
```
feat: phase 8 supplement guide - public landing + dashboard, 50 supplements, quiz stack, India pricing
Pushed → main (May 19 2026)
```

### Files Built & Pushed

| File | Status | Notes |
|------|--------|-------|
| `lib/supplements-data.ts` | Done | Full data layer — 50 supplements, STACKS, VEGAN_SWAPS, resolveStack(), CATEGORY_META, GOAL_META |
| `app/supplements/page.tsx` | Done | Server component — public landing page, auth-aware isLoggedIn prop |
| `app/supplements/SupplementsLanding.tsx` | Done | Public marketing page — hero, goal-based stack preview, full 50-supplement catalogue, detail modal |
| `app/dashboard/supplements/page.tsx` | Done | Server component — auth guard, fetches userGoal from UserProfile |
| `app/dashboard/supplements/SupplementsClient.tsx` | Done | Dashboard client — personalised stack, quiz modal, full catalogue with category filter, supplement modal |

### Features Built

| Feature | Status |
|---------|--------|
| 50 science-backed supplements with full data | Done |
| 13 supplement categories (protein, performance, recovery, vitamins, minerals, adaptogens, joints, gut, weight, hormones, cognitive, sleep, health) | Done |
| 4 supplement goals (muscle_gain, weight_loss, balanced, performance) | Done |
| Pre-built goal stacks (STACKS) | Done |
| Vegan swap logic (VEGAN_SWAPS) | Done |
| 5-step personalisation quiz (goal, frequency, challenge, diet, budget) | Done |
| resolveStack() — vegan swaps + budget cap + challenge boost + B12 injection for vegans | Done |
| Goal-based stack preview on public landing | Done |
| Full 50-supplement catalogue on public landing | Done |
| Category filter tabs (all + 13 categories) | Done |
| Supplement detail modal — benefits, dosage, timing, evidence, study findings, India note, warnings | Done |
| SupplementCard — emoji, category chip, tagline, price, vegan badge, popular badge | Done |
| Dashboard — personalised stack section with quiz/retake quiz | Done |
| Dashboard — full catalogue with category filter | Done |
| QuizModal — 5-step with progress bar, back navigation, animated selection | Done |
| mapProfileGoal() — maps user's profile goal string to SupplementGoal | Done |
| Prices note — estimated pricing, supplier partnership coming soon | Done |
| India-specific notes and availability per supplement | Done |

### Data — supplements-data.ts

| Section | Detail |
|---------|--------|
| Supplement count | 50 |
| Categories covered | protein (5), performance (8), recovery (7), vitamins (4), minerals (4), adaptogens (4), weight (4), joints (3), gut (2), hormones (1), cognitive (1), sleep (1) |
| Fields per supplement | id, name, aka, category, tagline, description, mechanism, benefits, dosage, timing, onsetTime, halfLife, form, cyclingRequired, cyclingProtocol, stacksWith, avoidWith, warnings, sideEffects, genderNotes, ageNotes, evidenceLevel, studyCount, keyStudyFindings, goals, accent, priceRange, valueRating, popular, veganFriendly, certificationNote, emoji, indiaNote, indiaAvailability |
| Evidence levels | very_high (4), high (25+), moderate (15+) |
| Vegan-friendly supplements | ~35 of 50 |
| India availability | widely_available, available, limited, import_only |

### Design System — Phase 8

| Decision | Choice |
|----------|--------|
| Display font | Syne (600/700/800) — consistent with Phase 7 |
| Body font | DM Sans (300/400/500/600) — consistent with Phase 7 |
| Background | #080808 |
| Card background | #101010 / #161616 on hover |
| Accent per category | Protein #a3e635 · Performance #c084fc · Recovery #38bdf8 · Vitamins #fbbf24 · Minerals #94a3b8 · Adaptogens #f97316 · Weight #fb923c · Joints #ec4899 · Gut #10b981 · Hormones #f59e0b · Cognitive #a78bfa · Sleep #818cf8 |
| Quiz accent | #a3e635 (lime green) |
| Grid | repeat(auto-fill, minmax(175px, 1fr)) |
| Max width | 1120px |

### Page Locations
```
/supplements              — public landing (no auth required)
/dashboard/supplements    — personalised dashboard (auth required)
```

### Notes for Phase 9+
- Supplement purchases/ordering not yet implemented — "Coming soon" on price tiles
- No DB schema changes required for Phase 8 — all data is static in supplements-data.ts
- When supplier is confirmed: add SupplementOrder model to Prisma schema, wire up purchase flow
- Dashboard card for supplements should be added to DashboardClient.tsx (link to /dashboard/supplements)
- Barcode scanner for supplement tracking deferred to Phase 11+

---

## PHASE 7 — EXERCISE LIBRARY + WORKOUT LOGGER — COMPLETE

### Commits
```
feat: premium exercise library redesign - fixed encoding, 6-col grid, Syne+DM Sans, per-category colors
fix: lock dark background on html, body, main — kills Tailwind v4 white bleed
Pushed → main (May 18 2026)
```

### Files Built & Pushed

| File | Status | Notes |
|------|--------|-------|
| `app/dashboard/exercises/ExercisesClient.tsx` | Pushed | Full client UI — Browse, Workout, History tabs. Premium redesign. |
| `app/globals.css` | Pushed | Dark bg locked on html + body + main + Next.js wrappers — fixes Tailwind v4 white bleed |

### Features Built

| Feature | Status |
|---------|--------|
| Browse tab — 6-col auto-fill grid (minmax 160px) | Done |
| 30 exercises per page (up from 20) | Done |
| Search — debounced, 873 exercises | Done |
| Filter panel — Category / Level / Equipment / Muscle | Done |
| Per-category color system (accent + glow per category) | Done |
| Level bars (stacked 3-bar visual, color-coded) | Done |
| Exercise card — image, category chip, level bars, muscles, equipment | Done |
| Exercise detail modal — hero images (2-col), muscles, instructions, meta pills | Done |
| Workout tab — start session, name session | Done |
| Live session timer (MM:SS) | Done |
| Add exercises to session (browse mode inside workout) | Done |
| Per-exercise set logger — weight x reps or duration (time-based) | Done |
| Set completion toggle (checkbox) + delete set | Done |
| Add / remove exercises from active session | Done |
| Collapsible exercise cards with progress bar | Done |
| Session stats — exercises, sets done, kcal estimate | Done |
| Finish workout — saves duration + estimated calories to DB | Done |
| History tab — sessions grouped by date | Done |
| History expand — exercises + sets per session | Done |
| Calorie estimate (durationMins x 5 + sets x 3) | Done |

### Design System — Phase 7

| Decision | Choice |
|----------|--------|
| Display font | Syne (600/700/800) |
| Body font | DM Sans (300/400/500/600) |
| Background | #080808 locked globally |
| Card background | #101010 / #161616 on hover |
| Accent | Per-category: Strength #a3e635 · Cardio #fb923c · Stretching #38bdf8 · Plyometrics #c084fc · Powerlifting #f87171 · Strongman #fbbf24 · Olympic #22d3ee |
| Grid | repeat(auto-fill, minmax(160px, 1fr)) — 6 cols on 1120px container |
| Max width | 1120px (up from 1024px) |

### Bug Fixes — Phase 7

| Bug | Fix |
|-----|-----|
| UTF-8 encoding artifacts | Rewrote all string literals cleanly — no special chars in source |
| Only 4 cards per row | Switched to CSS auto-fill minmax(160px,1fr) — now 6 on desktop |
| White background strip on exercise page | globals.css — added html, body, main dark bg + Next.js root wrappers |
| Tailwind v4 Preflight overriding body background | Locked --bg-primary on html, body, main, #__next, [data-nextjs-scroll-focus-boundary] |
| 20 exercises per page — too few for 873 library | Bumped LIMIT to 30 |

### Page Location
```
/dashboard/exercises
```

---

## PHASE 6 — NUTRITION TRACKER — COMPLETE

### Commit
```
feat: phase 6 nutrition tracker - food diary, 50 Indian foods, macro rings, water tracker, goals
Migration: add-nutrition-tracker applied
Seed: seed-nutrition.ts executed — 50 Indian foods + 4 meal types live in Neon
Pushed → main (May 18 2026)
```

### Files Built & Pushed

| File | Status | Notes |
|------|--------|-------|
| `prisma/schema.prisma` | Pushed | v4 — 5 Phase 6 models added, NutritionLog placeholder removed |
| `prisma/seed-nutrition.ts` | Pushed + Executed | 50 Indian foods (per-100g macros) + 4 meal types seeded |
| `app/dashboard/nutrition/page.tsx` | Pushed | Server component — auth guard, SSR initial data (entries + goal + water + meal types) |
| `app/dashboard/nutrition/NutritionClient.tsx` | Pushed | Full client UI — diary, food search modal, macro rings, water tracker, goals modal |
| `app/api/nutrition/foods/route.ts` | Pushed | GET search food library + POST add custom food |
| `app/api/nutrition/diary/route.ts` | Pushed | GET diary by date (entries + meal types + totals) + POST log food entry |
| `app/api/nutrition/diary/[id]/route.ts` | Pushed | DELETE food entry |
| `app/api/nutrition/goals/route.ts` | Pushed | GET goals (or defaults) + PATCH upsert goals |
| `app/api/nutrition/water/route.ts` | Pushed | GET water for date + POST add/subtract/set daily total |

### Schema Changes (Phase 6)
- **Removed:** NutritionLog model (flat placeholder — replaced entirely)
- **Added:** MealType — Breakfast / Lunch / Dinner / Snacks (seeded, global)
- **Added:** FoodItem — food library (global seed foods + user custom foods, per-100g macros)
- **Added:** FoodEntry — diary log (userId, foodItemId, mealTypeId, entryDate, qty, computed macros)
- **Added:** NutritionGoal — daily targets per user (calories, protein, carbs, fat, waterMl)
- **Added:** WaterLog — daily water total per user (one row per user per day, upserted)
- **Updated:** User — added relations: foodItems, foodEntries, nutritionGoal, waterLogs
- Migration name: add-nutrition-tracker

### Features Built

| Feature | Status |
|---------|--------|
| Date navigator — prev/next day (disabled forward past today) | Done |
| SSR initial load for today (no loading flash) | Done |
| Daily summary card — SVG donut ring (calories vs goal) + 3 macro progress bars | Done |
| 4 meal slots — Breakfast / Lunch / Dinner / Snacks (collapsible, kcal total, entry count) | Done |
| Food search modal (full-screen, debounced, popular foods on open) | Done |
| Quantity selector + quick buttons (50/100/150/200g) with live macro preview | Done |
| Log food entry (macros computed server-side from per-100g values) | Done |
| Delete food entry (hover-reveal trash, optimistic UI update) | Done |
| Water tracker (glass buttons 250ml each, tap to add/undo, daily progress bar) | Done |
| Goals modal (edit calories/protein/carbs/fat/waterMl — PATCH upsert) | Done |
| Date change fetches new diary (parallel fetch diary + water) | Done |
| Remaining kcal strip ("X kcal left" or "X kcal over" in red) | Done |
| Custom food support (POST /api/nutrition/foods) | Done |

### API Routes — Phase 6

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/nutrition/foods` | GET | Optional | Search food library (global + user custom) |
| `/api/nutrition/foods` | POST | Required | Add custom food |
| `/api/nutrition/diary` | GET | Required | Fetch diary + meal types + daily totals for a date |
| `/api/nutrition/diary` | POST | Required | Log a food entry (macros computed server-side) |
| `/api/nutrition/diary/[id]` | DELETE | Required | Delete a food entry (ownership verified) |
| `/api/nutrition/diary/[id]` | PATCH | Required | Update food entry quantity (inline edit) |
| `/api/nutrition/goals` | GET | Required | Get user goals (returns defaults if none set) |
| `/api/nutrition/goals` | PATCH | Required | Upsert user goals |
| `/api/nutrition/water` | GET | Required | Get water intake for a date |
| `/api/nutrition/water` | POST | Required | Add/subtract/set daily water (action param) |

---

## PHASE 5 — BODY METRICS — FITDAYS BLE — COMPLETE

### Commit
```
feat: phase 5 body metrics - BLE connect UI, 13 params, manual entry, live dashboard card
4 files changed, 861 insertions(+), 13 deletions(-)
Pushed: f9f3201 → main (May 17 2026, 11:43 PM)
```

### Features Built

| Feature | Status | Notes |
|---------|--------|-------|
| BLE connect UI — "Retry Connect" button | Done | Web Bluetooth API — FitDays GATT profile |
| Manual entry fallback — "+ Manual Entry" | Done | All 13 params manually |
| 13 body metrics display | Done | Weight, BMI, Body Fat, Fat-Free Weight, Subcutaneous Fat, Visceral Fat, Body Water, Skeletal Muscle + more |
| Status badges (Normal / Healthy / Average) | Done | Color-coded per param range |
| Overview / History / Log tabs | Done | History + Log scaffolded |
| API — save metrics to DB | Done | POST /api/user/metrics |
| API — fetch latest metrics | Done | GET /api/user/metrics |
| Dashboard card | Done | Body Metrics card on main dashboard |

### Physical Scale Testing
- **Status: PENDING** — No FitDays scale hardware yet
- BLE UI built to FitDays GATT profile; manual entry fully functional as fallback

---

## PHASE 4 — USER PROFILE + DASHBOARD + AUTH — COMPLETE

### Auth Flow (confirmed working — May 17 2026)
```
User clicks "Continue with Google" → signIn("google", { callbackUrl: "/dashboard" })
→ Google OAuth → /api/auth/callback/google
→ PrismaAdapter writes Session + Account rows to Neon
→ Redirect to /dashboard → Navbar shows avatar + "Pranit" + dropdown
```

### Guest → Auth Merge Flow (confirmed working — May 17 2026)
```
Guest places COD order → guest User row created by email
→ Guest signs in with Google (same email)
→ NextAuth signIn event: finds guest User, re-parents orders + addresses, deletes guest row
→ Dashboard shows merged orders immediately
```

---

## PHASE 3 — MEAL PLANS + SHOP + PAYU — COMPLETE

### PayU Flow (confirmed working)
```
Checkout → POST /api/payments/payu (hash generated server-side)
→ Hidden form → secure.payu.in/_payment
→ PayU POSTs to /order/success → hash verified → /order/confirmation
```

### COD Flow (confirmed working + DB save — May 17 2026)
```
COD selected → POST /api/orders/cod (saves user, address, order, order_item, payment)
→ redirect to /order/confirmation?txnid=COD-xxx&cod=1&order=FF-COD-...
```

### PayU Integration Details

| Field | Value |
|-------|-------|
| Merchant Key | `YviYBu` |
| Merchant Salt | `BHigtcZU3kzvpLC9ZFtnrWMYBVtYWz2R` |
| Mode | Production |
| surl | `https://fitfuel-eosin.vercel.app/order/success` |
| furl | `https://fitfuel-eosin.vercel.app/api/payments/payu/failed` |
| Hash formula | `key\|txnid\|amount\|productinfo\|firstname\|email\|\|\|\|\|\|\|\|\|\|salt` → HMAC-SHA512 |

> Hash must be computed server-side only. Never expose salt to browser.

---

## PRICING MATRIX

### Tier Multipliers
| Tier | Multiplier | Phase | Status |
|------|-----------|-------|--------|
| Standard | 1.0x (base) | Phase 3 | Live |
| Premium | 1.25x on Standard | Phase 8 | Waitlist open |
| Luxury | 1.50x on Standard | Phase 12 | Waitlist open |

### Standard Tier — Active

| Duration | Breakfast + Lunch | Snack + Dinner | All 4 meals |
|----------|-------------------|----------------|-------------|
| Trial day | Rs 400 | Rs 400 | Rs 750 |
| Weekly (7d) | Rs 2,700 | Rs 2,700 | Rs 4,900 |
| Bi-weekly (15d) | Rs 5,775 | Rs 5,775 | Rs 9,720 |
| Monthly excl. weekends | Rs 7,560 | Rs 7,560 | Rs 13,860 |
| 1 Month | Rs 9,500 | Rs 9,500 | Rs 16,999 |
| 2 Months | Rs 18,900 | Rs 18,900 | Rs 33,000 |
| 3 Months | Rs 27,450 | Rs 27,450 | Rs 47,250 |

> Non-Veg Monthly excl. weekends B+L / S+D = Rs 7,600 (not Rs 7,560)

---

## KEY FILES — CURRENT STATE

| File | Status | Notes |
|------|--------|-------|
| `FITFUEL_PROJECT_TRACKER.md` | This file | Updated May 19 2026 — Phase 8 complete |
| `lib/supplements-data.ts` | Done | 50 supplements, all types/interfaces, STACKS, resolveStack(), meta objects |
| `app/supplements/page.tsx` | Done | Server component — public supplements landing, isLoggedIn prop |
| `app/supplements/SupplementsLanding.tsx` | Done | Full public landing — hero, goal stack preview, 50-supplement catalogue, modals |
| `app/dashboard/supplements/page.tsx` | Done | Server component — auth guard, userGoal from UserProfile |
| `app/dashboard/supplements/SupplementsClient.tsx` | Done | Dashboard — personalised stack, 5-step quiz, category filter, full catalogue |
| `prisma/schema.prisma` | Done | v4 — 5 nutrition models, no Phase 8 schema changes needed |
| `prisma/seed.ts` | Done | 17 products, 966 price rows live |
| `prisma/seed-nutrition.ts` | Done | 50 Indian foods + 4 meal types live in Neon |
| `lib/auth.ts` | Done | NextAuth v5 — Google, PrismaAdapter, database sessions, guest merge |
| `lib/prisma.ts` | Done | Prisma 7 singleton — PrismaPg + pg.Pool |
| `app/api/auth/[...nextauth]/route.ts` | Done | NextAuth route handler |
| `app/auth/signin/page.tsx` | Done | Custom sign-in page |
| `app/globals.css` | Done | Dark bg locked on html+body+main+Next.js wrappers — Tailwind v4 fix included |
| `app/layout.tsx` | Done | Navbar + Footer + SessionProvider |
| `app/page.tsx` | Done | Full homepage — 3D card, all sections, Framer Motion |
| `app/plans/page.tsx` | Done | Full pricing page — mobile responsive v2 |
| `app/plans/[slug]/page.tsx` | Done | Individual plan pages |
| `app/about/page.tsx` | Done | Pushed May 16 2026 |
| `app/contact/page.tsx` | Done | Pushed May 16 2026 |
| `app/locations/page.tsx` | Done | Pincode checker, 15 zones, Maps embed |
| `app/checkout/page.tsx` | Done | PayU + COD + Rs 1 test mode |
| `app/order/success/route.ts` | Done | PayU POST handler |
| `app/order/confirmation/page.tsx` | Done | COD + PayU variant |
| `app/api/payments/payu/route.ts` | Done | Hash generator — server-side |
| `app/api/payments/payu/success/route.ts` | Done | Backup success handler |
| `app/api/payments/payu/failed/route.ts` | Done | Failed payment handler |
| `app/api/orders/cod/route.ts` | Done | COD order save to DB |
| `app/dashboard/page.tsx` | Done | Server component — real orders from Neon by userId |
| `app/dashboard/DashboardClient.tsx` | Done | Body Metrics + Nutrition Tracker + Exercise Library all live as LIVE cards |
| `app/dashboard/profile/page.tsx` | Done | Server component — fetches user + profile |
| `app/dashboard/profile/ProfileClient.tsx` | Done | Profile edit form |
| `app/dashboard/body-metrics/page.tsx` | Done | Server component — auth guard, fetches latest metrics |
| `app/dashboard/body-metrics/BodyMetricsClient.tsx` | Done | BLE connect UI, 13 params, manual entry, tabs |
| `app/api/user/metrics/route.ts` | Done | GET + POST body metrics |
| `app/api/user/profile/route.ts` | Done | GET + PATCH user profile |
| `app/dashboard/nutrition/page.tsx` | Done | Server component — SSR today's diary, goal, water |
| `app/dashboard/nutrition/NutritionClient.tsx` | Done | Full nutrition UI — diary, food search, macro rings, water, goals |
| `app/api/nutrition/foods/route.ts` | Done | GET search + POST custom food |
| `app/api/nutrition/diary/route.ts` | Done | GET diary by date + POST log entry |
| `app/api/nutrition/diary/[id]/route.ts` | Done | DELETE entry |
| `app/api/nutrition/goals/route.ts` | Done | GET + PATCH goals |
| `app/api/nutrition/water/route.ts` | Done | GET + POST water |
| `app/dashboard/exercises/page.tsx` | Done | Server component — auth guard, SSR initial exercises + filter options |
| `app/dashboard/exercises/ExercisesClient.tsx` | Done | Premium UI — Browse (6-col), Workout logger, History. Syne+DM Sans. Per-category colors. |
| `app/api/exercises/route.ts` | Done | GET exercises — search, filter, paginate |
| `app/api/exercises/[id]/route.ts` | Done | GET single exercise with instructions |
| `app/api/workout/sessions/route.ts` | Done | GET sessions list + POST create session |
| `app/api/workout/sessions/[id]/route.ts` | Done | PATCH finish session (completedAt, durationMins, caloriesBurned) |
| `app/api/workout/sessions/[id]/exercises/route.ts` | Done | POST add exercise + DELETE remove exercise |
| `app/api/workout/sessions/[id]/exercises/[weId]/sets/route.ts` | Done | POST add set + PATCH update set + DELETE remove set |
| `components/Navbar.tsx` | Done | Auth-aware — avatar + dropdown |
| `components/Footer.tsx` | Done | Contrast audited |

---

## TECH STACK

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.2.6 (React) |
| Styling | Tailwind CSS + custom CSS variables + inline styles (Phase 7/8 dashboard) |
| Fonts | Barlow Condensed (global) · Syne (Phase 7/8 dashboard) · DM Sans (Phase 7/8 dashboard) |
| Animation | Framer Motion |
| Icons | Lucide React |
| State | Zustand (Phase 4+) |
| Auth | NextAuth.js v5 beta — Google OAuth live, Phone OTP (MSG91) Phase 4 |
| Backend | Next.js API routes |
| ORM | Prisma 7 |
| Database | PostgreSQL (Neon — free tier, 0.5GB) |
| Payments | PayU + COD |
| Body Metrics | Web Bluetooth API — FitDays BLE scale (UI built, hardware test pending) |
| Notifications | n8n self-hosted — WhatsApp Business API + Email (Phase 16) |
| Delivery Tracking | Driver PWA — Web Bluetooth / smartphone (Phase 10) |
| AI | Claude API (Anthropic) — Phase 12 |
| Hosting | Vercel (GitHub auto-deploy on push to main) |

---

## PRODUCT TIERS

### Standard — Active (Phase 3 launch)
- Meal delivery — all 5 active plans (Veg, Egg, Non-Veg, Jain, Custom)
- Dashboard: order history, delivery tracking (Phase 10), today's meals (Phase 10)
- Body metrics (manual entry or FitDays BLE UI — hardware test pending) — Phase 5
- Nutrition tracker (calories + macros + water) — Phase 6
- Exercise library + workout logger — Phase 7
- Supplement Guide (public catalogue + personalised stack) — Phase 8
- Digital meal plans (PDFs, sold separately) — Phase 13

### Premium — Coming Soon (Phase 9+) · 1.25x Standard
- Supplement add-ons delivered with meals (ordering flow — pending supplier)
- Full nutrition tracker — macros, micros, plan vs actual
- Exercise library + personalised workout plan
- Priority WhatsApp support
- Weekly PDF check-in report (automated via n8n)

### Luxury — Coming Soon (Phase 12) · 1.50x Standard
- Physical wellness add-ons (massage, spa, in-home yoga — Pune partners)
- AI Personal Trainer (Claude API) — daily plans, form feedback, progressive overload
- Concierge onboarding: 1-on-1 video call with head coach
- Fully custom meal plan (personalised by nutritionist)
- Quarterly body transformation report
- Priority delivery slot (first of the day)

---

## DATABASE — CURRENT STATE (Phase 8 — Schema v4, no schema change in Phase 8)

| Table | Purpose |
|-------|---------|
| users | Auth — email, phone, Google ID, role, emailVerified, image |
| user_profiles | Name, age, gender, height, goal, activity level |
| addresses | Delivery addresses (multiple per user) |
| accounts | NextAuth OAuth account linking |
| sessions | NextAuth database sessions |
| verification_tokens | Email verification (future) |
| meal_plan_products | 17 products (5 live Phase 3, 12 coming soon Phase 9) |
| plan_prices | 966 price rows — full matrix seeded |
| orders | Order header — user, product, plan choice, status |
| order_items | Line items per order |
| payments | PayU + COD transaction records |
| deliveries | Daily delivery status per order |
| active_plans | Currently running subscription per user |
| body_metrics | FitDays scale data — 13 params |
| exercises | Exercise library — name, category, level, equipment, muscles, images, instructions |
| workout_sessions | Session header — name, date, durationMins, caloriesBurned, completedAt |
| workout_exercises | Exercise within a session — orderInSession, notes |
| workout_sets | Set data — reps, weightKg, durationSecs, distanceM, completed |
| meal_types | Breakfast / Lunch / Dinner / Snacks (seeded) |
| food_items | Food library — 50 Indian foods seeded + user custom foods (per-100g macros) |
| food_entries | Diary log — userId, foodItemId, mealTypeId, entryDate, qty, computed macros |
| nutrition_goals | Daily targets per user — calories, protein, carbs, fat, waterMl |
| water_logs | Daily water total per user (one row per user per day, upserted) |

> Note: Supplement data is static in lib/supplements-data.ts — no DB tables needed until ordering is implemented (Phase 9+)

---

## DECISIONS — LOCKED

| # | Topic | Decision |
|---|-------|----------|
| 1 | App vs Website | Website |
| 2 | Keep WordPress? | NO — full rebuild. WordPress backup kept for reference only. |
| 3 | Tech Stack | Next.js + Node.js + PostgreSQL |
| 4 | Deployment | Vercel — subdomain during build, then fitfuel.in |
| 5 | Migration strategy | Soft launch on subdomain — active customers stay on WordPress until cutover |
| 6 | Auth | Phone OTP (MSG91) + Google Sign-In — NextAuth.js v5 |
| 7 | Payment | PayU (confirmed) + Cash on Delivery |
| 8 | Pricing model | Fixed price lookup table from DB — not formula-based |
| 9 | Notifications | n8n self-hosted — WhatsApp Business API + Email |
| 10 | Revenue streams | Meal delivery + Digital plans + Supplements (Premium) + AI Trainer (Luxury) |
| 11 | Admin ops | Solo (owner only) for now |
| 12 | Design | Dark athletic — black #080808, lime #84cc16 / #a3e635, white #ffffff |
| 13 | FitDays / Body Metrics | Web Bluetooth API — in-browser BLE (Chrome) |
| 14 | Delivery Tracking | Driver PWA (smartphone) |
| 15 | Exercise content | Custom 3D animated videos — placeholder (github exercise DB) now, replace Phase 8+ |
| 16 | Language | English only |
| 17 | Target city | Pune only (Kharadi base) — expand later |
| 18 | SparkyFitness | Inspiration + feature reference — build natively |
| 19 | Zomato/Swiggy | Live separately — no website integration |
| 20 | GST | 5% on all meal plan products |
| 21 | Owner email | pranitborkar98@gmail.com |
| 22 | Guest checkout | Keep guest checkout — post-order sign-in nudge on confirmation page (Phase 4 remaining) |
| 23 | Nutrition water logging | Daily total (one row per user per day, upserted) — not individual entries |
| 24 | Nutrition food data | Per-100g storage + compute macros at log time — no variant system in Phase 6 |
| 25 | Exercise library fonts | Syne (display) + DM Sans (body) — scoped to dashboard exercise/supplement pages |
| 26 | Exercise grid | CSS auto-fill minmax(160px,1fr) — 6 cols on desktop, fully responsive |
| 27 | Supplement data storage | Static in lib/supplements-data.ts — no DB until ordering is live (Phase 9+) |
| 28 | Supplement ordering | Deferred — "Coming soon" on price tiles until supplier confirmed |

---

## PENDING INPUTS

| # | What | Phase | Status |
|---|------|-------|--------|
| 1 | MSG91 or Twilio account | 4 | Pending |
| 2 | FitDays scale model number (BLE compatibility check) | 5 | Pending — UI built, need hardware |
| 3 | WhatsApp Business API / Meta Business account | 16 | Pending |
| 4 | Hostinger VPS vs shared (for n8n) | 16 | Pending — check hPanel |
| 5 | Supplement supplier / source | 9+ | Pending |
| 6 | Wellness partner tie-ups (massage/spa) | 12+ | Pending |

---

## THE VISION

FitFuel has been running in Pune since 2024 — real customers, real orders, real operations. This is a full platform revamp, not a launch.

**Now (Phase 8 done):** Supplement Guide live — 50 science-backed supplements, personalised quiz stack, public landing + authenticated dashboard. No DB required — all static data. Syne + DM Sans design system consistent with Phase 7.

**Phase 9:** Lifestyle Meal Plans (Medical, PCOS, etc.) — expand meal product catalogue beyond standard tiers.

**Phase 12:** Unlock Luxury — AI Personal Trainer (Claude API), concierge onboarding, wellness partners. FitFuel becomes Pune's premium health platform.

**Beyond:** Supplement ordering flow once supplier is confirmed. Lifestyle + medical plans, corporate clients, city expansion. Build the infrastructure once, scale it.

Every phase is a building block. Build it right once.