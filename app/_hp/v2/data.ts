// app/_hp/v2/data.ts
//
// The constants and helper arithmetic from design/FitFuel Homepage v2.dc.html,
// ported verbatim. Every figure here is the prototype's own, and the prototype
// states where each came from:
//
//   dishes + macros : prisma/seed-recipes-weight-loss-veg.ts, rotation is
//                     (day - 1) % list.length
//   receipt maths   : lib/pricing-decomposition.ts (delivery 1500/mo,
//                     packaging 2000/mo, round 50, GST 5%, MRP 1.85x smoothed)
//   coach constants : lib/coach/recalibration.ts (7700 / +-300 / 1200 / 14 days)
//   coupons         : prisma/seed-coupons.ts
//   quotes + faqs   : prisma/seed-phase14.ts
//   areas           : app/_hp/Areas.tsx
//   cut-off 9pm     : lib/order-cutoff.ts
//
// Where the live database can serve the same figure, page.tsx passes it in and
// the component prefers it. These are the fallbacks, so the page still renders
// exactly as designed if a query fails.

export const SLOTS = ["Breakfast", "Lunch", "Snack", "Dinner"] as const;

/** One accent per meal slot, drawn from the goal palette. */
export const PLATE_ACCENT = ["var(--fk-green-deep)", "#f59e0b", "#38bdf8", "var(--fk-green)"];

/** One grade for food, one lime duotone for people and places. */
export const FOOD = "saturate(1.06) contrast(1.07)";
export const PLACE = "grayscale(1) contrast(1.07)";

export type Row = [string, string, string, number, number, number, number, number];

export const BREAKFAST: Row[] = [
  ["Maharashtrian Moong Dal Chilla", "Crispy moong dal crepes, coriander chutney, pomegranate raita", "Maharashtrian", 355, 24.5, 38.2, 9.4, 9.8],
  ["Punjabi Missi Roti with Low-Fat Curd", "Missi roti with methi, low-fat curd, onion-cucumber salad", "Punjabi", 370, 22.8, 48.1, 9.2, 8.9],
  ["Andhra-Style Pesarattu", "Green moong crepes, ginger-tamarind chutney, sprout salad", "Andhra", 345, 23.2, 44.8, 7.1, 11.4],
  ["Rajasthani Dalia Khichdi", "Dalia moong khichdi, mustard oil methi tadka, lemon", "Rajasthani", 362, 18.4, 52.6, 8.8, 9.2],
  ["Gujarati Oats Handvo", "Baked oats-lauki savoury cake, sesame tadka, green chutney", "Gujarati", 348, 21.6, 43.2, 9.8, 10.4],
  ["Bengali Cholar Dal Cheela", "Chana dal crepes, kasundi mustard, cucumber", "Bengali", 358, 22.4, 46.1, 8.2, 10.6],
  ["South Indian Ragi Roti", "Ragi finger millet rotis, coconut chutney, cold curd", "South Indian", 352, 14.8, 55.2, 8.4, 7.8],
];

export const LUNCH: Row[] = [
  ["Chettinad Cauliflower Steak", "Seared cauliflower, Chettinad pepper gravy, curry-leaf brown rice", "Chettinad", 468, 22.4, 62.8, 12.1, 12.6],
  ["Kashmiri Haak Saag with Masoor Dal", "Kashmiri haak greens, masoor dal, rotis", "Kashmiri", 482, 28.6, 72.4, 9.2, 18.4],
  ["Hyderabadi Bagara Baingan", "Bagara baingan, jowar bhakri, raw onion-lemon salad", "Hyderabadi", 455, 17.8, 58.2, 16.2, 14.8],
  ["Sindhi Sai Bhaji", "Green dal-vegetables, brown rice, cucumber raita", "Sindhi", 462, 26.4, 64.2, 10.4, 16.8],
  ["Odia Dalma with Brown Rice", "Toor dal with vegetables, brown rice, kachumber", "Odia", 474, 24.8, 72.6, 9.6, 15.2],
  ["North Indian Rajma Masala", "Rajma masala, rotis, raw onion-lemon salad", "North Indian", 488, 28.4, 74.2, 9.8, 19.6],
  ["Maharashtrian Matki Usal", "Sprouted matki usal, kanda-lasun masala, whole wheat pav", "Maharashtrian", 445, 26.2, 66.8, 10.4, 14.2],
];

export const SNACK: Row[] = [
  ["Rajasthani Makhana Chaat", "Roasted makhana chaat, tamarind chutney, pomegranate", "Rajasthani", 195, 5.8, 30.4, 5.6, 9.8],
  ["Gujarati Moong Dhokla Bites", "Steamed sprouted moong dhokla, sesame tadka, mint chutney", "Gujarati", 188, 13.2, 24.8, 4.8, 7.4],
  ["Maharashtrian Kala Chana Chaat", "Boiled kala chana chaat, raw onion, amchur, lemon", "Maharashtrian", 192, 13.8, 28.6, 3.4, 9.2],
  ["Punjabi Hung Curd with Flaxseeds", "Hung curd dip with cumin, flaxseeds, cucumber sticks", "Punjabi", 158, 14.6, 11.4, 6.2, 4.8],
  ["South Indian Oats Idli", "Oats idli, vegetable sambar, coconut-coriander chutney", "South Indian", 205, 10.4, 34.2, 4.2, 5.6],
];

export const DINNER: Row[] = [
  ["North Indian Palak Paneer", "Silky palak paneer, low-fat paneer, jowar roti", "North Indian", 412, 28.4, 42.8, 14.2, 10.6],
  ["Maharashtrian Bharli Vangi", "Stuffed vangi brinjal, peanut-coconut masala, bajra bhakri", "Maharashtrian", 398, 16.4, 52.8, 14.6, 12.4],
  ["South Indian Sambar with Idli", "Toor dal sambar, soft idli, peanut-coconut chutney", "South Indian", 382, 22.4, 56.8, 7.4, 8.4],
  ["Rajasthani Gatte ki Sabzi", "Chickpea flour dumplings in yoghurt gravy, bajra rotis", "Rajasthani", 418, 22.6, 52.4, 12.8, 9.4],
  ["Punjabi Chana Masala", "Chana masala, brown rice, raw onion-lemon salad", "Punjabi", 465, 26.8, 68.4, 9.6, 18.2],
  ["Gujarati Mixed Dal Khichdi", "Three-dal khichdi with ghee tadka, tomato kachumber", "Gujarati", 432, 22.4, 64.8, 10.2, 11.6],
  ["Malabar Kadala Curry with Appam", "Kerala black chickpea curry, appam, cucumber raita", "Malabar Coast", 448, 22.8, 62.4, 13.2, 13.8],
];

export const ROTATION: Row[][] = [BREAKFAST, LUNCH, SNACK, DINNER];

/* lib/pricing-decomposition.ts */
export type DurationRow = [string, number, number, string];
export const DURATIONS: DurationRow[] = [
  ["Trial day", 1, 400, "Four meals, cooked and delivered, weighed to your macros. No subscription, no card kept on file, nothing to cancel."],
  ["Weekly", 7, 2600, "Seven days of the schedule. Long enough to know whether you want this, short enough to stop."],
  ["Bi-weekly", 14, 4900, "Two weeks. The shortest window in which the coach can call a plateau honestly."],
  ["Month, no weekends", 22, 7200, "Twenty-two deliveries, weekdays only. Built for people who cook at the weekend."],
  ["One month", 30, 9500, "The full thirty-day rotation, so no dish repeats back to back."],
  ["Two months", 60, 18000, "Two rotations. Where the weight trend stops being noise."],
  ["Three months", 90, 25500, "Ninety days, the best per-day rate we publish."],
];

export function decompose(subtotal: number, count: number) {
  const r50 = (x: number) => Math.round(x / 50) * 50;
  const delivery = r50((1500 * count) / 30);
  const packaging = r50((2000 * count) / 30);
  const base = subtotal - delivery - packaging;
  const mrp = Math.max(base, Math.round((base * 1.85) / 500) * 500 - 1);
  const gst = Math.round((subtotal * 5) / 100);
  return { base, delivery, packaging, subtotal, gst, total: subtotal + gst, mrp };
}

export const money = (n: number) => "Rs " + n.toLocaleString("en-IN");

export const KCAL_PER_KG = 7700;
export const MAX_SWING = 300;
export const FLOOR = 1200;
export const TARGET = 1800;
export const GOAL_RATE = 0.5;
export const WEIGH_INS = [78.4, 77.9, 77.7, 77.6];

/* Mifflin St Jeor, the multipliers the plan builder uses, and the diet names. */
export const ACTS: [string, number][] = [
  ["Sedentary", 1.2],
  ["Light", 1.375],
  ["Moderate", 1.55],
  ["High", 1.725],
  ["Athlete", 1.9],
];
export const DIETS = ["Veg", "Eggetarian", "Non-veg", "Jain", "Vegan"];
export const GOAL_ADJ = [-0.2, 0.12, 0, 0];

export type Split = [string, string, number, string];
export type Door = {
  goal: string;
  accent: string;
  count: number;
  who: string;
  what: string;
  tags: string[];
  split: Split[];
  /** Where the door's own link lands in the catalogue. */
  href: string;
};

export const DOORS: Door[] = [
  {
    goal: "Lose fat",
    accent: "var(--fk-green-deep)",
    count: 5,
    who: "You want the weight down without living on boiled eggs.",
    what: "A controlled deficit with protein held high, so what you lose is fat and not the muscle underneath it. The kitchen weighs the deficit; you do not count anything.",
    tags: ["Deficit held, not guessed", "Protein 1.6–2g/kg", "Fibre above 25g"],
    split: [["Protein", "30%", 30, "var(--fk-green)"], ["Carbohydrate", "45%", 45, "var(--fk-ink-2)"], ["Fat", "25%", 25, "var(--fk-ink-3)"]],
    href: "/plans?goal=weight_loss",
  },
  {
    goal: "Build muscle",
    accent: "#f59e0b",
    count: 5,
    who: "You train, and eating enough is the part that keeps failing.",
    what: "A surplus you can actually finish, spread across four meals so you hit the protein number without one enormous dinner doing all the work.",
    tags: ["Surplus 300–500 kcal", "Protein every 4 hours", "Training block included"],
    split: [["Protein", "28%", 28, "#f59e0b"], ["Carbohydrate", "52%", 52, "var(--fk-ink-2)"], ["Fat", "20%", 20, "var(--fk-ink-3)"]],
    href: "/plans?goal=muscle_gain",
  },
  {
    goal: "Just eat well",
    accent: "#38bdf8",
    count: 5,
    who: "No target. You are tired of deciding what is for dinner.",
    what: "Maintenance macros across varied regional cuisines, cooked properly. Nothing about it reads as a diet, and there is no number for you to hit.",
    tags: ["Maintenance calories", "Six regional cuisines", "No tracking required"],
    split: [["Protein", "22%", 22, "#38bdf8"], ["Carbohydrate", "53%", 53, "var(--fk-ink-2)"], ["Fat", "25%", 25, "var(--fk-ink-3)"]],
    href: "/plans?goal=balanced",
  },
  {
    goal: "Eat for a condition",
    accent: "#2dd4bf",
    count: 70,
    who: "Diabetes, PCOS, thyroid, fatty liver, postpartum, and 33 more.",
    what: "Written for a diagnosis by a nutritionist, not a generic plan with the rice taken out. Nutritional support, not medical treatment. Read the disclaimer and talk to your doctor.",
    tags: ["38 conditions", "Low-GI where it matters", "Nutritionist-specified"],
    split: [["Protein", "25%", 25, "#2dd4bf"], ["Carbohydrate", "42%", 42, "var(--fk-ink-2)"], ["Fat", "33%", 33, "var(--fk-ink-3)"]],
    href: "/plans?category=LIFESTYLE_MEDICAL",
  },
];

export type Faq = { cat: string; q: string; a: string; chips: string[] };

export const FAQS: Faq[] = [
  { cat: "delivery", q: "Where do you deliver?", a: "We deliver across fifteen areas of east Pune from one kitchen in Kharadi. Delivery areas are expanding: check at checkout whether your address is covered.", chips: ["15 areas", "one kitchen"] },
  { cat: "delivery", q: "When will my food arrive?", a: "You choose a Morning or Evening window when you subscribe. All your meals for the day arrive in a single bundled delivery within that window, never split into separate trips.", chips: ["by 08:00", "one window"] },
  { cat: "delivery", q: "Will all my meals come together?", a: "Yes. We bundle every meal you are subscribed to that day into one drop. It keeps deliveries sustainable and your day predictable.", chips: ["one drop"] },
  { cat: "plan", q: "What is included in a plan?", a: "Most plans include up to four items a day, breakfast, lunch, snack and dinner depending on the plan you pick, each portioned and labelled with its macros. Every box also includes a Morning Boost.", chips: ["4 meals", "macros labelled"] },
  { cat: "food", q: "Can I see the menu before I subscribe?", a: "Yes. The full 30-day rotating menu, including dish names and macros, is completely public, no account needed. Browse a plan and view all 30 days before you decide.", chips: ["30 days public", "no signup wall"] },
  { cat: "plan", q: "Is there a trial?", a: "Yes. A single trial day is ₹420 with no lock-in, no card kept on file and nothing to cancel before you commit to a longer subscription.", chips: ["₹420", "no lock-in"] },
  { cat: "food", q: "What dietary options do you offer?", a: "Vegetarian, eggetarian, non-vegetarian, Jain and vegan options across a wide range of goals, plus condition-specific plans. Jain plans exclude onion, garlic, root vegetables and similar ingredients.", chips: ["5 diets", "38 conditions"] },
  { cat: "billing", q: "Can I pause, skip or cancel?", a: "You can skip or restore upcoming deliveries from Today before the kitchen cut-off. Contact FitFuel support for cancellations and see the Refund & Cancellation Policy for refunds.", chips: ["Before the cut-off"] },
  { cat: "billing", q: "How does corporate billing work?", a: "Every employee gets their own plan and their own macros, and your finance team gets one GST invoice at the end of the month rather than twenty-two of them.", chips: ["one GST invoice"] },
  { cat: "food", q: "How do you know the macros are right?", a: "Every portion is weighed on a scale against its target before the compartment is sealed, inside our own FSSAI-licensed kitchen. That is why your diary can fill itself in.", chips: ["weighed, not estimated", "± 4 g"] },
];

export const FAQ_CATS: [string, string][] = [
  ["all", "Everything"],
  ["delivery", "Delivery"],
  ["food", "The food"],
  ["plan", "Plans"],
  ["billing", "Billing"],
];

export const FAQ_LABEL: Record<string, string> = {
  delivery: "Delivery",
  food: "The food",
  plan: "Plans",
  billing: "Billing",
};

/** Real coordinates, projected to kilometres from the Kharadi kitchen. */
export const PUNE_PLACES = [
  { name: "Viman Nagar", lat: 18.5679, lng: 73.9143 },
  { name: "Kalyani Nagar", lat: 18.5483, lng: 73.9021 },
  { name: "Vadgaon Sheri", lat: 18.5561, lng: 73.9214 },
  { name: "Wagholi", lat: 18.58, lng: 74.0 },
  { name: "Yerwada", lat: 18.5562, lng: 73.8822 },
  { name: "Koregaon Park", lat: 18.5362, lng: 73.8939 },
  { name: "Sangamwadi", lat: 18.5352, lng: 73.8691 },
  { name: "Magarpatta City", lat: 18.5142, lng: 73.9285 },
  { name: "Amanora", lat: 18.5165, lng: 73.9385 },
  { name: "Mundhwa", lat: 18.5352, lng: 73.9253 },
  { name: "Tingre Nagar", lat: 18.5783, lng: 73.8742 },
  { name: "Hadapsar", lat: 18.5008, lng: 73.9412 },
  { name: "Dhanori", lat: 18.5962, lng: 73.8856 },
  { name: "Lohegaon", lat: 18.6012, lng: 73.9142 },
];

export const AREAS = PUNE_PLACES.map((p) => p.name);

export const DAY_STEPS: [string, string, string][] = [
  ["04:00", "The kitchen wakes", "cook sheet"],
  ["06:30", "Your food is weighed", "on a scale"],
  ["08:00", "It is at your door", "one drop"],
  ["08:02", "It logs itself", "pre-logged"],
  ["18:30", "You train to the plan", "952 lifts"],
  ["21:00", "The day closes itself", "whatsapp"],
  ["SUN", "The target moves", "arithmetic"],
];

export const DAY_LABELS = [
  "04:00 · the kitchen wakes",
  "06:30 · your food is weighed",
  "08:00 · at your door",
  "08:02 · it logs itself",
  "18:30 · you train",
  "21:00 · the day closes",
  "Sunday · the target moves",
];

/* The coach's replies are canned until the model is wired in: each one is drawn
   from figures that already exist on this page, never invented. */
export type Reply = { text: string; figures?: string[] };

export function replyFor(question: string): Reply {
  const k = question.toLowerCase();
  if (/plateau|stuck|not los|stall/.test(k))
    return { text: "A plateau is two weigh-ins a fortnight apart moving under half a kilo. When that happens the target is recalculated through 7,700 kcal per kg, capped at ±300 kcal a day and floored at 1,200. You see the arithmetic and choose whether to apply it.", figures: ["14 days", "±300 kcal", "floor 1,200"] };
  if (/protein/.test(k))
    return { text: "A trial day runs about 108 g of protein across four meals, weighed on a scale before each compartment is sealed. If your target needs more, the plan builder shifts the split rather than adding a shake.", figures: ["108 g/day", "4 meals"] };
  if (/price|cost|₹|rs|rupee/.test(k))
    return { text: "A trial day is ₹420 all in: food, delivery to your door by 08:00, sealed packaging and 5% GST. Nothing is kept on file and there is nothing to cancel.", figures: ["₹420 trial", "no card kept"] };
  if (/target|tdee|calorie|kcal/.test(k))
    return { text: "Your target is Mifflin St Jeor for the resting figure, times your activity multiplier, then the goal adjustment, held above the 1,200 kcal floor. Set your numbers in the plan finder above and it shows every step.", figures: ["Mifflin St Jeor", "floor 1,200"] };
  if (/deliver|area|pune|address/.test(k))
    return { text: "One kitchen in Kharadi serves fifteen areas of east Pune, cooked from 04:00 and at your door by 08:00, six mornings a week. The coverage map above is plotted from coordinates, not drawn.", figures: ["15 areas", "by 08:00"] };
  if (/dish|menu|food|veg|jain/.test(k))
    return { text: "Thirty seeded recipes rotate so no dish repeats back to back, across Maharashtrian, Chettinad, Punjabi, Bengali and Gujarati cooking, with vegetarian, eggetarian, non-vegetarian, Jain and vegan splits. The whole 30 days is public before you pay.", figures: ["30 recipes", "no signup wall"] };
  return { text: "Once the model is connected this answers from your own rows: weigh-ins, the diary, training and the plan you are on. Until then, ask about your target, a plateau, protein, a dish or the price and I will answer from the published figures." };
}

export const PROMPTS = [
  "Why am I stuck?",
  "Is my protein enough?",
  "What does the trial cost?",
  "Do you deliver to Wagholi?",
];

export const FEEDS = [
  { k: "Weigh-ins", v: "4 / fortnight", w: "72%", c: "var(--fk-green)" },
  { k: "Meals, pre-logged", v: "4 / day", w: "100%", c: "var(--fk-green)" },
  { k: "Food diary, per gram", v: "154 foods", w: "58%", c: "var(--fk-green-deep)" },
  { k: "Training log", v: "952 exercises", w: "44%", c: "#f59e0b" },
  { k: "Body metrics, bluetooth", v: "18 metrics", w: "30%", c: "#38bdf8" },
];

export const AI_JOBS = [
  { n: "01", c: "var(--fk-green)", h: "Calls the plateau", p: "Two weigh-ins a fortnight apart under half a kilo, and it says so before you notice." },
  { n: "02", c: "var(--fk-green)", h: "Moves the target", p: "Through 7,700 kcal per kg, capped at ±300 a day, never below the 1,200 floor." },
  { n: "03", c: "var(--fk-green-deep)", h: "Reads the diary", p: "Your meals arrive pre-logged, so the answer uses what you actually ate, per gram." },
  { n: "04", c: "#f59e0b", h: "Adjusts the training", p: "Sets and reps in, one net-calorie figure out, folded into the same target." },
  { n: "05", c: "#38bdf8", h: "Answers on supplements", p: "What the evidence supports, at what dose. We sell none of it, so there is nothing to push." },
  { n: "06", c: "var(--fk-ink-2)", h: "Shows its working", p: "Every answer carries the figures it came from. Nothing changes behind your back." },
];

export const MATHS = [
  { n: "7700", unit: "kcal per kg", note: "The energy in a kilogram of body mass. Every adjustment starts here." },
  { n: "±300", unit: "kcal per day, capped", note: "One recalibration can never swing your target further than this." },
  { n: "1200", unit: "kcal floor", note: "No recommendation ever goes below it, whatever the arithmetic says." },
  { n: "14", unit: "days minimum", note: "A plateau needs two weigh-ins a fortnight apart moving under half a kilo." },
];

export const REGIONS: [string, number][] = [
  ["Maharashtrian", 6], ["Chettinad", 4], ["Punjabi", 4], ["Bengali", 4],
  ["Gujarati", 4], ["Hyderabadi", 3], ["Kashmiri", 3], ["Odia, Sindhi", 2],
];

export const WEIGH_ROWS = [
  { k: "Target for this compartment", v: "180 g" },
  { k: "Tolerance", v: "± 4 g" },
  { k: "Sealed", v: "within spec" },
];

export const MENU_PEEK = [
  { k: "Day 04 · Chettinad Pepper Chicken", v: "512 kcal" },
  { k: "Day 11 · Bengali Shorshe Fish", v: "468 kcal" },
  { k: "Day 19 · Rajma Masala, brown rice", v: "488 kcal" },
  { k: "Day 27 · Kashmiri Haak Saag", v: "482 kcal" },
];

export const DROP_ROWS = [
  { k: "Compartments", v: "4" }, { k: "Sealed at", v: "07:12" },
  { k: "Driver", v: "live" }, { k: "Window", v: "07:40–08:10" },
];

export const LOG_ROWS = [
  { k: "Breakfast", v: "412 kcal" }, { k: "Protein", v: "28.4 g" },
  { k: "Carbs", v: "51.2 g" }, { k: "Fat", v: "9.8 g" },
];

export const RECAP_BARS = [64, 88, 46, 92, 71, 100, 58];

export const DIARY_ROWS = [
  { k: "Breakfast · pre-logged", v: "412 kcal", c: "var(--fk-green)" },
  { k: "Lunch · pre-logged", v: "538 kcal", c: "var(--fk-green)" },
  { k: "Poha, 180 g · added", v: "462 kcal", c: "var(--fk-ink-2)" },
];

export const TRAIN_ROWS = [
  { k: "Incline press", v: "4 × 8", c: "var(--fk-green)", fill: "var(--fk-green)" },
  { k: "Overhead press", v: "3 × 10", c: "var(--fk-green)", fill: "var(--fk-green)" },
  { k: "Cable fly", v: "3 × 12", c: "var(--fk-green)", fill: "var(--fk-green)" },
  { k: "Triceps pushdown", v: "3 × 12", c: "var(--fk-line-2)", fill: "transparent" },
];

export const TRAIN_BARS = [42, 60, 38, 72, 55, 84, 48, 66, 90, 58, 74, 100];

export const METRIC_CELLS = [
  { v: "78.2", k: "kg" }, { v: "17.4", k: "% fat" }, { v: "34.6", k: "kg lean" },
  { v: "58", k: "% water" }, { v: "1,712", k: "bmr" }, { v: "31", k: "meta age" },
];

export const COACH_STRIP = [
  { k: "Actual rate, fortnight", v: "−0.05 kg/wk" },
  { k: "Gap through 7,700", v: "−495 kcal" },
  { k: "Held by the cap", v: "−300 kcal" },
];

export const SUPP_GRADES = [
  { k: "Creatine", n: "A", w: "100%", c: "var(--fk-green)" },
  { k: "Whey", n: "A", w: "92%", c: "var(--fk-green)" },
  { k: "Omega-3", n: "B", w: "64%", c: "#38bdf8" },
];

export const INVOICE_ROWS = [
  { k: "22 employees · weekday plan", v: "₹1,58,400", c: "var(--fk-ink-2)" },
  { k: "Per-employee macros", v: "22 plans", c: "var(--fk-ink-2)" },
  { k: "GST at 5%", v: "₹7,920", c: "var(--fk-ink-2)" },
  { k: "One invoice, one payment", v: "₹1,66,320", c: "var(--fk-green)" },
];

export const PARTNER_TYPES = ["Gyms", "Trainers", "Dieticians", "Doctors", "Offices", "Residences", "Clinics", "Studios"];

export const TDEE_ROWS = [
  { k: "Weight", v: "78 kg", w: "62%" },
  { k: "Height", v: "174 cm", w: "48%" },
  { k: "Activity", v: "1.55", w: "55%" },
];

export const LOGOS = [
  { id: "ff-logo-a", ph: "Partner gym logo" },
  { id: "ff-logo-b", ph: "Nutrabay logo" },
  { id: "ff-logo-c", ph: "Corporate client logo" },
  { id: "ff-logo-d", ph: "Clinic logo" },
  { id: "ff-logo-e", ph: "Press mention" },
  { id: "ff-logo-f", ph: "Payment partner" },
];

export const SHELF = [
  { id: "ff-supp-whey", ph: "Whey isolate", name: "Whey isolate", note: "24 g protein / scoop" },
  { id: "ff-supp-creatine", ph: "Creatine monohydrate", name: "Creatine", note: "5 g, daily" },
  { id: "ff-supp-omega", ph: "Omega-3", name: "Omega-3", note: "2 g EPA + DHA" },
  { id: "ff-supp-multi", ph: "Multivitamin", name: "Multivitamin", note: "gap cover only" },
  { id: "ff-supp-vitd", ph: "Vitamin D3", name: "Vitamin D3", note: "tested, then dosed" },
  { id: "ff-supp-electro", ph: "Electrolytes", name: "Electrolytes", note: "for long sessions" },
];

export const AREA_TICKS = [7, 11, 8, 13, 9, 12, 7, 14, 10, 8, 12, 9, 11, 8];

export const FALLBACK_COUPONS = [
  { code: "LAUNCH20", headline: "20% off up to Rs 3,000", terms: "orders over Rs 2,000" },
  { code: "WELCOME15", headline: "15% off up to Rs 2,000", terms: "first order only" },
  { code: "FLAT500", headline: "Rs 500 off", terms: "delivered plans over Rs 5,000" },
];

/** The six counts on the strip, with the tally scale each one is drawn at. */
export const TICKER = [
  { key: "plans", n: 126, l: "plans", accent: "var(--fk-green-deep)", per: 1, cols: 14, scale: "one mark each" },
  { key: "conditions", n: 38, l: "conditions", accent: "#2dd4bf", per: 1, cols: 8, scale: "one mark each" },
  { key: "exercises", n: 952, l: "exercises", accent: "#f59e0b", per: 8, cols: 14, scale: "one mark = 8" },
  { key: "supplements", n: 46, l: "supplements", accent: "#38bdf8", per: 1, cols: 8, scale: "one mark each" },
  { key: "foods", n: 154, l: "foods", accent: "var(--fk-green)", per: 1, cols: 16, scale: "one mark each" },
  { key: "prices", n: 3614, l: "published prices", accent: "var(--fk-ink)", per: 32, cols: 14, scale: "one mark = 32", markColour: "var(--fk-ink-2)" },
];

export const FOOTER_COLS = [
  { head: "Eat", links: [["/plans", "All plans"], ["/menu", "Single meals"], ["/plans?trial=true", "Trial day"], ["/plans/digital", "Digital plans"], ["/our-ingredients", "What is in the food"], ["/allergen-policy", "Allergen policy"], ["/our-kitchen", "Inside the kitchen"]] as [string, string][] },
  { head: "Track", links: [["/dashboard", "Your dashboard"], ["/dashboard/nutrition", "Food and water diary"], ["/dashboard/exercises", "Training programme"], ["/dashboard/body-metrics", "Body metrics"], ["/dashboard/progress", "Progress and review"], ["/tdee-calculator", "Free TDEE calculator"]] as [string, string][] },
  { head: "Work with us", links: [["/corporate", "Corporate plans"], ["/partners", "Gyms and trainers"], ["/partners/apply", "Apply to partner"], ["/dashboard/referrals", "Refer a friend"], ["/supplements", "Supplements"], ["/contact", "Run a FitFuel kitchen"]] as [string, string][] },
];

export const LEGAL: [string, string][] = [
  ["/terms", "Terms"],
  ["/privacy", "Privacy"],
  ["/refund-policy", "Refunds"],
  ["/medical-disclaimer", "Medical disclaimer"],
  ["/allergen-policy", "Allergens"],
];
