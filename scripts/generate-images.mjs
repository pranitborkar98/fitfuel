// Generate the FitFuel homepage image set.
//
// ONE art direction across every frame, so ten separate generations read as
// one shoot rather than ten stock photos: overhead or low three-quarter,
// single soft daylight source from the left, dark warm surface, matte black
// compartment containers, no hands, no faces, no text or lettering anywhere
// in frame (the disclosure lives in /terms, not burned into the picture),
// shallow depth, fine grain.
//
// Written to public/images/ai/ so AI-origin assets are never mixed with real
// photography in the same directory — when real photos arrive, the swap is
// visible in the diff rather than silent.

import fs from "node:fs";
import path from "node:path";

// DUAL PROVIDER, deliberately.
//
// Gemini is preferred when a key exists, but note it is called DIRECTLY here
// rather than through .claude/skills/design/scripts/*/generate.py. Those
// scripts reach the right models and wrap every prompt in the wrong scaffolding
// for this job: logo/generate.py prepends "Generate a professional logo image",
// icon/generate.py returns SVG text, and cip/generate.py renders stationery
// mockups. Sending a dish prompt through any of them yields a logo of a curry,
// not a photograph of one.
//
// GEMINI_API_KEY is read from the environment or from any of the three paths
// the design skill uses, so a key dropped in for that skill works here too.
import os from "node:os";

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
      if (m) return m[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  return null;
}

const GEMINI = process.env.GEMINI_API_KEY || keyFromSkillEnv();
const OPENAI = process.env.OPENAI_API_KEY;

if (!GEMINI && !OPENAI) {
  console.error(
    "No image key found.\n" +
      "  Gemini: put GEMINI_API_KEY=... in ~/.claude/.env  (https://aistudio.google.com/apikey)\n" +
      "  OpenAI: set OPENAI_API_KEY and ensure the account is not at its billing limit",
  );
  process.exit(1);
}
console.log(`provider: ${GEMINI ? "gemini (gemini-2.5-flash-image)" : "openai (gpt-image-1)"}\n`);

const OUT = path.resolve("public/images/ai");
fs.mkdirSync(OUT, { recursive: true });

const LOOK = [
  "Photographic, editorial food photography.",
  "Single soft north-facing daylight from the left, deep soft shadows, dark warm charcoal surface.",
  "Muted warm palette, slight film grain, shallow depth of field.",
  "No text, no lettering, no logos, no watermarks, no hands, no faces, no people.",
  "Realistic Indian home-style cooking, not western restaurant plating.",
].join(" ");

const JOBS = [
  { file: "day-spread", size: "1536x1024",
    p: "Overhead flat lay of four matte black compartment meal containers arranged on a dark charcoal surface, each holding a different freshly cooked Indian vegetarian meal, lids off, steam barely visible." },
  { file: "dish-chilla", size: "1024x1024",
    p: "Overhead close-up of two crisp golden moong dal lentil crepes on a dark ceramic plate, with a small bowl of bright green coriander chutney and a bowl of white pomegranate raita scattered with ruby pomegranate seeds." },
  { file: "dish-cauliflower", size: "1024x1024",
    p: "Overhead close-up of a thick seared cauliflower steak in a dark peppery South Indian coconut gravy, beside a mound of brown rice flecked with curry leaves, on a dark ceramic plate." },
  { file: "dish-makhana", size: "1024x1024",
    p: "Overhead close-up of a bowl of roasted puffed lotus seed chaat tossed with diced onion, tomato and pomegranate seeds, drizzled with dark tamarind chutney, on a dark surface." },
  { file: "dish-palak-paneer", size: "1024x1024",
    p: "Overhead close-up of silky dark green spinach curry with cubes of paneer, beside two rustic millet flatbreads, on a dark ceramic plate." },
  { file: "goal-fatloss", size: "1024x1024",
    p: "Overhead of a light, protein-forward Indian vegetarian meal in a black compartment container: grilled paneer, sprouted salad, a small portion of grain. Restrained, precise portions." },
  { file: "goal-muscle", size: "1024x1024",
    p: "Overhead of a generous high-protein Indian vegetarian meal in a black compartment container: large paneer portion, rajma, brown rice, boiled eggs to one side. Abundant but neat." },
  { file: "goal-balanced", size: "1024x1024",
    p: "Overhead of a colourful balanced Indian thali-style meal in a black compartment container: dal, sabzi, roti, salad, curd. Warm and homely." },
  { file: "goal-medical", size: "1024x1024",
    p: "Overhead of a carefully portioned low-glycaemic Indian vegetarian meal in a black compartment container: millet roti, leafy greens, lentils, cucumber. Calm and clinical in feel, still appetising." },
  { file: "kitchen-prep", size: "1536x1024",
    p: "Low three-quarter view of a clean stainless steel commercial kitchen prep bench before dawn, bowls of chopped vegetables and spices in steel containers, a digital kitchen scale on the bench, warm task lighting." },
];

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

async function gen(job) {
  const prompt = `${job.p} ${LOOK}`;
  const ratio = job.size === "1536x1024" ? "3:2" : "1:1";
  const b64 = GEMINI ? await viaGemini(prompt, ratio) : await viaOpenAI(prompt, job.size);
  const dest = path.join(OUT, `${job.file}.png`);
  fs.writeFileSync(dest, Buffer.from(b64, "base64"));
  const kb = Math.round(fs.statSync(dest).size / 1024);
  console.log(`OK   ${job.file}.png  ${job.size}  ${kb}KB`);
}

const only = process.argv[2] ? JOBS.filter(j => j.file === process.argv[2]) : JOBS;
let fail = 0;
for (const job of only) {
  try { await gen(job); }
  catch (e) { fail++; console.log(`FAIL ${job.file}: ${e.message}`); }
}
console.log(fail ? `\n${fail} failed` : "\nall generated");
