/**
 * FitFuel Phase 9 — Seed Data: Vegetarian Muscle Gain Recipes
 * High-protein vegetarian recipes optimized for muscle building and mass gain.
 * Source of truth: seed-meal-plans.ts (103 variants)
 */

export interface MacroNutrients {
  protein: number;      // grams
  carbs: number;        // grams
  fats: number;         // grams
  fiber: number;        // grams
  calories: number;     // kcal
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface Recipe {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre-workout' | 'post-workout' | 'smoothie';
  cuisine: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  macros: MacroNutrients;
  macrosPerServing: MacroNutrients;
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[];
  dietaryTags: string[];
  imageUrl?: string;
  videoUrl?: string;
  tips?: string[];
  storageInstructions?: string;
  isPremium: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// RECIPES
// ─────────────────────────────────────────────────────────────────────────────

export const recipes: Recipe[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // BREAKFAST
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'veg-mg-001',
    name: 'Paneer Bhurji Scramble with Avocado Toast',
    slug: 'paneer-bhurji-avocado-toast',
    description:
      'A high-protein Indian-inspired scramble made with crumbled paneer, spices, and served on whole-grain avocado toast. Perfect for starting your day with sustained energy.',
    category: 'breakfast',
    cuisine: 'Indo-Western Fusion',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    difficulty: 'easy',
    macros: {
      protein: 42,
      carbs: 48,
      fats: 38,
      fiber: 14,
      calories: 640,
    },
    macrosPerServing: {
      protein: 21,
      carbs: 24,
      fats: 19,
      fiber: 7,
      calories: 320,
    },
    ingredients: [
      { name: 'Paneer (cottage cheese), crumbled', quantity: 200, unit: 'g' },
      { name: 'Whole grain bread', quantity: 4, unit: 'slices' },
      { name: 'Ripe avocado', quantity: 1, unit: 'large' },
      { name: 'Onion, finely chopped', quantity: 1, unit: 'medium' },
      { name: 'Tomato, chopped', quantity: 1, unit: 'medium' },
      { name: 'Green chili, minced', quantity: 1, unit: 'piece' },
      { name: 'Turmeric powder', quantity: 0.5, unit: 'tsp' },
      { name: 'Cumin seeds', quantity: 0.5, unit: 'tsp' },
      { name: 'Garam masala', quantity: 0.25, unit: 'tsp' },
      { name: 'Fresh coriander, chopped', quantity: 2, unit: 'tbsp' },
      { name: 'Olive oil', quantity: 1, unit: 'tbsp' },
      { name: 'Lemon juice', quantity: 1, unit: 'tsp' },
      { name: 'Salt', quantity: 0, unit: 'to taste' },
      { name: 'Black pepper', quantity: 0, unit: 'to taste' },
    ],
    instructions: [
      'Heat olive oil in a pan. Add cumin seeds and let them sizzle.',
      'Add onions and green chili. Sauté until onions turn golden brown.',
      'Add tomatoes, turmeric, and salt. Cook until tomatoes soften.',
      'Add crumbled paneer and garam masala. Mix well and cook for 5 minutes.',
      'Garnish with fresh coriander and set aside.',
      'Toast the whole grain bread slices until golden and crisp.',
      'Mash the avocado with lemon juice, salt, and pepper.',
      'Spread avocado on toast and top generously with paneer bhurji.',
      'Serve immediately with extra coriander garnish.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegetarian', 'breakfast', 'indian', 'quick'],
    dietaryTags: ['vegetarian', 'soy-free', 'nut-free'],
    tips: [
      'Use fresh homemade paneer for the best texture.',
      'Add a pinch of chaat masala for extra tang.',
    ],
    storageInstructions: 'Refrigerate paneer bhurji separately for up to 2 days. Assemble fresh before serving.',
    isPremium: false,
    rating: 4.7,
    reviewCount: 312,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-05-10T14:30:00Z',
  },

  {
    id: 'veg-mg-002',
    name: 'Greek Yogurt Protein Parfait with Quinoa Granola',
    slug: 'greek-yogurt-quinoa-parfait',
    description:
      'Layers of thick Greek yogurt, homemade quinoa granola, mixed berries, and a drizzle of honey. A probiotic-rich, protein-packed breakfast bowl.',
    category: 'breakfast',
    cuisine: 'Mediterranean',
    prepTimeMinutes: 8,
    cookTimeMinutes: 12,
    servings: 1,
    difficulty: 'easy',
    macros: {
      protein: 38,
      carbs: 52,
      fats: 18,
      fiber: 8,
      calories: 520,
    },
    macrosPerServing: {
      protein: 38,
      carbs: 52,
      fats: 18,
      fiber: 8,
      calories: 520,
    },
    ingredients: [
      { name: 'Greek yogurt (full-fat, unsweetened)', quantity: 300, unit: 'g' },
      { name: 'Quinoa granola (homemade)', quantity: 60, unit: 'g' },
      { name: 'Mixed berries (blueberries, strawberries, raspberries)', quantity: 150, unit: 'g' },
      { name: 'Chia seeds', quantity: 1, unit: 'tbsp' },
      { name: 'Raw honey', quantity: 1, unit: 'tbsp' },
      { name: 'Almond butter', quantity: 1, unit: 'tbsp', notes: 'optional, for extra calories' },
      { name: 'Cinnamon powder', quantity: 0.25, unit: 'tsp' },
    ],
    instructions: [
      'In a glass or bowl, add a base layer of Greek yogurt (about 100g).',
      'Sprinkle a layer of quinoa granola and a handful of mixed berries.',
      'Repeat the layering process twice more.',
      'Top with chia seeds, a drizzle of honey, and a dusting of cinnamon.',
      'If using, drizzle almond butter over the top for extra healthy fats.',
      'Serve immediately or refrigerate for up to 2 hours for a thicker texture.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegetarian', 'breakfast', 'no-cook', 'probiotics'],
    dietaryTags: ['vegetarian', 'gluten-free', 'refined-sugar-free'],
    tips: [
      'Make a big batch of quinoa granola on Sunday for the whole week.',
      'Use frozen berries in off-season months — they are just as nutritious.',
    ],
    storageInstructions: 'Assembled parfait best consumed immediately. Granola can be stored in an airtight container for 2 weeks.',
    isPremium: false,
    rating: 4.6,
    reviewCount: 278,
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-05-12T11:00:00Z',
  },

  {
    id: 'veg-mg-003',
    name: 'Tofu Scramble with Spinach & Nutritional Yeast',
    slug: 'tofu-scramble-spinach-nutritional-yeast',
    description:
      'A vegan-friendly scramble using extra-firm tofu, wilted spinach, and nutritional yeast for a cheesy, umami flavor. Packed with iron and complete protein.',
    category: 'breakfast',
    cuisine: 'American',
    prepTimeMinutes: 5,
    cookTimeMinutes: 12,
    servings: 2,
    difficulty: 'easy',
    macros: {
      protein: 36,
      carbs: 14,
      fats: 24,
      fiber: 6,
      calories: 420,
    },
    macrosPerServing: {
      protein: 18,
      carbs: 7,
      fats: 12,
      fiber: 3,
      calories: 210,
    },
    ingredients: [
      { name: 'Extra-firm tofu, pressed and crumbled', quantity: 300, unit: 'g' },
      { name: 'Fresh spinach, roughly chopped', quantity: 100, unit: 'g' },
      { name: 'Nutritional yeast', quantity: 2, unit: 'tbsp' },
      { name: 'Turmeric powder', quantity: 0.5, unit: 'tsp' },
      { name: 'Garlic powder', quantity: 0.5, unit: 'tsp' },
      { name: 'Onion powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Black salt (kala namak)', quantity: 0.25, unit: 'tsp', notes: 'for eggy flavor' },
      { name: 'Olive oil', quantity: 1, unit: 'tbsp' },
      { name: 'Cherry tomatoes, halved', quantity: 100, unit: 'g' },
      { name: 'Whole wheat toast (optional)', quantity: 2, unit: 'slices' },
    ],
    instructions: [
      'Press tofu for 10 minutes to remove excess water, then crumble into small pieces.',
      'Heat olive oil in a non-stick pan over medium heat.',
      'Add crumbled tofu and cook for 3-4 minutes until slightly golden.',
      'Sprinkle turmeric, garlic powder, onion powder, and black salt. Mix well.',
      'Add nutritional yeast and stir until tofu is evenly coated and yellow.',
      'Toss in spinach and cherry tomatoes. Cook until spinach wilts (about 2 minutes).',
      'Serve hot with whole wheat toast on the side if desired.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegan', 'breakfast', 'iron-rich', 'quick'],
    dietaryTags: ['vegan', 'dairy-free', 'nut-free', 'soy-based'],
    tips: [
      'Black salt (kala namak) is the secret to an egg-like flavor.',
      'Add a splash of unsweetened soy milk for creamier texture.',
    ],
    storageInstructions: 'Refrigerate in an airtight container for up to 3 days. Reheat in a pan for best texture.',
    isPremium: false,
    rating: 4.5,
    reviewCount: 195,
    createdAt: '2026-02-01T07:30:00Z',
    updatedAt: '2026-05-15T10:00:00Z',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LUNCH
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'veg-mg-004',
    name: 'Rajma Chawal Power Bowl',
    slug: 'rajma-chawal-power-bowl',
    description:
      'The ultimate comfort food turned muscle fuel. Slow-cooked kidney beans in aromatic spices served over basmati rice with a side of cucumber raita.',
    category: 'lunch',
    cuisine: 'North Indian',
    prepTimeMinutes: 15,
    cookTimeMinutes: 45,
    servings: 3,
    difficulty: 'medium',
    macros: {
      protein: 54,
      carbs: 128,
      fats: 24,
      fiber: 28,
      calories: 920,
    },
    macrosPerServing: {
      protein: 18,
      carbs: 43,
      fats: 8,
      fiber: 9,
      calories: 307,
    },
    ingredients: [
      { name: 'Kidney beans (rajma), soaked overnight', quantity: 200, unit: 'g', notes: 'dry weight' },
      { name: 'Basmati rice', quantity: 150, unit: 'g', notes: 'dry weight' },
      { name: 'Onion, finely chopped', quantity: 2, unit: 'large' },
      { name: 'Tomato, pureed', quantity: 3, unit: 'medium' },
      { name: 'Ginger-garlic paste', quantity: 1.5, unit: 'tbsp' },
      { name: 'Green chili, slit', quantity: 2, unit: 'pieces' },
      { name: 'Cumin seeds', quantity: 1, unit: 'tsp' },
      { name: 'Bay leaf', quantity: 2, unit: 'pieces' },
      { name: 'Cinnamon stick', quantity: 1, unit: 'inch piece' },
      { name: 'Turmeric powder', quantity: 0.5, unit: 'tsp' },
      { name: 'Red chili powder', quantity: 1, unit: 'tsp' },
      { name: 'Coriander powder', quantity: 1.5, unit: 'tsp' },
      { name: 'Garam masala', quantity: 1, unit: 'tsp' },
      { name: 'Kasuri methi (dried fenugreek leaves)', quantity: 1, unit: 'tsp' },
      { name: 'Ghee', quantity: 2, unit: 'tbsp' },
      { name: 'Fresh coriander, chopped', quantity: 3, unit: 'tbsp' },
      { name: 'Cucumber raita', quantity: 150, unit: 'g', notes: 'yogurt + cucumber + cumin' },
    ],
    instructions: [
      'Pressure cook soaked kidney beans with salt and bay leaf until soft (about 6-7 whistles).',
      'Rinse basmati rice and cook separately with 1:2 water ratio until fluffy.',
      'Heat ghee in a deep pan. Add cumin seeds, bay leaf, and cinnamon. Let them crackle.',
      'Add onions and sauté until deep golden brown (this is key for flavor).',
      'Add ginger-garlic paste and green chilies. Sauté for 2 minutes.',
      'Add tomato puree and cook until oil separates from the masala.',
      'Add turmeric, red chili powder, and coriander powder. Mix well.',
      'Add cooked kidney beans with their water. Simmer for 15 minutes.',
      'Mash some beans against the pan to thicken the gravy.',
      'Add garam masala and kasuri methi. Crush methi between palms before adding.',
      'Garnish with fresh coriander and serve hot over rice with cucumber raita.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegetarian', 'lunch', 'indian', 'comfort-food', 'meal-prep'],
    dietaryTags: ['vegetarian', 'gluten-free', 'nut-free'],
    tips: [
      'The longer you simmer rajma, the better the flavor.',
      'Use an Instant Pot to reduce cooking time by half.',
      'Double the batch — rajma tastes better the next day!',
    ],
    storageInstructions: 'Refrigerate for up to 4 days. Freezes well for up to 2 months.',
    isPremium: false,
    rating: 4.9,
    reviewCount: 892,
    createdAt: '2026-01-10T11:00:00Z',
    updatedAt: '2026-05-18T16:00:00Z',
  },

  {
    id: 'veg-mg-005',
    name: 'Quinoa & Chickpea Mediterranean Bowl',
    slug: 'quinoa-chickpea-mediterranean-bowl',
    description:
      'A vibrant, nutrient-dense bowl with fluffy quinoa, roasted chickpeas, feta cheese, olives, and a lemon-tahini dressing. Complete amino acid profile for muscle repair.',
    category: 'lunch',
    cuisine: 'Mediterranean',
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    servings: 2,
    difficulty: 'easy',
    macros: {
      protein: 32,
      carbs: 68,
      fats: 28,
      fiber: 16,
      calories: 620,
    },
    macrosPerServing: {
      protein: 16,
      carbs: 34,
      fats: 14,
      fiber: 8,
      calories: 310,
    },
    ingredients: [
      { name: 'Quinoa, rinsed', quantity: 150, unit: 'g', notes: 'dry weight' },
      { name: 'Chickpeas (canned or cooked)', quantity: 400, unit: 'g', notes: 'drained' },
      { name: 'Cucumber, diced', quantity: 1, unit: 'medium' },
      { name: 'Cherry tomatoes, halved', quantity: 150, unit: 'g' },
      { name: 'Red onion, thinly sliced', quantity: 0.5, unit: 'medium' },
      { name: 'Kalamata olives, pitted', quantity: 60, unit: 'g' },
      { name: 'Feta cheese, crumbled', quantity: 80, unit: 'g' },
      { name: 'Fresh parsley, chopped', quantity: 0.25, unit: 'cup' },
      { name: 'Tahini', quantity: 2, unit: 'tbsp' },
      { name: 'Lemon juice', quantity: 2, unit: 'tbsp' },
      { name: 'Olive oil', quantity: 2, unit: 'tbsp' },
      { name: 'Garlic, minced', quantity: 2, unit: 'cloves' },
      { name: 'Cumin powder', quantity: 0.5, unit: 'tsp' },
      { name: 'Paprika', quantity: 0.5, unit: 'tsp' },
      { name: 'Salt', quantity: 0, unit: 'to taste' },
      { name: 'Black pepper', quantity: 0, unit: 'to taste' },
    ],
    instructions: [
      'Cook quinoa in 300ml water with a pinch of salt. Bring to boil, then simmer covered for 15 minutes. Fluff with fork.',
      'Preheat oven to 200°C (400°F).',
      'Pat chickpeas dry. Toss with 1 tbsp olive oil, cumin, paprika, salt, and pepper.',
      'Roast chickpeas on a baking sheet for 20 minutes until crispy, shaking halfway.',
      'Whisk tahini, lemon juice, remaining olive oil, minced garlic, and 2 tbsp water to make dressing.',
      'In a large bowl, combine cooked quinoa, roasted chickpeas, cucumber, tomatoes, red onion, and olives.',
      'Drizzle with tahini dressing and toss gently.',
      'Top with crumbled feta and fresh parsley.',
      'Serve immediately or pack for meal prep.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegetarian', 'lunch', 'mediterranean', 'meal-prep', 'complete-protein'],
    dietaryTags: ['vegetarian', 'gluten-free', 'nut-free'],
    tips: [
      'Add roasted sweet potato cubes for extra carbs and calories.',
      'Toast the quinoa in a dry pan before cooking for a nuttier flavor.',
    ],
    storageInstructions: 'Store components separately for up to 4 days. Assemble with dressing just before eating.',
    isPremium: true,
    rating: 4.8,
    reviewCount: 445,
    createdAt: '2026-01-25T12:00:00Z',
    updatedAt: '2026-05-14T13:30:00Z',
  },

  {
    id: 'veg-mg-006',
    name: 'Palak Paneer with Millet Roti',
    slug: 'palak-paneer-millet-roti',
    description:
      'Creamy spinach curry loaded with soft paneer cubes, served with fiber-rich millet roti. A classic muscle-building combo with iron, calcium, and protein.',
    category: 'lunch',
    cuisine: 'North Indian',
    prepTimeMinutes: 20,
    cookTimeMinutes: 30,
    servings: 3,
    difficulty: 'medium',
    macros: {
      protein: 48,
      carbs: 72,
      fats: 42,
      fiber: 18,
      calories: 810,
    },
    macrosPerServing: {
      protein: 16,
      carbs: 24,
      fats: 14,
      fiber: 6,
      calories: 270,
    },
    ingredients: [
      { name: 'Fresh spinach, blanched and pureed', quantity: 500, unit: 'g' },
      { name: 'Paneer, cubed', quantity: 250, unit: 'g' },
      { name: 'Onion, chopped', quantity: 1, unit: 'large' },
      { name: 'Tomato, chopped', quantity: 2, unit: 'medium' },
      { name: 'Green chili, chopped', quantity: 2, unit: 'pieces' },
      { name: 'Ginger-garlic paste', quantity: 1, unit: 'tbsp' },
      { name: 'Cumin seeds', quantity: 1, unit: 'tsp' },
      { name: 'Turmeric powder', quantity: 0.5, unit: 'tsp' },
      { name: 'Coriander powder', quantity: 1, unit: 'tsp' },
      { name: 'Garam masala', quantity: 0.5, unit: 'tsp' },
      { name: 'Kasuri methi', quantity: 1, unit: 'tsp' },
      { name: 'Fresh cream', quantity: 2, unit: 'tbsp' },
      { name: 'Ghee', quantity: 2, unit: 'tbsp' },
      { name: 'Bajra (pearl millet) flour', quantity: 200, unit: 'g' },
      { name: 'Warm water', quantity: 120, unit: 'ml', notes: 'for dough' },
      { name: 'Salt', quantity: 0, unit: 'to taste' },
    ],
    instructions: [
      'Blanch spinach in boiling water for 2 minutes. Transfer to ice water, then blend to a smooth puree.',
      'Heat 1 tbsp ghee. Add cumin seeds, then onions. Sauté until golden.',
      'Add ginger-garlic paste and green chilies. Cook for 2 minutes.',
      'Add tomatoes and cook until mushy. Add turmeric and coriander powder.',
      'Add spinach puree and simmer for 10 minutes.',
      'Add paneer cubes, garam masala, and kasuri methi. Simmer 5 more minutes.',
      'Stir in fresh cream and remove from heat.',
      'For millet roti: Mix bajra flour with salt. Add warm water gradually to form firm dough.',
      'Roll or pat into thin circles (use plastic wrap to prevent sticking).',
      'Cook on a hot griddle with a little ghee until brown spots appear.',
      'Serve palak paneer hot with millet roti.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegetarian', 'lunch', 'indian', 'iron-rich', 'calcium-rich'],
    dietaryTags: ['vegetarian', 'gluten-free', 'nut-free', 'soy-free'],
    tips: [
      'Don’t overcook spinach puree — it loses its vibrant green color.',
      'Millet roti is best eaten fresh; it hardens when cold.',
    ],
    storageInstructions: 'Palak paneer stores for 3 days refrigerated. Make fresh rotis daily.',
    isPremium: false,
    rating: 4.8,
    reviewCount: 670,
    createdAt: '2026-02-05T11:30:00Z',
    updatedAt: '2026-05-16T15:00:00Z',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DINNER
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'veg-mg-007',
    name: 'Lentil Bolognese with Whole Wheat Pasta',
    slug: 'lentil-bolognese-whole-wheat-pasta',
    description:
      'A hearty, slow-simmered lentil and mushroom bolognese sauce over whole wheat penne. High in protein, fiber, and complex carbs for overnight muscle recovery.',
    category: 'dinner',
    cuisine: 'Italian',
    prepTimeMinutes: 15,
    cookTimeMinutes: 40,
    servings: 4,
    difficulty: 'medium',
    macros: {
      protein: 56,
      carbs: 112,
      fats: 28,
      fiber: 32,
      calories: 920,
    },
    macrosPerServing: {
      protein: 14,
      carbs: 28,
      fats: 7,
      fiber: 8,
      calories: 230,
    },
    ingredients: [
      { name: 'Brown lentils, rinsed', quantity: 200, unit: 'g', notes: 'dry weight' },
      { name: 'Whole wheat penne', quantity: 300, unit: 'g', notes: 'dry weight' },
      { name: 'Cremini mushrooms, finely chopped', quantity: 300, unit: 'g' },
      { name: 'Onion, diced', quantity: 1, unit: 'large' },
      { name: 'Carrot, finely diced', quantity: 2, unit: 'medium' },
      { name: 'Celery stalks, diced', quantity: 2, unit: 'pieces' },
      { name: 'Garlic, minced', quantity: 4, unit: 'cloves' },
      { name: 'Tomato paste', quantity: 3, unit: 'tbsp' },
      { name: 'Canned crushed tomatoes', quantity: 800, unit: 'g' },
      { name: 'Vegetable broth', quantity: 500, unit: 'ml' },
      { name: 'Dried oregano', quantity: 1, unit: 'tsp' },
      { name: 'Dried basil', quantity: 1, unit: 'tsp' },
      { name: 'Red chili flakes', quantity: 0.5, unit: 'tsp', notes: 'optional' },
      { name: 'Olive oil', quantity: 2, unit: 'tbsp' },
      { name: 'Parmesan cheese, grated', quantity: 60, unit: 'g' },
      { name: 'Fresh basil leaves', quantity: 0.25, unit: 'cup' },
      { name: 'Salt', quantity: 0, unit: 'to taste' },
      { name: 'Black pepper', quantity: 0, unit: 'to taste' },
    ],
    instructions: [
      'Cook lentils in boiling water for 20 minutes until tender but not mushy. Drain and set aside.',
      'Cook whole wheat penne according to package instructions. Reserve 1 cup pasta water before draining.',
      'Heat olive oil in a large pot over medium heat.',
      'Add onions, carrots, and celery. Sauté for 8 minutes until softened.',
      'Add mushrooms and cook until they release moisture and brown (about 7 minutes).',
      'Add garlic, tomato paste, oregano, basil, and chili flakes. Cook for 2 minutes.',
      'Add crushed tomatoes and vegetable broth. Bring to a simmer.',
      'Add cooked lentils and simmer for 15 minutes until sauce thickens.',
      'Toss cooked pasta with the lentil bolognese sauce. Add reserved pasta water if needed.',
      'Serve topped with grated Parmesan and fresh basil.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegetarian', 'dinner', 'italian', 'comfort-food', 'meal-prep'],
    dietaryTags: ['vegetarian', 'nut-free', 'soy-free'],
    tips: [
      'Pulse mushrooms in a food processor for a finer, meat-like texture.',
      'Add a splash of red wine for deeper flavor.',
      'This sauce tastes even better the next day!',
    ],
    storageInstructions: 'Sauce stores for 5 days refrigerated or 3 months frozen. Pasta best cooked fresh.',
    isPremium: false,
    rating: 4.7,
    reviewCount: 523,
    createdAt: '2026-02-10T18:00:00Z',
    updatedAt: '2026-05-17T19:00:00Z',
  },

  {
    id: 'veg-mg-008',
    name: 'Stuffed Bell Peppers with Black Bean & Quinoa',
    slug: 'stuffed-bell-peppers-black-bean-quinoa',
    description:
      'Colorful bell peppers stuffed with a savory mixture of black beans, quinoa, corn, and melted cheese. Baked to perfection for a satisfying, protein-rich dinner.',
    category: 'dinner',
    cuisine: 'Mexican-Inspired',
    prepTimeMinutes: 20,
    cookTimeMinutes: 35,
    servings: 4,
    difficulty: 'medium',
    macros: {
      protein: 48,
      carbs: 96,
      fats: 32,
      fiber: 28,
      calories: 840,
    },
    macrosPerServing: {
      protein: 12,
      carbs: 24,
      fats: 8,
      fiber: 7,
      calories: 210,
    },
    ingredients: [
      { name: 'Large bell peppers (mixed colors)', quantity: 4, unit: 'pieces', notes: 'halved and seeded' },
      { name: 'Quinoa, cooked', quantity: 200, unit: 'g' },
      { name: 'Black beans, drained', quantity: 400, unit: 'g' },
      { name: 'Sweet corn kernels', quantity: 150, unit: 'g' },
      { name: 'Onion, diced', quantity: 1, unit: 'medium' },
      { name: 'Garlic, minced', quantity: 3, unit: 'cloves' },
      { name: 'Cumin powder', quantity: 1, unit: 'tsp' },
      { name: 'Smoked paprika', quantity: 1, unit: 'tsp' },
      { name: 'Oregano', quantity: 0.5, unit: 'tsp' },
      { name: 'Lime juice', quantity: 1, unit: 'tbsp' },
      { name: 'Cheddar cheese, shredded', quantity: 120, unit: 'g' },
      { name: 'Olive oil', quantity: 1, unit: 'tbsp' },
      { name: 'Fresh cilantro, chopped', quantity: 0.25, unit: 'cup' },
      { name: 'Salsa', quantity: 120, unit: 'g', notes: 'for serving' },
      { name: 'Greek yogurt', quantity: 120, unit: 'g', notes: 'for serving' },
      { name: 'Salt', quantity: 0, unit: 'to taste' },
      { name: 'Black pepper', quantity: 0, unit: 'to taste' },
    ],
    instructions: [
      'Preheat oven to 190°C (375°F).',
      'Place bell pepper halves in a baking dish, cut side up. Drizzle with olive oil and roast for 10 minutes.',
      'Heat olive oil in a pan. Sauté onions until translucent, then add garlic.',
      'Add black beans, corn, cumin, paprika, oregano, salt, and pepper. Cook for 5 minutes.',
      'In a large bowl, mix cooked quinoa with the bean mixture and lime juice.',
      'Fill each bell pepper half generously with the quinoa-bean mixture.',
      'Top with shredded cheddar cheese.',
      'Bake for 20-25 minutes until peppers are tender and cheese is bubbly and golden.',
      'Garnish with fresh cilantro and serve with salsa and Greek yogurt on the side.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegetarian', 'dinner', 'mexican', 'colorful', 'family-friendly'],
    dietaryTags: ['vegetarian', 'gluten-free', 'nut-free', 'soy-free'],
    tips: [
      'Use a mix of red, yellow, and orange peppers for visual appeal and varied nutrients.',
      'Add diced jalapeño to the filling for extra heat.',
    ],
    storageInstructions: 'Refrigerate assembled peppers for up to 4 days. Reheat in oven for best texture.',
    isPremium: true,
    rating: 4.6,
    reviewCount: 389,
    createdAt: '2026-02-15T17:00:00Z',
    updatedAt: '2026-05-19T20:00:00Z',
  },

  {
    id: 'veg-mg-009',
    name: 'Miso Glazed Eggplant with Tofu Steaks & Edamame Rice',
    slug: 'miso-eggplant-tofu-edamame-rice',
    description:
      'Umami-rich miso-glazed eggplant paired with crispy tofu steaks and edamame-studded jasmine rice. An Asian-inspired dinner loaded with plant protein and antioxidants.',
    category: 'dinner',
    cuisine: 'Japanese-Inspired',
    prepTimeMinutes: 20,
    cookTimeMinutes: 30,
    servings: 2,
    difficulty: 'medium',
    macros: {
      protein: 38,
      carbs: 78,
      fats: 26,
      fiber: 14,
      calories: 690,
    },
    macrosPerServing: {
      protein: 19,
      carbs: 39,
      fats: 13,
      fiber: 7,
      calories: 345,
    },
    ingredients: [
      { name: 'Japanese eggplant, halved lengthwise', quantity: 2, unit: 'medium' },
      { name: 'Extra-firm tofu, sliced into 1cm steaks', quantity: 300, unit: 'g' },
      { name: 'Jasmine rice', quantity: 150, unit: 'g', notes: 'dry weight' },
      { name: 'Shelled edamame', quantity: 100, unit: 'g' },
      { name: 'White miso paste', quantity: 2, unit: 'tbsp' },
      { name: 'Mirin', quantity: 1, unit: 'tbsp' },
      { name: 'Soy sauce (or tamari)', quantity: 1, unit: 'tbsp' },
      { name: 'Maple syrup', quantity: 1, unit: 'tsp' },
      { name: 'Sesame oil', quantity: 1, unit: 'tbsp' },
      { name: 'Rice vinegar', quantity: 1, unit: 'tsp' },
      { name: 'Cornstarch', quantity: 1, unit: 'tbsp', notes: 'for tofu coating' },
      { name: 'Vegetable oil', quantity: 2, unit: 'tbsp', notes: 'for frying' },
      { name: 'Sesame seeds', quantity: 1, unit: 'tbsp' },
      { name: 'Scallions, sliced', quantity: 2, unit: 'pieces' },
      { name: 'Pickled ginger', quantity: 30, unit: 'g', notes: 'for garnish' },
    ],
    instructions: [
      'Cook jasmine rice according to package instructions. Stir in edamame in the last 3 minutes of cooking.',
      'Score the flesh of eggplant halves in a crisscross pattern without cutting through skin.',
      'Mix miso, mirin, soy sauce, maple syrup, and sesame oil to make glaze.',
      'Brush glaze generously over eggplant flesh. Let marinate for 10 minutes.',
      'Press tofu steaks to remove moisture. Coat lightly with cornstarch.',
      'Pan-fry tofu in vegetable oil over medium-high heat until golden and crispy (3-4 min per side).',
      'Broil or pan-sear eggplant, flesh side down first, until caramelized and tender (about 8 minutes total).',
      'Brush extra glaze on eggplant during cooking.',
      'Serve tofu steaks over edamame rice with miso eggplant on the side.',
      'Garnish with sesame seeds, scallions, and pickled ginger.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegan', 'dinner', 'japanese', 'umami', 'antioxidants'],
    dietaryTags: ['vegan', 'dairy-free', 'nut-free'],
    tips: [
      'Salting eggplant for 15 minutes before cooking removes bitterness.',
      'Use a cast-iron pan for the best caramelization on tofu.',
    ],
    storageInstructions: 'Best eaten fresh. Components can be refrigerated separately for 2 days.',
    isPremium: true,
    rating: 4.7,
    reviewCount: 267,
    createdAt: '2026-02-20T18:30:00Z',
    updatedAt: '2026-05-20T19:30:00Z',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SNACKS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'veg-mg-010',
    name: 'Roasted Chickpea & Nut Trail Mix',
    slug: 'roasted-chickpea-nut-trail-mix',
    description:
      'A crunchy, savory trail mix featuring spiced roasted chickpeas, almonds, pumpkin seeds, and dried cranberries. The perfect on-the-go protein snack.',
    category: 'snack',
    cuisine: 'Global',
    prepTimeMinutes: 5,
    cookTimeMinutes: 35,
    servings: 8,
    difficulty: 'easy',
    macros: {
      protein: 64,
      carbs: 96,
      fats: 112,
      fiber: 32,
      calories: 1520,
    },
    macrosPerServing: {
      protein: 8,
      carbs: 12,
      fats: 14,
      fiber: 4,
      calories: 190,
    },
    ingredients: [
      { name: 'Chickpeas (canned), drained and patted dry', quantity: 400, unit: 'g' },
      { name: 'Raw almonds', quantity: 100, unit: 'g' },
      { name: 'Pumpkin seeds (pepitas)', quantity: 80, unit: 'g' },
      { name: 'Dried cranberries (unsweetened)', quantity: 60, unit: 'g' },
      { name: 'Olive oil', quantity: 1.5, unit: 'tbsp' },
      { name: 'Smoked paprika', quantity: 1, unit: 'tsp' },
      { name: 'Cumin powder', quantity: 0.5, unit: 'tsp' },
      { name: 'Garlic powder', quantity: 0.5, unit: 'tsp' },
      { name: 'Sea salt', quantity: 0.75, unit: 'tsp' },
      { name: 'Black pepper', quantity: 0.25, unit: 'tsp' },
      { name: 'Cayenne pepper', quantity: 0.25, unit: 'tsp', notes: 'optional' },
    ],
    instructions: [
      'Preheat oven to 200°C (400°F).',
      'Toss chickpeas with olive oil, paprika, cumin, garlic powder, salt, pepper, and cayenne.',
      'Spread on a baking sheet in a single layer. Roast for 30-35 minutes, shaking pan every 10 minutes, until crunchy.',
      'In the last 10 minutes, add almonds and pumpkin seeds to the same tray to toast lightly.',
      'Remove from oven and let cool completely — chickpeas crisp up as they cool.',
      'Mix in dried cranberries.',
      'Store in an airtight container or portion into small bags for grab-and-go snacking.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegetarian', 'snack', 'meal-prep', 'portable', 'crunchy'],
    dietaryTags: ['vegetarian', 'vegan-option', 'gluten-free', 'dairy-free'],
    tips: [
      'Ensure chickpeas are completely dry before roasting for maximum crunch.',
      'Swap almonds for cashews or walnuts for variety.',
    ],
    storageInstructions: 'Store in airtight container at room temperature for up to 2 weeks.',
    isPremium: false,
    rating: 4.5,
    reviewCount: 412,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-05-11T09:00:00Z',
  },

  {
    id: 'veg-mg-011',
    name: 'Cottage Cheese & Veggie Stuffed Celery Boats',
    slug: 'cottage-cheese-celery-boats',
    description:
      'Crisp celery sticks filled with protein-rich cottage cheese, cherry tomatoes, and everything-bagel seasoning. A refreshing, low-prep high-protein snack.',
    category: 'snack',
    cuisine: 'American',
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    servings: 2,
    difficulty: 'easy',
    macros: {
      protein: 28,
      carbs: 16,
      fats: 14,
      fiber: 4,
      calories: 290,
    },
    macrosPerServing: {
      protein: 14,
      carbs: 8,
      fats: 7,
      fiber: 2,
      calories: 145,
    },
    ingredients: [
      { name: 'Celery stalks', quantity: 6, unit: 'pieces', notes: 'washed and trimmed' },
      { name: 'Low-fat cottage cheese', quantity: 200, unit: 'g' },
      { name: 'Cherry tomatoes, halved', quantity: 100, unit: 'g' },
      { name: 'Everything bagel seasoning', quantity: 1, unit: 'tbsp' },
      { name: 'Fresh dill, chopped', quantity: 1, unit: 'tsp' },
      { name: 'Lemon zest', quantity: 0.5, unit: 'tsp' },
      { name: 'Black pepper', quantity: 0, unit: 'to taste' },
    ],
    instructions: [
      'Mix cottage cheese with dill, lemon zest, and black pepper.',
      'Cut celery stalks into 10cm (4-inch) boats.',
      'Fill each celery boat generously with the seasoned cottage cheese.',
      'Press cherry tomato halves into the cottage cheese filling.',
      'Sprinkle everything bagel seasoning generously over the top.',
      'Serve immediately or refrigerate for up to 4 hours.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegetarian', 'snack', 'no-cook', 'quick', 'low-carb'],
    dietaryTags: ['vegetarian', 'gluten-free', 'nut-free', 'soy-free'],
    tips: [
      'Use flavored cottage cheese (like chive or onion) for extra taste.',
      'Add a dash of hot sauce for a spicy kick.',
    ],
    storageInstructions: 'Best consumed within 4 hours of assembly to maintain celery crunch.',
    isPremium: false,
    rating: 4.3,
    reviewCount: 198,
    createdAt: '2026-03-05T14:00:00Z',
    updatedAt: '2026-05-13T15:00:00Z',
  },

  {
    id: 'veg-mg-012',
    name: 'Peanut Butter Energy Balls',
    slug: 'peanut-butter-energy-balls',
    description:
      'No-bake energy balls made with oats, peanut butter, protein powder, and dark chocolate chips. A sweet, satisfying snack that fuels workouts and curbs cravings.',
    category: 'snack',
    cuisine: 'American',
    prepTimeMinutes: 15,
    cookTimeMinutes: 0,
    servings: 12,
    difficulty: 'easy',
    macros: {
      protein: 48,
      carbs: 96,
      fats: 72,
      fiber: 20,
      calories: 1200,
    },
    macrosPerServing: {
      protein: 4,
      carbs: 8,
      fats: 6,
      fiber: 1.7,
      calories: 100,
    },
    ingredients: [
      { name: 'Rolled oats', quantity: 160, unit: 'g' },
      { name: 'Natural peanut butter', quantity: 120, unit: 'g' },
      { name: 'Plant-based protein powder (vanilla)', quantity: 60, unit: 'g', notes: 'about 2 scoops' },
      { name: 'Maple syrup', quantity: 60, unit: 'ml' },
      { name: 'Dark chocolate chips (70% cocoa)', quantity: 40, unit: 'g' },
      { name: 'Chia seeds', quantity: 1, unit: 'tbsp' },
      { name: 'Vanilla extract', quantity: 0.5, unit: 'tsp' },
      { name: 'Pinch of salt', quantity: 0, unit: '' },
    ],
    instructions: [
      'In a large bowl, mix oats, protein powder, and chia seeds.',
      'Add peanut butter, maple syrup, vanilla extract, and salt. Stir until a thick dough forms.',
      'Fold in dark chocolate chips.',
      'If mixture is too dry, add 1-2 tsp water or plant milk. If too sticky, add more oats.',
      'Roll into 12 equal-sized balls (about 2.5cm / 1 inch diameter).',
      'Place on a plate lined with parchment paper.',
      'Refrigerate for at least 30 minutes to firm up.',
      'Store in refrigerator and grab 1-2 balls as a quick snack.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegetarian', 'snack', 'no-bake', 'meal-prep', 'sweet'],
    dietaryTags: ['vegetarian', 'vegan-option', 'dairy-free-option'],
    tips: [
      'Use whey protein if not vegan — it binds better.',
      'Roll in crushed nuts or coconut flakes for extra texture.',
    ],
    storageInstructions: 'Refrigerate in airtight container for up to 1 week. Freeze for up to 1 month.',
    isPremium: false,
    rating: 4.6,
    reviewCount: 567,
    createdAt: '2026-03-10T11:00:00Z',
    updatedAt: '2026-05-12T10:30:00Z',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRE-WORKOUT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'veg-mg-013',
    name: 'Banana Oat Pancakes with Almond Butter',
    slug: 'banana-oat-pancakes-almond-butter',
    description:
      'Fluffy, naturally sweetened pancakes made with oats, ripe bananas, and eggs. Topped with almond butter for sustained energy before an intense training session.',
    category: 'pre-workout',
    cuisine: 'American',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    difficulty: 'easy',
    macros: {
      protein: 24,
      carbs: 68,
      fats: 22,
      fiber: 10,
      calories: 560,
    },
    macrosPerServing: {
      protein: 12,
      carbs: 34,
      fats: 11,
      fiber: 5,
      calories: 280,
    },
    ingredients: [
      { name: 'Rolled oats', quantity: 100, unit: 'g' },
      { name: 'Ripe bananas', quantity: 2, unit: 'medium' },
      { name: 'Eggs', quantity: 3, unit: 'large' },
      { name: 'Baking powder', quantity: 0.5, unit: 'tsp' },
      { name: 'Cinnamon powder', quantity: 0.5, unit: 'tsp' },
      { name: 'Vanilla extract', quantity: 0.5, unit: 'tsp' },
      { name: 'Salt', quantity: 0.25, unit: 'tsp' },
      { name: 'Almond butter', quantity: 2, unit: 'tbsp' },
      { name: 'Fresh berries', quantity: 100, unit: 'g', notes: 'for topping' },
      { name: 'Coconut oil', quantity: 1, unit: 'tsp', notes: 'for cooking' },
    ],
    instructions: [
      'Blend oats into a fine flour using a blender or food processor.',
      'Add bananas, eggs, baking powder, cinnamon, vanilla, and salt. Blend until smooth.',
      'Let batter rest for 5 minutes to thicken.',
      'Heat a non-stick pan with a little coconut oil over medium heat.',
      'Pour ¼ cup batter per pancake. Cook until bubbles form on surface (2-3 minutes).',
      'Flip and cook other side for 1-2 minutes until golden.',
      'Stack pancakes and top with almond butter and fresh berries.',
      'Consume 60-90 minutes before workout for optimal energy.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegetarian', 'pre-workout', 'energy', 'quick', 'naturally-sweetened'],
    dietaryTags: ['vegetarian', 'gluten-free', 'refined-sugar-free'],
    tips: [
      'Add a scoop of protein powder to the batter for extra protein.',
      'Use very ripe bananas for maximum natural sweetness.',
    ],
    storageInstructions: 'Pancakes can be refrigerated for 2 days. Reheat in toaster for best texture.',
    isPremium: false,
    rating: 4.7,
    reviewCount: 334,
    createdAt: '2026-03-15T06:00:00Z',
    updatedAt: '2026-05-14T07:00:00Z',
  },

  {
    id: 'veg-mg-014',
    name: 'Sweet Potato Toast with Hummus & Hemp Seeds',
    slug: 'sweet-potato-toast-hummus-hemp',
    description:
      'Thinly sliced sweet potato "toast" topped with creamy hummus, sliced avocado, and hemp seeds. A nutrient-dense, easily digestible pre-workout fuel.',
    category: 'pre-workout',
    cuisine: 'Modern Healthy',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    difficulty: 'easy',
    macros: {
      protein: 18,
      carbs: 64,
      fats: 24,
      fiber: 16,
      calories: 520,
    },
    macrosPerServing: {
      protein: 9,
      carbs: 32,
      fats: 12,
      fiber: 8,
      calories: 260,
    },
    ingredients: [
      { name: 'Sweet potato, sliced lengthwise into 1cm planks', quantity: 1, unit: 'large' },
      { name: 'Hummus (classic or roasted red pepper)', quantity: 80, unit: 'g' },
      { name: 'Avocado, sliced', quantity: 0.5, unit: 'medium' },
      { name: 'Hemp seeds', quantity: 2, unit: 'tbsp' },
      { name: 'Cherry tomatoes, halved', quantity: 100, unit: 'g' },
      { name: 'Microgreens or arugula', quantity: 0.5, unit: 'cup' },
      { name: 'Lemon juice', quantity: 1, unit: 'tsp' },
      { name: 'Olive oil', quantity: 1, unit: 'tsp' },
      { name: 'Salt', quantity: 0, unit: 'to taste' },
      { name: 'Black pepper', quantity: 0, unit: 'to taste' },
    ],
    instructions: [
      'Preheat oven to 200°C (400°F) or use a toaster.',
      'Slice sweet potato into 1cm thick lengthwise planks.',
      'Toast sweet potato slices in oven for 10-15 minutes, flipping halfway, until tender and slightly crisp at edges.',
      'Alternatively, use a toaster on high setting 2-3 times.',
      'Spread a generous layer of hummus on each sweet potato toast.',
      'Top with avocado slices, cherry tomatoes, and microgreens.',
      'Sprinkle hemp seeds generously.',
      'Drizzle with lemon juice and olive oil. Season with salt and pepper.',
      'Eat 45-60 minutes before training.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegan', 'pre-workout', 'gluten-free', 'energy', 'quick'],
    dietaryTags: ['vegan', 'gluten-free', 'dairy-free', 'nut-free', 'soy-free'],
    tips: [
      'Choose a firm, straight sweet potato for easiest slicing.',
      'Use a mandoline for perfectly even slices.',
    ],
    storageInstructions: 'Sweet potato toasts can be pre-toasted and refrigerated for 3 days. Assemble fresh.',
    isPremium: false,
    rating: 4.4,
    reviewCount: 245,
    createdAt: '2026-03-20T06:30:00Z',
    updatedAt: '2026-05-15T08:00:00Z',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // POST-WORKOUT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'veg-mg-015',
    name: 'Chocolate Peanut Butter Protein Smoothie Bowl',
    slug: 'chocolate-pb-protein-smoothie-bowl',
    description:
      'A thick, ice-cream-like smoothie bowl with chocolate protein, peanut butter, banana, and spinach. Topped with granola and chia for the ultimate post-workout recovery.',
    category: 'post-workout',
    cuisine: 'Modern Healthy',
    prepTimeMinutes: 8,
    cookTimeMinutes: 0,
    servings: 1,
    difficulty: 'easy',
    macros: {
      protein: 42,
      carbs: 58,
      fats: 22,
      fiber: 12,
      calories: 580,
    },
    macrosPerServing: {
      protein: 42,
      carbs: 58,
      fats: 22,
      fiber: 12,
      calories: 580,
    },
    ingredients: [
      { name: 'Frozen banana', quantity: 1.5, unit: 'medium' },
      { name: 'Plant protein powder (chocolate)', quantity: 40, unit: 'g', notes: 'about 1.5 scoops' },
      { name: 'Natural peanut butter', quantity: 1.5, unit: 'tbsp' },
      { name: 'Unsweetened almond milk', quantity: 120, unit: 'ml' },
      { name: 'Fresh spinach', quantity: 30, unit: 'g', notes: 'handful, flavorless' },
      { name: 'Cocoa powder (unsweetened)', quantity: 1, unit: 'tbsp' },
      { name: 'Ice cubes', quantity: 4, unit: 'pieces' },
      { name: 'Quinoa granola', quantity: 2, unit: 'tbsp', notes: 'for topping' },
      { name: 'Chia seeds', quantity: 1, unit: 'tsp', notes: 'for topping' },
      { name: 'Sliced almonds', quantity: 1, unit: 'tbsp', notes: 'for topping' },
      { name: 'Cacao nibs', quantity: 1, unit: 'tsp', notes: 'for topping' },
    ],
    instructions: [
      'Add frozen banana, protein powder, peanut butter, almond milk, spinach, cocoa powder, and ice to a high-speed blender.',
      'Blend on high until completely smooth and thick. Add more almond milk only if needed — keep it thick!',
      'Pour into a bowl.',
      'Arrange toppings artistically: granola, chia seeds, sliced almonds, and cacao nibs.',
      'Eat with a spoon immediately after your workout for optimal recovery.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegan', 'post-workout', 'smoothie', 'recovery', 'quick'],
    dietaryTags: ['vegan', 'gluten-free', 'dairy-free', 'refined-sugar-free'],
    tips: [
      'Freeze banana slices overnight for the creamiest texture.',
      'Add a pinch of sea salt to enhance chocolate flavor.',
    ],
    storageInstructions: 'Consume immediately. Does not store well.',
    isPremium: false,
    rating: 4.8,
    reviewCount: 678,
    createdAt: '2026-03-25T16:00:00Z',
    updatedAt: '2026-05-16T17:00:00Z',
  },

  {
    id: 'veg-mg-016',
    name: 'Grilled Paneer Tikka with Mint Chutney',
    slug: 'grilled-paneer-tikka-mint-chutney',
    description:
      'Marinated paneer cubes grilled to smoky perfection, served with a refreshing mint-coriander chutney. The ideal post-workout protein hit with anti-inflammatory spices.',
    category: 'post-workout',
    cuisine: 'North Indian',
    prepTimeMinutes: 20,
    cookTimeMinutes: 15,
    servings: 2,
    difficulty: 'medium',
    macros: {
      protein: 46,
      carbs: 18,
      fats: 34,
      fiber: 6,
      calories: 530,
    },
    macrosPerServing: {
      protein: 23,
      carbs: 9,
      fats: 17,
      fiber: 3,
      calories: 265,
    },
    ingredients: [
      { name: 'Paneer, cubed (2.5cm)', quantity: 300, unit: 'g' },
      { name: 'Thick Greek yogurt', quantity: 100, unit: 'g' },
      { name: 'Ginger-garlic paste', quantity: 1, unit: 'tbsp' },
      { name: 'Kashmiri red chili powder', quantity: 1, unit: 'tsp' },
      { name: 'Turmeric powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Garam masala', quantity: 0.5, unit: 'tsp' },
      { name: 'Chaat masala', quantity: 0.5, unit: 'tsp' },
      { name: 'Lemon juice', quantity: 1, unit: 'tbsp' },
      { name: 'Mustard oil', quantity: 1, unit: 'tbsp', notes: 'for authentic flavor' },
      { name: 'Fresh mint leaves', quantity: 1, unit: 'cup', notes: 'packed' },
      { name: 'Fresh coriander', quantity: 0.5, unit: 'cup', notes: 'packed' },
      { name: 'Green chili', quantity: 1, unit: 'piece' },
      { name: 'Cumin powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Onion rings', quantity: 0.5, unit: 'medium', notes: 'for garnish' },
      { name: 'Lemon wedges', quantity: 2, unit: 'pieces', notes: 'for serving' },
    ],
    instructions: [
      'Whisk yogurt with ginger-garlic paste, chili powder, turmeric, garam masala, chaat masala, lemon juice, and mustard oil.',
      'Add paneer cubes and gently coat. Marinate for at least 30 minutes (or overnight in fridge).',
      'Soak wooden skewers in water if using. Thread paneer onto skewers.',
      'Grill on a preheated grill pan or outdoor grill for 2-3 minutes per side until charred and smoky.',
      'For mint chutney: Blend mint, coriander, green chili, cumin powder, lemon juice, and a splash of water until smooth.',
      'Serve hot paneer tikka with mint chutney, onion rings, and lemon wedges.',
      'Ideal consumed within 30 minutes post-workout.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegetarian', 'post-workout', 'indian', 'grilled', 'recovery'],
    dietaryTags: ['vegetarian', 'gluten-free', 'nut-free', 'soy-free'],
    tips: [
      'Don’t over-marinate paneer in acidic yogurt — it can become crumbly.',
      'Baste with melted butter while grilling for extra flavor.',
    ],
    storageInstructions: 'Marinated paneer keeps for 24 hours. Cooked tikka best eaten fresh.',
    isPremium: true,
    rating: 4.9,
    reviewCount: 756,
    createdAt: '2026-03-30T17:00:00Z',
    updatedAt: '2026-05-18T18:00:00Z',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SMOOTHIES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'veg-mg-017',
    name: 'Green Machine Mass Gainer Smoothie',
    slug: 'green-machine-mass-gainer-smoothie',
    description:
      'A calorie-dense green smoothie designed for hard gainers. Spinach, banana, oats, peanut butter, and protein powder blended into a creamy, filling shake.',
    category: 'smoothie',
    cuisine: 'Modern Healthy',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    difficulty: 'easy',
    macros: {
      protein: 48,
      carbs: 82,
      fats: 28,
      fiber: 14,
      calories: 760,
    },
    macrosPerServing: {
      protein: 48,
      carbs: 82,
      fats: 28,
      fiber: 14,
      calories: 760,
    },
    ingredients: [
      { name: 'Unsweetened soy milk', quantity: 300, unit: 'ml' },
      { name: 'Frozen banana', quantity: 2, unit: 'medium' },
      { name: 'Rolled oats', quantity: 60, unit: 'g' },
      { name: 'Natural peanut butter', quantity: 2, unit: 'tbsp' },
      { name: 'Plant protein powder (vanilla)', quantity: 50, unit: 'g' },
      { name: 'Fresh spinach', quantity: 60, unit: 'g', notes: 'about 2 cups' },
      { name: 'Ground flaxseed', quantity: 1, unit: 'tbsp' },
      { name: 'Medjool date, pitted', quantity: 2, unit: 'pieces', notes: 'for extra sweetness' },
      { name: 'Ice cubes', quantity: 4, unit: 'pieces' },
    ],
    instructions: [
      'Add all ingredients to a high-powered blender in the order listed.',
      'Blend on high for 60-90 seconds until completely smooth and creamy.',
      'If too thick, add a splash more soy milk. If too thin, add more oats or ice.',
      'Pour into a large glass or shaker bottle.',
      'Drink immediately. Perfect as a breakfast replacement or between-meal calorie booster.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegan', 'smoothie', 'mass-gainer', 'breakfast-replacement', 'quick'],
    dietaryTags: ['vegan', 'gluten-free', 'dairy-free', 'soy-based'],
    tips: [
      'For even more calories, add ½ avocado or 1 tbsp coconut oil.',
      'Pre-blend oats into a powder for smoother texture.',
    ],
    storageInstructions: 'Best consumed immediately. Can be refrigerated for up to 4 hours — shake before drinking.',
    isPremium: false,
    rating: 4.6,
    reviewCount: 445,
    createdAt: '2026-04-01T07:00:00Z',
    updatedAt: '2026-05-17T08:00:00Z',
  },

  {
    id: 'veg-mg-018',
    name: 'Tropical Mango & Coconut Recovery Smoothie',
    slug: 'tropical-mango-coconut-recovery-smoothie',
    description:
      'A refreshing post-workout smoothie with mango, coconut milk, Greek yogurt, and turmeric. Anti-inflammatory and hydrating with a taste of the tropics.',
    category: 'smoothie',
    cuisine: 'Tropical Fusion',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    difficulty: 'easy',
    macros: {
      protein: 28,
      carbs: 56,
      fats: 18,
      fiber: 6,
      calories: 490,
    },
    macrosPerServing: {
      protein: 28,
      carbs: 56,
      fats: 18,
      fiber: 6,
      calories: 490,
    },
    ingredients: [
      { name: 'Frozen mango chunks', quantity: 200, unit: 'g' },
      { name: 'Coconut milk (light)', quantity: 150, unit: 'ml' },
      { name: 'Greek yogurt (unsweetened)', quantity: 150, unit: 'g' },
      { name: 'Fresh orange juice', quantity: 60, unit: 'ml' },
      { name: 'Fresh ginger, grated', quantity: 0.5, unit: 'tsp' },
      { name: 'Turmeric powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Black pepper', quantity: 1, unit: 'pinch', notes: 'enhances turmeric absorption' },
      { name: 'Chia seeds', quantity: 1, unit: 'tbsp' },
      { name: 'Honey', quantity: 1, unit: 'tsp', notes: 'optional' },
      { name: 'Ice cubes', quantity: 3, unit: 'pieces' },
    ],
    instructions: [
      'Add mango, coconut milk, Greek yogurt, orange juice, ginger, turmeric, black pepper, and ice to blender.',
      'Blend on high until silky smooth (about 45 seconds).',
      'Add chia seeds and pulse once to mix in.',
      'Taste and add honey if you prefer sweeter.',
      'Pour into a chilled glass and enjoy within 30 minutes post-workout for best recovery.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegetarian', 'smoothie', 'post-workout', 'anti-inflammatory', 'refreshing'],
    dietaryTags: ['vegetarian', 'gluten-free', 'nut-free', 'soy-free'],
    tips: [
      'Use frozen mango for a thick, milkshake-like consistency.',
      'Add a scoop of collagen or protein powder for extra protein.',
    ],
    storageInstructions: 'Consume immediately. Separation may occur if stored.',
    isPremium: false,
    rating: 4.5,
    reviewCount: 312,
    createdAt: '2026-04-05T16:00:00Z',
    updatedAt: '2026-05-19T17:00:00Z',
  },

  {
    id: 'veg-mg-019',
    name: 'Blueberry Almond Butter Power Shake',
    slug: 'blueberry-almond-butter-power-shake',
    description:
      'Antioxidant-rich blueberries meet creamy almond butter and vanilla protein in this brain-boosting, muscle-fueling shake. Perfect for morning energy or post-gym recovery.',
    category: 'smoothie',
    cuisine: 'American',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    difficulty: 'easy',
    macros: {
      protein: 36,
      carbs: 48,
      fats: 24,
      fiber: 10,
      calories: 540,
    },
    macrosPerServing: {
      protein: 36,
      carbs: 48,
      fats: 24,
      fiber: 10,
      calories: 540,
    },
    ingredients: [
      { name: 'Frozen blueberries', quantity: 150, unit: 'g' },
      { name: 'Unsweetened almond milk', quantity: 250, unit: 'ml' },
      { name: 'Vanilla protein powder (plant-based)', quantity: 40, unit: 'g' },
      { name: 'Almond butter', quantity: 1.5, unit: 'tbsp' },
      { name: 'Banana', quantity: 1, unit: 'medium' },
      { name: 'Ground flaxseed', quantity: 1, unit: 'tbsp' },
      { name: 'Vanilla extract', quantity: 0.5, unit: 'tsp' },
      { name: 'Cinnamon powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Ice cubes', quantity: 4, unit: 'pieces' },
    ],
    instructions: [
      'Place all ingredients into a blender.',
      'Blend on high speed for 60 seconds until completely smooth and purple-hued.',
      'Check consistency — add more almond milk if too thick, more ice if too thin.',
      'Pour into a tall glass.',
      'Optional: top with a few whole blueberries and a drizzle of almond butter.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegan', 'smoothie', 'antioxidants', 'brain-health', 'quick'],
    dietaryTags: ['vegan', 'gluten-free', 'dairy-free', 'soy-free'],
    tips: [
      'Wild blueberries have higher antioxidant content than cultivated ones.',
      'Soak flaxseed for 5 minutes before blending for smoother texture.',
    ],
    storageInstructions: 'Drink immediately for best nutrient retention and taste.',
    isPremium: false,
    rating: 4.7,
    reviewCount: 398,
    createdAt: '2026-04-10T08:00:00Z',
    updatedAt: '2026-05-20T09:00:00Z',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BONUS: HIGH-CALORIE DINNER FOR HARD GAINERS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'veg-mg-020',
    name: 'Creamy Cashew Butter Curry with Tofu & Naan',
    slug: 'cashew-butter-curry-tofu-naan',
    description:
      'A rich, indulgent curry with a cashew butter base, crispy tofu, and vegetables. Served with whole wheat naan for a high-calorie dinner that satisfies and builds mass.',
    category: 'dinner',
    cuisine: 'Indo-Fusion',
    prepTimeMinutes: 20,
    cookTimeMinutes: 35,
    servings: 3,
    difficulty: 'medium',
    macros: {
      protein: 42,
      carbs: 96,
      fats: 68,
      fiber: 14,
      calories: 1080,
    },
    macrosPerServing: {
      protein: 14,
      carbs: 32,
      fats: 23,
      fiber: 5,
      calories: 360,
    },
    ingredients: [
      { name: 'Extra-firm tofu, cubed and pressed', quantity: 300, unit: 'g' },
      { name: 'Cashew butter', quantity: 4, unit: 'tbsp' },
      { name: 'Coconut milk (full-fat)', quantity: 200, unit: 'ml' },
      { name: 'Onion, finely chopped', quantity: 1, unit: 'large' },
      { name: 'Tomato, pureed', quantity: 2, unit: 'medium' },
      { name: 'Ginger-garlic paste', quantity: 1, unit: 'tbsp' },
      { name: 'Green bell pepper, diced', quantity: 1, unit: 'medium' },
      { name: 'Green beans, trimmed', quantity: 100, unit: 'g' },
      { name: 'Garam masala', quantity: 1, unit: 'tsp' },
      { name: 'Turmeric powder', quantity: 0.5, unit: 'tsp' },
      { name: 'Coriander powder', quantity: 1, unit: 'tsp' },
      { name: 'Kasuri methi', quantity: 1, unit: 'tsp' },
      { name: 'Vegetable oil', quantity: 2, unit: 'tbsp' },
      { name: 'Whole wheat naan', quantity: 3, unit: 'pieces' },
      { name: 'Fresh coriander, chopped', quantity: 2, unit: 'tbsp' },
      { name: 'Salt', quantity: 0, unit: 'to taste' },
    ],
    instructions: [
      'Press tofu for 15 minutes, then cube. Pan-fry in 1 tbsp oil until all sides are golden and crispy. Set aside.',
      'Heat remaining oil in the same pan. Add onions and sauté until golden brown.',
      'Add ginger-garlic paste and cook for 1 minute.',
      'Add tomato puree, turmeric, coriander powder, and salt. Cook until oil separates.',
      'Whisk cashew butter with coconut milk until smooth. Add to the pan.',
      'Add 200ml water and simmer for 10 minutes until gravy thickens.',
      'Add green beans and bell pepper. Cook for 5 minutes until tender-crisp.',
      'Add fried tofu, garam masala, and kasuri methi. Simmer 3 more minutes.',
      'Garnish with fresh coriander.',
      'Warm naan on a griddle or in the oven.',
      'Serve curry hot with naan for dipping.',
    ],
    tags: ['high-protein', 'muscle-gain', 'vegan', 'dinner', 'indian', 'high-calorie', 'hard-gainer'],
    dietaryTags: ['vegan', 'dairy-free', 'soy-based'],
    tips: [
      'Soak cashews overnight and blend instead of cashew butter for fresher taste.',
      'Add a dollop of coconut cream on top for extra richness.',
    ],
    storageInstructions: 'Curry stores for 4 days refrigerated. Naan best eaten fresh or reheated in oven.',
    isPremium: true,
    rating: 4.8,
    reviewCount: 289,
    createdAt: '2026-04-15T19:00:00Z',
    updatedAt: '2026-05-20T20:00:00Z',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DERIVED DATA & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export const recipeCategories = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'pre-workout',
  'post-workout',
  'smoothie',
] as const;

export const dietaryTagOptions = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'soy-free',
  'soy-based',
  'refined-sugar-free',
] as const;

export const difficultyLevels = ['easy', 'medium', 'hard'] as const;

/**
 * Get recipes filtered by category
 */
export function getRecipesByCategory(category: Recipe['category']): Recipe[] {
  return recipes.filter((r) => r.category === category);
}

/**
 * Get recipes filtered by dietary tag
 */
export function getRecipesByDietaryTag(tag: string): Recipe[] {
  return recipes.filter((r) => r.dietaryTags.includes(tag));
}

/**
 * Get recipes by difficulty level
 */
export function getRecipesByDifficulty(difficulty: Recipe['difficulty']): Recipe[] {
  return recipes.filter((r) => r.difficulty === difficulty);
}

/**
 * Get premium recipes only
 */
export function getPremiumRecipes(): Recipe[] {
  return recipes.filter((r) => r.isPremium);
}

/**
 * Get recipes sorted by highest protein content (per serving)
 */
export function getHighestProteinRecipes(limit = 5): Recipe[] {
  return [...recipes]
    .sort((a, b) => b.macrosPerServing.protein - a.macrosPerServing.protein)
    .slice(0, limit);
}

/**
 * Get total macro summary for all recipes
 */
export function getTotalMacroSummary() {
  return recipes.reduce(
    (acc, recipe) => {
      acc.totalRecipes += 1;
      acc.totalProtein += recipe.macros.protein;
      acc.totalCarbs += recipe.macros.carbs;
      acc.totalFats += recipe.macros.fats;
      acc.totalCalories += recipe.macros.calories;
      return acc;
    },
    {
      totalRecipes: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      totalCalories: 0,
    }
  );
}

/**
 * Search recipes by name or tag (case-insensitive)
 */
export function searchRecipes(query: string): Recipe[] {
  const q = query.toLowerCase();
  return recipes.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q)) ||
      r.dietaryTags.some((t) => t.toLowerCase().includes(q)) ||
      r.description.toLowerCase().includes(q)
  );
}

/**
 * Get a recipe by its unique ID
 */
export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find((r) => r.id === id);
}

/**
 * Get a recipe by its slug
 */
export function getRecipeBySlug(slug: string): Recipe | undefined {
  return recipes.find((r) => r.slug === slug);
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export default recipes;
