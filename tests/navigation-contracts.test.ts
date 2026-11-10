import assert from "node:assert/strict";
import test from "node:test";
import { marketplaceFilterQuery, readMarketplaceFilters } from "../lib/marketplace-filters";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PRODUCT_SERVICES } from "../lib/product-services";
import { PUBLIC_PARTNERS } from "../lib/public-partners";
import { SAMPLE_DAY, SAMPLE_PLAN } from "../app/dashboard-preview/sample-data";
import { HOME_CAPABILITIES } from "../app/_web/home-capabilities";
import { CONDITIONS, HOMEPAGE_CONDITIONS, WEDGE_COLS, wedgeRows } from "../app/_web/home-data";
import { NAV } from "../app/_app/nav";

test("homepage redesign retains the complete product, not just catalogue links", () => {
  assert.equal(HOME_CAPABILITIES.length, 11);
  const app = readFileSync(resolve("app/_web/FitFuelApp.tsx"), "utf8");
  assert.match(app, /<HomeSections/);
  const sections = readFileSync(resolve("app/_web/HomeSections.tsx"), "utf8");
  for (const { id } of HOME_CAPABILITIES.filter((item) => item.id !== "catalog")) {
    assert.ok(sections.includes(`id="${id}"`), `Missing homepage capability: ${id}`);
  }
  // 2026-11-10 conversion restructure: the five dashboard sections are one
  // DashboardBand. The daily-tools and today widgets moved out of the hero
  // into that band, so they render in HomeSections, not HomeExperience.
  const experience = readFileSync(resolve("app/_web/HomeExperience.tsx"), "utf8");
  assert.doesNotMatch(experience, /<HomeLaunchpad/);
  assert.doesNotMatch(experience, /<HomeToday/);
  assert.match(sections, /<HomeLaunchpad/);
  assert.match(sections, /<HomeToday/);
  assert.match(sections, /function DashboardBand/);
  assert.doesNotMatch(sections, /function ProductPreviewBand/);
  assert.doesNotMatch(sections, /function CoachBand/);
  const layout = readFileSync(resolve("app/layout.tsx"), "utf8");
  assert.match(layout, /<CoachDock configured=/);
  const history = readFileSync(resolve("app/api/trainer/thread/route.ts"), "utf8");
  assert.match(history, /await auth\(\)/);
  assert.match(history, /loadLatestThread\(session.user.id\)/);
  assert.match(history, /private, no-store/);
});

test("conversion restructure: partner cards and the services strip are off the homepage", () => {
  const experience = readFileSync(resolve("app/_web/HomeExperience.tsx"), "utf8");
  assert.doesNotMatch(experience, /<PartnerNetwork/);
  assert.doesNotMatch(experience, /active now/);
  assert.doesNotMatch(experience, /For gyms and trainers/);
  const launchpad = readFileSync(resolve("app/_web/HomeLaunchpad.tsx"), "utf8");
  assert.doesNotMatch(launchpad, /<details/);
  assert.doesNotMatch(launchpad, /s\.explore/);
  assert.doesNotMatch(launchpad, /HOME_CAPABILITIES/);
  // The component and data stay: the partner pages still render them.
  for (const page of ["app/partners/page.tsx", "app/corporate/page.tsx", "app/services/page.tsx"]) {
    assert.match(readFileSync(resolve(page), "utf8"), /<PartnerNetwork/);
  }
});

test("conversion restructure: conditions wall shows eight chips and one link", () => {
  assert.equal(HOMEPAGE_CONDITIONS.length, 8);
  const slugs = HOMEPAGE_CONDITIONS.map((c) => c.slug);
  assert.equal(new Set(slugs).size, slugs.length, "wall shows one chip per plan page");
  assert.ok(!slugs.includes("cancer-recovery-veg"), "cancer recovery is off the homepage wall");
  assert.ok(!slugs.includes("kidney-health-veg"), "kidney health is off the homepage wall");
  assert.equal(slugs.filter((s) => s === "pcos-veg").length, 1, "PCOS and PCOD share one chip");
  assert.equal(slugs.filter((s) => s === "heart-health-veg").length, 1, "Cholesterol and Heart health share one chip");
  // The underlying plans are untouched: the full list still carries them.
  assert.ok(CONDITIONS.some((c) => c.slug === "cancer-recovery-veg"));
  assert.ok(CONDITIONS.some((c) => c.slug === "kidney-health-veg"));
  const sections = readFileSync(resolve("app/_web/HomeSections.tsx"), "utf8");
  assert.match(sections, /HOMEPAGE_CONDITIONS\.map/);
  assert.match(sections, /See all \$\{goalCount\}/);
});

test("conversion restructure: comparison names the real alternatives", () => {
  assert.deepEqual([...WEDGE_COLS], [
    "Healthy options on Zomato/Swiggy",
    "Local tiffin",
    "Cooking at home",
  ]);
  const rows = wedgeRows(952, 34);
  assert.equal(rows.length, 8);
  for (const row of rows) {
    assert.ok(!("app" in row) && !("supp" in row), "no fitness-app or supplement-brand column");
    assert.equal(typeof row.aggregator, "string");
    assert.equal(typeof row.tiffin, "string");
    assert.equal(typeof row.home, "string");
    assert.equal(typeof row.us, "string");
  }
  assert.ok(rows.some((r) => r.us.includes("952")), "training row carries the live exercise count");
  assert.ok(rows.some((r) => r.us.includes("34")), "diagnosis row carries the live condition-plan count");
  const sections = readFileSync(resolve("app/_web/HomeSections.tsx"), "utf8");
  assert.doesNotMatch(sections, /row\.app|row\.supp/);
  assert.match(sections, /row\.aggregator/);
  assert.match(sections, /row\.home/);
});

test("conversion restructure: supplements appear once, as a slim strip", () => {
  const sections = readFileSync(resolve("app/_web/HomeSections.tsx"), "utf8");
  assert.match(sections, /function RetailBand/);
  assert.doesNotMatch(sections, /retailGrid/);
  assert.doesNotMatch(sections, /retailCard/);
  assert.match(sections, /Browse \{counts\.marketplaceProducts/);
  const experience = readFileSync(resolve("app/_web/HomeExperience.tsx"), "utf8");
  assert.doesNotMatch(experience, /Supplements from Nutrabay/);
  assert.doesNotMatch(experience, /<PartnerNetwork/);
});

test("testimonials stay on the homepage: chintu confirmed keeping them", () => {
  // The verdict brief said remove by default; chintu answered 2026-11-10
  // 18:08 IST to keep them as they are. This pins that decision so a later
  // pass does not remove them on the stale brief.
  const experience = readFileSync(resolve("app/_web/HomeExperience.tsx"), "utf8");
  assert.match(experience, /<section className=\{x\.proof\}/);
  assert.match(experience, /quotes\.map/);
});

import {
  CUSTOMER_NAV,
  activeCustomerNav,
} from "../app/_web/customer-nav";

test("customer navigation stays identical across storefront and dashboard", () => {
  assert.deepEqual(
    CUSTOMER_NAV.map((item) => [item.label, item.href]),
    [
      ["Order", "/?mode=dishes#catalog"],
      ["Plans", "/?mode=plans#catalog"],
      ["Supplements", "/products"],
      ["Coach", "/dashboard/trainer"],
      ["Today", "/dashboard"],
    ],
  );
});

test("conversion nav: the bottom bar leads with Order and Plans, not Supplements", () => {
  assert.equal(CUSTOMER_NAV[0].key, "dishes");
  assert.equal(CUSTOMER_NAV[0].label, "Order");
  assert.equal(CUSTOMER_NAV[1].key, "plans");
  assert.equal(CUSTOMER_NAV[1].label, "Plans");
  assert.notEqual(CUSTOMER_NAV[0].label, "Supplements");
});

test("conversion nav: the bottom bar renders exactly one label per tab", () => {
  const bar = readFileSync(resolve("app/_web/CustomerTabBar.tsx"), "utf8");
  assert.doesNotMatch(bar, /labelLong|labelShort/);
  assert.match(bar, /window\.matchMedia\("\(max-width: 420px\)"\)/);
  assert.match(bar, /item\.shortLabel && narrow \? item\.shortLabel : item\.label/);
  const css = readFileSync(resolve("app/_web/customer-tab-bar.module.css"), "utf8");
  assert.doesNotMatch(css, /labelLong|labelShort/);
});

test("conversion nav: the homepage keeps the top nav and bottom bar only", () => {
  const app = readFileSync(resolve("app/_web/FitFuelApp.tsx"), "utf8");
  assert.doesNotMatch(app, /aria-label="Sections"/);
  assert.doesNotMatch(app, /modeRow/);
  assert.doesNotMatch(app, /railOffer/);
  assert.doesNotMatch(app, /const NAV|const MORE/);
  assert.match(app, /aria-label="Primary"/);
  assert.match(app, /primaryNav/);
  assert.match(app, /trialCta/);
  assert.match(app, /href="\/plans\?trial=true"/);
  assert.match(app, /aria-label="Open your FitFuel account"/);
});

test("conversion nav: delivery is flat fifty rupees everywhere it is named", () => {
  const app = readFileSync(resolve("app/_web/FitFuelApp.tsx"), "utf8");
  assert.doesNotMatch(app, /₹49/);
  assert.match(app, /delivery ₹50 flat/);
  const cart = readFileSync(resolve("lib/menu-cart.ts"), "utf8");
  assert.match(cart, /export const DELIVERY_RS = 50;/);
});

test("conversion nav: Premium and Luxury are Coming soon with no prices", () => {
  const sections = readFileSync(resolve("app/_web/HomeSections.tsx"), "utf8");
  assert.match(sections, /\(Coming soon\)/);
  assert.doesNotMatch(sections, /\(estimate\)/);
  assert.doesNotMatch(sections, /priced as an estimate/);
  const sheet = readFileSync(resolve("app/_shop/PlanSheet.tsx"), "utf8");
  assert.doesNotMatch(sheet, /estimate at ×/);
  assert.doesNotMatch(sheet, /tierMultiplier/);
  assert.match(sheet, /is coming soon/);
  const pricing = readFileSync(resolve("lib/plan-tier-pricing.ts"), "utf8");
  assert.doesNotMatch(pricing, /are estimates/);
});

test("conversion nav: canonical and open graph point at the live deployment", () => {
  const layout = readFileSync(resolve("app/layout.tsx"), "utf8");
  assert.match(layout, /metadataBase: new URL\(SITE_URL\)/);
  assert.match(layout, /url: SITE_URL/);
  assert.doesNotMatch(layout, /fitfuel\.in/);
  const site = readFileSync(resolve("lib/site.ts"), "utf8");
  assert.match(site, /const FALLBACK = "https:\/\/fitfuel-eosin\.vercel\.app";/);
  for (const page of [
    "app/about/page.tsx",
    "app/blog/page.tsx",
    "app/blog/[slug]/page.tsx",
    "app/contact/page.tsx",
    "app/locations/page.tsx",
    "app/plans/[slug]/page.tsx",
    "app/testimonials/page.tsx",
  ]) {
    const content = readFileSync(resolve(page), "utf8");
    // The locations @id is an organisation identity, not a page URL.
    assert.doesNotMatch(content, /https:\/\/fitfuel\.in\/(?!#)/, `${page} still points a page URL at fitfuel.in`);
  }
});

test("every customer app route highlights exactly one top-level destination", () => {
  assert.equal(activeCustomerNav("/", "dishes"), "dishes");
  assert.equal(activeCustomerNav("/", "plans"), "plans");
  assert.equal(activeCustomerNav("/menu/palak-paneer"), "dishes");
  assert.equal(activeCustomerNav("/plans/weight-loss-veg"), "plans");
  assert.equal(activeCustomerNav("/supplements/creatine"), "supps");
  assert.equal(activeCustomerNav("/products"), "supps");
  assert.equal(activeCustomerNav("/dashboard/trainer"), "coach");
  assert.equal(activeCustomerNav("/dashboard/coach"), "coach");
  assert.equal(activeCustomerNav("/dashboard/nutrition"), "today");
  assert.equal(activeCustomerNav("/dashboard"), "today");
  assert.equal(activeCustomerNav("/dashboard-preview"), "today");
});

test("each advertised service leads to an implemented local page", () => {
  for (const service of PRODUCT_SERVICES) {
    const pathname = new URL(service.href, "https://fitfuel.in").pathname;
    assert.ok(existsSync(resolve("app", `.${pathname}`, "page.tsx")), `${service.title} has no page`);
    assert.ok(service.availability.length > 10);
  }
});

test("public organisation examples cannot look like confirmed partners", () => {
  for (const partner of PUBLIC_PARTNERS) {
    if (partner.placeholder) {
      assert.equal(partner.status, "Coming soon");
      assert.doesNotMatch(partner.name, /XYZ/);
      assert.match(partner.description, /future approved/i);
    } else {
      assert.equal(partner.name, "Nutrabay");
      assert.equal(partner.status, "Affiliate retailer");
      assert.match(partner.description, /commission/);
    }
  }
});

test("dashboard preview is internally consistent and uses isolated examples", () => {
  assert.ok(SAMPLE_PLAN.id.startsWith("preview-"));
  assert.equal(SAMPLE_DAY.meals.reduce((sum, meal) => sum + meal.recipe.caloriesPerServing, 0), SAMPLE_DAY.balance.target);
  const logged = SAMPLE_DAY.meals.filter((meal) => meal.isLogged);
  assert.equal(logged.length, SAMPLE_DAY.balance.mealsLogged);
  assert.equal(logged.reduce((sum, meal) => sum + meal.recipe.caloriesPerServing, 0), SAMPLE_DAY.balance.caloriesIn);
  for (const meal of SAMPLE_DAY.meals) assert.ok(meal.slotId.startsWith("sample-"));
  const previewRoute = readFileSync(resolve("app/dashboard-preview/page.tsx"), "utf8");
  assert.doesNotMatch(previewRoute, /prisma|auth\(|process\.env/);
});

test("the diary keeps subscribed meals separate from optional outside-food search", () => {
  const foodSearch = readFileSync(resolve("app/api/nutrition/foods/route.ts"), "utf8");
  assert.doesNotMatch(foodSearch, /findFitFuelMeals|prisma\.recipe/);
  assert.match(foodSearch, /\{ category: null \}, \{ category: \{ not: "PLAN_RECIPE" \} \}/);
  assert.match(foodSearch, /only for food eaten outside the plan/);

  const diary = readFileSync(resolve("app/api/nutrition/diary/route.ts"), "utf8");
  assert.match(diary, /OR: \[\{ userId: null \}, \{ userId: session\.user\.id \}\]/);
  assert.doesNotMatch(diary, /resolveDiaryFood/);

  const nutrition = readFileSync(resolve("app/dashboard/nutrition/NutritionClient.tsx"), "utf8");
  assert.match(nutrition, /Your FitFuel meals today/);
  assert.match(nutrition, /\/api\/user\/active-plan\/meals\/today/);
  assert.match(nutrition, /\/api\/user\/active-plan\/meals\/log/);
  assert.match(nutrition, /I ate this/);
  assert.match(nutrition, /Log food outside my plan/);
  assert.match(nutrition, /mealPlanAccess\.kind === "active"/);
  assert.match(nutrition, /has ended/);
  assert.match(nutrition, /Search food outside your FitFuel plan/);
  assert.doesNotMatch(nutrition, /FitFuel meals and popular foods/);

  const notifications = readFileSync(resolve("prisma/seed-notification-templates.ts"), "utf8");
  for (const template of ["morning_meal_preview", "evening_recap", "re_engagement"]) {
    assert.ok(notifications.includes(template), `Missing subscriber reminder: ${template}`);
  }

  const dashboard = readFileSync(resolve("app/dashboard/DashboardClient.tsx"), "utf8");
  assert.match(dashboard, /\/api\/user\/active-plan\/meals\/today/);
  assert.match(dashboard, /\/api\/user\/active-plan\/meals\/log/);
  assert.equal(dashboard.match(/<QuickActions \/>/g)?.length, 2);
  const tools = readFileSync(resolve("app/dashboard/QuickActions.tsx"), "utf8");
  for (const label of [
    "Log food & water",
    "Start a workout",
    "Record a weigh-in",
    "Ask your coach",
    "Weekly review",
    "Progress",
    "Supplement guide",
    "Referrals",
    "Notifications",
    "Profile and addresses",
  ]) {
    assert.ok(tools.includes(label), `Dashboard tool is hidden: ${label}`);
  }
  for (const item of NAV.flatMap((group) => group.items)) {
    const route = resolve("app", `.${item.href}`, "page.tsx");
    assert.ok(existsSync(route), `Dashboard capability has no page: ${item.href}`);
    if (item.href !== "/dashboard" && !item.partnerOnly) {
      assert.ok(tools.includes(item.href), `Mobile dashboard hides capability: ${item.href}`);
    }
  }
});

test("published is one product contract across catalogue, detail and checkout", () => {
  const catalogue = readFileSync(resolve("app/plans/page.tsx"), "utf8");
  // ORDERABLE_PLAN_CATEGORIES lives in lib/plan-counts.ts, the one source
  // of truth for plan counts; /plans imports it rather than redefining it.
  assert.match(catalogue, /category: \{ in: \[\.\.\.ORDERABLE_PLAN_CATEGORIES\] \}, isActive: true/);

  const detail = readFileSync(resolve("app/plans/[slug]/page.tsx"), "utf8");
  assert.equal((detail.match(/where: \{ slug, isActive: true \}/g) ?? []).length, 2);

  const checkout = readFileSync(resolve("lib/physical-checkout.ts"), "utf8");
  assert.match(checkout, /if \(!plan\.isActive\)/);
  assert.match(checkout, /not currently published/);

  const schedule = readFileSync(resolve("app/api/plans/[slug]/schedule/route.ts"), "utf8");
  assert.match(schedule, /where: \{ slug, isActive: true \}/);

  const coupon = readFileSync(resolve("app/api/coupon/validate/route.ts"), "utf8");
  assert.match(coupon, /where: \{ slug: planSlug, isActive: true \}/);
});

test("marketplace filters survive a guide visit, reload and shared link", () => {
  const filters = {
    query: "whey & cocoa",
    category: "Protein",
    evidenceOnly: true,
    sort: "price-low" as const,
    visible: 72,
  };
  const saved = new URLSearchParams(marketplaceFilterQuery(filters));
  assert.deepEqual(readMarketplaceFilters(saved, ["Protein", "Creatine"], 738), filters);
});

test("invalid marketplace URL filters use safe defaults and bounded rendering", () => {
  const invalid = new URLSearchParams("category=missing&sort=unknown&shown=Infinity&guidance=false");
  assert.deepEqual(readMarketplaceFilters(invalid, ["Protein"], 738), {
    query: "", category: "All", evidenceOnly: false, sort: "recommended", visible: 36,
  });
  assert.equal(readMarketplaceFilters(new URLSearchParams("shown=999999"), [], 738).visible, 738);
  assert.equal(readMarketplaceFilters(new URLSearchParams("shown=-1"), [], 738).visible, 36);
  assert.equal(marketplaceFilterQuery(readMarketplaceFilters(new URLSearchParams(), [], 738)), "");
});
