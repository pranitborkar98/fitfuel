import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PLACEHOLDER_LOGO_GROUPS } from "../lib/partner-logo-rows";
import { PUBLIC_PARTNERS } from "../lib/public-partners";

// Homepage partner contracts (2026-11-11, homepage-partners track).
//
// Same style as the other contract files: read the source and pin the
// behaviour a later edit must not silently drop. The restore re-adds the
// PartnerNetwork section PR #16 took off the homepage, and the logo rows
// hold generic placeholders only: any word on a placeholder tile that is
// not a category word, "Coming soon" or "Your logo here" is a made-up
// company name, and the test fails on it.
//
// Merge 2026-11-11 (homepage-fix-partners): the four partner cards and
// the "Partner places coming soon" logo wall below them said the same
// thing twice, so they are one section now. The tests below pin that:
// one section, one heading, no card grid, and the apply links on the
// groups instead of on cards.

const read = (p: string) => readFileSync(resolve(p), "utf8");

// Every word a placeholder tile may print.
const PLACEHOLDER_WORDS = new Set([
  "gym",
  "gyms",
  "corporate",
  "corporates",
  "trainer",
  "trainers",
  "franchise",
  "coming",
  "soon",
  "your",
  "logo",
  "here",
]);

test("PartnerNetwork renders on the homepage, before testimonials", () => {
  const experience = read("app/_web/HomeExperience.tsx");
  assert.match(
    experience,
    /import PartnerNetwork from "@\/app\/_kitchen\/PartnerNetwork"/,
  );
  assert.equal((experience.match(/<PartnerNetwork \/>/g) ?? []).length, 1);
  const at = experience.indexOf("<PartnerNetwork />");
  assert.ok(at > experience.indexOf("productMap"), "after the product map");
  assert.ok(
    at < experience.indexOf('id="proof-title"'),
    "before testimonials",
  );
  // The stale PR #16 removal note is gone, replaced by the restore note.
  assert.doesNotMatch(experience, /off the homepage entirely/);
  assert.match(experience, /Partner network restored 2026-11-11/);
});

test("the Nutrabay tile is the one real tile, text wordmark only", () => {
  const nutrabay = PUBLIC_PARTNERS.find((p) => p.name === "Nutrabay");
  assert.ok(nutrabay, "Nutrabay is a public partner");
  assert.equal(nutrabay.status, "Affiliate retailer");
  assert.equal(nutrabay.placeholder, false, "Nutrabay is not a placeholder");
  assert.equal(nutrabay.href, "/products");
  const network = read("app/_kitchen/PartnerNetwork.tsx");
  // The logo-wall tile reads its name, status and link from that same row.
  assert.match(network, /PUBLIC_PARTNERS\.find\(\(p\) => p\.name === "Nutrabay"\)/);
  assert.match(network, /className=\{s\.logoWordmark\}/);
  assert.match(network, /href=\{nutrabay\.href\}/);
  assert.match(network, /Nutrabay, affiliate retailer\. Browse supplements\./);
  // No logo file exists in the repo, so none may be referenced: the
  // wordmark is text, and the file references no image at all.
  assert.doesNotMatch(network, /\.(png|jpg|jpeg|webp|svg|avif)/i);
  assert.doesNotMatch(network, /<Image/);
  // Nutrabay is the only proper name in the logo wall: the name appears
  // five times in the file (merge comment, wordmark comment, the
  // PUBLIC_PARTNERS lookup, the tile aria-label, the disclosure) and
  // nowhere else as a tile.
  assert.equal((network.match(/Nutrabay/g) ?? []).length, 5);
});

test("placeholder logo rows: 6 tiles each, 4 categories, no invented names", () => {
  assert.equal(PLACEHOLDER_LOGO_GROUPS.length, 4);
  assert.deepEqual(
    PLACEHOLDER_LOGO_GROUPS.map((g) => g.label),
    ["Gyms", "Corporates", "Trainers", "Franchise"],
  );
  let total = 0;
  for (const group of PLACEHOLDER_LOGO_GROUPS) {
    assert.equal(group.tiles, 6, `${group.label} holds six places`);
    total += group.tiles;
    // Every word a tile in this group can print must be on the allowlist:
    // the group label, the tile word, "Coming soon", "Your logo here".
    const words = `${group.label} ${group.tileWord} Coming soon Your logo here`
      .toLowerCase()
      .split(/\s+/);
    for (const word of words) {
      assert.ok(
        PLACEHOLDER_WORDS.has(word),
        `"${word}" is not an allowed placeholder word`,
      );
    }
  }
  assert.equal(total, 24, "24 placeholder tiles in total");
  // The component renders the rows from this data, never from hardcoded
  // names: one map over the groups, one repeat per group tile count.
  const network = read("app/_kitchen/PartnerNetwork.tsx");
  assert.match(network, /PLACEHOLDER_LOGO_GROUPS\.map/);
  assert.match(network, /Array\.from\(\{ length: group\.tiles \}/);
  assert.match(network, /Your logo here/);
});

test("franchise copy uses only the llms.txt wording, no terms or fees", () => {
  const llms = read("public/llms.txt");
  assert.match(
    llms,
    /the operating system that\s+runs its own kitchen is the franchise product/,
  );
  assert.match(llms, /The franchise portal is a future phase/);
  assert.match(llms, /Enquiries go to the founders via\s+the contact page/);
  const network = read("app/_kitchen/PartnerNetwork.tsx");
  assert.match(
    network,
    /The operating system that runs its own kitchen is the\s+franchise product/,
  );
  assert.match(network, /The franchise portal is a future phase/);
  assert.match(network, /Enquiries go to the founders via the/);
  assert.match(network, /href="\/contact"/);
  // No fee, investment, territory or location claim anywhere in the
  // section: there is no Franchise model or portal yet to source one from.
  assert.doesNotMatch(
    network,
    /fee|royalt|investment|territor|lakh|crore|₹|Pune|Kharadi|Mumbai/i,
  );
});

test("partners is ONE section: one heading, no card grid, no second coming-soon block", () => {
  const network = read("app/_kitchen/PartnerNetwork.tsx");
  assert.equal((network.match(/<section/g) ?? []).length, 1, "one section");
  assert.equal((network.match(/<h2/g) ?? []).length, 1, "one heading");
  assert.match(network, /<h2 id="partner-network-title">Supplements, gyms and workplaces<\/h2>/);
  // The merged-away blocks leave no trace: no card grid, no second
  // heading for the wall, no wall wrapper, and the cards' map is gone
  // (the Nutrabay lookup is a .find, not a .map).
  assert.doesNotMatch(network, /partnerGrid/);
  assert.doesNotMatch(network, /logoWall/);
  assert.doesNotMatch(network, /Partner places coming soon/);
  assert.doesNotMatch(network, /PUBLIC_PARTNERS\.map/);
  // Group titles sit directly under the section h2, so they are h3,
  // not the h4 the wall used to nest under its own h3.
  assert.doesNotMatch(network, /<h4/);
  assert.match(network, /<h3 className=\{s\.logoGroupTitle\}>/);
  const css = read("app/_kitchen/product-network.module.css");
  assert.doesNotMatch(css, /\.partnerGrid/);
  assert.doesNotMatch(css, /\.logoWall/);
});

test("the apply links live on the groups, not on cards", () => {
  // The data already carried each group's destination and label; the
  // merge is what renders them.
  assert.deepEqual(
    PLACEHOLDER_LOGO_GROUPS.map((g) => [g.key, g.href, g.action]),
    [
      ["gym", "/partners/apply?type=gym", "Apply as a gym"],
      ["corporate", "/corporate", "Explore team meals"],
      ["trainer", "/partners/apply?type=trainer", "Apply as a trainer"],
      ["franchise", "/contact", "Enquire via the contact page"],
    ],
  );
  const network = read("app/_kitchen/PartnerNetwork.tsx");
  assert.match(network, /<Link href=\{group\.href\}>/);
  assert.match(network, /\{group\.action\}/);
  // The Supplements group links the same way, from the Nutrabay row.
  assert.match(network, /<Link href=\{nutrabay\.href\}>/);
  assert.match(network, /\{nutrabay\.action\}/);
  // Every group renders its header row: label on the left, link right.
  assert.match(network, /className=\{s\.logoGroupHead\}/);
});

test("the honest disclosure stays verbatim", () => {
  const network = read("app/_kitchen/PartnerNetwork.tsx");
  assert.match(
    network,
    /Gym, company and trainer places are not signed partners or endorsements\./,
  );
  assert.match(
    network,
    /Nutrabay is linked through an affiliate relationship, not presented as\s+an exclusive partnership\./,
  );
});

test("logo rows scroll at phone width with 44px targets", () => {
  const css = read("app/_kitchen/product-network.module.css");
  // Scope each check to the rule block itself: a file-wide match would
  // pick up widths from unrelated rules further down the file.
  const block = (name: string) => css.match(new RegExp(`\\.${name} \\{[^}]*\\}`))?.[0] ?? "";
  const row = block("logoRow");
  assert.match(row, /overflow-x: auto/);
  assert.doesNotMatch(row, /width: \d+px/);
  assert.match(block("logoTile"), /min-height: 96px/);
  assert.match(block("logoTileLink"), /min-height: 96px/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
