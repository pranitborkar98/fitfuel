# FITFUEL — MASTER PROJECT TRACKER (DEFINITIVE)
> **Last Updated: May 30, 2026**
> **Reconciles: Master tracker (May 19) + Phase 9 tracker v1 (May 20) + Phase 9 tracker v2 + Phase 9 tracker v3 (May 26) + Vision Realignment (May 26) + Session update (May 27) + Day 2 build complete (May 27) + Day 3 build complete (May 30)**
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
| 10 | Live Delivery Tracking | ⏸️ Pending |
| 11 | Progress Tracking + Charts + Consistency Score | ⏸️ Pending |
| 12 | AI Personal Trainer + Chatbot | ⏸️ Pending |
| 13 | Digital Meal Plans (PDF/downloadable) | ⏸️ Pending |
| 14 | Blog, FAQ, Testimonials | ⏸️ Pending |
| 15 | Admin Panel + Kitchen Production Dashboard | ⏸️ Pending |
| 16 | Notifications — n8n (WhatsApp Weekly Digest + Email) | ⏸️ Pending |
| 17 | Personalised Supplement Stack + Delivery | ⏸️ Pending |
| 18 | Plan Progression Engine + Adaptive Recalibration | ⏸️ Pending |
| 19 | Referral System + Public TDEE Tool | ⏸️ Pending |
| 20 | QA, Performance, DNS cutover, Launch | ⏸️ Pending |

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
| 9D | Exercise Schedule Wiring (plan-linked, not standalone) | ❌ Not started |
| 9E | Individual Standard Plan Pages (public, full 30-day menu visible, Day 1 full recipe) | ✅ COMPLETE — May 30 (weight-loss-veg built, all 3 files verified) |
| 9F | Lifestyle / Medical Plan Pages | ❌ Not started |
| 9G | Sports Nutrition Plan Pages | ❌ Not started |
| 9H | Tier Comparison + Pricing Page | ❌ Not started |
| 9I | Public Trust Pages | ❌ Not started |
| 9J | Dashboard — Today's Meals Card | ✅ COMPLETE — verified May 30 (4 meals render, buttons work, progress bar, mobile responsive, drawer) |
| 9K | Dashboard — Meal Rating (1–5 stars + note after "I ate this") | ✅ COMPLETE — Jun 3, 2026 |
| 9L | Net Calorie Engine (meals in - workout out vs target) | ❌ Not started |
| 9M | Lightweight Recipe Admin | ❌ Not started |
| 9N | Onboarding Flow | ✅ COMPLETE — all 3 files verified May 27 |
| 9O | Homepage Sections Update | ❌ Not started |
| 9P | Meal Swap Request System | ❌ Not started |
| 9Q | Smart Weekly Grocery List | ❌ Not started |
| 9R | Consistency Score Engine | ❌ Not started |
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

---

## 9D — EXERCISE SCHEDULE WIRING (Plan-Linked, Not Standalone)

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

## 9I — PUBLIC TRUST PAGES

| Page | Route | Priority |
|------|-------|----------|
| How It Works | `/how-it-works` | Critical |
| Our Kitchen | `/our-kitchen` | High |
| Our Ingredients | `/our-ingredients` | High |
| Our Nutritionists | `/our-team` | Critical for medical plans |
| Testimonials / Results | `/results` | High |
| FAQ | `/faq` | High |
| Corporate Plans | `/corporate` | Medium |
| Refund & Cancellation | `/refund-policy` | Required |
| Terms & Conditions | `/terms` | Required |
| Privacy Policy | `/privacy` | Required |
| Medical Disclaimer | `/medical-disclaimer` | Required for medical plans |
| Allergen Policy | `/allergen-policy` | Required |

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
| G8 | FSSAI license 21523035002815 in footer | ❓ Check |
| G9 | Medical disclaimer on medical plan pages | Not needed for WL-Veg |

**7/7 gates cleared (G1–G7 all ✅). G8 FSSAI footer check is the only remaining pre-launch item.**

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

DAY 4 ← NOW:
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
app/dashboard/DashboardClient.tsx                       ← 9J meals card ✅ pushed May 27 + fixed May 30
app/plans/[slug]/page.tsx                               ← 9E server component ✅ built May 30
app/plans/[slug]/PlanDetailClient.tsx                   ← 9E full sales page ✅ built May 30
app/api/plans/[slug]/schedule/route.ts                  ← 9E public API ✅ built May 30
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

app/how-it-works/page.tsx                           ← 9I
app/our-kitchen/page.tsx                            ← 9I
app/our-team/page.tsx                               ← 9I
app/results/page.tsx                                ← 9I
app/faq/page.tsx                                    ← 9I
app/corporate/page.tsx                              ← 9I
app/refund-policy/page.tsx                          ← 9I
app/terms/page.tsx                                  ← 9I
app/privacy/page.tsx                                ← 9I
app/medical-disclaimer/page.tsx                     ← 9I
app/allergen-policy/page.tsx                        ← 9I

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
| FSSAI license 21523035002815 | Footer + /our-kitchen | ❓ Check footer |
| Medical disclaimer | All medical plan pages + /medical-disclaimer | ❌ |
| Allergen policy | /allergen-policy + checkout | ❌ |
| Nutritionist credentials | All medical plan pages | ❌ (placeholder OK until medical plans launch) |
| "Not a substitute for medical advice" | Medical plans + checkout | ❌ |
| Privacy policy | /privacy | ❌ |
| Terms & conditions | /terms | ❌ |
| Refund & cancellation | /refund-policy | ❌ |

---

## API ROUTES — PHASE 9 COMPLETE LIST

| Route | Method | Auth | Description | Status |
|-------|--------|------|-------------|--------|
| `/api/user/onboarding` | POST | Required | Save profile + create UserActivePlan | ✅ Live |
| `/api/user/active-plan` | GET | Required | Get user's current active plan | ✅ Live |
| `/api/user/active-plan/meals/today` | GET | Required | Today's 4 meals with macros | ✅ Live |
| `/api/user/active-plan/meals/log` | POST | Required | Confirm meal eaten → creates MealLog | ✅ Live |
| `/api/user/active-plan/meals/rate` | POST | Required | Rate meal 1-5 + note | ❌ |
| `/api/user/active-plan/pause` | POST | Required | Pause plan | ❌ |
| `/api/user/active-plan/skip` | POST | Required | Skip a date | ❌ |
| `/api/plans` | GET | Public | All active plans | ❌ |
| `/api/plans/[slug]` | GET | Public | Plan detail + full 30-day menu | ❌ |
| `/api/plans/[slug]/schedule` | GET | Public | Full 30-day schedule (public, no auth) | ✅ Live — May 30 |
| `/api/plans/[slug]/schedule/[day]` | GET | Public | Single day meals | ❌ |
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

---

## 9P — MEAL SWAP REQUEST SYSTEM

### What It Is
User doesn't want today's assigned meal. They can request a swap. The system shows all recipes in their plan with the same meal slot (LUNCH) and similar calories (±100 kcal). They pick one. The swap is logged. Admin sees swap frequency per recipe — high swap rate on a recipe = low preference signal, feeds into Menu Evolution (9S).

### Flow
```
User: "I don't want Palak Paneer today"
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

## 9R — CONSISTENCY SCORE ENGINE

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

## UPCOMING PHASES

| Phase | Name | How Phase 9 Enables It |
|-------|------|------------------------|
| 10 | Live Delivery Tracking | UserActivePlan.currentDay tells kitchen exactly what to pack per customer |
| 11 | Progress Tracking + Charts + Consistency Score | MealLog + WorkoutSession + BodyMetrics + ConsistencyScore exist — just visualise the transformation |
| 12 | AI Personal Trainer + Chatbot | Recipe DB + UserActivePlan + MealLogs + WorkoutSessions + BodyMetrics + ConsistencyScore = full context. AI knows everything. |
| 13 | Digital Meal Plans (PDF) | Pull MealPlan + schedule + Recipe from DB → generate PDF with macros, recipes, grocery list |
| 14 | Blog, FAQ, Testimonials | FAQ page in 9I — blog extends it. Testimonials with real user results from Phase 11 data |
| 15 | Admin Panel + Kitchen Production Dashboard | Recipe admin in 9M extended. Kitchen sees: tomorrow's 47 portions of Rajma, 23 Moong Chilla. Franchise SOP. |
| 16 | n8n WhatsApp Notifications + Weekly Digest | "Today's meal" push uses MealLog + PlanScheduleSlot. Weekly Digest = 9R Consistency Score + weight delta + best dish |
| 17 | Personalised Supplement Stack + Delivery | plan_category + health_condition → curated stack with doses. Premium gets stack recommendation. Luxury gets AI-refined. |
| 18 | Plan Progression Engine + Adaptive Recalibration | Weight trend flat 2 weeks → detect plateau → suggest calorie adjustment. Goal hit → suggest next plan. |
| 19 | Referral System + Public TDEE Tool | referredBy on User table. TDEE tool = top-of-funnel SEO entry point → onboarding conversion |
| 20 | QA, Performance, DNS cutover, Launch | fitfuel.in goes live |
| Online Consulting | Nutrition consulting | Nutritionist sees UserActivePlan + MealLog + BodyMetrics + ConsistencyScore — full picture |
| Franchise | Franchise portal | RecipeStep SOP + batch scaling + Kitchen Production Dashboard already built — franchise gets access |
| Corporate | B2B plans | MealPlan with corporate pricing — schema supports it. Company health benefit program. |

---

## PROGRESS SUMMARY (May 30, 2026 — End of Day 3)

| Category | Done | Total | % |
|----------|------|-------|---|
| Schema + Migrations | ✅ | ✅ | 100% |
| Meal Plans in DB | 119 | 119 | 100% |
| Recipe Seeds (DB verified) | 1 | 119 | 1% |
| Schedule Seeds (DB verified) | 1 | 119 | 1% |
| Phase 9 App Features | 7 (9N + 9J + 9K complete + 9E complete) | ~20 | 35% |
| Launch Gates Cleared | 7 | 7 | 100% (G8 FSSAI check pending) |
| Phases 0–8 | ✅ | ✅ | 100% |

**Current focus: Finish Phase 9 completely. Do not touch Phases 0-8.**
**Next action: Check FSSAI in footer (G8) → WhatsApp number in PlanDetailClient → full end-to-end test → go live**

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