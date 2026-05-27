"""
FitFuel Generator Patcher v1.0
Fixes 9 bugs in generate-fitfuel-seeds.ts
Run from C:\\Users\\VCOM\\fitfuel:
  python patch_generator.py
"""
import re, sys, os, shutil

SRC = 'generate-fitfuel-seeds.ts'
OUT = 'generate-fitfuel-seeds.ts'  # overwrites in place (backup made first)
BAK = 'generate-fitfuel-seeds.backup.ts'

if not os.path.exists(SRC):
    print(f"ERROR: {SRC} not found. Run this from C:\\\\Users\\\\VCOM\\\\fitfuel")
    sys.exit(1)

shutil.copy2(SRC, BAK)
print(f"✅ Backup created: {BAK}")

with open(SRC, 'r', encoding='utf-8') as f:
    g = f.read()

fixes = 0
failures = []

def patch(num, desc, old, new, required=True):
    global g, fixes
    if old in g:
        g = g.replace(old, new, 1)
        print(f"✅ FIX {num}: {desc}")
        fixes += 1
    else:
        msg = f"{'❌' if required else '⚠️ '} FIX {num}: {desc} — pattern not found"
        print(msg)
        if required:
            failures.append(f"FIX {num}: {desc}")

# ═══════════════════════════════════════════════════════════════
# FIX 1 — nameToKey regex missing global flag (inside ts template)
# ═══════════════════════════════════════════════════════════════
patch(1, "nameToKey regex — add global flag",
    "s.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/, '')",
    "s.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '')"
)

# ═══════════════════════════════════════════════════════════════
# FIX 2 — Strip platingSummary & glycaemicIndex before prisma.create (in ts template)
# ═══════════════════════════════════════════════════════════════
patch(2, "Strip platingSummary & glycaemicIndex before prisma.recipe.create",
    "    const { platingSummary, ...recipeData } = def.recipe\n"
    "    const recipe = await prisma.recipe.create({ data: recipeData })",
    "    // Strip fields not in Prisma Recipe schema\n"
    "    const { platingSummary: _p, glycaemicIndex: _g, ...recipeData } = def.recipe\n"
    "    const recipe = await prisma.recipe.create({ data: recipeData })"
)

# ═══════════════════════════════════════════════════════════════
# FIX 3 — getFoodItemId: undefined-safe lookup (in ts template)
# ═══════════════════════════════════════════════════════════════
patch(3, "getFoodItemId — undefined-safe lookup",
    "  if (staticMap[key]) return staticMap[key]\n"
    "  if (NEW_FI[key])    return NEW_FI[key]",
    "  if (staticMap[key] !== undefined) return staticMap[key]\n"
    "  if (NEW_FI[key] !== undefined)    return NEW_FI[key]"
)

# ═══════════════════════════════════════════════════════════════
# FIX 4 — Preflight NEW_ID_* check + orphaned recipe recovery (in ts template)
# ═══════════════════════════════════════════════════════════════
patch(4, "Preflight stub check + orphaned recipe recovery",
    "  for (const def of RECIPES) {\n"
    "    const existing = await prisma.recipe.findUnique({ where: { slug: def.recipe.slug } })\n"
    "    if (existing) { console.log(`⏭️  Exists: \\${def.recipe.name}`); skipped++; continue }\n"
    "\n"
    "    const { platingSummary: _p, glycaemicIndex: _g, ...recipeData } = def.recipe\n"
    "    const recipe = await prisma.recipe.create({ data: recipeData })",
    # ↓ replacement
    "  // ── Preflight: abort if FI still has NEW_ID_* stubs ─────────────────────\n"
    "  const stubEntries = Object.entries(FI).filter(([, v]) => v.startsWith('NEW_ID_'))\n"
    "  if (stubEntries.length > 0) {\n"
    "    console.error('\\\\n❌ PREFLIGHT FAILED — FI entries still have NEW_ID_* placeholder IDs:')\n"
    "    stubEntries.forEach(([k, v]) => console.error(`   \\${k}: '\\${v}'`))\n"
    "    console.error('\\\\nRun seed-food-items-core.ts first, replace stubs, then re-run.\\\\nAborting — no DB changes made.')\n"
    "    process.exit(1)\n"
    "  }\n"
    "  console.log(`✅ Preflight passed — all \\${Object.keys(FI).length} FI entries have real IDs.\\\\n`)\n"
    "\n"
    "  for (const def of RECIPES) {\n"
    "    const existing = await prisma.recipe.findUnique({\n"
    "      where: { slug: def.recipe.slug },\n"
    "      include: { ingredients: true },\n"
    "    })\n"
    "\n"
    "    let recipe: { id: string }\n"
    "\n"
    "    if (existing) {\n"
    "      if (existing.ingredients.length > 0) {\n"
    "        console.log(`⏭️  Exists: \\${def.recipe.name}`); skipped++; continue\n"
    "      }\n"
    "      console.log(`♻️  Re-seeding orphaned recipe: \\${def.recipe.name}`)\n"
    "      recipe = existing\n"
    "    } else {\n"
    "      // Strip fields not in Prisma Recipe schema\n"
    "      const { platingSummary: _p, glycaemicIndex: _g, ...recipeData } = def.recipe\n"
    "      recipe = await prisma.recipe.create({ data: recipeData })\n"
    "    }"
)

# ═══════════════════════════════════════════════════════════════
# FIX 5 — planCategories hardcoded in prompt example (in buildPrompt)
# ═══════════════════════════════════════════════════════════════
patch(5, "planCategories in prompt JSON example — use dynamic plan.planCategory",
    '"planCategories": ["weight_loss"],',
    '"planCategories": ["${plan.planCategory}"],'
)

# ═══════════════════════════════════════════════════════════════
# FIX 6 — Add explicit planCategories rule to prompt (in buildPrompt)
# ═══════════════════════════════════════════════════════════════
patch(6, "planCategories rule added to prompt",
    "━━━ DIETARY TAGS RULE ━━━\n"
    "VEG plans: always ['VEGETARIAN'] | EGG plans: ['EGG'] | NON_VEG: ['NON_VEG'] | VEGAN: ['VEGAN'] | JAIN: ['JAIN', 'VEGETARIAN']",
    "━━━ DIETARY TAGS RULE ━━━\n"
    "VEG plans: always ['VEGETARIAN'] | EGG plans: ['EGG'] | NON_VEG: ['NON_VEG'] | VEGAN: ['VEGAN'] | JAIN: ['JAIN', 'VEGETARIAN']\n\n"
    "━━━ PLAN CATEGORIES RULE — CRITICAL ━━━\n"
    "planCategories MUST always be EXACTLY: [\"${plan.planCategory}\"]\n"
    "NEVER use the plan slug, diet variant, or any other value. Use only the exact string above.\n"
    "Examples: balanced → ['balanced'] | weight_loss → ['weight_loss'] | pcos → ['pcos']"
)

# ═══════════════════════════════════════════════════════════════
# FIX 7 — LUNCHS typo in section header (in writeSeedFile recipeBlocks)
# ═══════════════════════════════════════════════════════════════
patch(7, "LUNCHS → LUNCHES in section header",
    "header = `\\n\\n  // =========================================================================\\n  // ${r.mealType}S (${count} recipe${count !== 1 ? 's' : ''})\\n  // =========================================================================\\n`;",
    "const _mealLabel = r.mealType === 'LUNCH' ? 'LUNCHES' : r.mealType + 'S';\n"
    "      header = `\\n\\n  // =========================================================================\\n  // ${_mealLabel} (${count} recipe${count !== 1 ? 's' : ''})\\n  // =========================================================================\\n`;"
)

# ═══════════════════════════════════════════════════════════════
# FIX 8 — difficulty typed as string → tighten to union (in ts template)
# ═══════════════════════════════════════════════════════════════
patch(8, "difficulty type: string → 'easy' | 'medium' | 'hard'",
    "  difficulty: string; equipmentNeeded: string[]",
    "  difficulty: 'easy' | 'medium' | 'hard'; equipmentNeeded: string[]"
)

# ═══════════════════════════════════════════════════════════════
# FIX 9 — Diet violation guard in system message (in generateBatch)
# ═══════════════════════════════════════════════════════════════
patch(9, "Diet violation guard added as rule 10 in system message",
    "9. CRITICAL: Every ingredient key not in the KNOWN FOOD ITEM KEYS list MUST be declared in missingFoodItems with accurate per-100g nutritional data. Missing declarations cause batch rejection.",
    "9. CRITICAL: Every ingredient key not in the KNOWN FOOD ITEM KEYS list MUST be declared in missingFoodItems with accurate per-100g nutritional data. Missing declarations cause batch rejection.\n"
    "10. DIET VIOLATION = INSTANT BATCH REJECTION: VEG/VEGAN/JAIN plans MUST NEVER include fish sauce, oyster sauce, anchovy, fish stock, meat stock, lard, gelatin, or any animal-derived ingredient. Verify every ingredient key against the diet rule before writing."
)

# ─── Write output ──────────────────────────────────────────────
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(g)

print(f"\n{'━'*60}")
print(f"✅ {fixes}/9 fixes applied → {OUT}")
if failures:
    print(f"\n❌ {len(failures)} fix(es) failed — apply manually:")
    for fail in failures:
        print(f"   • {fail}")
else:
    print("🎉 All fixes applied successfully!")
print(f"{'━'*60}")
print(f"\nBackup at: {BAK}")
print("Run the generator: npx tsx generate-fitfuel-seeds.ts --plan=balanced-veg")
