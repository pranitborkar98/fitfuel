# 🔥 FITFUEL — MASTER PROJECT TRACKER
> Last Updated: **Phase 1 — 4/6 done. Seed COMPLETE — 17 products + 966 price rows in Neon. Next: Tailwind design tokens + folder structure + GitHub repo.**
> Platform: **Next.js (React) + Node.js + PostgreSQL (Neon)**
> Deployment: **Vercel** — subdomain app.fitfuel.in during build → fitfuel.in after launch
> Mission: **Build one hell of a company.** Meals today. Supplements + wellness tomorrow. Empire after that.

---

## 📍 CURRENT STAGE
**Phase 1 — Design System + Architecture — IN PROGRESS (4/6 tasks done)**

### Phase 1 task status:
- [x] Next.js + Prisma initialised
- [x] Schema v1 — 14 models, 17 enums — built + updated
- [x] Migrations applied (init + add_plan_types_and_live_fields) — 14 tables live in Neon
- [x] Seed COMPLETE — 17 products + 966 price rows in Neon ✅ (5 live, 12 coming soon)
- [ ] **NEXT → Tailwind design tokens** — globals.css: black bg, lime #84cc16, typography scale, CSS variables
- [ ] Folder structure finalised + GitHub repo created → Vercel auto-deploy

---

## ✅ COMPLETED

- [x] Crawl fitfuel.in — full content, structure, products, menus mapped
- [x] Crawl SparkyFitness GitHub — full feature list extracted
- [x] FitDays integration requirements noted — Web Bluetooth API approach confirmed
- [x] Master project plan created
- [x] Decision: Website (not mobile app) — domain live, payments exist
- [x] All pre-build questions answered — decisions locked
- [x] WordPress database (.sql) fully analysed — 171MB phpMyAdmin dump May 11, 2026
- [x] Complete pricing matrix extracted — 5 plans × 3 diets × 7 durations × 3 meal combos
- [x] Customer count confirmed: 179 registered users, 145 WooCommerce customers
- [x] Order history confirmed: 21 total orders (3 completed, 3 processing, 7 cancelled, 8 failed)
- [x] Business confirmed LIVE AND ACTIVE (last order Jan 2026, last payment Oct 2025)
- [x] All meal plan products identified: Muscle Gain, Weight Loss, Balanced Diet, Office Employee, Jain Diet
- [x] Meal image library catalogued: 37 named dishes + 200+ AI-generated images
- [x] PayU credentials confirmed — Key: YviYBu — stored in .env.local
- [x] Tech stack locked: Next.js + Prisma + Neon + Vercel + Tailwind + Zustand + NextAuth
- [x] Next.js app created (create-next-app@16.2.6)
- [x] Prisma 7 installed + configured for Neon adapter
- [x] prisma.config.ts — datasource.url wired to Neon
- [x] schema.prisma v1 — 14 models, 11 enums
- [x] Migration 20260512003135_init — applied clean, no errors
- [x] All 14 tables live in Neon PostgreSQL
- [x] Seed file written (prisma/seed.ts) — 17 products + full price matrix
- [x] **Seed EXECUTED** — 17 products + 966 price rows live in Neon ✅
- [x] Schema updated: MealPlanType expanded to 17 values, isLive + phase fields added to MealPlanProduct
- [x] pg adapter used for seed (replaced Neon serverless adapter — correct for Node.js scripts)

---

## 🗺️ ALL PHASES — BIRD'S EYE VIEW

| Phase | Name | Status |
|-------|------|--------|
| 0 | Audit & Planning | ✅ Done |
| 1 | Design System + Tech Stack + DB Setup | 🟡 In Progress (3/6) |
| 2 | Core Website Redesign (Homepage, Nav, Shell) | ⏳ Pending |
| 3 | Meal Plans + Shop + PayU | ⏳ Pending |
| 4 | User Profile + Dashboard + Auth | ⏳ Pending |
| 5 | Body Metrics — FitDays BLE Integration | ⏳ Pending |
| 6 | Nutrition Tracker (SparkyFitness-inspired) | ⏳ Pending |
| 7 | Exercise Library (Beginner/Inter/Expert + Reps/Sets) | ⏳ Pending |
| 8 | Supplement Guide | ⏳ Pending |
| 9 | Lifestyle Meal Plans (Medical, Sex, Alcohol, Smoking etc.) | ⏳ Pending |
| 10 | Live Delivery Tracking | ⏳ Pending |
| 11 | Progress Tracking + Charts + Reports | ⏳ Pending |
| 12 | AI Chatbot + AI Personal Trainer | ⏳ Pending |
| 13 | Digital Meal Plans (PDF/downloadable) | ⏳ Pending |
| 14 | Blog, FAQ, Testimonials, About (redesigned) | ⏳ Pending |
| 15 | Admin Panel (solo owner ops) | ⏳ Pending |
| 16 | Notifications — n8n (WhatsApp + Email) | ⏳ Pending |
| 17 | QA, Performance, DNS cutover, Launch | ⏳ Pending |

---

## 🏆 PRODUCT TIERS — LOCKED VISION

### STANDARD TIER (Phase 3 launch)
- Meal delivery (physical) — all existing plans
- Choose: Diet → Duration → Meals/day
- Dashboard: order history, delivery tracking, today's meals
- Body metrics (manual entry or FitDays BLE)
- Nutrition tracker (basic)
- Digital meal plans (downloadable PDFs, sold separately)

Price anchor: Rs.400 trial → Rs.47,250 for 3-month all meals

### PREMIUM TIER (Phase 8+)
Everything in Standard PLUS:
- Supplement add-ons delivered with meals (whey sachets, creatine, vitamins, omega-3, pre-workout)
- Full nutrition tracker with macros, micros, plan vs actual comparison
- Exercise library access (full video library)
- Personalised workout plan (trainer-assigned)
- Priority WhatsApp support
- Weekly check-in PDF report (automated via n8n)

Revenue: Meal plan + supplement add-on recurring revenue. Near-zero extra logistics (supplements packed with existing delivery).

### LUXURY TIER (Phase 12+)
Everything in Premium PLUS:
- Physical wellness add-ons (massage, spa, in-home yoga — partner tie-ups, Pune)
- AI Personal Trainer (Claude API) — daily plans, form feedback, progressive overload tracking
- Concierge onboarding: 1-on-1 video call with owner/nutritionist
- Custom meal plan (fully personalized)
- Quarterly body transformation report
- Priority delivery slot (first delivery of the day)

Target: Serious fitness enthusiasts, HNIs, corporate wellness buyers.

---

## 💰 COMPLETE PRICING MATRIX — AUTHORITATIVE

Source: wp_wc_product_meta_lookup + wp_postmeta (confirmed from 171MB DB dump)
Same pricing applies across ALL plans (diet-agnostic for price).

| Duration | Meals/Day | Price (Rs.) |
|----------|-----------|------------|
| Trial Day | Breakfast + Lunch | 400 |
| Trial Day | Snack + Dinner | 400 |
| Trial Day | All 4 meals | 750 |
| Weekly (7 days) | Breakfast + Lunch | 2,700 |
| Weekly (7 days) | Snack + Dinner | 2,700 |
| Weekly (7 days) | All 4 meals | 4,900 |
| Bi-Weekly (15 days) | Breakfast + Lunch | 5,775 |
| Bi-Weekly (15 days) | Snack + Dinner | 5,775 |
| Bi-Weekly (15 days) | All 4 meals | 9,720 |
| Monthly excl. Sat-Sun (~22 days) | Breakfast + Lunch | 7,560 (Veg/Egg) / 7,600 (Non-Veg) |
| Monthly excl. Sat-Sun (~22 days) | Snack + Dinner | 7,560 (Veg/Egg) / 7,600 (Non-Veg) |
| Monthly excl. Sat-Sun (~22 days) | All 4 meals | 13,860 |
| 1 Month (full) | Breakfast + Lunch | 9,500 |
| 1 Month (full) | Snack + Dinner | 9,500 |
| 1 Month (full) | All 4 meals | 16,999 |
| 2 Month | Breakfast + Lunch | 18,900 |
| 2 Month | Snack + Dinner | 18,900 |
| 2 Month | All 4 meals | 33,000 |
| 3 Month | Breakfast + Lunch | 27,450 |
| 3 Month | Snack + Dinner | 27,450 |
| 3 Month | All 4 meals | 47,250 |

GST: 5% added on top at checkout.
Jain Diet: Vegetarian only (no Egg/Non-Veg options).
Custom Personalized: No price matrix (trainer assigns).

---

## 💳 PAYU INTEGRATION

| Field | Value |
|-------|-------|
| Merchant Key | YviYBu |
| Merchant Salt | BHigtcZU3kzvpLC9ZFtnrWMYBVtYWz2R |
| Currency | INR |
| New Success URL | https://app.fitfuel.in/api/payments/payu/success |
| New Failed URL | https://app.fitfuel.in/api/payments/payu/failed |

Hash formula (compute server-side ONLY): `key|txnid|amount|productinfo|firstname|email|||||||||||salt` → HMAC-SHA512
After payment, PayU POSTs to success/failed URL — verify hash server-side before marking order paid.

---

## 🛠️ TECH STACK — LOCKED

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (React) |
| Styling | Tailwind CSS |
| State | Zustand |
| Backend | Next.js API routes + Node.js |
| ORM | Prisma 7 |
| Database | PostgreSQL (Neon — free tier, 0.5GB) |
| Hosting | Vercel (connected to GitHub — pranitborkar98) |
| Auth | NextAuth.js — Phone OTP (MSG91) + Google Sign-In |
| Payments | PayU |
| Notifications | n8n (self-hosted, free) — WhatsApp Business + Email |
| Storage | Cloudinary or S3 (Phase 2) |
| AI | Claude API (Anthropic) — Phase 12 |
| Design | Dark Athletic — black bg, lime #84cc16 accent, white text |

---

## 🏗️ INFRASTRUCTURE STATUS

| Service | Status | Details |
|---------|--------|---------|
| Domain fitfuel.in | ✅ Live | Hostinger — WordPress still running |
| Neon PostgreSQL | ✅ Live | ep-lingering-wildflower-aqi59lyk.c-8.us-east-1.aws.neon.tech |
| 14 DB tables | ✅ Live | Migration 20260512003135_init applied |
| Next.js app | ✅ Created | C:\Users\VCOM\fitfuel |
| Prisma 7 | ✅ Configured | Neon adapter, prisma.config.ts wired |
| GitHub repo | ⏳ To create | pranitborkar98 account — private repo needed |
| Vercel project | ✅ LIVE | fitfuel-eosin.vercel.app |
| Seed data | ⏳ NOT RUN | File written — needs package.json fix first |
| PayU | ✅ Confirmed | Credentials in .env.local |
| Railway/n8n | ⏳ Phase 16 | Trial expired — revisit for n8n |
| MSG91 | ⏳ Phase 4 | OTP auth — not needed yet |
| WhatsApp API | ⏳ Phase 16 | Meta Business — not needed yet |

---

## 🔐 ENVIRONMENT VARIABLES MASTER LIST
> .env.local — NEVER commit to GitHub. Add to Vercel dashboard: Project Settings → Environment Variables.

```
# Database
DATABASE_URL=postgresql://neondb_owner:npg_BpgWQF9ZLq7K@ep-lingering-wildflower-aqi59lyk.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require

# PayU
PAYU_MERCHANT_KEY=YviYBu
PAYU_MERCHANT_SALT=BHigtcZU3kzvpLC9ZFtnrWMYBVtYWz2R
PAYU_MODE=production

# Auth (Phase 4)
NEXTAUTH_SECRET=generate-a-random-string-here
NEXTAUTH_URL=https://app.fitfuel.in
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MSG91_AUTH_KEY=

# AI (Phase 12)
CLAUDE_API_KEY=

# Storage (Phase 2)
CLOUDINARY_URL=
```

---

## 🗄️ DATABASE — 14 TABLES LIVE IN NEON

| Table | Purpose |
|-------|---------|
| users | Auth — email, phone, Google ID, role |
| user_profiles | Name, age, gender, height, goal, activity level |
| addresses | Delivery addresses (multiple per user) |
| meal_plan_products | 17 products (5 live Phase 3, 12 coming soon Phase 9) |
| plan_prices | 966 price rows — full matrix seeded (PENDING) |
| orders | Order header — user, product, plan choice, status |
| order_items | Line items per order |
| payments | PayU transaction records |
| deliveries | Daily delivery status per order |
| active_plans | Currently running subscription per user |
| body_metrics | FitDays scale data — weight, BMI, body fat, muscle mass etc. |
| nutrition_logs | Daily food log entries |
| exercises | Exercise library — name, level, sets, reps, muscle groups |
| workout_logs + admin_notes | Workout tracking + trainer notes |

---

## 🔍 SEED FILE AUDIT — COMPLETE

File: `prisma/seed.ts`
Status: Written ✅ — **NOT RUN YET** ⚠️

| Check | Result |
|-------|--------|
| Price matrix vs DB | ✅ 100% match — all 21 price rows correct |
| Non-Veg MONTHLY_EXCL_WEEKENDS Rs.7,600 vs others Rs.7,560 | ✅ Correct — real DB variance |
| FK delete order (planPrice before mealPlanProduct) | ✅ Correct |
| Jain → Veg only | ✅ Correct |
| Custom → no price matrix | ✅ Correct |
| GST 5% in planPrice rows | ✅ Correct |
| isActive: true on all rows | ✅ Correct |
| dotenv/config import | ✅ Works with tsx |
| 17 products total | ✅ 5 live (Phase 3) + 12 coming soon (Phase 9) |
| Price row count (non-Jain): 3 diets × 3 meals × 7 durations = 63 per product | ✅ |
| Price row count (Jain): 1 diet × 3 meals × 7 durations = 21 rows | ✅ |

**⚠️ BLOCKER TO RUN SEED:**
Add to `package.json` at root level (not inside "scripts"):
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```
Then run: `npx prisma db seed`
Expected output: 17 products, 966 price rows, 5 live, 12 coming soon.

---

## 📋 BUSINESS INTELLIGENCE

- 179 registered WordPress users
- 145 WooCommerce customers
- 21 recorded orders (Sep 2024 – Jan 2026)
- 3 completed orders (Oct 2024: Rs.17,849 + Rs.2,834; Oct 2025: Rs.13,860)
- Most recent order: Jan 2026 — Rs.13,860 (cancelled)
- Highest attempted order: Rs.1,22,844.75 (failed — bulk 5-item, PayU issue)
- Business IS running — webhook logs confirmed firing Apr 2026
- Most failures = PayU gateway issues, not customer cancellations
- Real offline/COD orders likely not all in DB

---

## 🍽️ MEAL IMAGE LIBRARY

### Named Dish Images (37 photos)
Avocado Cocoa Mousse Almond Crackers, Avocado Toast with Poached Egg, Banana with Peanut Butter, Boiled Eggs with Masala Sweet Potatoes, Boiled Eggs with Paprika, Chia Pudding with Berries Almond Butter, Chickpea Avocado Wrap with Mint Yogurt Dip, Chickpea Spinach Curry with Red Rice, Dark Chocolate Almond Bites Raspberry Tea, Egg Bhurji Wrap with Beet Slaw, Fish Curry with Brown Rice Bhindi, Fruit Salad with Chia Seeds, Greek Yogurt Parfait with Seeds Honey, Greek Yogurt with Dark Chocolate Seeds, Grilled Chicken Beetroot Quinoa Bowl, Grilled Fish Brown Rice Steamed Veggies, Grilled Tofu Bowl with Quinoa Beetroot Tahini, Herbed Paneer Salad with Roasted Veggies Millet, Lentil Coconut Curry with Brown Rice, Methi Chicken with Bajra Roti, Moong Dal Khichdi with Ghee Cabbage Salad, Multigrain Paratha with Curd, Paneer Tikka with Millet Sauteed Greens, Protein Ladoo Oats Peanut Jaggery, Quinoa Muesli with Flax Coconut Yogurt, Ragi Porridge with Almonds Dates, Rajma Brown Rice Bowl with Mixed Salad, Soya Keema with Multigrain Toast, Spiced Oats with Banana Pumpkin Seeds, Stuffed Capsicum with Paneer Quinoa, Sweet Potato Hash with Kale Goat Cheese, Tandoori Chicken with Millet Salad, Thai Basil Stir Fry with Tofu Brown Rice, Tofu Stir Fry with Quinoa, Tofu Tikka with Whole Wheat Roti Mint Slaw, Trail Mix Nuts Seeds Raisins, Vegetable Stew with Red Rice Idiyappam

### AI-Generated Images (200+ by category)
Jain, Vegetarian, Eggetarian, Non-Vegetarian, Snacks — full catalogue in WordPress backup

---

## 🧠 ALL DECISIONS — LOCKED

| # | Topic | Decision |
|---|-------|----------|
| 1 | App vs Website | Website |
| 2 | Keep WordPress? | NO — full rebuild. WordPress backup kept for reference only. |
| 3 | Tech Stack | Next.js + Node.js + PostgreSQL |
| 4 | Deployment | Vercel — subdomain app.fitfuel.in during build, then fitfuel.in |
| 5 | Migration strategy | Soft launch on subdomain — active customers stay on WordPress until cutover |
| 6 | Auth | Phone OTP (MSG91) + Google Sign-In — NextAuth.js |
| 7 | Payment | PayU (confirmed) + Cash on Delivery |
| 8 | Pricing model | Fixed price lookup table from DB — not formula-based |
| 9 | Notifications | n8n self-hosted — WhatsApp Business API + Email |
| 10 | Revenue streams | Meal delivery + Digital plans + Supplements (Premium) + AI Trainer (Luxury) |
| 11 | Admin ops | Solo (owner only) for now |
| 12 | Color / Design | DARK ATHLETIC — black bg, lime #84cc16 accent, white text |
| 13 | FitDays / Body Metrics | Web Bluetooth API — in-browser BLE scale connection (Chrome) |
| 14 | Delivery Tracking | Driver PWA (smartphone) |
| 15 | Exercise content | Custom 3D animated videos — placeholder now, animations later |
| 16 | Language | English only |
| 17 | Target city | Pune only (Kharadi base) — expand later |
| 18 | SparkyFitness | Inspiration + feature reference — build equivalent natively |
| 19 | Zomato/Swiggy | Already live separately — no website integration |
| 20 | GST | 5% on meal plan products |
| 21 | Owner email | pranitborkar98@gmail.com |

---

## ⚠️ PENDING INPUTS (non-blocking until relevant phase)

| # | What | Phase | Status |
|---|------|-------|--------|
| 1 | MSG91 or Twilio account | Phase 4 | ⏳ Pending |
| 2 | WhatsApp Business API / Meta Business account | Phase 16 | ⏳ Pending |
| 3 | Hosting type confirmation (VPS vs shared) on Hostinger | Phase 16 (n8n) | ⏳ Check hPanel |
| 4 | FitDays scale model number (BLE compatibility) | Phase 5 | ⏳ Pending |
| 5 | Supplement supplier / source | Phase 8 | ⏳ Not urgent |
| 6 | Wellness partner tie-ups (massage/spa) | Phase 12+ | ⏳ Not urgent |

---

## 📁 FILES & ASSETS

| File | Status | Notes |
|------|--------|-------|
| PROJECT_TRACKER.md | ✅ This file | Updated this session |
| prisma/seed.ts | ✅ Written | NOT RUN — needs package.json fix |
| u271592098_U9cur.sql | ✅ Analysed | 171MB phpMyAdmin dump — MariaDB 11.8, May 11 2026 |
| Meal images (5 zips, 1.63GB) | ✅ Catalogued | 37 named + 200+ AI-generated |

---

## 🔴 BLOCKERS

**No blockers.** Seed complete. Moving to Phase 1 task 5 — Tailwind design tokens.

---

## 🚀 WHAT WE'RE BUILDING

Year 1: Best meal delivery + health tracking platform in Pune.
Year 2: Add supplements, digital plans, AI trainer — recurring revenue machine.
Year 3: Luxury wellness tier, corporate clients, expand cities.

The tech we build now carries all of that. Every phase is a building block. Build it right once.
