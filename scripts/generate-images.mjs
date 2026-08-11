// Generate the FitFuel image set.
//
// ONE art direction across every frame, so 78 separate generations read as one
// shoot rather than 78 stock photos. The direction, the slot list and the
// per-slot prompts all live in scripts/image-slots.mjs, shared with the coverage
// report, because the previous version of this file kept its own copy and the
// copy had drifted into uselessness: it wrote "goal-fatloss" into a flat
// public/images/ai/ while the site looked for "lose-fat" inside
// public/images/ai/goals/. Ten generations, zero pixels on the page.
//
// Output goes to public/images/ai/<folder>/<name>.png so AI-origin assets are
// never mixed with real photography in the same directory. When a real
// photograph arrives it goes in public/images/<folder>/ and wins on precedence
// with no code edit, and the swap is visible in a diff rather than silent.
// That separation is what makes the Terms 13A disclosure checkable per asset.
//
// USAGE
//   node scripts/generate-images.mjs --dry-run          print the plan, spend nothing
//   node scripts/generate-images.mjs --missing --limit 4  fill 4 empty slots
//   node scripts/generate-images.mjs --folder hero      one folder
//   node scripts/generate-images.mjs --only lose-fat    one slot
//   node scripts/generate-images.mjs --missing          everything still empty
//
// --missing is the flag you want almost always: it skips any slot that already
// resolves, so a rerun after a partial failure costs only the failures. There is
// no bare "generate everything" mode on purpose. Every call spends money, and
// the previous default of "all of them, high quality" was a way to spend it
// without meaning to.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { allSlots, promptFor } from "./image-slots.mjs";

// DUAL PROVIDER, deliberately.
//
// Gemini is preferred when a key exists, but note it is called DIRECTLY here
// rather than through .claude/skills/design/scripts/*/generate.py. Those
// scripts reach the right models and wrap every prompt in the wrong scaffolding
// for this job: logo/generate.py prepends "Generate a professional logo image",
// icon/generate.py returns SVG text, and cip/generate.py renders stationery
// mockups. Sending a dish prompt through any of them yields a logo of a curry,
// not a photograph of one.
function keyFromSkillEnv() {
  const paths = [
    path.resolve(".claude/skills/design/.env"),
    path.join(os.homedir(), ".claude", "skills", ".env"),
    path.join(os.homedir(), ".claude", ".env"),
  ];
  for (const p of paths) {
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split("\n")) {
      const m = line.trim().match(/^GEMINI_API_KEY\s*=\s*(.+)$/);
      if (m) return m[1].trim();
    }
  }
  return null;
}

const GEMINI = process.env.GEMINI_API_KEY || keyFromSkillEnv();
const OPENAI = process.env.OPENAI_API_KEY;

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f) => {
  const i = argv.indexOf(f);
  return i === -1 ? null : argv[i + 1];
};

const DRY = has("--dry-run");
const ONLY_MISSING = has("--missing");
const FOLDER = val("--folder");
const ONLY = val("--only");
const LIMIT = val("--limit") ? Number(val("--limit")) : null;

const PUBLIC = path.resolve("public");
const EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

/** Same precedence the site uses: real beats AI. A slot is filled if either has it. */
function exists(folder, name) {
  for (const dir of [`images/${folder}`, `images/ai/${folder}`]) {
    for (const ext of EXT) {
      if (fs.existsSync(path.join(PUBLIC, dir, name + ext))) return true;
    }
  }
  return false;
}

let jobs = allSlots();
if (FOLDER) jobs = jobs.filter((j) => j.folder === FOLDER);
if (ONLY) jobs = jobs.filter((j) => j.name === ONLY);
if (ONLY_MISSING) jobs = jobs.filter((j) => !exists(j.folder, j.name));
if (LIMIT !== null) jobs = jobs.slice(0, LIMIT);

if (jobs.length === 0) {
  console.log("Nothing to do. Every selected slot already has an image.");
  process.exit(0);
}

// No filter at all means the whole 78. Say so rather than quietly starting.
if (!FOLDER && !ONLY && !ONLY_MISSING && LIMIT === null && !DRY) {
  console.error(
    `Refusing to generate all ${jobs.length} slots without an explicit filter.\n` +
      "Pass --missing to fill only empty slots, or --limit N, or --dry-run to see the plan.",
  );
  process.exit(1);
}

if (DRY) {
  console.log(`plan: ${jobs.length} image${jobs.length === 1 ? "" : "s"}\n`);
  for (const j of jobs) {
    console.log(`  ${j.folder.padEnd(9)} ${j.name.padEnd(38)} ${j.size}`);
  }
  console.log(`\nwould write into public/images/ai/<folder>/<name>.png`);
  console.log("no API call made, nothing spent");
  process.exit(0);
}

if (!GEMINI && !OPENAI) {
  console.error(
    "No image key found.\n" +
      "  Gemini: put GEMINI_API_KEY=... in ~/.claude/.env  (https://aistudio.google.com/apikey)\n" +
      "  OpenAI: set OPENAI_API_KEY and ensure the account is not at its billing limit",
  );
  process.exit(1);
}
console.log(`provider: ${GEMINI ? "gemini (gemini-2.5-flash-image)" : "openai (gpt-image-1)"}`);
console.log(`generating: ${jobs.length}\n`);

async function viaGemini(prompt, ratio) {
  const model = "gemini-2.5-flash-image";
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { imageConfig: { aspectRatio: ratio } },
      }),
    },
  );
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const part = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part) throw new Error("no image payload");
  return part.inlineData.data;
}

async function viaOpenAI(prompt, size) {
  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI}` },
    body: JSON.stringify({ model: "gpt-image-1", prompt, size, quality: "high", n: 1 }),
  });
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const b64 = j.data?.[0]?.b64_json;
  if (!b64) throw new Error("no image payload");
  return b64;
}

const RATIO = { "1024x1024": "1:1", "1536x1024": "3:2", "1024x1536": "2:3" };

async function gen(job) {
  const prompt = promptFor(job);
  const b64 = GEMINI
    ? await viaGemini(prompt, RATIO[job.size])
    : await viaOpenAI(prompt, job.size);
  const dir = path.join(PUBLIC, "images", "ai", job.folder);
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, `${job.name}.png`);
  fs.writeFileSync(dest, Buffer.from(b64, "base64"));
  const kb = Math.round(fs.statSync(dest).size / 1024);
  console.log(`OK   ${job.folder}/${job.name}.png  ${job.size}  ${kb}KB`);
}

let fail = 0;
for (const job of jobs) {
  try {
    await gen(job);
  } catch (e) {
    fail++;
    console.log(`FAIL ${job.folder}/${job.name}: ${e.message}`);
  }
}
console.log(
  fail
    ? `\n${fail} failed, ${jobs.length - fail} written. Rerun with --missing to retry only the failures.`
    : `\nall ${jobs.length} generated. Run: node scripts/image-status.mjs`,
);
