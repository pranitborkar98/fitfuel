# 🔥 FITFUEL — MASTER PROJECT TRACKER

> **Last Updated: May 18, 2026 — Phase 6 COMPLETE ✅ — Nutrition Tracker live (food diary, 50 Indian foods, macro rings, water tracker, goals). Migration + seed pending push.**
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
| **6** | **Nutrition Tracker** | ✅ Complete (migration + seed push pending) |
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

### Files Built

| File | Status | Notes |
|------|--------|-------|
| `prisma/schema.prisma` | ✅ Done | v4 — replaced NutritionLog placeholder with 5 Phase 6 models; added nutrition relations to User |
| `prisma/seed-nutrition.ts` | ✅ Done | 50 Indian foods (per-100g macros) + 4 meal types seeded |
| `app/dashboard/nutrition/page.tsx` | ✅ Done | Server component — auth guard, SSR initial data (entries + goal + water + meal types) |
| `app/dashboard/nutrition/NutritionClient.tsx` | ✅ Done | Full client UI — diary, food search modal, macro rings, water tracker, goals modal |
| `app/api/nutrition/foods/route.ts` | ✅ Done | GET search food library + POST add custom food |
| `app/api/nutrition/diary/route.ts` | ✅ Done | GET diary by date (entries + meal types + totals) + POST log food entry |
| `app/api/nutrition/diary/[id]/route.ts` | ✅ Done | DELETE food entry |
| `app/api/nutrition/goals/route.ts` | ✅ Done | GET goals (or defaults) + PATCH upsert goals |
| `app/api/nutrition/water/route.ts` | ✅ Done | GET water for date + POST add/subtract/set daily total |

### To Push (Pending)
```bash
# 1. Replace prisma/schema.prisma with Phase 6 version
# 2. Run migration
npx prisma migrate dev --name add-nutrition-tracker
# 3. Seed Indian foods + meal types
npx ts-node prisma/seed-nutrition.ts
# 4. git add + commit + push
git add .
git commit -m "feat: phase 6 nutrition tracker - food diary, 50 Indian foods, macro rings, water tracker, goals"
git push origin main
```

### Schema Changes (Phase 6)
- **Removed:** `NutritionLog` model (flat placeholder — replaced entirely)
- **Added:** `MealType` — Breakfast / Lunch / Dinner / Snacks (seeded, global)
- **Added:** `FoodItem` — food library (global seed foods + user custom foods, per-100g macros)
- **Added:** `FoodEntry` — diary log (userId, foodItemId, mealTypeId, entryDate, qty, computed macros)
- **Added:** `NutritionGoal` — daily targets per user (calories, protein, carbs, fat, waterMl)
- **Added:** `WaterLog` — daily water total per user (one row per user per day, upserted)
- **Updated:** `User` — added relations: `foodItems`, `foodEntries`, `nutritionGoal`, `waterLogs`
- Migration name: `add-nutrition-tracker`

### Features Built

| Feature | Status | Notes |
|---------|--------|-------|
| Date navigator — prev/next day | ✅ Done | Disabled forward past today |
| SSR initial load for today | ✅ Done | Server fetches today's diary, water, goal — no loading flash |
| Daily summary card | ✅ Done | SVG donut ring (calories consumed vs goal) + 3 macro progress bars |
| 4 meal slots — Breakfast / Lunch / Dinner / Snacks | ✅ Done | Each collapsible, shows kcal total, entry count |
| Food search modal (full-screen) | ✅ Done | Debounced search, popular foods on open, food library |
| Quantity selector + quick buttons (50/100/150/200g) | ✅ Done | Live macro preview before logging |
| Log food entry | ✅ Done | Macros computed server-side at log time from per-100g values |
| Delete food entry | ✅ Done | Hover-reveal trash button, optimistic UI update |
| Water tracker | ✅ Done | Glass buttons (250ml each), tap to add/undo, daily progress bar |
| Goals modal | ✅ Done | Edit calories/protein/carbs/fat/waterMl targets — PATCH upsert |
| Date change fetches new diary | ✅ Done | Parallel fetch diary + water for past dates |
| Remaining kcal strip | ✅ Done | Shows "X kcal left" or "X kcal over" in red |
| Custom food support | ✅ Done | User can add custom foods via POST /api/nutrition/foods |

### Seed Data — 50 Indian Foods (per 100g)
Categories: Grains & Staples · Dals & Legumes · Vegetables · Dairy · Eggs & Meat · Nuts & Seeds · Fruits · Street Food · Beverages & Supplements

Includes: Basmati Rice, Roti, Paratha, Poha, Upma, Idli, Dosa, Oats, Toor/Masoor/Chana/Moong Dal, Rajma, Chole, Potato, Palak, Bhindi, Tomato, Onion, Gobhi, Gajar, Paneer, Dahi, Milk, Ghee, Butter, Egg (whole/white), Chicken Breast/Thigh, Mutton, Salmon, Rohu, Almonds, Walnuts, Peanuts, Chia Seeds, Banana, Apple, Mango, Papaya, Orange, Guava, Vada Pav, Samosa, Pav Bhaji, Misal Pav, Biryani, Chai, Lassi, Coconut Water, Whey Protein

### 4 Meal Types (Seeded)
| Name | Emoji | Sort Order |
|------|-------|------------|
| Breakfast | 🌅 | 0 |
| Lunch | ☀️ | 1 |
| Dinner | 🌙 | 2 |
| Snacks | 🍎 | 3 |

### API Routes — Phase 6

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/nutrition/foods` | GET | Optional | Search food library (global + user custom) |
| `/api/nutrition/foods` | POST | Required | Add custom food |
| `/api/nutrition/diary` | GET | Required | Fetch diary + meal types + daily totals for a date |
| `/api/nutrition/diary` | POST | Required | Log a food entry (macros computed server-side) |
| `/api/nutrition/diary/[id]` | DELETE | Required | Delete a food entry (ownership verified) |
| `/api/nutrition/goals` | GET | Required | Get user goals (returns defaults if none set) |
| `/api/nutrition/goals` | PATCH | Required | Upsert user goals |
| `/api/nutrition/water` | GET | Required | Get water intake for a date |
| `/api/nutrition/water` | POST | Required | Add/subtract/set daily water (action param) |

### Design Notes
- Full-screen food search modal — no drawer, feels native on mobile
- Dark FitFuel theme — `#080808` bg, `#neutral-900` cards, `lime-400` accents
- SVG donut ring with smooth CSS transition for calorie progress
- Water: glass buttons (250ml each), tap filled glass to undo — no confusing sliders
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

### Page Location
```
/dashboard/nutrition
```
Accessible via Dashboard → Nutrition card (DashboardClient.tsx update needed — add card)

---

## ✅ PHASE 5 — BODY METRICS — FITDAYS BLE — COMPLETE

### Files Built & Pushed

| File | Status | Notes |
|------|--------|-------|
| `app/dashboard/body-metrics/page.tsx` | ✅ Done | Server component — auth guard, fetches latest metrics from Neon |
| `app/dashboard/body-metrics/BodyMetricsClient.tsx` | ✅ Done | Full client UI — BLE connect, 13 params, manual entry, Overview/History/Log tabs |
| `app/api/user/metrics/route.ts` | ✅ Done | GET + POST — fetches and saves body metrics to Neon by userId |
| `app/dashboard/DashboardClient.tsx` | ✅ Updated | Added Body Metrics card linking to /dashboard/body-metrics |

### Commit
```
feat: phase 5 body metrics - BLE connect UI, 13 params, manual entry, live dashboard card
4 files changed, 861 insertions(+), 13 deletions(-)
Pushed: f9f3201 → main ✅ (May 17 2026, 11:43 PM)
```

### Features Built

| Feature | Status | Notes |
|---------|--------|-------|
| BLE connect UI — "Retry Connect" button | ✅ Done | Web Bluetooth API — targets FitDays scale GATT profile |
| Manual entry fallback — "+ Manual Entry" | ✅ Done | Form to enter all 13 params manually without scale |
| 13 body metrics display | ✅ Done | Weight, BMI, Body Fat, Fat-Free Weight, Subcutaneous Fat, Visceral Fat, Body Water, Skeletal Muscle, + more |
| Status badges (Normal / Healthy / Average) | ✅ Done | Color-coded per param range |
| Overview tab | ✅ Done | Live metric cards with colored top borders |
| History tab | ✅ Done | UI scaffolded |
| Log tab | ✅ Done | UI scaffolded |
| API — save metrics to DB | ✅ Done | POST /api/user/metrics |
| API — fetch latest metrics | ✅ Done | GET /api/user/metrics |
| Dashboard card | ✅ Done | Body Metrics card added to main dashboard |

### 13 Body Parameters Tracked
1. Weight (kg)
2. BMI
3. Body Fat %
4. Fat-Free Weight (kg)
5. Subcutaneous Fat %
6. Visceral Fat (level)
7. Body Water %
8. Skeletal Muscle %
9. Muscle Mass (kg)
10. Bone Mass (kg)
11. Protein %
12. BMR (kcal)
13. Body Age

### Physical Scale Testing
- **Status: PENDING** — No FitDays scale hardware available yet
- BLE connection UI built and coded to FitDays GATT profile
- Manual entry fully functional as fallback
- To test: plug in a FitDays BLE scale → click "Retry Connect" on /dashboard/body-metrics → browser will prompt BLE pairing → data populates automatically

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
| `app/api/auth/[...nextauth]/route.ts` | ✅ Done | NextAuth route handler — `export const { GET, POST } = handlers` |
| `app/auth/signin/page.tsx` | ✅ Done | Custom sign-in page — FitFuel styled, Google button, WhatsApp fallback, callbackUrl → `/dashboard` |
| `app/layout.tsx` | ✅ Done | Added `SessionProvider` wrapping tree — server-side `auth()` passed as prop |
| `app/dashboard/page.tsx` | ✅ Done | Server component — fetches real orders from DB by userId, redirects if unauthenticated |
| `app/dashboard/DashboardClient.tsx` | ✅ Done | Client UI — order history, account details, body metrics card, coming soon cards |
| `components/Navbar.tsx` | ✅ Done | Auth-aware ✅ — avatar + first name + dropdown (Dashboard, Sign Out) when logged in; Sign In when logged out |
| `prisma/schema.prisma` | ✅ Done | Added `emailVerified DateTime?` + `image String?` to User — required by PrismaAdapter |
| `app/api/user/profile/route.ts` | ✅ Done | GET + PATCH — fetches and updates User + UserProfile |
| `app/dashboard/profile/page.tsx` | ✅ Done | Server component — fetches user + profile from Neon |
| `app/dashboard/profile/ProfileClient.tsx` | ✅ Done | Profile edit form — name, phone, diet, goal, gender |

### Schema Changes (Phase 4)
- Added `Account` model — NextAuth OAuth account linking
- Added `Session` model — database sessions
- Added `VerificationToken` model — email verification (future)
- Added `emailVerified DateTime?` to `User` — PrismaAdapter requires this field
- Added `image String?` to `User` — NextAuth sets this from Google avatar URL
- Migrations applied: `add-nextauth-accounts`, `add-session-table`, `add-emailverified-image` ✅

### Google OAuth Setup

| Field | Value |
|-------|-------|
| Provider | Google Cloud Console — project: vercel-496612 |
| OAuth Client | Web client 1 — created May 17 2026 |
| Authorized redirect URI | `https://fitfuel-eosin.vercel.app/api/auth/callback/google` |
| Vercel env vars set | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET` |

### Auth Flow (confirmed working ✅ — May 17 2026)
```
User clicks "Continue with Google" on /auth/signin
→ signIn("google", { callbackUrl: "/dashboard" })
→ Google OAuth → /api/auth/callback/google
→ PrismaAdapter writes Session + Account rows to Neon
→ Redirect to /dashboard ✅
→ Navbar shows avatar + "Pranit" + dropdown ✅
→ Dashboard shows "Welcome back PRANIT 💪" ✅
```

### Guest → Auth Merge Flow (confirmed working ✅ — May 17 2026)
```
Guest places COD order (no login) → guest User row created in Neon by email
→ Guest signs in with Google (same email)
→ NextAuth signIn event fires → finds guest User row (no accounts linked)
→ Orders + addresses re-parented to auth User
→ Guest User row deleted
→ Dashboard shows merged orders immediately ✅
```

### Bugs Fixed (May 17 2026)

| Bug | Cause | Fix |
|-----|-------|-----|
| Redirected to homepage after login | `callbackUrl` defaulted to `"/"` | Changed to `"/dashboard"` in signin page |
| Session not persisting | `sameSite: "none"` on cookie config — rejected by browsers outside cross-origin iframes | Removed entire custom `cookies` block — NextAuth handles it correctly on Vercel HTTPS |
| `useSession()` returning null in Navbar | No `SessionProvider` in layout | Added `SessionProvider` with server-side `session` prop to `app/layout.tsx` |
| PrismaAdapter silently failing on user create | `emailVerified` + `image` columns missing from `users` table | Added both fields to schema, ran migration |
| Guest orders not merging | `createUser` event only fires on first-ever login — existing auth user skipped it | Moved merge logic to `signIn` event which fires on every login |
| Dashboard showing empty orders | `page.tsx` was a hardcoded static shell with no DB query | Rebuilt as server component — fetches real orders from Neon by userId |
| TypeScript error on `user.phone` | NextAuth `User` type doesn't include `phone` | Fetch auth user from DB directly before phone check |

### What's Pending in Phase 4

| Task | Status |
|------|--------|
| skip — MSG91 phone OTP (second auth provider) | Pending — needs MSG91 account |

---

## ✅ PHASE 3 — MEAL PLANS + SHOP + PAYU — COMPLETE

### Files Built & Pushed

| File | Status | Notes |
|------|--------|-------|
| `app/checkout/page.tsx` | ✅ Done | Full checkout form — PayU + COD toggle, ₹1 test mode, GST breakdown, mobile responsive |
| `app/order/success/route.ts` | ✅ Done | POST handler — receives PayU callback, verifies hash, redirects to /order/confirmation |
| `app/order/confirmation/page.tsx` | ✅ Done | Real confirmation page — Order ID, amount, COD vs PayU variant, what-happens-next, WhatsApp CTA |
| `app/api/payments/payu/route.ts` | ✅ Done | Hash generator — server-side only, HMAC-SHA512, returns all PayU form params |
| `app/api/payments/payu/success/route.ts` | ✅ Done | Backup success handler at /api path |
| `app/api/payments/payu/failed/route.ts` | ✅ Done | Failed/cancelled payment handler — redirects to checkout with error |
| `app/plans/[slug]/page.tsx` | ✅ Done | Individual plan pages — Muscle Gain, Weight Loss, Balanced, Office, Jain |
| `app/api/orders/cod/route.ts` | ✅ Done | Saves COD order to DB — upserts guest user, creates address, order, order_item, payment |
| `lib/prisma.ts` | ✅ Done | Prisma 7 singleton using pg adapter (Pool + PrismaPg) |

### PayU Flow (confirmed working)
```
Customer fills checkout → POST /api/payments/payu (hash generated server-side)
→ Hidden form auto-submits to PayU (secure.payu.in/_payment)
→ PayU processes payment
→ PayU POSTs to surl: /order/success (route.ts)
→ Hash verified server-side → redirect to /order/confirmation (page.tsx) ✅
```

### COD Flow (confirmed working + DB save ✅ — May 17 2026)
```
Customer selects Cash on Delivery → fills form → submits
→ POST /api/orders/cod (saves to DB: user, address, order, order_item, payment)
→ redirect to /order/confirmation?txnid=COD-xxx&amount=xxx&cod=1&order=FF-COD-YYYYMMDD-XXXX
→ Confirmation page shows: Order ID, amount, COD badge, what-happens-next ✅
```

### Remaining Pending in Phase 3

| Task | Status | Notes |
|------|--------|-------|
| ⏳ Seed MealPlanProducts to DB | Pending | So `OrderItem.productId` can be populated — Phase 15 |
| ⏳ Admin view of orders | Pending | Phase 15 |

### PayU Integration Details

| Field | Value |
|-------|-------|
| Merchant Key | `YviYBu` |
| Merchant Salt | `BHigtcZU3kzvpLC9ZFtnrWMYBVtYWz2R` |
| Mode | Production |
| surl (success) | `https://fitfuel-eosin.vercel.app/order/success` |
| furl (failed) | `https://fitfuel-eosin.vercel.app/api/payments/payu/failed` |
| Hash formula | `key\|txnid\|amount\|productinfo\|firstname\|email\|\|\|\|\|\|\|\|\|\|salt` → HMAC-SHA512 |

> ⚠️ Hash must be computed **server-side only**. Never expose salt to browser.

---

## ✅ PHASE 2 — CORE WEBSITE REDESIGN — COMPLETE

### Pages — All Live on Vercel

| Page | File | Status | Notes |
|------|------|--------|-------|
| Global Layout | `app/layout.tsx` | ✅ Done | Sticky nav, scroll progress bar, hamburger w/ AnimatePresence, footer with trial CTA |
| Homepage | `app/page.tsx` | ✅ Done | Hero (3D tilt card), stats, plan cards, how-it-works, USPs, testimonials, CTA — full Framer Motion |
| Plans + Pricing | `app/plans/page.tsx` | ✅ Done | Interactive configurator, Standard pricing, Premium/Luxury waitlists, Lifestyle coming soon. Mobile responsive (v2 — visibility fix + MD token alignment) |
| About | `app/about/page.tsx` | ✅ Done | Brand story, kitchen, team, mission — pushed May 16 2026 |
| Contact | `app/contact/page.tsx` | ✅ Done | WhatsApp, email, address, mailto form — pushed May 16 2026 |
| Locations | `app/locations/page.tsx` | ✅ Done | 15 Pune zones, Google Maps embed, pincode checker — pushed May 16 2026 |

### Polish Pass Checklist

- [x] Framer Motion scroll animations — all sections wired (fadeUp + stagger + blur)
- [x] 3D tilt hero card — spring physics, cursor glow, specular highlight, parallax inner layer
- [x] `useReducedMotion()` wired — tilt + shimmer disabled for accessibility
- [x] Scroll progress bar in Navbar
- [x] AnimatedStat counters — IntersectionObserver triggered
- [x] Design system tokens aligned — `page.tsx` / Navbar / Footer / `globals.css`
- [x] `app/plans/page.tsx` — full pricing page with tier system + waitlists
- [x] Mobile responsiveness — plans page pricing table, duration grid, meal buttons fixed
- [x] Text visibility fix — gray scale corrected (`#ffffff` primary, `#a3a3a3` secondary, `#737373` muted)
- [x] MD design token alignment — bg `#0a0a0a`, card `#111111`, border `#1f1f1f`
- [x] About, Contact, Locations pages built + pushed
- [ ] SEO: meta tags, OG image, sitemap.xml — Phase 17
- [ ] Full mobile audit across all new pages (about/contact/locations)

---

## ✅ PHASE 1 — COMPLETE

### Design System
- [x] Tailwind design tokens — `globals.css` — black bg, lime `#84cc16`, typography scale, CSS variables
- [x] Button classes: `btn-primary`, `btn-secondary`, `btn-ghost`
- [x] Card, badge, glow-line, gradient-text utility classes
- [x] Inter font via Next.js Google Fonts + Barlow Condensed loaded via `layout.tsx <head>`

### Tech Stack
- [x] Next.js app created (`create-next-app@16.2.6`)
- [x] Prisma 7 installed + configured for Neon adapter
- [x] `prisma.config.ts` — datasource wired to Neon
- [x] GitHub repo: [github.com/pranitborkar98/fitfuel](https://github.com/pranitborkar98/fitfuel) — **PUBLIC**
- [x] Vercel connected to GitHub — auto-deploy on push to `main`

### Database
- [x] `schema.prisma` v2 — 14 models, 17 enums
- [x] Migration `20260512003135_init` applied — 14 tables live in Neon
- [x] `MealPlanType` expanded — `isLive` + `phase` fields added
- [x] Seed executed — **17 products + 966 price rows live in Neon** ✅
  - 5 plans live (Phase 3), 12 coming soon (Phase 9)
  - Jain: Veg only (21 rows). Non-veg MONTHLY_EXCL_WEEKENDS = ₹7,600 (others ₹7,560)

---

## ✅ PHASE 0 — COMPLETE

- [x] Crawled fitfuel.in — full content, structure, products mapped
- [x] WordPress DB (`u271592098_U9cur.sql`) analysed — 171MB phpMyAdmin dump, May 11 2026
- [x] Complete pricing matrix extracted (5 plans × 3 diets × 7 durations × 3 meal combos)
- [x] Customer data: 179 registered users, 145 WooCommerce customers
- [x] Order history: 21 total (3 completed, 3 processing, 7 cancelled, 8 failed)
- [x] Business confirmed LIVE — last order Jan 2026, webhook logs firing Apr 2026
- [x] Meal image library catalogued: 37 named dishes + 200+ AI-generated
- [x] PayU credentials confirmed — Key in `.env.local`
- [x] All decisions locked
- [x] Tech stack locked

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
| `prisma/seed-nutrition.ts` | ✅ Built | 50 Indian foods + 4 meal types — run after migration |
| `lib/auth.ts` | ✅ Done | NextAuth v5 — Google, PrismaAdapter, database sessions, signIn event guest merge |
| `lib/prisma.ts` | ✅ Done | Prisma 7 singleton — PrismaPg + pg.Pool |
| `app/api/auth/[...nextauth]/route.ts` | ✅ Done | NextAuth route handler |
| `app/auth/signin/page.tsx` | ✅ Done | Custom sign-in page |
| `app/globals.css` | ✅ Done | Gray scale + btn tokens corrected |
| `app/layout.tsx` | ✅ Done | Navbar + Footer, Barlow Condensed in `<head>` |
| `app/page.tsx` | ✅ Done | Full homepage — 3D card, all sections, Framer Motion |
| `app/plans/page.tsx` | ✅ Done | Full pricing page — mobile responsive v2, visibility fixed |
| `app/plans/[slug]/page.tsx` | ✅ Done | Individual plan pages |
| `app/about/page.tsx` | ✅ Done | Pushed May 16 2026 |
| `app/contact/page.tsx` | ✅ Done | Pushed May 16 2026 |
| `app/locations/page.tsx` | ✅ Done | Pushed May 16 2026 — pincode checker, 15 zones, Maps embed |
| `app/checkout/page.tsx` | ✅ Done | PayU + COD + ₹1 test mode |
| `app/order/success/route.ts` | ✅ Done | PayU POST handler |
| `app/order/confirmation/page.tsx` | ✅ Done | Order confirmed page — COD + PayU variant |
| `app/api/payments/payu/route.ts` | ✅ Done | Hash generator — server-side |
| `app/api/payments/payu/success/route.ts` | ✅ Done | Backup success handler |
| `app/api/payments/payu/failed/route.ts` | ✅ Done | Failed payment handler |
| `app/api/orders/cod/route.ts` | ✅ Done | COD order save to DB |
| `app/dashboard/page.tsx` | ✅ Done | Server component — fetches real orders from Neon by userId |
| `app/dashboard/DashboardClient.tsx` | ✅ Done | ⚠️ Needs Nutrition card added (link to /dashboard/nutrition) |
| `app/dashboard/profile/page.tsx` | ✅ Done | Server component — fetches user + profile from Neon |
| `app/dashboard/profile/ProfileClient.tsx` | ✅ Done | Profile edit form — name, phone, diet, goal, gender |
| `app/dashboard/body-metrics/page.tsx` | ✅ Done | Server component — auth guard, fetches latest metrics |
| `app/dashboard/body-metrics/BodyMetricsClient.tsx` | ✅ Done | BLE connect UI, 13 params, manual entry, tabs |
| `app/api/user/metrics/route.ts` | ✅ Done | GET + POST body metrics — reads/writes Neon |
| `app/api/user/profile/route.ts` | ✅ Done | GET + PATCH user profile |
| `app/dashboard/nutrition/page.tsx` | ✅ Done | Server component — SSR today's diary, goal, water |
| `app/dashboard/nutrition/NutritionClient.tsx` | ✅ Done | Full nutrition UI — diary, food search, macro rings, water, goals |
| `app/api/nutrition/foods/route.ts` | ✅ Done | GET search + POST custom food |
| `app/api/nutrition/diary/route.ts` | ✅ Done | GET diary by date + POST log entry |
| `app/api/nutrition/diary/[id]/route.ts` | ✅ Done | DELETE entry |
| `app/api/nutrition/goals/route.ts` | ✅ Done | GET + PATCH goals |
| `app/api/nutrition/water/route.ts` | ✅ Done | GET + POST water |
| `components/Navbar.tsx` | ✅ Done | Auth-aware — avatar + dropdown live |
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
- Choose diet → duration → meals per day
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
→ Waitlist open on website. Exact meal plans + pricing finalised in Phase 9.

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
| 12 | Design | Dark athletic — black `#0a0a0a`, lime `#84cc16`, white `#ffffff` — Barlow Condensed headings |
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
| 2 | FitDays scale model number (BLE compatibility check) | 5 | ⏳ — UI built, need hardware to confirm GATT profile match |
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

## 🚀 THE VISION

FitFuel has been running in Pune since 2024 — real customers, real orders, real operations. This is a full platform revamp, not a launch.

**Now (Phase 6 done):** Nutrition Tracker live ✅ — food diary, 50 Indian foods seeded, macro rings, water tracker, daily goals. Migration + seed push pending.

**Phase 7:** Exercise Library — exercise catalogue, workout logging.

**Phase 8:** Unlock Premium — supplements, full nutrition tracking, exercise library. Turn one-time meal customers into recurring health subscribers.

**Phase 12:** Unlock Luxury — AI Personal Trainer (Claude API), concierge onboarding, wellness partners. FitFuel becomes Pune's premium health platform.

**Beyond:** Lifestyle + medical plans, corporate clients, city expansion. Build the infrastructure once, scale it.

Every phase is a building block. Build it right once.