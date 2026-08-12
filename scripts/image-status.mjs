// scripts/image-status.mjs
//
// What has landed, what has not, per folder.
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
import { allSlots } from "./image-slots.mjs";

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

// The slot list and the dishSlug() that derives dish names both live in
// scripts/image-slots.mjs now, shared with the generator. Keeping a second copy
// here is what let the generator drift into writing files nothing reads.
const GROUPS = (() => {
  const byFolder = new Map();
  for (const s of allSlots()) {
    if (!byFolder.has(s.folder)) byFolder.set(s.folder, []);
    byFolder.get(s.folder).push(s.name);
  }
  return [...byFolder.entries()];
})();

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
    `\n(week dishes are keyed by recipe slug and counted separately)\n`,
);
