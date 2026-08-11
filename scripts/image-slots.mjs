// scripts/image-slots.mjs
//
// ONE list of every image slot, and the prompt that fills it.
//
// WHY THIS FILE EXISTS. There were three copies of the slot manifest:
// lib/site-images.ts (what the site reads), scripts/image-status.mjs (what the
// coverage report counted) and scripts/generate-images.mjs (what the generator
// wrote). The third had drifted completely — it emitted "goal-fatloss" into a
// flat public/images/ai/ while the resolver looked for "lose-fat" inside
// public/images/ai/goals/. Every one of its ten outputs was invisible to the
// site. That is the exact failure the header of lib/site-images.ts describes,
// reintroduced one directory over.
//
// So status and generation now read the same array, the folder is a property of
// the slot rather than a thing each script remembers to prepend, and a slot with
// no prompt is a loud error instead of a silent skip.
//
// lib/site-images.ts stays the site's source of truth because it is TypeScript
// the app imports. These names must match it. scripts/check-slot-sync.mjs fails
// the build if they ever diverge again.

import fs from "node:fs";
import path from "node:path";

/** Must stay identical to dishSlug() in app/_hp/DishImage.tsx. */
export function dishSlug(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .split("-")
    .slice(0, 6)
    .join("-");
}

// The shared grade. Every frame gets this so ten generations read as one shoot
// rather than ten stock photos. Mirrors DESIGN.md 5: food keeps its colour,
// people and places take the lime duotone in CSS, so nothing is graded here.
export const LOOK = [
  "Photographic, editorial food photography.",
  "Single soft north-facing daylight from the left, deep soft shadows, dark warm charcoal surface.",
  "Muted warm palette, slight film grain, shallow depth of field.",
  "No text, no lettering, no logos, no watermarks.",
  "Realistic Indian home-style cooking, not western restaurant plating.",
].join(" ");

// People are allowed in exactly the frames that are about people. Everywhere
// else "no hands, no faces" holds, because a stray hand in a dish shot is the
// tell that the set was assembled rather than shot.
const NO_PEOPLE = "No hands, no faces, no people.";
const HANDS_OK = "Hands may appear; no recognisable faces.";

const SQ = "1024x1024";
const WIDE = "1536x1024";
const TALL = "1024x1536";

/** Every non-dish slot: folder, name, aspect, and the prompt that fills it. */
export const SLOTS = [
  // ── hero ──────────────────────────────────────────────────────────────────
  { folder: "hero", name: "hero-box-open", size: WIDE, people: false,
    p: "Overhead flat lay of a single matte black four-compartment meal container, lid removed and resting beside it, each compartment holding a different freshly cooked Indian vegetarian component: grilled paneer, dal, brown rice, a sprouted salad. Steam barely visible. The hero frame of the whole site." },
  { folder: "hero", name: "hero-bowl-overhead", size: WIDE, people: false,
    p: "Overhead close-up of one deep ceramic bowl holding a complete Indian vegetarian meal, grains and greens and a protein arranged in clean sections, a linen cloth and a steel fork just in frame." },
  { folder: "hero", name: "hero-week-spread", size: WIDE, people: false,
    p: "Overhead of seven matte black meal containers arranged in a precise grid on a dark charcoal surface, lids off, each holding a visibly different Indian vegetarian meal. A week of food, seen at once." },
  { folder: "hero", name: "hero-mobile", size: TALL, people: false,
    p: "Vertical 4:5 crop of a single matte black four-compartment meal container photographed from a low three-quarter angle, lid off, one compartment of grilled paneer catching the light. Composed with generous headroom for an overlaid headline." },

  // ── goals ─────────────────────────────────────────────────────────────────
  { folder: "goals", name: "lose-fat", size: SQ, people: false,
    p: "Overhead of a light, protein-forward Indian vegetarian meal in a black compartment container: grilled paneer, sprouted salad, a small measured portion of grain. Restrained, precise portions." },
  { folder: "goals", name: "build-muscle", size: SQ, people: false,
    p: "Overhead of a generous high-protein Indian vegetarian meal in a black compartment container: a large paneer portion, rajma, brown rice, boiled eggs to one side. Abundant but neatly arranged." },
  { folder: "goals", name: "eat-well", size: SQ, people: false,
    p: "Overhead of a colourful balanced Indian thali-style meal in a black compartment container: dal, sabzi, roti, salad, curd. Warm and homely." },
  { folder: "goals", name: "condition", size: SQ, people: false,
    p: "Overhead of a carefully portioned low-glycaemic Indian vegetarian meal: millet roti, bitter gourd, fenugreek greens, lentils, cucumber. Calm and clinical in feel, still appetising." },

  // ── film: one day, in seven frames ────────────────────────────────────────
  { folder: "film", name: "0400-kitchen", size: WIDE, people: false,
    p: "A clean stainless steel commercial kitchen prep bench before dawn, empty and lit by a single warm task lamp, steel containers stacked and waiting, floor still wet from washing. Nobody has arrived yet." },
  { folder: "film", name: "0630-weighing", size: WIDE, people: true,
    p: "Close three-quarter view of a digital kitchen scale on a steel bench with a bowl of chopped vegetables on it, the display lit, a cook's hands steadying the bowl. The moment a portion becomes a number." },
  { folder: "film", name: "0800-doorstep", size: WIDE, people: false,
    p: "A sealed insulated delivery bag standing on a clean apartment doorstep in soft early morning light, the door closed behind it, a doormat and a potted plant just in frame. Pune apartment building, not a western porch." },
  { folder: "film", name: "0802-logged", size: SQ, people: true,
    p: "Close overhead of an opened meal container on a kitchen counter beside a phone lying face down, a hand just withdrawing from the frame. The meal has been eaten from once." },
  { folder: "film", name: "1830-training", size: WIDE, people: true,
    p: "A gym floor in late afternoon light, a loaded barbell resting on the platform, chalk dust in the air, a figure out of focus in the background. Effort, not posing." },
  { folder: "film", name: "2100-evening", size: WIDE, people: false,
    p: "A closed home kitchen at night, one warm light left on over a clean counter, a single glass of water and tomorrow's meal container sitting sealed and ready. Quiet." },
  { folder: "film", name: "sunday-review", size: SQ, people: true,
    p: "Overhead of a kitchen table on a Sunday morning: a notebook with handwritten numbers, a measuring tape coiled, a cup of black coffee, morning light across the surface. Hands resting at the edge of frame." },

  // ── sections ──────────────────────────────────────────────────────────────
  { folder: "sections", name: "conditions", size: WIDE, people: false,
    p: "An apothecary-style bench of condition-specific ingredients: millets in steel bowls, dried fenugreek, bitter gourd, flax and fennel seeds in small dishes, arranged with clinical precision on a dark surface." },
  { folder: "sections", name: "kitchen-wide", size: WIDE, people: true,
    p: "Wide view of a working stainless steel commercial kitchen mid-service, steam rising from a large pan, prep stations stocked, cooks working in the background out of focus." },
  { folder: "sections", name: "produce", size: WIDE, people: false,
    p: "Overhead of fresh Indian market produce laid out on a dark surface: bottle gourd, okra, spinach bunches, tomatoes, green chillies, ginger, still carrying water droplets." },
  { folder: "sections", name: "delivery-city", size: WIDE, people: true,
    p: "A delivery rider's insulated backpack seen from behind on a Pune street in early morning light, low traffic, warm haze, buildings soft in the background. No visible branding." },
  { folder: "sections", name: "corporate", size: WIDE, people: false,
    p: "A row of identical sealed meal containers laid out along a long office pantry counter, clean and orderly, soft window light, an empty meeting room glazed in the background." },
  { folder: "sections", name: "supplements", size: WIDE, people: false,
    p: "Overhead of unlabelled matte black supplement tubs and a steel scoop on a dark surface, whey powder spilled in a small precise drift, a shaker bottle to one side." },
  { folder: "sections", name: "week-spread", size: WIDE, people: false,
    p: "Overhead of a full week of sealed meal containers stacked in two neat columns on a dark surface, lids on, condensation faintly visible inside. Logistics, photographed as care." },
  { folder: "sections", name: "packaging", size: SQ, people: true,
    p: "Close three-quarter of a single matte black meal container being sealed, the film drawn taut across the compartments, hands at the edge of frame, steel bench beneath." },
  { folder: "sections", name: "partners", size: WIDE, people: true,
    p: "A gym reception counter at opening time, a stack of sealed meal containers on the desk beside a sign-in book, equipment out of focus behind. Partnership, shown as logistics." },
  { folder: "sections", name: "menu-alacarte", size: WIDE, people: false,
    p: "Overhead of six different Indian vegetarian salads and bowls in dark ceramic dishes arranged in a loose grid on a charcoal surface, each visibly distinct in colour and texture." },

  // ── social ────────────────────────────────────────────────────────────────
  // Composed with dead space on purpose: these are backplates that get type laid
  // over them at share time, so a centred subject would fight the overlay.
  { folder: "social", name: "og-default", size: WIDE, people: false,
    p: "Overhead of a single matte black four-compartment meal container positioned in the right third of the frame on a dark charcoal surface, the left two thirds deliberately empty and evenly lit for overlaid text." },
  { folder: "social", name: "og-trial", size: WIDE, people: false,
    p: "Overhead of one opened meal container and a glass of water in the lower right of the frame on a dark surface, upper left deliberately empty and evenly lit for overlaid text." },
  { folder: "social", name: "ig-square", size: SQ, people: false,
    p: "Overhead of a complete Indian vegetarian meal in a dark ceramic bowl, centred, generous even margin of empty dark surface on all four sides." },
  { folder: "social", name: "ig-story", size: TALL, people: false,
    p: "Vertical composition of a sealed meal container standing on a dark surface in the lower third, the upper two thirds empty dark background with soft falloff, for overlaid text." },
  { folder: "social", name: "wa-preview", size: SQ, people: false,
    p: "Tight overhead of grilled paneer and greens in one compartment of a black container, filling the frame edge to edge, legible at very small size." },
];

/** Read the a la carte menu and build one dish job per dish, prompt included.
 *
 *  The blurb in lib/menu-alacarte.ts already describes the plate in the owner's
 *  words. Deriving the prompt from it means a reworded dish regenerates to match
 *  the new copy instead of quietly keeping a photograph of the old recipe. */
export function dishSlots() {
  const src = fs.readFileSync(path.resolve("lib/menu-alacarte.ts"), "utf8");
  const rows = [...src.matchAll(/name: "([^"]+)", blurb: "([^"]+)"/g)];
  return rows.map(([, name, blurb]) => ({
    folder: "dishes",
    name: dishSlug(name),
    size: SQ,
    people: false,
    p: `Overhead close-up of ${name}, plated in a dark ceramic bowl on a charcoal surface. ${blurb}`,
  }));
}

/** Every slot the site can display, dishes included. */
export function allSlots() {
  return [...SLOTS, ...dishSlots()];
}

/** The full prompt sent to the model, grade and people-rule appended. */
export function promptFor(slot) {
  return `${slot.p} ${LOOK} ${slot.people ? HANDS_OK : NO_PEOPLE}`;
}
