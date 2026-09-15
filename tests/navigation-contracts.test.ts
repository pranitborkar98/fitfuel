import assert from "node:assert/strict";
import test from "node:test";
import { marketplaceFilterQuery, readMarketplaceFilters } from "../lib/marketplace-filters";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PRODUCT_SERVICES } from "../lib/product-services";
import { PUBLIC_PARTNERS } from "../lib/public-partners";
import { SAMPLE_DAY, SAMPLE_PLAN } from "../app/dashboard-preview/sample-data";

import {
  CUSTOMER_NAV,
  activeCustomerNav,
} from "../app/_web/customer-nav";

test("customer navigation stays identical across storefront and dashboard", () => {
  assert.deepEqual(
    CUSTOMER_NAV.map((item) => [item.label, item.href]),
    [
      ["Meals", "/?mode=dishes#catalog"],
      ["Plans", "/?mode=plans#catalog"],
      ["Supplements", "/products"],
      ["Coach", "/dashboard/trainer"],
      ["Today", "/dashboard"],
    ],
  );
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
      assert.equal(partner.status, "Placeholder");
      assert.match(partner.description, /example.*future approved/i);
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
