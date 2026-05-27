# Run from your project root: .\patch-seed.ps1

$seedPath = "prisma\seed.ts"

# The MealPlan seed block to insert before main()
$insert = @'

// ============================================================
// MEAL PLANS — Phase 9 (required for onboarding route)
// ============================================================

type MealPlanSeed = {
  slug: string; name: string; displayName: string
  subCategory: string; dietaryVariant: 'VEG'|'EGG'|'NON_VEG'|'JAIN'|'VEGAN'
  avgCaloriesPerDay: number; avgProteinGrams: number
  avgCarbsGrams: number; avgFatGrams: number
  sortOrder: number
}

const MEAL_PLANS: MealPlanSeed[] = [
  // ── Weight Loss ──────────────────────────────────────────
  { slug:'weight-loss-veg',     name:'Weight Loss — Veg',     displayName:'Weight Loss — Vegetarian',     subCategory:'weight_loss', dietaryVariant:'VEG',     avgCaloriesPerDay:1500, avgProteinGrams:90,  avgCarbsGrams:170, avgFatGrams:45,  sortOrder:1  },
  { slug:'weight-loss-egg',     name:'Weight Loss — Egg',     displayName:'Weight Loss — Eggetarian',     subCategory:'weight_loss', dietaryVariant:'EGG',     avgCaloriesPerDay:1500, avgProteinGrams:95,  avgCarbsGrams:165, avgFatGrams:45,  sortOrder:2  },
  { slug:'weight-loss-non-veg', name:'Weight Loss — Non-Veg', displayName:'Weight Loss — Non Vegetarian', subCategory:'weight_loss', dietaryVariant:'NON_VEG', avgCaloriesPerDay:1500, avgProteinGrams:110, avgCarbsGrams:150, avgFatGrams:45,  sortOrder:3  },
  { slug:'weight-loss-jain',    name:'Weight Loss — Jain',    displayName:'Weight Loss — Jain',           subCategory:'weight_loss', dietaryVariant:'JAIN',    avgCaloriesPerDay:1500, avgProteinGrams:80,  avgCarbsGrams:175, avgFatGrams:45,  sortOrder:4  },
  { slug:'weight-loss-vegan',   name:'Weight Loss — Vegan',   displayName:'Weight Loss — Vegan',          subCategory:'weight_loss', dietaryVariant:'VEGAN',   avgCaloriesPerDay:1500, avgProteinGrams:85,  avgCarbsGrams:175, avgFatGrams:42,  sortOrder:5  },
  // ── Muscle Gain ──────────────────────────────────────────
  { slug:'muscle-gain-veg',     name:'Muscle Gain — Veg',     displayName:'Muscle Gain — Vegetarian',     subCategory:'muscle_gain', dietaryVariant:'VEG',     avgCaloriesPerDay:2600, avgProteinGrams:150, avgCarbsGrams:310, avgFatGrams:72,  sortOrder:10 },
  { slug:'muscle-gain-egg',     name:'Muscle Gain — Egg',     displayName:'Muscle Gain — Eggetarian',     subCategory:'muscle_gain', dietaryVariant:'EGG',     avgCaloriesPerDay:2600, avgProteinGrams:165, avgCarbsGrams:300, avgFatGrams:72,  sortOrder:11 },
  { slug:'muscle-gain-non-veg', name:'Muscle Gain — Non-Veg', displayName:'Muscle Gain — Non Vegetarian', subCategory:'muscle_gain', dietaryVariant:'NON_VEG', avgCaloriesPerDay:2600, avgProteinGrams:180, avgCarbsGrams:290, avgFatGrams:72,  sortOrder:12 },
  { slug:'muscle-gain-jain',    name:'Muscle Gain — Jain',    displayName:'Muscle Gain — Jain',           subCategory:'muscle_gain', dietaryVariant:'JAIN',    avgCaloriesPerDay:2600, avgProteinGrams:140, avgCarbsGrams:315, avgFatGrams:72,  sortOrder:13 },
  { slug:'muscle-gain-vegan',   name:'Muscle Gain — Vegan',   displayName:'Muscle Gain — Vegan',          subCategory:'muscle_gain', dietaryVariant:'VEGAN',   avgCaloriesPerDay:2600, avgProteinGrams:145, avgCarbsGrams:315, avgFatGrams:70,  sortOrder:14 },
  // ── Balanced Diet ────────────────────────────────────────
  { slug:'balanced-diet-veg',     name:'Balanced — Veg',     displayName:'Balanced Diet — Vegetarian',     subCategory:'balanced', dietaryVariant:'VEG',     avgCaloriesPerDay:2000, avgProteinGrams:100, avgCarbsGrams:250, avgFatGrams:56,  sortOrder:20 },
  { slug:'balanced-diet-egg',     name:'Balanced — Egg',     displayName:'Balanced Diet — Eggetarian',     subCategory:'balanced', dietaryVariant:'EGG',     avgCaloriesPerDay:2000, avgProteinGrams:110, avgCarbsGrams:245, avgFatGrams:56,  sortOrder:21 },
  { slug:'balanced-diet-non-veg', name:'Balanced — Non-Veg', displayName:'Balanced Diet — Non Vegetarian', subCategory:'balanced', dietaryVariant:'NON_VEG', avgCaloriesPerDay:2000, avgProteinGrams:120, avgCarbsGrams:235, avgFatGrams:56,  sortOrder:22 },
  { slug:'balanced-diet-jain',    name:'Balanced — Jain',    displayName:'Balanced Diet — Jain',           subCategory:'balanced', dietaryVariant:'JAIN',    avgCaloriesPerDay:2000, avgProteinGrams:90,  avgCarbsGrams:255, avgFatGrams:56,  sortOrder:23 },
  { slug:'balanced-diet-vegan',   name:'Balanced — Vegan',   displayName:'Balanced Diet — Vegan',          subCategory:'balanced', dietaryVariant:'VEGAN',   avgCaloriesPerDay:2000, avgProteinGrams:95,  avgCarbsGrams:255, avgFatGrams:54,  sortOrder:24 },
]

'@

# Read current seed content
$content = Get-Content $seedPath -Raw

# Only patch if not already patched
if ($content -notmatch 'MEAL_PLANS') {
  # Insert block just before "async function main()"
  $patched = $content -replace '(async function main\(\))', "$insert`$1"
  
  # Also append the seedMealPlans() call inside main(), right before the final console.log block
  $patched = $patched -replace '(console\.log\(`\\n✅ Seed complete!`\))', @'
  // ── Seed MealPlan rows (Phase 9) ──────────────────────────
  console.log('\n🌿 Seeding MealPlan rows...')
  for (const p of MEAL_PLANS) {
    await prisma.mealPlan.upsert({
      where: { slug: p.slug },
      create: {
        slug:             p.slug,
        name:             p.name,
        displayName:      p.displayName,
        category:         'STANDARD',
        subCategory:      p.subCategory,
        tagline:          `${p.displayName} — 30-day rotating menu`,
        description:      `Personalised ${p.subCategory.replace('_',' ')} plan for ${p.dietaryVariant.toLowerCase()} diet.`,
        longDescription:  `A 30-day no-repeat rotating meal plan tailored for ${p.subCategory.replace('_',' ')}.`,
        whoIsItFor:       `Anyone on a ${p.dietaryVariant.toLowerCase()} diet looking to ${p.subCategory.replace('_',' ')}.`,
        keyPrinciples:    ['Balanced macros', 'Indian ingredients', '30-day rotation'],
        whatIsAvoided:    ['Processed food', 'Refined sugar'],
        dietaryVariant:   p.dietaryVariant,
        tier:             'STANDARD',
        avgCaloriesPerDay: p.avgCaloriesPerDay,
        avgProteinGrams:   p.avgProteinGrams,
        avgCarbsGrams:     p.avgCarbsGrams,
        avgFatGrams:       p.avgFatGrams,
        isActive:         true,
        sortOrder:        p.sortOrder,
      },
      update: {
        displayName:      p.displayName,
        avgCaloriesPerDay: p.avgCaloriesPerDay,
        avgProteinGrams:   p.avgProteinGrams,
        avgCarbsGrams:     p.avgCarbsGrams,
        avgFatGrams:       p.avgFatGrams,
        isActive:         true,
      },
    })
    console.log(`  ✓ ${p.displayName}`)
  }
  console.log(`✅ MealPlan rows: ${MEAL_PLANS.length}`)

  $1
'@

  Set-Content $seedPath $patched -Encoding UTF8
  Write-Host "✅ seed.ts patched successfully" -ForegroundColor Green
} else {
  Write-Host "⚠️  seed.ts already patched — skipping edit" -ForegroundColor Yellow
}

# Run the seed
Write-Host "`n▶ Running seed..." -ForegroundColor Cyan
npx prisma db seed