import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceDirectory = process.argv[2] || process.env.NUTRABAY_SOURCE_DIR;
if (!sourceDirectory) throw new Error("Pass the scraper export folder: npm run catalog:nutrabay -- <source-folder> [output-file]");
const sourceRoot = path.resolve(sourceDirectory);
const outputPath = path.resolve(
  process.argv[3] ?? "data/nutrabay-catalog.json",
);

const full = JSON.parse(
  await readFile(path.join(sourceRoot, "nutrabay_full_catalog.json"), "utf8"),
);
const enriched = JSON.parse(
  await readFile(path.join(sourceRoot, "nutrabay_products.json"), "utf8"),
);

const enrichedByProductId = new Map(
  enriched.map((product) => [String(product.pId), product]),
);

const acronyms = new Map([
  ["100", "100"],
  ["bcaa", "BCAA"],
  ["eaas", "EAAs"],
  ["eaa", "EAA"],
  ["gnc", "GNC"],
  ["hmb", "HMB"],
  ["l", "L"],
  ["mct", "MCT"],
  ["mg", "mg"],
  ["omega", "Omega"],
  ["pro", "Pro"],
  ["zma", "ZMA"],
]);

function validProductUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.hostname === "nutrabay.com" && url.pathname.startsWith("/product/");
  } catch {
    return false;
  }
}

function productSlug(sourceUrl) {
  return new URL(sourceUrl).pathname.split("/").filter(Boolean).at(-1);
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      return acronyms.get(lower) ?? `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    })
    .join(" ")
    .replace(/\bL (Arginine|Carnitine|Citrulline|Glutamine|Leucine|Theanine|Tyrosine)\b/g, "L-$1")
    .replace(/\bOmega (3|6|9)\b/g, "Omega-$1")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanEnrichedTitle(value) {
  return String(value)
    .replace(/\s*\|\s*/g, " · ")
    .replace(/\s+/g, " ")
    .trim();
}

function categoryFor(slug) {
  if (/shaker|bottle|sports-gloves|t-shirt|gym-bag|accessor/.test(slug)) {
    return "Accessories";
  }
  if (/peanut-butter|oats|muesli|protein-bar|energy-bar|snack|honey|granola|cookie|chips/.test(slug)) {
    return "Performance foods";
  }
  if (/gainer|bulk-up|bulk-muscle|mega-mass|rhino-gainer|serious-mass|mass-extreme/.test(slug)) {
    return "Mass gainers";
  }
  if (/protein|whey|casein|isopure/.test(slug)) {
    return "Protein";
  }
  if (/creatine|creafizz|crealean|crea-h2o/.test(slug)) return "Creatine";
  if (/pre-workout|preworkout|pump|nitric-oxide|nitraflex|the-curse|vapor-x|ultra-rush|bodyfuel|nutrition-freak|amplify|caffeine/.test(slug)) return "Pre-workout";
  if (/bcaa|eaa|amino|glutamine|arginine|citrulline|beta-alanine|leucine|taurine/.test(slug)) {
    return "Amino acids";
  }
  if (/fish-oil|omega|flaxseed-oil|mct-oil|krill-oil/.test(slug)) {
    return "Healthy fats";
  }
  if (/multivitamin|vitamin|magnesium|zinc|calcium|iron|zma|electrolyte|mineral|potassium|b12|folate|boron|selenium|copper/.test(slug)) {
    return "Vitamins & minerals";
  }
  if (/fat-burn|fat-loss|weight-loss|l-carnitine|carnitine|cla-/.test(slug)) {
    return "Weight management";
  }
  if (/testosterone|testo-|test-booster|test-hd|best-test|hormone|shilajit|dht-blocker|menopause|thyroid/.test(slug)) {
    return "Hormone & specialty";
  }
  if (/collagen|ashwagandha|probiotic|prebiotic|gut|biotin|melatonin|sleep|stress|liver|milk-thistle|joint|glucosamine|greens|spirulina|moringa|fiber|fibre|psyllium|isabgol|co-enzyme|coenzyme|coq10|glutathione|resveratrol|apple-cider-vinegar|acv-|ginseng|cranberry|digestive-enzyme|inositol|berberine|bromelain|curcumin|boswellia|royal-jelly|acidophilus/.test(slug)) {
    return "Wellness";
  }
  return "Other";
}

const catalog = full
  .filter((row) => validProductUrl(row.source_url))
  .map((row) => {
    const retailerProductId = String(row.pId ?? "").trim();
    const detail = enrichedByProductId.get(retailerProductId);
    const slug = productSlug(row.source_url);
    const price = Number(detail?.price ?? row.price);
    const imageUrl = row.images?.[0] ?? null;

    if (!retailerProductId || !slug || !Number.isFinite(price) || !imageUrl) {
      throw new Error(`Incomplete genuine product row for ${row.source_url}`);
    }

    return {
      retailer: "NUTRABAY",
      retailerProductId,
      variantId: detail?.vId ? String(detail.vId) : null,
      slug,
      name: detail?.title ? cleanEnrichedTitle(detail.title) : titleFromSlug(slug),
      category: categoryFor(slug),
      priceRs: Math.round(price),
      imageUrl,
      sourceUrl: row.source_url,
      affiliateUrl: detail?.affiliate_url ?? row.affiliate_url,
      dataQuality: detail ? "ENRICHED" : "DERIVED",
    };
  })
  .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

const uniqueIds = new Set(catalog.map((product) => product.retailerProductId));
const uniqueUrls = new Set(catalog.map((product) => product.sourceUrl));
const affiliateProblems = catalog.filter((product) => {
  try {
    const url = new URL(product.affiliateUrl);
    return url.hostname !== "nutrabay.com" || url.searchParams.get("ref") !== "pranit1944";
  } catch {
    return true;
  }
});

if (catalog.length !== 738 || uniqueIds.size !== catalog.length || uniqueUrls.size !== catalog.length) {
  throw new Error(
    `Expected 738 unique products, found ${catalog.length} rows, ${uniqueIds.size} IDs and ${uniqueUrls.size} URLs.`,
  );
}
if (affiliateProblems.length > 0) {
  throw new Error(`${affiliateProblems.length} products have invalid affiliate URLs.`);
}

await writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

const categoryCounts = Object.fromEntries(
  [...new Set(catalog.map((product) => product.category))]
    .sort()
    .map((category) => [category, catalog.filter((product) => product.category === category).length]),
);

console.log(
  JSON.stringify(
    {
      sourceRows: full.length,
      rejectedCdnRows: full.length - catalog.length,
      products: catalog.length,
      enriched: catalog.filter((product) => product.dataQuality === "ENRICHED").length,
      derived: catalog.filter((product) => product.dataQuality === "DERIVED").length,
      categoryCounts,
      outputPath,
    },
    null,
    2,
  ),
);
