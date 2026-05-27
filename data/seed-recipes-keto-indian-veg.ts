/**
 * FitFuel Phase 9 — Seed Data: Keto Indian Vegetarian Recipes
 * Low-carb, high-fat Indian vegetarian recipes optimized for ketosis and fat adaptation.
 * Source of truth: seed-meal-plans.ts (103 variants)
 *
 * Macros target: 5–10% carbs | 65–75% fat | 20–25% protein
 * Net carbs per serving kept ≤ 8g wherever possible.
 */

export interface MacroNutrients {
  protein: number;   // grams
  carbs: number;     // grams (total)
  netCarbs: number;  // grams (total carbs − fiber)
  fats: number;      // grams
  fiber: number;     // grams
  calories: number;  // kcal
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
    id: 'keto-iv-001',
    name: 'Paneer & Methi Omelette (Egg-Free Keto Chilla)',
    slug: 'paneer-methi-keto-chilla',
    description:
      'A golden chilla made from besan-free almond flour batter with crumbled paneer and fresh methi leaves. Crispy on the outside, soft on the inside — a deeply satisfying keto breakfast with a classic Indian aroma.',
    category: 'breakfast',
    cuisine: 'Indian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 2,
    difficulty: 'easy',
    macros: {
      protein: 30,
      carbs: 10,
      netCarbs: 6,
      fats: 46,
      fiber: 4,
      calories: 568,
    },
    macrosPerServing: {
      protein: 15,
      carbs: 5,
      netCarbs: 3,
      fats: 23,
      fiber: 2,
      calories: 284,
    },
    ingredients: [
      { name: 'Almond flour', quantity: 80, unit: 'g' },
      { name: 'Paneer, finely crumbled', quantity: 150, unit: 'g' },
      { name: 'Fresh methi (fenugreek) leaves, chopped', quantity: 40, unit: 'g' },
      { name: 'Green chili, minced', quantity: 1, unit: 'piece' },
      { name: 'Ginger, grated', quantity: 0.5, unit: 'tsp' },
      { name: 'Cumin seeds', quantity: 0.5, unit: 'tsp' },
      { name: 'Turmeric powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Pink Himalayan salt', quantity: 0, unit: 'to taste' },
      { name: 'Full-fat coconut milk', quantity: 60, unit: 'ml', notes: 'to adjust batter consistency' },
      { name: 'Ghee', quantity: 2, unit: 'tbsp' },
    ],
    instructions: [
      'In a bowl, combine almond flour, crumbled paneer, methi leaves, green chili, ginger, cumin seeds, turmeric, and salt.',
      'Pour in coconut milk gradually and mix to form a thick, spreadable batter (not runny).',
      'Heat a non-stick tawa or cast iron pan over medium heat and add 1 tsp ghee.',
      'Pour half the batter onto the tawa and spread gently to a circle of about 15 cm diameter.',
      'Cover with a lid and cook for 4–5 minutes until the underside is golden and the top looks set.',
      'Drizzle a little ghee around the edges, then flip and cook for 2–3 minutes more.',
      'Repeat with remaining batter.',
      'Serve hot with keto-friendly mint chutney or full-fat sour cream.',
    ],
    tags: ['keto', 'low-carb', 'vegetarian', 'breakfast', 'indian', 'gluten-free', 'quick'],
    dietaryTags: ['vegetarian', 'gluten-free', 'soy-free', 'grain-free'],
    tips: [
      'Press out any excess moisture from the paneer before crumbling for a crispier chilla.',
      'Kasuri methi (dried fenugreek) can substitute fresh methi — use only 1 tsp.',
      'Add a pinch of ajwain (carom seeds) for a more traditional Indian flavor.',
    ],
    storageInstructions: 'Best eaten immediately. Cooked chillas can be refrigerated for 1 day and re-crisped on a dry tawa.',
    isPremium: false,
    rating: 4.7,
    reviewCount: 214,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-05-18T10:30:00Z',
  },

  {
    id: 'keto-iv-002',
    name: 'Coconut Cream Chia Pudding with Cardamom & Kesar',
    slug: 'coconut-chia-pudding-cardamom-kesar',
    description:
      'An elegant overnight keto breakfast inspired by Indian kheer. Thick coconut cream is infused with saffron and cardamom, then set with chia seeds for a rich, silky pudding that needs zero cooking.',
    category: 'breakfast',
    cuisine: 'Indian',
    prepTimeMinutes: 8,
    cookTimeMinutes: 0,
    servings: 2,
    difficulty: 'easy',
    macros: {
      protein: 10,
      carbs: 16,
      netCarbs: 6,
      fats: 52,
      fiber: 10,
      calories: 564,
    },
    macrosPerServing: {
      protein: 5,
      carbs: 8,
      netCarbs: 3,
      fats: 26,
      fiber: 5,
      calories: 282,
    },
    ingredients: [
      { name: 'Full-fat coconut cream', quantity: 300, unit: 'ml' },
      { name: 'Chia seeds', quantity: 50, unit: 'g' },
      { name: 'Saffron (kesar) strands', quantity: 10, unit: 'strands', notes: 'soaked in 1 tbsp warm water' },
      { name: 'Cardamom powder (elaichi)', quantity: 0.5, unit: 'tsp' },
      { name: 'Erythritol or monk fruit sweetener', quantity: 1, unit: 'tbsp', notes: 'adjust to taste' },
      { name: 'Vanilla extract', quantity: 0.25, unit: 'tsp' },
      { name: 'Pistachios, roughly chopped', quantity: 15, unit: 'g', notes: 'for topping' },
      { name: 'Rose water', quantity: 0.5, unit: 'tsp', notes: 'optional' },
    ],
    instructions: [
      'Warm coconut cream slightly (do not boil) and add the saffron-soaked water, cardamom powder, sweetener, and vanilla extract. Stir well.',
      'Add rose water if using. Mix to combine.',
      'Add chia seeds and whisk vigorously to prevent clumping.',
      'Pour into two serving glasses or bowls.',
      'Refrigerate overnight or for at least 4 hours until fully set and thick.',
      'Before serving, stir gently and top with chopped pistachios and an extra saffron strand.',
    ],
    tags: ['keto', 'low-carb', 'vegetarian', 'breakfast', 'indian', 'no-cook', 'overnight', 'meal-prep'],
    dietaryTags: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'grain-free'],
    tips: [
      'Shake or stir the pudding after 30 minutes in the fridge to re-distribute chia seeds.',
      'Use freshly ground cardamom for a far more aromatic result.',
      'Unsweetened desiccated coconut on top adds a nice crunch.',
    ],
    storageInstructions: 'Keeps well in the refrigerator for up to 3 days. Add toppings just before serving.',
    isPremium: false,
    rating: 4.8,
    reviewCount: 187,
    createdAt: '2026-01-15T07:30:00Z',
    updatedAt: '2026-05-16T09:00:00Z',
  },

  {
    id: 'keto-iv-003',
    name: 'Ghee-Roasted Masala Cauliflower Hash',
    slug: 'ghee-masala-cauliflower-hash',
    description:
      'Chunky cauliflower florets tossed in aromatic Indian spices and roasted in plenty of ghee until caramelized and nutty. A hearty, deeply flavorful keto breakfast that feels like a celebration.',
    category: 'breakfast',
    cuisine: 'Indian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 2,
    difficulty: 'easy',
    macros: {
      protein: 12,
      carbs: 18,
      netCarbs: 10,
      fats: 44,
      fiber: 8,
      calories: 508,
    },
    macrosPerServing: {
      protein: 6,
      carbs: 9,
      netCarbs: 5,
      fats: 22,
      fiber: 4,
      calories: 254,
    },
    ingredients: [
      { name: 'Cauliflower, cut into small florets', quantity: 400, unit: 'g' },
      { name: 'Ghee', quantity: 3, unit: 'tbsp' },
      { name: 'Mustard seeds', quantity: 0.5, unit: 'tsp' },
      { name: 'Curry leaves (fresh or dried)', quantity: 10, unit: 'leaves' },
      { name: 'Onion, thinly sliced', quantity: 1, unit: 'small', notes: 'optional; adds ~2g net carbs' },
      { name: 'Turmeric powder', quantity: 0.5, unit: 'tsp' },
      { name: 'Coriander powder', quantity: 1, unit: 'tsp' },
      { name: 'Red chili powder (Kashmiri)', quantity: 0.5, unit: 'tsp' },
      { name: 'Amchur (dry mango powder)', quantity: 0.25, unit: 'tsp' },
      { name: 'Garam masala', quantity: 0.25, unit: 'tsp' },
      { name: 'Salt', quantity: 0, unit: 'to taste' },
      { name: 'Fresh coriander leaves, chopped', quantity: 2, unit: 'tbsp' },
    ],
    instructions: [
      'Preheat oven to 220°C (or use a wide cast iron pan on high heat).',
      'Pat cauliflower florets completely dry with a kitchen towel.',
      'Melt ghee in a large oven-safe pan. Add mustard seeds and curry leaves; let them splutter.',
      'Add onion (if using) and cook for 2 minutes. Add all spices except garam masala and amchur.',
      'Add cauliflower and toss to coat thoroughly in the spiced ghee.',
      'Roast in the oven for 20–22 minutes, tossing once halfway, until edges are golden and slightly charred.',
      'Remove from oven, sprinkle garam masala and amchur, toss once more.',
      'Garnish with fresh coriander and serve immediately.',
    ],
    tags: ['keto', 'low-carb', 'vegetarian', 'breakfast', 'indian', 'roasted', 'gluten-free'],
    dietaryTags: ['vegetarian', 'gluten-free', 'dairy-based', 'nut-free', 'soy-free', 'grain-free'],
    tips: [
      'Completely dry cauliflower is the secret to proper caramelization — steam ruins the roast.',
      'Add cubed paneer in the last 5 minutes for extra protein.',
    ],
    storageInstructions: 'Refrigerate for up to 2 days. Re-crisp in a dry pan or air fryer before serving.',
    isPremium: false,
    rating: 4.6,
    reviewCount: 143,
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-05-15T11:00:00Z',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LUNCH
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'keto-iv-004',
    name: 'Saag Paneer with Cauliflower Rice',
    slug: 'saag-paneer-cauliflower-rice',
    description:
      'The beloved saag paneer reimagined for keto — rich, buttery spinach gravy loaded with golden-fried paneer cubes, served over fluffy cauliflower rice instead of roti or white rice. Full flavour, a fraction of the carbs.',
    category: 'lunch',
    cuisine: 'North Indian',
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    servings: 3,
    difficulty: 'medium',
    macros: {
      protein: 60,
      carbs: 27,
      netCarbs: 18,
      fats: 96,
      fiber: 9,
      calories: 1212,
    },
    macrosPerServing: {
      protein: 20,
      carbs: 9,
      netCarbs: 6,
      fats: 32,
      fiber: 3,
      calories: 404,
    },
    ingredients: [
      { name: 'Paneer, cubed (2.5 cm)', quantity: 300, unit: 'g' },
      { name: 'Fresh spinach (palak)', quantity: 400, unit: 'g' },
      { name: 'Cauliflower, grated or pulsed into rice', quantity: 400, unit: 'g' },
      { name: 'Ghee', quantity: 4, unit: 'tbsp' },
      { name: 'Onion, finely chopped', quantity: 1, unit: 'medium' },
      { name: 'Garlic cloves, minced', quantity: 4, unit: 'pieces' },
      { name: 'Ginger, grated', quantity: 1, unit: 'tsp' },
      { name: 'Green chili, slit', quantity: 2, unit: 'pieces' },
      { name: 'Tomato, finely chopped', quantity: 1, unit: 'medium' },
      { name: 'Heavy cream (malai)', quantity: 3, unit: 'tbsp' },
      { name: 'Cumin seeds', quantity: 0.5, unit: 'tsp' },
      { name: 'Garam masala', quantity: 0.75, unit: 'tsp' },
      { name: 'Turmeric powder', quantity: 0.5, unit: 'tsp' },
      { name: 'Coriander powder', quantity: 1, unit: 'tsp' },
      { name: 'Kasuri methi', quantity: 1, unit: 'tsp', notes: 'crushed between palms' },
      { name: 'Salt', quantity: 0, unit: 'to taste' },
    ],
    instructions: [
      'Blanch spinach in boiling salted water for 2 minutes, then transfer immediately to ice water. Drain and blend into a smooth purée. Set aside.',
      'In a heavy pan, heat 1 tbsp ghee over medium-high heat. Fry paneer cubes until golden on all sides. Remove and set aside.',
      'In the same pan, heat remaining ghee. Add cumin seeds and let them sizzle.',
      'Add onion and cook until deep golden brown, about 8 minutes.',
      'Add ginger, garlic, and green chili. Sauté for 1 minute.',
      'Add tomato, turmeric, coriander powder, and salt. Cook until oil releases, about 5 minutes.',
      'Pour in spinach purée and mix well. Simmer for 5 minutes.',
      'Stir in heavy cream and garam masala. Add fried paneer and fold gently.',
      'Finish with crushed kasuri methi. Simmer on low for 3 more minutes.',
      'For cauliflower rice: heat 1 tsp ghee in a separate pan, add grated cauliflower, season with salt and a pinch of cumin, stir-fry for 4–5 minutes until just tender.',
      'Serve saag paneer hot over cauliflower rice.',
    ],
    tags: ['keto', 'low-carb', 'vegetarian', 'lunch', 'north-indian', 'high-fat', 'gluten-free'],
    dietaryTags: ['vegetarian', 'gluten-free', 'soy-free', 'nut-free', 'grain-free'],
    tips: [
      'Shocking blanched spinach in ice water preserves its vibrant green colour.',
      'Do not overcook the spinach gravy after adding paneer — it will turn khaki.',
      'A tablespoon of butter stirred in at the very end gives a restaurant-style finish.',
    ],
    storageInstructions: 'Saag paneer keeps for 3 days refrigerated. Store cauliflower rice separately to prevent sogginess.',
    isPremium: false,
    rating: 4.9,
    reviewCount: 431,
    createdAt: '2026-01-20T12:00:00Z',
    updatedAt: '2026-05-19T13:00:00Z',
  },

  {
    id: 'keto-iv-005',
    name: 'Keto Rajma — Butter-Braised Black Soybean Curry',
    slug: 'keto-rajma-black-soybean-curry',
    description:
      'Traditional rajma flavors — tomato, onion, garam masala, and plenty of butter — applied to protein-rich, ultra-low-carb black soybeans. This hearty bowl scratches every rajma-chawal craving without breaking ketosis.',
    category: 'lunch',
    cuisine: 'North Indian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 30,
    servings: 3,
    difficulty: 'medium',
    macros: {
      protein: 57,
      carbs: 24,
      netCarbs: 12,
      fats: 54,
      fiber: 12,
      calories: 798,
    },
    macrosPerServing: {
      protein: 19,
      carbs: 8,
      netCarbs: 4,
      fats: 18,
      fiber: 4,
      calories: 266,
    },
    ingredients: [
      { name: 'Black soybeans (cooked or canned, drained)', quantity: 400, unit: 'g' },
      { name: 'Butter (unsalted)', quantity: 3, unit: 'tbsp' },
      { name: 'Onion, finely chopped', quantity: 1, unit: 'medium' },
      { name: 'Tomatoes, puréed', quantity: 2, unit: 'medium' },
      { name: 'Garlic cloves, minced', quantity: 4, unit: 'pieces' },
      { name: 'Ginger, grated', quantity: 1, unit: 'tsp' },
      { name: 'Heavy cream', quantity: 2, unit: 'tbsp' },
      { name: 'Bay leaf', quantity: 1, unit: 'piece' },
      { name: 'Cinnamon stick', quantity: 1, unit: 'small' },
      { name: 'Cloves', quantity: 2, unit: 'pieces' },
      { name: 'Cumin seeds', quantity: 0.5, unit: 'tsp' },
      { name: 'Coriander powder', quantity: 1.5, unit: 'tsp' },
      { name: 'Red chili powder', quantity: 0.5, unit: 'tsp' },
      { name: 'Garam masala', quantity: 1, unit: 'tsp' },
      { name: 'Turmeric powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Kasuri methi', quantity: 1, unit: 'tsp' },
      { name: 'Salt', quantity: 0, unit: 'to taste' },
      { name: 'Fresh coriander, chopped', quantity: 2, unit: 'tbsp' },
    ],
    instructions: [
      'Melt butter in a heavy-bottomed pot over medium heat. Add bay leaf, cinnamon, cloves, and cumin; cook for 30 seconds until fragrant.',
      'Add onions and cook until deep golden brown, about 10 minutes.',
      'Add garlic and ginger; sauté for 1 minute.',
      'Add tomato purée, turmeric, chili powder, and coriander powder. Cook, stirring often, until the masala darkens and fat separates, about 8 minutes.',
      'Add black soybeans and 200 ml water. Season with salt. Bring to a boil, then simmer for 10 minutes.',
      'Use the back of a spoon to lightly mash some beans against the pot wall to thicken the gravy.',
      'Stir in garam masala, kasuri methi, and heavy cream. Simmer for 3 more minutes.',
      'Adjust seasoning. Garnish with fresh coriander and a pat of cold butter.',
      'Serve in bowls or over cauliflower rice.',
    ],
    tags: ['keto', 'low-carb', 'vegetarian', 'lunch', 'north-indian', 'high-protein', 'comfort-food'],
    dietaryTags: ['vegetarian', 'gluten-free', 'nut-free', 'grain-free'],
    tips: [
      'Black soybeans are a keto superstar — only ~2g net carbs per 100g, unlike regular kidney beans.',
      'Soak and pressure-cook dried black soybeans for 30 minutes for better texture than canned.',
      'A squeeze of lemon at the end brightens the whole dish.',
    ],
    storageInstructions: 'Refrigerate for up to 4 days. Tastes even better the next day as the flavors deepen.',
    isPremium: false,
    rating: 4.7,
    reviewCount: 298,
    createdAt: '2026-02-10T12:00:00Z',
    updatedAt: '2026-05-20T14:00:00Z',
  },

  {
    id: 'keto-iv-006',
    name: 'Avocado & Paneer Chaat Salad',
    slug: 'avocado-paneer-chaat-salad',
    description:
      'All the bold, tangy-spicy flavors of Indian chaat — chaat masala, lemon, green chutney — tossed with creamy avocado and pan-seared paneer cubes instead of potatoes and puffed rice. A fresh, no-cook keto lunch.',
    category: 'lunch',
    cuisine: 'Indian Fusion',
    prepTimeMinutes: 15,
    cookTimeMinutes: 8,
    servings: 2,
    difficulty: 'easy',
    macros: {
      protein: 30,
      carbs: 18,
      netCarbs: 10,
      fats: 56,
      fiber: 8,
      calories: 704,
    },
    macrosPerServing: {
      protein: 15,
      carbs: 9,
      netCarbs: 5,
      fats: 28,
      fiber: 4,
      calories: 352,
    },
    ingredients: [
      { name: 'Paneer, cubed', quantity: 200, unit: 'g' },
      { name: 'Ripe avocado, diced', quantity: 1, unit: 'large' },
      { name: 'Cucumber, diced', quantity: 1, unit: 'medium' },
      { name: 'Cherry tomatoes, halved', quantity: 100, unit: 'g' },
      { name: 'Red onion, finely diced', quantity: 0.5, unit: 'small' },
      { name: 'Green chutney (mint-coriander)', quantity: 2, unit: 'tbsp', notes: 'keto-friendly version: no sugar' },
      { name: 'Lemon juice', quantity: 1.5, unit: 'tbsp' },
      { name: 'Chaat masala', quantity: 1, unit: 'tsp' },
      { name: 'Roasted cumin powder', quantity: 0.5, unit: 'tsp' },
      { name: 'Black salt (kala namak)', quantity: 0.25, unit: 'tsp' },
      { name: 'Red chili flakes', quantity: 0.25, unit: 'tsp' },
      { name: 'Olive oil', quantity: 1, unit: 'tbsp' },
      { name: 'Pomegranate seeds', quantity: 2, unit: 'tbsp', notes: 'optional garnish' },
    ],
    instructions: [
      'Heat olive oil in a small pan over high heat. Sear paneer cubes for 2–3 minutes on each side until golden. Season with a pinch of salt and set aside to cool slightly.',
      'In a large bowl, combine avocado, cucumber, cherry tomatoes, and red onion.',
      'In a small bowl, whisk together lemon juice, chaat masala, cumin powder, black salt, and chili flakes.',
      'Add the dressing to the salad bowl and toss gently to coat.',
      'Add warm paneer cubes and green chutney. Toss once more.',
      'Garnish with pomegranate seeds if using. Serve immediately.',
    ],
    tags: ['keto', 'low-carb', 'vegetarian', 'lunch', 'indian', 'salad', 'no-cook', 'quick', 'high-fat'],
    dietaryTags: ['vegetarian', 'gluten-free', 'nut-free', 'soy-free', 'grain-free'],
    tips: [
      'Use just-ripe avocado — overripe avocado will become mushy when tossed.',
      'Sear paneer in a very hot, dry pan with minimal oil for a charred restaurant-style finish.',
      'Make green chutney with mint, coriander, lemon, green chili, and a few pumpkin seeds instead of peanuts for a nut-free keto version.',
    ],
    storageInstructions: 'Best consumed immediately. Dress the salad just before serving to prevent avocado browning.',
    isPremium: false,
    rating: 4.8,
    reviewCount: 322,
    createdAt: '2026-02-20T13:00:00Z',
    updatedAt: '2026-05-19T15:00:00Z',
  },

  {
    id: 'keto-iv-007',
    name: 'Mustard-Tempered Cabbage & Paneer Stir-Fry',
    slug: 'mustard-cabbage-paneer-stir-fry',
    description:
      'A quick South Indian-style stir-fry of shredded cabbage and paneer with mustard seeds, curry leaves, and coconut. Humble ingredients elevated by the perfect tempering, ready in under 20 minutes.',
    category: 'lunch',
    cuisine: 'South Indian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 2,
    difficulty: 'easy',
    macros: {
      protein: 26,
      carbs: 16,
      netCarbs: 8,
      fats: 42,
      fiber: 8,
      calories: 540,
    },
    macrosPerServing: {
      protein: 13,
      carbs: 8,
      netCarbs: 4,
      fats: 21,
      fiber: 4,
      calories: 270,
    },
    ingredients: [
      { name: 'Cabbage, finely shredded', quantity: 350, unit: 'g' },
      { name: 'Paneer, crumbled or small cubes', quantity: 150, unit: 'g' },
      { name: 'Coconut oil', quantity: 2, unit: 'tbsp' },
      { name: 'Mustard seeds', quantity: 1, unit: 'tsp' },
      { name: 'Urad dal (split black gram)', quantity: 1, unit: 'tsp' },
      { name: 'Dry red chilies', quantity: 2, unit: 'pieces' },
      { name: 'Curry leaves', quantity: 12, unit: 'leaves' },
      { name: 'Asafoetida (hing)', quantity: 1, unit: 'pinch' },
      { name: 'Turmeric powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Fresh desiccated coconut (or grated)', quantity: 3, unit: 'tbsp' },
      { name: 'Lemon juice', quantity: 1, unit: 'tsp' },
      { name: 'Salt', quantity: 0, unit: 'to taste' },
    ],
    instructions: [
      'Heat coconut oil in a wok or kadai over medium-high heat.',
      'Add mustard seeds and urad dal; wait until the mustard seeds pop and dal turns golden.',
      'Add dry red chilies, curry leaves, and hing. Fry for 10 seconds.',
      'Add shredded cabbage, turmeric, and salt. Toss well.',
      'Stir-fry on high heat for 5–6 minutes, tossing frequently, until cabbage is just tender but retains a slight bite.',
      'Add paneer and desiccated coconut. Toss and cook for 2 more minutes.',
      'Finish with a squeeze of lemon juice.',
      'Serve hot as a main or as a side with keto-friendly papad.',
    ],
    tags: ['keto', 'low-carb', 'vegetarian', 'lunch', 'south-indian', 'stir-fry', 'quick', 'gluten-free'],
    dietaryTags: ['vegetarian', 'gluten-free', 'nut-free', 'soy-free', 'grain-free'],
    tips: [
      'Do not cover the pan — steam will make the cabbage soggy. Cook on high heat, uncovered.',
      'Chana dal can replace urad dal for a slightly nuttier crunch.',
    ],
    storageInstructions: 'Best consumed fresh. Can be refrigerated for 1 day; re-heat in a hot dry pan.',
    isPremium: false,
    rating: 4.5,
    reviewCount: 176,
    createdAt: '2026-03-01T12:00:00Z',
    updatedAt: '2026-05-17T14:00:00Z',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DINNER
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'keto-iv-008',
    name: 'Butter Paneer Masala (Keto Butter Chicken — Veg)',
    slug: 'keto-butter-paneer-masala',
    description:
      'The iconic butter masala gravy — velvety, mildly spiced, and kissed with cream and butter — with juicy paneer as the star. Swapping naan for a crispy keto seed cracker makes this a full keto dinner without compromise.',
    category: 'dinner',
    cuisine: 'North Indian',
    prepTimeMinutes: 20,
    cookTimeMinutes: 35,
    servings: 3,
    difficulty: 'medium',
    macros: {
      protein: 63,
      carbs: 24,
      netCarbs: 18,
      fats: 102,
      fiber: 6,
      calories: 1266,
    },
    macrosPerServing: {
      protein: 21,
      carbs: 8,
      netCarbs: 6,
      fats: 34,
      fiber: 2,
      calories: 422,
    },
    ingredients: [
      { name: 'Paneer, cubed (3 cm)', quantity: 350, unit: 'g' },
      { name: 'Butter (unsalted)', quantity: 4, unit: 'tbsp' },
      { name: 'Heavy cream', quantity: 80, unit: 'ml' },
      { name: 'Tomatoes, roughly chopped', quantity: 3, unit: 'medium' },
      { name: 'Onion, roughly chopped', quantity: 1, unit: 'large' },
      { name: 'Garlic cloves', quantity: 5, unit: 'pieces' },
      { name: 'Ginger', quantity: 1, unit: 'inch piece' },
      { name: 'Cashews (raw)', quantity: 15, unit: 'g', notes: 'for gravy body — keeps carbs low vs cornstarch' },
      { name: 'Kashmiri red chili powder', quantity: 1, unit: 'tsp', notes: 'mild, for deep red colour' },
      { name: 'Coriander powder', quantity: 1.5, unit: 'tsp' },
      { name: 'Garam masala', quantity: 1, unit: 'tsp' },
      { name: 'Cardamom powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Turmeric powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Kasuri methi', quantity: 1.5, unit: 'tsp', notes: 'crushed' },
      { name: 'Erythritol', quantity: 1, unit: 'tsp', notes: 'replaces sugar for balance' },
      { name: 'Bay leaf', quantity: 1, unit: 'piece' },
      { name: 'Salt', quantity: 0, unit: 'to taste' },
    ],
    instructions: [
      'In a saucepan, combine tomatoes, onion, garlic, ginger, cashews, bay leaf, and 150 ml water. Simmer for 15 minutes until soft. Remove bay leaf and blend into a completely smooth purée. Pass through a strainer for a silky gravy.',
      'Melt 2 tbsp butter in a heavy pan over medium heat. Add Kashmiri chili, coriander powder, and turmeric; fry for 30 seconds.',
      'Pour in the strained tomato purée. Cook, stirring often, for 8–10 minutes until darkened and thick.',
      'Season with salt and erythritol. Stir in heavy cream, garam masala, and cardamom. Simmer for 3 minutes.',
      'Meanwhile, pan-fry paneer cubes in remaining butter until golden on all sides.',
      'Add golden paneer to the gravy. Fold gently and simmer on low for 5 minutes.',
      'Finish with crushed kasuri methi and the remaining cold butter. Stir until butter melts into the sauce.',
      'Serve hot with keto seed crackers, cauliflower naan, or a side salad.',
    ],
    tags: ['keto', 'low-carb', 'vegetarian', 'dinner', 'north-indian', 'high-fat', 'comfort-food', 'premium'],
    dietaryTags: ['vegetarian', 'gluten-free', 'soy-free', 'grain-free'],
    tips: [
      'Straining the gravy is a non-negotiable step for the restaurant-quality silky texture.',
      'Use full-fat paneer for a richer mouthfeel; low-fat paneer can turn rubbery when fried.',
      'Adjust sweetener to balance acidity from tomatoes — taste as you go.',
    ],
    storageInstructions: 'Gravy keeps for 4 days refrigerated. Add fresh cream when reheating to restore creaminess.',
    isPremium: true,
    rating: 4.9,
    reviewCount: 512,
    createdAt: '2026-01-25T19:00:00Z',
    updatedAt: '2026-05-20T20:00:00Z',
  },

  {
    id: 'keto-iv-009',
    name: 'Keto Palak Soup with Coconut & Ginger',
    slug: 'keto-palak-coconut-ginger-soup',
    description:
      'A silky, vibrant green soup that combines iron-rich spinach with the creaminess of coconut milk and a warming hit of ginger. Light yet deeply nourishing — perfect as a keto dinner starter or a complete light dinner.',
    category: 'dinner',
    cuisine: 'Indian Fusion',
    prepTimeMinutes: 8,
    cookTimeMinutes: 18,
    servings: 3,
    difficulty: 'easy',
    macros: {
      protein: 15,
      carbs: 21,
      netCarbs: 12,
      fats: 51,
      fiber: 9,
      calories: 597,
    },
    macrosPerServing: {
      protein: 5,
      carbs: 7,
      netCarbs: 4,
      fats: 17,
      fiber: 3,
      calories: 199,
    },
    ingredients: [
      { name: 'Fresh spinach', quantity: 300, unit: 'g' },
      { name: 'Full-fat coconut milk', quantity: 250, unit: 'ml' },
      { name: 'Vegetable broth (low-sodium)', quantity: 400, unit: 'ml' },
      { name: 'Onion, roughly chopped', quantity: 1, unit: 'small' },
      { name: 'Garlic cloves', quantity: 3, unit: 'pieces' },
      { name: 'Ginger, peeled and sliced', quantity: 1.5, unit: 'tsp' },
      { name: 'Green chili', quantity: 1, unit: 'piece' },
      { name: 'Coconut oil', quantity: 1, unit: 'tbsp' },
      { name: 'Cumin seeds', quantity: 0.5, unit: 'tsp' },
      { name: 'Turmeric powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Lemon juice', quantity: 1, unit: 'tbsp' },
      { name: 'Salt', quantity: 0, unit: 'to taste' },
      { name: 'Fresh cream or coconut cream', quantity: 2, unit: 'tbsp', notes: 'for swirling on top' },
      { name: 'Pumpkin seeds', quantity: 1, unit: 'tbsp', notes: 'for topping' },
    ],
    instructions: [
      'Heat coconut oil in a pot. Add cumin seeds and let them splutter.',
      'Add onion, garlic, ginger, and green chili. Sauté for 3 minutes until softened.',
      'Add turmeric and stir for 20 seconds.',
      'Add spinach and vegetable broth. Bring to a boil, then reduce heat and simmer for 5 minutes.',
      'Remove from heat and blend the soup until completely smooth.',
      'Return to pot over low heat. Stir in coconut milk and lemon juice. Season with salt.',
      'Simmer gently for 3 minutes — do not boil after adding coconut milk.',
      'Ladle into bowls. Swirl a spoonful of cream on top and scatter pumpkin seeds.',
    ],
    tags: ['keto', 'low-carb', 'vegetarian', 'vegan', 'dinner', 'soup', 'indian', 'quick', 'light'],
    dietaryTags: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'nut-free', 'soy-free', 'grain-free'],
    tips: [
      'Add a squeeze more lemon right at the end — acid brightens the spinach flavor dramatically.',
      'For a thicker consistency, blend in half a small avocado.',
      'Use an immersion blender directly in the pot for less washing up.',
    ],
    storageInstructions: 'Refrigerate for up to 3 days. Add a splash of coconut milk when reheating. Do not freeze.',
    isPremium: false,
    rating: 4.6,
    reviewCount: 204,
    createdAt: '2026-03-05T19:00:00Z',
    updatedAt: '2026-05-18T20:00:00Z',
  },

  {
    id: 'keto-iv-010',
    name: 'Tandoori Mushroom & Halloumi Skewers',
    slug: 'tandoori-mushroom-halloumi-skewers',
    description:
      'Large portobello and button mushrooms marinated in a smoky tandoori yogurt masala, threaded on skewers with grilling halloumi. Char-grilled until perfumed with smoke. A dramatic, crowd-pleasing keto dinner.',
    category: 'dinner',
    cuisine: 'Indian',
    prepTimeMinutes: 20,
    cookTimeMinutes: 15,
    servings: 2,
    difficulty: 'medium',
    macros: {
      protein: 36,
      carbs: 16,
      netCarbs: 10,
      fats: 48,
      fiber: 6,
      calories: 636,
    },
    macrosPerServing: {
      protein: 18,
      carbs: 8,
      netCarbs: 5,
      fats: 24,
      fiber: 3,
      calories: 318,
    },
    ingredients: [
      { name: 'Portobello mushrooms, quartered', quantity: 200, unit: 'g' },
      { name: 'Button mushrooms, whole', quantity: 150, unit: 'g' },
      { name: 'Halloumi cheese, cubed (2.5 cm)', quantity: 200, unit: 'g' },
      { name: 'Hung curd (thick Greek yogurt)', quantity: 4, unit: 'tbsp' },
      { name: 'Ghee or butter, melted', quantity: 1, unit: 'tbsp', notes: 'for basting' },
      { name: 'Kashmiri chili powder', quantity: 1.5, unit: 'tsp' },
      { name: 'Cumin powder', quantity: 0.5, unit: 'tsp' },
      { name: 'Coriander powder', quantity: 0.5, unit: 'tsp' },
      { name: 'Garam masala', quantity: 0.5, unit: 'tsp' },
      { name: 'Turmeric powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Ginger-garlic paste', quantity: 1, unit: 'tsp' },
      { name: 'Lemon juice', quantity: 1, unit: 'tbsp' },
      { name: 'Chaat masala', quantity: 0.5, unit: 'tsp', notes: 'for finishing' },
      { name: 'Salt', quantity: 0, unit: 'to taste' },
      { name: 'Lemon wedges', quantity: 2, unit: 'pieces', notes: 'to serve' },
    ],
    instructions: [
      'Mix hung curd, Kashmiri chili, cumin, coriander, garam masala, turmeric, ginger-garlic paste, lemon juice, and salt into a thick marinade.',
      'Add mushrooms and halloumi to the marinade. Toss well to coat. Marinate for at least 30 minutes (or overnight in the fridge).',
      'Thread alternating pieces of mushroom and halloumi onto metal skewers.',
      'Grill over high direct heat (grill pan, BBQ, or oven broiler at 220°C) for 5–6 minutes per side, basting with melted ghee.',
      'Rotate skewers to ensure even charring on all sides.',
      'Remove from heat and sprinkle with chaat masala immediately.',
      'Serve hot with lemon wedges and keto-friendly mint chutney.',
    ],
    tags: ['keto', 'low-carb', 'vegetarian', 'dinner', 'indian', 'grilled', 'high-protein', 'entertaining'],
    dietaryTags: ['vegetarian', 'gluten-free', 'soy-free', 'nut-free', 'grain-free'],
    tips: [
      'Soak wooden skewers in water for 30 minutes before using to prevent burning.',
      'Pat mushrooms dry before marinating — moisture prevents charring.',
      'Halloumi holds its shape beautifully on high heat; do not substitute with paneer for grilling.',
    ],
    storageInstructions: 'Best eaten straight off the grill. Leftovers keep for 1 day; reheat in a hot grill pan.',
    isPremium: true,
    rating: 4.8,
    reviewCount: 267,
    createdAt: '2026-03-15T19:00:00Z',
    updatedAt: '2026-05-20T21:00:00Z',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SNACKS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'keto-iv-011',
    name: 'Masala Paneer Cubes — Quick Keto Snack',
    slug: 'masala-paneer-cubes-keto-snack',
    description:
      'Bite-sized pan-seared paneer cubes tossed in a dry masala of cumin, chili, and chaat masala. The ultimate 10-minute high-protein keto snack that beats any packet of chips.',
    category: 'snack',
    cuisine: 'Indian',
    prepTimeMinutes: 3,
    cookTimeMinutes: 7,
    servings: 1,
    difficulty: 'easy',
    macros: {
      protein: 18,
      carbs: 4,
      netCarbs: 3,
      fats: 20,
      fiber: 1,
      calories: 268,
    },
    macrosPerServing: {
      protein: 18,
      carbs: 4,
      netCarbs: 3,
      fats: 20,
      fiber: 1,
      calories: 268,
    },
    ingredients: [
      { name: 'Paneer, cubed (1.5 cm)', quantity: 150, unit: 'g' },
      { name: 'Ghee or butter', quantity: 1, unit: 'tsp' },
      { name: 'Chaat masala', quantity: 0.5, unit: 'tsp' },
      { name: 'Red chili flakes', quantity: 0.25, unit: 'tsp' },
      { name: 'Roasted cumin powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Black salt', quantity: 1, unit: 'pinch' },
      { name: 'Lemon juice', quantity: 0.5, unit: 'tsp' },
    ],
    instructions: [
      'Heat ghee in a non-stick pan over high heat.',
      'Add paneer cubes in a single layer — do not crowd the pan.',
      'Sear for 2–3 minutes without moving until the underside is deep golden. Flip and sear for 1 more minute.',
      'Remove from heat. Immediately toss with chaat masala, chili flakes, cumin powder, and black salt.',
      'Squeeze lemon juice over the top and serve hot.',
    ],
    tags: ['keto', 'low-carb', 'vegetarian', 'snack', 'indian', 'high-protein', 'quick', '10-minutes'],
    dietaryTags: ['vegetarian', 'gluten-free', 'nut-free', 'soy-free', 'grain-free'],
    tips: [
      'Let paneer come to room temperature before searing for a more even golden crust.',
      'A dry cast iron pan (no oil) also works beautifully for a charred finish.',
    ],
    storageInstructions: 'Best eaten immediately. Paneer toughens on standing.',
    isPremium: false,
    rating: 4.7,
    reviewCount: 389,
    createdAt: '2026-02-05T15:00:00Z',
    updatedAt: '2026-05-18T16:00:00Z',
  },

  {
    id: 'keto-iv-012',
    name: 'Spiced Pumpkin Seed & Coconut Trail Mix',
    slug: 'spiced-pumpkin-seed-coconut-trail-mix',
    description:
      'A crunchy, spiced Indian-inspired trail mix of pumpkin seeds, sunflower seeds, coconut flakes, and almonds, toasted with curry leaves and a hint of chili. Zero cooking skill required, maximum snacking satisfaction.',
    category: 'snack',
    cuisine: 'Indian',
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    servings: 4,
    difficulty: 'easy',
    macros: {
      protein: 36,
      carbs: 28,
      netCarbs: 16,
      fats: 80,
      fiber: 12,
      calories: 968,
    },
    macrosPerServing: {
      protein: 9,
      carbs: 7,
      netCarbs: 4,
      fats: 20,
      fiber: 3,
      calories: 242,
    },
    ingredients: [
      { name: 'Raw pumpkin seeds (pepitas)', quantity: 100, unit: 'g' },
      { name: 'Raw sunflower seeds', quantity: 60, unit: 'g' },
      { name: 'Unsweetened coconut flakes', quantity: 50, unit: 'g' },
      { name: 'Raw almonds, roughly chopped', quantity: 60, unit: 'g' },
      { name: 'Coconut oil', quantity: 1, unit: 'tsp' },
      { name: 'Curry leaves (dried)', quantity: 8, unit: 'leaves' },
      { name: 'Red chili powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Turmeric powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Cumin powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Pink salt', quantity: 0.25, unit: 'tsp' },
    ],
    instructions: [
      'Preheat oven to 160°C. Line a baking tray with parchment paper.',
      'In a bowl, toss pumpkin seeds, sunflower seeds, coconut flakes, and almonds with coconut oil.',
      'Add chili powder, turmeric, cumin, salt, and crumbled dried curry leaves. Toss until evenly coated.',
      'Spread in a single layer on the prepared tray.',
      'Bake for 8–10 minutes, stirring once at the 5-minute mark, until golden and fragrant.',
      'Watch closely — coconut flakes burn fast.',
      'Cool completely on the tray before storing — the mix crisps up as it cools.',
    ],
    tags: ['keto', 'low-carb', 'vegetarian', 'vegan', 'snack', 'indian', 'meal-prep', 'crunchy'],
    dietaryTags: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'soy-free', 'grain-free'],
    tips: [
      'Batch-make every Sunday — stays crispy in an airtight jar for 2 weeks.',
      'Add a pinch of amchur (dry mango powder) for a tangy punch.',
      'Swap almonds for macadamia nuts for an even higher fat, lower carb ratio.',
    ],
    storageInstructions: 'Store in an airtight container at room temperature for up to 2 weeks.',
    isPremium: false,
    rating: 4.6,
    reviewCount: 198,
    createdAt: '2026-02-15T16:00:00Z',
    updatedAt: '2026-05-17T17:00:00Z',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRE-WORKOUT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'keto-iv-013',
    name: 'Keto Bulletproof Chai',
    slug: 'keto-bulletproof-chai',
    description:
      'The Indian version of bulletproof coffee — strongly brewed masala chai blended with grass-fed butter and MCT oil for a frothy, energizing pre-workout drink. Provides fast ketone fuel and keeps hunger at bay for hours.',
    category: 'pre-workout',
    cuisine: 'Indian',
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    servings: 1,
    difficulty: 'easy',
    macros: {
      protein: 1,
      carbs: 4,
      netCarbs: 3,
      fats: 28,
      fiber: 1,
      calories: 268,
    },
    macrosPerServing: {
      protein: 1,
      carbs: 4,
      netCarbs: 3,
      fats: 28,
      fiber: 1,
      calories: 268,
    },
    ingredients: [
      { name: 'Water', quantity: 200, unit: 'ml' },
      { name: 'Strong black tea (chai blend)', quantity: 1, unit: 'tsp' },
      { name: 'Cardamom pods, crushed', quantity: 2, unit: 'pieces' },
      { name: 'Cinnamon stick', quantity: 0.5, unit: 'small' },
      { name: 'Ginger, thin slices', quantity: 3, unit: 'pieces' },
      { name: 'Cloves', quantity: 1, unit: 'piece' },
      { name: 'Grass-fed unsalted butter', quantity: 1.5, unit: 'tbsp' },
      { name: 'MCT oil (or coconut oil)', quantity: 1, unit: 'tbsp' },
      { name: 'Monk fruit sweetener', quantity: 1, unit: 'tsp', notes: 'optional' },
      { name: 'Pinch of black pepper', quantity: 1, unit: 'pinch', notes: 'enhances bioavailability of spices' },
    ],
    instructions: [
      'Combine water, tea, cardamom, cinnamon, ginger, cloves, and black pepper in a small saucepan.',
      'Bring to a boil, reduce heat, and simmer for 5 minutes to create a concentrated spiced brew.',
      'Strain the chai into a blender. Add butter, MCT oil, and sweetener if using.',
      'Blend on high speed for 20–30 seconds until frothy and fully emulsified (looks like a latte).',
      'Pour immediately into a mug and drink warm.',
    ],
    tags: ['keto', 'low-carb', 'vegetarian', 'pre-workout', 'indian', 'bulletproof', 'energy', 'fasting-friendly'],
    dietaryTags: ['vegetarian', 'gluten-free', 'nut-free', 'soy-free', 'grain-free'],
    tips: [
      'Do not skip the blending step — unblended butter will just float on top.',
      'Start with 1 tsp MCT oil if you are new to it; too much at once can cause digestive discomfort.',
      'Drink 30–45 minutes before a fasted workout for peak fat-burning energy.',
    ],
    storageInstructions: 'Prepare fresh. Does not store well once blended.',
    isPremium: false,
    rating: 4.7,
    reviewCount: 341,
    createdAt: '2026-03-20T07:00:00Z',
    updatedAt: '2026-05-19T08:00:00Z',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // POST-WORKOUT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'keto-iv-014',
    name: 'Paneer & Spinach Recovery Bowl with Tahini Dressing',
    slug: 'paneer-spinach-recovery-bowl-tahini',
    description:
      'A balanced post-workout bowl designed for keto athletes — protein-rich fried paneer on a bed of wilted garlic spinach, topped with a sesame-lemon tahini dressing and a sprinkle of hemp seeds for complete amino acids.',
    category: 'post-workout',
    cuisine: 'Indo-Mediterranean Fusion',
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 1,
    difficulty: 'easy',
    macros: {
      protein: 35,
      carbs: 14,
      netCarbs: 8,
      fats: 44,
      fiber: 6,
      calories: 592,
    },
    macrosPerServing: {
      protein: 35,
      carbs: 14,
      netCarbs: 8,
      fats: 44,
      fiber: 6,
      calories: 592,
    },
    ingredients: [
      { name: 'Paneer, cubed', quantity: 200, unit: 'g' },
      { name: 'Fresh spinach', quantity: 150, unit: 'g' },
      { name: 'Garlic cloves, minced', quantity: 2, unit: 'pieces' },
      { name: 'Ghee', quantity: 1, unit: 'tbsp' },
      { name: 'Tahini (sesame paste)', quantity: 2, unit: 'tbsp' },
      { name: 'Lemon juice', quantity: 1.5, unit: 'tbsp' },
      { name: 'Water', quantity: 2, unit: 'tbsp', notes: 'to thin the dressing' },
      { name: 'Cumin powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Garlic powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Hemp seeds', quantity: 1, unit: 'tbsp' },
      { name: 'Red chili flakes', quantity: 0.25, unit: 'tsp' },
      { name: 'Salt', quantity: 0, unit: 'to taste' },
    ],
    instructions: [
      'Whisk together tahini, lemon juice, water, cumin, garlic powder, and salt to make the dressing. Adjust consistency with more water. Set aside.',
      'Heat ghee in a pan over high heat. Sear paneer cubes until golden on all sides, about 3–4 minutes total. Remove and set aside.',
      'In the same pan, reduce heat to medium. Add minced garlic and sauté for 30 seconds.',
      'Add spinach and toss until just wilted, about 1–2 minutes. Season with salt and chili flakes.',
      'Build the bowl: wilted spinach base, top with paneer cubes, drizzle generously with tahini dressing.',
      'Finish with hemp seeds and an extra squeeze of lemon.',
    ],
    tags: ['keto', 'low-carb', 'vegetarian', 'post-workout', 'high-protein', 'recovery', 'quick'],
    dietaryTags: ['vegetarian', 'gluten-free', 'soy-free', 'grain-free'],
    tips: [
      'Consume within 45 minutes after training for optimal muscle protein synthesis.',
      'Add a pinch of turmeric to the tahini dressing for anti-inflammatory benefits.',
      'Shelled hemp seeds are a complete protein — all 9 essential amino acids.',
    ],
    storageInstructions: 'Best assembled fresh post-workout. Paneer and spinach can be prepped and refrigerated separately for 2 days.',
    isPremium: false,
    rating: 4.8,
    reviewCount: 223,
    createdAt: '2026-04-01T16:00:00Z',
    updatedAt: '2026-05-20T17:00:00Z',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SMOOTHIE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'keto-iv-015',
    name: 'Keto Thandai Smoothie',
    slug: 'keto-thandai-smoothie',
    description:
      'Inspired by the festive Indian thandai drink, this keto smoothie blends almond milk with rose water, cardamom, saffron, fennel, and full-fat coconut cream for a floral, cooling, and utterly indulgent keto treat. Zero added sugar.',
    category: 'smoothie',
    cuisine: 'Indian',
    prepTimeMinutes: 8,
    cookTimeMinutes: 0,
    servings: 1,
    difficulty: 'easy',
    macros: {
      protein: 8,
      carbs: 10,
      netCarbs: 6,
      fats: 30,
      fiber: 4,
      calories: 342,
    },
    macrosPerServing: {
      protein: 8,
      carbs: 10,
      netCarbs: 6,
      fats: 30,
      fiber: 4,
      calories: 342,
    },
    ingredients: [
      { name: 'Unsweetened almond milk', quantity: 200, unit: 'ml' },
      { name: 'Full-fat coconut cream', quantity: 60, unit: 'ml' },
      { name: 'Raw almonds', quantity: 15, unit: 'g', notes: 'soaked overnight and peeled' },
      { name: 'Pumpkin seeds', quantity: 1, unit: 'tbsp' },
      { name: 'Saffron strands', quantity: 8, unit: 'strands', notes: 'soaked in 1 tbsp warm water' },
      { name: 'Cardamom powder', quantity: 0.25, unit: 'tsp' },
      { name: 'Fennel seeds', quantity: 0.5, unit: 'tsp' },
      { name: 'Rose water', quantity: 1, unit: 'tsp' },
      { name: 'Erythritol or monk fruit sweetener', quantity: 1, unit: 'tsp', notes: 'optional' },
      { name: 'Ice cubes', quantity: 4, unit: 'pieces' },
      { name: 'Dried rose petals', quantity: 1, unit: 'tsp', notes: 'for garnish' },
    ],
    instructions: [
      'Combine almond milk, coconut cream, soaked almonds, pumpkin seeds, saffron water, cardamom, fennel seeds, rose water, and sweetener in a blender.',
      'Blend on high for 60–90 seconds until completely smooth and frothy.',
      'Add ice cubes and blend for another 20 seconds.',
      'Pour into a chilled glass.',
      'Garnish with dried rose petals and a pinch of cardamom powder.',
      'Serve immediately.',
    ],
    tags: ['keto', 'low-carb', 'vegetarian', 'vegan', 'smoothie', 'indian', 'festive', 'cooling', 'sugar-free'],
    dietaryTags: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'soy-free', 'grain-free'],
    tips: [
      'Soaking almonds overnight is essential — it makes blending smooth and improves digestibility.',
      'Chill your glass in the freezer for 10 minutes before serving for a true thandai experience.',
      'Increase fennel seeds to 1 tsp for a more pronounced licorice note.',
    ],
    storageInstructions: 'Drink immediately for best flavor. Blended smoothie can be refrigerated for up to 4 hours; stir before drinking.',
    isPremium: false,
    rating: 4.9,
    reviewCount: 302,
    createdAt: '2026-04-10T10:00:00Z',
    updatedAt: '2026-05-20T11:00:00Z',
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
  'dairy-based',
  'nut-free',
  'soy-free',
  'soy-based',
  'grain-free',
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
 * Get recipes sorted by lowest net carbs per serving
 */
export function getLowestCarbRecipes(limit = 5): Recipe[] {
  return [...recipes]
    .sort((a, b) => a.macrosPerServing.netCarbs - b.macrosPerServing.netCarbs)
    .slice(0, limit);
}

/**
 * Get recipes sorted by highest fat content (per serving)
 */
export function getHighestFatRecipes(limit = 5): Recipe[] {
  return [...recipes]
    .sort((a, b) => b.macrosPerServing.fats - a.macrosPerServing.fats)
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
      acc.totalNetCarbs += recipe.macros.netCarbs;
      acc.totalFats += recipe.macros.fats;
      acc.totalCalories += recipe.macros.calories;
      return acc;
    },
    {
      totalRecipes: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalNetCarbs: 0,
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

/**
 * Get all recipes with net carbs per serving under a given threshold
 */
export function getRecipesUnderNetCarbs(maxNetCarbs: number): Recipe[] {
  return recipes.filter((r) => r.macrosPerServing.netCarbs <= maxNetCarbs);
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export default recipes;