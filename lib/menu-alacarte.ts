// lib/menu-alacarte.ts
//
// THE À LA CARTE MENU. Single meals, ordered direct, no subscription.
//
// This is a SEPARATE product line from the 126 subscription meal plans. The
// plans are a 60-day cycle cooked to your macros; this is the single-dish menu
// the same kitchen runs on the aggregators. Different menu, different intent,
// same kitchen and the same licence.
//
// WHY IT LIVES ON THE WEBSITE. Swiggy and Zomato take roughly 40% of the order
// value. Every dish sold here instead of there is the difference between a
// margin and a rounding error, so the homepage names the food and orders it
// direct. We stay listed on both aggregators because presence there is
// discovery and proof, but the site never sends a hungry customer to a channel
// that takes 40 paise of every rupee. That is the whole commercial point of
// this file.
//
// PRICING. Salads and keto carry REAL prices from the owner's menu sheets.
//
// The other 32 dishes (bowls, breakfasts, protein bars, juices) are not priced
// yet. On the owner's instruction they carry a placeholder of Rs 100 to be
// replaced in the next revision, and each one is flagged `provisional: true`
// so the whole set is one grep away:
//
//     grep -n "provisional: true" lib/menu-alacarte.ts
//
// Read that flag before quoting any of these to a customer. Rs 100 sits well
// under the Rs 200-300 the priced dishes run at, so a provisional row reads as
// cheap rather than as a typo, and someone WILL try to order at that price.
// Clearing the flag and setting the real number is one edit per row.
//
// Add-on ladder, consistent across every priced dish: veg +Rs 30-40,
// egg +Rs 50, non-veg +Rs 80-90.

export type MenuCategoryKey = "salads" | "keto" | "bowls" | "breakfast" | "bars" | "juices";

export type AddOn = {
  /** VEG, EGG or NON_VEG, matching how the kitchen actually preps it. */
  kind: "Veg" | "Egg" | "Non-veg";
  what: string;
  price: number;
};

export type MenuItem = {
  name: string;
  /** The menu-card line. One sentence, sensory, no marketing adjectives. */
  blurb: string;
  /** Rupees. Null is still permitted and still renders "On request". */
  price: number | null;
  /**
   * TRUE means `price` is the Rs 100 placeholder, not a real price. Kept as a
   * separate flag rather than encoded in the number so the real value can land
   * without anyone having to remember which rows were fake.
   */
  provisional?: true;
  /** Set when a variant of the same dish is sold at a different price. */
  variantNote?: string;
  addOns?: AddOn[];
};

export type MenuCategory = {
  key: MenuCategoryKey;
  label: string;
  /** What this category is for, in the owner's terms. */
  note: string;
  items: MenuItem[];
};

/** The standard add-on ladder, so it is written once rather than per dish. */
const ADD = (veg: number, egg: number, nonVeg: number): AddOn[] => [
  { kind: "Veg", what: "Paneer or tofu", price: veg },
  { kind: "Egg", what: "Boiled or omelette", price: egg },
  { kind: "Non-veg", what: "Grilled chicken", price: nonVeg },
];

export const MENU: MenuCategory[] = [
  {
    key: "salads",
    label: "Salads",
    note: "Dressing packed separately, assembled in under 90 seconds so it arrives crisp rather than wilted.",
    items: [
      { name: "Broccoli & Bean Salad in Mustard Dressing", blurb: "Charred broccoli, kidney beans and chickpeas, wholegrain mustard and honey vinaigrette, pink pickled onion.", price: 230, addOns: ADD(40, 50, 80) },
      { name: "Spinach & Bean Sprouts in Creamy Celery Dressing", blurb: "Baby spinach and mung sprouts under a celery-cashew dressing, toasted sunflower seeds.", price: 240, addOns: ADD(40, 50, 80) },
      { name: "Bean Sprouts & Lettuce in Guacamole", blurb: "Romaine and sprouts on house guacamole, cherry tomatoes, crushed tortilla.", price: 220, addOns: ADD(40, 50, 80) },
      { name: "Garlicky Cabbage & Spinach Salad", blurb: "Shredded cabbage and spinach in garlic confit oil, crisp garlic chips, toasted sesame.", price: 200, addOns: ADD(40, 50, 80) },
      { name: "Pineapple Cucumber Salad", blurb: "Pineapple and cucumber ribbons, mint, honey-lime chilli dressing, pink salt.", price: 220, addOns: ADD(30, 50, 90) },
      { name: "Brown Rice Salad", blurb: "Brown rice, edamame and bell pepper with a lemon-tahini dressing, sesame and parsley.", price: 240, addOns: ADD(40, 50, 80) },
      { name: "Carrot Raisin Salad", blurb: "Grated carrot, soaked raisins and coconut in an orange-honey-cumin dressing.", price: 210, addOns: ADD(30, 50, 80) },
      { name: "Uncooked Pad Thai Salad", blurb: "Spiralised zucchini and carrot, tamarind-peanut dressing, roasted peanuts, lime.", price: 250, addOns: ADD(40, 50, 80) },
      { name: "Beetroot Salad", blurb: "Roasted beet and orange segments on rocket, walnuts, balsamic glaze.", price: 220, addOns: ADD(40, 50, 80) },
      { name: "Paneer Veggie Salad", blurb: "Grilled paneer, peppers and zucchini on lettuce, mint-yoghurt tahini or chimichurri.", price: 280, variantNote: "Chicken variant Rs 300", addOns: ADD(30, 50, 80) },
    ],
  },
  {
    key: "keto",
    label: "Keto",
    note: "Low carb without pretending a salad is a meal. Real fat, real protein, portioned.",
    items: [
      { name: "Avocado Chicken Keto Salad", blurb: "Grilled chicken, avocado, romaine and cherry tomato, pumpkin seeds, lemon-chilli dressing.", price: 300, variantNote: "Avocado Tofu Rs 280", addOns: ADD(40, 50, 60) },
      { name: "Creamy Keto Paneer Bowl", blurb: "Grilled paneer on blanched spinach and zucchini under an almond-garlic cream, olives and chia.", price: 280, addOns: ADD(30, 50, 80) },
      { name: "Keto Paneer Bhurji", blurb: "Crumbled paneer in a cumin-ghee masala with onion, tomato and capsicum. Indian keto that eats like comfort food.", price: 250, addOns: ADD(30, 50, 80) },
      { name: "Keto Lettuce Wrap", blurb: "Spiced grilled chicken or paneer in crisp lettuce cups, julienned veg, chilli mayo.", price: 260, addOns: ADD(40, 50, 80) },
      { name: "Keto Zucchini Noodles Bowl", blurb: "Spiralised zucchini in creamy pesto with grilled protein, cherry tomatoes and toasted seeds.", price: 280, addOns: ADD(30, 50, 90) },
      { name: "Keto Avocado Smoothie", blurb: "Avocado, coconut milk and almond butter with soaked chia, cinnamon and crushed almonds.", price: 220, addOns: ADD(30, 50, 80) },
    ],
  },
  {
    key: "bowls",
    label: "Bowls",
    note: "A grain base, a protein, and something green. The format most people actually eat lunch in.",
    items: [
      { name: "Mediterranean Power Bowl", blurb: "Quinoa, hummus, grilled zucchini and peppers, chickpeas, olives, lemon-olive oil.", price: 100, provisional: true },
      { name: "Thai Buddha Bowl", blurb: "Brown rice or quinoa with grilled tofu or chicken, peanut sauce, crushed peanuts and lime.", price: 100, provisional: true },
      { name: "Indian Detox Bowl", blurb: "Sprouted moong with cucumber, tomato and carrot, lemon, rock salt and roasted cumin.", price: 100, provisional: true },
      { name: "Green Goddess Bowl", blurb: "Millets, green beans, sautéed spinach and avocado under a green tahini dressing.", price: 100, provisional: true },
      { name: "Mexican Fiesta Bowl", blurb: "Brown rice, black beans and corn with sautéed peppers, salsa or guacamole.", price: 100, provisional: true },
      { name: "Protein-Packed Fitness Bowl", blurb: "Quinoa with grilled tofu or chicken, edamame and sautéed greens, lemon-herb dressing.", price: 100, provisional: true },
      { name: "Asian Shiitake Bowl", blurb: "Soba or brown rice with shiitake and bok choy in soy-ginger, sesame seeds.", price: 100, provisional: true },
      { name: "Keto Low-Carb Bowl", blurb: "Cauliflower rice with grilled paneer or chicken, avocado and spinach, olive oil and lemon.", price: 100, provisional: true },
    ],
  },
  {
    key: "breakfast",
    label: "Breakfast",
    note: "The meal most people skip or ruin. Cooked and at your door by 08:00.",
    items: [
      { name: "Avocado Toast with Egg or Tomato", blurb: "Multigrain toast, lemon-mashed avocado, poached egg or tomato, chilli flakes.", price: 100, provisional: true },
      { name: "Almond Banana Overnight Oats", blurb: "Rolled oats soaked in almond milk with banana and chia, almonds and cinnamon. Vegan.", price: 100, provisional: true },
      { name: "Egg White Veggie Omelette", blurb: "Egg whites with peppers and onion. Tofu version for the vegetarian order.", price: 100, provisional: true },
      { name: "Greek Yogurt Parfait", blurb: "Layered Greek yoghurt, granola and berries, seeds on top.", price: 100, provisional: true },
      { name: "High Protein Paneer Bhurji Wrap", blurb: "Paneer or scrambled egg in onion-tomato masala, wholewheat wrap, coriander and lemon.", price: 100, provisional: true },
      { name: "Masala Millet Veggie Upma", blurb: "Millet upma tempered with mustard, curry leaf and green chilli. Vegan and gluten-free.", price: 100, provisional: true },
      { name: "Chia Seed Pudding", blurb: "Chia set overnight in almond milk and vanilla, fruit and nuts. Vegan.", price: 100, provisional: true },
      { name: "Tofu Scramble with Wholegrain Toast", blurb: "Turmeric tofu scramble with onion, tomato and pepper. Egg version on request.", price: 100, provisional: true },
      { name: "Superfood Smoothie Bowl", blurb: "Frozen banana and berries blended thick, topped with fruit, seeds and coconut.", price: 100, provisional: true },
      { name: "Healthy Breakfast Muffins", blurb: "Two oat-flour and banana muffins, walnuts and raisins. Flax egg for the vegan order.", price: 100, provisional: true },
    ],
  },
  {
    key: "bars",
    label: "Protein bars",
    note: "Made here, not bought in. The thing to eat at 4pm instead of what you usually eat at 4pm.",
    items: [
      { name: "Peanut Butter Power Bar", blurb: "Oats and natural peanut butter bound with honey, chia and protein.", price: 100, provisional: true },
      { name: "Chocolate Almond Crunch Bar", blurb: "Chopped almonds and oats with cocoa and almond butter, vanilla.", price: 100, provisional: true },
      { name: "Berry Bliss Protein Bar", blurb: "Dried berries, dates and oats with chia and coconut oil. Vegan.", price: 100, provisional: true },
      { name: "Banana Walnut Energy Bar", blurb: "Baked banana and oat bar with walnuts and cinnamon.", price: 100, provisional: true },
      { name: "Coconut Cashew Keto Bar", blurb: "Shredded coconut, cashews and almond flour, sweetened with stevia.", price: 100, provisional: true },
      { name: "Double Chocolate Protein Bar", blurb: "Oats, cocoa and dark chocolate with chocolate protein and almond butter.", price: 100, provisional: true },
    ],
  },
  {
    key: "juices",
    label: "Detox juices",
    note: "Cold-pressed the morning they go out. No concentrate, no added sugar.",
    items: [
      { name: "Green Detox Juice", blurb: "Spinach, cucumber, green apple, lemon and ginger.", price: 100, provisional: true },
      { name: "Ironman Juice", blurb: "Beetroot, carrot, spinach and apple with lemon.", price: 100, provisional: true },
      { name: "Magic Juice for Eyes and Skin", blurb: "Carrot and orange with ginger, turmeric and chia.", price: 100, provisional: true },
      { name: "Beet and Carrot Juice", blurb: "Beetroot and carrot pressed with ginger and lemon.", price: 100, provisional: true },
      { name: "Skin Detox Elixir", blurb: "Cucumber, green apple and mint with lemon and coconut water.", price: 100, provisional: true },
      { name: "Ash Gourd Juice", blurb: "Ash gourd with lime and black salt. Drunk fresh, on an empty stomach.", price: 100, provisional: true },
      { name: "Glow-Boosting Juice", blurb: "Orange, carrot, beetroot and apple with flax.", price: 100, provisional: true },
      { name: "Ajwain Period Pain Reliever", blurb: "Carom seed infusion with lemon and honey, served warm.", price: 100, provisional: true },
    ],
  },
];

/* ── Derived counts. Computed, never typed by hand. ─────────────────────── */

export const MENU_STATS = {
  categories: MENU.length,
  items: MENU.reduce((n, c) => n + c.items.length, 0),
  /** Rows carrying a price the kitchen has actually set. */
  priced: MENU.reduce((n, c) => n + c.items.filter((i) => i.price != null && !i.provisional).length, 0),
  /** Rows still on the Rs 100 placeholder. Should reach zero. */
  provisional: MENU.reduce((n, c) => n + c.items.filter((i) => i.provisional).length, 0),
};

/**
 * Cheapest CONFIRMED price, for the "from Rs X" line on the homepage.
 *
 * Provisional rows are excluded on purpose. Including them would make the
 * headline read "from Rs 100" off the back of a placeholder, which is the one
 * number on the page a customer is most likely to hold us to.
 */
export const MENU_FROM = Math.min(
  ...MENU.flatMap((c) =>
    c.items.filter((i) => !i.provisional).map((i) => i.price).filter((p): p is number => p != null),
  ),
);
