// scripts/image-status.mjs
//
// What has landed, what has not, per folder in IMAGE-BRIEF-V2.md.
//
// Written because the previous brief claimed six folders were wired when one
// was, and nothing on disk would have told you. Run this after a generation
// batch and it prints exactly which slots are live, which are AI, and which are
// still empty — so "did that batch work" is a command rather than a guess.
//
//   node scripts/image-status.mjs
//   node scripts/image-status.mjs --missing     only unfilled slots
//
// Dish slugs are derived from lib/menu-alacarte.ts with the SAME dishSlug()
// the site uses, so a renamed dish shows up here as a miss rather than
// silently falling back to a glyph forever.

import fs from "node:fs";
import path from "node:path";

const PUBLIC = path.resolve("public");
const EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
const ONLY_MISSING = process.argv.includes("--missing");

function find(folder, name) {
  for (const [dir, ai] of [
    [`images/${folder}`, false],
    [`images/ai/${folder}`, true],
  ]) {
    for (const ext of EXT) {
      if (fs.existsSync(path.join(PUBLIC, dir, name + ext))) return ai ? "ai" : "real";
    }
  }
  return null;
}

/** Must stay identical to dishSlug() in app/_hp/DishImage.tsx. */
function dishSlug(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .split("-")
    .slice(0, 6)
    .join("-");
}

function alacarteSlugs() {
  try {
    const src = fs.readFileSync(path.resolve("lib/menu-alacarte.ts"), "utf8");
    return [...src.matchAll(/name: "([^"]+)"/g)].map((m) => dishSlug(m[1]));
  } catch {
    return [];
  }
}

const GROUPS = [
  ["hero", ["hero-box-open", "hero-bowl-overhead", "hero-week-spread", "hero-mobile"]],
  ["goals", ["lose-fat", "build-muscle", "eat-well", "condition"]],
  [
    "film",
    ["0400-kitchen", "0630-weighing", "0800-doorstep", "0802-logged", "1830-training", "2100-evening", "sunday-review"],
  ],
  [
    "sections",
    ["conditions", "kitchen-wide", "produce", "delivery-city", "corporate", "supplements", "week-spread", "packaging", "partners", "menu-alacarte"],
  ],
  ["social", ["og-default", "og-trial", "ig-square", "ig-story", "wa-preview"]],
  ["dishes", alacarteSlugs()],
];

let totalReal = 0;
let totalAi = 0;
let totalMissing = 0;

for (const [folder, names] of GROUPS) {
  if (names.length === 0) continue;
  const rows = names.map((n) => [n, find(folder, n)]);
  const real = rows.filter((r) => r[1] === "real").length;
  const ai = rows.filter((r) => r[1] === "ai").length;
  const missing = rows.filter((r) => r[1] === null);

  totalReal += real;
  totalAi += ai;
  totalMissing += missing.length;

  const bar = `${real} real · ${ai} ai · ${missing.length} missing  of ${names.length}`;
  console.log(`\n${folder.padEnd(10)} ${bar}`);

  for (const [n, state] of rows) {
    if (ONLY_MISSING && state !== null) continue;
    const mark = state === "real" ? "OK " : state === "ai" ? "ai " : "-- ";
    console.log(`  ${mark} ${n}`);
  }
}

const total = totalReal + totalAi + totalMissing;
console.log(
  `\n${"".padEnd(50, "-")}\n${totalReal} real, ${totalAi} ai, ${totalMissing} missing of ${total} slots` +
    `\n(week dishes are keyed by recipe slug and counted separately — see IMAGE-BRIEF-V2.md §6)\n`,
);
