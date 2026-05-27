// prisma/seed-recipes-intermittent-fasting-non-veg.ts
// Run: npx tsx prisma/seed-recipes-intermittent-fasting-non-veg.ts
// Seeds Intermittent Fasting NON-VEG recipes — aligned to seed-meal-plans.ts standards
// Depends on: MealPlan slugs existing (intermittent-fasting-non-veg, etc.)

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ---------------------------------------------------------------------------
// RECIPE DATA
// ---------------------------------------------------------------------------

const recipes = [

  // ═══════════════════════════════════════════════════════════════════════════
  // BREAKFAST — Breaking the Fast (High Protein, Moderate Fat, Low GI)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: 'if-nv-breakfast-eggs-benedict-salmon',
    name: 'Eggs Benedict with Smoked Salmon',
    displayName: 'Eggs Benedict — Smoked Salmon',
    tagline: 'Break your fast with omega-3 protein power.',
    description: 'A classic eggs Benedict reimagined for intermittent fasting — poached eggs, smoked salmon, and a light hollandaise on a toasted half-muffin with wilted spinach.',
    longDescription: 'The first meal after a 16-hour fast sets the metabolic tone for the entire eating window. This eggs Benedict delivers 28g of high-quality protein and anti-inflammatory omega-3 from salmon within minutes of breaking your fast. The combination of egg protein, salmon fat, and spinach micronutrients creates a nutrient-dense opening meal that stabilises blood sugar rather than spiking it.',
    whoIsItFor: 'Non-vegetarians practicing 16:8 intermittent fasting who want a luxurious, restaurant-quality first meal that delivers serious nutrition.',
    keyPrinciples: ['Break fast with protein + fat — not carbs alone', 'Omega-3 from salmon to manage fasting-phase inflammation', 'Egg protein for rapid muscle protein synthesis', 'Low GI — no blood sugar spike post-fast', 'Quick preparation — ready in 20 minutes'],
    whatIsAvoided: ['Refined carbs in the first meal', 'High sugar breakfast foods', 'Fried preparations', 'Processed meats'],
    category: 'breakfast',
    dietType: 'non-veg',
    fastingProtocol: '16:8',
    ingredients: [
      { name: 'Eggs', quantity: '2 large', notes: 'Free-range preferred' },
      { name: 'Smoked salmon', quantity: '80g', notes: 'Cold-smoked, low-sodium' },
      { name: 'English muffin', quantity: '1 half', notes: 'Whole wheat or sourdough' },
      { name: 'Hollandaise sauce', quantity: '2 tbsp', notes: 'Homemade or clean-label' },
      { name: 'Baby spinach', quantity: '1 cup', notes: 'Wilted in butter' },
      { name: 'Lemon juice', quantity: '1 tsp', notes: 'Freshly squeezed' },
      { name: 'Butter', quantity: '1 tsp', notes: 'For wilting spinach' },
    ],
    instructions: [
      'Bring a saucepan of water to a gentle simmer. Add a splash of vinegar.',
      'Crack eggs into small cups and slide into the water. Poach for 3–4 minutes for runny yolks.',
      'Toast the English muffin half until golden and crisp.',
      'Melt butter in a pan, add spinach, and wilt for 30 seconds. Season with salt and pepper.',
      'Layer wilted spinach on the muffin, top with smoked salmon, then the poached egg.',
      'Drizzle hollandaise and lemon juice over the top. Serve immediately while warm.',
    ],
    macros: { calories: 420, protein: 28, carbs: 12, fats: 30, fibre: 2 },
    prepTime: 10,
    cookTime: 10,
    servings: 1,
    isActive: true,
    sortOrder: 1,
    accentColor: '#fbbf24',
    tags: ['high-protein', 'omega-3', 'break-fast', 'quick', 'restaurant-style'],
    imageUrl: '/images/recipes/if-nv-eggs-benedict-salmon.jpg',
    mealPlanSlugs: ['intermittent-fasting-non-veg'],
  },

  {
    slug: 'if-nv-breakfast-steak-eggs-avocado',
    name: 'Steak and Eggs with Avocado',
    displayName: 'Steak & Eggs — Avocado',
    tagline: 'Carnivore-friendly fasting break. Zero compromise.',
    description: 'A high-calorie, ultra-high-protein breakfast for athletes and larger individuals breaking a 16-hour fast — sirloin steak, fried eggs, and avocado.',
    longDescription: 'For individuals with higher calorie needs or those who train in the morning, this steak and eggs breakfast delivers 42g of protein and substantial healthy fats to open the eating window with maximum satiety. The complete amino acid profile from steak plus egg choline and avocado monounsaturated fats creates a breakfast that keeps you full for hours.',
    whoIsItFor: 'Athletes, larger individuals, or anyone with high protein requirements practicing 16:8 who needs a dense first meal.',
    keyPrinciples: ['Very high protein to open the eating window', 'Complete amino acids from red meat + eggs', 'Healthy fats from avocado for hormone support', 'Zero refined carbohydrates', 'Sustained energy — no post-meal crash'],
    whatIsAvoided: ['Refined carbs', 'Sugar', 'Processed breakfast meats', 'High-sodium sauces'],
    category: 'breakfast',
    dietType: 'non-veg',
    fastingProtocol: '16:8',
    ingredients: [
      { name: 'Sirloin steak', quantity: '150g', notes: 'Trimmed, grass-fed preferred' },
      { name: 'Eggs', quantity: '2 large', notes: 'Sunny-side up or over-easy' },
      { name: 'Avocado', quantity: '1/2 medium', notes: 'Ripe, sliced' },
      { name: 'Butter', quantity: '1 tbsp', notes: 'For frying eggs' },
      { name: 'Cherry tomatoes', quantity: '6 pcs', notes: 'Halved, pan-warmed' },
      { name: 'Sea salt', quantity: 'To taste', notes: 'Flaky sea salt' },
      { name: 'Black pepper', quantity: 'To taste', notes: 'Freshly ground' },
    ],
    instructions: [
      'Remove steak from fridge 20 minutes before cooking. Pat dry and season generously with salt and pepper.',
      'Heat a heavy pan over high heat until smoking. Sear steak 3–4 minutes per side for medium-rare.',
      'Rest the steak on a warm plate for 5 minutes — this is non-negotiable for juicy meat.',
      'In the same pan with steak drippings, fry eggs in butter to your preferred doneness.',
      'Slice avocado and halve cherry tomatoes. Arrange on the plate.',
      'Slice steak against the grain, plate with eggs, avocado, and tomatoes. Serve immediately.',
    ],
    macros: { calories: 580, protein: 42, carbs: 8, fats: 42, fibre: 5 },
    prepTime: 5,
    cookTime: 15,
    servings: 1,
    isActive: true,
    sortOrder: 2,
    accentColor: '#ef4444',
    tags: ['keto-friendly', 'carnivore-adjacent', 'high-protein', 'athlete', 'satiating'],
    imageUrl: '/images/recipes/if-nv-steak-eggs-avocado.jpg',
    mealPlanSlugs: ['intermittent-fasting-non-veg'],
  },

  {
    slug: 'if-nv-breakfast-turkey-sausage-frittata',
    name: 'Turkey Sausage & Pepper Frittata',
    displayName: 'Turkey Sausage Frittata',
    tagline: 'Meal-prep friendly. High protein. Low carb.',
    description: 'A baked frittata with turkey sausage, bell peppers, and cheddar — perfect for batch-cooking your fasting-window breakfasts.',
    longDescription: 'Frittatas are the ultimate intermittent fasting breakfast because they reheat beautifully, travel well, and deliver consistent macros every time. This version uses lean turkey sausage for flavour without excess saturated fat, colourful peppers for micronutrients, and cheddar for taste and calcium. Bake on Sunday, eat all week.',
    whoIsItFor: 'Busy professionals and meal-preppers who want a grab-and-go breakfast within their 8-hour eating window.',
    keyPrinciples: ['Meal-prep friendly — stores 4 days refrigerated', 'Lean turkey sausage — lower fat than pork', 'Complete protein from eggs and cheese', 'Low carb — under 6g net carbs per serving', 'Micronutrient density from colourful vegetables'],
    whatIsAvoided: ['High-fat pork sausage', 'Refined carbs', 'Added sugar in sausage', 'Processed cheese'],
    category: 'breakfast',
    dietType: 'non-veg',
    fastingProtocol: '16:8',
    ingredients: [
      { name: 'Turkey sausage', quantity: '100g', notes: 'Lean, casings removed' },
      { name: 'Eggs', quantity: '3 large', notes: 'Free-range' },
      { name: 'Cheddar cheese', quantity: '30g', notes: 'Sharp, grated' },
      { name: 'Bell peppers', quantity: '1/2 cup', notes: 'Mixed colours, diced' },
      { name: 'Red onion', quantity: '1/4 cup', notes: 'Diced fine' },
      { name: 'Olive oil', quantity: '1 tsp', notes: 'For sautéing' },
      { name: 'Dried oregano', quantity: '1/2 tsp', notes: 'Optional' },
    ],
    instructions: [
      'Preheat oven to 190°C (375°F).',
      'Heat olive oil in a 20cm oven-safe pan over medium heat.',
      'Sauté turkey sausage, breaking it up, until browned — about 5 minutes.',
      'Add peppers and onion. Sauté 3 minutes until softened.',
      'Whisk eggs with a pinch of salt and pour over the mixture. Tilt pan to distribute evenly.',
      'Sprinkle cheddar on top. Cook on stove for 2 minutes until edges set.',
      'Transfer to oven and bake 12–15 minutes until fully set and slightly golden on top.',
      'Cool for 5 minutes, slice into wedges. Serve warm or refrigerate for later.',
    ],
    macros: { calories: 350, protein: 26, carbs: 6, fats: 24, fibre: 1 },
    prepTime: 10,
    cookTime: 20,
    servings: 2,
    isActive: true,
    sortOrder: 3,
    accentColor: '#f59e0b',
    tags: ['meal-prep', 'high-protein', 'low-carb', 'batch-cook', 'portable'],
    imageUrl: '/images/recipes/if-nv-turkey-frittata.jpg',
    mealPlanSlugs: ['intermittent-fasting-non-veg'],
  },

  {
    slug: 'if-nv-breakfast-chicken-yogurt-bowl',
    name: 'Grilled Chicken & Greek Yogurt Bowl',
    displayName: 'Chicken & Greek Yogurt Bowl',
    tagline: 'Mediterranean-inspired break-fast. Gut-friendly protein.',
    description: 'A refreshing, light-yet-protein-dense breakfast bowl with grilled chicken, full-fat Greek yogurt, cucumber, and walnuts.',
    longDescription: 'Not everyone wants a heavy breakfast after fasting. This Mediterranean bowl delivers 38g of protein in a lighter, fresher format — grilled chicken for lean protein, Greek yogurt for probiotics and casein, cucumber for hydration, and walnuts for omega-3. The dill and lemon zest keep it bright and palate-cleansing.',
    whoIsItFor: 'Those who prefer a lighter, fresher first meal after fasting — especially in warm weather or post-morning-workout.',
    keyPrinciples: ['Light but protein-dense — 38g protein without heaviness', 'Probiotics from Greek yogurt for gut health', 'Hydrating vegetables post-fast', 'Omega-3 from walnuts', 'Anti-inflammatory Mediterranean flavour profile'],
    whatIsAvoided: ['Heavy fried foods', 'Refined carbs', 'High-sodium sauces', 'Dairy if sensitive — yogurt can be substituted'],
    category: 'breakfast',
    dietType: 'non-veg',
    fastingProtocol: '16:8',
    ingredients: [
      { name: 'Chicken breast', quantity: '120g', notes: 'Skinless, boneless' },
      { name: 'Greek yogurt (full-fat)', quantity: '1/2 cup', notes: 'Unsweetened, strained' },
      { name: 'Cucumber', quantity: '1/2 cup', notes: 'Diced, deseeded' },
      { name: 'Walnuts', quantity: '10g', notes: 'Chopped roughly' },
      { name: 'Extra virgin olive oil', quantity: '1 tbsp', notes: 'For dressing' },
      { name: 'Fresh dill', quantity: '1 tsp', notes: 'Chopped' },
      { name: 'Lemon zest', quantity: '1/2 tsp', notes: 'Freshly grated' },
      { name: 'Lemon juice', quantity: '1 tsp', notes: 'Fresh' },
    ],
    instructions: [
      'Season chicken breast with salt, pepper, and a pinch of dried oregano.',
      'Grill on a hot pan or grill pan for 6–7 minutes per side until internal temperature reaches 74°C.',
      'Rest chicken for 5 minutes, then dice into bite-sized cubes.',
      'In a bowl, mix Greek yogurt with dill, lemon zest, and lemon juice.',
      'Add diced cucumber to the yogurt base and stir gently.',
      'Top with warm chicken cubes and sprinkle walnuts over everything.',
      'Drizzle olive oil just before serving.',
    ],
    macros: { calories: 390, protein: 38, carbs: 18, fats: 18, fibre: 3 },
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    isActive: true,
    sortOrder: 4,
    accentColor: '#10b981',
    tags: ['mediterranean', 'gut-friendly', 'high-protein', 'light', 'refreshing'],
    imageUrl: '/images/recipes/if-nv-chicken-yogurt-bowl.jpg',
    mealPlanSlugs: ['intermittent-fasting-non-veg'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LUNCH — The Main Calorie Load (Largest Meal of the Eating Window)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: 'if-nv-lunch-lemon-herb-chicken-salad',
    name: 'Lemon Herb Grilled Chicken Salad',
    displayName: 'Lemon Herb Chicken Salad',
    tagline: 'Your largest meal. Your cleanest fuel.',
    description: 'A substantial lunch salad with marinated grilled chicken thigh, mixed greens, avocado, parmesan, and a lemon-olive oil dressing.',
    longDescription: 'In 16:8 intermittent fasting, lunch should be your most calorie-dense meal — you have hours of activity ahead and time to digest before the window closes. This salad delivers 40g of protein and healthy fats while keeping carbs low. The chicken thigh (more flavour and moisture than breast) is marinated in lemon and herbs, grilled to perfection, and sliced over a bed of nutrient-dense greens.',
    whoIsItFor: 'Anyone following 16:8 who wants their midday meal to be the nutritional anchor of the day — high protein, high satisfaction.',
    keyPrinciples: ['Largest meal of the eating window — maximum nutrition here', 'High protein for afternoon energy and muscle support', 'Healthy fats from avocado and olive oil for satiety', 'Low carb — keeps afternoon energy stable', 'Quick to prepare despite restaurant-quality presentation'],
    whatIsAvoided: ['Heavy carbs that cause post-lunch lethargy', 'Fried chicken', 'Creamy dressings with seed oils', 'Croutons or bread additions'],
    category: 'lunch',
    dietType: 'non-veg',
    fastingProtocol: '16:8',
    ingredients: [
      { name: 'Chicken thigh', quantity: '180g', notes: 'Boneless, skinless' },
      { name: 'Mixed salad greens', quantity: '3 cups', notes: 'Rocket, spinach, lettuce mix' },
      { name: 'Avocado', quantity: '1/2 medium', notes: 'Sliced' },
      { name: 'Extra virgin olive oil', quantity: '2 tbsp', notes: 'For marinade and dressing' },
      { name: 'Lemon juice', quantity: '2 tbsp', notes: 'Fresh, divided' },
      { name: 'Parmesan shavings', quantity: '15g', notes: 'Aged, optional' },
      { name: 'Cucumber', quantity: '1/2 cup', notes: 'Sliced thin' },
      { name: 'Fresh herbs (thyme/rosemary)', quantity: '1 tsp', notes: 'Chopped, for marinade' },
    ],
    instructions: [
      'Marinate chicken thigh in 1 tbsp olive oil, 1 tbsp lemon juice, salt, pepper, and chopped herbs for 30 minutes (or overnight).',
      'Heat grill pan over medium-high heat. Grill chicken 6–7 minutes per side until charred and cooked through (internal temp 74°C).',
      'Rest chicken for 5 minutes — this keeps it juicy. Slice against the grain.',
      'In a large bowl, toss mixed greens with remaining olive oil and lemon juice. Season lightly.',
      'Arrange greens on a plate. Top with sliced chicken, avocado, cucumber, and parmesan shavings.',
      'Serve immediately with an extra lemon wedge if desired.',
    ],
    macros: { calories: 450, protein: 40, carbs: 14, fats: 26, fibre: 5 },
    prepTime: 35,
    cookTime: 15,
    servings: 1,
    isActive: true,
    sortOrder: 10,
    accentColor: '#84cc16',
    tags: ['low-carb', 'keto-friendly', 'lunch-anchor', 'high-protein', 'anti-inflammatory'],
    imageUrl: '/images/recipes/if-nv-lemon-herb-chicken-salad.jpg',
    mealPlanSlugs: ['intermittent-fasting-non-veg'],
  },

  {
    slug: 'if-nv-lunch-seared-tuna-poke',
    name: 'Seared Tuna Poke Bowl (No Rice)',
    displayName: 'Seared Tuna Poke Bowl',
    tagline: 'Japanese precision. Zero grains. Maximum omega-3.',
    description: 'A grain-free poke bowl with sashimi-grade seared tuna, cauliflower rice, edamame, seaweed salad, and sesame-soy dressing.',
    longDescription: 'This bowl brings Japanese flavours to intermittent fasting without the glycaemic load of white rice. Cauliflower rice provides volume and fibre, seared tuna delivers 35g of premium protein and omega-3, and the seaweed-edamame combination adds iodine, fibre, and plant protein. The result is a lunch that feels indulgent while keeping carbs under 12g.',
    whoIsItFor: 'Sushi lovers doing low-carb or keto within their intermittent fasting window who want Japanese flavours without the rice.',
    keyPrinciples: ['Grain-free — cauliflower rice replaces white rice', 'Sashimi-grade tuna for premium protein and omega-3', 'Seaweed for iodine and minerals', 'Low carb — under 12g net carbs', 'Quick assembly — minimal cooking required'],
    whatIsAvoided: ['White rice', 'High-sugar poke sauces', 'Fried tempura additions', 'Processed imitation crab'],
    category: 'lunch',
    dietType: 'non-veg',
    fastingProtocol: '16:8',
    ingredients: [
      { name: 'Sashimi-grade tuna', quantity: '150g', notes: 'Fresh, sushi-grade' },
      { name: 'Cauliflower rice', quantity: '1 cup', notes: 'Fresh or frozen, drained well' },
      { name: 'Edamame (shelled)', quantity: '1/4 cup', notes: 'Steamed, cooled' },
      { name: 'Seaweed salad', quantity: '1/2 cup', notes: 'Low-sodium if possible' },
      { name: 'Soy sauce (or tamari)', quantity: '1 tbsp', notes: 'Low-sodium' },
      { name: 'Toasted sesame oil', quantity: '1 tsp', notes: 'For finishing' },
      { name: 'Pickled ginger', quantity: '10g', notes: 'Natural, no dye' },
      { name: 'Sesame seeds', quantity: '1 tsp', notes: 'Toasted, for garnish' },
    ],
    instructions: [
      'Pat tuna dry with paper towels. Season lightly with salt.',
      'Heat a pan until very hot. Sear tuna 30 seconds per side — keep the centre raw.',
      'Remove tuna, let cool 2 minutes, then cut into 1cm cubes.',
      'If using frozen cauliflower rice, sauté in a dry pan for 3 minutes to remove moisture. Toss with a drop of sesame oil.',
      'Arrange cauliflower rice as the base in a wide bowl.',
      'Top with tuna cubes, edamame, seaweed salad, and pickled ginger in separate sections.',
      'Drizzle soy sauce and remaining sesame oil over everything. Garnish with toasted sesame seeds.',
    ],
    macros: { calories: 410, protein: 35, carbs: 12, fats: 24, fibre: 4 },
    prepTime: 15,
    cookTime: 5,
    servings: 1,
    isActive: true,
    sortOrder: 11,
    accentColor: '#06b6d4',
    tags: ['paleo', 'keto-friendly', 'omega-3', 'japanese-inspired', 'grain-free', 'no-cook-option'],
    imageUrl: '/images/recipes/if-nv-seared-tuna-poke.jpg',
    mealPlanSlugs: ['intermittent-fasting-non-veg'],
  },

  {
    slug: 'if-nv-lunch-beef-broccoli-stirfry',
    name: 'Beef & Broccoli Stir-Fry',
    displayName: 'Beef & Broccoli Stir-Fry',
    tagline: 'Asian comfort. Low carb. Under 20 minutes.',
    description: 'A classic beef and broccoli stir-fry with flank steak, ginger, garlic, and a light soy-sesame sauce — no cornstarch, no sugar.',
    longDescription: 'This is the intermittent fasting version of a takeout favourite — stripped of sugar, cornstarch, and excess oil while keeping the bold flavours intact. Flank steak is sliced thin against the grain for tenderness, broccoli provides fibre and sulforaphane, and the ginger-garlic base delivers anti-inflammatory compounds. The entire meal comes together in under 25 minutes.',
    whoIsItFor: 'Fans of Asian cuisine who want a quick, flavourful, low-carb lunch within their eating window.',
    keyPrinciples: ['No added sugar or cornstarch — clean stir-fry', 'Flank steak — lean, flavourful, quick-cooking', 'Broccoli for fibre and detoxification support', 'Ginger and garlic for anti-inflammatory benefits', 'Quick cook time — ideal for busy schedules'],
    whatIsAvoided: ['Cornstarch thickeners', 'Added sugar in sauces', 'Deep frying', 'MSG', 'White rice pairing (serve as is or with cauliflower rice)'],
    category: 'lunch',
    dietType: 'non-veg',
    fastingProtocol: '16:8',
    ingredients: [
      { name: 'Flank steak', quantity: '180g', notes: 'Sliced thin against the grain' },
      { name: 'Broccoli florets', quantity: '2 cups', notes: 'Cut into small pieces' },
      { name: 'Garlic', quantity: '3 cloves', notes: 'Minced fine' },
      { name: 'Ginger', quantity: '1 tbsp', notes: 'Fresh, grated' },
      { name: 'Soy sauce', quantity: '2 tbsp', notes: 'Low-sodium' },
      { name: 'Toasted sesame oil', quantity: '1 tbsp', notes: 'For cooking and finishing' },
      { name: 'Red pepper flakes', quantity: '1/2 tsp', notes: 'Optional, for heat' },
      { name: 'Green onions', quantity: '2 stalks', notes: 'Sliced, for garnish' },
    ],
    instructions: [
      'Slice flank steak as thinly as possible against the grain. Pat dry.',
      'Heat a wok or large pan over highest heat until smoking. Add 1/2 tbsp sesame oil.',
      'Stir-fry steak slices in a single layer for 2–3 minutes until browned but still pink inside. Remove and set aside.',
      'Add remaining sesame oil to the pan. Stir-fry broccoli, garlic, and ginger for 4–5 minutes until broccoli is tender-crisp.',
      'Return steak to the pan. Pour soy sauce over everything and toss for 30 seconds.',
      'Sprinkle red pepper flakes and green onions. Serve hot, alone or over cauliflower rice if desired.',
    ],
    macros: { calories: 470, protein: 38, carbs: 16, fats: 28, fibre: 4 },
    prepTime: 15,
    cookTime: 10,
    servings: 1,
    isActive: true,
    sortOrder: 12,
    accentColor: '#dc2626',
    tags: ['asian-inspired', 'low-carb', 'quick', 'stir-fry', 'under-30-minutes'],
    imageUrl: '/images/recipes/if-nv-beef-broccoli-stirfry.jpg',
    mealPlanSlugs: ['intermittent-fasting-non-veg'],
  },

  {
    slug: 'if-nv-lunch-shrimp-lettuce-wraps',
    name: 'Shrimp & Avocado Lettuce Wraps',
    displayName: 'Shrimp & Avocado Lettuce Wraps',
    tagline: 'Light lunch. Heavy protein. Zero heaviness.',
    description: 'Fresh butter lettuce wraps filled with sautéed shrimp, mashed avocado, cilantro, and lime — a light but protein-packed midday meal.',
    longDescription: 'When you want a lunch that fuels without weighing you down, these lettuce wraps deliver. Shrimp provides 28g of lean protein with minimal fat, avocado adds creaminess and heart-healthy monounsaturated fats, and the lettuce cups keep the entire meal fresh and hydrating. Perfect for warm afternoons or pre-workout lunches.',
    whoIsItFor: 'Those who prefer a lighter lunch within their eating window — especially before evening workouts or in hot weather.',
    keyPrinciples: ['Light but protein-dense — 28g protein without heaviness', 'Hydrating lettuce cups instead of bread or wraps', 'Healthy fats from avocado for satiety', 'Quick preparation — 15 minutes total', 'Low carb — under 10g net carbs'],
    whatIsAvoided: ['Bread or tortilla wraps', 'Heavy creamy sauces', 'Fried shrimp', 'High-sodium cocktail sauces'],
    category: 'lunch',
    dietType: 'non-veg',
    fastingProtocol: '16:8',
    ingredients: [
      { name: 'Shrimp (peeled, deveined)', quantity: '200g', notes: 'Medium size, tail-off' },
      { name: 'Butter lettuce leaves', quantity: '6 large', notes: 'Washed, dried' },
      { name: 'Avocado', quantity: '1 medium', notes: 'Ripe' },
      { name: 'Lime juice', quantity: '2 tbsp', notes: 'Freshly squeezed' },
      { name: 'Fresh cilantro', quantity: '1/4 cup', notes: 'Chopped' },
      { name: 'Jalapeño', quantity: '1/2', notes: 'Sliced thin, optional' },
      { name: 'Olive oil', quantity: '1 tbsp', notes: 'For sautéing shrimp' },
      { name: 'Cumin', quantity: '1/4 tsp', notes: 'Optional' },
    ],
    instructions: [
      'Pat shrimp completely dry. Season with salt, pepper, and a pinch of cumin.',
      'Heat olive oil in a pan over medium-high heat. Sauté shrimp in a single layer for 2 minutes per side until pink and opaque. Do not overcrowd the pan.',
      'Remove shrimp and let cool slightly.',
      'In a bowl, mash avocado with lime juice, cilantro, and a pinch of salt.',
      'Spoon a generous dollop of avocado mixture onto each lettuce leaf.',
      'Top with 3–4 shrimp per wrap. Add jalapeño slices if desired.',
      'Fold lettuce around filling and eat immediately — these do not store well.',
    ],
    macros: { calories: 340, protein: 28, carbs: 10, fats: 22, fibre: 6 },
    prepTime: 10,
    cookTime: 5,
    servings: 1,
    isActive: true,
    sortOrder: 13,
    accentColor: '#10b981',
    tags: ['light', 'summer-friendly', 'no-cook-option', 'low-carb', 'fresh'],
    imageUrl: '/images/recipes/if-nv-shrimp-lettuce-wraps.jpg',
    mealPlanSlugs: ['intermittent-fasting-non-veg'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DINNER — Window Closing Meal (Easy to Digest, Anti-Inflammatory)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: 'if-nv-dinner-herb-salmon-asparagus',
    name: 'Herb-Crusted Salmon with Asparagus',
    displayName: 'Herb-Crusted Salmon & Asparagus',
    tagline: 'Omega-3 rich. One pan. Window-closing perfection.',
    description: 'Dijon-almond crusted salmon baked with asparagus spears — a complete dinner on one tray, ready in 25 minutes.',
    longDescription: 'As your eating window closes, the final meal should be satisfying but not heavy — easy to digest and supportive of sleep. Salmon provides omega-3 fatty acids that reduce inflammation accumulated during the day, asparagus offers prebiotic fibre and natural diuretic properties, and the almond-dijon crust adds texture without breadcrumbs. Everything cooks on one tray for minimal cleanup.',
    whoIsItFor: 'Anyone who wants a nutritionally complete, easy-to-digest dinner that closes the eating window on a high note.',
    keyPrinciples: ['Omega-3 rich salmon for overnight anti-inflammation', 'One-pan preparation — minimal cleanup', 'Light but satisfying — not too heavy before the fasting window', 'Prebiotic asparagus for gut health', 'Low carb — supports overnight fat metabolism'],
    whatIsAvoided: ['Heavy red meat before fasting', 'Large carbohydrate loads at dinner', 'Fried foods', 'Excessive dairy before bed'],
    category: 'dinner',
    dietType: 'non-veg',
    fastingProtocol: '16:8',
    ingredients: [
      { name: 'Salmon fillet', quantity: '200g', notes: 'Skin-on, centre-cut' },
      { name: 'Asparagus spears', quantity: '12', notes: 'Trimmed' },
      { name: 'Dijon mustard', quantity: '1 tbsp', notes: 'Smooth, no added sugar' },
      { name: 'Almond flour', quantity: '2 tbsp', notes: 'Blanched' },
      { name: 'Fresh dill', quantity: '2 tbsp', notes: 'Chopped' },
      { name: 'Lemon', quantity: '1/2', notes: 'Sliced into rounds' },
      { name: 'Olive oil', quantity: '1 tbsp', notes: 'For asparagus' },
      { name: 'Garlic powder', quantity: '1/4 tsp', notes: 'Optional' },
    ],
    instructions: [
      'Preheat oven to 200°C (400°F). Line a baking sheet with parchment.',
      'Mix Dijon mustard, almond flour, dill, and garlic powder into a thick paste.',
      'Pat salmon dry. Spread mustard-almond paste evenly over the top of the fillet.',
      'Toss asparagus in olive oil, salt, and pepper. Arrange on one side of the baking sheet.',
      'Place salmon on the other side. Lay lemon slices over the salmon and asparagus.',
      'Bake for 12–15 minutes until salmon flakes easily and asparagus is tender.',
      'Serve immediately with an extra squeeze of lemon.',
    ],
    macros: { calories: 520, protein: 38, carbs: 10, fats: 36, fibre: 4 },
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    isActive: true,
    sortOrder: 20,
    accentColor: '#f59e0b',
    tags: ['omega-3', 'keto-friendly', 'one-pan', 'heart-healthy', 'window-closing', 'easy-digest'],
    imageUrl: '/images/recipes/if-nv-herb-salmon-asparagus.jpg',
    mealPlanSlugs: ['intermittent-fasting-non-veg'],
  },

  {
    slug: 'if-nv-dinner-lamb-mint-pesto',
    name: 'Lamb Chops with Mint Pesto',
    displayName: 'Lamb Chops & Mint Pesto',
    tagline: 'Mediterranean indulgence. Iron-rich. Satisfying.',
    description: 'Pan-seared lamb rib chops with a fresh mint-pine nut pesto — a rich, flavourful dinner for the end of your eating window.',
    longDescription: 'Lamb is one of the most nutrient-dense meats — rich in bioavailable iron, zinc, and B12. These rib chops are seared quickly for a perfect medium-rare, then paired with a bright mint pesto that cuts through the richness. This is a weekend-worthy dinner that happens to fit perfectly into an intermittent fasting protocol.',
    whoIsItFor: 'Those who want a more indulgent, flavour-forward dinner while staying within their fasting macros.',
    keyPrinciples: ['Bioavailable haem iron from lamb for energy and oxygen transport', 'Mint pesto for digestive support and freshness', 'Quick sear — lamb chops cook in under 10 minutes', 'High protein — 45g for muscle maintenance overnight', 'Mediterranean flavour profile'],
    whatIsAvoided: ['Overcooking lamb — medium-rare is optimal', 'Heavy starch sides', 'Cream-based sauces', 'Processed marinades'],
    category: 'dinner',
    dietType: 'non-veg',
    fastingProtocol: '16:8',
    ingredients: [
      { name: 'Lamb rib chops', quantity: '3', notes: 'About 300g total, room temperature' },
      { name: 'Fresh mint leaves', quantity: '1 cup', notes: 'Packed' },
      { name: 'Pine nuts', quantity: '2 tbsp', notes: 'Toasted lightly' },
      { name: 'Garlic', quantity: '1 clove', notes: 'Peeled' },
      { name: 'Extra virgin olive oil', quantity: '3 tbsp', notes: 'For pesto and cooking' },
      { name: 'Lemon juice', quantity: '1 tbsp', notes: 'Fresh' },
      { name: 'Fresh rosemary', quantity: '2 sprigs', notes: 'For seasoning' },
      { name: 'Sea salt', quantity: 'To taste', notes: 'Flaky' },
    ],
    instructions: [
      'Remove lamb chops from fridge 30 minutes before cooking. Pat dry and season with salt, pepper, and rosemary leaves.',
      'Heat a heavy pan over high heat until very hot. Add 1 tbsp olive oil.',
      'Sear lamb chops 3–4 minutes per side for medium-rare. Do not move them while searing — let crust form.',
      'Rest lamb on a warm plate for 5 minutes. This is essential for juicy meat.',
      'While lamb rests, blend mint, pine nuts, garlic, remaining olive oil, and lemon juice into a rough pesto. Season to taste.',
      'Plate lamb chops and spoon mint pesto generously over the top. Serve with a side of roasted vegetables if desired.',
    ],
    macros: { calories: 600, protein: 45, carbs: 8, fats: 42, fibre: 2 },
    prepTime: 15,
    cookTime: 10,
    servings: 1,
    isActive: true,
    sortOrder: 21,
    accentColor: '#a16207',
    tags: ['mediterranean', 'high-protein', 'iron-rich', 'indulgent', 'weekend-worthy'],
    imageUrl: '/images/recipes/if-nv-lamb-mint-pesto.jpg',
    mealPlanSlugs: ['intermittent-fasting-non-veg'],
  },

  {
    slug: 'if-nv-dinner-chicken-cauliflower-mash',
    name: 'Crispy Chicken Thighs with Cauliflower Mash',
    displayName: 'Crispy Chicken & Cauliflower Mash',
    tagline: 'Comfort food that fits your fasting window.',
    description: 'Roasted skin-on chicken thighs with garlic-parmesan cauliflower mash — the comfort of Sunday dinner without the carb load.',
    longDescription: 'Sometimes you need comfort food at the end of a fasting day. This dinner delivers exactly that — crispy, golden chicken skin, tender dark meat, and creamy cauliflower mash that rivals any potato dish. The garlic and parmesan in the mash add depth, while the chicken drippings create a natural pan sauce. Satisfying, nostalgic, and perfectly macro-aligned.',
    whoIsItFor: 'Anyone craving comfort food within their intermittent fasting plan without breaking their low-carb or keto approach.',
    keyPrinciples: ['Skin-on chicken thighs for flavour and satisfaction', 'Cauliflower mash replaces high-carb potatoes', 'Garlic and parmesan for depth of flavour', 'One-pan approach — chicken roasts while cauliflower steams', 'High satiety — prevents late-night hunger during fasting window'],
    whatIsAvoided: ['Potatoes or high-carb sides', 'Breaded or fried chicken', 'Heavy cream sauces', 'Sugar in any form'],
    category: 'dinner',
    dietType: 'non-veg',
    fastingProtocol: '16:8',
    ingredients: [
      { name: 'Chicken thighs', quantity: '2', notes: 'Skin-on, bone-in, about 250g total' },
      { name: 'Cauliflower', quantity: '1/2 head', notes: 'Cut into florets' },
      { name: 'Butter', quantity: '2 tbsp', notes: 'Divided' },
      { name: 'Garlic', quantity: '4 cloves', notes: '2 minced for mash, 2 smashed for roasting' },
      { name: 'Dried thyme', quantity: '1 tsp', notes: 'Or 1 tbsp fresh' },
      { name: 'Chicken stock', quantity: '1/2 cup', notes: 'Warm, low-sodium' },
      { name: 'Parmesan cheese', quantity: '20g', notes: 'Finely grated' },
      { name: 'Fresh parsley', quantity: '1 tbsp', notes: 'Chopped, for garnish' },
    ],
    instructions: [
      'Preheat oven to 200°C (400°F).',
      'Pat chicken thighs dry thoroughly — this is the secret to crispy skin. Season with salt, pepper, and thyme.',
      'Place chicken skin-side up on a roasting tray. Tuck smashed garlic cloves underneath. Roast for 35–40 minutes until skin is golden and internal temp is 74°C.',
      'While chicken roasts, steam cauliflower florets until very tender — 10–12 minutes.',
      'Drain cauliflower well. Transfer to a blender or food processor with 1 tbsp butter, minced garlic, parmesan, and warm chicken stock. Blend until completely smooth and creamy.',
      'Spoon cauliflower mash onto a plate. Place crispy chicken thighs on top.',
      'Pour any pan drippings over the chicken. Garnish with fresh parsley.',
    ],
    macros: { calories: 490, protein: 36, carbs: 12, fats: 32, fibre: 5 },
    prepTime: 15,
    cookTime: 40,
    servings: 1,
    isActive: true,
    sortOrder: 22,
    accentColor: '#eab308',
    tags: ['comfort-food', 'keto-friendly', 'satisfying', 'one-pan', 'family-friendly'],
    imageUrl: '/images/recipes/if-nv-chicken-cauliflower-mash.jpg',
    mealPlanSlugs: ['intermittent-fasting-non-veg'],
  },

  {
    slug: 'if-nv-dinner-mackerel-fennel-olives',
    name: 'Mackerel with Roasted Fennel & Olives',
    displayName: 'Mackerel, Fennel & Olives',
    tagline: 'Mediterranean anti-inflammatory. Bold flavours.',
    description: 'Roasted mackerel with caramelised fennel, cherry tomatoes, kalamata olives, and orange zest — a Mediterranean-inspired dinner rich in omega-3.',
    longDescription: 'Mackerel is one of the most omega-3 dense fish available — even more than salmon. Combined with roasted fennel (digestive-supportive and naturally sweet), briny olives, and bright orange zest, this dinner is a Mediterranean flavour explosion that happens to be one of the most anti-inflammatory meals in the entire recipe collection.',
    whoIsItFor: 'Fish lovers who want maximum omega-3 intake and bold Mediterranean flavours in their evening meal.',
    keyPrinciples: ['Mackerel — highest omega-3 of any common fish', 'Fennel aids digestion — ideal before fasting window', 'Olives provide healthy monounsaturated fats', 'Orange zest brightens rich fish flavours', 'Anti-inflammatory compounds in every component'],
    whatIsAvoided: ['Overcooking mackerel — it dries quickly', 'Heavy sauces that mask the fish', 'High-carb sides', 'Fried preparations'],
    category: 'dinner',
    dietType: 'non-veg',
    fastingProtocol: '16:8',
    ingredients: [
      { name: 'Mackerel fillets', quantity: '2', notes: 'About 200g total, pin-boned' },
      { name: 'Fennel bulb', quantity: '1 medium', notes: 'Trimmed, cut into wedges' },
      { name: 'Kalamata olives', quantity: '8', notes: 'Pitted' },
      { name: 'Cherry tomatoes', quantity: '1 cup', notes: 'On the vine if possible' },
      { name: 'Capers', quantity: '1 tbsp', notes: 'Drained' },
      { name: 'Olive oil', quantity: '2 tbsp', notes: 'Divided' },
      { name: 'Orange zest', quantity: '1 tsp', notes: 'Freshly grated, no pith' },
      { name: 'Fresh dill', quantity: '1 tbsp', notes: 'For garnish' },
    ],
    instructions: [
      'Preheat oven to 190°C (375°F).',
      'Toss fennel wedges with 1 tbsp olive oil, salt, and pepper. Arrange on a baking tray and roast for 20 minutes until starting to caramelise.',
      'Add cherry tomatoes, olives, and capers to the tray. Nestle mackerel fillets skin-side up among the vegetables.',
      'Drizzle remaining olive oil over the fish. Roast for another 12–15 minutes until fish is opaque and flakes easily.',
      'Remove from oven. Finish with orange zest and fresh dill.',
      'Serve directly from the tray for a rustic presentation, or plate individually.',
    ],
    macros: { calories: 460, protein: 32, carbs: 14, fats: 30, fibre: 5 },
    prepTime: 15,
    cookTime: 35,
    servings: 1,
    isActive: true,
    sortOrder: 23,
    accentColor: '#f97316',
    tags: ['mediterranean', 'omega-3', 'anti-inflammatory', 'digestive-friendly', 'bold-flavours'],
    imageUrl: '/images/recipes/if-nv-mackerel-fennel-olives.jpg',
    mealPlanSlugs: ['intermittent-fasting-non-veg'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5:2 FASTING — Fast Day Meals (Low Calorie, High Nutrient Density)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: 'if-nv-52-chicken-vegetable-soup',
    name: 'Light Chicken & Vegetable Soup',
    displayName: '5:2 Fast Day — Chicken Veg Soup',
    tagline: 'Warm. Satisfying. Under 300 calories.',
    description: 'A clear, nourishing chicken and vegetable soup designed for 5:2 fasting days — high protein, high volume, minimal calories.',
    longDescription: 'On a 5:2 fast day, every calorie must earn its place. This soup delivers 28g of protein in just 280 calories through a generous portion of chicken breast and a vegetable medley that provides volume and fibre to keep you full. The warm broth is psychologically satisfying on a low-calorie day, and the bay leaf and parsley add depth without calories.',
    whoIsItFor: 'Individuals practicing 5:2 intermittent fasting who need a filling, warm meal on their 500–600 calorie fast days.',
    keyPrinciples: ['Maximum protein per calorie — 28g protein in 280 kcal', 'High volume from vegetables for satiety', 'Warm broth for psychological satisfaction on fast days', 'Low sodium broth to prevent water retention', 'Simple preparation — one pot'],
    whatIsAvoided: ['High-calorie additions like noodles or rice', 'Cream or coconut milk', 'High-sodium stock cubes', 'Oils and fats'],
    category: 'lunch',
    dietType: 'non-veg',
    fastingProtocol: '5:2',
    ingredients: [
      { name: 'Chicken breast', quantity: '100g', notes: 'Skinless, diced small' },
      { name: 'Zucchini', quantity: '1 medium', notes: 'Diced' },
      { name: 'Celery', quantity: '2 stalks', notes: 'Sliced' },
      { name: 'Carrot', quantity: '1 small', notes: 'Diced' },
      { name: 'Low-sodium chicken broth', quantity: '3 cups', notes: 'Homemade or clean-label' },
      { name: 'Bay leaf', quantity: '1', notes: 'Dried' },
      { name: 'Fresh parsley', quantity: '2 tbsp', notes: 'Chopped' },
      { name: 'Black pepper', quantity: '1/4 tsp', notes: 'Freshly ground' },
    ],
    instructions: [
      'Bring chicken broth to a gentle simmer in a medium pot. Add bay leaf.',
      'Add diced chicken breast. Simmer for 15 minutes until cooked through.',
      'Remove chicken with a slotted spoon, shred with two forks, and return to the pot.',
      'Add zucchini, celery, and carrot. Simmer for 10 minutes until vegetables are tender but not mushy.',
      'Season with black pepper. Remove bay leaf.',
      'Ladle into a bowl and garnish generously with fresh parsley.',
    ],
    macros: { calories: 280, protein: 28, carbs: 18, fats: 10, fibre: 4 },
    prepTime: 10,
    cookTime: 25,
    servings: 1,
    isActive: true,
    sortOrder: 30,
    accentColor: '#22c55e',
    tags: ['5-2-fasting', 'fast-day', 'light', 'hydrating', 'volume-eating', 'one-pot'],
    imageUrl: '/images/recipes/if-nv-52-chicken-veg-soup.jpg',
    mealPlanSlugs: ['intermittent-fasting-non-veg'],
  },

  {
    slug: 'if-nv-52-white-fish-greens',
    name: 'White Fish with Steamed Greens',
    displayName: '5:2 Fast Day — White Fish & Greens',
    tagline: 'Lean protein. Minimal calories. Maximum nutrition.',
    description: 'Steamed cod or haddock on a bed of wilted spinach and green beans — the purest fast-day nutrition.',
    longDescription: 'This is the simplest, cleanest meal in the entire collection — and that is exactly its purpose. On a 5:2 fast day, simplicity prevents hidden calories. White fish provides 30g of pure protein with almost no fat, steamed greens deliver fibre and micronutrients with minimal calories, and the lemon-dill dressing adds flavour without compromise.',
    whoIsItFor: '5:2 fasters who want a dinner that is genuinely minimal — no hidden oils, no complex preparations, just clean nutrition.',
    keyPrinciples: ['Leanest possible protein — white fish is virtually fat-free', 'Steamed, not sautéed — zero added fat', 'Maximum micronutrients from green vegetables', 'Lemon and vinegar for flavour without calories', 'Under 300 calories but 30g protein'],
    whatIsAvoided: ['All added oils and fats', 'Butter on vegetables', 'Cream sauces', 'High-calorie marinades', 'Starchy sides'],
    category: 'dinner',
    dietType: 'non-veg',
    fastingProtocol: '5:2',
    ingredients: [
      { name: 'Cod or haddock fillet', quantity: '150g', notes: 'Fresh or thawed, patted dry' },
      { name: 'Spinach', quantity: '2 cups', notes: 'Washed' },
      { name: 'Green beans', quantity: '1 cup', notes: 'Trimmed' },
      { name: 'Lemon juice', quantity: '1 tbsp', notes: 'Fresh' },
      { name: 'Dried dill', quantity: '1 tsp', notes: 'Or 1 tbsp fresh' },
      { name: 'White wine vinegar', quantity: '1 tsp', notes: 'Optional' },
      { name: 'Black pepper', quantity: 'To taste', notes: 'Freshly ground' },
    ],
    instructions: [
      'Fill a pot with 2 inches of water and bring to a simmer. Place a steamer basket inside.',
      'Place fish fillet in the steamer basket. Cover and steam for 8–10 minutes until fish flakes easily with a fork.',
      'Remove fish and keep warm. Add green beans to the steamer basket. Steam for 4 minutes.',
      'Add spinach on top of beans and steam for 1 more minute until just wilted.',
      'Arrange spinach and green beans on a plate. Place steamed fish on top.',
      'Dress with lemon juice, white wine vinegar, and dill. Season with black pepper.',
    ],
    macros: { calories: 260, protein: 30, carbs: 8, fats: 10, fibre: 3 },
    prepTime: 5,
    cookTime: 12,
    servings: 1,
    isActive: true,
    sortOrder: 31,
    accentColor: '#3b82f6',
    tags: ['5-2-fasting', 'fast-day', 'lean-protein', 'minimal', 'steam-cooked', 'zero-oil'],
    imageUrl: '/images/recipes/if-nv-52-white-fish-greens.jpg',
    mealPlanSlugs: ['intermittent-fasting-non-veg'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OMAD — One Meal A Day (High Calorie, Complete Nutrition in One Sitting)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: 'if-nv-omad-mega-bowl',
    name: 'OMAD Mega Bowl: Steak, Eggs & Greens',
    displayName: 'OMAD Mega Bowl',
    tagline: 'One meal. Every nutrient. 1100 calories of precision.',
    description: 'The ultimate OMAD meal — ribeye steak, three eggs, a massive salad, avocado, feta, and pumpkin seeds. Everything your body needs in one sitting.',
    longDescription: 'OMAD (One Meal A Day) requires eating your entire daily nutrition in a single meal. This mega bowl is engineered to deliver complete macros, micronutrients, and satiety in one plate. The ribeye provides protein, creatine, and iron. Eggs add choline and additional protein. The massive salad delivers fibre, vitamins, and volume. Avocado and feta provide fats and calcium. Pumpkin seeds add zinc and magnesium. Every nutrient is accounted for.',
    whoIsItFor: 'OMAD practitioners who want a single, complete, nutrient-dense meal that covers all daily requirements without supplementation.',
    keyPrinciples: ['Complete daily nutrition in one meal — no gaps', 'Very high protein — 78g for muscle maintenance', 'High fibre — 10g from vegetables and seeds', 'Healthy fats from multiple sources — steak, eggs, avocado, feta, seeds', 'Hydration critical — drink 500ml water with this meal', 'Chew thoroughly — large meal requires good digestion'],
    whatIsAvoided: ['Refined carbs that displace nutrient-dense foods', 'Liquid calories', 'Alcohol', 'Desserts that waste caloric space'],
    category: 'dinner',
    dietType: 'non-veg',
    fastingProtocol: 'OMAD',
    ingredients: [
      { name: 'Ribeye steak', quantity: '250g', notes: 'Grass-fed, 2.5cm thick' },
      { name: 'Eggs', quantity: '3 large', notes: 'Sunny-side up' },
      { name: 'Mixed salad greens', quantity: '4 cups', notes: 'Rocket, spinach, lettuce, kale mix' },
      { name: 'Avocado', quantity: '1 whole', notes: 'Sliced' },
      { name: 'Extra virgin olive oil', quantity: '3 tbsp', notes: 'For dressing' },
      { name: 'Pumpkin seeds', quantity: '2 tbsp', notes: 'Raw or lightly toasted' },
      { name: 'Feta cheese', quantity: '40g', notes: 'Sheep or goat milk, crumbled' },
      { name: 'Cherry tomatoes', quantity: '1 cup', notes: 'Halved' },
      { name: 'Red onion', quantity: '1/4', notes: 'Sliced thin' },
      { name: 'Lemon juice', quantity: '1 tbsp', notes: 'For dressing' },
    ],
    instructions: [
      'Remove steak from fridge 40 minutes before cooking. Pat very dry and season aggressively with salt and pepper.',
      'Heat a heavy cast-iron pan until smoking. Sear ribeye 4 minutes per side for medium-rare. Rest 7 minutes — do not skip resting.',
      'While steak rests, fry eggs in steak drippings until whites are set but yolks remain runny.',
      'Toss mixed greens with olive oil, lemon juice, salt, and pepper in a large bowl. Add cherry tomatoes, red onion, and pumpkin seeds.',
      'Slice steak against the grain into thick strips.',
      'Assemble the mega bowl: greens base on one side, steak and eggs on the other, avocado and feta scattered throughout.',
      'Pour any resting juices from the steak over the meat. Eat slowly and chew thoroughly.',
    ],
    macros: { calories: 1100, protein: 78, carbs: 22, fats: 76, fibre: 10 },
    prepTime: 10,
    cookTime: 20,
    servings: 1,
    isActive: true,
    sortOrder: 40,
    accentColor: '#7c3aed',
    tags: ['OMAD', 'nutrient-dense', 'satiating', 'high-calorie', 'complete-nutrition', 'steak'],
    imageUrl: '/images/recipes/if-nv-omad-mega-bowl.jpg',
    mealPlanSlugs: ['intermittent-fasting-non-veg'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SNACKS — Within the Eating Window (High Protein, Portable)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: 'if-nv-snack-eggs-salmon-bites',
    name: 'Boiled Eggs with Smoked Salmon Bites',
    displayName: 'Egg & Salmon Bites',
    tagline: 'The perfect fasting-window snack. Zero prep.',
    description: 'Hard-boiled eggs wrapped in smoked salmon with capers and lemon — a two-minute snack delivering 18g protein.',
    longDescription: 'Snacks within the intermittent fasting window should serve a purpose: bridge the gap between meals, add protein, or prevent overeating at the next meal. These egg and salmon bites take 2 minutes to assemble, require no cooking if eggs are pre-boiled, and deliver high-quality protein and omega-3 without any carbs. Keep boiled eggs in your fridge at all times.',
    whoIsItFor: 'Anyone who needs a quick, no-cook, high-protein snack between their fasting-window meals.',
    keyPrinciples: ['No cooking required if eggs are pre-boiled', '18g protein in a 220-calorie snack', 'Omega-3 from salmon', 'Zero carbs — no blood sugar impact', 'Portable — can be packed for work'],
    whatIsAvoided: ['Carb-heavy snacks', 'Processed protein bars', 'Sugar', 'Seed oils'],
    category: 'snack',
    dietType: 'non-veg',
    fastingProtocol: '16:8',
    ingredients: [
      { name: 'Eggs', quantity: '2', notes: 'Hard-boiled, peeled' },
      { name: 'Smoked salmon', quantity: '50g', notes: 'Sliced thin' },
      { name: 'Capers', quantity: '1 tsp', notes: 'Drained' },
      { name: 'Lemon wedge', quantity: '1', notes: 'For squeezing' },
    ],
    instructions: [
      'Halve the boiled eggs lengthwise.',
      'Wrap each half with a piece of smoked salmon, securing the salmon around the egg.',
      'Top each bite with 2–3 capers.',
      'Arrange on a plate and squeeze fresh lemon over everything just before eating.',
    ],
    macros: { calories: 220, protein: 18, carbs: 2, fats: 16, fibre: 0 },
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    isActive: true,
    sortOrder: 50,
    accentColor: '#ec4899',
    tags: ['quick', 'no-cook', 'high-protein', 'portable', 'snack', 'omega-3'],
    imageUrl: '/images/recipes/if-nv-snack-eggs-salmon.jpg',
    mealPlanSlugs: ['intermittent-fasting-non-veg'],
  },

  {
    slug: 'if-nv-snack-chicken-liver-pate',
    name: 'Chicken Liver Pâté with Cucumber Rounds',
    displayName: 'Chicken Liver Pâté',
    tagline: 'Nutrient density in every bite. Iron. B12. Vitamin A.',
    description: 'A rich, homemade chicken liver pâté on fresh cucumber rounds — the most nutrient-dense snack in the collection.',
    longDescription: 'Chicken liver is arguably the most nutrient-dense food on the planet — gram for gram, it contains more iron, B12, Vitamin A, and folate than almost any other food. This pâté transforms liver into a delicious, spreadable snack that sits on hydrating cucumber rounds. Make a batch on Sunday; it lasts 5 days refrigerated and improves in flavour after 24 hours.',
    whoIsItFor: 'Nutrition maximisers who want the highest micronutrient return from their snack calories.',
    keyPrinciples: ['Maximum nutrient density — iron, B12, Vitamin A, folate', 'Make ahead — stores 5 days', 'Cucumber provides hydration and crunch without calories', 'Cognac or brandy adds depth (optional, cooks off)', 'Traditional French technique adapted for fasting protocols'],
    whatIsAvoided: ['Processed store-bought pâtés with additives', 'Bread or crackers (use cucumber instead)', 'Excess butter — just enough for texture'],
    category: 'snack',
    dietType: 'non-veg',
    fastingProtocol: '16:8',
    ingredients: [
      { name: 'Chicken liver', quantity: '100g', notes: 'Fresh, cleaned, trimmed' },
      { name: 'Butter', quantity: '30g', notes: 'Unsalted, divided' },
      { name: 'Shallot or onion', quantity: '1/4 small', notes: 'Diced fine' },
      { name: 'Cognac or brandy', quantity: '1 tbsp', notes: 'Optional, for deglazing' },
      { name: 'Cucumber', quantity: '1 medium', notes: 'Sliced into 1cm rounds' },
      { name: 'Fresh thyme', quantity: '1/2 tsp', notes: 'Leaves only, chopped' },
      { name: 'Sea salt', quantity: '1/2 tsp', notes: 'Or to taste' },
      { name: 'Black pepper', quantity: '1/4 tsp', notes: 'Freshly ground' },
    ],
    instructions: [
      'Melt half the butter in a pan over medium heat. Add shallot and cook until soft — 2 minutes.',
      'Add chicken livers in a single layer. Cook 3 minutes per side until browned outside but slightly pink inside. Do not overcook — liver becomes grainy.',
      'If using cognac, add to the pan and let bubble for 30 seconds to deglaze.',
      'Transfer liver, shallots, and pan juices to a food processor. Add remaining butter, thyme, salt, and pepper.',
      'Blend until completely smooth — about 1 minute. Scrape sides and blend again.',
      'Transfer to a small ramekin, press plastic wrap directly onto the surface to prevent oxidation, and refrigerate for at least 1 hour (preferably overnight).',
      'To serve, spread a generous layer onto cucumber rounds. Garnish with extra thyme if desired.',
    ],
    macros: { calories: 240, protein: 16, carbs: 4, fats: 18, fibre: 1 },
    prepTime: 10,
    cookTime: 10,
    servings: 4,
    isActive: true,
    sortOrder: 51,
    accentColor: '#8b5cf6',
    tags: ['nutrient-dense', 'iron-rich', 'prep-ahead', 'liver', 'keto-friendly', 'paleo'],
    imageUrl: '/images/recipes/if-nv-snack-chicken-liver-pate.jpg',
    mealPlanSlugs: ['intermittent-fasting-non-veg'],
  },

]

// ---------------------------------------------------------------------------
// SEED FUNCTION
// ---------------------------------------------------------------------------

async function seedRecipes() {
  console.log('🌱 Starting Intermittent Fasting Non-Veg recipe seed...')
  console.log(`📋 Total recipes to seed: ${recipes.length}`)

  let created = 0
  let skipped = 0
  let failed = 0

  for (const recipe of recipes) {
    try {
      // Adjust field names below to match your Prisma Recipe schema
      const existing = await prisma.recipe.findUnique({
        where: { slug: recipe.slug },
      })

      if (existing) {
        console.log(`⏭️  Skipping (exists): ${recipe.displayName}`)
        skipped++
        continue
      }

      await prisma.recipe.create({
        data: {
          slug: recipe.slug,
          name: recipe.name,
          displayName: recipe.displayName,
          tagline: recipe.tagline,
          description: recipe.description,
          longDescription: recipe.longDescription,
          whoIsItFor: recipe.whoIsItFor,
          keyPrinciples: recipe.keyPrinciples,
          whatIsAvoided: recipe.whatIsAvoided,
          category: recipe.category,
          dietType: recipe.dietType,
          fastingProtocol: recipe.fastingProtocol,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          macros: recipe.macros,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          isActive: recipe.isActive,
          sortOrder: recipe.sortOrder,
          accentColor: recipe.accentColor,
          tags: recipe.tags,
          imageUrl: recipe.imageUrl,
          // If you have a MealPlan relation, connect via mealPlanSlugs:
          // mealPlans: {
          //   connect: recipe.mealPlanSlugs.map((s: string) => ({ slug: s })),
          // },
        },
      })

      console.log(`✅ Created: ${recipe.displayName}`)
      created++
    } catch (err) {
      console.error(`❌ Failed: ${recipe.displayName}`, err)
      failed++
    }
  }

  console.log('\n─────────────────────────────────────────────────────')
  console.log(`✅ Created  : ${created} recipes`)
  console.log(`⏭️  Skipped  : ${skipped} recipes (already existed)`)
  console.log(`❌ Failed   : ${failed} recipes`)
  console.log(`📋 Total    : ${recipes.length} recipes in this seed`)
  console.log('─────────────────────────────────────────────────────')

  if (created > 0) {
    console.log('\n📊 Breakdown by category:')
    const byCat: Record<string, number> = {}
    for (const r of recipes) {
      byCat[r.category] = (byCat[r.category] || 0) + 1
    }
    for (const [cat, count] of Object.entries(byCat)) {
      console.log(`   ${cat}: ${count} recipes`)
    }

    console.log('\n📊 Breakdown by fasting protocol:')
    const byProto: Record<string, number> = {}
    for (const r of recipes) {
      byProto[r.fastingProtocol] = (byProto[r.fastingProtocol] || 0) + 1
    }
    for (const [proto, count] of Object.entries(byProto)) {
      console.log(`   ${proto}: ${count} recipes`)
    }
  }

  console.log('\n🎉 Intermittent Fasting Non-Veg recipe seed complete!')
}

// ---------------------------------------------------------------------------
// RUN
// ---------------------------------------------------------------------------

seedRecipes()
  .catch((e) => {
    console.error('💥 Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
