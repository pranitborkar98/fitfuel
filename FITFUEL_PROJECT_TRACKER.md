# 🔥 FITFUEL — MASTER PROJECT TRACKER

> **Last Updated: May 18, 2026 — Phase 6 COMPLETE ✅ — Nutrition Tracker live + pushed. Migration `add-nutrition-tracker` applied. 50 Indian foods + 4 meal types seeded to Neon.**
> **Platform:** Next.js (React) + Node.js + PostgreSQL (Neon)
> **Deployment:** Vercel — [fitfuel-eosin.vercel.app](https://fitfuel-eosin.vercel.app) → fitfuel.in after launch
> **Mission:** Best meal delivery + health platform in Pune. Meals today. Supplements + AI tomorrow. Empire after that.

---

## 📍 PHASE STATUS OVERVIEW

| Phase | Name | Status |
|-------|------|--------|
| 0 | Audit & Planning | ✅ Complete |
| 1 | Design System + Tech Stack + DB | ✅ Complete |
| 2 | Core Website Redesign | ✅ Complete |
| 3 | Meal Plans + Shop + PayU | ✅ Complete |
| 4 | User Profile + Dashboard + Auth | ✅ Complete |
| 5 | Body Metrics — FitDays BLE | ✅ Complete (scale hardware test pending) |
| **6** | **Nutrition Tracker** | ✅ **Complete — pushed to main** |
| 7 | Exercise Library | ⏳ Pending |
| 8 | Supplement Guide (Premium Tier) | ⏳ Pending |
| 9 | Lifestyle Meal Plans (Medical, PCOS, etc.) | ⏳ Pending |
| 10 | Live Delivery Tracking | ⏳ Pending |
| 11 | Progress Tracking + Charts | ⏳ Pending |
| 12 | AI Chatbot + AI Personal Trainer | ⏳ Pending |
| 13 | Digital Meal Plans (PDF/downloadable) | ⏳ Pending |
| 14 | Blog, FAQ, Testimonials | ⏳ Pending |
| 15 | Admin Panel | ⏳ Pending |
| 16 | Notifications — n8n (WhatsApp + Email) | ⏳ Pending |
| 17 | QA, Performance, DNS cutover, Launch | ⏳ Pending |

---

## ✅ PHASE 6 — NUTRITION TRACKER — COMPLETE

### Commit
```
feat: phase 6 nutrition tracker - food diary, 50 Indian foods, macro rings, water tracker, goals
Migration: add-nutrition-tracker applied ✅
Seed: seed-nutrition.ts executed — 50 Indian foods + 4 meal types live in Neon ✅
Pushed → main ✅ (May 18 2026)
```

### Files Built & Pushed

| File | Status | Notes |
|------|--------|-------|
| `prisma/schema.prisma` | ✅ Pushed | v4 — 5 Phase 6 models added, NutritionLog placeholder removed |
| `prisma/seed-nutrition.ts` | ✅ Pushed + Executed | 50 Indian foods (per-100g macros) + 4 meal types seeded |
| `app/dashboard/nutrition/page.tsx` | ✅ Pushed | Server component — auth guard, SSR initial data (entries + goal + water + meal types) |
| `app/dashboard/nutrition/NutritionClient.tsx` | ✅ Pushed | Full client UI — diary, food search modal, macro rings, water tracker, goals modal |
| `app/api/nutrition/foods/route.ts` | ✅ Pushed | GET search food library + POST add custom food |
| `app/api/nutrition/diary/route.ts` | ✅ Pushed | GET diary by date (entries + meal types + totals) + POST log food entry |
| `app/api/nutrition/diary/[id]/route.ts` | ✅ Pushed | DELETE food entry |
| `app/api/nutrition/goals/route.ts` | ✅ Pushed | GET goals (or defaults) + PATCH upsert goals |
| `app/api/nutrition/water/route.ts` | ✅ Pushed | GET water for date + POST add/subtract/set daily total |

### Schema Changes (Phase 6)
- **Removed:** `NutritionLog` model (flat placeholder — replaced entirely)
- **Added:** `MealType` — Breakfast / Lunch / Dinner / Snacks (seeded, global)
- **Added:** `FoodItem` — food library (global seed foods + user custom foods, per-100g macros)
- **Added:** `FoodEntry` — diary log (userId, foodItemId, mealTypeId, entryDate, qty, computed macros)
- **Added:** `NutritionGoal` — daily targets per user (calories, protein, carbs, fat, waterMl)
- **Added:** `WaterLog` — daily water total per user (one row per user per day, upserted)
- **Updated:** `User` — added relations: `foodItems`, `foodEntries`, `nutritionGoal`, `waterLogs`
- Migration name: `add-nutrition-tracker` ✅

### Features Built

| Feature | Status |
|---------|--------|
| Date navigator — prev/next day (disabled forward past today) | ✅ Done |
| SSR initial load for today (no loading flash) | ✅ Done |
| Daily summary card — SVG donut ring (calories vs goal) + 3 macro progress bars | ✅ Done |
| 4 meal slots — Breakfast / Lunch / Dinner / Snacks (collapsible, kcal total, entry count) | ✅ Done |
| Food search modal (full-screen, debounced, popular foods on open) | ✅ Done |
| Quantity selector + quick buttons (50/100/150/200g) with live macro preview | ✅ Done |
| Log food entry (macros computed server-side from per-100g values) | ✅ Done |
| Delete food entry (hover-reveal trash, optimistic UI update) | ✅ Done |
| Water tracker (glass buttons 250ml each, tap to add/undo, daily progress bar) | ✅ Done |
| Goals modal (edit calories/protein/carbs/fat/waterMl — PATCH upsert) | ✅ Done |
| Date change fetches new diary (parallel fetch diary + water) | ✅ Done |
| Remaining kcal strip ("X kcal left" or "X kcal over" in red) | ✅ Done |
| Custom food support (POST /api/nutrition/foods) | ✅ Done |

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

### Seed Data — 50 Indian Foods (per 100g, live in Neon ✅)
Categories: Grains & Staples · Dals & Legumes · Vegetables · Dairy · Eggs & Meat · Nuts & Seeds · Fruits · Street Food · Beverages & Supplements

Includes: Basmati Rice, Roti, Paratha, Poha, Upma, Idli, Dosa, Oats, Toor/Masoor/Chana/Moong Dal, Rajma, Chole, Potato, Palak, Bhindi, Tomato, Onion, Gobhi, Gajar, Paneer, Dahi, Milk, Ghee, Butter, Egg (whole/white), Chicken Breast/Thigh, Mutton, Salmon, Rohu, Almonds, Walnuts, Peanuts, Chia Seeds, Banana, Apple, Mango, Papaya, Orange, Guava, Vada Pav, Samosa, Pav Bhaji, Misal Pav, Biryani, Chai, Lassi, Coconut Water, Whey Protein

### 4 Meal Types (Seeded ✅)
| Name | Emoji | Sort Order |
|------|-------|------------|
| Breakfast | 🌅 | 0 |
| Lunch | ☀️ | 1 |
| Dinner | 🌙 | 2 |
| Snacks | 🍎 | 3 |

### Design Notes
- Full-screen food search modal — no drawer, feels native on mobile
- Dark FitFuel theme — `#080808` bg, `#neutral-900` cards, `lime-400` accents
- SVG donut ring with smooth CSS transition for calorie progress
- Water: glass buttons (250ml each), tap filled glass to undo
- Goals modal is bottom sheet — tap outside to dismiss

### What's NOT in Phase 6 (deferred)
| Feature | Phase |
|---------|-------|
| Barcode scanner | 8+ |
| OpenFoodFacts / USDA API integration | 8+ |
| Custom micros beyond 4 macros | 8+ |
| Saved meal combos / templates | 6 v2 |
| Meal planning (weekly) | 9 |
| Multiple goal profiles | 8 Premium |

### Phase 6 — Fully Complete ✅
All files pushed. Nutrition card confirmed live in `DashboardClient.tsx` (Body Metrics + Nutrition Tracker both show as LIVE cards with `ChevronRight` nav).

### Notes for Phase 7
- `burned kcal` stat in Calorie Ring is hardcoded to `0` — Phase 7 workout logging must feed `workout_logs` → burned kcal → this field
- `14-Day Nutrition Trends` section is a single-day placeholder — real 14-day aggregation deferred to Phase 11 (Progress Tracking)
- `PATCH /api/nutrition/diary/[id]` handles inline quantity edits (edit pencil on hover) — not listed in API table above but live and wired

### Page Location
```
/dashboard/nutrition
```

---

## ✅ PHASE 5 — BODY METRICS — FITDAYS BLE — COMPLETE

### Commit
```
feat: phase 5 body metrics - BLE connect UI, 13 params, manual entry, live dashboard card
4 files changed, 861 insertions(+), 13 deletions(-)
Pushed: f9f3201 → main ✅ (May 17 2026, 11:43 PM)
```

### Files Built & Pushed

| File | Status | Notes |
|------|--------|-------|
| `app/dashboard/body-metrics/page.tsx` | ✅ Done | Server component — auth guard, fetches latest metrics from Neon |
| `app/dashboard/body-metrics/BodyMetricsClient.tsx` | ✅ Done | Full client UI — BLE connect, 13 params, manual entry, Overview/History/Log tabs |
| `app/api/user/metrics/route.ts` | ✅ Done | GET + POST — fetches and saves body metrics to Neon by userId |
| `app/dashboard/DashboardClient.tsx` | ✅ Updated | Added Body Metrics card linking to /dashboard/body-metrics |

### Features Built

| Feature | Status | Notes |
|---------|--------|-------|
| BLE connect UI — "Retry Connect" button | ✅ Done | Web Bluetooth API — FitDays GATT profile |
| Manual entry fallback — "+ Manual Entry" | ✅ Done | All 13 params manually |
| 13 body metrics display | ✅ Done | Weight, BMI, Body Fat, Fat-Free Weight, Subcutaneous Fat, Visceral Fat, Body Water, Skeletal Muscle + more |
| Status badges (Normal / Healthy / Average) | ✅ Done | Color-coded per param range |
| Overview / History / Log tabs | ✅ Done | History + Log scaffolded |
| API — save metrics to DB | ✅ Done | POST /api/user/metrics |
| API — fetch latest metrics | ✅ Done | GET /api/user/metrics |
| Dashboard card | ✅ Done | Body Metrics card on main dashboard |

### 13 Body Parameters Tracked
Weight (kg) · BMI · Body Fat % · Fat-Free Weight (kg) · Subcutaneous Fat % · Visceral Fat (level) · Body Water % · Skeletal Muscle % · Muscle Mass (kg) · Bone Mass (kg) · Protein % · BMR (kcal) · Body Age

### Physical Scale Testing
- **Status: PENDING** — No FitDays scale hardware yet
- BLE UI built to FitDays GATT profile; manual entry fully functional as fallback

### Page Live
```
https://fitfuel-eosin.vercel.app/dashboard/body-metrics
```

---

## ✅ PHASE 4 — USER PROFILE + DASHBOARD + AUTH — COMPLETE

### Files Built & Pushed

| File | Status | Notes |
|------|--------|-------|
| `lib/auth.ts` | ✅ Done | NextAuth v5 — Google provider, PrismaAdapter, database sessions, signIn event guest merge |
| `app/api/auth/[...nextauth]/route.ts` | ✅ Done | NextAuth route handler |
| `app/auth/signin/page.tsx` | ✅ Done | Custom sign-in page — Google button, WhatsApp fallback, callbackUrl → `/dashboard` |
| `app/layout.tsx` | ✅ Done | `SessionProvider` wrapping tree — server-side `auth()` passed as prop |
| `app/dashboard/page.tsx` | ✅ Done | Server component — fetches real orders from DB by userId, redirects if unauthenticated |
| `app/dashboard/DashboardClient.tsx` | ✅ Done | Client UI — order history, account details, body metrics card, coming soon cards |
| `components/Navbar.tsx` | ✅ Done | Auth-aware — avatar + first name + dropdown (Dashboard, Sign Out) when logged in |
| `app/api/user/profile/route.ts` | ✅ Done | GET + PATCH — fetches and updates User + UserProfile |
| `app/dashboard/profile/page.tsx` | ✅ Done | Server component — fetches user + profile from Neon |
| `app/dashboard/profile/ProfileClient.tsx` | ✅ Done | Profile edit form — name, phone, diet, goal, gender |

### Schema Changes (Phase 4)
- Added `Account`, `Session`, `VerificationToken` models (NextAuth)
- Added `emailVerified DateTime?` + `image String?` to `User`
- Migrations applied: `add-nextauth-accounts`, `add-session-table`, `add-emailverified-image` ✅

### Google OAuth Setup

| Field | Value |
|-------|-------|
| Provider | Google Cloud Console — project: vercel-496612 |
| OAuth Client | Web client 1 |
| Authorized redirect URI | `https://fitfuel-eosin.vercel.app/api/auth/callback/google` |
| Vercel env vars set | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET` |

### Auth Flow (confirmed working ✅ — May 17 2026)
```
User clicks "Continue with Google" → signIn("google", { callbackUrl: "/dashboard" })
→ Google OAuth → /api/auth/callback/google
→ PrismaAdapter writes Session + Account rows to Neon
→ Redirect to /dashboard ✅ → Navbar shows avatar + "Pranit" + dropdown ✅
```

### Guest → Auth Merge Flow (confirmed working ✅ — May 17 2026)
```
Guest places COD order → guest User row created by email
→ Guest signs in with Google (same email)
→ NextAuth signIn event: finds guest User, re-parents orders + addresses, deletes guest row
→ Dashboard shows merged orders immediately ✅
```

### Bugs Fixed

| Bug | Fix |
|-----|-----|
| Redirected to homepage after login | Changed callbackUrl to `"/dashboard"` |
| Session not persisting | Removed custom `cookies` block — NextAuth handles on Vercel HTTPS |
| `useSession()` returning null | Added `SessionProvider` with server-side session prop to layout |
| PrismaAdapter failing silently | Added `emailVerified` + `image` to schema, ran migration |
| Guest orders not merging | Moved merge logic from `createUser` to `signIn` event |
| Dashboard showing empty orders | Rebuilt as server component with real DB query |

### Pending in Phase 4
- MSG91 phone OTP (second auth provider) — needs MSG91 account ⏳

---

## ✅ PHASE 3 — MEAL PLANS + SHOP + PAYU — COMPLETE

### Files Built & Pushed

| File | Status |
|------|--------|
| `app/checkout/page.tsx` | ✅ Done |
| `app/order/success/route.ts` | ✅ Done |
| `app/order/confirmation/page.tsx` | ✅ Done |
| `app/api/payments/payu/route.ts` | ✅ Done |
| `app/api/payments/payu/success/route.ts` | ✅ Done |
| `app/api/payments/payu/failed/route.ts` | ✅ Done |
| `app/plans/[slug]/page.tsx` | ✅ Done |
| `app/api/orders/cod/route.ts` | ✅ Done |
| `lib/prisma.ts` | ✅ Done |

### PayU Flow (confirmed working ✅)
```
Checkout → POST /api/payments/payu (hash generated server-side)
→ Hidden form → secure.payu.in/_payment
→ PayU POSTs to /order/success → hash verified → /order/confirmation ✅
```

### COD Flow (confirmed working + DB save ✅ — May 17 2026)
```
COD selected → POST /api/orders/cod (saves user, address, order, order_item, payment)
→ redirect to /order/confirmation?txnid=COD-xxx&cod=1&order=FF-COD-... ✅
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

> ⚠️ Hash must be computed **server-side only**. Never expose salt to browser.

### Remaining Pending
- Seed MealPlanProducts to DB so `OrderItem.productId` can be populated — Phase 15
- Admin view of orders — Phase 15

---

## ✅ PHASE 2 — CORE WEBSITE REDESIGN — COMPLETE

### Pages Live on Vercel

| Page | Status |
|------|--------|
| Global Layout (`app/layout.tsx`) | ✅ Sticky nav, scroll progress bar, hamburger, footer |
| Homepage (`app/page.tsx`) | ✅ Hero 3D tilt card, stats, plan cards, how-it-works, testimonials, CTA |
| Plans + Pricing (`app/plans/page.tsx`) | ✅ Interactive configurator, Standard pricing, waitlists, mobile responsive v2 |
| About (`app/about/page.tsx`) | ✅ Pushed May 16 2026 |
| Contact (`app/contact/page.tsx`) | ✅ Pushed May 16 2026 |
| Locations (`app/locations/page.tsx`) | ✅ 15 Pune zones, Google Maps embed, pincode checker — May 16 2026 |
| Individual Plan Pages (`app/plans/[slug]/page.tsx`) | ✅ Done |

### Polish Pass
- Framer Motion scroll animations — fadeUp + stagger + blur ✅
- 3D tilt hero card — spring physics, cursor glow, parallax ✅
- `useReducedMotion()` — tilt + shimmer disabled for accessibility ✅
- AnimatedStat counters — IntersectionObserver triggered ✅
- Design tokens aligned — `#ffffff` primary, `#a3a3a3` secondary, `#737373` muted ✅
- MD token alignment — bg `#0a0a0a`, card `#111111`, border `#1f1f1f` ✅

### Pending (Phase 17)
- SEO: meta tags, OG image, sitemap.xml
- Full mobile audit across about/contact/locations

---

## ✅ PHASE 1 — COMPLETE

- Tailwind design tokens — `globals.css` — black bg, lime `#84cc16`, typography scale ✅
- Button classes: `btn-primary`, `btn-secondary`, `btn-ghost` ✅
- Next.js app created (`create-next-app@16.2.6`) ✅
- Prisma 7 + Neon adapter configured ✅
- GitHub repo: [github.com/pranitborkar98/fitfuel](https://github.com/pranitborkar98/fitfuel) — PUBLIC ✅
- Vercel connected to GitHub — auto-deploy on push to `main` ✅
- Schema v2 — 14 models, 17 enums — migration `20260512003135_init` applied ✅
- Seed executed — **17 products + 966 price rows live in Neon** ✅

---

## ✅ PHASE 0 — COMPLETE

- Crawled fitfuel.in — full content, structure, products mapped ✅
- WordPress DB (`u271592098_U9cur.sql`) analysed — 171MB phpMyAdmin dump, May 11 2026 ✅
- Complete pricing matrix extracted ✅
- Customer data: 179 registered users, 145 WooCommerce customers ✅
- Order history: 21 total (3 completed, 3 processing, 7 cancelled, 8 failed) ✅
- Business confirmed LIVE — last order Jan 2026, webhook logs firing Apr 2026 ✅
- Meal image library catalogued: 37 named dishes + 200+ AI-generated ✅
- PayU credentials confirmed ✅
- All decisions locked ✅

---

## 💰 PRICING MATRIX

Source: `wp_wc_product_meta_lookup` + `wp_postmeta` (171MB DB, confirmed)
GST 5% added at checkout on all tiers.

### Tier Multipliers
| Tier | Multiplier | Phase | Status |
|------|-----------|-------|--------|
| Standard | 1.0× (base) | Phase 3 | ✅ Live |
| Premium | 1.25× on Standard | Phase 8 | ⏳ Waitlist open |
| Luxury | 1.50× on Standard | Phase 12 | ⏳ Waitlist open |

### Standard Tier — Active

| Duration | Breakfast + Lunch | Snack + Dinner | All 4 meals |
|----------|-------------------|----------------|-------------|
| Trial day | ₹400 | ₹400 | ₹750 |
| Weekly (7d) | ₹2,700 | ₹2,700 | ₹4,900 |
| Bi-weekly (15d) | ₹5,775 | ₹5,775 | ₹9,720 |
| Monthly excl. weekends | ₹7,560 | ₹7,560 | ₹13,860 |
| 1 Month | ₹9,500 | ₹9,500 | ₹16,999 |
| 2 Months | ₹18,900 | ₹18,900 | ₹33,000 |
| 3 Months | ₹27,450 | ₹27,450 | ₹47,250 |

> Non-Veg Monthly excl. weekends B+L / S+D = ₹7,600 (not ₹7,560)

---

## 📁 KEY FILES — CURRENT STATE

| File | Status | Notes |
|------|--------|-------|
| `FITFUEL_PROJECT_TRACKER.md` | ✅ This file | Updated May 18 2026 |
| `prisma/schema.prisma` | ✅ v4 | Phase 6 — 5 nutrition models added, NutritionLog removed |
| `prisma/seed.ts` | ✅ Executed | 17 products, 966 price rows live |
| `prisma/seed-nutrition.ts` | ✅ Executed | 50 Indian foods + 4 meal types live in Neon |
| `lib/auth.ts` | ✅ Done | NextAuth v5 — Google, PrismaAdapter, database sessions, guest merge |
| `lib/prisma.ts` | ✅ Done | Prisma 7 singleton — PrismaPg + pg.Pool |
| `app/api/auth/[...nextauth]/route.ts` | ✅ Done | NextAuth route handler |
| `app/auth/signin/page.tsx` | ✅ Done | Custom sign-in page |
| `app/globals.css` | ✅ Done | Gray scale + btn tokens corrected |
| `app/layout.tsx` | ✅ Done | Navbar + Footer + SessionProvider |
| `app/page.tsx` | ✅ Done | Full homepage — 3D card, all sections, Framer Motion |
| `app/plans/page.tsx` | ✅ Done | Full pricing page — mobile responsive v2 |
| `app/plans/[slug]/page.tsx` | ✅ Done | Individual plan pages |
| `app/about/page.tsx` | ✅ Done | Pushed May 16 2026 |
| `app/contact/page.tsx` | ✅ Done | Pushed May 16 2026 |
| `app/locations/page.tsx` | ✅ Done | Pincode checker, 15 zones, Maps embed |
| `app/checkout/page.tsx` | ✅ Done | PayU + COD + ₹1 test mode |
| `app/order/success/route.ts` | ✅ Done | PayU POST handler |
| `app/order/confirmation/page.tsx` | ✅ Done | COD + PayU variant |
| `app/api/payments/payu/route.ts` | ✅ Done | Hash generator — server-side |
| `app/api/payments/payu/success/route.ts` | ✅ Done | Backup success handler |
| `app/api/payments/payu/failed/route.ts` | ✅ Done | Failed payment handler |
| `app/api/orders/cod/route.ts` | ✅ Done | COD order save to DB |
| `app/dashboard/page.tsx` | ✅ Done | Server component — real orders from Neon by userId |
| `app/dashboard/DashboardClient.tsx` | ✅ Done | Body Metrics + Nutrition Tracker both live as LIVE cards |
| `app/dashboard/profile/page.tsx` | ✅ Done | Server component — fetches user + profile |
| `app/dashboard/profile/ProfileClient.tsx` | ✅ Done | Profile edit form |
| `app/dashboard/body-metrics/page.tsx` | ✅ Done | Server component — auth guard, fetches latest metrics |
| `app/dashboard/body-metrics/BodyMetricsClient.tsx` | ✅ Done | BLE connect UI, 13 params, manual entry, tabs |
| `app/api/user/metrics/route.ts` | ✅ Done | GET + POST body metrics |
| `app/api/user/profile/route.ts` | ✅ Done | GET + PATCH user profile |
| `app/dashboard/nutrition/page.tsx` | ✅ Done | Server component — SSR today's diary, goal, water |
| `app/dashboard/nutrition/NutritionClient.tsx` | ✅ Done | Full nutrition UI — diary, food search, macro rings, water, goals |
| `app/api/nutrition/foods/route.ts` | ✅ Done | GET search + POST custom food |
| `app/api/nutrition/diary/route.ts` | ✅ Done | GET diary by date + POST log entry |
| `app/api/nutrition/diary/[id]/route.ts` | ✅ Done | DELETE entry |
| `app/api/nutrition/goals/route.ts` | ✅ Done | GET + PATCH goals |
| `app/api/nutrition/water/route.ts` | ✅ Done | GET + POST water |
| `components/Navbar.tsx` | ✅ Done | Auth-aware — avatar + dropdown |
| `components/Footer.tsx` | ✅ Done | Contrast audited |
| `u271592098_U9cur.sql` | ✅ Analysed | 171MB — keep for reference |
| Meal images (5 zips, 1.63GB) | ✅ Catalogued | 37 named + 200+ AI-generated |

---

## 🛠️ TECH STACK

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.2.6 (React) |
| Styling | Tailwind CSS + custom CSS variables |
| Animation | Framer Motion |
| Icons | Lucide React |
| State | Zustand (Phase 4+) |
| Auth | NextAuth.js v5 beta — Google OAuth live, Phone OTP (MSG91) Phase 4 |
| Backend | Next.js API routes |
| ORM | Prisma 7 |
| Database | PostgreSQL (Neon — free tier, 0.5GB) |
| Payments | PayU ✅ + COD ✅ |
| Body Metrics | Web Bluetooth API — FitDays BLE scale (UI built ✅, hardware test pending) |
| Notifications | n8n self-hosted — WhatsApp Business API + Email (Phase 16) |
| Delivery Tracking | Driver PWA — Web Bluetooth / smartphone (Phase 10) |
| AI | Claude API (Anthropic) — Phase 12 |
| Hosting | Vercel (GitHub auto-deploy on push to `main`) |

---

## 🏆 PRODUCT TIERS

### Standard — Active (Phase 3 launch)
- Meal delivery — all 5 active plans (Veg, Egg, Non-Veg, Jain, Custom)
- Dashboard: order history ✅, delivery tracking (Phase 10), today's meals (Phase 10)
- Body metrics (manual entry ✅ or FitDays BLE ✅ UI — hardware test pending) — Phase 5 ✅
- Nutrition tracker (calories + macros + water) — Phase 6 ✅
- Digital meal plans (PDFs, sold separately) — Phase 13

Price anchor: ₹400 trial → ₹47,250 for 3-month all meals

### Premium — Coming Soon (Phase 8) · 1.25× Standard
- Supplement add-ons delivered with meals (whey, creatine, vitamins, omega-3, pre-workout)
- Full nutrition tracker — macros, micros, plan vs actual
- Exercise library + personalised workout plan
- Priority WhatsApp support
- Weekly PDF check-in report (automated via n8n)

Price anchor: ₹500 trial → ₹59,063 for 3-month all meals

### Luxury — Coming Soon (Phase 12) · 1.50× Standard
- Physical wellness add-ons (massage, spa, in-home yoga — Pune partners)
- AI Personal Trainer (Claude API) — daily plans, form feedback, progressive overload
- Concierge onboarding: 1-on-1 video call with head coach
- Fully custom meal plan (personalised by nutritionist)
- Quarterly body transformation report
- Priority delivery slot (first of the day)

Price anchor: ₹600 trial → ₹70,875 for 3-month all meals

### Lifestyle & Medical Plans — Coming Soon (Phase 9)
Conditions: PCOS · Diabetic-friendly · Post-surgery recovery · Weight loss (clinical) · Thyroid · Heart health · High-protein athletic

---

## 🧠 DECISIONS — LOCKED

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
| 12 | Design | Dark athletic — black `#0a0a0a`, lime `#84cc16`, white `#ffffff` |
| 13 | FitDays / Body Metrics | Web Bluetooth API — in-browser BLE (Chrome) |
| 14 | Delivery Tracking | Driver PWA (smartphone) |
| 15 | Exercise content | Custom 3D animated videos — placeholder now |
| 16 | Language | English only |
| 17 | Target city | Pune only (Kharadi base) — expand later |
| 18 | SparkyFitness | Inspiration + feature reference — build natively |
| 19 | Zomato/Swiggy | Live separately — no website integration |
| 20 | GST | 5% on all meal plan products |
| 21 | Owner email | pranitborkar98@gmail.com |
| 22 | Guest checkout | Keep guest checkout — post-order sign-in nudge on confirmation page (Phase 4 remaining) |
| 23 | Nutrition water logging | Daily total (one row per user per day, upserted) — not individual entries |
| 24 | Nutrition food data | Per-100g storage + compute macros at log time — no variant system in Phase 6 |

---

## ⚠️ PENDING INPUTS

| # | What | Phase | Status |
|---|------|-------|--------|
| 1 | MSG91 or Twilio account | 4 | ⏳ |
| 2 | FitDays scale model number (BLE compatibility check) | 5 | ⏳ — UI built, need hardware |
| 3 | WhatsApp Business API / Meta Business account | 16 | ⏳ |
| 4 | Hostinger VPS vs shared (for n8n) | 16 | ⏳ Check hPanel |
| 5 | Supplement supplier / source | 8 | ⏳ |
| 6 | Wellness partner tie-ups (massage/spa) | 12+ | ⏳ |

---

## 🍽️ MEAL IMAGE LIBRARY

### Named Dish Photos (37)
Avocado Cocoa Mousse Almond Crackers · Avocado Toast with Poached Egg · Banana with Peanut Butter · Boiled Eggs with Masala Sweet Potatoes · Boiled Eggs with Paprika · Chia Pudding with Berries Almond Butter · Chickpea Avocado Wrap with Mint Yogurt Dip · Chickpea Spinach Curry with Red Rice · Dark Chocolate Almond Bites Raspberry Tea · Egg Bhurji Wrap with Beet Slaw · Fish Curry with Brown Rice Bhindi · Fruit Salad with Chia Seeds · Greek Yogurt Parfait with Seeds Honey · Greek Yogurt with Dark Chocolate Seeds · Grilled Chicken Beetroot Quinoa Bowl · Grilled Fish Brown Rice Steamed Veggies · Grilled Tofu Bowl with Quinoa Beetroot Tahini · Herbed Paneer Salad with Roasted Veggies Millet · Lentil Coconut Curry with Brown Rice · Methi Chicken with Bajra Roti · Moong Dal Khichdi with Ghee Cabbage Salad · Multigrain Paratha with Curd · Paneer Tikka with Millet Sauteed Greens · Protein Ladoo Oats Peanut Jaggery · Quinoa Muesli with Flax Coconut Yogurt · Ragi Porridge with Almonds Dates · Rajma Brown Rice Bowl with Mixed Salad · Soya Keema with Multigrain Toast · Spiced Oats with Banana Pumpkin Seeds · Stuffed Capsicum with Paneer Quinoa · Sweet Potato Hash with Kale Goat Cheese · Tandoori Chicken with Millet Salad · Thai Basil Stir Fry with Tofu Brown Rice · Tofu Stir Fry with Quinoa · Tofu Tikka with Whole Wheat Roti Mint Slaw · Trail Mix Nuts Seeds Raisins · Vegetable Stew with Red Rice Idiyappam

### AI-Generated Images (200+)
Jain · Vegetarian · Eggetarian · Non-Vegetarian · Snacks — full catalogue in WordPress backup

---

## 📋 BUSINESS INTELLIGENCE

- 179 registered WordPress users · 145 WooCommerce customers
- 21 recorded orders (Sep 2024 – Jan 2026)
- 3 completed orders (Oct 2024: ₹17,849 + ₹2,834 · Oct 2025: ₹13,860)
- Most recent order: Jan 2026 — ₹13,860 (cancelled)
- Highest attempted: ₹1,22,844.75 (failed — bulk 5-item, PayU gateway issue)
- Business IS running — webhook logs confirmed firing Apr 2026
- Most failures = PayU gateway issues, not customer cancellations
- Real offline/COD orders likely not all in DB

---

## 🗄️ DATABASE — CURRENT STATE (Phase 6 Schema v4)

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
| exercises | Exercise library — name, level, sets, reps, muscle groups (Phase 7) |
| workout_logs | Workout tracking (Phase 7) |
| meal_types | Breakfast / Lunch / Dinner / Snacks (seeded ✅) |
| food_items | Food library — 50 Indian foods seeded + user custom foods (per-100g macros) |
| food_entries | Diary log — userId, foodItemId, mealTypeId, entryDate, qty, computed macros |
| nutrition_goals | Daily targets per user — calories, protein, carbs, fat, waterMl |
| water_logs | Daily water total per user (one row per user per day, upserted) |

---

## 🚀 THE VISION

FitFuel has been running in Pune since 2024 — real customers, real orders, real operations. This is a full platform revamp, not a launch.

**Now (Phase 6 done):** Nutrition Tracker live + pushed ✅ — food diary, 50 Indian foods seeded, macro rings, water tracker, daily goals. All running on Neon.

**Phase 7:** Exercise Library — exercise catalogue, workout logging.

**Phase 8:** Unlock Premium — supplements, full nutrition tracking, exercise library. Turn one-time meal customers into recurring health subscribers.

**Phase 12:** Unlock Luxury — AI Personal Trainer (Claude API), concierge onboarding, wellness partners. FitFuel becomes Pune's premium health platform.

**Beyond:** Lifestyle + medical plans, corporate clients, city expansion. Build the infrastructure once, scale it.

Every phase is a building block. Build it right once.