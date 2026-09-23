// Read-only public product smoke test. Demo interactions never write account data.
// Set PLAYWRIGHT_MODULE to an installed Playwright package path if not local.
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.PREVIEW_URL || "http://localhost:3001";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [];
const writes = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("request", (request) => {
  if (
    request.method() !== "GET" &&
    request.method() !== "HEAD" &&
    new URL(request.url()).pathname.startsWith("/api/user/")
  )
    writes.push(request.url());
});
await mkdir(".next/product-ui", { recursive: true });

async function layout(label) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  assert.equal(await page.locator("h1").count(), 1, `${label}: one h1`);
  assert.equal(await page.locator("main").count(), 1, `${label}: one main`);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  assert.equal(overflow, false, `${label}: horizontal overflow`);
  await page.screenshot({
    path: `.next/product-ui/${label}.png`,
    fullPage: true,
  });
  await page.screenshot({ path: `.next/product-ui/${label}-viewport.png` });
  console.log(`PASS ${label}`);
}

try {
  await page.goto(`${base}/dashboard-preview`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page.getByText("1,580", { exact: true }).waitFor();
  await layout("dashboard-desktop");
  await page
    .getByRole("button", { name: "I ate this", exact: true })
    .first()
    .click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await page.getByText("1,000", { exact: true }).first().waitFor();
  await page
    .getByRole("button", { name: "Mark it complete", exact: true })
    .click();
  await page.getByText("1,180", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Reset preview", exact: true })
    .click();
  await page.getByText("1,580", { exact: true }).waitFor();
  await page.getByRole("button", { name: /Lunch, 12:30/ }).click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0);
  assert.match(
    await page.evaluate(() => document.activeElement?.textContent),
    /Lunch/,
  );
  console.log("PASS sample meal, workout, reset and dialog focus restoration");
  await page.setViewportSize({ width: 375, height: 812 });
  await layout("dashboard-mobile");
  for (const tool of [
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
    assert.ok(
      await page.getByRole("link", { name: new RegExp(tool, "i") }).count(),
      `dashboard-mobile: visible product tool ${tool}`,
    );
  }
  console.log("PASS dashboard-mobile exposes the complete FitFuel toolset");
  await page
    .getByRole("button", { name: "Without a meal plan", exact: true })
    .click();
  await page.getByRole("heading", { name: "Your day so far" }).waitFor();
  await layout("dashboard-no-plan-mobile");
  await page.getByRole("button", { name: "Open all FitFuel tools" }).click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0);
  assert.equal(
    await page
      .getByRole("button", { name: "Open all FitFuel tools" })
      .evaluate((element) => element === document.activeElement),
    true,
  );
  assert.deepEqual(writes, [], "Preview must not write to account APIs");

  for (const [path, label] of [
    ["/services", "services"],
    ["/corporate", "corporate"],
    ["/partners", "partners"],
    ["/", "home"],
    ["/products", "supplements"],
    ["/supplements", "ingredient-guide"],
  ]) {
    await page.goto(`${base}${path}`, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    await layout(`${label}-mobile`);
    if (path !== "/products" && path !== "/supplements") {
      assert.ok(await page.getByText("XYZ Gym", { exact: true }).count());
      assert.ok(await page.getByText("Placeholder", { exact: true }).count());
    }
    if (
      ["/corporate", "/partners", "/services", "/supplements"].includes(path)
    ) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await layout(`${label}-desktop`);
      await page.setViewportSize({ width: 375, height: 812 });
    }
  }
  await page.goto(`${base}/corporate`, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Apply for a team programme" }).click();
  await page.waitForURL(/\/auth\/signin\?callbackUrl=/, { timeout: 120000 });
  assert.equal(
    new URL(page.url()).searchParams.get("callbackUrl"),
    "/partners/apply?type=CORPORATE",
  );
  console.log(
    "PASS corporate application preserves selected programme through sign-in",
  );
  await page.goto(`${base}/dashboard`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  assert.ok(
    new URL(page.url()).pathname === "/auth/signin",
    "Customer dashboard remains authenticated",
  );
  assert.deepEqual(errors, [], "Browser errors");
  console.log("PASS dashboard authentication and no browser exceptions");
} finally {
  await browser.close();
}
