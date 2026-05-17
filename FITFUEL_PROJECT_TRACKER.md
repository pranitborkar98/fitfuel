# 🔥 FITFUEL — MASTER PROJECT TRACKER

> **Last Updated: May 16, 2026 — Phase 3 IN PROGRESS 🟡 — COD flow confirmed working on live (Vercel) ✅**
> **Platform:** Next.js (React) + Node.js + PostgreSQL (Neon)
> **Deployment:** Vercel — [fitfuel-eosin.vercel.app](https://fitfuel-eosin.vercel.app) → fitfuel.in after launch
> **Mission:** Best meal delivery + health platform in Pune. Meals today. Supplements + AI tomorrow. Empire after that.

---

## 📍 PHASE STATUS OVERVIEW

| Phase | Name | Status |
|-------|------|--------|
| 0 | Audit & Planning | ✅ Complete |
| 1 | Design System + Tech Stack + DB | ✅ Complete |
| **2** | **Core Website Redesign** | **✅ Complete** |
| **3** | **Meal Plans + Shop + PayU** | **🟡 In Progress** |
| 4 | User Profile + Dashboard + Auth | ⏳ Pending |
| 5 | Body Metrics — FitDays BLE | ⏳ Pending |
| 6 | Nutrition Tracker | ⏳ Pending |
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

## 🟡 PHASE 3 — MEAL PLANS + SHOP + PAYU — IN PROGRESS

### Files Built & Pushed

| File | Status | Notes |
|------|--------|-------|
| `app/checkout/page.tsx` | ✅ Done | Full checkout form — PayU + COD toggle, ₹1 test mode, GST breakdown, mobile responsive |
| `app/order/success/route.ts` | ✅ Done | POST handler — receives PayU callback, verifies hash, redirects to /order/confirmation |
| `app/order/confirmation/page.tsx` | ✅ Done | Order confirmed page — txnid, amount, WhatsApp CTA, what-happens-next steps |
| `app/api/payments/payu/route.ts` | ✅ Done | Hash generator — server-side only, HMAC-SHA512, returns all PayU form params |
| `app/api/payments/payu/success/route.ts` | ✅ Done | Backup success handler at /api path |
| `app/api/payments/payu/failed/route.ts` | ✅ Done | Failed/cancelled payment handler — redirects to checkout with error |
| `app/plans/[slug]/page.tsx` | ✅ Done | Individual plan pages — Muscle Gain, Weight Loss, Balanced, Office, Jain |

### PayU Flow (confirmed working)
```
Customer fills checkout → POST /api/payments/payu (hash generated server-side)
→ Hidden form auto-submits to PayU (secure.payu.in/_payment)
→ PayU processes payment
→ PayU POSTs to surl: /order/success (route.ts)
→ Hash verified server-side → redirect to /order/confirmation (page.tsx) ✅
```

### COD Flow (confirmed working on live Vercel ✅)
```
Customer selects Cash on Delivery → fills form → submits
→ handleCOD() fires → router.push(/order/confirmation?txnid=COD-xxx&amount=xxx&cod=1)
→ Confirmation page shows: Transaction ID, Amount paid, What happens next ✅
```

### ₹1 Test Mode
- Append `?test=1` to any checkout URL
- e.g. `https://fitfuel-eosin.vercel.app/checkout?diet=veg&dur=trial&meal=sd&price=400&test=1`
- Real PayU charge of ₹1 — confirms gateway working end-to-end

### What's Still Pending in Phase 3

| Task | Status | Notes |
|------|--------|-------|
| ✅ PayU payment confirmed working end-to-end | Done | ₹1 test passed |
| ✅ COD option | Done | Confirmed working live on Vercel May 16 2026 |
| ✅ Order confirmation page — COD variant | Done | Shows txnid, amount, what-happens-next. `cod=1` param read correctly |
| ⏳ Save orders to DB (Prisma) | Pending | TODOs marked in checkout code |
| ⏳ Save COD orders to DB | Pending | `app/api/orders/cod/route.ts` needed |
| ⏳ Admin view of orders | Pending | Phase 15 |

### Known Issues Fixed Today (May 16 2026)

| Issue | Cause | Fix |
|-------|-------|-----|
| Build error — conflicting route at `/` | Stray `app/route.ts` accidentally committed | Deleted + pushed |
| 405 on `/order/success` | PayU POSTs to page (no POST handler) | Moved page to `/order/confirmation`, added `route.ts` to `/order/success` |
| Checkout showing old version on Vercel | File not replaced before push | Replaced via VS Code + pushed |
| HTTP 500 on COD submit | `handleCOD` redirected to `/order/success` (route.ts, POST-only) instead of `/order/confirmation` | Fixed L192 in `app/checkout/page.tsx` — changed `/order/success` → `/order/confirmation` |
| "No plan selected" on confirmation page | Old checkout code was saved at `app/order/confirmation/page.tsx` — had `if (!price)` guard, no `price` param in COD redirect URL | Confirmation page was already correct on GitHub; local file was stale. `git checkout` restored it |

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

### Components

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Navbar | `components/Navbar.tsx` | ✅ Done | Scroll progress bar, AnimatePresence mobile menu |
| Footer | `components/Footer.tsx` | ✅ Done | Full contrast audit, all text colors updated |

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
| Standard | 1.0× (base) | Phase 3 | 🟡 Building |
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
| `FITFUEL_PROJECT_TRACKER.md` | ✅ This file | Updated May 16 2026 |
| `prisma/schema.prisma` | ✅ v2 | 14 models, 17 enums |
| `prisma/seed.ts` | ✅ Executed | 17 products, 966 price rows live |
| `app/globals.css` | ✅ Done | Gray scale + btn tokens corrected |
| `app/layout.tsx` | ✅ Done | Navbar + Footer, Barlow Condensed in `<head>` |
| `app/page.tsx` | ✅ Done | Full homepage — 3D card, all sections, Framer Motion |
| `app/plans/page.tsx` | ✅ Done | Full pricing page — mobile responsive v2, visibility fixed |
| `app/plans/[slug]/page.tsx` | ✅ Done | Individual plan pages |
| `app/about/page.tsx` | ✅ Done | Pushed May 16 2026 |
| `app/contact/page.tsx` | ✅ Done | Pushed May 16 2026 |
| `app/locations/page.tsx` | ✅ Done | Pushed May 16 2026 — pincode checker, 15 zones, Maps embed |
| `app/checkout/page.tsx` | ✅ Done | PayU + COD + ₹1 test mode — pushed May 16 2026 |
| `app/order/success/route.ts` | ✅ Done | PayU POST handler — pushed May 16 2026 |
| `app/order/confirmation/page.tsx` | ✅ Done | Order confirmed page — pushed May 16 2026 |
| `app/api/payments/payu/route.ts` | ✅ Done | Hash generator — server-side |
| `app/api/payments/payu/success/route.ts` | ✅ Done | Backup success handler |
| `app/api/payments/payu/failed/route.ts` | ✅ Done | Failed payment handler |
| `components/Navbar.tsx` | ✅ Done | Scroll progress, mobile hamburger |
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
| Auth | NextAuth.js — Phone OTP (MSG91) + Google (Phase 4) |
| Backend | Next.js API routes |
| ORM | Prisma 7 |
| Database | PostgreSQL (Neon — free tier, 0.5GB) |
| Payments | PayU (Phase 3) + COD |
| Notifications | n8n self-hosted — WhatsApp Business API + Email (Phase 16) |
| Delivery Tracking | Driver PWA — Web Bluetooth / smartphone (Phase 10) |
| AI | Claude API (Anthropic) — Phase 12 |
| Hosting | Vercel (GitHub auto-deploy on push to `main`) |

---

## 🏆 PRODUCT TIERS

### Standard — Active (Phase 3 launch)
- Meal delivery — all 5 active plans (Veg, Egg, Non-Veg, Jain, Custom)
- Choose diet → duration → meals per day
- Dashboard: order history, delivery tracking, today's meals
- Body metrics (manual entry or FitDays BLE)
- Nutrition tracker (basic — calories + macros)
- Digital meal plans (PDFs, sold separately)

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
| 6 | Auth | Phone OTP (MSG91) + Google Sign-In — NextAuth.js |
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

---

## ⚠️ PENDING INPUTS

| # | What | Phase | Status |
|---|------|-------|--------|
| 1 | MSG91 or Twilio account | 4 | ⏳ |
| 2 | WhatsApp Business API / Meta Business account | 16 | ⏳ |
| 3 | Hostinger VPS vs shared (for n8n) | 16 | ⏳ Check hPanel |
| 4 | FitDays scale model number (BLE compatibility) | 5 | ⏳ |
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

**Now (Phase 3):** Wire ordering — PayU integration, order flow, individual plan pages. Standard tier goes live properly.

**Phase 8:** Unlock Premium — supplements, full nutrition tracking, exercise library. Turn one-time meal customers into recurring health subscribers.

**Phase 12:** Unlock Luxury — AI Personal Trainer (Claude API), concierge onboarding, wellness partners. FitFuel becomes Pune's premium health platform.

**Beyond:** Lifestyle + medical plans, corporate clients, city expansion. Build the infrastructure once, scale it.

Every phase is a building block. Build it right once.
