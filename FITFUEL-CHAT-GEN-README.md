# FitFuel Chat Generator — How To Use

## The Idea
Instead of running `generate-fitfuel-seeds.ts` (which calls Claude API and costs tokens),
you command Claude directly in this chat. Claude writes the seed file. You download and run it.

Zero API calls. Zero tokens burned on generation. Just `npx tsx`.

---

## Command Format

Type exactly this in chat:

```
generate seed-recipes-<plan-slug>
```

**Examples:**
```
generate seed-recipes-weight-loss-egg
generate seed-recipes-muscle-gain-veg
generate seed-recipes-diabetic-veg
generate seed-recipes-pcos-non-veg
```

Claude will produce a complete `seed-recipes-<plan-slug>.ts` file:
- 30 recipes (correct meal slot split: 8B + 10L + 5S + 7D)
- India-first cuisine (80% regional, 20% Indian fusion)
- Pune cloud kitchen ingredients only
- MISSING_FOOD_ITEMS block (upsert pattern — safe to re-run)
- 30-day schedule built automatically
- Same format as verified `seed-recipes-weight-loss-veg.ts`

---

## After Downloading

```bash
# Drop file in prisma/ folder, then:
npx tsx prisma/seed-recipes-<plan-slug>.ts
```

### Gate checks before running:
```bash
# Must return 0
grep -c "NEW_ID_" prisma/seed-recipes-<plan-slug>.ts

# Spot check cuisine types — should be Indian
grep "cuisineType" prisma/seed-recipes-<plan-slug>.ts | head -10
```

### Verify after running:
```bash
npx prisma studio
# recipes table: 30 new rows, all Indian cuisineType
# plan_schedule_slots: 120 new rows for the plan
# recipe_ingredients: zero null foodItemId
```

---

## Plan Priority Queue (what to generate next)

### P0 — Generate these first (launch blockers)
| Command | Diet | Status |
|---------|------|--------|
| `generate seed-recipes-weight-loss-egg` | EGG | ❌ |
| `generate seed-recipes-muscle-gain-veg` | VEG | ❌ |
| `generate seed-recipes-muscle-gain-non-veg` | NON_VEG | ❌ |
| `generate seed-recipes-pcos-veg` | VEG | ❌ |
| `generate seed-recipes-pcos-non-veg` | NON_VEG | ❌ |
| `generate seed-recipes-diabetic-veg` | VEG | ❌ |
| `generate seed-recipes-diabetic-non-veg` | NON_VEG | ❌ |
| `generate seed-recipes-strength-hypertrophy-veg` | VEG | ❌ |
| `generate seed-recipes-strength-hypertrophy-non-veg` | NON_VEG | ❌ |

### Already Done ✅
| Plan | Status |
|------|--------|
| `weight-loss-veg` | ✅ In DB, verified, 30 recipes, 120 slots |
| `weight-loss-non-veg` | ✅ In DB (28 recipes — needs SALT/spice patch still) |

---

## Food Item IDs Reference (verified DB IDs)

These are hardcoded in every generated file. Do not change.

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
SALT                 → cmpmcgp590000asugacrl4mb7   ← created by patch-wl-veg
JAGGERY              → cmpmcgpia0001asugdokpvn20   ← created by patch-wl-veg
```

All other ingredients (garlic, ginger, spices, oils, vegetables etc.) go in
`MISSING_FOOD_ITEMS` — the seed script creates them via `upsert` at runtime.

---

## Rules Claude Follows For Every Generated File

1. **Cuisine split**: 80% Indian regional, 20% Indian fusion. Zero international-only.
2. **No forbidden ingredients**: no tahini, miso, gochujang, kimchi, couscous, avocado, edamame, rice noodles, chipotle
3. **Meal slot counts**: BREAKFAST×8, LUNCH×10, SNACK×5, DINNER×7 = 30 total
4. **No NEW_ID_ anywhere** — all unknowns go in MISSING_FOOD_ITEMS
5. **SALT always in MISSING_FOOD_ITEMS** (learned from WL-Veg patch)
6. **Plan mandates respected**: diabetic = low GI, PCOS = anti-inflammatory, keto = <50g carb, Jain = no onion/garlic/root veg
7. **Macros verified**: calories per serving within ±50kcal of plan target
8. **Slug format**: `kebab-case-recipe-name-plan-slug` — unique, no collisions
