import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import { NUTRABAY_PRODUCTS } from "@/lib/nutrabay-products";
import {
  NUTRABAY_CATALOG,
  findNutrabaySnapshotProduct,
} from "@/lib/nutrabay-catalog";

// Homepage fix contracts (2026-11-11, homepage-fix-rails track).
//
// Same style as the other contract files: read the source and pin the
// behaviour a later edit must not silently drop. Two defects, both from
// chintu looking at the live site:
//   1. "Plan the rest of your week" showed big empty grey boxes: the
//      4-column quickRail held 3 items and the 2-column businessRail held
//      1, so the spare grid cells rendered as empty boxes.
//   2. The supplements catalogue he built was not properly on the homepage:
//      PR #16 replaced the RetailBand product cards with a text-only strip.
// These are static pins, not a browser audit.

const read = (p: string) => readFileSync(resolve(p), "utf8");

/** The JSX between a nav's opening tag and its closing tag. */
const navBody = (src: string, marker: string) => {
  const start = src.indexOf(marker);
  assert.ok(start > 0, `${marker} must exist`);
  const end = src.indexOf("</nav>", start);
  assert.ok(end > start, `${marker} must close`);
  return src.slice(start, end);
};

test("quickRail: four items fill four columns, no empty cell", () => {
  const experience = read("app/_web/HomeExperience.tsx");
  const css = read("app/_web/experience.module.css");
  const rail = navBody(experience, '<nav className={x.quickRail}');
  const items = rail.match(/<(button|Link)[\s>]/g) ?? [];
  assert.equal(items.length, 4, "quickRail must hold exactly 4 items");
  const columns = css.match(
    /\.quickRail \{\s*display: grid;\s*grid-template-columns: repeat\((\d+),/,
  );
  assert.ok(columns, "quickRail must declare a repeat() column count");
  assert.equal(
    Number(columns[1]),
    items.length,
    "grid columns must equal rail items",
  );
  // The narrower grids divide 4 evenly too: 2 across at tablet width,
  // 1 across on a phone, so no width leaves a spare cell.
  assert.match(css, /\.quickRail \{\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);\s*\}/);
  assert.match(css, /\.quickRail \{\s*grid-template-columns: 1fr;\s*\}/);
  // The restored 4th card is the supplements card, with the live count.
  assert.match(rail, /href="\/products"/);
  assert.match(rail, /Supplements from Nutrabay/);
  assert.match(rail, /marketplaceProducts\.toLocaleString\("en-IN"\)/);
  // The stale PR #16 removal note is gone.
  assert.doesNotMatch(experience, /the supplements card left this/);
});

test("businessRail: one item fills one column, no empty cell", () => {
  const experience = read("app/_web/HomeExperience.tsx");
  const css = read("app/_web/experience.module.css");
  const rail = navBody(experience, '<nav className={x.businessRail}');
  const items = rail.match(/<Link[\s>]/g) ?? [];
  assert.equal(items.length, 1, "businessRail must hold exactly 1 item");
  assert.match(
    css,
    /\.businessRail \{\s*display: grid;\s*grid-template-columns: 1fr;/,
    "businessRail must be a single column",
  );
  assert.doesNotMatch(
    css,
    /\.businessRail \{[^}]*repeat\(2/,
    "businessRail must not declare a 2-column grid anywhere",
  );
});

test("RetailBand shows real product cards, not the text-only strip", () => {
  const sections = read("app/_web/HomeSections.tsx");
  const retail = sections.slice(
    sections.indexOf("function RetailBand("),
    sections.indexOf("/* ── 4. Build the plan"),
  );
  assert.ok(retail.length > 1000, "RetailBand must exist in HomeSections.tsx");
  assert.match(retail, /s\.retailGrid/);
  assert.match(retail, /s\.retailCard/);
  assert.match(retail, /s\.retailImage/);
  assert.match(retail, /<Image/);
  assert.match(retail, /src=\{product\.imageUrl\}/);
  assert.match(retail, /\{product\.buy\.priceRs/);
  // The text-only link list is gone: no moreSurfaces nav inside RetailBand.
  assert.doesNotMatch(retail, /moreSurfaces/);
  assert.doesNotMatch(retail, /On Nutrabay/);
  // The browse link and both disclosures stay verbatim.
  assert.match(retail, /Browse \{counts\.marketplaceProducts/);
  assert.match(retail, /href="\/products"/);
  const flat = retail.replace(/\s+/g, " ");
  assert.ok(
    flat.includes(
      "Nutrabay handles payment and fulfilment. FitFuel may earn a commission from qualifying purchases.",
    ),
    "affiliate disclosure must stay verbatim",
  );
  assert.ok(
    flat.includes(
      "Listed prices may change. Confirm price, stock and delivery on Nutrabay before purchase. Ingredient guidance is not medical advice.",
    ),
    "price-change disclosure must stay verbatim",
  );
  // The restored evidence-first line, with live counts.
  assert.match(retail, /Evidence first\. Retailer choice stays yours\./);
  assert.match(retail, /counts\.supplements\.toLocaleString\("en-IN"\)/);
  assert.match(retail, /counts\.retailerLinks\.toLocaleString\("en-IN"\)/);
});

test("every homepage supplement buy link goes through the affiliate click route", () => {
  const sections = read("app/_web/HomeSections.tsx");
  const retail = sections.slice(
    sections.indexOf("function RetailBand("),
    sections.indexOf("/* ── 4. Build the plan"),
  );
  // The Buy anchor uses the tracked buy URL, never a bare evidence link
  // or a direct retailer URL: it opens in a new tab and is marked sponsored.
  assert.match(retail, /<a\s*href=\{product\.buy\.url\}/);
  assert.match(retail, /target="_blank"/);
  assert.match(retail, /rel="noopener noreferrer sponsored"/);
  // buy.url is built in app/page.tsx as the supplements click route.
  const page = read("app/page.tsx");
  assert.match(page, /url: `\/api\/supplements\/click\/\$\{firstLink\.id\}`/);
  // That route redirects to the link's affiliate URL, nothing else.
  const click = read("app/api/supplements/click/[linkId]/route.ts");
  assert.match(click, /safeAffiliateUrl\(link\.affiliateUrl\)/);
  assert.match(click, /NextResponse\.redirect\(destination/);
  // The marketplace click route does the same, validated to nutrabay.com.
  const productClick = read("app/api/products/click/[productId]/route.ts");
  assert.match(productClick, /safeNutrabayUrl\(/);
  assert.match(productClick, /NextResponse\.redirect\(destination/);
});

test("no seeded affiliate URL drops the affiliate parameter", () => {
  // Supplement links are seeded verbatim from NUTRABAY_PRODUCTS
  // (prisma/seed-nutrabay-links.ts: affiliateUrl: product.affiliateUrl),
  // so every buy link the click route can serve carries a pId.
  const seed = read("prisma/seed-nutrabay-links.ts");
  assert.match(seed, /affiliateUrl: product\.affiliateUrl/);
  assert.ok(NUTRABAY_PRODUCTS.length > 0, "curated products must exist");
  for (const product of NUTRABAY_PRODUCTS) {
    const url = new URL(product.affiliateUrl);
    assert.equal(url.protocol, "https:", product.productName);
    assert.equal(url.hostname, "nutrabay.com", product.productName);
    assert.ok(url.searchParams.get("pId"), `${product.productName} needs a pId`);
    assert.ok(url.searchParams.get("ref"), `${product.productName} needs a ref`);
  }
});

test("showcase preview set: four products, names and prices match the catalogue", () => {
  // The preview set is the one RetailBand already received: four
  // supplements with a photograph and a buy link.
  const app = read("app/_web/FitFuelApp.tsx");
  const previewSlugs = ["whey-protein", "creatine", "omega3", "magnesium"];
  for (const slug of previewSlugs) {
    assert.ok(app.includes(`"${slug}"`), `preview set must include ${slug}`);
  }
  // The photographed product is the one the seed makes first: image
  // products get sortOrder -100, and getSupplements takes links ordered
  // by sortOrder, so the jar in the photo and the buy label agree.
  const seedLinks = read("prisma/seed-nutrabay-links.ts");
  assert.match(seedLinks, /sortOrder: product\.imageUrl \? -100 : 0/);
  const page = read("app/page.tsx");
  assert.match(page, /orderBy: \[\{ sortOrder: "asc" \}, \{ priceRs: "asc" \}\]/);
  // Name and price of the photographed product, from the seed source.
  const expected: Record<string, { name: string; priceRs: number }> = {
    "whey-protein": {
      name: "Nutrabay Gold Whey Protein Concentrate",
      priceRs: 3429,
    },
    creatine: {
      name: "Nutrabay Gold Micronized Creatine Monohydrate",
      priceRs: 379,
    },
    omega3: {
      name: "Nutrabay Fish Oil Omega 3 Triple Strength",
      priceRs: 799,
    },
    magnesium: {
      name: "Nutrabay Magnesium Glycinate 2000mg",
      priceRs: 349,
    },
  };
  for (const slug of previewSlugs) {
    const photographed = NUTRABAY_PRODUCTS.filter(
      (p) => p.supplementSlug === slug && p.imageUrl,
    );
    assert.equal(
      photographed.length,
      1,
      `${slug} must have exactly one photographed product`,
    );
    const [product] = photographed;
    assert.equal(product.productName, expected[slug].name, slug);
    assert.equal(product.priceRs, expected[slug].priceRs, slug);
    // The local photo file exists; the showcase never renders a dead image.
    assert.ok(product.imageUrl, `${slug} must have a photo`);
    const imageUrl = product.imageUrl;
    assert.ok(
      imageUrl.startsWith("/images/supplements/nutrabay/"),
      `${slug} photo must be a local Nutrabay image`,
    );
    assert.ok(
      existsSync(resolve(`public${imageUrl}`)),
      `${imageUrl} must exist`,
    );
    // Price and affiliate pId agree with the marketplace snapshot
    // (data/nutrabay-catalog.json), so the homepage price is the
    // catalogue price, not a number typed into copy.
    const pId = new URL(product.affiliateUrl).searchParams.get("pId");
    const snapshot = NUTRABAY_CATALOG.find(
      (row) => new URL(row.affiliateUrl).searchParams.get("pId") === pId,
    );
    assert.ok(snapshot, `${slug} pId ${pId} must exist in the catalogue file`);
    assert.equal(snapshot.priceRs, product.priceRs, `${slug} catalogue price`);
  }
  // Every other curated photo also resolves to a real local file.
  for (const product of NUTRABAY_PRODUCTS) {
    if (!product.imageUrl) continue;
    assert.ok(
      existsSync(resolve(`public${product.imageUrl}`)),
      `${product.imageUrl} must exist`,
    );
  }
});

test("showcase photos are existing local files, no new images", () => {
  // The showcase reuses the files under public/images/supplements/nutrabay
  // only. Nothing in RetailBand may reference an image outside that folder.
  const sections = read("app/_web/HomeSections.tsx");
  const retail = sections.slice(
    sections.indexOf("function RetailBand("),
    sections.indexOf("/* ── 4. Build the plan"),
  );
  assert.doesNotMatch(retail, /\/images\/(?!supplements\/nutrabay)/);
  assert.doesNotMatch(retail, /https?:\/\/[^"']*\.(webp|jpg|jpeg|png)/);
  // The four preview photos are the only ones the band can render, and all
  // four exist.
  for (const slug of ["whey-protein", "creatine", "omega3", "magnesium"]) {
    assert.ok(
      existsSync(resolve(`public/images/supplements/nutrabay/${slug}.webp`)),
      `${slug}.webp must exist`,
    );
  }
  // findNutrabaySnapshotProduct still resolves the click-route ids, so the
  // marketplace fallback path is intact.
  assert.ok(findNutrabaySnapshotProduct("nby-6589930") !== null);
});
