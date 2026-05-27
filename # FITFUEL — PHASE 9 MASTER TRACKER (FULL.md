# FITFUEL — PHASE 9 MASTER TRACKER (v4)
> **Updated: May 26, 2026**
> **This is the single source of truth. Replaces all previous versions (v1, v2, v3).**

---

## 🔴 CRITICAL — WHAT WENT WRONG (Read Before Touching Anything)

### My mistakes — in order of severity

| # | Mistake | Impact | Fix Required |
|---|---------|--------|--------------|
| 1 | **All 35 generated recipe files are wrong** — the cuisine diversity prompt in `generate-fitfuel-seeds.ts` told OpenAI to maximise international cuisine variety. Result: diabetic plan has 1 Indian recipe out of 30. A Pune tiffin service cannot execute Japanese okonomiyaki, Korean kimchi pancakes, Peruvian citrus chicken at scale. | All 35 files are unusable as-is | Regenerate ALL 35 files with corrected generator |
| 2 | **`generate-fitfuel-seeds.ts` used OpenAI, not Claude** — the generator calls OpenAI API and has OpenAI-specific key checks | Generator needs update to use Claude API (or re-run with OpenAI key) | Fix or replace generator |
| 3 | **`NEW_ID_*` placeholders in ALL generated files** — 45 new food items (garlic, ginger, oils, spices etc.) were added in v4.1 with fake IDs. Every generated file has `GARLIC: 'NEW_ID_1'` etc. | Any file run against DB will fail with foreign key errors | Run `seed-food-items-core.ts` first to get real IDs |
| 4 | **`seed-meal-plans.ts` was never verified in DB** — file was created and never tested. We don't know if all 103 plans successfully inserted | DB may have 0 plans or partial plans | Test one plan end-to-end FIRST before anything else |
| 5 | **`seed-meal-plans.ts` is missing 10 plan slugs** — 103 plans seeded vs 113 in tracker. Missing: `anti-aging-veg`, `anti-aging-non-veg`, `vitamin-d-veg`, `vitamin-d-non-veg`, `b12-deficiency-veg`, `b12-deficiency-non-veg`, `cancer-recovery-veg`, `cancer-recovery-non-veg`, `female-athlete-sports-veg`, `female-athlete-sports-non-veg` | 10 plans have no DB record | Add missing 10 to seed-meal-plans.ts |
| 6 | **99 of 103 plans set `isActive: true`** — plans with no recipes, no schedules, and some with no seed files yet are live in the DB | Dashboard/API could show empty plans to users | Set all to `isActive: false`, flip to `true` only after recipes + schedule verified |
| 7 | **`seed-recipes-weight-loss-nv.ts` (the original 28)** — this file was run and recipes ARE in the DB, but they also use `NEW_ID_*` for new ingredients (garlic, ginger, spices etc.). Those RecipeIngredient rows point to non-existent FoodItem IDs | 28 recipes have broken ingredient links | After `seed-food-items-core.ts` runs, patch these or delete+re-seed |
| 8 | **`seed-schedule-weight-loss-nv.ts` — 30-day schedule IS in DB** but references the 28 recipes above | Schedule is intact, recipe side is broken | Fix recipes first (item 7), schedule rows are fine |

### The fundamental direction error on recipes

Your **original hand-crafted `seed-recipes.ts`** (the 28 WL-NV recipes in DB) got the cuisine split right:
- NorthIndian: 16 · Maharashtrian: 3 · SouthIndian: 3 · Continental_Indian: 3 · Mumbai Street: 1 · Bengali: 2

The **OpenAI-generated files** got it completely wrong:
- `diabetic-veg`: Japanese×5, Mediterranean×4, Turkish×3, Korean×3, Thai×3, Indian×1
- `weight-loss-non-veg`: Japanese×4, Mexican×3, Mediterranean×3, Korean×2, Thai×2... Indian×1

**FitFuel is a Pune cloud kitchen.** The correct recipe split is:
- 80% Indian regional (NorthIndian, Maharashtrian, SouthIndian, Bengali, Gujarati, Rajasthani, Punjabi, Goan, Chettinad, Malabar, Andhra, Mumbai Street)
- 20% Indian fusion using locally sourceable ingredients (Continental_Indian, IndoMediterranean with Indian substitutions)
- **Zero** recipes requiring imported pantry items: no gochujang, kimchi, miso, couscous, tahini, fresh lemongrass, avocado, edamame, rice noodles at scale

**The generator's cuisine prompt must be completely rewritten before any regeneration.**

---

## CURRENT STATE — WHAT IS ACTUALLY IN THE DB RIGHT NOW

| Item | DB Status | Notes |
|------|-----------|-------|
| `seed-meal-plans.ts` | ⚠️ UNVERIFIED — assumed run | 103 plans (not 113). Never tested. isActive=true on 99 of them |
| `seed-recipes-weight-loss-nv.ts` | ✅ 28 recipes in DB | But NEW_ID_* ingredients broken |
| `seed-schedule-weight-loss-nv.ts` | ✅ 30 days in DB | References above 28 recipes |
| All 35 other recipe seed files | ❌ NOT RUN | Wrong cuisine split anyway — need regeneration |
| 18 error files | ❌ FAILED | Never generated |
| 59 deferred plan files | ❌ NOT STARTED | |

---

## THE CORRECT FIX ORDER — DO THIS EXACTLY

### PHASE 0 — Verify DB state (do this TODAY, before anything else)

```bash
# 1. Check how many MealPlan records actually exist
npx tsx prisma/get-plan-id.ts
# Or run this query in Prisma Studio:
# SELECT slug, "isActive" FROM meal_plans ORDER BY "createdAt";

# 2. Check recipes in DB
npx tsx prisma/get-recipes.ts

# 3. Check schedule slots
# SELECT COUNT(*), meal_plan_id FROM plan_schedule_slots GROUP BY meal_plan_id;
```

**Expected: 103 MealPlan rows, 28 Recipe rows (WL-NV only), 120 PlanScheduleSlot rows (WL-NV, 30 days × 4 meals)**

If counts don't match → run the seed files again (they're idempotent — `findUnique` before `create`).

---

### PHASE 1 — Fix the food items crisis (NEW_ID_* problem)

**Step 1.1 — Create and run `seed-food-items-core.ts`**

This file does not exist yet. It needs to be created. It seeds the 45 new food items that all generated files reference with `NEW_ID_*`. Items include: garlic, ginger, green chilli, fresh coriander, mustard oil, olive oil, cumin seeds, turmeric, garam masala, capsicum, broccoli, mushrooms, sweet potato, methi, brown rice cooked, quinoa cooked, ragi flour, jowar flour, tofu, tempeh, hung curd, sesame seeds, and others.

```bash
# After creating the file:
npx tsx prisma/seed-food-items-core.ts
# → outputs real cuid IDs for all 45 new items
# → copy those IDs into FI_MAP at top of generate-fitfuel-seeds.ts
```

**Step 1.2 — Patch the 28 existing WL-NV recipes**

After step 1.1 gives real IDs, the 28 recipes in DB have RecipeIngredient rows pointing to `NEW_ID_*`. Two options:
- Option A (simpler): Delete all 28 recipes and re-run `seed-recipes-weight-loss-nv.ts` with real IDs. Since it's idempotent and schedule slots cascade, schedule will need re-seeding too.
- Option B: Run an UPDATE script to patch the broken foodItemId references in recipe_ingredients table.

**Recommendation: Option A. Delete + re-seed WL-NV recipes + schedule after IDs are fixed.**

---

### PHASE 2 — Fix the generator

**Step 2.1 — Rewrite `CUISINE_MATRIX` in `generate-fitfuel-seeds.ts`**

Replace the current international-heavy matrix with:

```typescript
const CUISINE_MATRIX = [
  // PRIMARY (80%) — Indian regional. Use these first, always.
  'NorthIndian', 'Maharashtrian', 'SouthIndian', 'Bengali', 'Gujarati',
  'Rajasthani', 'Punjabi', 'Goan', 'Chettinad', 'MalabarCoast',
  'Andhra', 'Kashmir', 'MumbaiStreet', 'Sindhi', 'Bihari',
  // SECONDARY (20%) — Indian fusion with locally sourceable ingredients only
  'Continental_Indian', 'IndoMediterranean', 'IndoChinese', 'IndoJapanese',
];
// NOTE: IndoMediterranean means dal-based hummus, not tahini.
//       IndoChinese means soy sauce + ginger + dal, not gochujang.
//       Fusion = Indian technique + global flavour profile, NOT imported ingredients.
```

**Step 2.2 — Add Pune cloud kitchen sourcing mandate to the prompt**

Add this block to `buildPrompt()`:

```
━━━ PUNE CLOUD KITCHEN SOURCING — NON-NEGOTIABLE ━━━
FitFuel operates from a cloud kitchen in Pune, Maharashtra.
Every ingredient must be available from Pune wholesale markets (APMC Pune / local mandi) in bulk.

ABSOLUTELY FORBIDDEN INGREDIENTS (cannot source at cloud kitchen scale):
❌ Tahini, miso paste, gochujang, kimchi, couscous
❌ Fresh lemongrass (dried ok in small amounts)
❌ Avocado (seasonal, expensive, not scalable)
❌ Edamame, tempeh (except limited vegan plans where explicitly planned)
❌ Rice noodles, udon noodles (exception: IndoChinese plans only)
❌ Chipotle chilli, pickled jalapeños
❌ Fresh basil (Italian), fresh dill, fresh parsley in large quantities

ALWAYS AVAILABLE IN PUNE — use freely:
✅ All Indian dals (toor, masoor, moong, chana, rajma, urad)
✅ Paneer, curd, ghee, milk, hung curd
✅ Chicken breast, chicken thigh, rohu, surmai, bombil, prawns (seasonal)
✅ All Indian vegetables: spinach, methi, bhindi, brinjal, cauliflower, capsicum,
   lauki, turai, drumstick, raw banana, raw jackfruit, beetroot, sweet potato
✅ All Indian spices: turmeric, jeera, dhania, garam masala, degi mirch, ajwain,
   mustard seeds, curry leaves, hing, black pepper, cinnamon, cardamom
✅ Rice (basmati, brown), roti/chapati flour, oats, poha, dalia, ragi, jowar, bajra
✅ Flaxseeds, sesame seeds, peanuts, almonds, cashews (Indian grown)
✅ Tomatoes, onion, garlic, ginger, green chilli, coriander, mint
```

**Step 2.3 — Update the cuisine diversity tracking logic**

Change the prompt line from "Cuisines already used (DO NOT REPEAT)" to:
```
Indian regional cuisines used this plan: [list]
Remaining Indian regional cuisines available (PRIORITISE THESE): [list]
You may use an Indian fusion style only after all regional options are exhausted for this batch.
```

---

### PHASE 3 — Test one plan end-to-end BEFORE regenerating anything

**This is the rule we should have followed from the start.**

```bash
# Step 3.1 — Regenerate ONLY weight-loss-veg using fixed generator
npx tsx generate-fitfuel-seeds.ts --plan=weight-loss-veg

# Step 3.2 — Inspect the output file
# Open output/seed-recipes-weight-loss-veg.ts
# Verify: cuisine types are Indian, no NEW_ID_* values, macros make sense
# Verify: NO tahini, NO gochujang, NO kimchi, NO couscous

# Step 3.3 — Run it
npx tsx prisma/seed-recipes-weight-loss-veg.ts

# Step 3.4 — Verify in Prisma Studio
npx prisma studio
# Check: recipes table has ~25-30 new rows
# Check: recipe_ingredients has no null foodItemId
# Check: cuisine types look Indian

# Step 3.5 — Write and run its schedule seed
npx tsx prisma/seed-schedule-weight-loss-veg.ts

# Step 3.6 — Gate check: does the dashboard card show correct data?
# Check the Today's Meals card for a test user on WL-Veg plan
```

**Only after step 3.6 passes do you proceed to batch regeneration.**

---

### PHASE 4 — Add 10 missing plans to `seed-meal-plans.ts`

Add these 10 slugs (they exist in the tracker but not in the DB):

| Slug | Category | DietVariant | Priority |
|------|----------|-------------|----------|
| `anti-aging-veg` | LIFESTYLE_MEDICAL | VEG | P2 |
| `anti-aging-non-veg` | LIFESTYLE_MEDICAL | NON_VEG | P2 |
| `vitamin-d-veg` | LIFESTYLE_MEDICAL | VEG | P2 |
| `vitamin-d-non-veg` | LIFESTYLE_MEDICAL | NON_VEG | P2 |
| `b12-deficiency-veg` | LIFESTYLE_MEDICAL | VEG | P2 |
| `b12-deficiency-non-veg` | LIFESTYLE_MEDICAL | NON_VEG | P2 |
| `cancer-recovery-veg` | LIFESTYLE_MEDICAL | VEG | P3 |
| `cancer-recovery-non-veg` | LIFESTYLE_MEDICAL | NON_VEG | P3 |
| `female-athlete-sports-veg` | SPORTS | VEG | P2 |
| `female-athlete-sports-non-veg` | SPORTS | NON_VEG | P2 |

```bash
# After adding the 10 above, re-run:
npx tsx prisma/seed-meal-plans.ts
# It's idempotent — existing plans will be upserted, new ones created
```

---

### PHASE 5 — Set all plans to isActive: false until they have data

Run this SQL in Neon console / Prisma Studio before launch:
```sql
UPDATE meal_plans SET "isActive" = false WHERE slug != 'weight-loss-non-veg';
-- Only WL-NV has verified recipes + schedule right now
-- Flip each plan's isActive to true only after its recipe seed AND schedule seed are verified
```

---

### PHASE 6 — Batch regenerate all recipe files (AFTER phases 1-5 done)

Run in P0 priority order. One at a time. Verify each before next.

```bash
# P0 — Must launch with these
npx tsx generate-fitfuel-seeds.ts --plan=weight-loss-veg      # already done in Phase 3 test
npx tsx generate-fitfuel-seeds.ts --plan=weight-loss-egg
npx tsx generate-fitfuel-seeds.ts --plan=muscle-gain-veg
npx tsx generate-fitfuel-seeds.ts --plan=muscle-gain-non-veg
npx tsx generate-fitfuel-seeds.ts --plan=pcos-veg
npx tsx generate-fitfuel-seeds.ts --plan=pcos-non-veg
npx tsx generate-fitfuel-seeds.ts --plan=diabetic-veg
npx tsx generate-fitfuel-seeds.ts --plan=diabetic-non-veg
npx tsx generate-fitfuel-seeds.ts --plan=strength-hypertrophy-veg
npx tsx generate-fitfuel-seeds.ts --plan=strength-hypertrophy-non-veg
```

**For each generated file, before running it:**
1. Open file, scan cuisine types — must be Indian-dominant
2. Grep for `NEW_ID_` — must return 0 results
3. Spot-check 2-3 recipe descriptions — should feel like a Pune tiffin menu, not a global food tour
4. Check that medical plan mandates are respected (no high-GI for diabetic, no purine-rich for gout etc.)

---

## COMPLETE PLAN CATALOGUE — ALL 113 VARIANTS (UPDATED STATUS)

### STANDARD PLANS (21 plans)

| # | Slug | Diet | kcal | Recipe File | Recipe Status | Schedule Status | isActive | Priority |
|---|------|------|------|-------------|---------------|-----------------|----------|----------|
| 1 | weight-loss-veg | VEG | 1600 | seed-recipes-weight-loss-veg.ts | 🔴 REGENERATE | ❌ | false | P0 |
| 2 | weight-loss-egg | EGG | 1600 | seed-recipes-weight-loss-egg.ts | 🔴 REGENERATE | ❌ | false | P0 |
| 3 | weight-loss-non-veg | NON_VEG | 1650 | seed-recipes-weight-loss-nv.ts | ⚠️ In DB, fix NEW_ID | ✅ 30 days | false | P0 |
| 4 | muscle-gain-veg | VEG | 2200 | seed-recipes-muscle-gain-veg.ts | 🔴 REGENERATE | ❌ | false | P0 |
| 5 | muscle-gain-egg | EGG | 2200 | seed-recipes-muscle-gain-egg.ts | 🔴 REGENERATE | ❌ | false | P1 |
| 6 | muscle-gain-non-veg | NON_VEG | 2300 | seed-recipes-muscle-gain-non-veg.ts | 🔴 REGENERATE | ❌ | false | P0 |
| 7 | balanced-veg | VEG | 1800 | seed-recipes-balanced-veg.ts | 🔴 REGENERATE | ❌ | false | P1 |
| 8 | balanced-egg | EGG | 1800 | seed-recipes-balanced-egg.ts | 🔴 REGENERATE | ❌ | false | P1 |
| 9 | balanced-non-veg | NON_VEG | 1850 | seed-recipes-balanced-non-veg.ts | 🔴 REGENERATE | ❌ | false | P1 |
| 10 | balanced-jain | JAIN | 1750 | seed-recipes-balanced-jain.ts | 🔴 REGENERATE | ❌ | false | P1 |
| 11 | intermittent-fasting-veg | VEG | 1600 | seed-recipes-intermittent-fasting-veg.ts | 🔴 REGENERATE | ❌ | false | P2 |
| 12 | intermittent-fasting-non-veg | NON_VEG | 1650 | seed-recipes-intermittent-fasting-non-veg.ts | 🔴 REGENERATE | ❌ | false | P2 |
| 13 | vegan-muscle | VEGAN | 2100 | seed-recipes-vegan-muscle.ts | 🔴 REGENERATE | ❌ | false | P2 |
| 14 | keto-indian-veg | VEG | 1600 | seed-recipes-keto-indian-veg.ts | 🔴 REGENERATE | ❌ | false | P2 |
| 15 | keto-indian-non-veg | NON_VEG | 1650 | seed-recipes-keto-indian-non-veg.ts | 🔴 REGENERATE | ❌ | false | P2 |
| 16 | body-recomp-veg | VEG | 1900 | seed-recipes-body-recomp-veg.ts | 🔴 REGENERATE | ❌ | false | P2 |
| 17 | body-recomp-non-veg | NON_VEG | 1950 | seed-recipes-body-recomp-non-veg.ts | 🔴 REGENERATE | ❌ | false | P2 |
| 18 | lean-bulk-veg | VEG | 2100 | seed-recipes-lean-bulk-veg.ts | 🔴 REGENERATE | ❌ | false | P2 |
| 19 | lean-bulk-non-veg | NON_VEG | 2150 | seed-recipes-lean-bulk-non-veg.ts | 🔴 REGENERATE | ❌ | false | P2 |
| 20 | cutting-veg | VEG | 1400 | seed-recipes-cutting-veg.ts | 🔴 REGENERATE | ❌ | false | P3 |
| 21 | cutting-non-veg | NON_VEG | 1400 | seed-recipes-cutting-non-veg.ts | 🔴 REGENERATE | ❌ | false | P3 |

---

### LIFESTYLE / MEDICAL PLANS (37 plans)

| # | Slug | Diet | Key Nutrition | Recipe Status | isActive | Priority |
|---|------|------|--------------|---------------|----------|----------|
| 22 | pcos-veg | VEG | Low GI, anti-inflammatory, hormone balance | 🔴 REGENERATE | false | P0 |
| 23 | pcos-non-veg | NON_VEG | Low GI, lean protein, omega-3 | 🔴 REGENERATE | false | P0 |
| 24 | diabetic-veg | VEG | Controlled carbs, low GI, no refined sugar | 🔴 REGENERATE | false | P0 |
| 25 | diabetic-non-veg | NON_VEG | Lean protein, controlled carbs | 🔴 REGENERATE | false | P0 |
| 26 | pre-diabetic-veg | VEG | GI management, weight normalisation | 🔴 REGENERATE | false | P1 |
| 27 | pre-diabetic-non-veg | NON_VEG | Lean protein, low GI | 🔴 REGENERATE | false | P1 |
| 28 | thyroid-veg | VEG | Goitrogen-aware, selenium, iodine | 🔴 REGENERATE | false | P1 |
| 29 | thyroid-non-veg | NON_VEG | Selenium-rich seafood, iodine | 🔴 REGENERATE | false | P1 |
| 30 | heart-health-veg | VEG | Low sat fat, omega-3, high fibre, DASH | 🔴 REGENERATE | false | P1 |
| 31 | heart-health-non-veg | NON_VEG | Omega-3 fish, lean protein | 🔴 REGENERATE | false | P1 |
| 32 | hypertension-veg | VEG | Low sodium, potassium-rich, DASH | 🔴 REGENERATE | false | P1 |
| 33 | hypertension-non-veg | NON_VEG | Low sodium, lean protein | 🔴 REGENERATE | false | P1 |
| 34 | fatty-liver-veg | VEG | Low fat, high antioxidants | 🔴 REGENERATE | false | P2 |
| 35 | fatty-liver-non-veg | NON_VEG | Lean protein, liver-supporting foods | 🔴 REGENERATE | false | P2 |
| 36 | kidney-health-veg | VEG | Low K, low P, controlled protein | 🔴 REGENERATE | false | P2 |
| 37 | kidney-health-non-veg | NON_VEG | Controlled protein, specific foods | 🔴 REGENERATE | false | P2 |
| 38 | gout-veg | VEG | Low purine, no dal, no spinach | 🔴 REGENERATE | false | P2 |
| 39 | gout-non-veg | NON_VEG | No red meat, low purine | 🔴 REGENERATE | false | P2 |
| 40 | anaemia-veg | VEG | Iron-rich, Vit C pairing, B12, folate | 🔴 REGENERATE | false | P1 |
| 41 | anaemia-non-veg | NON_VEG | Liver, iron, B12 | 🔴 REGENERATE | false | P1 |
| 42 | vitamin-d-veg | VEG | D3 food sources, fortified | ❌ NOT IN DB — ADD TO SEED FILE | false | P2 |
| 43 | vitamin-d-non-veg | NON_VEG | Fatty fish, egg yolk, fortified | ❌ NOT IN DB — ADD TO SEED FILE | false | P2 |
| 44 | b12-deficiency-veg | VEG | Fortified foods, dairy, eggs | ❌ NOT IN DB — ADD TO SEED FILE | false | P2 |
| 45 | b12-deficiency-non-veg | NON_VEG | Animal protein, fortified | ❌ NOT IN DB — ADD TO SEED FILE | false | P2 |
| 46 | obesity-veg | VEG | BMI 30+, clinical deficit | 🔴 REGENERATE | false | P1 |
| 47 | obesity-non-veg | NON_VEG | High protein, volume eating | 🔴 REGENERATE | false | P1 |
| 48 | knee-health-veg | VEG | Anti-inflammatory, collagen, Vit D | 🔴 REGENERATE | false | P2 |
| 49 | knee-health-non-veg | NON_VEG | Collagen (bone broth), omega-3 | 🔴 REGENERATE | false | P2 |
| 50 | post-surgery-veg | VEG | Soft foods, anti-inflammatory | 🔴 REGENERATE | false | P2 |
| 51 | post-surgery-non-veg | NON_VEG | Soft protein, wound healing | 🔴 REGENERATE | false | P2 |
| 52 | post-covid-veg | VEG | Lung health, immunity, fatigue | 🔴 REGENERATE | false | P2 |
| 53 | post-covid-non-veg | NON_VEG | High protein recovery | 🔴 REGENERATE | false | P2 |
| 54 | cancer-recovery-veg | VEG | High cal, easy digest, immune | ❌ NOT IN DB — ADD TO SEED FILE | false | P3 |
| 55 | cancer-recovery-non-veg | NON_VEG | Soft protein, immune support | ❌ NOT IN DB — ADD TO SEED FILE | false | P3 |
| 56 | liver-detox | VEG | Antioxidant, 21-day reset | 🔴 REGENERATE | false | P2 |
| 57 | gut-health-veg | VEG | Low-FODMAP, probiotics | 🔴 REGENERATE | false | P1 |
| 58 | gut-health-non-veg | NON_VEG | Low-FODMAP, lean protein | 🔴 REGENERATE | false | P1 |

---

### FEMALE-SPECIFIC PLANS (12 plans)

| # | Slug | Diet | Recipe Status | isActive | Priority |
|---|------|------|---------------|----------|----------|
| 59 | menopause-veg | VEG | 🔴 REGENERATE | false | P2 |
| 60 | menopause-non-veg | NON_VEG | 🔴 REGENERATE | false | P2 |
| 61 | fertility-veg | VEG | 🔴 REGENERATE | false | P2 |
| 62 | fertility-non-veg | NON_VEG | 🔴 REGENERATE | false | P2 |
| 63 | post-pregnancy-veg | VEG | 🔴 REGENERATE | false | P1 |
| 64 | post-pregnancy-non-veg | NON_VEG | 🔴 REGENERATE | false | P1 |
| 65 | pms-veg | VEG | 🔴 REGENERATE | false | P2 |
| 66 | pms-non-veg | NON_VEG | 🔴 REGENERATE | false | P2 |
| 67 | female-athlete-veg | VEG | 🔴 REGENERATE | false | P2 |
| 68 | female-athlete-non-veg | NON_VEG | 🔴 REGENERATE | false | P2 |
| 69 | hormonal-acne-veg | VEG | 🔴 REGENERATE | false | P2 |
| 70 | hormonal-acne-non-veg | NON_VEG | 🔴 REGENERATE | false | P2 |

---

### SKIN & HAIR PLANS (10 plans)

| # | Slug | Diet | Recipe Status | isActive | Priority |
|---|------|------|---------------|----------|----------|
| 71 | anti-aging-veg | VEG | ❌ NOT IN DB — ADD TO SEED FILE | false | P2 |
| 72 | anti-aging-non-veg | NON_VEG | ❌ NOT IN DB — ADD TO SEED FILE | false | P2 |
| 73 | acne-skin-veg | VEG | 🔴 REGENERATE | false | P1 |
| 74 | acne-skin-non-veg | NON_VEG | 🔴 REGENERATE | false | P1 |
| 75 | hair-health-veg | VEG | 🔴 REGENERATE | false | P1 |
| 76 | hair-health-non-veg | NON_VEG | 🔴 REGENERATE | false | P1 |
| 77 | eczema-veg | VEG | 🔴 REGENERATE | false | P2 |
| 78 | eczema-non-veg | NON_VEG | 🔴 REGENERATE | false | P2 |
| 79 | skin-glow-veg | VEG | 🔴 REGENERATE | false | P2 |
| 80 | skin-glow-non-veg | NON_VEG | 🔴 REGENERATE | false | P2 |

---

### ADDICTION & RECOVERY (5 plans)

| # | Slug | Diet | Recipe Status | isActive | Priority |
|---|------|------|---------------|----------|----------|
| 81 | quit-smoking-veg | VEG | 🔴 REGENERATE | false | P2 |
| 82 | quit-smoking-non-veg | NON_VEG | 🔴 REGENERATE | false | P2 |
| 83 | alcohol-recovery-veg | VEG | 🔴 REGENERATE | false | P2 |
| 84 | alcohol-recovery-non-veg | NON_VEG | 🔴 REGENERATE | false | P2 |
| 85 | detox-reset | VEG | 🔴 REGENERATE | false | P2 |

---

### SENIOR & KIDS (4 plans)

| # | Slug | Diet | Recipe Status | isActive | Priority |
|---|------|------|---------------|----------|----------|
| 86 | senior-veg | VEG | 🔴 REGENERATE | false | P2 |
| 87 | senior-non-veg | NON_VEG | 🔴 REGENERATE | false | P2 |
| 88 | kids-teen-veg | VEG | 🔴 REGENERATE | false | P2 |
| 89 | kids-teen-non-veg | NON_VEG | 🔴 REGENERATE | false | P2 |

---

### SEASONAL / FESTIVAL PLANS (4 plans)

| # | Slug | Diet | Recipe Status | isActive | Priority |
|---|------|------|---------------|----------|----------|
| 90 | navratri | VEG | 🔴 REGENERATE | false | P3 |
| 91 | ramadan | NON_VEG | 🔴 REGENERATE | false | P3 |
| 92 | diwali-detox | VEG | 🔴 REGENERATE | false | P3 |
| 93 | shravan | VEG | 🔴 REGENERATE | false | P3 |

---

### SPORTS NUTRITION PLANS (20 plans)

| # | Slug | Diet | Recipe Status | isActive | Priority |
|---|------|------|---------------|----------|----------|
| 94 | endurance-veg | VEG | 🔴 REGENERATE | false | P1 |
| 95 | endurance-non-veg | NON_VEG | 🔴 REGENERATE | false | P1 |
| 96 | strength-hypertrophy-veg | VEG | 🔴 REGENERATE | false | P0 |
| 97 | strength-hypertrophy-non-veg | NON_VEG | 🔴 REGENERATE | false | P0 |
| 98 | competition-prep-veg | VEG | 🔴 REGENERATE | false | P3 |
| 99 | competition-prep-non-veg | NON_VEG | 🔴 REGENERATE | false | P3 |
| 100 | sports-recovery-veg | VEG | 🔴 REGENERATE | false | P2 |
| 101 | sports-recovery-non-veg | NON_VEG | 🔴 REGENERATE | false | P2 |
| 102 | cricket-veg | VEG | 🔴 REGENERATE | false | P1 |
| 103 | cricket-non-veg | NON_VEG | 🔴 REGENERATE | false | P1 |
| 104 | football-veg | VEG | 🔴 REGENERATE | false | P2 |
| 105 | football-non-veg | NON_VEG | 🔴 REGENERATE | false | P2 |
| 106 | swimming-veg | VEG | 🔴 REGENERATE | false | P3 |
| 107 | swimming-non-veg | NON_VEG | 🔴 REGENERATE | false | P3 |
| 108 | martial-arts-veg | VEG | 🔴 REGENERATE | false | P2 |
| 109 | martial-arts-non-veg | NON_VEG | 🔴 REGENERATE | false | P2 |
| 110 | female-athlete-sports-veg | VEG | ❌ NOT IN DB — ADD TO SEED FILE | false | P2 |
| 111 | female-athlete-sports-non-veg | NON_VEG | ❌ NOT IN DB — ADD TO SEED FILE | false | P2 |
| 112 | youth-athlete-veg | VEG | 🔴 REGENERATE | false | P2 |
| 113 | youth-athlete-non-veg | NON_VEG | 🔴 REGENERATE | false | P2 |

---

## SUMMARY — WHAT NEEDS TO HAPPEN

| Task | Files Affected | Status |
|------|---------------|--------|
| Create `seed-food-items-core.ts` | New file | ❌ Not created |
| Run `seed-food-items-core.ts`, get real IDs | DB + generator | ❌ |
| Patch `FI_MAP` in `generate-fitfuel-seeds.ts` with real IDs | generator | ❌ |
| Fix generator cuisine matrix (India-first) | generator | ❌ |
| Add Pune sourcing mandate to generator prompt | generator | ❌ |
| Run `seed-meal-plans.ts` — verify 103 plans in DB | DB | ⚠️ UNVERIFIED |
| Add 10 missing plans to `seed-meal-plans.ts` | seed-meal-plans.ts | ❌ |
| Run updated `seed-meal-plans.ts` — verify 113 plans in DB | DB | ❌ |
| Set all plans `isActive: false` in DB | DB | ❌ |
| Test ONE plan end-to-end (WL-Veg: generate → seed → schedule → dashboard) | weight-loss-veg | ❌ |
| Regenerate ALL 35 existing recipe seed files | 35 .ts files | ❌ |
| Generate 78 remaining recipe seed files (not yet started) | 78 .ts files | ❌ |
| Write schedule seed files for all plans | 113 .ts files | ❌ |
| Delete + re-seed WL-NV recipes (fix NEW_ID patch) | DB | ❌ |
| Re-seed WL-NV schedule after recipe fix | DB | ❌ |

**Legend:**  
🔴 REGENERATE = file exists but cuisine is wrong and/or has NEW_ID_* — do not run as-is  
❌ NOT IN DB = MealPlan record missing from seed-meal-plans.ts — add it first  
⚠️ UNVERIFIED = file was run but never confirmed in DB

---

## WHAT IS ACTUALLY CORRECT AND UNTOUCHED

| Component | Status | Notes |
|-----------|--------|-------|
| `prisma/schema.prisma` | ✅ PERFECT | Do not touch |
| `lib/tdee.ts` | ✅ COMPLETE | Phase 9B done |
| `lib/meal-plans-data.ts` | ✅ COMPLETE | Phase 9B done |
| `prisma/seed-exercises.ts` | ✅ COMPLETE | Phase 7 done |
| `prisma/seed-nutrition.ts` | ✅ COMPLETE | Phase 6 done |
| `prisma/seed.ts` | ✅ COMPLETE | Core seed done |
| DB migrations (all 8) | ✅ COMPLETE | Schema is live |
| Recipe content quality in generated files | ⚠️ GOOD but wrong cuisine | Steps, macros, descriptions are well-written — just needs Indian cuisine |
| Plan mandates in generator | ✅ GOOD | Diabetic, PCOS, keto, heart, Jain, Navratri rules are correct — keep them |
| `seed-schedule-weight-loss-nv.ts` | ✅ 30 days in DB | Keep — re-seed after recipe fix |

---

## GATE RULES — NON-NEGOTIABLE BEFORE GOING LIVE

**Gate 1 — Before running any recipe seed:**
```bash
grep -c "NEW_ID_" output/seed-recipes-weight-loss-veg.ts
# Must return 0. Any NEW_ID_ = hard stop.
```

**Gate 2 — Before marking a plan active:**
```sql
SELECT COUNT(*) FROM plan_schedule_slots WHERE meal_plan_id = '<id>';
-- Must return 120 (30 days × 4 meals) for launch plans
```

**Gate 3 — Before going live on medical plans:**
- Nutritionist name + credentials confirmed (not placeholder)
- Medical disclaimer wired on plan page
- FSSAI license 21523035002815 in footer

**Gate 4 — Before any plan page goes live:**
- Recipe seed verified in DB
- Schedule seed verified in DB
- Today's Meals dashboard card shows correct data for test user

---

## PHASE 9 BUILD ORDER (REVISED)

```
WEEK 1 — Fix foundation (no new features until this is done)
  →  Create + run seed-food-items-core.ts
  →  Get real IDs → patch FI_MAP in generator
  →  Fix generator: India-first cuisine matrix + Pune sourcing mandate
  →  Verify 103 plans in DB (run seed-meal-plans.ts, check in Studio)
  →  Add 10 missing plans → re-run seed-meal-plans.ts → verify 113 plans
  →  Set all isActive = false in DB (SQL command)
  →  Test ONE plan: generate weight-loss-veg → seed → schedule → dashboard card
  →  Verify gate checks pass for WL-Veg
  →  Fix WL-NV: delete + re-seed recipes + schedule with real IDs
  →  Re-verify WL-NV in DB. Set weight-loss-non-veg isActive = true

WEEK 2 — P0 recipe + schedule seeds
  →  Regenerate + seed: WL-Egg, MG-Veg, MG-NV, PCOS-Veg, PCOS-NV, Diabetic-Veg, Diabetic-NV
  →  Regenerate + seed: Strength-Hypertrophy-Veg, Strength-Hypertrophy-NV
  →  Write + run all P0 schedule seeds (8 plans × 30 days = 240 schedule rows each)
  →  Set P0 plans isActive = true after gate check

WEEK 3 — P1 recipe + schedule seeds
  →  All Balanced variants + Jain + IF + Vegan
  →  All P1 medical: Gut Health, Post-Pregnancy, Anaemia, Obesity, Pre-Diabetic, Thyroid, Heart
  →  Hair Health, Acne Skin, Cricket, Endurance
  →  All P1 schedule seeds

WEEK 4 — Plan pages (9E, 9F, 9G)
  →  /plans/[slug] — standard plan pages
  →  /lifestyle-plans/[slug] — P0 medical first
  →  /sports-nutrition/[slug]

WEEK 5 — Dashboard wiring (9J, 9K, 9L, 9D, 9N)
  →  Today's Meals card + API routes
  →  Plan Progress card
  →  Net Calorie Engine
  →  Exercise Schedule wiring
  →  Onboarding flow

WEEK 6 — Public pages + launch (9H, 9I, 9O)
  →  /pricing — tier comparison
  →  Trust pages, Legal pages
  →  Homepage updates
  →  QA → production push → fitfuel.in
```

---

## NOTES & DECISIONS (UPDATED)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Recipe seed strategy | Per-plan files — 113 individual files |
| 2 | Recipe library model | Shared pool tagged by planCategories + dietaryTags |
| 3 | Cuisine strategy | 80% Indian regional, 20% Indian fusion. Zero international-only recipes. |
| 4 | Sourcing constraint | Every ingredient must be bulk-sourceable in Pune |
| 5 | 30 vs 60 day schedule | 30 days at launch. Loops to day 1. Disclosed as "30-day rotating menu" |
| 6 | servingMultiplier | WL=1.0x, MG=1.4x, Sports=1.6x — same recipe, different portions |
| 7 | Jain recipes | Zero onion, garlic, root vegetables, mushroom, cauliflower per Jain mandates |
| 8 | NEW_ID_* fix approach | Create seed-food-items-core.ts first, get real IDs, then regenerate all files |
| 9 | WL-NV 28 recipes | Delete + re-seed after food items core is fixed |
| 10 | isActive strategy | All plans start false. Flip to true only after recipes + schedule verified in DB |
| 11 | seed-meal-plans.ts | 103 of 113 plans present. Add 10 missing before running recipe seeds for those plans |
| 12 | Test-first rule | One plan verified end-to-end before batch work. Never skip this again. |
| 13 | Medical disclaimer | Every medical plan page + checkout. Non-negotiable before going live |
| 14 | Nutritionist credit | Placeholder until real credentials confirmed. Do NOT go live on medical plans without real names |
| 15 | Tier activation | Standard fully live. Premium + Luxury = waitlist until Phase 12 |
| 16 | Female Athlete appears twice | female-athlete (lifestyle #67-68) and female-athlete-sports (sports #110-111) — different slugs |
| 17 | Vegan | Only vegan-muscle uses VEGAN DietVariant. Veg ≠ Vegan. |
| 18 | FI IDs | Hardcoded cuids in seed-recipes.ts are DB-specific. All files must use same IDs. |
| 19 | Generator | generate-fitfuel-seeds.ts uses OpenAI API. Needs OPENAI_API_KEY. Alternatively, rewrite to use Claude API. |

---

## LAST UPDATED

- **Date:** May 26, 2026
- **Version:** v4 (complete reset and honest audit)
- **Completed and verified:** 9A schema ✅ · 9B personalisation engine ✅ · DB migrations ✅
- **In DB (verified):** 28 recipes (WL-NV, broken ingredients) · 30-day schedule (WL-NV)
- **In DB (unverified):** 103 MealPlan records
- **Recipe files to regenerate:** 35 existing (wrong cuisine) + 78 not yet generated = 113 total
- **Immediate next action:** Create `seed-food-items-core.ts` → get real IDs → fix generator → test WL-Veg end to end

> **Owner:** Pranit Borkar — pranitborkar98@gmail.com
> **Platform:** fitfuel-eosin.vercel.app → fitfuel.in