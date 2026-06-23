# FITFUEL — MASTER PROJECT TRACKER (DEFINITIVE)
> **Last Updated: June 8, 2026**
> **Reconciles: Master tracker (May 19) + Phase 9 tracker v1 (May 20) + Phase 9 tracker v2 + Phase 9 tracker v3 (May 26) + Vision Realignment (May 26) + Session update (May 27) + Day 2 build complete (May 27) + Day 3 build complete (May 30) + Phase 10 Delivery System core live (Jun 4) + Phase 11 Progress Charts + 9R/9D verified live + checkout encoding fix (Jun 5) + Phase 13 Digital Meal Plans core live (Jun 6) + Phase 14 Blog/FAQ/Testimonials core live (Jun 8)**
> **DB verified via SQL on May 26: 119 plans | 1 active (weight-loss-veg) | 30 recipes | 120 slots | 1 active_plan (Pranit) | 2499 price rows**
> **Platform:** Next.js + Node.js + PostgreSQL (Neon)
> **Deployment:** Vercel — fitfuel-eosin.vercel.app → fitfuel.in after launch
> **Mission:** FitFuel is not a meal delivery app. It is a personal health operating system that delivers food. The meal is the entry point. The system is what keeps them forever.
> **Owner:** Pranit Borkar — pranitborkar98@gmail.com

---

## THE FITFUEL VISION — NEVER DEVIATE FROM THIS

### What FitFuel Actually Is
A user signs up. They tell us their body, their goal, their health condition. We calculate exactly what they need to eat and how they need to move. We cook it, deliver it, track every gram, watch their weight trend, adjust when they plateau, recommend supplements for their specific condition, and when the AI is live — we talk to them every day like a personal trainer who knows everything about them. The meal plan is just the door. The system is the product.

**FitFuel's moat is not the food. It is the data loop.**
Every meal logged → every workout completed → every weight entry → every supplement taken → feeds an engine that knows this user better than any nutritionist they've ever met. That is what no tiffin service, no fitness app, no supplement brand can replicate. We are building all three, connected.

### The Daily Loop — The Core Engine

```
USER JOINS → ONBOARDING (body + goal + diet + condition)
                    ↓
         TDEE calculated → Meal Plan assigned → Exercise Program assigned
                    ↓
         ┌─────────────── EVERY DAY ───────────────────┐
         │                                              │
         │  MORNING: "Here are your 4 meals today"      │
         │      ↓                                       │
         │  USER EATS → "I ate this" → MealLog          │
         │      → auto-creates FoodEntry in diary       │
         │      → calorie ring updates                  │
         │      ↓                                       │
         │  WORKOUT: "Today's recommended session"      │
         │  (linked to their plan type, not random)     │
         │      → complete → WorkoutSession logged       │
         │      → kcal burned feeds Net Calorie Engine  │
         │      ↓                                       │
         │  NET CALORIES: In - Out vs Target            │
         │      → visual ring on dashboard              │
         │      ↓                                       │
         │  SCALE: Weekly weigh-in (FitDays BLE)        │
         │      → weight trend calculated               │
         │      → if plateau → recalibrate targets      │
         │      ↓                                       │
         │  CONSISTENCY SCORE updated (0-100)           │
         │      → feeds AI trainer context              │
         └──────────────────────────────────────────────┘
                    ↓
         WEEKLY DIGEST (Sunday) — meals, workouts,
         weight change, best rated dish, streak
                    ↓
         SUPPLEMENTS: Recommended stack for their
         plan + condition (personalised, not static)
                    ↓
         AI TRAINER (Phase 12): Has ALL this context.
         Not a chatbot. A trainer who watched every rep
         and every meal for 30 days.
                    ↓
         PLAN PROGRESSION: Hit goal → system detects
         → suggests next plan (maintenance, lean bulk, etc.)
```

### User Tiers — What Each Gets

> **Decision #43 (revised May 27):** Full 30-day menu is 100% public. No blur. No auth wall on any day. The moat is the system, not the menu. Anyone can Google "weight loss Indian meal plan." Nobody else gives per-gram tracking, adaptive recalibration, consistency score, and AI trainer on top of daily delivery. Sign-in wall is on the system, never the menu.

| Feature | Visitor | Free User | Standard | Premium | Luxury |
|---------|---------|-----------|----------|---------|--------|
| Plan pages + full 30-day menu (dish names + macros) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Day 1 full recipe with ingredients | ✅ | ✅ | ✅ | ✅ | ✅ |
| TDEE calculator (public tool) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Plan quiz + recommendation | ✅ | ✅ | ✅ | ✅ | ✅ |
| Meal delivery | ❌ | ❌ | ✅ | ✅ | ✅ |
| Per-gram meal logging | ❌ | ❌ | ✅ | ✅ | ✅ |
| Net calorie engine | ❌ | ❌ | ✅ | ✅ | ✅ |
| Exercise library (browse) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Linked workout schedule | ❌ | ❌ | ❌ | ✅ | ✅ |
| Body metrics tracking | ❌ | ❌ | ✅ | ✅ | ✅ |
| Adaptive calorie recalibration | ❌ | ❌ | ✅ | ✅ | ✅ |
| Supplement guide (static) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Personalised supplement stack | ❌ | ❌ | ❌ | ✅ | ✅ |
| Supplement delivery add-on | ❌ | ❌ | ❌ | ✅ | ✅ |
| Smart weekly grocery list | ❌ | ❌ | ✅ | ✅ | ✅ |
| Meal swap request | ❌ | ❌ | ✅ | ✅ | ✅ |
| Weekly progress PDF report | ❌ | ❌ | ❌ | ✅ | ✅ |
| Consistency score | ❌ | ❌ | ✅ | ✅ | ✅ |
| Plan progression suggestions | ❌ | ❌ | ✅ | ✅ | ✅ |
| Weekly digest (WhatsApp) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Priority WhatsApp support | ❌ | ❌ | ❌ | ✅ | ✅ |
| AI personal trainer chat | ❌ | ❌ | ❌ | ❌ | ✅ |
| 1-on-1 nutritionist consult | ❌ | ❌ | ❌ | ❌ | ✅ |
| Custom meal plan adjustments | ❌ | ❌ | ❌ | ❌ | ✅ |
| Concierge delivery slot | ❌ | ❌ | ❌ | ❌ | ✅ |
| Quarterly transformation report | ❌ | ❌ | ❌ | ❌ | ✅ |

### How Every Existing Feature Connects (Nothing Is Standalone)

| Feature Built | Connects To |
|---|---|
| Exercise Library (Phase 7) | → Plan-linked workout schedule (9D) → Net Calorie Engine (9L) → AI Trainer context (12) |
| Body Metrics / FitDays (Phase 5) | → Weight trend → Adaptive recalibration → Plateau detection → AI Trainer |
| Nutrition Tracker (Phase 6) | → Net Calorie Engine → Consistency Score → Weekly Digest → AI Trainer |
| Supplement Guide (Phase 8) | → Personalised stack (plan + condition) → Supplement delivery (Premium) → AI recommendations |
| Meal Plans DB (Phase 9) | → Recipe preview (public) → Daily meals (subscribers) → Kitchen production list (admin) |
| Meal Ratings | → Menu Evolution (admin flags low-rated recipes) → Recipe replacement pipeline |
| Workout Logger | → kcal burned → Net Calories → Consistency Score → AI Trainer |
| TDEE Engine (9B) | → Onboarding → UserActivePlan → Adaptive recalibration loop |
| Plan Schedule (9C) | → Today's meals → Smart grocery list → Kitchen production → Franchise SOP |
| Consistency Score (9R) | → Progress page (Phase 11) → Weekly snapshot trend → AI Trainer primary signal (12) |
| Progress Charts (Phase 11) | → Weight/calorie/macro/consistency visualisation → Plateau detection (18) → Quarterly report (Luxury) |

### Systems Not Yet In Tracker (Adding Now)

1. **Adaptive Calorie Recalibration** — Weight drops detected → TDEE recalculated → calorie target updated → user notified
2. **Consistency Score Engine** — 0-100 score from meal logs + workouts + water + weigh-ins. Powers AI trainer context.
3. **Meal Feedback → Menu Evolution** — Ratings aggregate per recipe. Admin dashboard shows avg rating. < 3.0 avg → auto-flagged for replacement.
4. **Meal Swap Request** — User dislikes today's meal → requests swap → system offers same-calorie alternatives → logs choice
5. **Smart Weekly Grocery List** — Subscriber feature: "Cook along this weekend" — pulls Week 1 recipe ingredients, formats as shopping list
6. **Plan Progression Engine** — Detects goal completion (target weight hit, 30 days done) → suggests next plan in logical sequence
7. **Personalised Supplement Stack** — Not static guide. plan_category + health_condition → curated stack with doses. Luxury = AI refines it.
8. **Body Metrics → Plan Intelligence** — Flat weight trend 2 weeks → auto-surface "time to recalibrate?" dashboard alert
9. **Weekly Digest** — Every Sunday via n8n WhatsApp: meals logged, workouts done, weight delta, best-rated dish, streak count
10. **Kitchen Production Dashboard** — Admin sees: tomorrow's delivery count per recipe × portions. The scale SOP. Franchise foundation.
11. **Referral System** — `referredBy` field on User. Refer friend → both get 1 free trial day. Simple, no complex logic.
12. **Public TDEE Calculator** — Standalone tool on /tools/tdee-calculator. No account needed. Entry funnel into onboarding.

---

## PHASE STATUS OVERVIEW

| Phase | Name | Status |
|-------|------|--------|
| 0 | Audit & Planning | ✅ Complete |
| 1 | Design System + Tech Stack + DB | ✅ Complete |
| 2 | Core Website Redesign | ✅ Complete |
| 3 | Meal Plans + Shop + PayU | ✅ Complete |
| 4 | User Profile + Dashboard + Auth | ✅ Complete |
| 5 | Body Metrics — FitDays BLE | ✅ Complete (scale hardware test pending) |
| 6 | Nutrition Tracker | ✅ Complete — pushed to main |
| 7 | Exercise Library + Workout Logger | ✅ Complete — pushed to main |
| 8 | Supplement Guide | ✅ Complete — pushed to main |
| **9** | **Lifestyle Meal Plans + Dashboard Wiring** | **🔄 IN PROGRESS** |
| 10 | Live Delivery Tracking | 🔄 Core LIVE (Jun 4) — 3 items pending |
| 11 | Progress Tracking + Charts + Consistency Score | ✅ Core LIVE (Jun 5) — charts deployed; snapshot cron LIVE (trend line renders once weeks accrue) |
| 12 | AI Personal Trainer + Customer-Service Assistant (unified) | ⏸️ PARKED Jun 5 — scope FINALIZED (tight v1 + captured v2–v4 backlog, see scope doc) — build DEFERRED until data loop is fuller / later phases ship (Decision #85) |
| 13 | Digital Meal Plans (PDF/downloadable) | ✅ Core LIVE (Jun 6) — Starter ₹299 / Pro ₹699 tiers, designed PDF (cover→meals→grocery→Pro training→back cover), digital PayU checkout, coupon engine, owner/admin PDF preview. PDF rendered on-the-fly (Blob caching = TODO before scaling). + 13D checkout capture (Jun 6): optional height/weight/goal/age at digital checkout → persisted to UserProfile on payment success → personalises the PDF. Build green, pushed (9a272d7). |
| 14 | Blog, FAQ, Testimonials | ✅ Core LIVE (Jun 8) — all 3 DB-backed (`BlogPost` / `Faq` / `Testimonial`). Blog list + article (SEO metadata, BlogPosting JSON-LD, related posts), FAQ upgraded to categorised native-`<details>` accordion + FAQPage JSON-LD, new `/testimonials` page (goal filter + aggregate rating). Footer wired (Reviews + FAQ). Seeded: 17 FAQs, 8 testimonials, 3 launch articles. `db push` + seed run, pushed to main. See Phase 14 section + Decisions #90–#92. |
| 15 | Admin Panel + Kitchen Production Dashboard | ⏸️ Pending |
| 16 | Notifications — n8n (WhatsApp Weekly Digest + Email) | ⏸️ Pending |
| 17 | Personalised Supplement Stack + Delivery | ⏸️ Pending |
| 18 | Plan Progression Engine + Adaptive Recalibration | ⏸️ Pending |
| 19 | Referral System + Public TDEE Tool | ⏸️ Pending |
| 20 | QA, Performance, DNS cutover, Launch | ⏸️ Pending |
| 21 | Aggregator / Marketplace Channel (Zomato + Swiggy) | ⏸️ Pending — post-launch growth channel (added Jun 5, Decision #77) |
| 22 | Social & Community (accountability, challenges, coach handoff) | ⏸️ Pending — split out of Phase 12 (added Jun 5, Decision #84) |

---

## TECH STACK

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.2.6 (React) — App Router |
| Styling | Tailwind CSS + custom CSS variables + inline styles |
| Fonts | Barlow Condensed (global) · Syne (dashboard Phase 7/8) · DM Sans (dashboard Phase 7/8) |
| Animation | Framer Motion |
| Icons | Lucide React |
| State | Zustand |
| Auth | NextAuth.js v5 beta — Google OAuth live |
| Backend | Next.js API routes |
| ORM | Prisma 7 |
| Database | PostgreSQL (Neon — free tier, 0.5GB) |
| Payments | PayU + COD |
| Body Metrics | Web Bluetooth API — FitDays BLE scale |
| Notifications | n8n self-hosted — Phase 16 |
| AI | Claude API (Anthropic) — Phase 12 |
| Hosting | Vercel (GitHub auto-deploy on push to main) |

---

## DESIGN SYSTEM

| Property | Value |
|----------|-------|
| Display font | Syne (600/700/800) — dashboard |
| Body font | DM Sans (300/400/500/600) — dashboard |
| Background | #080808 locked globally |
| Card background | #101010 / #161616 on hover |
| Max width | 1120px |
| Standard plans accent | #a3e635 (lime) |
| Medical plans accent | Per-condition (see below) |
| Sports accent | #c084fc (purple) |
| Tier accents | Standard: #a3e635 · Premium: #f59e0b · Luxury: #e879f9 |
| Seasonal accent | #f97316 (orange) |

> **Checkout / shared component token set (verified Jun 5 from app/checkout/page.tsx):** bg #0a0a0a · card #111111 · cardBorder #1f1f1f · accent #84cc16 · accentLight #a3e635 · text #ffffff · textSecond #a3a3a3 · textMuted #737373. Progress page (Phase 11) reuses this exact set + chart colors good #22c55e / warn #f97316 / fat #38bdf8 / muscle #f59e0b.

### Per-Condition Color System
| Condition | Accent |
|-----------|--------|
| PCOS | #f472b6 (rose) |
| Diabetic | #2dd4bf (teal) |
| Thyroid | #a78bfa (violet) |
| Heart | #fb7185 (red) |
| Gut health | #34d399 (emerald) |
| Obesity | #fb923c (orange) |
| Knee/Joints | #38bdf8 (sky blue) |
| Skin & hair | #fbbf24 (amber) |
| Smoking recovery | #4ade80 (green) |
| Alcohol recovery | #94a3b8 (slate) |
| Female plans | #f9a8d4 (pink) |
| Sports | #c084fc (purple) |
| Senior | #67e8f9 (cyan) |
| Seasonal / festival | #f97316 (orange) |

---

## PRICING MATRIX

### Tier Multipliers
| Tier | Multiplier | Status |
|------|-----------|--------|
| Standard | 1.0x (base) | ✅ Live |
| Premium | 1.25x | Waitlist open |
| Luxury | 1.50x | Waitlist open |

### Standard Tier Prices
| Duration | B+L | S+D | All 4 meals |
|----------|-----|-----|-------------|
| Trial day | ₹400 | ₹400 | ₹750 |
| Weekly (7d) | ₹2,700 | ₹2,700 | ₹4,900 |
| Bi-weekly (15d) | ₹5,775 | ₹5,775 | ₹9,720 |
| Monthly excl. weekends | ₹7,560 | ₹7,560 | ₹13,860 |
| 1 Month | ✅9,500 | ₹9,500 | ₹16,999 |
| 2 Months | ₹18,900 | ₹18,900 | ₹33,000 |
| 3 Months | ₹27,450 | ₹27,450 | ₹47,250 |
> Non-Veg Monthly excl. weekends B+L / S+D = ₹7,600 (not ₹7,560)

---

## DATABASE — CURRENT STATE (May 27, 2026)

> **Corrected May 27:** Plans = 119 (27 STANDARD + 70 LIFESTYLE_MEDICAL + 22 SPORTS confirmed from seed output). Price rows = 2499 (seed re-ran with new pricing). Previous tracker had wrong counts (113 plans, 966 price rows).

| Table | Purpose | Row Count |
|-------|---------|-----------|
| users | Auth — email, Google ID, role | Unknown |
| user_profiles | Name, age, gender, height, goal, activity level | Unknown |
| addresses | Delivery addresses | Unknown |
| accounts | NextAuth OAuth | Unknown |
| sessions | NextAuth database sessions | Unknown |
| meal_plan_products | 17 products (5 live, 12 coming) | 17 |
| plan_prices | Full pricing matrix | **2499** |
| orders | Order records | Unknown |
| order_items | Line items | Unknown |
| payments | PayU + COD records | Unknown |
| deliveries | Daily delivery status | Unknown |
| body_metrics | FitDays scale data | Unknown |
| exercises | Exercise library | 873 |
| workout_sessions | Session records | Unknown |
| workout_exercises | Exercises in sessions | Unknown |
| workout_sets | Set data | Unknown |
| meal_types | Breakfast/Lunch/Dinner/Snacks | 4 |
| food_items | Food library (50 Indian + custom) | 50+ |
| food_entries | Nutrition diary | Unknown |
| nutrition_goals | Daily targets per user | Unknown |
| water_logs | Daily water totals | Unknown |
| **meal_plans** | Plan definitions | **119 ✅** |
| **recipes** | Recipe library | **30 ✅ (WL-Veg only)** |
| **recipe_ingredients** | Ingredient links | **520 ✅** |
| **recipe_steps** | Cooking steps | Unknown |
| **plan_schedule_slots** | 30-day rotating schedule | **120 ✅ (WL-Veg only)** |
| **user_active_plans** | User plan subscriptions | **1 ✅ (Pranit — weight-loss-veg, Day 1)** |
| **meal_logs** | Did user eat today's meal | 0 — API built, ready to receive logs |
| **consistency_snapshots** | Weekly consistency history (Phase 11) | LIVE — table created via db push Jun 5; populated weekly by Saturday cron (+ on-demand curl) |
| **blog_posts** | Blog articles (Phase 14) | LIVE — created via db push Jun 8; **3** seeded (status PUBLISHED, 1 featured). HTML body, slug-unique, category + tags. |
| **faqs** | FAQ entries (Phase 14) | LIVE — created via db push Jun 8; **17** seeded across 6 categories. answerHtml allows inline legal links. |
| **testimonials** | Member reviews (Phase 14) | LIVE — created via db push Jun 8; **8** seeded (3 featured). goal-tagged for filtering; isFeatured flags homepage candidates. |

---

## FOOD ITEM IDs — HARDCODED DB IDs (use in every seed file)

```
BASMATI_RICE_COOKED  → cmpa7mnoq000420ugxi69878u
ROTI                 → cmpa7mo3p000520ug80thl0j1
POHA                 → cmpa7mowz000720ugt8luwuwl
UPMA                 → cmpa7mpbl000820ug0fkxm9hi
IDLI                 → cmpa7mpq7000920ugn8criyqu
OATS_DRY             → cmpa7mrcl000d20ug44sudfy1
TOOR_DAL             → cmpa7mrr5000e20ugylkmb052
MASOOR_DAL           → cmpa7ms5z000f20ugxi4zujc7
RAJMA                → cmpa7msz1000h20ugho8x65z4
CHICKPEAS            → cmpa7mtdr000i20ugbveydv96
MOONG_DAL            → cmpa7mts7000j20ugwrxdvixk
SPINACH              → cmpa7mul3000l20ugu6394ti0
TOMATO               → cmpa7mve4000n20ugo3xfeg9c
ONION                → cmpa7mvsm000o20ugl9gw7jsg
CAULIFLOWER          → cmpa7mw74000p20ugbom3l88u
CARROT               → cmpa7mwlm000q20ug4y1k1x9h
CURD_LOWFAT          → cmpa7mxt5000t20ugxr5f2cwd
GHEE                 → cmpa7mz0i000w20ug62y9fvdi
EGG_WHOLE            → cmpa7mztp000y20ugwqtde2oy
EGG_WHITE            → cmpa7n088000z20ug4m7mrhol
CHICKEN_BREAST       → cmpa7n0ms001020ugudjs4vcu
CHICKEN_THIGH        → cmpa7n1fw001220ugyx5p9ias
ROHU_FISH            → cmpa7n28z001420ugk1606cpz
SALMON               → cmpa7n1ue001320ug9jm92i8w
ALMONDS              → cmpa7n2np001520ugwzq8nd8t
PEANUTS              → cmpa7n3gl001720ug266ps0ie
CHIA_SEEDS           → cmpa7n3v3001820ugx6y99v73
BANANA               → cmpa7n49q001920ugxfm9uzdh
PANEER               → cmpa7mx03000r20ug1ccnyy5o
CURD_FULLFAT         → cmpa7mxeo000s20ugrqe6zkvr
SALT                 → cmpmcgp590000asugacrl4mb7  ← created by patch-wl-veg.ts
JAGGERY              → cmpmcgpia0001asugdokpvn20  ← created by patch-wl-veg.ts
```
All other ingredients → `MISSING_FOOD_ITEMS` block in seed file (upserted at runtime).

---

## PHASE 9 — LIFESTYLE MEAL PLANS + DASHBOARD WIRING

### Why Phase 9 Is The Most Important Phase
Every phase before this was a feature. Phase 9 is the **business itself in code form.**
- The recipe DB is the SOP for every kitchen, franchise, and partner
- The plan schedule is what makes per-gram tracking possible
- The tier system wired to real plans unlocks Premium and Luxury revenue
- The lifestyle + medical + sports catalogue makes FitFuel a health platform, not a tiffin service
- Every future phase (AI trainer, digital PDFs, franchise portal) runs on what we build here

### Phase 9 Sub-Phases

| Sub-Phase | Name | Status |
|-----------|------|--------|
| 9A | Recipe Database Schema | ✅ COMPLETE — migrated May 20 |
| 9B | Personalisation Engine (TDEE + meal-plans-data) | ✅ COMPLETE |
| 9C | Plan Schedule System (seed files) | 🔄 IN PROGRESS — 1/119 done |
| 9D | Exercise Schedule Wiring (plan-linked, not standalone) | ✅ COMPLETE — Jun 4 (verified live Jun 5; Wed=rest restored Jun 5 — schedule cmq0ehixv00009gugf0lbg0lv) |
| 9E | Individual Standard Plan Pages (public, full 30-day menu visible, Day 1 full recipe) | ✅ COMPLETE — May 30 (weight-loss-veg built, all 3 files verified) |
| 9F | Lifestyle / Medical Plan Pages | ❌ Not started |
| 9G | Sports Nutrition Plan Pages | ❌ Not started |
| 9H | Tier Comparison + Pricing Page | ❌ Not started |
| 9I | Public Trust Pages | ✅ COMPLETE — Jun 5, 2026 (all 13 pages built + deployed: 5 legal + 8 trust; footer wired) |
| 9J | Dashboard — Today's Meals Card | ✅ COMPLETE — verified May 30 (4 meals render, buttons work, progress bar, mobile responsive, drawer) |
| 9K | Dashboard — Meal Rating (1–5 stars + note after "I ate this") | ✅ COMPLETE — Jun 3, 2026 |
| 9L | Net Calorie Engine (meals in - workout out vs target) | ❌ Not started (NOTE Jun 5: daily net ring renders on dashboard; lib/net-calories.ts file itself still unbuilt — Phase 11 progress page computes calorie history directly from raw tables instead) |
| 9M | Lightweight Recipe Admin | ❌ Not started |
| 9N | Onboarding Flow | ✅ COMPLETE — all 3 files verified May 27 |
| 9O | Homepage Sections Update | ❌ Not started |
| 9P | Meal Swap Request System | ❌ Not started |
| 9Q | Smart Weekly Grocery List | ❌ Not started |
| 9R | Consistency Score Engine | ✅ COMPLETE — Jun 4 (verified live Jun 5 — card renders 5-component score on dashboard) |
| 9S | Meal Feedback → Menu Evolution (admin flagging) | ❌ Not started |
| 9T | Public TDEE Calculator (/tools/tdee-calculator) | ❌ Not started |

---

## 9A — RECIPE DATABASE SCHEMA ✅ COMPLETE

Migration name: `add-recipe-plan-schedule-system`

### New Models Added
- `Recipe` — core unit, all macros + micros, cuisine, difficulty, kitchen ops
- `RecipeIngredient` — links Recipe → FoodItem, quantity in raw grams, cookedWeightFactor
- `RecipeStep` — step-by-step SOP, scales to franchise
- `MealPlan` — 119 plan definitions, dietaryVariant, tier, isActive
- `PlanScheduleSlot` — day × mealSlot × recipe mapping (unique constraint)
- `UserActivePlan` — user → plan assignment, startDate, currentDay, status
- `MealLog` — did user eat today's meal, actual vs planned grams, rating
- `ExerciseSchedule` + `ExerciseScheduleDay` — workout plan linked to meal plan type

### New Enums
- `MealSlot` — BREAKFAST, LUNCH, DINNER, SNACK
- `PlanTier` — STANDARD, PREMIUM, LUXURY
- `PlanCategory` — STANDARD, LIFESTYLE_MEDICAL, SPORTS, CORPORATE, DIGITAL
- `DietVariant` — VEG, EGG, NON_VEG, JAIN, VEGAN

### Existing Models Extended
- `UserProfile` — targetWeightKg, age, healthConditions, dietaryRestrictions, allergies, tdee, calorieTarget, onboardingComplete
- `FoodItem` — recipeIngredients relation
- `User` — userActivePlans, mealLogs relations
- `Role` enum — added OWNER

### Known Schema Gaps (fix in next migration — do NOT touch current schema during Phase 9 build)
```prisma
// ALL GAPS RESOLVED ✅
// Migration: 20260526093831_phase9_consistency_referral_swap_tracking
// Added: weeklyConsistencyScore, referredBy on UserProfile
// Added: referralCode on User
// Added: swapAwayCount, avgRating on Recipe
```

> **⚠️ DietType enum gap (Decision #58):** JAIN and VEGAN are missing from DietType enum.
> jain and vegan diet preferences from onboarding both map to VEGETARIAN in DietType — this is lossy.
> dietToSlug() correctly maps jain→jain, vegan→veg so plan assignment is correct.
> Profile stores wrong dietPreference for jain/vegan users.
> **Fix:** Add JAIN + VEGAN to DietType enum in next migration. Non-blocking for current build.

### Schema Corrections (no migration needed — fix in code)
```
glycaemicIndex IS already in schema ✅
Seed file strips it incorrectly. Fix:

In prisma/seed-recipes-weight-loss-veg.ts, find:
  const { glycaemicIndex: _g, ...recipeData } = def.recipe as any
Replace with:
  const recipeData = def.recipe

Do NOT strip GI in any future seed files.
```

---

## 9B — PERSONALISATION ENGINE ✅ COMPLETE

### Files Built
- `lib/tdee.ts` ✅ — BMR (Mifflin-St Jeor), TDEE, calorie targets, macro targets, serving multiplier, BMI, ideal weight range, weeks-to-goal
- `lib/meal-plans-data.ts` ✅ — Full static plan catalogue, LAUNCH_PLANS array, getPlanBySlug(), getPlansByCategory(), CONDITION_COLORS map

### TDEE Logic (Mifflin-St Jeor)
```
BMR (male)   = 10×weight + 6.25×height - 5×age + 5
BMR (female) = 10×weight + 6.25×height - 5×age - 161
TDEE = BMR × activity multiplier
  sedentary: 1.2 | lightly_active: 1.375 | moderately_active: 1.55
  very_active: 1.725 | athlete: 1.9
```

### Calorie Targets by Goal
```
weight_loss: TDEE - 500
aggressive_weight_loss: TDEE - 750
maintenance: TDEE
lean_bulk: TDEE + 300
muscle_gain: TDEE + 500
performance: TDEE + 200
```

### Macro Targets
```
Protein g/kg by goal:
  weight_loss: 2.0 | muscle_gain: 2.2 | maintenance: 1.6
  performance: 2.4 | sports_endurance: 1.8 | recovery: 1.8
  pcos: 1.8 | diabetic: 1.6
Fat: 27% of calories
Carbs: remaining calories
```

### Onboarding Fields Collected
- Current weight (kg), Height (cm), Age, Gender
- Activity level (5 options with descriptions)
- Primary goal (weight loss / muscle gain / maintenance / performance / health condition)
- Dietary preference (Veg / Egg / Non-Veg / Jain / Vegan)
- Health conditions (multi-select: PCOS, Diabetic, Thyroid, Heart, None, Other)
- Allergies (multi-select: nuts, dairy, gluten, shellfish, none)
- Meal timing preference

---

## 9C — PLAN SCHEDULE SYSTEM (SEED FILES)

### Strategy: Claude Chat Generation
**Do NOT use generate-fitfuel-seeds.ts (API generator). Instead:**
- Type `generate seed-recipes-[plan-slug]` in this Claude chat
- Claude writes the full .ts file
- Download → drop in prisma/ → run → verify in Prisma Studio
- One file per session. Verify before requesting next.

### Seed File Rules (enforced in every generated file)
1. **Cuisine split**: 80% Indian regional, 20% Indian fusion — ZERO international-only
2. **Forbidden ingredients**: no tahini, miso, gochujang, kimchi, couscous, avocado, edamame (except vegan), rice noodles, chipotle, Italian basil, fresh dill at scale
3. **Meal slot counts**: BREAKFAST×8, LUNCH×10, SNACK×5, DINNER×7 = 30 total
4. **No NEW_ID_ anywhere** — all unknowns go in MISSING_FOOD_ITEMS block
5. **SALT always in MISSING_FOOD_ITEMS** (learned from WL-Veg patch — never hardcode)
6. **Plan mandates**: diabetic=low GI, PCOS=anti-inflammatory, keto=<50g carb, Jain=no onion/garlic/root veg/mushroom/cauliflower
7. **Macros**: calories per serving within ±50kcal of plan target
8. **Slug format**: kebab-case-recipe-name-plan-slug — unique, no collisions
9. **Schedule**: built inside same seed file — 120 slots (30 days × 4 meals)
10. **Idempotent**: findFirst before create on all food items, findUnique before create on recipes

### Gate Checks Before Running Any Seed File
```bash
# Must return 0 — any NEW_ID_ = hard stop
grep -c "NEW_ID_" prisma/seed-recipes-[plan-slug].ts

# Cuisine check — must be Indian dominant
grep "cuisineType" prisma/seed-recipes-[plan-slug].ts | head -15

# After running — verify in Prisma Studio SQL:
SELECT COUNT(*) FROM recipes WHERE 'weight_loss' = ANY(plan_categories);
SELECT COUNT(*) FROM plan_schedule_slots WHERE meal_plan_id = (SELECT id FROM meal_plans WHERE slug = 'weight-loss-veg');
# Expected: recipes ≥ 30, slots = 120
```

### isActive Rule
- All plans start `isActive: false`
- Flip to `true` only after BOTH recipe seed AND schedule are verified in DB
- Only `weight-loss-veg` is currently `isActive: true` ✅

### Recipe Seed File Status — ALL 119 PLANS

#### STANDARD PLANS (27 files)
> **Corrected May 27:** Count is 27 (was 21). The extra 6 are EGG + JAIN variants confirmed in seed output.

| # | Slug | Diet | kcal | Recipe Seed | Schedule | isActive | Priority |
|---|------|------|------|-------------|----------|----------|----------|
| 1 | weight-loss-veg | VEG | 1600 | ✅ 30 recipes IN DB | ✅ 120 slots IN DB | ✅ true | P0 ✅ |
| 2 | weight-loss-egg | EGG | 1600 | ❌ | ❌ | false | P0 |
| 3 | weight-loss-non-veg | NON_VEG | 1650 | ⚠️ 28 in DB, broken ingredient links | ⚠️ schedule ok | false | P0 |
| 4 | muscle-gain-veg | VEG | 2200 | ❌ | ❌ | false | P0 |
| 5 | muscle-gain-egg | EGG | 2200 | ❌ | ❌ | false | P1 |
| 6 | muscle-gain-non-veg | NON_VEG | 2300 | ❌ | ❌ | false | P0 |
| 7 | balanced-veg | VEG | 1800 | ❌ | ❌ | false | P1 |
| 8 | balanced-egg | EGG | 1800 | ❌ | ❌ | false | P1 |
| 9 | balanced-non-veg | NON_VEG | 1850 | ❌ | ❌ | false | P1 |
| 10 | balanced-jain | JAIN | 1750 | ❌ | ❌ | false | P1 |
| 11 | intermittent-fasting-veg | VEG | 1600 | ❌ | ❌ | false | P2 |
| 12 | intermittent-fasting-non-veg | NON_VEG | 1650 | ❌ | ❌ | false | P2 |
| 13 | vegan-muscle | VEGAN | 2100 | ❌ | ❌ | false | P2 |
| 14 | keto-indian-veg | VEG | 1600 | ❌ | ❌ | false | P2 |
| 15 | keto-indian-non-veg | NON_VEG | 1650 | ❌ | ❌ | false | P2 |
| 16 | body-recomp-veg | VEG | 1900 | ❌ | ❌ | false | P2 |
| 17 | body-recomp-non-veg | NON_VEG | 1950 | ❌ | ❌ | false | P2 |
| 18 | lean-bulk-veg | VEG | 2100 | ❌ | ❌ | false | P2 |
| 19 | lean-bulk-non-veg | NON_VEG | 2150 | ❌ | ❌ | false | P2 |
| 20 | cutting-veg | VEG | 1400 | ❌ | ❌ | false | P3 |
| 21 | cutting-non-veg | NON_VEG | 1400 | ❌ | ❌ | false | P3 |
| 22 | weight-loss-jain | JAIN | 1550 | ❌ | ❌ | false | P1 |
| 23 | weight-loss-vegan | VEGAN | 1600 | ❌ | ❌ | false | P1 |
| 24 | muscle-gain-jain | JAIN | 2150 | ❌ | ❌ | false | P2 |
| 25 | muscle-gain-vegan | VEGAN | 2100 | ❌ | ❌ | false | P2 |
| 26 | balanced-vegan | VEGAN | 1800 | ❌ | ❌ | false | P2 |
| 27 | balanced-non-veg-jain | JAIN | 1750 | ❌ | ❌ | false | P2 |

> ⚠️ weight-loss-non-veg: 28 recipes exist but RecipeIngredient rows have broken FoodItem links from NEW_ID_* era. Fix: generate new file via Claude chat → delete old recipes → re-seed.

#### LIFESTYLE / MEDICAL PLANS (37 files)
| # | Slug | Diet | Key Nutrition | Recipe Seed | isActive | Priority |
|---|------|------|--------------|-------------|----------|----------|
| 28 | pcos-veg | VEG | Low GI, anti-inflammatory, hormone balance | ❌ | false | P0 |
| 29 | pcos-non-veg | NON_VEG | Low GI, lean protein, omega-3 | ❌ | false | P0 |
| 30 | diabetic-veg | VEG | Controlled carbs, low GI, no refined sugar | ❌ | false | P0 |
| 31 | diabetic-non-veg | NON_VEG | Lean protein, controlled carbs | ❌ | false | P0 |
| 32 | pre-diabetic-veg | VEG | GI management, weight normalisation | ❌ | false | P1 |
| 33 | pre-diabetic-non-veg | NON_VEG | Lean protein, low GI | ❌ | false | P1 |
| 34 | thyroid-veg | VEG | Goitrogen-aware, selenium, iodine | ❌ | false | P1 |
| 35 | thyroid-non-veg | NON_VEG | Selenium-rich seafood, iodine | ❌ | false | P1 |
| 36 | heart-health-veg | VEG | Low sat fat, omega-3, high fibre, DASH | ❌ | false | P1 |
| 37 | heart-health-non-veg | NON_VEG | Omega-3 fish, lean protein | ❌ | false | P1 |
| 38 | hypertension-veg | VEG | Low sodium, potassium-rich, DASH | ❌ | false | P1 |
| 39 | hypertension-non-veg | NON_VEG | Low sodium, lean protein | ❌ | false | P1 |
| 40 | fatty-liver-veg | VEG | Low fat, high antioxidants | ❌ | false | P2 |
| 41 | fatty-liver-non-veg | NON_VEG | Lean protein, liver-supporting foods | ❌ | false | P2 |
| 42 | kidney-health-veg | VEG | Low K, low P, controlled protein | ❌ | false | P2 |
| 43 | kidney-health-non-veg | NON_VEG | Controlled protein, specific foods | ❌ | false | P2 |
| 44 | gout-veg | VEG | Low purine, no dal, no spinach | ❌ | false | P2 |
| 45 | gout-non-veg | NON_VEG | No red meat, low purine | ❌ | false | P2 |
| 46 | anaemia-veg | VEG | Iron-rich, Vit C pairing, B12, folate | ❌ | false | P1 |
| 47 | anaemia-non-veg | NON_VEG | Liver, iron, B12 | ❌ | false | P1 |
| 48 | vitamin-d-veg | VEG | D3 food sources, fortified | ❌ | false | P2 |
| 49 | vitamin-d-non-veg | NON_VEG | Fatty fish, egg yolk, fortified | ❌ | false | P2 |
| 50 | b12-deficiency-veg | VEG | Fortified foods, dairy, eggs | ❌ | false | P2 |
| 51 | b12-deficiency-non-veg | NON_VEG | Animal protein, fortified | ❌ | false | P2 |
| 52 | obesity-veg | VEG | BMI 30+, clinical deficit | ❌ | false | P1 |
| 53 | obesity-non-veg | NON_VEG | High protein, volume eating | ❌ | false | P1 |
| 54 | knee-health-veg | VEG | Anti-inflammatory, collagen, Vit D | ❌ | false | P2 |
| 55 | knee-health-non-veg | NON_VEG | Collagen (bone broth), omega-3 | ❌ | false | P2 |
| 56 | post-surgery-veg | VEG | Soft foods, anti-inflammatory | ❌ | false | P2 |
| 57 | post-surgery-non-veg | NON_VEG | Soft protein, wound healing | ❌ | false | P2 |
| 58 | post-covid-veg | VEG | Lung health, immunity, fatigue | ❌ | false | P2 |
| 59 | post-covid-non-veg | NON_VEG | High protein recovery | ❌ | false | P2 |
| 60 | cancer-recovery-veg | VEG | High cal, easy digest, immune | ❌ | false | P3 |
| 61 | cancer-recovery-non-veg | NON_VEG | Soft protein, immune support | ❌ | false | P3 |
| 62 | liver-detox | VEG | Antioxidant, 21-day reset | ❌ | false | P2 |
| 63 | gut-health-veg | VEG | Low-FODMAP, probiotics | ❌ | false | P1 |
| 64 | gut-health-non-veg | NON_VEG | Low-FODMAP, lean protein | ❌ | false | P1 |

#### FEMALE-SPECIFIC PLANS (12 files)
| # | Slug | Diet | Key Nutrition | Recipe Seed | isActive | Priority |
|---|------|------|--------------|-------------|----------|----------|
| 65 | menopause-veg | VEG | Calcium, Vit D, phytoestrogens, bone density | ❌ | false | P2 |
| 66 | menopause-non-veg | NON_VEG | Same + lean protein | ❌ | false | P2 |
| 67 | fertility-veg | VEG | Folate, iron, DHA, zinc, antioxidants | ❌ | false | P2 |
| 68 | fertility-non-veg | NON_VEG | Same + DHA fish | ❌ | false | P2 |
| 69 | post-pregnancy-veg | VEG | Iron, calcium, folate, calorie surplus | ❌ | false | P1 |
| 70 | post-pregnancy-non-veg | NON_VEG | Same + high protein | ❌ | false | P1 |
| 71 | pms-veg | VEG | Magnesium, B6, low sodium, anti-bloat | ❌ | false | P2 |
| 72 | pms-non-veg | NON_VEG | Same | ❌ | false | P2 |
| 73 | female-athlete-veg | VEG | Higher iron needs, female macro targets | ❌ | false | P2 |
| 74 | female-athlete-non-veg | NON_VEG | Same + lean protein | ❌ | false | P2 |
| 75 | hormonal-acne-veg | VEG | Low GI, anti-inflammatory, zinc | ❌ | false | P2 |
| 76 | hormonal-acne-non-veg | NON_VEG | Same | ❌ | false | P2 |

#### SKIN & HAIR PLANS (10 files)
| # | Slug | Diet | Key Nutrition | Recipe Seed | isActive | Priority |
|---|------|------|--------------|-------------|----------|----------|
| 77 | anti-aging-veg | VEG | Vit C, E, zinc, omega-3, lycopene | ❌ | false | P2 |
| 78 | anti-aging-non-veg | NON_VEG | Same + collagen foods | ❌ | false | P2 |
| 79 | acne-skin-veg | VEG | Low GI, anti-inflammatory, zinc | ❌ | false | P1 |
| 80 | acne-skin-non-veg | NON_VEG | Same | ❌ | false | P1 |
| 81 | hair-health-veg | VEG | Biotin, iron, protein, selenium | ❌ | false | P1 |
| 82 | hair-health-non-veg | NON_VEG | Same + eggs | ❌ | false | P1 |
| 83 | eczema-veg | VEG | Omega-3, anti-inflammatory, elimination | ❌ | false | P2 |
| 84 | eczema-non-veg | NON_VEG | Same + fatty fish | ❌ | false | P2 |
| 85 | skin-glow-veg | VEG | Vit C foods, antioxidants, hydration | ❌ | false | P2 |
| 86 | skin-glow-non-veg | NON_VEG | Same | ❌ | false | P2 |

#### ADDICTION & RECOVERY PLANS (5 files)
| # | Slug | Diet | Key Nutrition | Recipe Seed | isActive | Priority |
|---|------|------|--------------|-------------|----------|----------|
| 87 | quit-smoking-veg | VEG | Vit C depletion fix, antioxidants, mood foods | ❌ | false | P2 |
| 88 | quit-smoking-non-veg | NON_VEG | Same | ❌ | false | P2 |
| 89 | alcohol-recovery-veg | VEG | B vitamins, liver support, blood sugar stabilisation | ❌ | false | P2 |
| 90 | alcohol-recovery-non-veg | NON_VEG | Same | ❌ | false | P2 |
| 91 | detox-reset | VEG | No sugar, no processed, anti-inflammatory | ❌ | false | P2 |

#### SENIOR & KIDS PLANS (4 files)
| # | Slug | Diet | Key Nutrition | Recipe Seed | isActive | Priority |
|---|------|------|--------------|-------------|----------|----------|
| 92 | senior-veg | VEG | Soft textures, calcium, B12, low sodium | ❌ | false | P2 |
| 93 | senior-non-veg | NON_VEG | Same | ❌ | false | P2 |
| 94 | kids-teen-veg | VEG | Growth, iron, DHA, no junk | ❌ | false | P2 |
| 95 | kids-teen-non-veg | NON_VEG | Same | ❌ | false | P2 |

#### SEASONAL / FESTIVAL PLANS (4 files)
| # | Slug | Diet | Season | Key Nutrition | Recipe Seed | isActive | Priority |
|---|------|------|--------|--------------|-------------|----------|----------|
| 96 | navratri | VEG | Oct 9 days | Saatvik, no grains, kuttu/singhara, dairy-based | ❌ | false | P3 |
| 97 | ramadan | NON_VEG | Mar-Apr 30 days | Pre-dawn high protein, sunset high carb | ❌ | false | P3 |
| 98 | diwali-detox | VEG | Nov 21 days | Anti-inflammatory, no sugar, liver support | ❌ | false | P3 |
| 99 | shravan | VEG | Jul-Aug | Saatvik, no non-veg, dairy-forward | ❌ | false | P3 |

> Seasonal plans toggled via MealPlan.isActive — no special schema needed. Admin flips live during festival window.

#### SPORTS NUTRITION PLANS (20 files)
| # | Slug | Diet | Target | Key Nutrition | Recipe Seed | isActive | Priority |
|---|------|------|--------|--------------|-------------|----------|----------|
| 100 | endurance-veg | VEG | Runners, cyclists, swimmers | High carb (55%), mod protein | ❌ | false | P1 |
| 101 | endurance-non-veg | NON_VEG | Same | Same + lean protein | ❌ | false | P1 |
| 102 | strength-hypertrophy-veg | VEG | Gym, powerlifting | Very high protein (2.2g/kg), carb cycling | ❌ | false | P0 |
| 103 | strength-hypertrophy-non-veg | NON_VEG | Same | Same | ❌ | false | P0 |
| 104 | competition-prep-veg | VEG | Bodybuilders | Periodised — bulk/cut | ❌ | false | P3 |
| 105 | competition-prep-non-veg | NON_VEG | Same | Same | ❌ | false | P3 |
| 106 | sports-recovery-veg | VEG | Post-injury | Anti-inflammatory, collagen, Vit C | ❌ | false | P2 |
| 107 | sports-recovery-non-veg | NON_VEG | Same | Same | ❌ | false | P2 |
| 108 | cricket-veg | VEG | Cricket players | Intermittent high energy, match day vs training | ❌ | false | P1 |
| 109 | cricket-non-veg | NON_VEG | Same | Same | ❌ | false | P1 |
| 110 | football-veg | VEG | Football, futsal | High carb match day, recovery focus | ❌ | false | P2 |
| 111 | football-non-veg | NON_VEG | Same | Same | ❌ | false | P2 |
| 112 | swimming-veg | VEG | Competitive swimmers | High volume calories, dual training | ❌ | false | P3 |
| 113 | swimming-non-veg | NON_VEG | Same | Same | ❌ | false | P3 |
| 114 | martial-arts-veg | VEG | BJJ, MMA, boxing | Weight class management | ❌ | false | P2 |
| 115 | martial-arts-non-veg | NON_VEG | Same | Same | ❌ | false | P2 |
| 116 | female-athlete-sports-veg | VEG | Women in sport | Higher iron, hormonal considerations | ❌ | false | P2 |
| 117 | female-athlete-sports-non-veg | NON_VEG | Same | Same | ❌ | false | P2 |
| 118 | youth-athlete-veg | VEG | School/college sport | Growth + performance balance | ❌ | false | P2 |
| 119 | youth-athlete-non-veg | NON_VEG | Same | Same | ❌ | false | P2 |

### Seed File Grand Totals
| Category | Files | Status |
|----------|-------|--------|
| Standard | 27 | 1 done ✅, 1 broken ⚠️, 25 todo ❌ |
| Medical | 37 | 0 done |
| Female | 12 | 0 done |
| Skin & Hair | 10 | 0 done |
| Addiction & Recovery | 5 | 0 done |
| Senior & Kids | 4 | 0 done |
| Seasonal | 4 | 0 done |
| Sports | 20 | 0 done |
| **TOTAL** | **119** | **1/119 verified** |

### P0 Generation Queue (Claude chat commands, in order)
```
generate seed-recipes-weight-loss-egg
generate seed-recipes-muscle-gain-veg
generate seed-recipes-muscle-gain-non-veg
generate seed-recipes-pcos-veg
generate seed-recipes-pcos-non-veg
generate seed-recipes-diabetic-veg
generate seed-recipes-diabetic-non-veg
generate seed-recipes-strength-hypertrophy-veg
generate seed-recipes-strength-hypertrophy-non-veg
```

---

## 9N — ONBOARDING FLOW ✅ COMPLETE (May 27, 2026)

### Files Built and Verified
```
app/onboarding/
  page.tsx                    ✅ — Server component, auth guard + already-onboarded redirect
  OnboardingClient.tsx        ✅ — 5-step client component with progress bar, TDEE calc, submit
app/api/user/onboarding/
  route.ts                    ✅ — POST — TDEE calc, plan selection, UserActivePlan write, transaction
```

### What It Does (Plain English)
User signs up → "Tell us about yourself" → we calculate their calorie target → assign them to the right meal plan → write one row to `user_active_plans` → dashboard shows today's 4 meals.

### When It Triggers
1. New user signs up → after email verification → onboarding modal/page
2. Existing user places first order → post-checkout onboarding
3. User visits dashboard without `onboardingComplete = true` → banner + "Complete setup"

### Onboarding Steps (5 steps, progress bar)
```
Step 1: Your body
  Current weight (kg) · Height (cm) · Age · Gender

Step 2: Your goal
  Weight loss / Muscle gain / Maintenance / Health condition / Performance

Step 3: Your lifestyle
  Activity level (5 options with descriptions) · Dietary preference

Step 4: Health check
  Any conditions? (PCOS / Diabetic / Thyroid / Heart / None / Other)
  Any allergies? (nuts / dairy / gluten / shellfish / none)

Step 5: Your numbers
  Show calculated TDEE + recommended calorie target
  "Your plan has been personalised to X kcal/day"
  → Complete → saves to UserProfile → assigns to meal plan → redirect to dashboard
```

### What Gets Written to DB on Completion
```typescript
// 1. Update UserProfile
await prisma.userProfile.update({
  where: { userId },
  data: {
    currentWeightKg, heightCm, age, gender,
    activityLevel, goal, dietaryPreference,
    healthConditions, allergies,
    tdee: calculatedTDEE,
    calorieTarget: calculatedTarget,
    onboardingComplete: true,
  }
})

// 2. Find matching meal plan (e.g. weight-loss-veg)
const plan = await prisma.mealPlan.findUnique({
  where: { slug: 'weight-loss-veg' } // derived from goal + diet preference
})

// 3. Write to user_active_plans
await prisma.userActivePlan.create({
  data: {
    userId,
    mealPlanId: plan.id,
    startDate: new Date(),
    endDate: addDays(new Date(), 30),
    currentDay: 1,
    status: 'active',
    calorieTarget: calculatedTarget,
  }
})
```

> **Decision #59:** Onboarding creates UserActivePlan immediately on completion. It is NOT order-gated. User completes onboarding → plan assigned → dashboard shows meals. Order is a separate step.

### Plan Selection Logic (goal + diet → slug)
```typescript
function getPlanSlug(goal: string, diet: string, condition: string): string {
  if (condition === 'pcos') return `pcos-${diet}`
  if (condition === 'diabetic') return `diabetic-${diet}`
  if (condition === 'thyroid') return `thyroid-${diet}`
  if (condition === 'heart') return `heart-health-${diet}`
  if (goal === 'weight_loss') return `weight-loss-${diet}`
  if (goal === 'muscle_gain') return `muscle-gain-${diet}`
  if (goal === 'performance') return `strength-hypertrophy-${diet}`
  return `balanced-${diet}` // default
}
// diet mapping: vegetarian→veg, eggetarian→egg, non_vegetarian→non-veg, jain→jain
// IMPORTANT: only assign plans that are isActive=true. If target plan is inactive,
// fallback to weight-loss-veg (the only currently active plan)
```

### Known Bug (non-blocking)
```
jain and vegan both map to VEGETARIAN in DietType enum — dietPreference stored incorrectly.
dietToSlug() correctly maps jain→jain, vegan→veg so plan assignment is correct.
Fix: add JAIN + VEGAN to DietType enum in next migration. See Decision #58.
```

---

## 9J — TODAY'S MEALS DASHBOARD CARD ✅ COMPLETE — verified May 30

### What It Shows
```
┌─────────────────────────────────────┐
│ Today's Meals — Day 14 of 30       │
│ Weight Loss Veg · Standard         │
├─────────────────────────────────────┤
│ 🌅 Breakfast  7:00–9:00am          │
│ Maharashtrian Moong Dal Chilla     │
│ 25g P · 5g F · 36g C · 289 kcal  │
│ [I ate this] [Adjust grams] [Skip] │
├─────────────────────────────────────┤
│ ☀️ Lunch  12:30–2:00pm             │
│ Rajma Masala with Roti             │
│ 32g P · 6g F · 48g C · 380 kcal  │
│ [I ate this] [Adjust grams] [Skip] │
├─────────────────────────────────────┤
│ 🌙 Dinner  7:00–8:30pm             │
│ Palak Paneer with Jowar Roti       │
│ 28g P · 12g F · 35g C · 360 kcal │
│ [I ate this] [Adjust grams] [Skip] │
├─────────────────────────────────────┤
│ 🍎 Snack  4:00–5:00pm              │
│ Makhana Chaat                      │
│ 8g P · 3g F · 28g C · 180 kcal   │
│ [I ate this] [Adjust grams] [Skip] │
├─────────────────────────────────────┤
│ Today's total: 1,209 / 1,600 kcal │
│ ██████████░░░░░░░  75%            │
└─────────────────────────────────────┘
```

### API Route Logic
```typescript
// GET /api/user/active-plan/meals/today
// 1. Get user's UserActivePlan (status = 'active')
// 2. Get user's plan start date
// 3. Calculate day: Math.floor((today - startDate) / 86400000) % 30 + 1
// 4. Query plan_schedule_slots WHERE mealPlanId = X AND dayNumber = Y
// 5. Include recipe details (name, calories, macros, slug)
// 6. Return 4 meals: BREAKFAST, LUNCH, SNACK, DINNER
```

### "I ate this" Behaviour
When user taps "I ate this":
1. Creates `MealLog` row (confirmedAt = now, plannedGrams = recipe serving size)
2. Auto-creates `FoodEntry` in nutrition diary (links plan meal → nutrition tracker)
3. Updates calorie ring on nutrition tracker dashboard card

### Files Built — May 27 ✅
```
app/api/user/active-plan/route.ts                  ✅ GET active plan details
app/api/user/active-plan/meals/today/route.ts      ✅ GET today's 4 meals with macros
app/api/user/active-plan/meals/log/route.ts        ✅ POST confirm meal eaten
app/dashboard/page.tsx                             ✅ fetches activePlan server-side
app/dashboard/DashboardClient.tsx                  ✅ renders Today's Meals card + I ate this
```

### Remaining for 9J
```
app/api/user/active-plan/meals/rate/route.ts       ✅ POST rate meal 1–5 stars + note — Jun 3 (9K)
app/api/user/active-plan/pause/route.ts            ❌ POST pause plan
app/api/user/active-plan/skip/route.ts             ❌ POST skip a date
```

### Verified May 30 ✅
```
- Dashboard renders 4 meals: Breakfast, Lunch, Snack, Dinner
- Each meal shows: name, calories, protein/carbs/fat macros
- "I ate this" button — logs MealLog, updates calorie progress bar
- "Skip" button — works
- Progress bar — shows kcal logged vs daily target
- Mobile responsive — tested, no overflow
- Meal detail drawer — tap meal name → expands full macro detail
```

### Bugs Fixed — May 30
```
1. planTier field name → schema field is `tier` not `planTier`
   Root cause: guessed field name, schema not read first
   Fix: read schema.prisma before generating any Prisma select

2. targetCalories field name → schema field is `avgCaloriesPerDay`
   Root cause: same — assumed naming, did not check schema
   Fix: corrected in route.ts, page.tsx, PlanDetailClient.tsx Plan interface

3. proteinTarget field name → schema field is `avgProteinGrams`
   Fix: same files corrected

4. carbTarget / fatTarget → `avgCarbsGrams` / `avgFatGrams`
   Fix: same

5. durationDays → `cycleLengthDays`
   Fix: same

6. fiberGrams → `fibreGrams` (Recipe model uses British spelling)
   Fix: corrected in Recipe interface and all selects

7. difficultyLevel → `difficulty` (Recipe model field name)
   Fix: corrected

8. Apostrophes in JSX single-quoted strings (It's, I've, didn't, they're)
   Root cause: single-quoted JS strings cannot contain unescaped apostrophes
   Fix: switched affected string literals to double quotes
```

### Files Updated — May 30
```
app/plans/[slug]/route.ts             ← fixed all MealPlan + Recipe field names
app/plans/[slug]/page.tsx             ← fixed all MealPlan + Recipe field names
app/plans/[slug]/PlanDetailClient.tsx ← fixed Plan/Recipe interfaces + JSX apostrophes
```

---

## 9K — MEAL RATING ✅ COMPLETE — Jun 3, 2026

### What It Does
After tapping "I ate this", a star rating modal slides up. User rates 1–5 stars and optionally adds a note (max 200 chars). Rating is saved to `MealLog.rating` + `MealLog.ratingNote`. `Recipe.avgRating` is recomputed from all rated logs for that recipe on every submission — feeds directly into 9S menu evolution flagging (< 3.0 avg after 20+ ratings → auto-flag for replacement).

### Files Built
```
app/api/user/active-plan/meals/rate/route.ts   ✅ POST rate meal 1–5 stars + note
app/dashboard/DashboardClient.tsx              ✅ StarRatingModal component + handleRateMeal
```

### API
```
POST /api/user/active-plan/meals/rate
Body: { mealSlot: string, logDate: ISO string, rating: 1–5, note?: string }
Guard: MealLog must exist (meal must be logged before rating)
Side-effect: Recipe.avgRating recomputed via prisma.mealLog.aggregate
```

### UX Flow
1. User taps "I ate this" → MealLog created → drawer closes
2. StarRatingModal appears (centered, blurred backdrop)
3. Tap a star → label appears ("Loved it!", "Didn't like it", etc.)
4. Optional note textarea (placeholder: "too spicy, loved the texture...")
5. "Submit Rating" button appears after star selected
6. Submit → POST to rate API → modal closes
7. Skip button available — rating is always optional, never blocks

### Bugs Fixed During Build — Jun 3
```
1. NextAuth v5: getServerSession(authOptions) → auth()
   Root cause: generated v4 pattern, project uses v5 (Auth.js)

2. MealLog schema mismatch: planScheduleSlotId / dayNumber / scheduledDate / status
   Root cause: assumed fields, didn't read schema first
   Fix: MealLog lookup is userId + mealSlot + logDate (@db.Date)

3. meals/log route: proteinPerServing / carbsPerServing / fatPerServing
   Root cause: guessed field names
   Fix: proteinGrams / carbsGrams / fatGrams (as per schema)

4. meals/log route: FoodEntry auto-creation failed
   Root cause: FoodEntry uses foodItemId FK + mealTypeId FK — not auto-populatable from slot
   Fix: stripped FoodEntry creation entirely — nutrition diary is manually driven
   Note: FoodEntry ← MealLog wiring is a known gap (Decision #32 in tracker)

5. StarRatingModal centering: stuck bottom-left on desktop
   Fix: flexbox wrapper with alignItems center + justifyContent center + borderRadius 20
```

### Meal Timing — Deferred to Delivery Section
`PlanScheduleSlot` has no `deliveryTime` field. Meal times shown in the dashboard
("8:00 AM", "1:00 PM" etc.) are currently hardcoded per slot type in the today API.
Real delivery time wiring requires:
- A `deliveryWindow` or `dispatchTime` field on `UserActivePlan` or a new `DeliverySlot` model
- Admin sets delivery windows per area/tier
- Dashboard reads user's window and shows actual ETA
**This is scoped to the Delivery Section build (Phase 10 or dedicated 9U sub-phase — TBD).**
> **Jun 4 update:** `deliveryWindow` (MORNING/EVENING enum) now exists on UserActivePlan + Delivery (Phase 10). Dashboard meal times still hardcoded per slot — window→ETA wiring still open.

---

## 9L — NET CALORIE ENGINE

```
Today's Balance:
In:   1,209 kcal (from plan meals confirmed)
Out:  340 kcal (from workout session)
Net:  869 kcal consumed of 1,600 target
Remaining: 731 kcal

[Ring visualization — meals vs workout vs target]
```

```typescript
// lib/net-calories.ts
async function getDailyCalorieBalance(userId: string, date: Date) {
  const mealLogCalories = await getMealLogCalories(userId, date)      // confirmed plan meals
  const manualCalories = await getNutritionDiaryCalories(userId, date) // manual food entries
  const caloriesBurned = await getWorkoutCalories(userId, date)        // workout sessions
  const target = await getCalorieTarget(userId)                         // from UserActivePlan

  return {
    in: mealLogCalories + manualCalories,
    out: caloriesBurned,
    net: (mealLogCalories + manualCalories) - caloriesBurned,
    target,
    remaining: target - ((mealLogCalories + manualCalories) - caloriesBurned),
    status: net < target ? 'under' : 'over'
  }
}
```

> **Jun 5 NOTE:** A daily net-calorie *ring* renders on the dashboard, but the dedicated `lib/net-calories.ts` engine file is NOT confirmed built (tracker still marks 9L Not started). Phase 11's progress page computes calorie HISTORY directly from raw tables (MealLog + FoodEntry + WorkoutSession), so it does not depend on 9L. When 9L is formalised, unify both surfaces and close the `MealLog → FoodEntry` gap (Decision #32) so the dashboard ring and progress chart count the same calories.

---

## 9D — EXERCISE SCHEDULE WIRING (Plan-Linked, Not Standalone) ✅ COMPLETE — Jun 4 (verified live Jun 5)

### The Point
The exercise library is NOT a random gym app feature. It is the movement arm of the user's meal plan. When someone subscribes to weight-loss-veg, they don't just get food — they get a HIIT + Strength program auto-assigned. The system tells them what to do today, they log it, calories burned feeds the Net Calorie Engine. The scale measures the result. The AI uses it all. THIS is what makes FitFuel different from every tiffin service in Pune.

### Exercise Programs per Plan Category
| Plan Category | Program | Days/Week | Focus |
|---------------|---------|-----------|-------|
| Weight Loss | HIIT + Strength | 5 | Fat burn, metabolism boost |
| Muscle Gain | PPL Split | 6 | Progressive overload |
| Balanced | Full Body | 3–4 | General fitness |
| PCOS | Low-impact Strength | 4 | Hormone balance, no excessive cardio |
| Diabetic | Walking + Light Strength | 5 | Blood sugar management |
| Thyroid | Moderate Strength + Yoga | 4 | No excessive cardio for hypo |
| Heart | Cardio + Light Strength | 5 | Zone 2 cardio priority |
| Sports Endurance | Periodised Cardio | 6 | VO2 max, threshold |
| Sports Strength | Powerlifting base | 5 | Strength + power |
| Recovery/Rehab | Gentle Mobility | 3 | Joint health, no impact |
| Obesity | Low-impact progressive | 5 | Joint-safe, start easy |
| Senior | Chair exercises + Walking | 5 | Functional movement |

### Dashboard Integration
```
UserActivePlan → mealPlan.subCategory → ExerciseSchedule
→ today's day of week → ExerciseScheduleDay
→ Dashboard: "Today's Workout: Upper Body Strength — 45 mins"
→ Click → opens ExercisesClient with today's exercises pre-loaded
→ Complete → logs to WorkoutSession → kcal burned feeds Net Calorie Engine
```

### Status — Jun 4/5
- ExerciseSchedule + ExerciseScheduleDay models live in schema (weeklyStructure Json, daysPerWeek, sessionDurationMins, estimatedCalories, isRestDay).
- "Today's Workout" card renders on the dashboard (verified live Jun 5 — shows e.g. "Full Body Strength + Core ~260 kcal burn").
- **Loose end RESOLVED (Jun 5):** Wednesday = rest day restored. A `-VERIFY` copy of the seed had temporarily flipped Wed to a 200-kcal workout (to test the burn path) and overwrote the file; re-ran the clean original `prisma/seed-exercise-schedule-weight-loss.ts` (idempotent — deletes + recreates). New schedule cmq0ehixv00009gugf0lbg0lv: Mon strength / Tue cardio / **Wed REST** / Thu strength+core / Fri HIIT / Sat cardio / Sun REST (5 active days). The `-VERIFY` file was deleted to prevent accidental re-runs.

---

## 9E — INDIVIDUAL STANDARD PLAN PAGES ✅ COMPLETE — May 30

### Route: `/plans/[slug]`

> **Decision #43 (revised):** Full 30-day menu is 100% public. No blur. No auth wall on any day. The menu IS the sales material.

### Page Structure (template — data-driven)
```
1. Hero — plan name, tagline, key stats (kcal/day, protein, meal count), CTA, diet variant switcher
2. Who Is This For — target customer, 3-4 bullets, "Is this right for me?" quiz trigger
3. What You Get — B+L+D+S breakdown with times, calorie range, key nutrients
      + "Every box includes your Morning Boost (coffee sachet)" — NOT listed as a 5th meal
4. 7-day sample tabs (Day 1–7) — full macros, dish names — fully public, no auth
5. Full 30-day calendar toggle — ALL 30 days visible (B / L / D / S for every day) — fully public
6. Nutritional Principles — what's prioritised, key foods, what's excluded
7. Per-Gram Tracking — feature highlight, dashboard mockup
8. Pricing Matrix — duration options, tier comparison strip
9. Meal Feedback Loop — "Rate your meals. Menu evolves."
10. Testimonials — plan-specific results
11. FAQ — plan-specific questions
12. CTA — "Order Now" + "Try Trial Day ₹399" + WhatsApp
      → "Order Now" → goes to checkout (guest allowed)
```

### Files Built — May 30 ✅
```
app/plans/[slug]/page.tsx              ← server component — fetches plan + 30-day schedule from DB
app/plans/[slug]/PlanDetailClient.tsx  ← full 12-section sales page UI (all data-driven)
app/api/plans/[slug]/schedule/route.ts ← public GET API — returns plan + full 30-day schedule
```

### Live URL
```
https://fitfuel-eosin.vercel.app/plans/weight-loss-veg
https://fitfuel.in/plans/weight-loss-veg  ← after DNS cutover
```
Dynamic route — all 119 plan slugs work automatically once recipe + schedule seeds are done. No new page files needed per plan.

### Sections Built (12)
```
1.  Hero — plan name, key stats (avgCaloriesPerDay, avgProteinGrams, 4 meals, 30 days), CTAs, tag pills
2.  Who Is This For — 2-column layout, 4 bullet cards
3.  What You Get — 4 meal slot cards (BREAKFAST/LUNCH/SNACK/DINNER) + Morning Boost callout
4.  30-Day Menu — week tabs (Week 1–4) + "See all 30 days" toggle — ALL data from DB, fully public
5.  Day 1 Preview — all 4 Day 1 meals with full macro grids (live DB data)
6.  Nutritional Principles — keyPrinciples + whatIsAvoided from MealPlan, defaults if empty
7.  Per-Gram Tracking — dashboard mockup + 3 feature bullets
8.  Pricing — 6 duration options (Trial/Weekly/2-Week/1-Month/2-Month/3-Month), interactive selector
9.  Living Menu — how meal ratings improve the menu
10. Testimonials — 3 placeholder cards (replace with real data when available)
11. FAQ — 8 questions, accordion
12. Final CTA — "Start eating right tomorrow. Not next Monday." + WhatsApp button
```

### Schema Fields Used (all verified against schema.prisma May 30)
```
MealPlan: id, name, slug, description, tagline, whoIsItFor, keyPrinciples, whatIsAvoided,
          dietaryVariant, tier, category, avgCaloriesPerDay, avgProteinGrams, avgCarbsGrams,
          avgFatGrams, cycleLengthDays, mealsPerDay, accentColor, isActive
Recipe:   id, name, slug, description, caloriesPerServing, proteinGrams, carbsGrams, fatGrams,
          fibreGrams, cuisineType, prepTimeMins, cookTimeMins, servingSizeGrams, difficulty
```

### Route: `/lifestyle-plans/[slug]`

### Additional Sections vs Standard Plan Page
```
2b. Understanding the Condition — plain-language explanation, why diet matters, 1-2 evidence points
3.  Is This Right for You? — checklist, medical disclaimer (MANDATORY), quiz trigger
5b. Nutritionist Credit — photo, name, credentials, specialisation, "designed by..."
6b. GI index per meal (for diabetic + PCOS plans)
10b. "Can I use alongside medication?" FAQ entries
Footer. Medical Disclaimer block (repeated)
```

### Public Landing: `/lifestyle-plans`
Category overview — Medical / Female / Skin & Hair / Recovery / Senior / Seasonal
Search by condition, "Not sure?" → Plan Quiz, featured testimonials per category

---

## 9G — SPORTS NUTRITION PLAN PAGES

### Route: `/sports-nutrition/[slug]`

### Sports Nutrition Landing: `/sports-nutrition`
```
Hero: "Fuel Your Performance"
Sport selector (Cricket / Football / Running / Gym / Swimming / MMA / Other)
Goal selector (Build strength / Improve endurance / Competition prep / Recovery)
"Find my plan" → recommended plan
Featured plans grid, athlete testimonials
"Talk to a sports nutritionist" CTA
```

---

## 9H — TIER COMPARISON + PRICING PAGE

### Route: `/pricing`

### Tier Feature Matrix
| Feature | Standard | Premium | Luxury |
|---------|----------|---------|--------|
| All meal plan types | ✓ | ✓ | ✓ |
| Core recipes | ✓ | ✓ | ✓ |
| Upgraded ingredients | — | ✓ | ✓ |
| Weekly chef special dish | — | ✓ | ✓ |
| Premium protein cuts | — | ✓ | ✓ |
| Nutrition tracker | ✓ | ✓ | ✓ |
| Per-gram meal logging | ✓ | ✓ | ✓ |
| Exercise library | ✓ | ✓ | ✓ |
| Linked workout schedule | — | ✓ | ✓ |
| Supplement guide | ✓ | ✓ | ✓ |
| Supplement delivery add-on | — | ✓ | ✓ |
| Body metrics tracking | ✓ | ✓ | ✓ |
| Weekly progress PDF report | — | ✓ | ✓ |
| Priority WhatsApp support | — | ✓ | ✓ |
| 1-on-1 nutritionist consult | — | — | ✓ |
| AI personal trainer | — | — | ✓ |
| Custom meal plan | — | — | ✓ |
| Concierge delivery slot | — | — | ✓ |
| Quarterly transformation report | — | — | ✓ |

---

## 9I — PUBLIC TRUST PAGES ✅ COMPLETE — Jun 5, 2026

| Page | Route | Priority | Status |
|------|-------|----------|--------|
| How It Works | `/how-it-works` | Critical | ✅ Built + deployed Jun 5 |
| Our Kitchen | `/our-kitchen` | High | ✅ Built + deployed Jun 5 |
| Our Ingredients | `/our-ingredients` | High | ✅ Built + deployed Jun 5 |
| Our Nutritionists | `/our-team` | Critical for medical plans | ✅ Built + deployed Jun 5 (nutritionist placeholder — fill before medical plans launch) |
| Testimonials / Results | `/results` | High | ✅ Built + deployed Jun 5 (real story slots — no fake testimonials) |
| FAQ | `/faq` | High | ✅ Built + deployed Jun 5 |
| Corporate Plans | `/corporate` | Medium | ✅ Built + deployed Jun 5 |
| Contact | `/contact` | High | ✅ Built + deployed Jun 5 |
| Refund & Cancellation | `/refund-policy` | Required | ✅ Built + deployed Jun 5 |
| Terms & Conditions | `/terms` | Required | ✅ Built + deployed Jun 5 |
| Privacy Policy | `/privacy` | Required | ✅ Built + deployed Jun 5 |
| Medical Disclaimer | `/medical-disclaimer` | Required for medical plans | ✅ Built + deployed Jun 5 |
| Allergen Policy | `/allergen-policy` | Required | ✅ Built + deployed Jun 5 |

> All 13 pages are server components, parse-checked clean, styled with locked design tokens (#080808, lime #a3e635, Barlow Condensed/Syne/DM Sans). Footer wired with all 5 legal links (fixed /refunds → /refund-policy). Placeholders remaining: [Registered Entity Name], [Full Registered Address], [Grievance Officer Name], WhatsApp number (91XXXXXXXXXX), nutritionist name + credentials (Pending Input #7).

### How It Works — 6 Steps
```
1. Tell us about you → Onboarding: weight, goal, diet, health condition
2. We build your plan → 30-day rotating menu, personalised calories
3. We cook fresh daily → Kitchen: 4am prep, no frying, fresh sourced
4. Delivered by 8am → Your area, 6 days/week, eco packaging
5. Track it all → Tap "I ate this" → auto-logs macros → see progress
6. Adjust and evolve → Meal feedback, plan swap, tier upgrade anytime
```

---

## 9M — LIGHTWEIGHT RECIPE ADMIN

### Routes
```
/dashboard/admin/recipes              ← recipe list + search
/dashboard/admin/recipes/new          ← create recipe form
/dashboard/admin/recipes/[id]         ← edit recipe
/dashboard/admin/plans                ← meal plan list
/dashboard/admin/plans/[id]/schedule  ← 30-day schedule builder grid
```
Access: role === 'ADMIN' || role === 'OWNER' only (middleware guard)

---

## 9O — HOMEPAGE UPDATES

| Section | Content |
|---------|---------|
| Plan categories strip | Standard / Lifestyle / Sports — 3 cards |
| How it works — 5 step | Visual process strip |
| The MOAT highlight | "Track every gram. No dish repeats in 30 days. Personalised to your body." |
| Tier comparison strip | 3 tier cards — pricing anchoring |
| Testimonials strip | 4-6 customer results with photos |
| Trust badges | FSSAI · Olive oil only · No frying · Fresh daily · 5★ rated |
| Live stats | "Serving X customers in Pune · Y meals delivered" |
| Plan recommendation quiz | Embedded 3-step → recommended plan |

---

## PLAN RECOMMENDATION QUIZ (Shared Component)

Used on: `/plans`, `/lifestyle-plans`, `/sports-nutrition`, `/pricing`, homepage

```
Step 1: What is your primary goal?
  Lose weight / Build muscle / Manage a health condition / Improve performance / Eat healthy

Step 2: What is your dietary preference?
  Vegetarian / Eggetarian / Non-Vegetarian / Jain / Vegan

Step 3: Do you have any health conditions?
  None / PCOS / Diabetes / Thyroid / Heart / Other

→ Result: "Based on your answers, we recommend: [Plan Name]"
→ CTA: "View Plan" → /plans/[slug] or /lifestyle-plans/[slug]
```

File: `components/PlanQuiz.tsx`

---

## LAUNCH GATES — WL-VEG ONLY (Current Strategy)

Launch with `weight-loss-veg` only. All other plans `isActive: false`. Add plans in parallel.

| Gate | Requirement | Status |
|------|-------------|--------|
| G1 | WL-Veg recipes in DB (30) | ✅ Done |
| G2 | WL-Veg schedule in DB (120 slots) | ✅ Done |
| G3 | All other plans isActive: false | ✅ Done |
| G4 | Onboarding flow (writes to user_active_plans) | ✅ Done — May 27 |
| G5 | GET /api/user/active-plan/meals/today works | ✅ Built + pushed — May 27 |
| G6 | Today's Meals dashboard card shows 4 meals | ✅ VERIFIED May 30 — 4 meals render, buttons work, mobile responsive |
| G7 | /plans/weight-loss-veg page renders | ✅ COMPLETE May 30 — built + deployed, all 12 sections |
| G8 | FSSAI license 21523035002815 in footer | ✅ Done — confirmed in footer Jun 5 |
| G9 | Medical disclaimer on medical plan pages | Not needed for WL-Veg |

**ALL gates cleared (G1–G8 ✅) as of Jun 5. WL-Veg is launch-ready. G8 FSSAI confirmed in footer.**

---

## IMMEDIATE BUILD ORDER (This Week)

```
DAY 1 ✅ DONE:
  Built: app/onboarding/page.tsx + OnboardingClient.tsx (5-step flow)
  Built: app/api/user/onboarding/route.ts (saves profile + creates UserActivePlan)
  Verified: user_active_plans has 1 row (Pranit — weight-loss-veg, Day 1, status active)

DAY 2 ✅ DONE — May 27:
  Built: app/api/user/active-plan/route.ts               ← GET active plan
  Built: app/api/user/active-plan/meals/today/route.ts   ← GET today's 4 meals
  Built: app/api/user/active-plan/meals/log/route.ts     ← POST "I ate this"
  Built: app/dashboard/page.tsx                          ← fetches activePlan server-side
  Built: app/dashboard/DashboardClient.tsx               ← Today's Meals card + I ate this buttons
  Pushed to main → Vercel deploying

DAY 3 ✅ DONE — May 30:
  Verified: dashboard shows Day 1 Weight Loss Veg meals on Vercel ← G6 ✅
  Fixed: 7 field name bugs in route.ts + page.tsx + PlanDetailClient.tsx (schema names were wrong)
  Fixed: apostrophe JSX parse errors in PlanDetailClient.tsx (3 separate Vercel build failures)
  Built: app/plans/[slug]/page.tsx              ← server component, Prisma fetch
  Built: app/plans/[slug]/PlanDetailClient.tsx  ← 12-section sales page, 1000+ lines
  Built: app/api/plans/[slug]/schedule/route.ts ← public API, full 30-day schedule
  Pushed: all 3 files to main → Vercel deployed ← G7 ✅
  Root cause note: always read schema.prisma before writing any Prisma select block

DAY 4:
  Check: FSSAI license 21523035002815 in footer ← G8
  Update: WhatsApp number in PlanDetailClient CTA (replace 91XXXXXXXXXX with real number)
  Test: full end-to-end — new user → onboarding → dashboard shows meals → /plans/weight-loss-veg loads
  Fix: any remaining Vercel issues

DAY 5:
  PARALLEL (every session):
  generate seed-recipes-weight-loss-egg  ← type this in Claude chat
  (one per session, verify before next)
```

---

## FULL FILE LIST — PHASE 9

### ✅ Already Built
```
prisma/schema.prisma                                    ← 9A complete, UserActivePlan + all models
prisma/migrations/add-recipe-plan-schedule/             ← applied
prisma/seed-meal-plans.ts                               ← 119 plans seeded ✅
prisma/seed-recipes-weight-loss-veg.ts                  ← 30 recipes + schedule ✅
prisma/patch-wl-veg.ts                                  ← SALT, JAGGERY fix, 10th lunch ✅
lib/tdee.ts                                             ← 9B complete ✅
lib/meal-plans-data.ts                                  ← 9B complete ✅
app/onboarding/page.tsx                                 ← 9N complete ✅
app/onboarding/OnboardingClient.tsx                     ← 9N complete ✅
app/api/user/onboarding/route.ts                        ← 9N complete ✅
app/api/user/active-plan/route.ts                       ← 9J GET active plan ✅ pushed May 27
app/api/user/active-plan/meals/today/route.ts           ← 9J GET today's meals ✅ pushed May 27
app/api/user/active-plan/meals/log/route.ts             ← 9J POST meal log ✅ pushed May 27
app/dashboard/page.tsx                                  ← 9J server fetch ✅ pushed May 27
app/dashboard/DashboardClient.tsx                       ← 9J meals card ✅ pushed May 27 + fixed May 30 + 9D workout card + 9R consistency card (Jun 4)
app/plans/[slug]/page.tsx                               ← 9E server component ✅ built May 30
app/plans/[slug]/PlanDetailClient.tsx                   ← 9E full sales page ✅ built May 30
app/api/plans/[slug]/schedule/route.ts                  ← 9E public API ✅ built May 30
lib/consistency-score.ts                                ← 9R engine ✅ built Jun 4 (5-component weekly score, caches UserProfile.weeklyConsistencyScore)
app/api/user/active-plan/consistency/route.ts           ← 9R GET route ✅ built Jun 4
```

### ❌ To Build — App Features
```
app/api/user/active-plan/meals/rate/route.ts        ← POST rate meal
app/api/user/active-plan/pause/route.ts             ← POST pause
app/api/user/active-plan/skip/route.ts              ← POST skip date

app/lifestyle-plans/
  page.tsx                                          ← 9F landing
  [slug]/
    page.tsx
    LifestylePlanClient.tsx

app/sports-nutrition/
  page.tsx                                          ← 9G landing
  [slug]/
    page.tsx
    SportsPlanClient.tsx

app/pricing/
  page.tsx                                          ← 9H
  PricingClient.tsx

app/how-it-works/page.tsx                           ← 9I ✅ built Jun 5
app/our-kitchen/page.tsx                            ← 9I ✅ built Jun 5
app/our-ingredients/page.tsx                        ← 9I ✅ built Jun 5
app/our-team/page.tsx                               ← 9I ✅ built Jun 5
app/results/page.tsx                                ← 9I ✅ built Jun 5
app/faq/page.tsx                                    ← 9I ✅ built Jun 5
app/corporate/page.tsx                              ← 9I ✅ built Jun 5
app/contact/page.tsx                                ← 9I ✅ built Jun 5 (folder pre-existed)
app/refund-policy/page.tsx                          ← 9I ✅ built Jun 5
app/terms/page.tsx                                  ← 9I ✅ built Jun 5
app/privacy/page.tsx                                ← 9I ✅ built Jun 5
app/medical-disclaimer/page.tsx                     ← 9I ✅ built Jun 5
app/allergen-policy/page.tsx                        ← 9I ✅ built Jun 5

app/dashboard/admin/
  recipes/page.tsx                                  ← 9M
  recipes/new/page.tsx
  recipes/[id]/page.tsx
  recipes/RecipeForm.tsx
  plans/page.tsx
  plans/[id]/schedule/page.tsx

components/PlanQuiz.tsx                             ← shared across all plan pages
lib/net-calories.ts                                 ← 9L
```

### ❌ To Build — Seed Files (via Claude chat)
```
prisma/seed-recipes-weight-loss-egg.ts
prisma/seed-recipes-muscle-gain-veg.ts
prisma/seed-recipes-muscle-gain-non-veg.ts
prisma/seed-recipes-pcos-veg.ts
prisma/seed-recipes-pcos-non-veg.ts
prisma/seed-recipes-diabetic-veg.ts
prisma/seed-recipes-diabetic-non-veg.ts
prisma/seed-recipes-strength-hypertrophy-veg.ts
prisma/seed-recipes-strength-hypertrophy-non-veg.ts
... (110 more)
```

### Files to Modify
```
app/dashboard/profile/ProfileClient.tsx       ← add onboarding fields display, TDEE
app/page.tsx                                  ← 9O homepage sections
middleware.ts                                 ← admin route protection
```

---

## LEGAL REQUIREMENTS (Non-Negotiable Before Launch)

| Requirement | Where | Status |
|-------------|-------|--------|
| FSSAI license 21523035002815 | Footer + /our-kitchen | ✅ Confirmed in footer Jun 5 |
| Medical disclaimer | All medical plan pages + /medical-disclaimer | ✅ /medical-disclaimer page built Jun 5 — still needed on individual medical plan pages (9F/9G) |
| Allergen policy | /allergen-policy + checkout | ✅ /allergen-policy page built Jun 5 — checkout link still pending |
| Nutritionist credentials | All medical plan pages | ❌ (placeholder OK until medical plans launch — Pending Input #7) |
| "Not a substitute for medical advice" | Medical plans + checkout | ❌ |
| Privacy policy | /privacy | ✅ Built Jun 5 |
| Terms & conditions | /terms | ✅ Built Jun 5 |
| Refund & cancellation | /refund-policy | ✅ Built Jun 5 |

---

## API ROUTES — PHASE 9 COMPLETE LIST

| Route | Method | Auth | Description | Status |
|-------|--------|------|-------------|--------|
| `/api/user/onboarding` | POST | Required | Save profile + create UserActivePlan | ✅ Live |
| `/api/user/active-plan` | GET | Required | Get user's current active plan | ✅ Live |
| `/api/user/active-plan/meals/today` | GET | Required | Today's 4 meals with macros | ✅ Live |
| `/api/user/active-plan/meals/log` | POST | Required | Confirm meal eaten → creates MealLog | ✅ Live |
| `/api/user/active-plan/meals/rate` | POST | Required | Rate meal 1-5 + note | ✅ Live — Jun 3 |
| `/api/user/active-plan/consistency` | GET | Required | This week's consistency score + breakdown (9R) | ✅ Live — Jun 4 |
| `/api/user/active-plan/pause` | POST | Required | Pause plan | ❌ |
| `/api/user/active-plan/skip` | POST | Required | Skip a date | ❌ |
| `/api/plans` | GET | Public | All active plans | ❌ |
| `/api/plans/[slug]` | GET | Public | Plan detail + full 30-day menu | ❌ |
| `/api/plans/[slug]/schedule` | GET | Public | Full 30-day schedule (public, no auth) | ✅ Live — May 30 |
| `/api/plans/[slug]/schedule/[day]` | GET | Public | Single day meals | ❌ |
| `/api/cron/generate-deliveries` | GET | CRON_SECRET | Nightly delivery list generator (Phase 10) | ✅ Live — Jun 4 |
| `/api/cron/snapshot-consistency` | GET | CRON_SECRET | Weekly consistency snapshot (Phase 11) | ✅ LIVE — Jun 5 (deployed, 401-guard verified, registered as Vercel cron #2) |
| `/api/admin/recipes` | GET + POST | Admin | Recipe list + create | ❌ |
| `/api/admin/recipes/[id]` | GET + PATCH + DELETE | Admin | Recipe CRUD | ❌ |
| `/api/admin/plans/[id]/schedule` | GET + POST | Admin | Schedule builder | ❌ |

---

## DECISIONS LOG (ALL PHASES)

| # | Topic | Decision |
|---|-------|----------|
| 1 | App vs Website | Website |
| 2 | Keep WordPress? | NO — full rebuild. WordPress backup for reference only |
| 3 | Tech Stack | Next.js + Node.js + PostgreSQL |
| 4 | Deployment | Vercel — subdomain during build → fitfuel.in |
| 5 | Migration | Soft launch on subdomain — active customers stay on WordPress until cutover |
| 6 | Auth | Google Sign-In — NextAuth.js v5. Phone OTP (MSG91) later |
| 7 | Payment | PayU (confirmed) + Cash on Delivery |
| 8 | Pricing | Fixed price lookup table from DB — not formula-based |
| 9 | Notifications | n8n self-hosted — WhatsApp Business API + Email (Phase 16) |
| 10 | Revenue streams | Meal delivery + Digital plans + Supplements (Premium) + AI Trainer (Luxury) |
| 11 | Admin ops | Solo (owner only) for now |
| 12 | Design | Dark athletic — black #080808, lime #84cc16/#a3e635, white #ffffff |
| 13 | FitDays / Body Metrics | Web Bluetooth API — in-browser BLE (Chrome) |
| 14 | Delivery Tracking | Driver PWA (smartphone) Phase 10 |
| 15 | Exercise content | GitHub exercise DB now → custom 3D videos Phase 8+ |
| 16 | Language | English only |
| 17 | Target city | Pune only (Kharadi base) — expand later |
| 18 | Guest checkout | Keep — post-order sign-in nudge on confirmation page |
| 19 | Nutrition water logging | Daily total one row per user per day, upserted |
| 20 | Nutrition food data | Per-100g storage + compute at log time |
| 21 | Supplement data | Static in lib/supplements-data.ts — no DB until ordering is live |
| 22 | Supplement ordering | Deferred — "Coming soon" until supplier confirmed |
| 23 | Recipe entry | Seed script (Phase 9C) + Recipe Admin UI (9M) |
| 24 | First plan to launch | weight-loss-veg — verified in DB, isActive: true |
| 25 | Schedule length | 30 days at launch. Disclosed as "30-day rotating menu" |
| 26 | Schedule no-repeat | Enforced at seed time — 8B + 10L + 5S + 7D unique per plan |
| 27 | servingMultiplier | WL=1.0x, MG=1.4x, Sports=1.6x |
| 28 | Jain mandates | Zero onion, garlic, root veg, mushroom, cauliflower |
| 29 | isActive strategy | false until BOTH recipe + schedule verified. Flip per plan |
| 30 | Medical plans | Nutritionist credentials + disclaimer required before any medical plan goes live |
| 31 | Seasonal plans | Same schema, toggled via isActive. First: Navratri Oct |
| 32 | FoodEntry mealLogId | Add in next migration — not blocking current work |
| 33 | Seed file generation | Claude chat commands — no API calls, no token burn |
| 34 | Cuisine strategy | 80% Indian regional, 20% Indian fusion — zero international |
| 35 | Sourcing constraint | Pune APMC only — no imported ingredients |
| 36 | FSSAI | License 21523035002815 in footer (check if already there) |
| 37 | Launch strategy | 1 plan live (WL-Veg), rest built in parallel |
| 38 | GitHub push | Not pushing until Phase 9 complete |
| 39 | Tier activation | Standard fully live. Premium + Luxury = waitlist until Phase 12 |
| 40 | Female Athlete appears twice | female-athlete (lifestyle #73-74) ≠ female-athlete-sports (sports #116-117) — different slugs |
| 42 | Exercise Library purpose | NOT standalone. It is the movement arm of each meal plan. Plan assigned → exercise program auto-assigned. Workout logged → feeds Net Calorie Engine. |
| 43 | **Menu visibility (REVISED May 27)** | **Full 30-day rotating menu is 100% public. Dish names, macros, meal slot, day number — all visible without account. Day 1 shows full recipe + ingredients. No blur. No auth wall. The menu is the sales material. What subscribers get is: the food delivered, the tracking system, the dashboard, the data loop. Sign-in wall is on the system, never the menu.** |
| 44 | Supplement Guide purpose | NOT static. Personalised by plan_category + health_condition. Standard = static guide. Premium = recommended stack. Luxury = AI-refined stack. |
| 45 | Body Metrics purpose | NOT standalone. Weekly weigh-in → weight trend → plateau detection → adaptive calorie recalibration → notifies user to adjust. |
| 46 | Consistency Score | 0-100 weekly score from meal logs + workouts + water + weigh-ins. Primary AI Trainer input signal. Not gamification — it is data. |
| 47 | Meal Swap | User can swap any meal for same-slot, ±100 kcal alternative. Swap data feeds Menu Evolution. |
| 48 | Menu Evolution | Meal ratings + swap data aggregate per recipe. Admin sees avg rating. < 3.0 avg after 20+ ratings → auto-flagged for replacement. Menu improves every 30 days. |
| 49 | TDEE Calculator | Public tool at /tools/tdee-calculator. Top-of-funnel SEO entry. Recommends plan → links to onboarding. Uses existing lib/tdee.ts. |
| 50 | Weekly Digest | Sunday WhatsApp via n8n: meals logged, workouts done, weight delta, best-rated dish, streak. Phase 16 delivery but schema designed now. |
| 51 | Plan Progression | System detects goal completion or 30-day end → suggests logical next plan. Not just renewal button — active health guidance. |
| 52 | Referral | referredBy on User. Refer friend → both get 1 free trial day. Simple. Schema field added in next migration. |
| 53 | Kitchen Production Dashboard | Admin view: tomorrow's portions per recipe × subscriber count. This is the franchise SOP. Phase 15 builds it on recipe + schedule data already in DB. |
| 54 | Phase 9 scope | Finish Phase 9 completely before touching any earlier phase. No regressions. |
| 55 | Morning Boost (coffee sachet) | Every delivery box includes 1 coffee sachet — ops packing note only, NOT a MealSlot in schema. Old site listed it as meal #5 — new site shows it as "Every box includes your Morning Boost." Cost: ~₹7.3/day, massive perceived value. |
| 56 | Morning Boost tier differentiation | Standard = Nescafé sachet. Premium = Bru Gold / Continental. Luxury = specialty pour-over sachet. Tier upgrade felt every morning when opening the box. |
| 57 | Morning Boost on medical plans | Diabetic / Thyroid / PCOS boxes get green tea sachet instead of coffee — caffeine flagged for these conditions. Ops decision, not system logic. |
| 58 | **DietType enum gap (NEW May 27)** | **JAIN and VEGAN missing from DietType enum. jain/vegan both map to VEGETARIAN — lossy. Plan assignment correct (dietToSlug() works). Profile stores wrong dietPreference. Fix: add JAIN + VEGAN to DietType in next migration. Non-blocking.** |
| 59 | **Onboarding → UserActivePlan (NEW May 27)** | **Onboarding creates UserActivePlan immediately on completion. NOT order-gated. User finishes onboarding → plan assigned → dashboard shows meals. Order is separate.** |
| 60 | **Dashboard active plan wiring (NEW May 27)** | **DashboardClient was hardcoded "No active plan yet". Fixed — page.tsx now fetches user_active_plans server-side and passes activePlan prop to client. Today's Meals card fetches /api/user/active-plan/meals/today on mount and renders 4 meals with "I ate this" buttons.** |
| 61 | **Schema field naming rule (NEW May 30)** | **ALWAYS read schema.prisma before writing any Prisma select block. Never guess field names. Applies to all files that query DB. Violating this caused 5 consecutive Vercel build failures on May 30 (targetCalories, proteinTarget, carbTarget, fatTarget, durationDays — all wrong).** |
| 62 | **Recipe field names (NEW May 30)** | **Recipe model uses British spelling: `fibreGrams` (not fiberGrams). Difficulty field is `difficulty` (not difficultyLevel). Both confirmed from schema.prisma. Use in all future recipe selects.** |
| 63 | **PlanDetailClient WhatsApp number** | **WhatsApp CTA link in PlanDetailClient.tsx uses placeholder 91XXXXXXXXXX. Must be replaced with actual business WhatsApp number before go-live.** |
| 64 (Phase 10) | Pricing model | HQ-fixed / absolute for launch. Franchise price-flexibility within HQ bands = future (Franchise phase). |
| 65 (Phase 10) | Delivery confirmation | **Physical signed slip** (driver carries printed slip, customer signs, driver marks Delivered). No digital OTP / customer tap-confirm for now. |
| 66 (Phase 10) | Delivery batching | **One delivery per customer per day** — all subscribed meals bundled into a single drop, never split into per-meal trips (sustainability). Customer chooses Morning OR Evening window at subscription. |
| 67 | **Checkout encoding fix (NEW Jun 5)** | **app/checkout/page.tsx had double-encoded mojibake frozen into source (₹ shown as "Â‚¹", middots as "Â·", em-dashes, emojis) — caused by a UTF-8 file being read as Windows-1252 and re-saved. Repaired via cp1252→utf-8 round-trip; rupee hardened to `\u20B9` in the fmt() JS string + `&#8377;` in JSX text. ROOT CAUSE = Windows editor saving as ANSI. Prevention: set VS Code files.encoding=utf8 + files.autoGuessEncoding=false, add .editorconfig charset=utf-8, avoid PowerShell `>` redirects (UTF-16/ANSI default). Audit other files with: grep -rP '[\x80-\xFF]' app/ lib/ components/** |
| 68 | **Consistency Score verified live (NEW Jun 5)** | **9R was built Jun 4 (lib/consistency-score.ts + /api/user/active-plan/consistency + DashboardClient card) but tracker still said Not started. Verified live Jun 5 — card renders 5-component score (~26 for Pranit). 9R = DONE. 9D "Today's Workout" card also verified live. Tracker corrected.** |
| 69 | **Phase 11 Progress page (NEW Jun 5)** | **Built /dashboard/progress — server page (lib/progress.ts aggregates weight/calorie/macro/adherence + reuses getWeeklyConsistency) + ProgressClient.tsx (inline-SVG charts in checkout token set). Calorie history = MealLog (plan meals eaten) + manual FoodEntry − WorkoutSession burn. Verified live Jun 5. Page not yet linked from dashboard (deferred to global rewire pass). All files esbuild-parse-checked before handoff.** |
| 70 | **Consistency trend = snapshot table (NEW Jun 5)** | **Week-over-week consistency trend was not possible (only current week persisted on UserProfile.weeklyConsistencyScore). Solution: ConsistencySnapshot model (one row/user/week, unique [userId, weekStart]) + weekly Vercel Cron /api/cron/snapshot-consistency (Sat 18:00 UTC = 23:30 IST, CRON_SECRET-protected). This is Vercel cron #2 (delivery is #1) — at Hobby's 2-cron limit. Trend line added to progress page once data accrues.** |
| 71 | **DB workflow = db push, NOT migrate dev (NEW Jun 5)** | **`prisma migrate dev` hit DRIFT — Phase 10's DeliveryWindow enum + deliveryWindow columns were applied via `db push` (no migration file), so migrate history ≠ actual DB. migrate dev wanted to RESET (wipe orders, active plan, metrics, logs). REFUSED. Resolved with `npx prisma db push` — adds the new consistency_snapshots table only, no reset, no data loss. STANDING RULE: this project uses `prisma db push` for all schema changes (NEVER `migrate dev` — it threatens data via reset on drift). Squash into one clean baseline migration only right before fitfuel.in launch. Always read schema.prisma before any select (reaffirms #61/#65).** |
| 72 | **PayU order flow completed (NEW Jun 5)** | **PayU success route was a TODO stub — online payments created NO order/plan (customer paid, got nothing). Rebuilt with the pending-order pattern: init route (`app/api/payments/payu/route.ts`) creates a PENDING_PAYMENT order keyed by txnid with diet/dur/meal/deliveryWindow stashed in order.notes; success route (`/success/route.ts`) verifies hash, finds order by txnid, flips to CONFIRMED + SUCCESS, creates UserActivePlan (window from notes). Idempotent (PayU can hit surl twice). Hash formula unchanged (udf empty). Checkout handlePayU now sends full details. Verified live ₹1 order Jun 5. Abandoned attempts leave PENDING_PAYMENT orders (clean up later). Both COD + PayU now attach to weight-loss-veg (was arbitrary findFirst()). HARDENING TODO: compute price server-side from PlanPrice (currently trusts client price/amount).** |
| 73 | **Phone-collision-safe upsert (NEW Jun 5)** | **User.phone is @unique. Both order routes did findFirst(email) → update phone, which threw P2002 when that phone already belonged to a different user row. Fixed with upsertCustomer(): find by email then phone; only set phone if free or already that user's; on create, attach phone only if free. Applied to both cod/route.ts and payu/route.ts.** |
| 74 | **Recipe seeds do NOT gate Phase 12 (NEW Jun 5)** | **The AI Trainer coaches on LOGGED behaviour (MealLog, WorkoutSession, BodyMetric, ConsistencySnapshot) — all present regardless of seed count. Only weight-loss-veg is isActive and only 1 user is subscribed, so the meal content the AI needs for actual users is already seeded. 1/119 limits what the AI can say about OTHER plans' menus, but nobody is on those plans. Build Phase 12 now; recipe seeding stays a PARALLEL commercial/catalogue track, never a Phase 12 blocker.** |
| 75 | **Phase 12 = unified AI assistant, two tier-scoped layers (NEW Jun 5)** | **Do NOT build two bots. ONE conversational surface on the Phase 12 infrastructure. (a) SUPPORT layer — ALL subscribers (Standard+): order status, delivery ETA, pause/skip, address, billing Qs. Bounded + read-mostly; sensitive actions (refunds/billing changes) escalate to owner, never autonomous. Huge solo-founder win — absorbs routine support. (b) COACH layer — Luxury only: full data context + coaching depth + proactive nudges + recalibration. Same models + tool plumbing; system-prompt scope and tool access differ by tier. Captured as sub-phase 12-SUPPORT in the Phase 12 scope doc.** |
| 76 | **Phase 12 positioning — own the plate, don't out-AI Healthify (NEW Jun 5)** | **Verified Jun 5 landscape: Healthify/Ria Voice (OpenAI Realtime, 50+ languages, 40M users, profitable, US expansion, Novo Nordisk GLP-1) + giants (ChatGPT Health, Copilot Health, Perplexity Health, Amazon Health AI, Apple Health+, Google Fitbit Air + Gemini, Whoop $10.1B). The whole field reads data and ADVISES; the differentiation is "what happens next." NONE of them cook + deliver the food. FitFuel's moat: the ONLY AI coach that controls what lands on the plate — verified intake, not self-reported. Do NOT position as "a better Ria." Moat is operational + hyperlocal (owned Pune kitchen), not model sophistication. 12-SAFE (medical + disordered-eating guardrails) is also a differentiator AND a liability shield — some competitor apps were flagged by researchers for reinforcing unhealthy behaviour.** |
| 77 | **Zomato/Swiggy = Phase 21, post-launch growth channel, NOT core (NEW Jun 5)** | **Aggregator listing BREAKS the data loop (anonymous customer, no onboarding/body data/UserActivePlan, ~20–30% commission, platform owns the relationship). It is a commodity food sale — the opposite of the health-OS thesis. Therefore: layered on AFTER the owned platform launches (Phase 20), used purely for kitchen-fill + cold-traffic acquisition. The ONLY reason to do it = the conversion mechanic: every aggregator box ships a QR card → free TDEE (9T) → onboarding → owned, tracked subscriber. Measure by conversion rate, not aggregator GMV. Light integration (curated à-la-carte menu, order ingestion into Phase 15 kitchen dashboard), not deep platform work.** |
| 78 | **AI Trainer monetises across ALL channels (NEW Jun 5)** | **The AI Trainer is NOT a delivery-only feature — it is the stickiness layer for every channel. A digital-plan customer (Phase 13, cooks themselves, no delivery, anywhere in India) still logs meals/workouts/weight → coachable by the AI. An aggregator-acquired customer who converts enters the same loop. This is the argument for building Phase 12 BEFORE scaling distribution: it makes delivery subs, digital plans, and converted aggregator customers all monetisable and sticky.** |
| 79 | **PWA-first; Expo native DEFERRED (NEW Jun 5)** | **Phase 12 v1 ships web-only. ~85% of the AI-trainer surface is web-buildable; the ~15% needing native = passive wearable sync (Apple HealthKit, Google Fit background sync, Garmin/Whoop SDKs — Apple blocks HealthKit from any browser, hard policy wall). Native (Expo) enters the roadmap only on real Luxury wearable demand (target trigger ~200 Luxury users or explicit at-scale requests). Full webapp/PWA redesign is a post-build pass (owner's call — not mid-phase).** |
| 80 | **Phase 12 finalised = tight v1 + captured backlog. Capture ≠ commit (NEW Jun 5)** | **The full AI-trainer universe (food vision, sleep, mood, memory, multilingual, cycle, bloodwork, retention, import, voice, community…) is CAPTURED in the scope doc so nothing is forgotten — but only a tight v1 is committed: 12A + 12-SAFE + 12B + 12-SUPPORT + 12C + 12D + 12E + 12-WORKOUT-MODE + 12H + 12I, on data already in the system. Rest sequenced v2/v3/v4. Locking 25 sub-phases before coding = never shipping.** |
| 81 | **AI medical boundary — HARD LINE (NEW Jun 5)** | **The AI is a coach, not a clinician. For condition users and blood-report data it SURFACES + CONTEXTUALISES only — never diagnoses, prescribes, titrates meds, or alters medical management. Medical questions route to the Luxury nutritionist consult. Reinforces #30.** |
| 82 | **Body-image guardrail — HARD LINE (NEW Jun 5)** | **No AI body-fat % verdicts from progress photos (inaccurate + harmful). Photos = storage + side-by-side comparison only. AI never endorses sub-floor calorie targets or restriction; suggestRecalibration can never propose below a configurable safe floor. Governed by 12-SAFE disordered-eating guards.** |
| 83 | **Proactive ≠ manipulative (NEW Jun 5)** | **Mood / churn intelligence is for genuine care and value-based retention, NOT engagement dark-patterns. Sustained low mood / distress routes toward a human + supportive resources — never exploited as a re-engagement hook.** |
| 84 | **Reassignments out of Phase 12 (NEW Jun 5)** | **Exercise form-video library → Phase 7 (content; AI just links to it). Data export / DPDP Act / privacy / right-to-delete → Phase 20 launch compliance pass (audit trail of AI recs stays in 12-SAFE). Community / accountability / challenges → NEW Phase 22 (Social & Community). Keeps Phase 12 shippable.** |
| 85 | **Phase 12 build PARKED (NEW Jun 5)** | **Scope finalised + fully captured; build intentionally DEFERRED until the data loop is fuller (more users, more logged meals/workouts/weight, v2-class surfaces) and the later phases ship. Rationale: AI quality is bounded by data depth (1 user, sparse logs today), the field moves monthly (build against newer/cheaper models later), and operational + revenue phases come first. Keep §8 forward-compatible hooks (receiving-API pattern, app-shell nav) in mind during intervening phases so the eventual build is a slot-in, not a retrofit. Re-confirm the v1 cut at build time. In-session workout mode pulled into v1 as the "best version" (Decision #80).** |
| 86 | **Digital plan = a PlanPrice row, not a new product (NEW Jun 6)** | **No `Product` table. A digital SKU is a `PlanPrice` row with `isDigital = true` on the existing weight-loss-veg `MealPlan`, reusing `Order`/`OrderItem`/`Payment`. Fulfilment is a property of the price/active-plan (`isDigital`), NOT the plan type — the nightly delivery cron filters `isDigital: false` so digital buyers never generate phantom deliveries. `PlanCategory.DIGITAL` is now redundant.** |
| 87 | **Digital tiers via a `bundle` dimension; Pro adds a REAL workout, not vapor (NEW Jun 6)** | **`DigitalBundle` enum (STARTER/PRO) on `PlanPrice` + `UserActivePlan`; unique key extended to `[mealPlanId, duration, mealsPerDay, bundle]`. Starter ₹299 = meal-plan PDF. Pro ₹699 = meals + a real 30-day training plan sourced from `ExerciseSchedule`/`ExerciseScheduleDay`. AI coach is EXCLUDED from Pro until Phase 12 actually ships — never list a feature that isn't built.** |
| 88 | **Digital PDFs are rendered on-the-fly, not stored (NEW Jun 6)** | **`renderToBuffer` → streamed `Response` (inline); nothing is saved server-side — the customer's own download is the only persisted copy. Browser caches 1h. Re-rendering a ~90-page doc per request is wasteful: **Vercel Blob caching keyed by slug+bundle (regenerate only on recipe/schedule change) is the perf TODO before scaling traffic.**** |
| 89 | **Digital PayU mirrors the physical guest flow (NEW Jun 6)** | **Guest checkout (no session required), empty-UDF hash preserved both ways, plan/bundle/coupon params carried in `order.notes` JSON keyed by `payuTxnId`. Success route branches on `notes.isDigital` → `activateDigitalPlan` (idempotent). No address, no delivery window — online-pay only.** |
| 90 | **Phase 14 content is DB-backed, not hardcoded/MDX (NEW Jun 8)** | **Blog, FAQ and testimonials are Prisma models (`BlogPost` / `Faq` / `Testimonial`), standalone (no relations to existing models — schema add was non-breaking). Rationale: consistent with the stack thesis and editable by the Phase 15 Admin Panel without redeploys; testimonials become real customer results over time (moat). Pages are `force-dynamic` so there are NO build-time DB calls on Vercel. No new API routes — server components read Prisma directly. Activation = `prisma db push` (NOT migrate dev, Decision #71) + `npx tsx prisma/seed-phase14.ts`; `db push` does NOT auto-generate the client under Prisma 7 + prisma.config.ts, so `prisma generate` must run before the seed.** |
| 91 | **Blog body = owner-authored HTML; FAQ = zero-JS native accordion (NEW Jun 8)** | **Blog `contentHtml` is rendered via `dangerouslySetInnerHTML` inside a scoped `.ff-prose` block — the natural output target for a Phase 15 rich-text admin, and safe because only the owner authors it (no third-party input). FAQ uses native `<details>/<summary>` (no client JS, accessible) + FAQPage schema.org JSON-LD for rich snippets; blog articles emit BlogPosting JSON-LD. All four DB-reading pages built in the clean server content-page idiom (matches FAQ/legal), NOT the animated client idiom (home/about).** |
| 92 | **Homepage testimonials left hardcoded — fast-follow (NEW Jun 8)** | **The homepage testimonials array stays as-is for now. Rewiring it to pull `isFeatured` rows from the `testimonials` table means converting that `"use client"` section to fetch server-side — deferred to avoid touching the working homepage mid-phase. The `isFeatured` flag already marks the 3 homepage candidates, so the rewire is a slot-in when done. Footer Reviews link points at the new `/testimonials` page.** |
| 90 | **PDF design self-contained; owner/admin can preview (NEW Jun 6)** | **The PDF uses the built-in Helvetica family (no remote fonts) so generation can never fail on a font fetch in production; brand fonts (Syne/DM Sans) deferred. Design carried by colour/scale/layout + dark brand pages. OWNER/ADMIN bypass the ownership gate to preview any digital PDF (testing + customer support) — they get the full Pro document.** |
| 91 | **Workout match by subCategory, not the enum (NEW Jun 6)** | **`getWorkoutPlanData` matches `ExerciseSchedule.mealPlanCategory` against the plan's `subCategory` (`"weight_loss"`), NOT the `PlanCategory` enum (`STANDARD`). The earlier route passed the enum, so the workout always came back null and Pro shipped no training section. Exercise names are stored inline in the schedule JSON so the section renders regardless of `Exercise` table contents.** |
| 92 | **Checkout capture persists to UserProfile, not via PDF overrides (NEW Jun 6)** | **Digital checkout now collects OPTIONAL body stats (height/weight/goal/age) and carries them in `order.notes.profile`. On payment success `activateDigitalPlan` upserts them onto `UserProfile` (keyed by `userId @unique`) — NOT threaded as PDF overrides. Rationale: the personalisation engine already reads `UserProfile`, so persisting there both seeds the buyer's dashboard AND feeds the PDF on download — one write, two surfaces, no parallel plumbing. Only provided fields are written (never clobbers existing values with blanks); server-side range validation (height 100–250, weight 20–300, age 10–100) drops garbage; the profile write is wrapped in try/catch so it can never fail an activation the customer already paid for. Guest→login seam holds: stats attach to the same `userId` the order resolved, so signing in with that email surfaces them. Hash/empty-UDF flow untouched; no schema change (fields already on `UserProfile`).** |
| 93 | **PDF is personalised + full-dark, infographics are react-pdf vectors (NEW Jun 6)** | **The digital PDF interior was flipped to full dark (`#0a0a0a` + lime) and gained a personalised "Your Numbers" page driven by `lib/personalization.ts` (UserProfile + latest BodyMetric/scale data → BMI, daily deficit vs TDEE, weight projection). "Advanced infographics" = react-pdf vector SVG primitives (macro ring, BMI scale, deficit bars, projection line), NOT true 3D — 3D would mean pre-rendering images server-side (heavy/fragile), not worth it for a tripwire product. Macro ring drawn with `Path` arcs because `strokeDashoffset` isn't typed on react-pdf's `Circle`. Honest tradeoff logged: a full-dark PDF is heavy on a customer's printer — accepted because this is a screen-read digital product. No body data → graceful fallback to plan targets + dashboard prompt. Brand fonts (Syne/DM Sans) still deferred (Helvetica), as remote-font fetch can fail generation.** |

---

## PENDING INPUTS

| # | What | Phase | Status |
|---|------|-------|--------|
| 1 | MSG91 or Twilio account | 4 | Pending |
| 2 | FitDays scale model number | 5 | Pending — UI built, need hardware |
| 3 | WhatsApp Business API / Meta Business account | 16 | Pending |
| 4 | Hostinger VPS vs shared (for n8n) | 16 | Pending |
| 5 | Supplement supplier / source | 9+ | Pending |
| 6 | Wellness partner tie-ups (massage/spa) | 12+ | Pending |
| 7 | Nutritionist name + credentials | 9F | Pending — required before medical plans go live |
| 8 | Zomato + Swiggy merchant/restaurant partner accounts | 21 | Pending — needed before aggregator channel build (FSSAI 21523035002815 already in hand) |

---

## 9P — MEAL SWAP REQUEST SYSTEM

### What It Is
User doesn't want today's assigned meal. They can request a swap. The system shows all recipes in their plan with the same meal slot (LUNCH) and similar calories (±100 kcal). They pick one. The swap is logged. Admin sees swap frequency per recipe — high swap rate on a recipe = low preference signal, feeds into Menu Evolution (9S).

### Flow
```
User: "I don't want today's Palak Paneer"
  ↓
System: Shows 3 alternative lunches from same plan, same day range, ±100 kcal
  ↓
User picks: "Give me Rajma instead"
  ↓
MealLog created with swappedFrom: originalRecipeId, swappedTo: newRecipeId
  ↓
Admin sees: "Palak Paneer has been swapped away 47 times this month"
```

### DB: MealLog already has fields to support this. Add swapCount to Recipe model in next migration.

---

## 9Q — SMART WEEKLY GROCERY LIST

### What It Is
Every Monday, subscriber sees: "Here's what's in your meals this week — want to cook along on weekends?" Pulls Day N to Day N+6 from their plan schedule, aggregates all recipe_ingredients, formats as grouped shopping list (Vegetables / Proteins / Grains / Dairy / Spices). Zero extra DB work. Pure query on existing data.

### Access: Standard tier and above.

### Output Example
```
Your Week 3 Ingredients (if cooking yourself):
Vegetables: Spinach 400g · Tomato 300g · Onion 200g
Proteins: Paneer 250g · Moong Dal 300g · Chickpeas 200g
Grains: Basmati Rice 400g · Roti flour 500g
Dairy: Curd 400g · Ghee 50g
```

---

## 9R — CONSISTENCY SCORE ENGINE ✅ COMPLETE — Jun 4 (verified live Jun 5)

### What It Is
A single 0-100 score per user per week, shown on dashboard. Not a gamification gimmick — it is the primary input signal for the AI Trainer in Phase 12. High consistency (80+) means the AI can make bold recommendations. Low consistency (< 50) means the AI asks what's blocking the user, not push harder.

### Score Calculation (weekly, resets Sunday)
```
Meals logged / meals delivered × 40 pts    (max 40)
Workouts completed / workouts scheduled × 30 pts  (max 30)
Water logs entered × 2 pts                (max 10)
Weekly weigh-in done × 10 pts             (max 10)
Zero skipped days × 10 pts                (max 10)
                                   TOTAL: 100
```

### Dashboard Display
```
Consistency Score: 78 / 100  ████████░░  Good
"You logged 21/28 meals and 4/5 workouts this week."
```

### DB: Compute weekly from existing tables. No new schema needed. Cache in UserProfile.weeklyConsistencyScore (add in next migration).

### Files Built — Jun 4 ✅
```
lib/consistency-score.ts                          ← weekly compute, caches UserProfile.weeklyConsistencyScore
app/api/user/active-plan/consistency/route.ts     ← GET this week's breakdown
app/dashboard/DashboardClient.tsx                 ← ConsistencyCard added (score bar + 5 components + "X/Y meals" line)
```

### Return shape (getWeeklyConsistency)
```
{ score, label, weekStart,
  meals:   { logged, delivered, points, max:40 },
  workouts:{ completed, scheduled, points, max:30 },
  water:   { days, points, max:10 },
  weighIn: { done, points, max:10 },
  noSkips: { skipped, points, max:10 } }
```

### Verified Jun 5
- Dashboard card renders score (~26 for Pranit), label "Needs work", colored bar, "You logged 4/20 meals and 1/4 workouts this week."
- Score reflects all 5 components even though the dashboard text line only surfaces meals + workouts (by design).

---

## 9S — MEAL FEEDBACK → MENU EVOLUTION

### What It Is
Every "I ate this" tap asks: "Rate this meal" (1-5 stars, optional note). This data accumulates. Admin dashboard shows per-recipe avg rating, total ratings, swap-away count. Recipes below 3.0 avg after 20+ ratings get auto-flagged: "Consider replacing." Admin can then use the recipe admin (9M) to swap that slot in the schedule. The menu gets smarter every 30 days. This is the living menu system.

### Admin View (in 9M Recipe Admin, add a Ratings tab)
```
Recipe Performance:
Rajma Masala         ★4.7  (243 ratings)  🟢 Keep
Palak Paneer         ★4.1  (189 ratings)  🟢 Keep
Methi Thepla         ★2.8  (67 ratings)   🔴 FLAG — consider replacement
```

---

## 9T — PUBLIC TDEE CALCULATOR

### Route: `/tools/tdee-calculator`
### Access: Fully public. No account needed.

### What It Is
Standalone tool. User enters age, gender, weight, height, activity level. Gets: BMR, TDEE, calorie target by goal, macro breakdown, "weeks to goal" estimate, recommended FitFuel plan. Big "Start your plan →" CTA.

### Why It Matters
This is the top-of-funnel entry point. Someone Googling "how many calories should I eat to lose weight" lands here. They get real value. They see their recommended plan. They click "Start your plan." They're in the onboarding flow. It converts cold traffic into subscribers.

### Uses: `lib/tdee.ts` already built in 9B. This is a UI over existing logic. Zero new backend work.

---

## PHASE 10 — LIVE DELIVERY TRACKING

> **Status: CORE COMPLETE & LIVE (June 4, 2026).** Built the full delivery ops layer that Phase 9's `UserActivePlan` made possible. 3 items pending (listed at the end).

### What It Is
The operational layer that turns active subscriptions into a daily delivery run. A nightly engine reads every active plan and writes that day's delivery list; an admin command center assigns and dispatches; drivers complete stops from a phone link; COD is tracked per driver. This is the bridge between "subscription in DB" and "food at the door."

### What Was Built (deployed to main — live on fitfuel-eosin.vercel.app)

**Admin command center — `/admin`** (gated to OWNER/ADMIN via Auth.js v5 `auth()`, role read fresh from DB each request)
- **Dispatch board:** today's deliveries grouped into **Morning run (7-9 AM)** and **Evening run (6-8 PM)**; assign driver per delivery → Dispatch (→ OUT_FOR_DELIVERY) → live status flips back as drivers complete; per-driver COD-expected strip; "Dispatch all assigned".
- **Driver roster `/admin/drivers`:** create driver (name + phone) → auto-generated unique token link; Copy link / Send-on-WhatsApp; activate/deactivate; today's stop count.

**Driver app — `/driver/[token]`** (token IS the auth, no login)
- "Hi {driver}, N stops today"; each stop shows customer, address, meals, tap-to-call, COD; Delivered / Couldn't-deliver buttons; status flows back to the board.

**Delivery generator — `/api/cron/generate-deliveries`** (Vercel Cron `30 17 * * *` = 11 PM IST)
- Reads every active `UserActivePlan` covering the next day (status active, in date range, not in skipDates).
- Creates ONE delivery per customer per day — all meals bundled, never split — stamped with their window. Idempotent. Protected by `CRON_SECRET`.

**COD order route — `/api/orders/cod`**
- Now auto-creates a `UserActivePlan` on every new order. This was THE missing link: orders existed (10 in DB) but never fed the generator. Backfilled `UserActivePlan` for all 10 existing COD orders.

**Storefront chrome hidden on `/admin`** via ChromeGate (`BARE_PREFIXES += "/admin"`).

### Schema additions
```
enum DeliveryWindow { MORNING EVENING }
UserActivePlan.deliveryWindow  DeliveryWindow @default(MORNING)
Delivery.deliveryWindow        DeliveryWindow?
```
`Driver.franchiseId` was already reserved in schema — no churn needed when the Franchise phase lands.

### Decisions logged
- **Decision #62 (Jun 4):** Pricing HQ-fixed / absolute for launch. Franchise price-flexibility within HQ bands = future (Franchise phase).
- **Decision #63 (Jun 4):** Delivery confirmation = **physical signed slip** (driver carries printed slip, customer signs, driver marks Delivered). No digital OTP / customer tap-confirm for now.
- **Decision #64 (Jun 4):** **One delivery per customer per day** — all subscribed meals bundled into a single drop, never split into per-meal trips (sustainability). Customer chooses Morning OR Evening window at subscription.

### Connects to (the data loop)
- `UserActivePlan` (Phase 9) → generator → daily `Delivery` rows → dispatch board.
- `mealsPerDay` (Phase 9) → which meals are bundled in the drop.
- Order / Address / User → delivery card (customer, address, phone, COD).
- `Driver.franchiseId` → future Franchise phase (outlet-scoped dispatch board).

### Env / infra added
- `CRON_SECRET` (Vercel + .env.local) · `vercel.json` cron entry.
- One-time helper scripts in `/prisma` (backfill-plans, check-*) — safe to delete.

### PENDING (to fully close Phase 10)
1. **Checkout window toggle — ✅ CLOSED Jun 5.** Toggle wired into checkout; window now persists to UserActivePlan for BOTH COD and PayU. Verified live via a real ₹1 PayU order (FF-PAYU-20260605-5719) → order CONFIRMED + UserActivePlan created with EVENING window. NOTE: order/confirmation page still shows hardcoded "7am–10am" text regardless of chosen window — cosmetic, fix in global rewire. See Decisions #72–73.
   > **Jun 5 update:** `DeliveryWindowToggle` IS now rendered in checkout (Morning/Evening selectable on the live checkout page — confirmed in screenshot). Verify the selected window persists through both COD and PayU order creation, then mark this item closed.
2. **Printable signed delivery slip** — the chosen proof mechanism (Decision #63). **Will be DESIGNED in Claude Design** (not hand-coded), then wired to print today's run per driver with customer name / address / meals / COD amount / signature line. [Jun 4]
3. **Driver notification on dispatch** — auto WhatsApp/SMS via MSG91 on dispatch; NOT wired (links shared manually for now). Overlaps Phase 16.

---

## PHASE 11 — PROGRESS TRACKING + CHARTS + CONSISTENCY SCORE

> **Status: CORE LIVE (June 5, 2026).** Consistency Score (9R) was already done (Jun 4). Phase 11 added the visualisation layer: a dedicated progress page turning the data loop into a transformation story the user can see over time. One piece (week-over-week consistency trend) is a fast-follow that needs the snapshot table to accrue data.

### What It Is
`/dashboard/progress` — "The Transformation" page. Reads everything the user has logged and renders it as charts, server-side, in one pass. No new schema for the core page; all field names verified against schema.prisma (Decision #61 honoured — built against the real schema, not guessed).

### What Was Built (Jun 5 — verified live)
```
lib/progress.ts                              ← server data aggregation (one getProgressData(userId) call)
app/dashboard/progress/page.tsx              ← server component, auth guard, force-dynamic
app/dashboard/progress/ProgressClient.tsx    ← inline-SVG charts, checkout token set, Syne/DM Sans
```

### Charts / sections on the page
1. **Top stat tiles** — weight change (kg), avg net kcal/day, workouts done, current streak.
2. **Weight trend** — line chart from BodyMetric (measuredAt, weightKg) + target line (UserProfile.targetWeightKg) + toggle for body fat / muscle. Empty-state if < 2 weigh-ins.
3. **Daily net calories** — bar chart, 30-day window, target dashed line. Green = at/under target, orange = over.
4. **Macro adherence** — avg protein/carbs/fat per tracked day vs target (UserActivePlan targets → mealPlan averages fallback).
5. **Consistency this week** — reuses getWeeklyConsistency (9R); renders score + all 5 component bars.
6. **Adherence summary** — meals eaten / scheduled, workouts completed, logging streak, active days.

### Data definitions (documented to avoid surprises)
- **Calorie IN** = confirmed MealLog calories (recipe.caloriesPerServing scaled by actualGrams/plannedGrams ÷ servingSizeGrams) + manual FoodEntry calories (mealLogId null).
- **Calorie OUT** = WorkoutSession.caloriesBurned (completedAt not null).
- **Target** = UserActivePlan.calorieTarget → mealPlan.avgCaloriesPerDay → UserProfile.calorieTarget → tdee → 2000.
- ⚠️ This may read HIGHER than the dashboard calorie ring, which likely counts only FoodEntry. Root: tapping "I ate this" does NOT write a FoodEntry (the MealLog→FoodEntry gap, Decision #32). Close that gap to unify both surfaces.

### Verified Jun 5
- Page renders live at `/dashboard/progress`: header, 4 stat tiles, weight trend curve (test data: 136.9 → 91.64 → flat, reading real BodyMetric rows), consistency card matching dashboard (~26).
- All 4 files esbuild-parse-checked before handoff (catches the JSX/apostrophe class that caused May 30 failures).

### Consistency TREND (fast-follow — needs schema)
Only the CURRENT week's score is persisted (UserProfile.weeklyConsistencyScore). A real week-over-week line needs history. Solution built Jun 5:
```
model ConsistencySnapshot {            ← one row per user per week
  id, userId, weekStart @db.Date, score, label,
  mealsPoints, workoutsPoints, waterPoints, weighInPoints, noSkipPoints,
  createdAt
  @@unique([userId, weekStart])
}
+ User.consistencySnapshots relation
app/api/cron/snapshot-consistency/route.ts   ← weekly Vercel Cron (Sat 18:00 UTC = 23:30 IST), CRON_SECRET
vercel.json cron entry: { "path": "/api/cron/snapshot-consistency", "schedule": "0 18 * * 6" }
```
Migration: `npx prisma migrate dev --name phase11_consistency_snapshot`. This is Vercel cron #2 (delivery is #1) — at Hobby's 2-cron limit. Trend line added to the progress page once snapshots accrue (first run = next Saturday).

> **Jun 5 DEPLOYED:** `migrate dev` hit DRIFT (DeliveryWindow enum + deliveryWindow columns existed in DB but not in migration history — applied via db push in Phase 10). `migrate dev` wanted to RESET (wipe all data) — refused. Resolved safely with `npx prisma db push` instead: created `consistency_snapshots` table, no data loss, no reset. Cron route + vercel.json pushed; endpoint returns 401 on unauth (guard verified live). consistency_snapshots table confirmed in DB. See Decision #71.

### Not yet done (Phase 11)
- Link to `/dashboard/progress` from the dashboard (deferred — part of the planned global nav rewire pass).
- Consistency trend line on the page (waiting on snapshot data).
- Body-composition (body fat / muscle) dedicated series view beyond the toggle.

---

## PHASE 12 — AI PERSONAL TRAINER + CUSTOMER-SERVICE ASSISTANT (UNIFIED)

> **Status: ⏸️ PARKED Jun 5, 2026 — scope FINALIZED, build DEFERRED (Decision #85). Full detail in companion doc FITFUEL-PHASE-12-AI-TRAINER-SCOPE.md (now the FINALIZED version: full universe captured + tight v1 committed). Build the data-generating later phases first; un-park Phase 12 when the data loop is fuller and against newer/cheaper models. This section is the tracker-level summary; the scope doc is authoritative.**

> **Finalised v1 cut (when un-parked):** 12A Context Engine + 12-SAFE + 12B Chat + 12-SUPPORT + 12C memory + 12D tools + 12E proactive + **12-WORKOUT-MODE (in-session screen — pulled into v1 as "best version")** + 12H cost + 12I evals. Runs web-only on data already in the system (+ a small set/RPE schema for workout mode). Everything else (food-vision, sleep, mood, long-term memory, Hinglish/Marathi, cycle, bloodwork, retention, wearable import, voice) is captured + sequenced v2/v3/v4. Three hard safety lines: medical boundary, body-image guardrail, proactive-≠-manipulative (Decisions #81–#83).

### What It Is
The conversational front-end to the entire FitFuel health OS. ONE assistant, two tier-scoped layers (Decision #75):
- **SUPPORT layer (all subscribers, Standard+):** order status, delivery ETA, pause/skip, address, billing questions. Bounded + read-mostly; sensitive actions escalate to owner. Absorbs routine solo-founder support load.
- **COACH layer (Luxury):** full data context + coaching depth + proactive nudges + recalibration. The headline Luxury entitlement (flips Premium/Luxury waitlist live — Decision #39).

It is NOT a chatbot — it knows everything the user logged (meals, workouts, weight, consistency), it can take actions (log a meal, request a swap, draft a recalibration), and it remembers the user across sessions.

### Why It's Unblocked Now
All four signals are live: MealLog, WorkoutSession, BodyMetric, ConsistencySnapshot + UserProfile.weeklyConsistencyScore. Recipe seeds (1/119) do NOT gate it (Decision #74).

### Positioning (Decision #76)
The moat is NOT "a better Ria." Healthify/Ria + the giants (ChatGPT Health, Apple Health+, Google/Fitbit, Whoop) all READ data and advise. NONE cook + deliver the food. FitFuel is the only AI coach that controls the plate — verified intake, not self-reported. Moat = operational + hyperlocal, not model sophistication.

### Sub-Phases (full detail in scope doc)
| Sub | Name | Priority |
|-----|------|----------|
| 12A | Context Engine + Trainer Brief (the foundation) | P0 |
| 12-SAFE | Persona & Safety Layer (medical + disordered-eating guards) — ships WITH 12B | P0 |
| 12B | Reactive Chat (MVP shippable moat) — streaming, persisted, Luxury gate | P0 |
| 12-SUPPORT | Support layer for all subscribers (order/delivery/account, bounded) | P0/P1 |
| 12C | Conversation persistence + memory wiring | P0 |
| 12D | Tool use / actions (logMeal, requestSwap, suggestRecalibration…) | P1 |
| 12E | Proactive engine (plateau, missed workouts, milestones → coach messages) | P1 |
| 12F | Durable memory / insight extraction ("knows you") | P2 |
| 12G | WhatsApp surface (overlaps Phase 16) | P2 |
| 12H | Cost & usage controls (prompt caching, two-model split, rate limits) | P1 |
| 12I | Eval harness (golden + safety red-team set) | P1 |
| 12J | Admin / quality dashboard | P2 |
| 12K | Premium "AI Insights" lite feed (IF approved — Open Decision) | P3 |

### Proposed Schema (via db push — Decision #71; verify schema.prisma first — #61)
AiConversation, AiMessage (+ AiRole enum), TrainerInsight, TrainerEvent, AiUsageLog. Detail in scope doc.

### Cross-channel note (Decision #78)
The AI Trainer monetises delivery subs, digital plans (Phase 13), AND converted aggregator customers (Phase 21) — it is the stickiness layer for every channel, not a delivery-only feature.

---

## PHASE 13 — DIGITAL MEAL PLANS (PDF / DOWNLOADABLE) ✅ CORE LIVE — Jun 6, 2026

### What It Is
The 30-day plan sold as a downloadable PDF the customer **cooks themselves** — no delivery, national reach beyond Pune. A low-ticket **tripwire** that pulls customers into the logging loop and is monetisable later by the Phase 12 AI Trainer (Decision #78). Two value tiers: **Starter ₹299** (meal plan PDF) and **Pro ₹699** (meal plan **+ a real training plan baked into the same PDF**). AI coach deliberately **excluded** until Phase 12 ships — no vapor (Decision #87).

### Core Architecture Decisions (Jun 6)
- **No new `Product` table.** A digital SKU is a `PlanPrice` row (`isDigital = true`) on the existing `weight-loss-veg` `MealPlan`. Reuses `MealPlan` + `PlanPrice` + `Order`/`OrderItem`/`Payment`. (Decision #86)
- **Digital ≠ a separate plan.** Fulfilment is a property of the price / active-plan (`isDigital`), not the plan type. The nightly delivery cron filters `isDigital: false` so digital buyers never spawn phantom deliveries. (Decision #86)
- **Tier = a `bundle` dimension.** `DigitalBundle` enum (STARTER / PRO) on `PlanPrice` **and** `UserActivePlan`; `PlanPrice` unique key extended to `[mealPlanId, duration, mealsPerDay, bundle]`. Pro = meals + workout (from `ExerciseSchedule`/`ExerciseScheduleDay`). (Decision #87)
- **PDF is rendered on-the-fly and streamed** (`renderToBuffer` → `Response`, `Content-Disposition: inline`). **Nothing is stored server-side** — the customer's own download is the only saved copy. Browser caches 1h (`Cache-Control: private, max-age=3600`). **Vercel Blob caching keyed by slug+bundle = the perf TODO** before pushing traffic (re-rendering a 90-page doc per request is wasteful). (Decision #88)
- **Digital PayU = guest checkout, empty-UDF hash preserved.** Plan/bundle params carried in `order.notes` JSON keyed by `payuTxnId` (mirrors the physical flow). Success route branches on `notes.isDigital` → `activateDigitalPlan` (idempotent). (Decision #89)
- **PDF design is self-contained** (built-in Helvetica family, no remote fonts) so generation can never fail on a font fetch; brand fonts (Syne/DM Sans) deferred. **OWNER/ADMIN can preview any digital PDF** (testing + support). (Decision #90)
- **Workout matched by `subCategory`** (`"weight_loss"`), NOT the `PlanCategory` enum (`STANDARD`) — an earlier bug passed the enum and always returned a null workout. (Decision #91)

### GST / Commerce
- Digital = **18% GST-inclusive**, SAC ~9983 (confirm with CA). Physical food stays 5% no-ITC. `taxRatePercent` is per-row config, never hardcoded.
- Coupons apply **pre-tax** (Section 15, CGST Act); GST charged on post-coupon value.
- Place-of-supply: intra-state CGST+SGST, inter-state IGST (digital ships nationally). Money in whole rupees (Int).
- Full strategy: `FITFUEL-PRICING-PROMOTIONS-STRATEGY.md` (D-PRICE-1..7).

### Files Built — ENGINE / LIB
- `lib/pricing.ts` — `computePrice()` canonical order-math (subtotal → discount → taxable → GST split, inclusive/exclusive, CGST/SGST/IGST by buyer state).
- `lib/coupons.ts` — `applyCoupon()` validation + discount (active → date → product match → min-order → first-order → usage limits → compute → cap).
- `lib/digital-plan-types.ts` — `DigitalPlanData` / `WorkoutPlanData` contract (stable shape between data layer and PDF).
- `lib/digital-plan.ts` — `getDigitalPlanData(slug)`: `MealPlan → scheduleSlots → recipe → ingredients/steps`, scales macros + grams by `servingMultiplier`, groups by day, aggregates grocery (also satisfies 9Q). Decimals coerced with `Number()`.
- `lib/digital-plan-pdf.tsx` — **designed** `@react-pdf/renderer` document: dark branded cover (bundle badge + metric chips) → "How to use this plan" → meals (day ribbons, slot pills, macro chips, 2-col ingredients, numbered method) → grocery by aisle → **Pro Training Plan** (day cards) → dark back-cover CTA. Bundle-aware; uses real `days.length` (fixed the bogus "60-day" label).
- `lib/personalization.ts` (Jun 6) — `getPersonalization()` pulls height/weight/goal/age from `UserProfile` + latest `BodyMetric` (uses the FitDays scale's own `bmi`/`bodyFatPct` when present), computes BMI, daily deficit vs `tdee`, and a weight projection. Priority: checkout-override → saved profile → plan default. Feeds the PDF's "Your Numbers" page. (Decision #93)
- `lib/digital-plan-pdf.tsx` — **PERSONALISED + FULL-DARK REDESIGN (Jun 6):** interior flipped to full dark (`#0a0a0a` + lime, light text) to match the cover; added a personalised **"Your Numbers"** page with vector infographics — **macro ring** (donut drawn with `Path` arcs — `strokeDashoffset` isn't in react-pdf's `Circle` type), **BMI scale** (zoned bar + marker), **calorie/deficit bars**, **weight-projection line**; falls back to plan targets + a "add stats in your dashboard" callout when no body data. "→ Track it" dashboard prompts threaded through. (Decision #93)
- `lib/workout-plan.ts` — `getWorkoutPlanData(subCategory, tier)` from `ExerciseSchedule` + `ExerciseScheduleDay`; reads exercise names inline from the schedule JSON (no dependency on `Exercise` table contents), graceful null if no match.
- `lib/activate-digital-plan.ts` — `activateDigitalPlan({ orderId, mealPlanId, durEnum, bundle })`: creates `isDigital` `UserActivePlan` (+ bundle), records `CouponRedemption`, idempotent.

### Files Built — ROUTES / PAGES
- `app/api/digital-plan/[slug]/pdf/route.tsx` — gated PDF download; OWNER/ADMIN bypass = Pro preview; Pro appends training; `new Uint8Array(buffer)` response.
- `app/api/payments/payu/digital/route.ts` — bundle-aware PayU init, server-computed price, `notes = { isDigital, planSlug, durEnum, bundle, couponCode }`. No address / no delivery window.
- `app/api/payments/payu/success/route.ts` — added digital branch → `activateDigitalPlan` (full file replaced; physical path unchanged).
- `app/api/coupon/validate/route.ts` — guest-friendly coupon preview (session OR email fallback).
- `app/plans/digital/page.tsx` — Starter / Pro cards (bundle-driven copy map, "MOST POPULAR" on Pro).
- `app/checkout/digital/page.tsx` — coupon field, carries bundle/tier, online-pay only, PayU auto-submit.

### 13D — Checkout Capture (Jun 6) — files changed (4)
- `app/checkout/digital/page.tsx` — added optional "Personalise my plan" card (height / age / current weight / goal weight); sent in the `pay()` POST. Blank = skipped, zero friction.
- `app/api/payments/payu/digital/route.ts` — `num()` + `buildProfile()` validate/clamp the stats server-side and stash only valid ones in `notes.profile`. Hash + empty UDFs unchanged.
- `app/api/payments/payu/success/route.ts` — digital branch now passes `profile: meta.profile` to `activateDigitalPlan` (physical path byte-for-byte unchanged).
- `lib/activate-digital-plan.ts` — `persistProfile()` upserts `UserProfile` on `userId` (only provided fields; try/catch-guarded; runs on fresh activation AND idempotent re-hit). New `CapturedProfile` arg on `ActivateDigitalArgs`.
- No schema change (`heightCm`/`weightKg`/`targetWeightKg`/`age` already on `UserProfile`). Decision #92.

### Files Built — SEEDS / SCRIPTS
- `prisma/seed-products.ts` — seeds STARTER ₹299 + PRO ₹699 `PlanPrice` rows (ONE_MONTH / ALL_FOUR, weight-loss-veg, 18% inclusive) + `FITFUEL50` coupon.
- `prisma/seed-exercise-schedule.ts` — seeds the **Weight-Loss 5-Day Program** (`weight_loss` / `STANDARD`) so Pro always ships a real training plan (3 strength + HIIT + LISS + 2 recovery; exercise names baked into the schedule JSON).
- `prisma/render-pdf.tsx` — local no-auth PDF preview (renders to a file on disk; bypasses auth/payment/deploy for QA).
- `prisma/grant-test-plan.ts` — grants an account a digital plan for testing (now superseded by the owner-bypass route).

### Schema Additions (via `prisma db push` — Decision #71)
- `PlanPrice`: `+ mrpRs`, `+ priceIsTaxInclusive`, `+ isDigital`, `+ bundle (DigitalBundle @default(STARTER))`; unique key → `[mealPlanId, duration, mealsPerDay, bundle]`.
- `UserActivePlan`: `+ isDigital`, `+ bundle (DigitalBundle)`.
- `Order`: `+ mrpSubtotalRs, discountRs, couponCode, cgstRs, sgstRs, igstRs, buyerStateCode, hsnSacCode`.
- New models: `Coupon`, `CouponRedemption`. New enums: `DiscountType`, `CouponSource`, `DigitalBundle`.

### Site Integrations
- Navbar (Digital Plans link), Footer (planLinks), homepage digital section, `/plans` "Not in Pune?" banner, dashboard + `DashboardClient` "⬇ Download my plan (PDF)" button on the active-plan card.

### PENDING (to fully close Phase 13)
- **Vercel Blob caching** for generated PDFs (render once, store by slug+bundle, regenerate on recipe/schedule change) — before scaling traffic.
- **Brand fonts** (Syne / DM Sans) registered in the PDF — currently Helvetica.
- **Finalise prices** — ₹299 / ₹699 are placeholders.
- **Owner download** failed in testing — verify the bundle-aware `route.tsx` is deployed AND the account `role = OWNER` in DB (local `prisma/render-pdf.tsx` sidesteps this for QA).
- `PlanDuration` has no annual value — add `TWELVE_MONTH` if selling an annual digital tier.
- `PlanCategory.DIGITAL` now redundant (fulfilment lives on `isDigital`) — keep dormant or retire.
- `weight-loss-veg.cycleLengthDays = 60` but only 30 days seeded — PDF now uses `days.length`; consider correcting the plan field.
- Confirm with CA: SAC 9983 + GST registration timing (esp. before Phase 21 Zomato/Swiggy).

---

## PHASE 14 — BLOG / FAQ / TESTIMONIALS

> **Status: ✅ CORE LIVE (June 8, 2026).** Three public content surfaces, all DB-backed so the Phase 15 Admin Panel can manage them without redeploys. Built in the clean server content-page idiom (matches the FAQ/legal pages from 9I), NOT the animated client idiom (home/about). No new API routes — server components read Prisma directly. Activated with `prisma db push` + seed; verified live and pushed to main.

### Why DB-backed (not MDX / hardcoded)
The existing FAQ and the homepage testimonials were hardcoded arrays. Phase 14 moves all three to Prisma models so: (a) Phase 15 admin edits them with no deploy, (b) testimonials evolve into real verified customer results (the moat), (c) the blog grows over time. Models are standalone — no relations to existing tables — so the schema add was strictly non-breaking. See Decision #90.

### Schema added (`schema.prisma`)
- `enum BlogStatus { DRAFT PUBLISHED }`
- `model BlogPost` → `@@map("blog_posts")` — slug-unique, `title`, `excerpt`, `contentHtml` (owner HTML), `coverImageUrl?`, `category`, `tags[]`, `authorName`, `readMinutes`, `status`, `isFeatured`, `publishedAt`. Indexed on `[status, publishedAt]` + `[category]`.
- `model Faq` → `@@map("faqs")` — `category`, `question`, `answerHtml` (light HTML, inline legal links), `sortOrder`, `isActive`. Indexed `[category, sortOrder]`.
- `model Testimonial` → `@@map("testimonials")` — `name`, `location`, `planLabel`, `goal?`, `resultLabel`, `rating`, `quote`, `avatarUrl?`, `isFeatured`, `isActive`, `sortOrder`. Indexed `[isActive, sortOrder]`.

### Files
| File | Type | Notes |
|------|------|-------|
| `prisma/schema.prisma` | edit | +3 models +1 enum (appended Phase 14 block) |
| `prisma/seed-phase14.ts` | new | Standalone `tsx` seed (own PrismaClient + PrismaPg). FAQs/testimonials wipe+recreate; blog upserts by slug (idempotent). |
| `app/blog/page.tsx` | new | Listing — category pills (via `searchParams`), featured hero, card grid, SEO metadata. `force-dynamic`. |
| `app/blog/[slug]/page.tsx` | new | Article — async `generateMetadata`, `notFound()`, scoped `.ff-prose` HTML render, tags, related posts, CTA, BlogPosting JSON-LD. |
| `app/faq/page.tsx` | **replace** | DB-backed, grouped by category, native `<details>` accordion (zero client JS), FAQPage JSON-LD, plans CTA. Replaces the hardcoded 9I version. |
| `app/testimonials/page.tsx` | new | `/testimonials` — goal filter (`searchParams`), aggregate ★ rating, card grid, CTA. |
| `components/Footer.tsx` | edit | Added **Reviews** (`/testimonials`) + **FAQ** (`/faq`) to companyLinks (Blog already present). |

### Seeded content (verified Jun 8)
- **17 FAQs** across 6 categories: Delivery & Areas, Plans & Menu, Dietary & Allergens, Tracking, Pricing & Payment, Account & Subscription.
- **8 testimonials** (3 `isFeatured` = the existing homepage three), goal-tagged for filtering.
- **3 launch articles** (1 featured): `why-we-cook-your-food-instead-of-just-counting-it` (FitFuel News — moat thesis), `lose-weight-in-pune-without-giving-up-indian-food` (Guides), `protein-for-vegetarians-hitting-your-target` (Nutrition).

### Verified live
- `fitfuel-eosin.vercel.app/blog` (+ article + related), `/faq`, `/testimonials`. All TS/TSX esbuild-parse-checked before handoff. `db push` reported creating `blog_posts` / `faqs` / `testimonials`; `prisma generate` required before seed (Prisma 7 + prisma.config.ts does not auto-generate on push).

### Not yet done (Phase 14)
- **Homepage testimonials still hardcoded** — rewire that `"use client"` section to pull `isFeatured` rows from `testimonials` (fast-follow, Decision #92).
- **Blog cover images** — `coverImageUrl` supported but seeded posts have none; add images when available.
- **Admin CRUD** for all three — deferred to Phase 15 (Admin Panel).
- **Blog sitemap / RSS** — consider before launch SEO pass (Phase 20).
- Optional: `Review`/`AggregateRating` JSON-LD on `/testimonials` (deliberately omitted to avoid fake-review SEO penalties — revisit only with genuinely verified reviews).

---

## PHASE 21 — AGGREGATOR / MARKETPLACE CHANNEL (ZOMATO + SWIGGY)

> **Status: ⏸️ Pending — post-launch growth channel. Added Jun 5, 2026. NOT core to the model. See Decision #77.**

### What It Is
Listing FitFuel's kitchen on Zomato and Swiggy as a cloud-kitchen brand for à-la-carte, no-subscription ordering. This is a DISTRIBUTION + ACQUISITION channel layered on top of the owned platform — it is not the business model. It fills spare kitchen capacity and puts FitFuel in front of cold discovery traffic.

### Why It Comes AFTER Launch (and why it's NOT core)
Aggregator orders BREAK the data loop that is FitFuel's entire moat:
- The customer is anonymous to us — no onboarding, no body data, no UserActivePlan, no tracking.
- The platform owns the relationship and takes ~20–30% commission.
- It is a commodity food sale, the opposite of a personal health OS.
So this channel exists to FEED the funnel, never to replace it. Sequenced after Phase 20 (owned-platform launch).

### The Conversion Mechanic (the only reason to do this)
Every aggregator box ships with a QR card → "Scan for your free TDEE + personalised plan" → lands on the public TDEE tool (9T) → onboarding → tracked subscriber. The aggregator pays to acquire the eater; FitFuel converts the eater into an owned, tracked customer. **Measure success by conversion rate, not aggregator GMV.**

### Scope (light — this is ops + marketing, not deep platform work)
| Item | Notes |
|------|-------|
| Merchant onboarding | Zomato + Swiggy restaurant partner accounts (FSSAI 21523035002815 already in hand — Pending Input #8) |
| Menu curation | A focused à-la-carte menu (NOT the 119-plan catalogue) — best-selling, travel-stable dishes |
| Menu sync | Manual at first; API/POS sync later only if volume justifies |
| Order ingestion | Aggregator orders flow into the Phase 15 Kitchen Production Dashboard so the kitchen sees ALL demand (subscription + aggregator) in one view |
| QR conversion card | Printed insert in every aggregator box → /tools/tdee-calculator (9T) → onboarding |
| Reconciliation | Commission + payout tracking (aggregators settle separately from PayU/COD) |

### Connects To
- 9T Public TDEE Calculator → the landing page for the QR conversion funnel.
- Phase 15 Kitchen Production Dashboard → unified demand view (subscription + aggregator).
- Phase 12 AI Trainer → an aggregator-converted customer enters the same data loop and becomes monetisable by the coach (Decision #78).

### Open Questions (resolve before build)
- Same brand "FitFuel" on aggregators, or a separate à-la-carte sub-brand to protect the premium health-OS positioning?
- Which dishes travel well via aggregator riders (longer transit than own delivery)?
- Does aggregator visibility cannibalise direct subscription, or feed it? (Track conversion vs cannibalisation explicitly.)

---

## PHASE 22 — SOCIAL & COMMUNITY

> **Status: ⏸️ Pending — split out of Phase 12 (added Jun 5, Decision #84). NOT part of the AI trainer core.**

### What It Is
The social layer that was surfaced during Phase 12 scoping but does not belong inside the AI trainer: accountability-partner matching (users on similar plans/goals/city), cohort leaderboards, community challenges ("7/7 workout days this week — 43 users in"), and the AI→human nutritionist handoff protocol (seamless escalation with full data context already shared, so the user never repeats themselves).

### Why It's Its Own Phase
Community is a whole product with its own matching, moderation, and abuse surface. Bolting it onto "AI trainer" would have bloated Phase 12 and delayed the moat. It rides on the same data the rest of the system already produces (plans, consistency scores, progress) and is a retention/virality layer best built once there's an actual user base to connect.

### Connects To
- Consistency Score (9R) + Progress (Phase 11) → leaderboards + challenge scoring.
- Phase 12 AI Trainer → coach→human handoff protocol (escalation when the AI hits medical/emotional limits — overlaps the Luxury nutritionist consult).
- Referral System (Phase 19) → social graph overlap.

---

## UPCOMING PHASES

| Phase | Name | How Phase 9 Enables It |
|-------|------|------------------------|
| 10 | Live Delivery Tracking | ✅ DONE (Jun 4) — nightly generator + dispatch board + driver app live. See Phase 10 section above. |
| 11 | Progress Tracking + Charts + Consistency Score | ✅ Core LIVE (Jun 5) — /dashboard/progress with weight/calorie/macro/consistency charts. Snapshot trend = fast-follow. See Phase 11 section above. |
| 12 | AI Personal Trainer + Customer-Service Assistant (unified) | ⏸️ PARKED Jun 5 — scope FINALISED (tight v1 + captured v2–v4 backlog), build DEFERRED until data loop is fuller / later phases ship. COACH (Luxury) + SUPPORT (all subscribers). See Phase 12 section + scope doc. Decisions #74–#85. |
| 13 | Digital Meal Plans (PDF) | Pull MealPlan + schedule + Recipe from DB → generate PDF with macros, recipes, grocery list. Cross-channel: digital-plan users (cook themselves, no delivery, anywhere in India) still log meals/workouts → monetisable by the Phase 12 AI Trainer. National reach beyond Pune delivery. Decision #78. |
| 14 | Blog, FAQ, Testimonials | FAQ page in 9I — blog extends it. Testimonials with real user results from Phase 11 data |
| 15 | Admin Panel + Kitchen Production Dashboard | Recipe admin in 9M extended. Kitchen sees: tomorrow's 47 portions of Rajma, 23 Moong Chilla. Franchise SOP. Also ingests Phase 21 aggregator orders into one unified demand view. |
| 16 | n8n WhatsApp Notifications + Weekly Digest | "Today's meal" push uses MealLog + PlanScheduleSlot. Weekly Digest = 9R Consistency Score + weight delta + best dish |
| 17 | Personalised Supplement Stack + Delivery | plan_category + health_condition → curated stack with doses. Premium gets stack recommendation. Luxury gets AI-refined. |
| 18 | Plan Progression Engine + Adaptive Recalibration | Weight trend flat 2 weeks → detect plateau → suggest calorie adjustment. Goal hit → suggest next plan. |
| 19 | Referral System + Public TDEE Tool | referredBy on User table. TDEE tool = top-of-funnel SEO entry point → onboarding conversion |
| 20 | QA, Performance, DNS cutover, Launch | fitfuel.in goes live |
| 21 | Aggregator Channel (Zomato + Swiggy) | Post-launch distribution + acquisition + kitchen-fill. Feeds funnel via QR → TDEE (9T) → onboarding. NOT core — breaks the data loop. Light integration (curated menu + order ingestion into Phase 15). Decision #77. See Phase 21 section above. |
| 22 | Social & Community | Split out of Phase 12 (Decision #84). Accountability matching, cohort leaderboards, challenges, AI→human nutritionist handoff. Rides on consistency + progress data. Retention/virality layer — build once there's a user base. See Phase 22 section above. |
| Online Consulting | Nutrition consulting | Nutritionist sees UserActivePlan + MealLog + BodyMetrics + ConsistencyScore — full picture |
| Franchise | Franchise portal | RecipeStep SOP + batch scaling + Kitchen Production Dashboard already built — franchise gets access |
| Corporate | B2B plans | MealPlan with corporate pricing — schema supports it. Company health benefit program. |

---

## PROGRESS SUMMARY (Jun 5, 2026)

> Previous (May 30 — End of Day 3) snapshot preserved below; Jun 5 figures added.

### May 30 — End of Day 3
| Category | Done | Total | % |
|----------|------|-------|---|
| Schema + Migrations | ✅ | ✅ | 100% |
| Meal Plans in DB | 119 | 119 | 100% |
| Recipe Seeds (DB verified) | 1 | 119 | 1% |
| Schedule Seeds (DB verified) | 1 | 119 | 1% |
| Phase 9 App Features | 7 (9N + 9J + 9K complete + 9E complete) | ~20 | 35% |
| Launch Gates Cleared | 7 | 7 | 100% (G8 FSSAI check pending) |
| Phases 0–8 | ✅ | ✅ | 100% |
| Phase 10 Delivery (core) | ✅ | ✅ | 100% (3 items pending) |

### Jun 5 — current
| Category | Done | Total | % |
|----------|------|-------|---|
| Schema + Migrations | ✅ (+ ConsistencySnapshot pending migrate) | ✅ | 100% |
| Meal Plans in DB | 119 | 119 | 100% |
| Recipe Seeds (DB verified) | 1 | 119 | 1% |
| Schedule Seeds (DB verified) | 1 | 119 | 1% |
| Phase 9 App Features | 9 (9N+9J+9K+9E+9R+9D done) | ~20 | 45% |
| Phase 10 Delivery (core) | ✅ | ✅ | 100% (checkout toggle now in UI — verify persistence; slip + driver-notify pending) |
| Phase 11 Progress Charts (core) | ✅ | ✅ | 100% (snapshot cron LIVE Jun 5 — trend line renders once weeks accrue) |
| Phases 0–8 | ✅ | ✅ | 100% |

**Current focus: PHASE 11 COMPLETE. Phase 12 scope FINALISED + PARKED (build deferred — Decision #85). Next track = build the data-generating phases first: (a) P0 recipe seeds (unlock more live plans → more users → more data), (b) remaining Phase 9 app features (9F/9G/9H/9I pages, 9L net-calorie engine, 9M recipe admin), then Phases 13–19. Un-park Phase 12 once the data loop is fuller.**
**Next action: pick the next build track among the data-generating phases. Phase 12 (AI Trainer) is parked-with-finalised-scope. Phase 21 (Zomato/Swiggy) + Phase 22 (Social/Community) added as later phases. While building intervening phases, keep the §8 forward-compatible hooks in mind (receiving-API pattern, app-shell nav) so Phase 12 slots in later instead of needing a retrofit.**

---

> **This is the only tracker. Do not create new trackers. Update this file after every session.**
> **Last verified: May 26, 2026 — SQL confirmed 119 plans (27 STD + 70 L/M + 22 SPORTS), 30 recipes, 120 slots, 2499 price rows**
> **May 27 — user_active_plans: 1 row (Pranit, weight-loss-veg, Day 1, status active, proteinTarget 182)**
> **Vision realigned May 26, 2026 — FitFuel is a personal health OS. Every feature connects. Nothing is standalone.**
> **Decision #43 revised May 27 — full 30-day menu 100% public, no blur, no auth wall.**
> **9N Onboarding confirmed complete May 27.**
> **9J APIs built + pushed May 27 — verified working May 30 (4 meals render, buttons work, mobile responsive).**
> **9E /plans/[slug] built May 30 — 3 files, 12 sections, all DB field names verified against schema.prisma.**
> **Decision #61 May 30 — always read schema.prisma before writing any Prisma select. Never guess field names.**
> **Next: G8 FSSAI footer check → WhatsApp number in PlanDetailClient → end-to-end test → go live.**
> **Jun 4 — PHASE 10 DELIVERY CORE LIVE: /admin command center (dispatch board Morning/Evening + driver roster), /driver/[token] app, nightly generator cron (11 PM IST), COD order now auto-creates UserActivePlan, 10 orders backfilled, storefront nav hidden on /admin. Schema: DeliveryWindow enum + deliveryWindow on UserActivePlan & Delivery.**
> **Decisions #62-64 (Jun 4): pricing HQ-fixed for launch; confirmation = physical signed slip (no OTP); 1 delivery/customer/day, Morning OR Evening window.**
> **Phase 10 PENDING: checkout window toggle (now in UI Jun 5 — verify persistence), printable signed slip, driver WhatsApp notify (MSG91).**
> **Decision #65 (Jun 4): stack confirmed Auth.js v5 (next-auth 5.0.0-beta) — read session via auth(), never hand-read cookies. Prisma 7, Neon. Always read schema.prisma before any Prisma select (reaffirms #61).**
> **Decision #66 (Jun 4): printable signed delivery slip will be built in Claude Design (visual), not hand-coded. Checkout window toggle + driver dispatch notification to be built next to close Phase 10.**
> **Jun 5 — G8 FSSAI confirmed in footer → all launch gates cleared, WL-Veg launch-ready.**
> **Jun 5 — PHASE 10 #1 CLOSED: delivery window persists for COD + PayU (verified live ₹1 order). PayU order flow COMPLETED (was a no-op stub) — online payments now create Order + Payment + UserActivePlan. Plan assignment fixed to weight-loss-veg. P2002 phone-collision fixed. Decisions #72–73. Phase 10 remaining: printable signed slip (Claude Design), driver dispatch WhatsApp notify (MSG91).**
> **Jun 5 — KNOWN cosmetic: order/confirmation page hardcodes "7am–10am" regardless of chosen window — fix in global rewire.**
> **Jun 5 — 9D Wednesday=rest RESTORED: re-ran clean exercise-schedule seed (schedule cmq0ehixv00009gugf0lbg0lv), deleted the temporary -VERIFY seed. TRACK A COMPLETE (9D Wed-rest ✅ + FSSAI G8 ✅ + Phase 10 #1 ✅). WL-Veg is launch-ready.**
> **Jun 5 — CHECKOUT ENCODING FIXED: app/checkout/page.tsx mojibake repaired (₹/middots/dashes/emojis), rupee hardened to \u20B9 + &#8377;. Root cause = Windows ANSI save. Decision #67.**
> **Jun 5 — 9R Consistency + 9D Workout card VERIFIED LIVE (built Jun 4, tracker was stale). Both = DONE. Decision #68.**
> **Jun 5 — PHASE 11 PROGRESS PAGE CORE LIVE: lib/progress.ts + /dashboard/progress (page.tsx + ProgressClient.tsx). Weight/calorie/macro/consistency charts. Decision #69.**
> **Jun 5 — CONSISTENCY SNAPSHOT engine built (ConsistencySnapshot model + /api/cron/snapshot-consistency weekly cron + vercel.json). Needs migrate + push. Vercel cron #2 of 2 (Hobby limit). Decision #70.**
> **Jun 5 — SNAPSHOT DEPLOYED: schema synced via `prisma db push` (migrate dev hit drift from Phase 10 db-push changes — refused reset to protect data). consistency_snapshots table live. Cron route + vercel.json pushed; 401-guard verified at /api/cron/snapshot-consistency. PHASE 11 COMPLETE. Decision #71 = standardise on db push, never migrate dev (reset risk).**
> **Jun 5 — PHASE 12 SCOPE LOCKED: AI Personal Trainer = UNIFIED assistant (COACH for Luxury + SUPPORT for all subscribers). Full scope doc FITFUEL-PHASE-12-AI-TRAINER-SCOPE.md (12A–12K + 12-SAFE + 12-SUPPORT). Positioning = own the plate, don't out-AI Healthify. Recipe seeds do NOT gate it. Decisions #74–#76, #78. Build starts at 12A Context Engine.**
> **Jun 5 — PHASE 21 ADDED: Aggregator / Marketplace Channel (Zomato + Swiggy) — post-launch growth channel, NOT core (breaks the data loop). Feeds funnel via QR → TDEE → onboarding. Light ops/marketing integration. Pending Input #8 (merchant accounts). Decision #77. Digital Meal Plans remain Phase 13 (already in roadmap). Decision #78 = AI Trainer monetises across ALL channels.**
> **Jun 5 — PHASE 12 FINALISED + PARKED: scope doc upgraded to FINALIZED version (full universe captured + tight v1 committed). v1 = 12A + 12-SAFE + 12B + 12-SUPPORT + 12C + 12D + 12E + 12-WORKOUT-MODE + 12H + 12I (web-only, data already in system; in-session workout mode pulled into v1 as best version). Build DEFERRED until data loop fuller / later phases ship — AI quality is bounded by data depth, field moves monthly, ops+revenue first. PWA-first, Expo deferred. Three hard safety lines (medical / body-image / proactive-≠-manipulative). Reassignments: form-video → Phase 7, DPDP/export → Phase 20, community → NEW Phase 22. Decisions #79–#85.**
> **Jun 6 — PHASE 13 DIGITAL MEAL PLANS CORE LIVE: Starter ₹299 / Pro ₹699 tiers (DigitalBundle), designed react-pdf document (dark cover → how-to-use → meals → grocery → Pro training plan → back cover), digital PayU guest checkout + coupon engine (FITFUEL50), owner/admin PDF preview, delivery cron excludes isDigital. Built: pricing.ts, coupons.ts, digital-plan(-types/-pdf).ts(x), workout-plan.ts, activate-digital-plan.ts, digital + success + coupon-validate routes, /plans/digital + /checkout/digital pages, seed-products.ts + seed-exercise-schedule.ts + render-pdf.tsx. Schema: PlanPrice/UserActivePlan/Order extensions + Coupon/CouponRedemption + DigitalBundle/DiscountType/CouponSource enums. PDF rendered on-the-fly (NOT stored — Blob caching is the perf TODO). Decisions #86–#91. Pending: Blob cache, brand fonts, final prices, verify owner-route deploy + account role.**
> **Jun 6 — PHASE 13 PDF PERSONALISED + FULL-DARK REDESIGN: interior flipped to full dark (#0a0a0a/lime); new lib/personalization.ts (UserProfile + latest BodyMetric → BMI, deficit vs TDEE, weight projection) drives a "Your Numbers" page with vector infographics (macro ring, BMI scale, calorie/deficit bars, weight-projection line). Macro ring uses Path arcs (strokeDashoffset untyped on react-pdf Circle). "→ Track it" dashboard prompts threaded through; graceful fallback when no body data. Files: lib/personalization.ts (new), lib/digital-plan-pdf.tsx + pdf route + render-pdf.tsx (updated). Built + pushed. Decision #93. (3D not feasible in react-pdf; brand fonts still deferred.)**
> **Jun 6 — PHASE 13D CHECKOUT CAPTURE LIVE: digital checkout now collects optional height/weight/goal/age → validated server-side → stashed in order.notes.profile → upserted to UserProfile on payment success (only provided fields, try/catch-guarded). Seeds the buyer's dashboard AND personalises the PDF (engine reads UserProfile — no overrides plumbing). 4 files changed (checkout page, payu/digital, payu/success, activate-digital-plan), no schema change. Build green, pushed 9a272d7. Decision #92.**
---

## ═══════════ PHASE 15 — ADMIN COMMAND CENTER (SELF-SERVICE) + IMAGE UPLOAD + MENU PHOTOS ═══════════
### Session: Jun 10–11, 2026 · additions-only · Decisions #94–#102

> **Jun 10 — DRIVING PRINCIPLE (Decision #94): the rebuild is one-time; the founder then steps away from code to run sales/ops/scaling. Therefore the admin MUST be fully self-service — every operational artifact (staff roles, content, plans, prices, recipes, cooking steps, ingredients, images) editable from the UI with NO dev/DB access later. This expanded Phase 15 scope: staff RBAC, content CRUD, plan+price editing, and recipe/step/ingredient editing are all IN-scope (not deferred). Multi-tier franchise/outlet stays deferred (scope = role, not franchise).**

> **Jun 10 — PHASE 15B KITCHEN PRODUCTION DASHBOARD LIVE: `/admin/production` cook sheet — per-recipe scaled portions × active-subscriber count, expandable SOP (raw-gram ingredients + numbered steps), consolidated prep/shopping list, date nav, `?print=1` A4 white auto-print. Shared resolver `lib/production.ts` (single source of truth: getActiveSubscribersForDate, menuDayNumber [calendar-based: ((targetDate−startDate) mod cycleLengthDays)+1], mealSlotsForMealsPerDay, buildProductionReport) is used by BOTH the dashboard and the nightly `generate-deliveries` cron — refactored cron onto it to prevent drift. Decision P15-1 (shared-resolver pattern).**

> **Jun 10 — SUBSCRIBER DATA FIX (surfaced by the production dashboard): 10 active subscribers were on a stray active-but-empty plan `weight-loss-vegan` (id cmpmu6lty…, 0 slots) instead of canonical `weight-loss-veg` (id cmplzo62r…, 120 slots). Root cause = onboarding routed by diet preference to the empty plan. Ran `prisma/fix-phase15-plan-data.ts` (APLY=1): repointed 10 subs → weight-loss-veg; aligned `cycleLengthDays` 60 → 30 to match the 30 seeded days. The vegan plan was already inactive (no new phantom subs). NOTE: original moat commitment was a 60-day no-repeat cycle; current build is 30 — OPEN decision. FLAG: confirm those 10 repointed subscribers are real vs test before launch.**

> **Jun 10 — PHASE 15C-CONFIRM (closes last Phase 10 gap): customer side of the two-sided delivery handshake. `customerConfirmedAt`/`customerIssueNote` were displayed but never set. Built `app/api/user/deliveries` (GET recent dispatched last 7d; POST confirm|issue with order.userId ownership check) + `DeliveryConfirmCard` mounted on the dashboard (renders null when nothing to confirm). Driver marks delivered → customer confirms received / reports issue.**

> **Jun 10 — PHASE 15-RBAC + STAFF MANAGEMENT LIVE (Decision #95): Role enum extended CUSTOMER/ADMIN/OWNER → + KITCHEN + DISPATCH (`db push` applied the ALTER TYPE; reaffirms Decision #71 db-push-not-migrate; enum edit needed a newline-agnostic PowerShell .Replace because schema uses LF). Rewrote `lib/admin-auth.ts`: StaffRole, SURFACE_ROLES map {dispatch+drivers:[OWNER,ADMIN,DISPATCH], production+recipes:[OWNER,ADMIN,KITCHEN], staff:[OWNER], content/plans/orders/subscribers:[OWNER,ADMIN]}, canAccess, requireSurface (pages → redirect to landingFor), requireApiRole (APIs → 403). PRINCIPLE: scope = role, franchise deferred. Per-surface gates added to BOTH pages AND APIs (a KITCHEN user cannot reach customer PII via the dispatch UI OR a direct `/api/admin/deliveries` call → 403). Role-aware nav (shows only reachable surfaces). Staff mgmt `/admin/staff` (OWNER-only): search any signed-up user by email → grant KITCHEN/DISPATCH; self-demotion guard. Verified live (set test user KITCHEN, split confirmed).**

> **Jun 10 — Decision #96 (build-discipline, learned the hard way): admin/Prisma code uses the codebase's `(prisma as any)` / `const db = prisma as any` convention to dodge generated enum-type friction. The sandbox can run esbuild (syntax) but NOT full tsc/prisma (no engine binary), so Vercel's TypeScript step is the real type gate. A `role: { in: STAFF as unknown as string[] }` cast failed Vercel with "string[] not assignable to Role[]" — fixed by routing the query through `(prisma as any)`. Inline literal enum arrays (`status: { in: ["PREPARING","PACKED"] }`) are fine via contextual typing; separately-declared/cast arrays are not.**

> **Jun 10 — PHASE 15D CONTENT CRUD LIVE: `/admin/content` (content surface) — tabbed manager (Blog / FAQ / Testimonials) over the Phase 14 models. One API `/api/admin/content` ({type, action, data}; slugify + P2002 unique-slug handling; `(prisma as any)`). Blog editor = HTML body + live preview pane, slug auto/manual, tags, Draft/Published, Featured, cover image. FAQ = category (datalist) + answer HTML + order + active. Testimonials = name/location/plan/result/rating/quote + featured/active. Public `/blog` `/faq` `/testimonials` are `force-dynamic`, so edits go LIVE immediately (no redeploy). Split into focused managers (ContentClient shell + BlogManager/FaqManager/TestimonialManager) for maintainability.**

> **Jun 10 — PHASE 15E-1 PLANS + PRICING LIVE: `/admin/plans` (plans surface). Edit MealPlan copy (display name, tagline, descriptions, who-it's-for, key principles, what's-avoided), average macros, nutritionist + disclaimer, featured/sort, image, accent. One-click Active/Hidden = the SELL switch (no more DB editing). Decision #97: pricing edits = EDIT existing PlanPrice rows only (price ₹ / MRP / GST% / active) — never add/delete combos, because checkout depends on the exact (duration × meals × bundle) rows existing. Structural fields (slug/category/tier/diet/cycle) shown READ-ONLY so they can't break checkout. `(prisma as any)`.**

> **Jun 10 — PHASE 15E-2 RECIPES + STEPS + INGREDIENTS LIVE (Decision #98): `/admin/recipes` — new `recipes` surface = [OWNER, ADMIN, KITCHEN] so cooks can fill SOP gaps. List with search + meal filter + a "Needs cooking steps" filter that surfaces 0-step recipes (the exact gaps the production sheet flagged). Editor: recipe details (name/desc/cuisine/meal/times/difficulty/per-serving macros/active/featured/image) — Prisma `update` writes ONLY the sent subset, so the 40+ micronutrient/per-100g fields are untouched/safe. Steps: add/edit/delete + ▲▼ reorder (renumbers stepNumber in DB) with title/instruction/technique/duration/temp/kitchen-note. Ingredients: add/edit/delete with a FoodItem picker (search existing) + inline-create a new FoodItem (per100Calories required Float, others default 0, isCustom=true) + raw grams/cooked-factor/prep-note/optional. API `/api/admin/recipes` (GET ?id detail / ?foodq search; POST updateRecipe|saveStep|deleteStep|reorderSteps|saveIngredient|deleteIngredient|createFoodItem). `(prisma as any)`.**

> **Jun 11 — PHASE 15F ORDERS + SUBSCRIBERS LIVE (Decision #99): `/admin/orders` (orders surface) — last 200 orders, search (order#/name/email/phone) + payment filter + filtered paid-revenue total; expand for items, address, amount breakdown, PayU ref, plan window. `/admin/subscribers` (subscribers surface) — all UserActivePlan records with active/paused/completed/cancelled summary, search + status + meal-delivery/digital filters; expand for plan/duration/meals/bundle, delivery window, personalised macro targets, linked order, contact (this is the view that makes a plan-mismatch like the Jun-10 one visible at a glance). Both READ-ONLY except: order payment status is a manual reconciliation action (`/api/admin/orders` setPaymentStatus → PAID/FAILED/REFUNDED/PENDING; marking SUCCESS also flips a PENDING_PAYMENT order to CONFIRMED). Bookkeeping only — does NOT re-run checkout/fulfilment automation (digital out-of-band payments would still need a provision action — noted as future).**

> **Jun 11 — FIX (Decision #100): `/admin/recipes` crashed client-side ("page couldn't load", server returned 200). Cause = circular import — RecipesClient imported RecipeEditor, RecipeEditor imported shared UI primitives BACK from RecipesClient, and RecipeEditor used `T` at module top-level (`const miniBtn`), which was undefined mid-cycle → threw before render. (Content didn't hit this because its managers only use primitives inside render.) Fix = extract shared primitives into their own `app/admin/recipes/ui.tsx`; both import from it → no cycle. RULE: shared client UI primitives live in their own module, never exported from a sibling that imports the consumer.**

> **Jun 11 — IMAGE UPLOAD VIA VERCEL BLOB LIVE (Decision #101): reusable `components/ImageUpload.tsx` (drag-drop + file picker + thumbnail preview + Replace/Remove + paste-URL fallback) using the CLIENT-upload flow (`upload()` from `@vercel/blob/client`) so big phone photos bypass Vercel's 4.5 MB serverless body limit. Token route `app/api/admin/upload` (`handleUpload`) is staff-gated via `getAdminUser()` in `onBeforeGenerateToken`, allows image/* up to 8 MB, addRandomSuffix. Wired into 4 surfaces (folders): recipes, plans, blog covers, testimonial avatars. SETUP (one-time, done): `npm i @vercel/blob` + create a PUBLIC Blob store in Vercel (auto-injects `BLOB_READ_WRITE_TOKEN`) + redeploy. GOTCHA hit + resolved: "Failed to retrieve the client token" = token env missing on the running deployment → env var must exist AND a redeploy must follow (env changes only apply to new deployments).**

> **Jun 11 — RECIPE PHOTOS ON PUBLIC PLAN MENU (Decision #102): recipe images now surface on `/plans/[slug]`. Added `imageUrl` to the recipe select; in `PlanDetailClient` every meal cell in the menu grid has a FIXED image area — real photo when present, a tasteful gradient + faint meal-slot icon placeholder when not — so rows stay even AND food shows UPFRONT (conversion: "if the customer doesn't see the dish, it's a red flag"). Day-1 sample cards get a banner image. Clicking any dish opens a popup with the large photo + description + cuisine/time/serving + kcal/P/C/F — MARKETING INFO ONLY, deliberately NO ingredients or cooking steps (the SOP stays a paid/internal asset, consistent with the moat). Reaffirms Decision #67 (encoding): unicode glyphs in JSX text (× `\u00D7`, ◉ `\u25C9`) must be `{'\uXXXX'}` or HTML entities — raw `\uXXXX` between tags renders literally.**

> **PHASE 15 STATUS: ✅ ADMIN COMMAND CENTER CORE COMPLETE (Jun 11, 2026). Nine role-gated surfaces live: Dispatch, Production, Drivers, Plans, Recipes, Orders, Subscribers, Content, Staff. The admin is now fully self-service per Decision #94 — staff onboarding, content, plans, prices, recipes/steps/ingredients, and images are all UI-editable with no dev/DB access. Image upload (Blob) + public menu photos shipped. OPEN ITEMS: (a) cycleLengthDays 30-vs-60 moat decision; (b) confirm the 10 repointed subscribers are real vs test; (c) bulk-add remaining recipe photos; (d) optional `revalidate` on `/plans/[slug]` if future image swaps don't reflect (route caching); (e) digital out-of-band "provision access" action; (f) deferred from earlier phases unchanged (CA/GST, Blob PDF cache, brand fonts, recipe seeding across remaining ~118 plans).**
---

## ═══════════ PHASE 16 — NOTIFICATIONS (EMAIL + WHATSAPP-LATER) ═══════════
### Session: Jun 12–13, 2026 · additions-only · Decisions #103–#122

> **Jun 12 — PHASE 16A TRANSACTIONAL NOTIFICATIONS LIVE: order/dispatch/issue events now fire customer + staff emails via Resend. Built unified `lib/notify.ts` (sendNotification, fireNotification fire-and-forget, notifyStaffByRoles), WhatsApp stub `lib/msg91-whatsapp.ts` (defers gracefully — dispatcher catches "not configured" and logs SKIPPED), and admin surface `/admin/notifications` (Templates tab + Send logs tab + Test send dialog). New `notifications: [OWNER, ADMIN]` surface in SURFACE_ROLES. Schema additions (db push): 3 models (`NotificationTemplate`, `NotificationLog`, `NotificationPreference`) + 2 enums (`NotificationChannel`, `NotificationStatus`) + `Delivery.dispatchNotifiedAt DateTime?` (idempotency) + `User.notificationPreference` relation. 5 templates seeded: `order_confirmed`, `delivery_dispatched`, `delivery_issue_ack`, `staff_new_order`, `staff_delivery_issue` (all BOTH channel). 4 events wired: PayU success (digital + physical), COD success, driver `/api/driver/[token]/deliveries` GET first-time, customer `/api/user/deliveries` POST issue path. Currently sending from `onboarding@resend.dev` sandbox; will switch to `hello@fitfuel.in` on launch DNS migration.**

> **Jun 12–13 — PHASE 16B SCHEDULED NOTIFICATIONS LIVE (Weekly Digest + Morning Preview + Evening Recap via QStash): hit Vercel Hobby's 2-cron cap (snapshot-consistency was #2 of 2), so moved external scheduling to **Upstash QStash** (free tier 500 msg/day, signed-request verification). Built 3 endpoints: `/api/cron/morning-preview` (sends today's 4 meals to active subscribers, 7 AM IST = 1:30 UTC), `/api/cron/evening-recap` (sends logged-vs-target macro recap, 9 PM IST = 15:30 UTC), and `/api/cron/snapshot-consistency` extended to also fire `weekly_digest` template (piggybacks the existing Saturday cron — no new schedule needed). New helper `lib/user-day-meals.ts` resolves the day's meals per active subscriber (calendar-based menuDayNumber, same logic as production resolver). 3 new templates seeded: `morning_meal_preview`, `evening_recap`, `weekly_digest`. QStash signing keys added to Vercel env (`QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`); endpoints accept BOTH `Authorization: Bearer CRON_SECRET` (for manual curl) AND QStash signature (for production schedules). Tested live via curl — morning + evening + digest all fire with correct content; logs visible in `/admin/notifications` → Send logs.**

> **PHASE 16 STATUS: ✅ EMAIL CHANNEL COMPLETE (Jun 13, 2026). 8 templates live, 7 events firing (4 transactional + 3 scheduled). WhatsApp portion deferred to post-launch (WAHA on Oracle Cloud Free Tier) — the 3 scheduled templates were toggled BOTH → EMAIL to keep logs clean; flip back to BOTH when WAHA lands. Per-user notification preferences UI on `/dashboard/settings` deferred to a later sub-phase.**

### Decisions
- **#103 — Phase 16 stack:** drop n8n. Use Vercel inline triggers + existing crons + Resend for email + WAHA-later for WhatsApp. n8n's "edit-later" promise is fulfilled by the `/admin/notifications` template editor instead. (n8n self-hosted requires 24/7 VPS, n8n Cloud costs $20/mo — neither was justified.)
- **#104 — Email provider: Resend.** Free 3000/mo, generous DKIM/SPF setup, modern API. Verified domain (`fitfuel.in`) deferred to launch DNS migration; using `onboarding@resend.dev` sandbox for now.
- **#105 — WhatsApp deferred to post-launch.** Stub client logs SKIPPED, dispatcher swallows error. Reactivated by setting WAHA env vars + flipping templates back to BOTH. Zero code change required at swap time.
- **#106 — Notification dispatcher is fire-and-forget.** `fireNotification()` never blocks the request — wrapped in `Promise.resolve().then(...).catch(log)`. PayU success must NOT fail because Resend rate-limited.
- **#107 — Templates store HTML body + plaintext fallback + variable schema.** Editable from `/admin/notifications` Templates tab — no redeploy for copy changes (force-dynamic public pages already, admin page reads live). Variables are double-curly mustache: `{{customerName}}`, `{{orderNumber}}`, `{{deliveryDate}}`, etc.
- **#108 — Idempotency per event.** `Delivery.dispatchNotifiedAt` flags one-time dispatch ping; `NotificationLog` keyed by (templateKey, recipientUserId, externalRef) prevents duplicate sends across retries.
- **#109 — Staff alerts route by role**, not by individual user. `notifyStaffByRoles(['DISPATCH','OWNER'], template, vars)` looks up active staff with those roles and sends to each. Adding a new dispatcher = adding the role, no notification config change.
- **#110 — Vercel cron cap workaround = Upstash QStash.** Free 500 msg/day covers 3 schedules × 30 days × 1.5 buffer = comfortable. Signing-key verification keeps endpoints secure. Existing Vercel cron (snapshot-consistency) stays; new schedules go to QStash.
- **#111 — Weekly digest piggybacks the consistency snapshot cron.** No separate schedule. After snapshot runs, iterate active subscribers → fire `weekly_digest` template with that week's snapshot data inline. One cron, two outputs.
- **#112 — Cron endpoints accept BOTH auth styles** (Bearer CRON_SECRET for manual curl + QStash signature for prod). The signature path uses `@upstash/qstash/nextjs` `verifySignatureAppRouter`; the Bearer path is a manual check above it. This let me test live without waiting for QStash schedule fires.
- **#113 — Morning preview shows today's meals, not tomorrow's.** Logic: a 7 AM IST email about meals arriving at 8–10 AM IST is "preview"; sending the night before competes with evening recap. Decision validated by founder intuition — "tell them what's coming this morning" is the energising message.
- **#114 — Evening recap is gentle, not preachy.** Shows logged-vs-target macros for the day with a single soft nudge if a meal wasn't logged (no shame, no streak-break red). Goal is habit reinforcement, not guilt. Copy reviewed twice before locking template.

---

## ═══════════ PHASE 17 — PARTNER / REFERRAL SYSTEM (UNIFIED 8-TYPE) ═══════════
### Session: Jun 13, 2026 · additions-only · Decisions #115–#128

> **Jun 13 — STRATEGIC FRAME: founder said "I want all 8 partner types built now." Pushed back via Decision #66 business-viability filter (don't build dashboards for partners you haven't signed). Compromise locked = **schema handles all 8 from day one; UI ships in 3 staggered sub-phases (17A → 17B → 17C)**. This gives the founder the data model future-proofing he wants without the over-build penalty.**

> **8 PARTNER TYPES (all in schema, all in admin form): CUSTOMER (P2P referrals, lazy-created), GYM (B2B, MEAL_VOUCHER reward default), TRAINER (CASH), INFLUENCER (CASH), DIETICIAN (CASH), DOCTOR (CASH), CORPORATE (DISCOUNT_ONLY for employee onboarding), RESIDENCE (HYBRID — building/society partnerships, common in Pune apartment complexes).**

> **Jun 13 — PHASE 17A SCHEMA + ADMIN CRUD LIVE: schema additions (db push, reaffirms #71): new models `Partner`, `PartnerReferral`, `CreditLedger`; new enums `PartnerType`, `PartnerStatus`, `PartnerRewardType`, `ReferralStatus`, `PayoutStatus`; User additions = `referralCode String? @unique`, `referredByPartnerCode String?`, `creditsBalanceRs Int @default(0)`, ownedPartner/referralsAsReferee/creditLedger relations; Order additions = `referralAttribution String?`, `creditAppliedRs Int @default(0)`, referralUsage relation. New admin surface `/admin/partners` (gated `[OWNER, ADMIN]`) with full CRUD: create any of the 8 types via TYPE_DEFAULTS-prefilled form, list/search/filter, detail view shows conversions + total reward earned + payout status, manual approve/reject for non-CUSTOMER, manual mark-paid for CASH payouts. Attribution capture: `?ref=CODE` query param on any page sets `ff_ref` cookie (30 days, first-touch); checkout reads cookie → stamps `Order.referralAttribution`. Reward processing: on first PAID order (PayU success or COD mark-paid), `processReferralReward(order)` runs — finds the partner, creates a `PartnerReferral` row keyed by `refereeOrderId` (idempotent), credits the partner (CREDIT type increments `creditsBalanceRs` + logs in `CreditLedger`; CASH/MEAL_VOUCHER queued PENDING for admin payout). Self-referral guard at lookup time. `(prisma as any)` throughout per Decision #96.**

> **Jun 13 — PHASE 17B SCOPE LOCKED + KICKED OFF (in progress): 4 surfaces — `/p/[code]` polymorphic branded landing (gym shows gym name, trainer shows photo+bio; sets attribution cookie immediately; CTA → plans with ref carried through), `/dashboard/referrals` (customer P2P code + WhatsApp share via `wa.me/?text=` deeplink + copy-link + referees list + credit balance), `/dashboard/partners` (logged-in B2B partner sees conversions/reward/payout status), `/admin/partners` detail page gets a QR-generator button (downloads printable PNG poster → `/p/[code]`). QR rendering: `qrcode` npm package, native server-side SVG/PNG (Decision #128-followup). Phase 17B build is mid-flight as of Jun 13.**

> **PHASE 17 STATUS: 🔄 17A ✅ COMPLETE / 17B 🚧 IN PROGRESS / 17C ⏳ DEFERRED. 17C = `/partners/apply` self-onboarding form for Trainer/Influencer/Dietician/Doctor (manual admin approve), CSV payout export from admin + monthly payout cron (manual UPI transfer for v1 — Decision #122), tax field UI (PAN/GST/bank fields exist in schema, no UI yet — schema-only per founder direction).**

### Decisions
- **#115 — Build all 8 partner types in schema, UI ships in 3 staggered sub-phases.** Compromise between founder's "all 8 now" and Decision #66 filter. Schema doesn't lock anything in — adding a 9th type later is one enum value.
- **#116 — One Partner model handles all 8 types, polymorphic via PartnerType + per-type reward defaults.** Avoids 8 separate tables that all do 90% of the same thing. Reward differences live in `rewardType` + `rewardAmountRs`, not in table shape.
- **#117 — Customer P2P partners are lazy-created.** Every user gets a `referralCode` field at signup but the matching `Partner` row (type=CUSTOMER) is created only when their first referral fires. Keeps the Partner table light for the long tail.
- **#118 — Partner ownerUserId links to a FitFuel User account.** Partners must create an account to view their dashboard (rejected the token-authed-no-login alternative — accounts give us email/phone for payout coordination + audit trail). Customer P2P: ownerUserId = the customer's own User.id.
- **#119 — First-touch attribution with manual override.** Cookie `ff_ref` (30 days) captured from `?ref` query param. Server's `Order.referralAttribution` is set once and not overwritten — first wins. Manual entry at checkout overrides any cookie. Self-referral guard rejects at lookup.
- **#120 — Reward processing is idempotent via PartnerReferral.refereeOrderId.** Existing row = skip and return early. Safe to retry / re-fire from any path (PayU webhook retry, admin manual re-trigger, etc.).
- **#121 — Per-type defaults in admin form (TYPE_DEFAULTS matrix), admin can override per-partner.** Customer=CREDIT/₹500/₹200; Gym=MEAL_VOUCHER/5/₹200; Trainer=CASH/₹500/₹200; Influencer=CASH/₹750/₹200; Dietician=CASH/₹1000/₹200; Doctor=CASH/₹1500/₹200; Corporate=DISCOUNT_ONLY; Residence=HYBRID/₹200/₹200. Defaults move with the type select; admin can edit before save.
- **#122 — Cash payouts via CSV export + manual UPI for v1.** Rejected Razorpay payouts API (₹3/payout fee, KYC overhead) for an unproven channel. CSV from `/admin/partners` → batch UPI in business banking app → mark paid in admin. Automate when volume justifies it.
- **#123 — Trainer/Influencer/Dietician/Doctor approval is manual, not auto.** Founder explicitly chose "slower, safer" — every cash-paying partner is reviewed before activation. Self-onboarding via `/partners/apply` (17C) creates PENDING rows; admin promotes to ACTIVE.
- **#124 — Tax fields (PAN, GST, bank) exist in Partner schema but no UI in 17A.** Founder will handle off-system for now. Schema-ready means launch-day legal compliance isn't a code rebuild.
- **#125 — Customer P2P WhatsApp share uses the user's own WhatsApp**, not WAHA. `wa.me/?text=` deeplink opens their app with prefilled message. Zero infra cost, infinite reach, organic.
- **#126 — QR codes rendered server-side with `qrcode` npm package.** Picked over free QR API (api.qrserver.com) for reliability + no third-party dependency on a marketing-critical surface (printed posters in gyms can't 404). Native SVG/PNG.
- **#127 — JSX unicode rendering gotcha (reaffirms #67/#102).** Escape sequences like `\u2014` inside JSX text content are NOT processed by JSX — passed as literal characters. Fix = real Unicode characters in source (—, ·, ₹) OR `{'\u2014'}` expression form. Hit it on PartnersClient.tsx; may exist in other UIs (notifications, dispatch) — fix opportunistically when touched.
- **#128 — Stagger Phase 17 across 3 sub-phases (17A/B/C), not one batch.** 15+ files in one drop = guaranteed bug surface and unverifiable. Schema + admin first (17A) → customer/partner-facing surfaces (17B) → payout automation + polish (17C). Each ships and verifies before the next starts.

---

## PROGRESS SUMMARY (Jun 13, 2026)

> Previous snapshots preserved above; Jun 13 figures added.

### Jun 13 — current
| Category | Done | Total | % |
|----------|------|-------|---|
| Phases 0–11 | ✅ | ✅ | 100% |
| Phase 12 (AI Trainer) | scope locked, PARKED | — | deferred |
| Phase 13 (Digital Plans) | build-complete, not yet verified-closed | ✅ | 95% |
| Phase 14 (Blog/FAQ/Testimonials) | ✅ | ✅ | 100% |
| Phase 15 (Admin Command Center) | ✅ | ✅ | 100% |
| Phase 16 (Notifications — Email) | ✅ | ✅ | 100% (WhatsApp deferred post-launch) |
| Phase 17 (Partner/Referral) | 17A ✅ / 17B 🚧 / 17C ⏳ | 3 sub-phases | 33% |
| Meal Plans in DB | 119 | 119 | 100% |
| Recipe Seeds (DB verified) | 1 | 119 | 1% (parallel track) |
| Active Subscribers | 10 (weight-loss-veg) | — | live |

**Current focus: PHASE 17B in progress. Branded `/p/[code]` landing pages, customer referrals tab, partner dashboard, QR generator. After 17B verifies → 17C (self-onboarding + payout cron). Recipe seeding remains parallel.**

**Open items rolling forward:**
- `cycleLengthDays` 30-vs-60 moat decision (still open)
- Confirm 10 repointed subscribers are real vs test
- Bulk-add remaining recipe photos
- Phase 13 end-to-end live purchase verification (still pending real ₹ transaction)
- Vercel Blob PDF cache, brand fonts, CA/GST, final pricing (Phase 13 carryovers)
- WAHA setup on Oracle Cloud Free Tier (post-launch, unblocks WhatsApp side of Phase 16)
- Resend domain verification → switch from `onboarding@resend.dev` to `hello@fitfuel.in`
- Per-user notification preferences UI on `/dashboard/settings`
- Phase 18+ scope not yet detailed
---

## ═══════════ PHASE 17B — COMPLETION + BUG FIXES ═══════════
### Session: Jun 13–14, 2026 · additions-only · Decisions #129

> **Jun 13 — PHASE 17B SHIPPED + VERIFIED LIVE.** All 4 surfaces working: `/p/[code]` polymorphic branded landing (P2P + 7 partner types), `/dashboard/referrals` (WhatsApp share + credit balance + referees list), `/dashboard/partners` (B2B partner conversions + payouts), admin QR generator on partner detail. Three fixes after first deploy:

> **Fix 1 — Sticky-navbar overlap on all 17B surfaces.** Pages used `padding: "32px 16px 64px"`, but the global navbar is sticky and ~80px tall. Headlines were rendering behind the nav links (e.g., "Refer friends, earn credit" overlapping "Meal Plans"). Bumped to `padding: "72px 16px 80px"` on the outer wrapper of LandingClient, ReferralsClient, and PartnerDashboardClient. Also upgraded the "YOU'RE INVITED" ribbon to a pill badge with lime border + subtle bg, and the hero meta row to chip pills with auto-capitalized addresses.

> **Fix 2 — Server-Component cookie write threw 500 (CRITICAL).** Original `/p/[code]/page.tsx` called `cookies().set()` inside a Server Component to drop the `ff_ref` first-touch cookie. **Next.js 16 throws at runtime: "Cookies can only be modified in a Server Action or Route Handler."** Result: every `/p/<code>` URL returned `ERROR 2923729500` (Vercel 500). Fix = move the cookie write to the client. `LandingClient` now sets `ff_ref` via `document.cookie` in a `useEffect` on mount (first-touch logic intact: only writes if cookie absent). Bot/no-JS visits lose attribution — acceptable trade for the meal-delivery audience.

> **Fix 3 — Dashboard tiles + server-side `isPartnerOwner` gate.** Initially planned as `_EDITS.md` patches to `DashboardClient.tsx` (1181 lines, too risky for blind patches). Founder requested direct edit + server-side hide. Implementation: added 2 lucide icons (Gift, Briefcase), `isPartnerOwner?: boolean` prop to `DashboardClient`, new "Refer + Earn" tile (always shows) and "Partner Dashboard" tile (conditional `{isPartnerOwner && ...}`). Server-side check in `app/dashboard/page.tsx`: 4th parallel Promise `db.partner.findUnique({ where: { ownerUserId: userId }})` → `isPartnerOwner = !!row && row.type !== "CUSTOMER"` → passed as prop. Non-partners (incl. P2P CUSTOMER partners) never see the Partner Dashboard tile.

> **PHASE 17B STATUS: ✅ COMPLETE (Jun 13, 2026).**

### Decisions
- **#129 — Server Components in Next.js 16 cannot write cookies.** Calling `cookies().set()` from a Server Component throws a runtime 500 ("Cookies can only be modified in a Server Action or Route Handler"). For attribution cookies on landing pages, set client-side from `useEffect`. Server-only verification: keep cookie reads in Server Components (those are allowed), only writes are blocked. Loss = bots and no-JS visits won't be attributed; gain = correctness + zero special-casing. Pattern applies to any future landing/redirect surface that needs to drop a cookie.

---

## ═══════════ PHASE 17C — PARTNER ONBOARDING + PAYOUTS + CREDIT AT CHECKOUT ═══════════
### Session: Jun 13–14, 2026 · additions-only · Decisions #130–#138

> **Jun 13 — PHASE 17C SPLIT INTO 17C-1 + 17C-2.** Original 17C scope from #128: self-onboarding, credit at checkout, CSV payout export, tax UI. Credit at checkout touches 5 existing payment files (PayU init × 2, PayU success, COD, checkout UI), all in the live revenue path. Self-onboarding + payout export are pure additions. **Decision #133: split 17C — ship pure additions first (17C-1), verify, then touch payments (17C-2).** Same staggering rationale as #128.

> **Jun 13 — PHASE 17C-1 LIVE (Self-onboarding + Payouts + Tax fields):**
> - **`/partners/apply`** — auth-gated self-onboarding form. 7 types (Gym, Trainer, Influencer, Dietician, Doctor, Corporate, Residence) with type-specific fields (gym address, bio/specialty, qualification/clinic, hospital affiliation, company logo, society address, treasurer contact). Per-type reward defaults pre-applied (#121). Creates `Partner { status: "PENDING" }` → admin approves via existing 17A admin flow.
> - **Cash-type tax fields (Trainer/Influencer/Dietician/Doctor):** PAN (regex `^[A-Z]{5}[0-9]{4}[A-Z]$`), bank holder name, account number (6–20 digits), IFSC (regex `^[A-Z]{4}0[A-Z0-9]{6}$`) — all required for cash partners (#122). Schema already had these fields per #124; 17C-1 surfaces them in apply form + admin detail view.
> - **Staff notification:** new applicants trigger `staff_new_partner_application` template → email to OWNER + ADMIN via `notifyStaffByRoles(["OWNER","ADMIN"], ...)`.
> - **`/admin/partners` Payouts tab** — filter by status (PENDING/PROCESSING/PAID/FAILED) + period (YYYY-MM). CSV export endpoint with full bank details (`/api/admin/partners/payouts?format=csv`). Mark-paid action with payment-reference prompt → flips status to PAID, sends `partner_payout_paid` template to partner-owner.
> - **Admin detail "Payment Info" section** — surfaces PAN / account holder / account number / IFSC in 2-column grid when fields populated. Only renders when any tax field has a value (non-cash partners stay clean).

> **Jun 13 — PHASE 17C-2 BUILT (Credit at Checkout — awaiting live verification):**
> - **`/api/checkout/credit-preview`** (NEW GET) — returns `{ signedIn, balanceRs, applicableRs, newTotalRs }`. Caps `applicableRs` at `subtotal - 1` to keep PayU's ₹1 minimum.
> - **`applyCreditAtCheckout` + `recordCreditChange`** already existed in `lib/partners.ts` from 17A — no new lib code needed. `applyCreditAtCheckout` is read-only (reports what will be applied); `recordCreditChange` is the atomic ledger write + balance update.
> - **All 3 checkout paths** (COD, PayU physical, PayU digital) modified: read auth session → if signed in AND `useCredit === true` AND upserted `user.id === session.user.id` → call `applyCreditAtCheckout(user.id, total)` → reduce `chargeAmountRs` → recompute PayU hash with new amount → stamp `Order.creditAppliedRs`. Credit commit (`recordCreditChange(userId, -applied, "order_payment", { refOrderId })`) fires AFTER order CONFIRMED.
> - **Idempotency for free.** PayU success route already had `if (order.status === "CONFIRMED") return early` guard. That same guard prevents double-commit on webhook retries / user double-clicks. COD is single-shot synchronous (no retry path). Both safe.
> - **Checkout UI (`/checkout` + `/checkout/digital`):** "Apply ₹X credit" toggle (auto-checked, lime-bordered card), summary row shows the deduction, total updates live. Toggle only renders for signed-in users with `balanceRs > 0` (guests don't see it). Sends `useCredit: useCredit && creditApplicable > 0` in submit body.
> - **Architecture safety nets:**
>   - Credit applies only when `session.user.id === user.id` (upserted customer) — prevents one user's credit being applied to another's order via email mismatch.
>   - ₹1 minimum guard (PayU rejects ₹0) — if credit ≥ total, cap so user pays at least ₹1.
>   - Refund handling deferred to manual admin (#138).

> **PHASE 17 STATUS: ✅ 17A / ✅ 17B / ✅ 17C-1 / 🔄 17C-2 awaiting verification.** Phase 17 complete on 17C-2 verification.

### Decisions
- **#130 — Prisma 7 seed scripts MUST construct the client with the PrismaPg adapter.** Bare `new PrismaClient()` throws `PrismaClientInitializationError: needs to be constructed with a non-empty, valid PrismaClientOptions`. Standalone seed pattern: `import { Pool } from "pg"; import { PrismaPg } from "@prisma/adapter-pg"; import "dotenv/config"; const pool = new Pool({ connectionString: process.env.DATABASE_URL! }); const adapter = new PrismaPg(pool); const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);` — matches `lib/prisma.ts`. Also requires `import "dotenv/config"` for tsx to pick up `.env.local`.
- **#131 — Reaffirms #61: never write Prisma `.create()` / `.upsert()` / `.update()` without first reading the actual model in schema.prisma.** Cost real round-trip on `NotificationTemplate` (I invented `templateKey` / `subject` / `bodyHtml` / `bodyText`; actual fields are `key` / `category` (required) / `channel` / `isStaff` / `emailSubject` / `emailBody`). Would have been zero cost if schema was checked first.
- **#132 — Staff broadcast notifications go through `notifyStaffByRoles(roles[], templateKey, vars)`, NOT `fireNotification` with a made-up `roleScope` field.** `fireNotification({ ..., roleScope })` silently does nothing — `roleScope` is not a recognized input. `notifyStaffByRoles` queries `User.findMany({ role: { in: roles } })` and fires one `fireNotification` per staff user. Pattern is one-recipient-per-call; role-fanout is the helper's job.
- **#133 — Split 17C into 17C-1 (additions only) + 17C-2 (payment flow edits).** Same logic as #128 staggering. 17C-1 = `/partners/apply` + Payouts CSV/mark-paid + tax-field UI (zero existing-file mutations except 3 small patches to PartnersClient). 17C-2 = credit at checkout (touches 5 live payment-flow files). Ship + verify 17C-1 → then touch payments with a clean baseline.
- **#134 — Partner ownership = unique constraint on User.** `Partner.ownerUserId` is unique — one User can own at most one Partner row. P2P customer auto-creates a CUSTOMER-type Partner on first referral conversion (#117). If a Customer-type user later applies via `/partners/apply` for a non-CUSTOMER type, the form blocks them with 409 "You already have a partner application" (existing CUSTOMER Partner blocks promotion). Future-proofing: founder may want a CUSTOMER → TRAINER upgrade path; for now, manual admin migration.
- **#135 — Per-user notification templates carry `isStaff` flag in schema.** `NotificationTemplate.isStaff: Boolean @default(false)` separates staff broadcasts from customer-facing templates. Useful for filtering in `/admin/notifications` template editor + safety check (don't accidentally send `staff_new_order` to a customer). 17C-1 used `isStaff: true` for `staff_new_partner_application`, `isStaff: false` for `partner_payout_paid`.
- **#136 — Tax field UI surface gating: schema-level fields hidden in detail view until populated.** `PartnerDetailView` only renders the "PAYMENT INFO" block if `panNumber OR bankAccountName OR bankAccountNumber OR bankIfsc` has a value. Non-cash partner types (GYM/CORPORATE/RESIDENCE) never collected these → block stays hidden → admin detail view stays clean. No need to gate by partner type explicitly — presence check is enough and self-heals if a non-cash partner later gets tax fields manually populated.
- **#137 — Credit at checkout = post-GST application, not pre-GST.** Credit reduces the final amount user pays (post-GST total), not the subtotal. Math: `creditAppliedRs = min(balance, postGstTotal - 1)`, `chargeAmount = postGstTotal - creditAppliedRs`, store `Order.creditAppliedRs` for audit. Business rationale: merchant still owes full GST on the original sale value to the government; credit is paid from merchant margin. UI shows: Plan ₹X / GST ₹Y / FitFuel credit −₹Z / Total ₹(X+Y-Z). All 3 checkout paths (COD + PayU physical + PayU digital) follow the same math.
- **#138 — Credit refund handling deferred to manual admin for v1.** If a credit-applied order gets refunded, credit is NOT auto-restored. Reasons: (a) refund volume is currently zero (pre-launch); (b) deciding partial-refund credit-restore math (fully or proportionally?) needs real cases to inform; (c) admin can manually call `recordCreditChange(userId, +amount, "refund_restore", { refOrderId })` for any case that comes up. Revisit when first real refund happens.

---

## ═══════════ TRACKER UPDATE PROTOCOL — JUN 14 NOTE ═══════════

> Tracker file at upload time: 2210 lines. Appended Phase 17B completion (Decision #129), Phase 17C-1 (Decisions #130–#136), Phase 17C-2 (Decisions #137–#138). Lines after this append: ~2270+.
> **Additions-only enforced.** No prior lines edited or removed.

---

## PROGRESS SUMMARY (Jun 14, 2026)

> Previous Jun 13 snapshot preserved above; Jun 14 figures added.

### Jun 14 — current
| Category | Done | Total | % |
|----------|------|-------|---|
| Phases 0–11 | ✅ | ✅ | 100% |
| Phase 12 (AI Trainer) | scope locked, PARKED | — | deferred |
| Phase 13 (Digital Plans) | build-complete, not yet verified-closed | ✅ | 95% |
| Phase 14 (Blog/FAQ/Testimonials) | ✅ | ✅ | 100% |
| Phase 15 (Admin Command Center) | ✅ | ✅ | 100% |
| Phase 16 (Notifications — Email) | ✅ | ✅ | 100% (WhatsApp deferred post-launch) |
| Phase 17 (Partner/Referral) | ✅ 17A / ✅ 17B / ✅ 17C-1 / 🔄 17C-2 awaiting verify | 4 sub-phases | 95% |
| Meal Plans in DB | 119 | 119 | 100% |
| Recipe Seeds (DB verified) | 1 | 119 | 1% (parallel track) |
| Active Subscribers | 10 (weight-loss-veg) | — | live |
| Decisions logged | 138 | — | (next = #139) |

**Current focus: PHASE 17C-2 verification live on `fitfuel-eosin.vercel.app`.** Need to seed a test user with `creditsBalanceRs > 0` (via Prisma Studio or admin) and run through COD + PayU physical + PayU digital paths with credit toggle on/off. Verify `CreditLedger` row written post-CONFIRMED and `User.creditsBalanceRs` deducted. After verification → Phase 17 fully complete → move to Phase 18+.

**Open items rolling forward (refreshed Jun 14):**
- `cycleLengthDays` 30-vs-60 moat decision (still open)
- Confirm 10 repointed subscribers are real vs test
- Bulk-add remaining recipe photos
- Phase 13 end-to-end live purchase verification (still pending real ₹ transaction — could be naturally exercised during 17C-2 testing!)
- Vercel Blob PDF cache, brand fonts, CA/GST, final pricing (Phase 13 carryovers)
- WAHA setup on Oracle Cloud Free Tier (post-launch, unblocks WhatsApp side of Phase 16)
- Resend domain verification → switch from `onboarding@resend.dev` to `hello@fitfuel.in`
- Per-user notification preferences UI on `/dashboard/settings`
- Phase 17C-2 verification (TOP PRIORITY)
- Phase 18+ scope not yet detailed (likely candidates: launch readiness checklist, payment refund flow, automated payout cron, multi-outlet rollout)

---

## ═══════════ PHASE 17C-2 — VERIFIED LIVE ═══════════
### Session: Jun 14, 2026 · additions-only

> **Jun 14 — Phase 17C-2 verified working on `fitfuel-eosin.vercel.app`.** Credit balance toggle renders on `/checkout` + `/checkout/digital` for signed-in users with balance > 0. Hidden for guests. Toggle reduces total live; submit body carries `useCredit: useCredit && creditApplicable > 0`. PayU init recomputes hash with reduced amount and stamps `Order.creditAppliedRs`. Success route commits via `recordCreditChange(userId, -applied, "order_payment", { refOrderId })` AFTER status flips to CONFIRMED — protected from double-fire by the existing CONFIRMED early-return guard. ✅ COMPLETE.

> **Phase 17 STATUS: ✅ FULLY COMPLETE.** 17A schema + admin → 17B branded landings + dashboards + QR → 17C-1 self-onboarding + payouts + tax fields → 17C-2 credit at checkout, all shipped, all verified.

---

## ═══════════ PHASE 18 — SUPPLEMENTS + AFFILIATE REVENUE ═══════════
### Sessions: Jun 14, 2026 · additions-only · Decisions #139–#146

> **Jun 14 — PHASE 18 KICKED OFF.** Strategic pivot: the existing `/supplements` page (built pre-Phase 9 during ecosystem layering) was richly designed but commercially dead — 30+ products with full educational content, zero buy CTAs, zero monetization. Founder direction locked: Direct affiliate programs (not Cuelinks aggregator), MULTIPLE buy buttons per product for price compare, expand catalog beyond current 30, no admin "sale/discount badge" features for v1. This forced full DB migration (static catalog of 30 products in `lib/supplements-data.ts` can't scale to multi-network × expanded SKU count). Split into 18-1 (foundation + click tracking), 18-2 (admin CRUD + analytics), 18-3 (visual overhaul). Later pivoted to single-network in #145.

---

## ═══════════ PHASE 18-1 — DB-BACKED CATALOG + CLICK TRACKING ═══════════

> **Jun 14 — PHASE 18-1 SHIPPED + LIVE.** Schema additions: `SupplementCategory`, `Supplement` (full educational fidelity — mechanism, evidence, warnings, stacks, value rating, India availability — nothing dropped), `SupplementLink` (1:N for multi-network), `SupplementClick` (privacy-aware: hashed IPs, nullable userId for guests). Two enums: `AffiliateNetwork` (NUTRABAY, HEALTHKART, MUSCLEBLAZE, AMAZON_IN, FLIPKART, TATA_1MG, WELLNESS_FOREVER, OTHER) + `SupplementGoal` (MUSCLE_GAIN, WEIGHT_LOSS, BALANCED, PERFORMANCE).

> **Migration script** `prisma/seed-supplements.ts` ported all 46 products (later count — 30 was an early miscount of the static array) from `lib/supplements-data.ts` to DB, upserting by slug. Idempotent. Created 12 categories. Preserves all richContent fields.

> **Click redirect endpoint** `/api/supplements/click/[linkId]` — fire-and-forget logging to `SupplementClick` (non-blocking via async IIFE that DOES NOT await; if logging throws, redirect still fires); IPs SHA-256 hashed, no raw IPs in DB; 302 to `link.affiliateUrl` in <50ms.

> **DB fetcher** `lib/supplements-db.ts` — `getAllSupplements()` returns DbSupplement[] shaped to match the existing `Supplement` static type for backwards-compat with `SupplementsLanding.tsx`, plus `links` array. Sorts by category.sortOrder then supplement.sortOrder.

> **Public page** `/supplements` now reads from DB via server-side fetch. Was previously importing the 2,512-line static array.

> **CRITICAL DEBUGGING ARC — 5 fix cycles before this would actually work:**
> 1. **Turbopack pulled `pg` into client bundle** because `SupplementsLanding.tsx` (`"use client"`) imported `NETWORK_LABEL` from `lib/supplements-db.ts`, which imported `lib/prisma.ts` (Node-only `pg` driver). Fix: split into `lib/supplements-types.ts` (client-safe — types + NETWORK_LABEL) + `lib/supplements-db.ts` (now `import "server-only"`, re-exports types for ergonomic server-side use). Decision #142.
> 2. **TypeScript errors in `ApplyClient`** — untyped onChange callbacks. Fixed by typing Input/Textarea primitives.
> 3. **Migration script `PrismaClientInitializationError`** — `new PrismaClient()` bare needs adapter. Fixed via PrismaPg adapter pattern (matches `lib/prisma.ts`). Decision #130.
> 4. **Migration script field mismatch on NotificationTemplate** — invented field names. Decision #131 reaffirmed.
> 5. **Admin UI stuck on "Loading…"** — root cause: schema additions pasted locally + `db push` ran + `prisma generate` ran + build passed locally + migration ran successfully (46 products in DB), BUT `prisma/schema.prisma` was never `git add`'d. Vercel rebuilt with old schema → `prisma generate` produced client without Supplement model → 500 on any query touching the new models. Symptom invisible because local Prisma client was already correct. Fix: `git add prisma/schema.prisma && git commit && git push`. Decision #143.
> 6. **Found MORE uncommitted files** — `app/supplements/page.tsx`, `SupplementsLanding.tsx`, `lib/supplements-db.ts`, `lib/supplements-types.ts`, `app/api/supplements/`, `prisma/seed-supplements.ts`. None were ever staged because they were UNTRACKED (brand new files don't show up in `git diff`). Explicit `git add` per file fixed it. Decision #144.

### Decisions
- **#139** — Supplements catalog migrates from static `lib/supplements-data.ts` to DB-backed (Prisma). Static config remains for UI metadata only (CATEGORY_META, GOAL_META, STACKS slug-list). Triggered by: founder direction "expand + multi-network", which makes static catalog infeasible.
- **#140** — (Superseded by #145) — Initially: direct partnerships (Nutrabay/HealthKart/MuscleBlaze etc.), MULTIPLE buy buttons per product for price-compare, higher commission per click. Pivoted to single-network in #145 after seeing UI feedback.
- **#141** — Click tracking is server-side, async, non-blocking. Redirect endpoint responds in <50ms; logging fires-and-forgets to a Prisma write. Logging failure does not block revenue path.
- **#142** — Server-only modules must be isolated from client-bundled files. A `"use client"` component cannot transitively import anything that pulls Prisma (or any Node-native module: `pg`, `fs`, `dns`, etc.) — Turbopack follows the chain into the client bundle and fails resolution. Pattern: split into a client-safe types/constants file and a `import "server-only"` data-access file. The server-only file re-exports types so server-side imports stay clean.
- **#143** — Schema changes via `prisma db push` require BOTH committing `prisma/schema.prisma` to git AND deploying. Easy to forget the commit because `db push` already updated the Neon DB — but Vercel re-runs `prisma generate` from `git`'s view of the schema, producing a client that doesn't know the new models. Symptom: 500 errors on any query touching new models, while local dev works fine because local node_modules has the up-to-date client. Always `git add prisma/schema.prisma` after any `db push`. Reaffirms #69 with a new failure mode.
- **#144** — Always include explicit `git add <file-or-dir>` commands for NEW files in PowerShell drops. Modifying existing tracked files shows up under `git status` "modified" but never auto-stages — and brand-new files don't appear in `git diff` at all. The Phase 18-1 drop went through 6 verify-fix cycles before noticing four entire new files and two modified files were never pushed. Pattern from now on: PowerShell drop → `git status` check → explicit `git add` per file → commit → push.

---

## ═══════════ PHASE 18-2 — ADMIN CRUD + CLICK ANALYTICS ═══════════

> **Jun 14 — PHASE 18-2 SHIPPED + LIVE (after #143/#144 fixes).** Two tabs at `/admin/supplements`: Catalog + Analytics. Catalog tab: search by name/tagline, filter by category, "include inactive" toggle, expandable rows for inline link management. Each row shows linkCount + clickCount in headline. Link manager: add Nutrabay/HealthKart/MuscleBlaze/Amazon/Flipkart/1mg/Wellness/Other affiliate URL with price + MRP (for strikethrough) + notes (e.g. "1kg, 30 servings") + sortOrder. Edit/soft-delete inline (soft preserves click history per #138 pattern).

> **Analytics tab** — range selector 7/14/30/90 days → stat row (Total clicks · Signed-in clicks · Unique users · Top network) + daily clicks bar chart (auto-scaled) + Top networks ranked + Top 15 products by clicks. All from `/api/admin/supplements/clicks?days=N` (groupBy on supplementId + network + day buckets).

> **APIs shipped (5 routes):**
> - `GET /api/admin/supplements` (list + filter) + `POST` (create supplement)
> - `GET/PATCH/DELETE /api/admin/supplements/[id]` (per-supplement, full detail with links + 30d clicks-by-network)
> - `POST /api/admin/supplements/[id]/links` (add link, regex-validated http(s) URL)
> - `PATCH/DELETE /api/admin/supplements/links/[linkId]` (per-link, soft-delete)
> - `GET /api/admin/supplements/clicks?days=N` (analytics aggregation)

> **Two surgical edits to extend admin nav:**
> - `lib/admin-auth.ts` — added `"supplements"` to Surface type + `supplements: ["OWNER", "ADMIN"]` to SURFACE_ROLES
> - `app/admin/layout.tsx` — added `{ label: "Supplements", href: "/admin/supplements", surface: "supplements" }` to NAV array

> **Error handling regression fix mid-deploy:** initial admin client had no try/catch around fetch — if API returned non-JSON 500/403 the page hung on "Loading…" forever. Patched with try/catch + visible error banner (red box with status + body). Decision worth noting: any data-fetching client component must surface errors, not silently hang.

---

## ═══════════ PHASE 18-3 — VISUAL REDESIGN + SINGLE-NETWORK PIVOT ═══════════

> **Jun 14 — PHASE 18-3 SHIPPED + LIVE.** Triggered by founder feedback after seeing live page: "we dont have price + image on main page also on click it says nutrabay but right now i am not liking this design at all its not even generic". Also: "we are sticking to one network only so lets procceed accordingly". Three failure modes addressed:
> 1. Cards showed only emoji + name + tagline + priceRange text (no image, no real price, no buy CTA)
> 2. Modal "Where to buy" was a plain pill that didn't feel like a buy CTA
> 3. Multi-network compare strategy (#140) added UI complexity without commensurate value when only Nutrabay was approved

> **Card redesign:**
> - Image hero block (160px tall) — uses `Supplement.imageUrl` if set, falls back to large emoji with `linear-gradient(135deg, accent18, accent05)` background
> - Category badge as pill overlay (bottom-left of image) with backdrop-blur
> - Vegan icon circle overlay (bottom-right)
> - Popular badge (top-right, amber accent)
> - Content area: name (DM Sans 14/700), tagline (11/400, opacity 0.4), real price row with strikethrough MRP + green "% OFF" badge when discount exists
> - Full-width lime `Buy on Nutrabay →` button at card bottom — `stopPropagation()` past modal-open click so card body opens detail modal but button goes straight to affiliate URL
> - Image `onError` fallback to emoji (handles Nutrabay hotlink blocks)

> **Modal redesign:**
> - Hero section (top, with `linear-gradient(135deg, accent10, transparent 70%)`): 96×96 product image left + name/tagline/category-pill stacked right
> - BIG lime "Buy on Nutrabay" CTA card directly below hero — price (Syne 22/800) + MRP strikethrough + black "% OFF" badge + notes (pack size)
> - Educational content (description, benefits, dosage, evidence, warnings, India availability) stays below — preserved verbatim, this is the moat
> - Old "Estimated Price" + "Where to buy" blocks removed (replaced by integrated hero CTA)
> - X close button moved to top-right with rgba background pill

> **Admin Product Settings panel** — new section inside expanded product row, appears ABOVE the existing Affiliate Links panel:
> - Image URL input with 84×84 live preview thumbnail (image hides on `onError`)
> - Brand name input (optional, e.g. "Optimum Nutrition")
> - Featured toggle (boolean)
> - Save button — PATCHes `/api/admin/supplements/[id]` with `{ imageUrl, brandName, isFeatured }`

> **`lib/supplements-db.ts` updated to expose `imageUrl`, `brandName`, `isFeatured` in the DbSupplement mapping** so cards/modal can use them.

> **TypeScript build break mid-deploy** — local file already had `imageUrl/brandName/isFeatured` from an earlier 18-3 attempt at lines 113–115 (near `links` field); my new patch added them again at lines 74–76. Duplicate object keys → `tsc` fails: `An object literal cannot have multiple properties with the same name`. Fixed by removing my duplicates. Build then passed.

> **PHASE 18 STATUS: ✅ INFRASTRUCTURE COMPLETE. 🔄 Catalog population in progress (founder manually adding Nutrabay affiliate URLs + image URLs via admin — 0/46 products live with links at session end).**

### Decisions
- **#145** — Single-network commitment for launch v1. Direct Nutrabay affiliate at 10% commission (founder's referral code: `pranit1944`, sample URL format: `https://nutrabay.com/brand/nutrabay?ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS`). Schema still supports multi-network (could re-enable Amazon/HealthKart later) but the public UI shows ONE primary CTA per product ("Buy on Nutrabay"), not a list of merchants. Decision reflects (a) max commission rate vs Cuelinks aggregator's 8% on Nutrabay, (b) cleaner UX, (c) simpler operational overhead during launch ramp. Supersedes #140.
- **#146** — Cards now expose a direct buy CTA that stops modal-propagation. Standard product-listing UX: click the card body → opens detail modal; click the buy button → goes straight to purchase via click-tracking endpoint. Both paths log through the same `/api/supplements/click/[linkId]`.

### Affiliate Strategy Locked
- **Nutrabay direct**: https://nutrabay.com/affiliates — 10% commission on Nutrabay-brand products, ref code `pranit1944`. Founder approved + active.
- **Strategy**: catalog-stays-multi-network-in-schema, UI shows Nutrabay only. Add other networks later only if Nutrabay revenue plateaus.
- **Pending founder action**: paste actual product affiliate URLs + image URLs for priority 8 products (whey-protein, creatine-monohydrate, vitamin-d3-k2, omega-3-fish-oil, whey-isolate, magnesium-glycinate, multivitamin, ashwagandha) via admin Settings/Links panels. Each adds ~2-3 min once the workflow is established.
- **Affiliate disclosure footer** — required by Nutrabay terms + Google SEO compliance. Not yet added to `/supplements` page (carryover for Phase 19 or quick fix).

---

## ═══════════ TRACKER UPDATE PROTOCOL — JUN 14 EOD NOTE ═══════════

> Tracker at upload time: 2307 lines (started Jun 14 at ~2210). Appended: Phase 17C-2 verification + full Phase 18 (sub-phases 1, 2, 3) + Decisions #139–#146 + the painful debugging arcs that drove #142/#143/#144. Total tracker now ~2470 lines.
> **Additions-only enforced.** No prior lines edited.

---

## PROGRESS SUMMARY (Jun 14, 2026 — EOD)

> Previous Jun 14 morning snapshot preserved above; this is EOD figures.

### Jun 14 EOD — current state
| Category | Done | Total | % |
|----------|------|-------|---|
| Phases 0–11 | ✅ | ✅ | 100% |
| Phase 12 (AI Trainer) | scope locked, PARKED | — | deferred |
| Phase 13 (Digital Plans) | build-complete, not yet verified-closed | ✅ | 95% |
| Phase 14 (Blog/FAQ/Testimonials) | ✅ | ✅ | 100% |
| Phase 15 (Admin Command Center) | ✅ | ✅ | 100% |
| Phase 16 (Notifications — Email) | ✅ | ✅ | 100% (WhatsApp deferred post-launch) |
| Phase 17 (Partner/Referral) | ✅ ALL — 17A / 17B / 17C-1 / 17C-2 | ✅ | 100% |
| Phase 18 (Supplements + Affiliate) | ✅ 18-1 / ✅ 18-2 / ✅ 18-3 — INFRASTRUCTURE 100% | infrastructure done; catalog population 0/46 | 100% code, 0% populated |
| Meal Plans in DB | 119 | 119 | 100% |
| Recipe Seeds (DB verified) | 1 | 119 | 1% (parallel track) |
| Active Subscribers | 10 (weight-loss-veg) | — | live |
| Decisions logged | 146 | — | (next = #147) |

### Next phase — PHASE 19 (PROPOSED) — Plans Browse Experience + Tier Pricing Properly

Triggered by founder feedback after Phase 18 wrapped: `/plans` page is the actual launch blocker, not supplements. Reasons:
1. **Premium + Luxury tiers are hardcoded `LockedTier` components** (lines 851–873 of `app/plans/page.tsx`) — both show a waitlist modal instead of a buy button. These should be open per #ongoing strategic call.
2. **Zero connection to the 119 MealPlan rows in DB** — page shows only Standard/Premium/Luxury tier names, never plan names. Customer cannot find a plan tailored to their goal.
3. **Hardcoded STANDARD/PREMIUM/LUXURY pricing objects in TS** — ignores `PlanPrice` table which already has per-plan-per-tier pricing.
4. **No coupon input on browse experience** — coupons exist in `/api/coupon/validate` but invisible until checkout.
5. **No filter/search across 119 plans** (Weight Loss, PCOS, Diabetic, Cricket Recovery, Senior Care, etc.).

Phase 19 split proposed:
- **19-1** (next session) — Browse experience + tier unlock + coupon banner: server-rendered `/plans` page fetching all 119 active MealPlan rows from DB; group cards by category (Weight Loss, Muscle Gain, Medical, Female, Sports, Senior, Recovery); filter chips (diet + goal); each card shows emoji + name + tagline + "Starting at ₹X" (cheapest tier × cheapest duration from PlanPrice); active coupon banner pulled from DB; retire the hardcoded LockedTier section.
- **19-2** (session after) — Plan detail + tier selector + checkout integration: rebuild `/plans/[slug]` with Standard/Premium/Luxury cards using real PlanPrice data; duration + meal-frequency selector with live price; coupon code input with preview discount; "Add to plan" → checkout with full selection.

Open questions to resolve before 19-1 build:
- Does MealPlan have a `category`/`goalType` field for grouping, or must I derive from slug patterns?
- Tier comparison UX — side-by-side or toggle?
- Does PlanPrice have coverage for Standard × Premium × Luxury for all 119 plans, or is Premium/Luxury sparse (since kitchen runs Standard only currently)?
- Current state of `/plans/[slug]` — full rebuild needed or surgical additions?

**Open items rolling forward (refreshed Jun 14 EOD):**
- `cycleLengthDays` 30-vs-60 moat decision (still open)
- Confirm 10 repointed subscribers are real vs test
- Bulk-add remaining recipe photos
- Phase 13 end-to-end live purchase verification (still pending real ₹ transaction)
- Vercel Blob PDF cache, brand fonts, CA/GST, final pricing (Phase 13 carryovers)
- WAHA setup on Oracle Cloud Free Tier (post-launch, unblocks WhatsApp side of Phase 16)
- Resend domain verification → switch from `onboarding@resend.dev` to `hello@fitfuel.in`
- Per-user notification preferences UI on `/dashboard/settings`
- Phase 18 catalog population — paste affiliate URLs + image URLs for the 8 priority Nutrabay products (then expand to 46)
- Affiliate disclosure footer on `/supplements`
- **PHASE 19 — TOP PRIORITY, REVENUE BLOCKER (existing /plans page is the actual customer-facing launch surface and is broken UX)**
---

## ═══════════ PHASE 19A — PLANS CATALOG + TIER PRICING (BUILT) ═══════════
### Session: Jun 15, 2026 · additions-only · Decisions #147–#154

> Phase 19 (proposed Jun 14 EOD) split executed. This session delivered **19A** = catalog rebuild + tier-aware pricing across `/plans` and `/plans/[slug]`, backed by real `PlanPrice` data. 19B/19C (Premium/Luxury menu seeding) deferred — see open items.

### Pre-build investigation (the four open questions, answered)
1. **Categorization field?** — `MealPlan.category` (enum `PlanCategory`: STANDARD / LIFESTYLE_MEDICAL / SPORTS / CORPORATE / DIGITAL) **and** `MealPlan.subCategory` (String) both exist and are indexed. No slug-pattern derivation needed. Top-level group by `category`, sub-group by `subCategory`.
2. **Tier comparison UX?** — Resolved to: **side-by-side 3 columns on desktop, stacked on mobile** (Premium/Luxury → waitlist, not buy).
3. **PlanPrice coverage?** — Coverage SQL run twice (first via `productId` join = misleading 0; corrected via `mealPlanId`). **Actual DB state: 126 MealPlans** (not 119 — tracker count was stale), all `tier=STANDARD`: 34 STANDARD-cat + 70 LIFESTYLE_MEDICAL + 22 SPORTS. **Zero had `productId` set.** Physical `PlanPrice` rows existed via `mealPlanId` but were unreachable from the productId-based query. Backfilled cleanly (below).
4. **`/plans/[slug]` state?** — Server page solid for single-tier display; needed PlanPrice fetch added + client pricing section rebuilt. **`/plans` page** was 992-line `"use client"` with hardcoded STANDARD/PREMIUM/LUXURY matrices, `LockedTier` waitlist gates, and ZERO links to the 126 plans — full rebuild.

### Schema changes (db push, additive)
- **`PlanPrice` `@@unique`** extended: `[mealPlanId, duration, mealsPerDay, bundle]` → `[mealPlanId, duration, mealsPerDay, bundle, isDigital]`. Root cause: digital Phase-13 STARTER rows (`isDigital:true`) collided with new physical STARTER rows (`isDigital:false`) on the same plan/duration/meals tuple. Dupe-check ran first (0 dupes on new key), then `db push --accept-data-loss` (no actual loss — pure constraint add) + `prisma generate`.
- **New model `WaitlistSignup`**: `{ id, email, tier (String "PREMIUM"|"LUXURY"), source, createdAt, updatedAt }`, `@@unique([email, tier])`, `@@index([tier])`, `@@map("waitlist_signups")`. Captures Premium/Luxury demand before those tiers are built.

### Data backfill — physical PlanPrice rows
- Script `prisma/seed-plan-prices.ts` — seeded **2,646 physical PlanPrice rows** (21 per plan × 126 plans). Each plan gets only its own `dietaryVariant`'s slice of the matrix (Jain & Vegan map to VEGETARIAN pricing, matching legacy treatment).
- Matrix mirrors the authoritative `prisma/seed.ts` `PRICE_MATRIX` exactly (incl. nonveg `monthly_ex` ₹7600 override). GST stored as 5%.
- Verified post-seed: STANDARD-cat 714 rows / LIFESTYLE_MEDICAL 1470 / SPORTS 462 = 2,646.
- Legacy `productId`-linked PlanPrice rows now redundant for the 126 MealPlan variants (the `mealPlanId` link added in Phase 9 is now the live path).

### New shared lib — `lib/plan-tier-pricing.ts`
Single source of truth for the whole matrix:
- `TIERS` (Standard available=true / Premium / Luxury available=false, each with accent + tagline)
- `DURATIONS` (7: TRIAL_DAY, WEEKLY, BI_WEEKLY, MONTHLY_EXCL_WEEKENDS, ONE_MONTH [popular], TWO_MONTH, THREE_MONTH — with day counts + legacy checkout codes)
- `MEALS` (3: BREAKFAST_LUNCH, SNACK_DINNER, ALL_FOUR — with legacy codes)
- `DIETS` (5: VEG, EGG, NON_VEG, JAIN, VEGAN — Jain first-class, with checkout legacy codes + dot colors)
- `TIER_MULTIPLIER` — **Premium = Standard × 1.25, Luxury = Standard × 1.5** (matches the vetted hardcoded matrices from the original /plans page). Premium/Luxury prices are ESTIMATES until those MealPlan rows are seeded.
- Helpers: `getStandardPrice`, `getTierPrice`, `dietToLegacy`, `dietToLabel`, `buildCheckoutUrl`.
- **Multiplier lives in ONE place** (line ~84) for easy retune when real Premium/Luxury pricing is set.

### Files shipped
- `lib/plan-tier-pricing.ts` — NEW shared pricing module (~127 lines).
- `app/plans/page.tsx` — REWRITTEN as server component. Fetches all 126 MealPlans + full physical PlanPrice rows, groups prices by `mealPlanId`, passes `pricesByPlan` to client. (was 992-line client w/ hardcoded matrices.)
- `app/plans/PlansCatalog.tsx` — NEW client component. **Configurator UX**: Step 1 diet (5) → Step 2 duration (all 7 visible) → Step 3 meals (3) → live 3-tier pricing matrix for the selected combo → browseable grid of all plans matching the selected diet, grouped by category, each card priced for the Step-2×Step-3 combo. Search + category filter. Waitlist modal for Premium/Luxury.
- `app/plans/[slug]/page.tsx` — added physical PlanPrice fetch (`where: { mealPlanId, isDigital:false, isActive:true }`), passes `prices` to client.
- `app/plans/[slug]/PlanDetailClient.tsx` — Section 08 (Pricing) rebuilt: meal-combo selector + 3-column tier comparison (Standard buyable → checkout, Premium/Luxury → waitlist modal), driven by real PlanPrice rows. Imports metadata from the new lib (removed local duplicate constants).
- `app/api/waitlist/route.ts` — NEW. POST `{email, tier}`, email validation + tier whitelist (PREMIUM/LUXURY only), upsert on `(email, tier)`.

### Design iteration arc (logged so it isn't repeated)
- v1 (rejected): generic card-grid catalog — collapsed meal variations into one "from ₹X" anchor, hid Premium/Luxury entirely. **Wrong** — destroyed the configurator UX and the visible duration/variation/tier matrix the business runs on.
- v2/v3 (rejected): restored the configurator + full matrix, but over-designed — Syne + Space Mono + Barlow Condensed (3 font families), numbered step-circles, mono eyebrow labels, 3–4px brutalist corners, glow shadows. Read as a foreign site vs the rest of FitFuel.
- **v4 (shipped)**: pulled `app/page.tsx` + `globals.css` FIRST, then matched the house design system — Inter only, `--bg-card`/`--border` tokens, 12–16px rounded corners, `.heading-*` + `.btn-secondary` utility classes, lime-as-accent restraint. Dropped 676→524 lines. Configurator function identical; skin quiet and on-brand.
- **Process lesson**: read the existing homepage + globals.css BEFORE designing a new page, not after. (Decision #154.)

### Decisions
- **#147** — Premium/Luxury are GENUINELY DIFFERENT MENUS per tier (founder-confirmed), not the same food with services bundled. Therefore `tier` correctly stays on `MealPlan`; Premium/Luxury require their own MealPlan rows + recipes (deferred to 19B/19C).
- **#148** — Every one of the 126 plans surfaces all three tiers up-front. Premium/Luxury show estimated price + waitlist CTA. Rationale: the whole point of Phase 19 was to FULLY EXPAND the tier offering, not hide it; waitlists capture demand signal that tells us which subCategories to seed Premium/Luxury for first.
- **#149** — Premium = Standard × 1.25, Luxury = Standard × 1.5 (mirrors the founder-vetted hardcoded matrices). Single multiplier constant; retune when real Premium/Luxury pricing is finalized.
- **#150** — `PlanPrice` unique key must include `isDigital` so physical + digital rows coexist on the same plan/duration/meals/bundle tuple.
- **#151** — Physical pricing links via `mealPlanId` (Phase 9 path), NOT the legacy `productId` → MealPlanProduct path. Backfill writes mealPlanId directly.
- **#152** — `/plans` is a step configurator (diet → duration → meals → tier matrix), NOT a plain card grid. All 7 durations and all 3 meal variations must be visible/selectable — this is the core purchase UX.
- **#153** — Catalog shows all 126 plans regardless of `isActive`; pricing/checkout wired for Standard. (No isActive gating on visibility at this stage.)
- **#154** — When building/redesigning any page, read the existing site's homepage + `globals.css` design tokens FIRST and match them; do not invent a new visual language.

### Verified this session
- Coverage SQL (corrected mealPlanId join): 126 plans, 2,646 physical price rows, full per-category coverage.
- Dupe-check on new unique key: 0 conflicts before push.
- All shipped files esbuild parse-checked clean before handoff (per standing rule).

### NOT yet verified (carry forward)
- Live visual smoke test of v4 catalog on Vercel (founder to confirm tone is right post-deploy).
- End-to-end Standard checkout from `/plans/[slug]` Section 08 (URL builder verified by construction; no real ₹ transaction yet).
- Waitlist write path (`/api/waitlist` → `waitlist_signups` table) — needs one live submit to confirm row lands.

### Phase 19B / 19C — deferred (blocked on recipe seeding)
- **19B** — Seed Premium MealPlan rows + recipes for top ~10–15 subCategories (weight_loss, muscle_gain, PCOS, diabetic, athletic). Add Premium to live checkout. Retune #149 multiplier with real pricing.
- **19C** — Luxury MealPlan rows + recipes for top ~5 subCategories. (AI trainer / concierge tooling — Phase 12 — needed before Luxury is sellable anyway.)
- Sibling-tier lookup on `/plans/[slug]` once Premium/Luxury rows exist (compare real menus side-by-side, not estimates).
- `/checkout` does not yet capture `planSlug` → Order attribution (param is passed but unused server-side); fix when extending the Order model.

**Open items rolling forward (refreshed Jun 15):**
- All prior Jun 14 EOD open items still stand (cycleLengthDays 30-vs-60, Phase 13 live purchase, Resend domain, Phase 18 catalog population, WAHA, etc.)
- Phase 19A live smoke test (catalog tone, Standard checkout, waitlist write) — founder verifying post-deploy
- Phase 19B/19C recipe seeding for Premium/Luxury (multi-month parallel track)
- Retune Premium/Luxury pricing multiplier (#149) when real numbers set
---

## ═══════════ COMPLETE AUDIT + WORKSTREAM RESTRUCTURE ═══════════
### Session: Jun 16–17, 2026 · additions-only · Decisions #155–#162
### Source of truth: `FITFUEL-COMPLETE-AUDIT.md` (supersedes the 4 partial audit files)

> Why this exists: four earlier partial audits (CODEBASE / DEEP / HEALTH-OS / SOURCE-OF-TRUTH) each covered only some of {vision, security, design, code} and never at equal depth — design was essentially unaudited beyond "fonts are wrong," and security never covered input-validation / rate-limiting / uploads. This session produced ONE consolidated audit covering all four dimensions, verified against actual source on `main`, and replaced phase-number chaos with permanent workstreams.

### PART 1 — VISION: does the health-OS loop close? (7 of 16 links)
| Loop link | Closes? | ID |
|---|---|---|
| Onboarding → TDEE | ✅ | |
| Onboarding → meal plan assigned | ⚠️ via purchase only | |
| Onboarding → exercise program assigned | 🔴 | LOOP-2 |
| Purchase → correct plan activated | 🔴 hardcoded weight-loss-veg | LOOP-3 |
| Eat → MealLog | ✅ | |
| MealLog → FoodEntry (one ledger) | 🔴 | LOOP-4 |
| Workout → session → kcal | ✅ | |
| Plan-linked workout | 🔴 1/126 schedules | LOOP-5 |
| Net-calorie engine | ✅ (split-ledger taint) | |
| Weigh-in → trend | ✅ (verify BLE) | |
| Plateau → recalibrate | 🔴 no engine | LOOP-6 |
| Consistency score | 🔴 workout component broken (dl LOOP-5) | |
| Weekly digest | ⚠️ verify it SENDS | |
| Supplements → personalised stack | 🔴 catalog only | LOOP-7 |
| AI trainer | ⏸️ parked (Phase 12) | |
| Plan progression | 🔴 no engine | LOOP-8 |

**The loop is the product, and it's half-wired. Every red is connective tissue, not a missing platform.**

### PART 2 — SECURITY
**✅ Verified SECURE (do not touch):** PayU reverse-hash SHA512 (rejects spoofed success); payment idempotency (CONFIRMED early-return prevents double-charge/double-activation); credit is server-authoritative (DB balance, commit only post-CONFIRMED); admin RBAC on every page (`requireSurface`) AND every route method (`requireApiRole`) across ~9 admin routes; upload endpoint restricts `allowedContentTypes` to image/* only; no server secrets in any `"use client"` file.

**🔴 FINDINGS:**
- **SEC-1 · NO rate limiting anywhere.** Zero — not login, waitlist, checkout, COD create, credit-preview. `@upstash/ratelimit` not installed though Upstash/QStash already a dep. Surface: credential stuffing, waitlist/contact spam, COD flooding, credit enumeration. **Launch-blocking.**
- **SEC-2 · No input validation layer.** No zod/yup/valibot. 14 routes read `req.json()` and use fields raw → type-confusion, oversized-payload DoS. **Launch-blocking.**
- **SEC-3 · Waitlist route is an open spam target** (Claude's own Phase 19A gap) — no captcha, no rate limit.
- **SEC-4 · Destructive guest-merge** hard-deletes Users with incomplete FK migration.
- **SEC-5 · `allowDangerousEmailAccountLinking`** set — tie to OTP-or-drop decision (#156).
- **SEC-6 · No `middleware.ts`** — no edge-level auth/throttle.
- **SEC-7/8 · Cron-auth + prod-env verification** not confirmed.

### PART 3 — DESIGN (first real design audit, not "fonts are wrong")
- **DES-1** — design system split across 11 pages (inconsistent buttons/cards/inputs/modals).
- **DES-2** — accessibility effectively absent (only ~4 aria attributes site-wide; contrast/focus/keyboard/alt unaudited). **Net-new gap (Decision #160).**
- **DES-3** — no shared breakpoints; per-page mobile behaviour unaudited (only the 19A catalog was checked).
- **DES-4** — no branded 404 / error / loading / empty states.
- **DES-5** — no sitemap/robots; homepage hardcoded with wrong stats; `/supplements` not in nav; some 404 slugs; placeholder contact.
- **DES-6** — no extracted shared component primitives.
- **DES-7** — no photography strategy. **Net-new gap (Decision #160).**
- **DES-8** — navbar / README / dependency cleanup owed.

### PART 4 — CODE / TRACKER RECONCILIATION
- Phase-number drift: "Phase 17/18/19" meant different things across original / definitive / session trackers.
- Two tracker lies corrected: **Phases 15 & 16 were marked Pending but are fully BUILT** (Decision #162); a silent OTP scope-drop was never logged (#156).
- First feature upgrade shipped this session: **`lib/workout-calories.ts`** — MET engine (`MET × 3.5 × bodyWeightKg / 200 × durationMins`) replacing the `durationMins×5 + sets×3` heuristic. *(NOTE: see Jun 21 reconciliation — this file was never committed.)*

### PART 5/6 — THE BUILD SEQUENCE (permanent workstreams; replaces phase-number chaos)
- **WS-1 Close the Loop:** (1) correct-plan-on-order [LOOP-3] (2) unify ledger MealLog→FoodEntry [LOOP-4] (3) seed all exercise schedules + assign at onboarding [LOOP-5/2, un-breaks consistency score] + wire `lib/workout-calories.ts` into finish route.
- **WS-2 Adaptive Intelligence:** recalibration engine [LOOP-6] · personalised supplement stack [LOOP-7] · plan progression [LOOP-8].
- **WS-3 Security Hardening:** rate limiting [SEC-1] · zod validation [SEC-2] · waitlist captcha/limit [SEC-3] · safe guest-merge [SEC-4] · middleware [SEC-6] · cron-auth + prod-env [SEC-7/8] · email-linking/OTP decision [SEC-5/#156].
- **WS-4 Discoverability + Design Correctness:** branded 404/error/loading + empty states [DES-4] · a11y pass [DES-2] · supplements→nav + fix 404 slugs + real contact + sitemap/robots + allergen-at-checkout + server-render homepage w/ real data [DES-5].
- **WS-5 Design Overhaul (last):** unify 11 pages [DES-1] · extract primitives [DES-6] · shared breakpoints + per-page mobile [DES-3] · photography [DES-7] · navbar+README+dep cleanup [DES-8].
- **WS-6 AI Trainer + Chatbot (ex-Phase 12, un-parked):** last — fed by a now-closed loop (precondition of Decision #85).

### Decisions
- **#155** — Replace phase-number tracking with workstreams WS-1…WS-6; build top-down.
- **#156** — OTP-or-drop decision pending; `allowDangerousEmailAccountLinking` must be resolved alongside it [SEC-5].
- **#157** — `FITFUEL-COMPLETE-AUDIT.md` covers all four dimensions at equal depth; the 4 partial audits are superseded.
- **#158** — Build WS-1→WS-6 top-down. **The plate must be correct (LOOP-3) before anything downstream is trustworthy.**
- **#159** — The complete audit is the single source of truth for outstanding work; archive/delete the four partials.
- **#160** — DES-2 (accessibility) and DES-7 (photography) are net-new gaps never previously tracked.
- **#161** — SEC-1 (zero rate limiting) and SEC-2 (zero input validation) are systemic, never-tracked, launch-blocking holes.
- **#162** — Correct the phase table: Phases 15 & 16 are DONE, not Pending.

### Open items rolling forward (refreshed Jun 16–17):
- WS-1 is the immediate frontier — start with correct-plan-on-order (LOOP-3) + wire workout-calories.ts.
- All prior open items stand (cycleLengthDays 30-vs-60, Phase 13 live purchase, Resend domain → hello@fitfuel.in, Phase 18 catalog population, recipe seeding 1/126).
- OTP-or-drop decision pending (#156).

---

## ═══════════ GITHUB RECONCILIATION (latest `main` crawl) ═══════════
### Session: Jun 21, 2026 · additions-only · Decisions #163–#166
### Method: fresh tarball of `pranitborkar98/fitfuel@main`, read actual source. Reconciles audit (memory-only) against committed code.

> **Headline: the SCHEMA is ahead of the audit; the ROUTES are behind it.** Inter-session schema work already landed the models WS-1 needs — so WS-1 is now a *wiring* job, not a *modelling* job. Three reds remain live in the route layer.

### What's already DONE in the repo (audit was stale on these)
- **`UserActivePlan` model is live and canonical** — `{ mealPlanId, orderId, currentDay (auto-inc), status, calorie/protein/carb/fatTarget, duration, mealsPerDay, deliveryWindow, isDigital, bundle, skipDates[] }`, `@@map("user_active_plans")`. Both order routes already CREATE a `UserActivePlan` (not the legacy `ActivePlan`). Good.
- **`FoodEntry.mealLogId String? @unique` + `mealLog MealLog?`** relation present. **`MealLog.foodEntry FoodEntry?`** back-reference present. The one-ledger link is *modelled* — just not *populated*.
- **`Order.userActivePlans UserActivePlan[]`** relation present (order→activation link).
- **Onboarding route** already carries a "FIX 1" guard against silently falling back to weight-loss-veg.

### What is STILL BROKEN at the route layer (WS-1 targets, verified file:line)
- **LOOP-3 🔴 — `app/api/orders/cod/route.ts:137` and `app/api/payments/payu/success/route.ts:97,148`** look up the plan by hardcoded slug `weight-loss-veg`, ignoring the purchase. **Root cause: the order request body destructures only `{ ...diet, dur, meal, price, deliveryWindow, useCredit }` — there is NO `planSlug`/`mealPlanId`.** The route physically cannot know which of the 126 plans was bought. Fix spans: (a) checkout frontend must send `planSlug`; (b) both order routes resolve `mealPlan` by that slug, with a *diet-aware* fallback (never a blind weight-loss-veg). The 19A note "/checkout passes planSlug but it's unused server-side" is the same defect.
- **LOOP-4 🔴 — `app/api/user/active-plan/meals/log/route.ts`** creates `MealLog` only (line 81); never creates the `FoodEntry`. Ledger stays split. Fix: after MealLog insert, create a linked `FoodEntry` from the recipe macros (`caloriesPerServing/protein/carbs/fat × servingMultiplier`, scaled by actual/planned grams) with `mealLogId` set. **Blocker to resolve first:** `FoodEntry` requires `foodItemId` + `mealTypeId` FKs — recipes have neither. Decide the bridge (synthetic per-recipe FoodItem, or a recipe path on FoodEntry) before writing the route.
- **workout-calories engine 🔴 — `lib/workout-calories.ts` is NOT in the repo.** Shipped Jun 16–17, never `git add`-ed (the known untracked-file trap). `app/api/user/active-plan/workout/complete/route.ts:101` still writes `caloriesBurned: today.estimatedCalories` (precomputed schedule field), not a bodyweight-aware MET calc. Fix: recreate the lib, look up latest body-metric weight, recompute on finish.
- **LOOP-5 🔴** — only the weight-loss exercise schedule is seeded (`prisma/seed-exercise-schedule-weight-loss.ts`); 1 of 126×3. Consistency score's workout component stays broken until seeded + assigned at onboarding [LOOP-2].

### Tracker state observed
- Uploaded tracker (2560 lines) is NEWEST (has 18 + 19A). Committed tracker (2307 lines) stops at 17C-2 era. **Neither contains the Jun 16–17 audit session** — it existed only in memory until this consolidation. No `*AUDIT*` files are committed to the repo.

### Decisions
- **#163** — WS-1 is reclassified from "build models" to "wire existing schema." `UserActivePlan` + `FoodEntry.mealLogId` already exist; do not re-model them.
- **#164** — LOOP-3 fix is two-sided: checkout must emit `planSlug`; order routes resolve it. The hardcoded `weight-loss-veg` fallback is replaced by a diet-aware lookup, never a blind default.
- **#165** — LOOP-4 requires a FoodItem/MealType bridge decision (recipe → FoodEntry) BEFORE coding the log route — `foodItemId`/`mealTypeId` are non-null FKs.
- **#166** — Re-commit `lib/workout-calories.ts` and `git add` it explicitly; verify presence on `main` before wiring (untracked-file trap already bit once).

### Open items rolling forward (refreshed Jun 21):
- **Immediate frontier: LOOP-3** — read `/checkout` frontend to see how plan params flow, then ship checkout + both order routes together.
- LOOP-4 blocked on #165 FoodItem/MealType bridge decision.
- Re-create + commit `lib/workout-calories.ts` (#166), then wire into `workout/complete`.
- Seed remaining 125×3 exercise schedules + assign at onboarding (LOOP-5/2).
- This session's audit + reconciliation should be committed as `FITFUEL-COMPLETE-AUDIT.md` to the repo (currently uncommitted anywhere).
- All prior open items stand.

---

## ═══════════ WS-1 IMPLEMENTATION + HEALTH-OS STRATEGY LOCK ═══════════
### Session: Jun 21, 2026 (cont.) · additions-only · Decisions #167–#179
### Reference docs added: `FITFUEL-PHASE-8-EXERCISE-SYSTEM-ANALYSIS.md`, `FITFUEL-HEALTH-OS-AICOACH-EXPANSION.md`

### PART A — SHIPPED THIS SESSION (verified on `main`, esbuild-checked, no db push)

**LOOP-3 — correct plan on order ✅ SHIPPED** (resolves the hardcoded `weight-loss-veg`)
- New `lib/resolve-purchased-plan.ts` — diet-aware resolver (planSlug → exact MealPlan → diet-variant fallback → any active; never blind default). DietVariant map veg/egg/nonveg/jain/vegan → VEG/EGG/NON_VEG/JAIN/VEGAN (schema-verified, distinct from OrderItem DietType enum).
- `planSlug` now flows end-to-end: `buildCheckoutUrl` (already emitted it) → `/checkout` reads param → COD + PayU-init POST bodies → stashed in `Order.notes` JSON → COD resolves directly, PayU success reads `meta.planSlug`. Option A carry-through (notes JSON, no schema change).
- Files: `lib/resolve-purchased-plan.ts` (new), `app/api/orders/cod/route.ts`, `app/api/payments/payu/route.ts`, `app/api/payments/payu/success/route.ts`, `app/checkout/page.tsx`. PayU success notification de-hardcoded too.

**Plan-detail CTA dead-end ✅ FIXED** (user-reported regression)
- `/plans/[slug]` hero + bottom "Start your plan" CTAs pointed to `/onboarding`; for already-onboarded signed-in users `onboarding/page.tsx` redirects to `/dashboard` → purchase dead-end. Repointed both to `#pricing` (Section 08 buy box → `/checkout?planSlug=…`). File: `app/plans/[slug]/PlanDetailClient.tsx`.
- Also observed: anonymous `/plans` fetch returned a STALE pre-19A page (login→/login, no Digital Plans, "Coming Phase 8"); source has `force-dynamic` → likely CDN/edge cache or production alias on an older build. **OPEN: verify Vercel production alias = latest commit; purge cache.**

**LOOP-4 — unified calorie ledger ✅ SHIPPED** (resolves Decision #165)
- `meals/log/route.ts`: logging a plan meal now also creates a linked `FoodEntry` (mealLogId set) so it appears in the nutrition diary. Bridges: MealType find-or-create by seeded name (BREAKFAST/LUNCH/DINNER→Breakfast/Lunch/Dinner, **SNACK→"Snacks"** plural); FoodItem = synthetic per-recipe global item (category `PLAN_RECIPE`, per100 from recipe) — **Option A**. MealLog+FoodEntry created atomically in `$transaction`.
- `lib/net-calories.ts`: `caloriesIn = plan meals (MealLog, gram-scaled grams/serving) + manual foods (FoodEntry where mealLogId IS NULL)`. Mirrors excluded → no double-count. Now consistent with `lib/progress.ts` (which already used this model) so dashboard ring and trend chart agree.

**Workout calorie engine ✅ SHIPPED** (resolves Decision #166)
- `lib/workout-calories.ts` (recreated — was never committed): MET engine `calories = MET × 3.5 × kg / 200 × min`, summed per set. MET by Exercise.category (strength 5.0; powerlifting/oly/strongman/plyo 6.0; cardio 7.0; stretching 2.5; default 4.0). Bodyweight = latest BodyMetric.weightKg → UserProfile.weightKg → 70. Explicit durationMins scales blended intensity to real clock time.
- Wired BOTH write paths: plan-finish (`workout/complete`) computes from prescription (was static `today.estimatedCalories`, kept as fallback); freeform (`workout/sessions/[id]` PATCH) now **server-authoritative** — recomputes from logged sets, overrides client-sent caloriesBurned (closed a client-trust integrity hole). `workout/burned` unchanged (just sums).
- Sanity: 70kg, 5ex×3×10, 45min strength → ~276 kcal (realistic).

**WS-1 status:** LOOP-3 ✅ · LOOP-4 ✅ · workout engine ✅ · **remaining: LOOP-5/2** (only 1 of 126×3 schedules seeded → schedule generator, see Phase 8A).

### PART B — PHASE 8: EXERCISE SYSTEM (analysis locked → `FITFUEL-PHASE-8-EXERCISE-SYSTEM-ANALYSIS.md`)
Current state = a *dictionary*, not a *system*: 873 free-exercise-db rows, **66% strength (581), only 14 cardio**, ZERO HIIT/calisthenics-as-progressions/sport; form = 2 static JPGs/exercise; schedule model hard-wired to sets×reps (can't express intervals/circuits); 1/378 schedules seeded; no recommendation/progression.
- **8A System foundation:** add `modality`/`met`/progression to Exercise; **protocol engine** (straight/superset/circuit/HIIT/Tabata/EMOM/AMRAP); **schedule generator** to seed all 126×3 (closes LOOP-5/2); backfill cardio/HIIT/calisthenics/sport/mobility content.
- **8B Intelligence:** recommendation at onboarding (LOOP-2) + progression/overload (LOOP-8).
- **8C Media:** licensed pre-rendered 3D clips for core (cheap/broad), optional interactive `react-three-fiber` glTF viewer for premium core; library/player UI redesign.
- **8D Form analysis (moat):** MediaPipe BlazePose in-browser, on-device — rep counting + joint-angle form scoring; premium; feeds loop; merges with Phase 12.

### PART C — HEALTH-OS / AI COACH EXPANSION (locked → `FITFUEL-HEALTH-OS-AICOACH-EXPANSION.md`)
Frame: brain (AI Coach) before senses (new domains). Coach = independent + proactive (Sense→Summarise→Reason→Act), NOT chatbot-first. Act layer emits structured actions back into the system (closes LOOP-6/7/8). MI framework, RAG, memory, clinical guardrails. Chatbot = a later reactive surface of the same brain.
- **Data-source reality:** web app CANNOT read HealthKit/Health Connect (native SDKs); Google Fit REST dies end-2026. → adopt a **unified wearable aggregator (evaluate Terra first)** for VERIFIED sleep/HR/HRV/CGM/cycle; manual = fallback. Verified streams = on-moat (same principle as owning the plate).
- **New domains ranked by moat:** (1) medical condition mgmt — highest (CGM vs verified meals for diabetes; cycle for PCOS; clinician export; already implied by catalog) → tracking + export only, firm "not medical advice"; (2) sleep & recovery — verified, feeds recalibration; (3) habits/routines — consistency engine generalised, cheap/sticky; (4) skincare — LIGHT, "beauty from within" on existing skin/hair plans, not a flagship.
- **No core redesign.** Two principled refactors only: `Routine` first-class abstraction (every domain one shape) + domain-pluggable **Health Score** (generalises consistency-score). Loop generalises; extend around the working heart.

### Decisions (#167–#179)
- **#167** — LOOP-3 shipped: resolvePurchasedPlan + planSlug end-to-end; weight-loss-veg hardcode removed (COD + PayU). Carry-through via Order.notes (Option A).
- **#168** — Plan-detail "Start your plan" CTAs → `#pricing` (was `/onboarding`→`/dashboard` dead-end for onboarded users).
- **#169** — LOOP-4 shipped (resolves #165): MealLog→FoodEntry mirror; net-calories unified (plan gram-scaled + manual mealLogId:null), double-count-safe; FoodItem/MealType bridge = Option A (synthetic per-recipe PLAN_RECIPE FoodItem; snack MealType = "Snacks").
- **#170** — Workout engine shipped (resolves #166): MET engine wired to plan-finish + freeform; freeform PATCH now server-authoritative.
- **#171** — Phase 8: build an exercise SYSTEM (taxonomy + protocol engine + schedule generator), not just seed schedules. Phasing 8A→8D.
- **#172** — Form fork: do BOTH — demo (pre-rendered 3D clips first; interactive glTF for premium core later) AND camera form analysis (BlazePose, on-device, the moat). Camera = 8D, merges with Phase 12.
- **#173** — Content sourcing: curate the modality/metadata gaps ourselves; license MEDIA, not metadata.
- **#174** — AI Coach decoupled from chatbot; built independent + proactive first (revises #85 framing). Chatbot = later reactive surface.
- **#175** — Wearable strategy: adopt a unified aggregator (evaluate Terra first) for verified sleep/HR/HRV/CGM/cycle; manual fallback. Driven by HealthKit/Health Connect being native-only + Google Fit REST EOL 2026.
- **#176** — Two principled refactors, NO teardown: `Routine` abstraction + domain-pluggable Health Score. Keep the working loop.
- **#177** — New-domain moat ranking: medical condition mgmt > sleep > habits > skincare(light). Medical = tracking + clinician export only (regulatory line; keep medical disclaimer).
- **#178** — Native app shell deferred; aggregator-first for web now (native is a separate later strategic call to unlock HealthKit/Health Connect directly).
- **#179** — Build sequence locked: **finish WS-1 loop first → Phase 8A schedule generator (closes LOOP-5/2)** so the loop is complete for all 126 plans → **AI Coach core (Weekly Review + recalibration LOOP-6)** as first brain proof → aggregator/sleep → medical condition mgmt → habits → skincare. Brain before senses; verified senses before self-reported; close the loop underneath the brain.

### Open items rolling forward (refreshed Jun 21, post-implementation):
- **NEXT BUILD: Phase 8A — schedule generator + exercise taxonomy** (closes LOOP-5/2, un-breaks consistency-score workout component; makes the workout loop real for all 126 plans, not 1).
- Then AI Coach core: Weekly Review + recalibration action (LOOP-6).
- Verify Vercel production alias = latest commit; purge stale anonymous `/plans` cache.
- Evaluate Terra (vs Thryve/Vital) for the wearable layer; scope OAuth + webhook ingestion.
- Recipe seeding still 1/126 (parallel track) — blocks meaningful MealLog→FoodEntry breadth and schedule generation quality.
- All prior open items stand (security WS-3 rate-limit/zod still launch-blocking; DES accessibility; OTP-or-drop #156).

---

## ═══════════ REMAINING ROADMAP (RECONCILED — single source of forward truth) ═══════════
### Added: Jun 21, 2026 · additions-only · Decision #180
### Purpose: collapse the phase-number drift into ONE unambiguous forward list. When the old roadmap table and this section disagree, THIS section wins.

### DRIFT RESOLUTION (read once)
- The original roadmap *table* (phases 15–19) shows STALE labels. Actual builds: **15 = Admin ✅ · 16 = Notifications/email ✅ · 17 = Partner/Referral ✅ · 18 = Supplements/Affiliate ✅ · 19 = Plans Catalog ✅.**
- Reused numbers buried three scope items that were **never built**: old "17 Personalised Supplement Stack" → now **LOOP-7**; old "18 Plan Progression + Recalibration" → now **LOOP-6 + LOOP-8**; old "19 Public TDEE Tool" → now **R19**.
- **Naming fix:** the exercise-system rebuild was being called "Phase 8A–D", which COLLIDES with old Phase 8 (Supplement Guide ✅). Renamed here to **EX-1…EX-4**. Old Phase 8 is untouched and done.

### REMAINING WORK — in build order

**TRACK 1 · CLOSE THE LOOP (WS-1/WS-2) — top priority, makes the moat real**
- **R1 · EX-1** — exercise taxonomy (`modality`/`met`/progression) + **protocol engine** (straight/superset/circuit/HIIT/Tabata/EMOM/AMRAP) + **schedule generator** → seeds all 126×3, closes **LOOP-5/LOOP-2**, un-breaks consistency-score workout component. **← NEXT BUILD (needs db push)**
- **R2 · EX-2** — exercise recommendation at onboarding + progression/overload → closes **LOOP-8**
- **R3 · EX-3** — media: licensed pre-rendered 3D clips for core; optional interactive glTF viewer
- **R4 · EX-4** — BlazePose camera **form analysis** (moat; on-device) → merges with AI Coach
- **R5 · LOOP-6** — adaptive recalibration engine (old "Phase 18" scope; never built)
- **R6 · LOOP-7** — personalised supplement stack (old "Phase 17" scope; affiliate catalog ✅ exists, recommender doesn't)

**TRACK 2 · AI COACH (un-parks Phase 12; independent + proactive, decoupled from chatbot — #174)**
- **R7** — Coach core: Sense→Summarise→Reason→Act; ship **Weekly Review + recalibration** first (consumes LOOP-6)
- **R8** — Coach actions deepen: progression (LOOP-8) + supplement stack (LOOP-7)
- **R9** — Chatbot surface (reactive door, LAST)

**TRACK 3 · WHOLE-PERSON EXPANSION (new senses — #175–#177)**
- **R10** — refactors: `Routine` abstraction + domain-pluggable **Health Score** (no core teardown)
- **R11** — wearable aggregator (evaluate **Terra**) → verified sleep/HR/HRV/CGM/cycle
- **R12** — sleep & recovery domain
- **R13** — **medical condition management** (highest moat; CGM/cycle via aggregator; symptom/metric logs; clinician export; tracking-only, firm "not medical advice")
- **R14** — habits/routines (consistency engine generalised)
- **R15** — skincare / beauty-from-within (LIGHT; rides on existing skin/hair plans)

**TRACK 4 · LAUNCH-BLOCKING HARDENING (WS-3) — MUST precede launch**
- **R16** — rate limiting (SEC-1) + Zod input validation (SEC-2)
- **R17** — `middleware.ts` (SEC-6), safe guest-merge (SEC-4), waitlist captcha/limit (SEC-3), cron-auth + prod-env (SEC-7/8), OTP-or-drop decision (SEC-5/#156)

**TRACK 5 · DESIGN & DISCOVERABILITY (WS-4/WS-5)**
- **R18** — a11y pass (DES-2) + branded 404/error/loading/empty states (DES-4) + supplements→nav, sitemap/robots, real contact, server-render homepage w/ real data (DES-5)
- **R19a** — design-system consolidation across 11 pages (DES-1), shared primitives (DES-6), breakpoints + per-page mobile (DES-3), photography strategy (DES-7), navbar/README/dep cleanup (DES-8)

**TRACK 6 · LAUNCH & POST-LAUNCH (old numbering, still valid)**
- **R19 · Public TDEE funnel tool** (old Phase 19 scope; onboarding has TDEE, no standalone public tool)
- **R20 · Phase 16 remainder** — WhatsApp channel (WAHA on Oracle Cloud Free Tier)
- **R21 · Phase 20** — QA, performance, DNS cutover, DPDP/legal compliance, launch readiness
- **R22 · Phase 21** — Zomato/Swiggy aggregator (post-launch growth)
- **R23 · Phase 22** — Social/Community (post-launch retention/virality)

### CARRYOVER / PARALLEL (not phases, but owed)
- **Recipe seeding 1/126** — parallel track; caps schedule-generator quality + MealLog→FoodEntry breadth. Do early.
- **Verify Vercel production alias = latest commit; purge stale anonymous `/plans` cache.**
- **Phase 18 catalog population** — manual Nutrabay URLs/images (8 priority → 46).
- **Phase 10 tail** — printable signed slip (Claude Design), driver WhatsApp notify (MSG91).
- **cycleLengthDays 30-vs-60** moat decision; **Resend domain** → `hello@fitfuel.in`.

### Decision
- **#180** — This reconciled roadmap is the single forward source of truth; the original phase table is historical. Exercise rebuild renamed EX-1…EX-4 (resolves the Phase 8 collision). LOOP-6/LOOP-7/LOOP-8 + WS-3 security are the items most at risk of being lost to drift — explicitly tracked here.

---

## ═══════════ EX-1 SHIPPED — EXERCISE SYSTEM v1 ═══════════
### Session: Jun 21, 2026 (cont.) · additions-only · Decision #181 · commit 29cc56e

**EX-1 ✅ SHIPPED — closes LOOP-5/2.** Every (subCategory × tier) across the 126 plans now has a generated 7-day workout program; the consistency-score workout component is no longer dead.

Files (committed 29cc56e):
- **schema**: `Exercise` gained `modality` (strength/cardio/hiit/calisthenics/mobility/sport), `met` (Float, real value), `progressionGroup`/`progressionLevel` + `@@index([modality])`. Pushed via `prisma db push` (live on Neon) + committed so Vercel builds with the new client.
- **`prisma/backfill-exercise-modality.ts`** — idempotent; assigns modality+met from category/equipment. Breakdown: cardio 14 · hiit 61 (plyometrics) · mobility 123 (stretching) · calisthenics ~190 (bodyweight strength) · strength ~485.
- **`lib/exercise-program.ts`** — the generator: archetype (fatloss/muscle/medical/athletic/general from subCategory keywords) × tier (STANDARD/PREMIUM/LUXURY → +days/+volume) → 7-day program of protocol blocks (straight/circuit/hiit/cardio/mobility), selecting real exercises by modality+muscle from the live pool. Deterministic per (subCategory|tier). Emits the exact day-JSON the workout routes read; MET-based per-day calorie estimate at 70kg ref (runtime recomputes per user).
- **`prisma/seed-all-exercise-schedules.ts`** — loops distinct (subCategory,tier) from MealPlan, idempotent delete+recreate (cascade), writes ExerciseSchedule + days.

Gotcha logged: standalone `tsx` scripts MUST `import "dotenv/config"` first, or `lib/prisma`'s `pg.Pool` reads an empty `DATABASE_URL` and throws `ECONNREFUSED` (pg falls back to localhost). The Prisma CLI auto-loads `.env`; raw tsx does not. (Bit us once on EX-1; fixed.)

Known fast-follows (not blocking):
- **EX-1b** — curated genuinely-new HIIT/cardio/calisthenics/sport content (free-db has only 14 cardio); programs currently draw from a thin cardio pool.
- Archetype nuance: subCategory containing both "sport" + "strength" resolves to muscle split (matcher order); tune if a pure athletic subCategory needs conditioning.
- Optional: wire `Exercise.met` into `lib/workout-calories.ts` (currently uses category-map fallback).

### Decision
- **#181** — EX-1 shipped (commit 29cc56e); LOOP-5/2 closed. Per #179 the next build is the **AI Coach core** (Weekly Review + recalibration, LOOP-6) — the loop is now complete enough to reason over. EX-2 (progression/recommendation) deferred behind the Coach: progression needs accumulated workout history that doesn't exist yet (schedule system is brand new).
---

## ═══════════ EX-1b SHIPPED — CURATED EXERCISE CONTENT ═══════════
### Session: Jun 22, 2026 · additions-only · Decision #182 · commit f27253d

**EX-1b ✅ SHIPPED.** Curated content the free-exercise-db lacks, so generated programs aren't drawing from just 14 cardio moves.

- **`prisma/seed-exercises-curated.ts`** — 79 curated exercises: cardio 16, hiit 16, calisthenics 35 (with progression chains), sport 12. All `ff-` prefixed (no collision with free-db ids), idempotent upsert.
- Sets `modality` + `met` DIRECTLY, and uses category strings the backfill ignores (`hiit`/`calisthenics`/`sport`) so a backfill re-run can't clobber them. (`cardio` category matches the backfill map anyway.)
- **Progression chains seeded** (data only — consumed later by EX-2): pushup[1→8], pullup[1→7], squat[1→6], dip[1→4], core[1→6], handstand[1→4] via `progressionGroup`/`progressionLevel`.
- Pool impact: cardio 14→~30, hiit ~77, calisthenics ~225, sport 12. `images: []` (real form media is EX-3).
- Has the `import "dotenv/config"` line (EX-1 lesson applied). Run order: free-db seed → backfill → **this** → `seed-all-exercise-schedules` (regenerate to use the richer pool).

### Decision
- **#182** — EX-1b shipped (f27253d). Curated cardio/HIIT/calisthenics(+progressions)/sport in place; schedules regenerated against the richer pool.

---

## ═══════════ BUILD-FIX — VERCEL tsc TYPE ERROR (EX-1) ═══════════
### Session: Jun 22, 2026 · additions-only · Decision #183

**Vercel build was RED across commits 29cc56e (EX-1) AND f27253d (EX-1b)** — EX-1 never actually deployed; live site stayed on the pre-EX-1 build the whole time. Schema `db push` + local seeds worked (they hit Neon directly), masking that the *app build* was broken.

- **Error**: `lib/exercise-program.ts:123 — Type 'string[]' is not assignable to type 'SlotKind[]'`. The literal `sequence` arrays inferred as `string[]`; `.slice()` returned `string[]`, not assignable to `Plan.sequence: SlotKind[]`.
- **Fix** (commit after f27253d): cast all 5 sequence arrays `([...] as SlotKind[]).slice(...)`. Verified with **real `tsc --strict` exit 0**.

### ⛔ NEW HARD RULE (root cause)
**esbuild parse-check ≠ type-check.** `next build` runs a full `tsc`. esbuild only validates *syntax*, so pure *type* errors sail through and break Vercel. **Before handing off any non-trivial TS, run an actual `tsc --strict`** (standalone for pure files; for files importing app modules, a focused `tsconfig` + type-accurate stubs for the heavy imports). This is now standard procedure, not optional.

### Decision
- **#183** — Build unblocked. "tsc-not-esbuild" is a permanent pre-handoff gate. Note: in this sandbox Prisma engine binaries (`binaries.prisma.sh`) are blocked, so the full project client can't be generated here — type-check via focused tsconfig + stubs instead.

---

## ═══════════ AI COACH CORE (SPINE) SHIPPED ═══════════
### Session: Jun 22, 2026 · additions-only · Decision #184

**The Coach's brain, minus the language — deterministic, needs NO Anthropic key.** Built as the real Sense → Summarise → Reason → Act spine. (User has no API key yet; planned post-funding.)

Files:
- **`lib/coach/types.ts`** — contracts: `WeeklySummary`, `Recalibration`, `WeeklyReview`. Designed so the LLM swap changes nothing downstream (same summary in, same review out; `source` flips `"rules"`→`"llm"`).
- **`lib/coach/weekly-summary.ts`** (Summarise) — wraps `getProgressData` + fetches `fitnessGoal`, computes a real weight-trend slope (least-squares regression over weigh-ins → kg/week; 28d window, widens to 56d/all, needs ≥2 points spanning ≥10d).
- **`lib/coach/recalibration.ts`** (Act / **LOOP-6**) — PURE engine. Compares measured rate vs the goal's target rate (LOSE −0.5, GAIN +0.25, else 0 kg/wk; tolerance band), recommends a calorie-target change. Math: 7700 kcal/kg, capped ±300/day, floored 1200. Statuses: on_track/too_slow/too_fast/stalled/wrong_direction/insufficient_data.
- **`lib/coach/weekly-review.ts`** (Reason, rules-based v1) — assembles `{headline, whatsWorking[], focusThisWeek[], recalibration, oneQuestion}` from deterministic rules (protein %, workouts, streak, weight trend, consistency). **This is the ONLY file the LLM replaces later** — swap the rules block for a Claude call on the same `WeeklySummary`.
- **`app/api/coach/weekly-review/route.ts`** (GET) — returns the review for the session user.
- **`app/api/coach/recalibration/apply/route.ts`** (POST) — server-authoritative: recomputes recalibration and applies its OWN recommended target to `UserActivePlan` + `UserProfile` (never a client-supplied number). 409 if nothing applicable.

All six **tsc --strict clean (exit 0)** against the real `ProgressData` shape before handoff.

### Decision
- **#184** — AI Coach spine shipped. **LOOP-6 RESOLVED** (recalibration engine built). LLM "Reason" layer deferred to post-funding; isolated to `weekly-review.ts`. Recalibration + summary + routes are durable (LLM-independent).

---

## ═══════════ AI COACH — WEEKLY REVIEW CARD (UI) SHIPPED ═══════════
### Session: Jun 22, 2026 · additions-only · Decision #185

**The face of the Coach spine** — completes the first full slice (engine → API → UI).

- **`app/dashboard/WeeklyReviewCard.tsx`** — self-contained `"use client"` card. Fetches `GET /api/coach/weekly-review`; renders eyebrow + headline + what's-working (lime checks) + focus-this-week (target markers) + the reflective question. When recalibration `canApply`, shows a lime-bordered panel with the rationale + **"Apply ±N kcal/day"** button → `POST /api/coach/recalibration/apply`, then confirms the new target inline. Matches house style (theme `T`, inline styles, lime `#84cc16`, lucide icons). **tsc --strict clean** with real React/lucide types.
- Wired into `DashboardClient.tsx`: `import WeeklyReviewCard from "./WeeklyReviewCard";` + `<WeeklyReviewCard />` rendered right after the consistency card.
- Integration gotcha (caught pre-push): the `<ConsistencyCard>` line was accidentally duplicated during the manual edit — render once, then `<WeeklyReviewCard />`.

### Decision
- **#185** — Coach Weekly Review card shipped; Coach slice now end-to-end. **Next build (no API key needed):** leaning **WS-3 security** (rate-limiting + zod validation — LAUNCH-BLOCKING) over a daily proactive nudge. EX-2 (progression, reads the EX-1b chains) still parked behind real workout history.
---

## ═══════════ WS-3 SECURITY — SEC-1/2/3 SHIPPED (TRACK 4 · R16) ═══════════
### Session: Jun 22, 2026 · additions-only · Decision #186

**Launch-blocking holes closed on the public attack surface (R16: rate limiting SEC-1 + Zod validation SEC-2 + waitlist SEC-3).** Built + deployed + verified live. `zod ^4.4.3` was already a dep (SEC-2 needed no install); `@upstash/ratelimit` + `@upstash/redis` added (SEC-1). Auth is Google-OAuth-only → no custom credential route to stuff; SEC-1's "login" surface = the OAuth callback, owned by NextAuth.

New shared layer:
- **`lib/rate-limit.ts`** — ONE shared limiter. Upstash sliding-window (prod) with a per-instance in-memory fallback when no Redis REST env is present (local/preview never break, never crash on a missing var). Presets: waitlist 5/10m, checkout 8/10m, couponValidate 30/5m, creditPreview 40/5m, partnerApply 5/h, mutation 60/m, read 120/m. `enforceRateLimit(req, preset, extraKey?)` → ready-made 429 + Retry-After. Reads `UPSTASH_REDIS_REST_URL`/`_TOKEN` OR Vercel KV's `KV_REST_API_URL`/`_TOKEN`.
- **`lib/validation/core.ts`** — `readJson`/`readQuery`: 32 KB byte-cap (oversized-payload DoS → 413), malformed-JSON → 400, zod `safeParse` → typed data or shaped 400.
- **`lib/validation/schemas.ts`** — schemas for every hardened route. NOTE: diet/dur/meal values are the FRONTEND keys (mirror the route `*_MAP`s), NOT the Prisma enums — keep in sync.

Hardened (rate-limit + validated, full files preserving all business logic): `waitlist` [SEC-3], `orders/cod`, `payments/payu` (hash logic untouched), `coupon/validate`, `checkout/credit-preview`, `partners/apply` (cash PAN/IFSC checks preserved). All 9 files **tsc --strict exit 0** against real zod@4 types (caught a real `PropertyKey`-path error esbuild would have shipped — reaffirms the #183 "tsc-not-esbuild" gate) + runtime schema tests green (normalization, enum rejection, coercion, defaults, positivity, passthrough).

Deploy: green. Upstash Redis DB created (Mumbai/ap-south-1), `UPSTASH_REDIS_REST_URL`/`_TOKEN` set in Vercel (all envs) + redeployed → limiter live on real Redis (not just the in-memory fallback). ⚠ Token was exposed in chat during setup → rotate in Upstash.

### Remaining WS-3 (TRACK 4 · R16/R17 — tracked, not lost to drift)
- **SEC-2 apply-list (authed/lower-risk `req.json` routes):** user/onboarding, user/profile, user/metrics, user/notification-preferences, user/deliveries, nutrition/{diary,foods,goals,water}, active-plan/meals/{log,rate}, workout/sessions*, attribute-ref → drop in the `mutation` limiter + a schema each (mechanical now the shared layer exists).
- **R17:** SEC-6 `middleware.ts` · SEC-4 safe guest-merge · SEC-5/#156 OTP-or-drop email-linking · SEC-7/8 cron-auth (the cron routes already verify QStash sig + CRON_SECRET) + prod-env audit.

### Decision
- **#186** — WS-3 SEC-1/2/3 shipped + live on the public surface (R16 substantially done). Shared rate-limit + validation layer is reusable; remaining authed-route coverage (R17) is a mechanical apply pass.

---

## ═══════════ AI COACH — PROACTIVE NUDGES (TRACK 2 · R7 extension) ═══════════
### Session: Jun 22, 2026 · additions-only · Decision #187

**The Coach goes proactive — push/email, deterministic, no API key, no new cron.** Extends the spine (#184) + Weekly Review card (#185). Verified firing in production (`coachNudges: fired 3` on a live cron trigger). In-app coach feed (`TrainerEvent` / Option B) stays deferred with Phase 12 (#85) / R9.

- **`lib/coach/nudges.ts`** — PURE detector. `detectCoachNudges(summary, recal)` → **plateau** (movement goal + flat trend OR recal `stalled`), **milestone** (target crossed, direction-aware), **missed_workouts** (active ≥3d, 0 workouts). Milestone suppresses plateau; null/thin data never fires. Reuses the WeeklySummary the spine already produces — clean seam, no new aggregation.
- **`app/api/cron/daily-nudges/route.ts`** — sections 1–3 (16C) untouched; **+section 4** (coach nudges, per active non-digital user: buildWeeklySummary → computeRecalibration → detectCoachNudges → sendNotification w/ per-(user,template) dedup) **+section 5** (`coach_low_rating`: MealLog.rating 1–2 in last ~36h). Folded into the EXISTING cron → NO new Vercel cron (Hobby 2-cron limit preserved); rides the existing QStash trigger. `maxDuration=60` for per-user headroom.
- **`prisma/seed-coach-nudge-templates.ts`** — 4 NotificationTemplate rows (`coach_plateau`/`coach_milestone`/`coach_missed_workouts`/`coach_low_rating`). EMAIL-only (WhatsApp deferred until MSG91 templates approved → flip to BOTH later), category `"nudges"` (respects `NotificationPreference.nudges`). Idempotent upsert. No schema change → no db push. Run: `npx tsx --env-file=.env.local prisma/seed-coach-nudge-templates.ts`.

Verify: all files **tsc --strict exit 0** against the real coach types; detector runtime-tested across 11 scenarios (fire + suppression both correct); live cron returned `coachNudges.fired = 3`.

### Decision
- **#187** — Coach proactive nudges live (push/email). Deterministic, LLM-independent — advances R7 beyond the Weekly Review. Next coach step toward un-park: in-app coach-message feed (`TrainerEvent`, Option B / R9) when the API key lands / Phase 12 un-parks.

---

## ═══════════ PRICING MODEL — UN-BURIED + RECONCILED INTO LIVE ROADMAP ═══════════
### Session: Jun 22, 2026 · additions-only · Decision #188

**Founder flag (Jun 22): the pricing-overhaul decision got BURIED.** It was specced Jun 3 (old "9H — Pricing Overhaul" block), but Decision #180's roadmap reorg declared the old phase table "historical" and the pricing-MODEL spec was NOT carried into the R1–R23 list → it fell into the drift gap. Re-surfacing it here as a first-class, launch-relevant roadmap item so it cannot slip again. Confirmed unbuilt by the live COD checkout (order summary shows only Plan price + GST 5%, ₹ all-in as the headline — no delivery/packaging/handling decomposition, no MRP-vs-sale framing).

### THE SPEC (founder's words, Jun 3 — verbatim intent)
"we will be adding marketing level pricing... since this is full prices we will minus the delivery + packaging + all other charges for marketing then add coupons, sale price vs buying price, each and every pricing marketing gimmick."

Four parts:
1. **Headline decomposition.** Current `PlanPrice.priceRs` rows are FULL ALL-IN prices. Marketing/display price = full − delivery − packaging − handling − other ops, so the headline reads competitive; the stripped charges are then **added back as explicit line items at checkout** (or absorbed). Requires decomposing each price into components.
2. **MRP vs sale.** Strike-through "buying price" (MRP) against the actual sale price — the classic discount visual. Both numbers per price row.
3. **Coupons.** Codes, %/flat, validity, per-plan/global, first-order, usage caps.
4. **Marketing gimmicks.** Limited-time offers, bundle pricing, first-order discounts — the full toolkit.

### STATUS RECONCILE (verified against schema + live, Jun 22)
- **Part 2 (MRP/sale): ✅ schema-ready.** `PlanPrice.mrpRs Int?` exists; coupon preview reads `mrpRs ?? priceRs`. May need consistent surfacing on `/plans` + checkout (strike-through everywhere).
- **Part 3 (coupons): ✅ ENGINE BUILT** (Phase 13D). `Coupon` model (discountType/value/maxDiscountRs/minOrderRs/appliesTo/firstOrderOnly/usageLimitGlobal+PerUser/validFrom+Until/stackable/source) + `lib/coupons.ts` + `/api/coupon/validate` + `CouponRedemption`. **GAP: zero coupon rows seeded + no admin "create coupon" UI** → "no coupon available" on the live site. Owed: admin coupon CRUD (or a seed) so coupons can actually be issued.
- **Part 1 (headline decomposition): ❌ NOT BUILT — the core missing piece.** `PlanPrice` has NO `deliveryRs`/`packagingRs`/`handlingRs`/`baseFoodRs`. Needs: (a) schema fields for cost components (`db push`, additive); (b) admin editing of components in `/admin/plans`; (c) checkout that shows the stripped headline + adds delivery/packaging/handling line items back to reach "pay" total; (d) the order-summary UI line items (cod + payu + digital paths) + the PDF "Your Numbers"/pricing surfaces. Touches the live revenue path → stage like #128/#133 (additive schema first, then touch payment files behind a flag).
- **Part 4 (gimmicks): ◐ primitives only.** `firstOrderOnly` + validity windows (Coupon), `bundle` (DigitalBundle) exist; no orchestrated limited-time/bundle/first-order offer surface or UI.

### ROADMAP PLACEMENT
- **NEW: R-PRICE (Track 6 · launch-relevant)** — pricing-model overhaul. Pre-launch marketing decision; not API/feature-blocking, but it changes how every price renders, so it must land before the public launch (R21/Phase 20) and ideally before any paid-traffic push. Sub-items: R-PRICE-a cost-component schema + admin; R-PRICE-b checkout line-item decomposition (revenue-path, staged); R-PRICE-c admin coupon CRUD + seed; R-PRICE-d consistent MRP strike-through; R-PRICE-e gimmick surface (limited-time/bundle/first-order).

### Decision
- **#188** — Pricing-model overhaul un-buried and reconciled into the live roadmap as R-PRICE. Coupon engine ✅ + mrpRs ✅ already exist; the headline cost-decomposition (delivery+packaging+handling stripped from marketing price, added back at checkout) is the missing core and is launch-relevant. Founder also notes OTHER iterations from past sessions may be similarly buried → a full past-conversation reconciliation sweep is owed (offered).

---

## ═══════════ R-PRICE — PRICING MODEL LOCKED (decomposition + GST + count-fix) ═══════════
### Session: Jun 22, 2026 · additions-only · Decision #189

**Founder locked the full pricing-display model (Jun 22). No code yet — numbers approved, build staged next.** Resolves R-PRICE-a/b/d from #188.

### THE MODEL (final, founder-confirmed)
- **Anchor = the existing real price**, GST-EXCLUSIVE. The seeded `PlanPrice.priceRs` (e.g. 1-Month Veg ALL_FOUR Standard = ₹16,999) is the pre-GST subtotal and DOES NOT CHANGE.
- **Charges are stripped from the headline, added back at checkout** (build UP, not down):
  - card shows: `MRP (struck)` → **`base`** (the low hook)
  - checkout shows: `base + delivery + packaging = subtotal (+) GST = pays`
- **base = subtotal − delivery − packaging** (derived, never typed).
- **Per-delivery basis (monthly = 30 deliveries):** delivery ₹1,500/mo, packaging ₹2,000/mo → scale by delivery count, round to ₹50. (Delivery ₹50/del, packaging ₹66.67/del.) **NOTE the swap: delivery 1500, packaging 2000** (founder corrected Jun 22).
- **MRP (struck) = 1.85 × base**, rounded to a smooth ₹X,999/₹X,499 ending.
- **GST = 5% on the FULL subtotal**, added ON TOP at checkout. ⚠ **This raises what PayU/COD collect** — 1-Month goes ₹16,999 → **₹17,849 paid**. Founder confirmed: 16,999 was always GST-exclusive; GST-inclusive total is correct.
- **Tier scaling:** charges are PHYSICAL → FIXED across tiers; only base/subtotal scale (Std 1.0 / Prem 1.25 / Lux 1.5). 1-Month base: Std 13,499 / Prem 17,749 / Lux 21,998; each +1,500+2,000+GST.
- **Digital (Starter/Pro): NO delivery, NO packaging.** base = price; card shows MRP(1.85×) struck → price; checkout adds GST only. Starter ₹499→₹299, Pro ₹1,499→₹699.

### COMPUTED TABLE (Veg ALL_FOUR Standard — the reference column)
| Duration | Del# | MRP | base(card) | +Deliv | +Pack | =Subtotal | +GST | PAYS |
|---|---|---|---|---|---|---|---|---|
| Trial Day | 1 | 999 | 650 | 50 | 50 | 750 | 38 | 788 |
| 1 Week | 7 | 7,499 | 4,100 | 350 | 450 | 4,900 | 245 | 5,145 |
| 2 Weeks | 14 | 14,999 | 8,070 | 700 | 950 | 9,720 | 486 | 10,206 |
| Mon–Fri | 22 | 20,999 | 11,310 | 1,100 | 1,450 | 13,860 | 693 | 14,553 |
| 1 Month | 30 | 24,999 | 13,499 | 1,500 | 2,000 | 16,999 | 850 | 17,849 |
| 2 Months | 60 | 47,999 | 26,000 | 3,000 | 4,000 | 33,000 | 1,650 | 34,650 |
| 3 Months | 90 | 67,999 | 36,750 | 4,500 | 6,000 | 47,250 | 2,362 | 49,612 |

### BUG FIX BUNDLED (founder approved): DELIVERY-COUNT DRIFT
Counts disagree across files — `BI_WEEKLY` 14 (cod/activate) vs 15 (plan-tier-pricing); `MONTHLY_EXCL_WEEKENDS` 26 (cod/activate) vs 22 (plan-tier-pricing). **Canonical DELIVERY_COUNT (for charge scaling) = {TRIAL_DAY:1, WEEKLY:7, BI_WEEKLY:14, MONTHLY_EXCL_WEEKENDS:22, ONE_MONTH:30, TWO_MONTH:60, THREE_MONTH:90}.** Separate latent bug noted: `DUR_DAYS` is reused for BOTH endDate calendar-span AND delivery count — for MONTHLY_EXCL these differ (span ~30 calendar days, 22 deliveries); split them when touching activation.

### BUILD PLAN (staged like #128/#133 — revenue path)
1. **schema (additive `db push`):** `PlanPrice` += `deliveryRs Int?`, `packagingRs Int?` (or compute-only via a shared lib — decide at build). 2. **`lib/pricing-decomposition.ts`** — single source: given (subtotal, durationCount, isDigital) → {mrp, base, deliveryRs, packagingRs, gstRs, total}. 3. **checkout UI** (cod + payu + digital paths) — line items + GST; PayU/COD now charge subtotal+GST. 4. **card/plan** — MRP strike-through + base headline. 5. **admin coupon CRUD + seed** (R-PRICE-c, separate). Each step tsc-gated (#183).

### Decision
- **#189** — Pricing-display model LOCKED + computed + approved. GST-exclusive anchor → +5% on top (collected total rises, founder-confirmed). Delivery ₹1,500 / packaging ₹2,000 monthly basis, scaled by canonical delivery count; base derived; MRP = 1.85×base smooth. Delivery-count drift fix bundled. Build staged, not yet started.

---

## ═══════════ R-PRICE — BUILD BATCH 1 (lib + checkout) SHIPPED ═══════════
### Session: Jun 22, 2026 · additions-only · Decision #190

**Pricing decomposition: keystone lib + main checkout built + tsc-clean. Routes untouched (display-only).**

Key de-risk realized at build time: base + delivery + packaging = subtotal (the existing `priceRs`), so the order already records subtotal/gst/total correctly — **the decomposition is PURE PRESENTATION. COD/PayU routes need NO change.** Eliminates the revenue-path risk flagged in #189.

- **`lib/pricing-decomposition.ts`** (NEW) — pure single-source: `decomposePrice({subtotalRs, duration, isDigital})` → `{mrpRs, baseRs, deliveryRs, packagingRs, subtotalRs, gstRs, totalRs}` + canonical `DELIVERY_COUNT` map + `durationKeyFromShort()`. Delivery ₹1,500/mo + packaging ₹2,000/mo scaled by count, rounded ₹50; base = subtotal − charges; MRP = 1.85× smooth; GST 5% on subtotal. **tsc --strict exit 0**; runtime-verified against the #189 table to the rupee + edge clamp (tiny price → base never ≤0).
- **`app/checkout/page.tsx`** (EDIT) — order summary now shows Plan value (struck MRP) → Base price → Delivery → Packaging → Subtotal → GST → Total. **Fixed a pre-existing bug:** COD showed "Pay at door ₹16,999 / GST collected at delivery" while the COD route already recorded ₹17,849 — now COD pay-at-door = the GST-inclusive total (matches what's recorded). Submit button, COD keep-ready note, credit-preview, and confirmation-redirect all use the GST-inclusive `grandTotal`. **tsc --strict exit 0** (real lib + stubbed app imports).

### REMAINING — R-PRICE build batch 2 (marketing display, lower risk)
- `app/plans/PlansCatalog.tsx` — card price → struck MRP + base headline (lines ~150, ~326).
- `app/plans/[slug]/PlanDetailClient.tsx` — per-duration price → MRP strike + base (lines ~978–983).
- `app/checkout/digital/page.tsx` — digital decomposition (no delivery/packaging, MRP strike + GST).
- `app/plans/digital/page.tsx` — digital card strike.
- Delivery-count drift fix in `cod`/`activate-digital`/`plan-tier-pricing` (align to canonical `DELIVERY_COUNT`; keep endDate calendar-span separate).
- R-PRICE-c: admin coupon CRUD + seed (so coupons can be issued — "no coupon available" on live).

### Decision
- **#190** — R-PRICE batch 1 (lib + main checkout) shipped, tsc-clean, routes untouched (display-only — no revenue-path risk). Batch 2 (catalog/detail/digital cards + count-fix + coupon CRUD) is the remaining marketing-display work.