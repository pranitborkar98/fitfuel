// Public UI checks plus isolated, intercepted coach fixtures. No live chat writes.
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
page.on("pageerror", (error) => errors.push(error.message));
await mkdir(".artifacts/homepage", { recursive: true });
const ids = [
  "catalog",
  "day-h",
  "wedge-h",
  "digital-h",
  "inside-h",
  "retail-h",
  "plan-h",
  "cond-h",
  "coach-h",
  "faq-h",
  "close-h",
];
async function check(label) {
  await page.locator("h1").waitFor({ state: "visible", timeout: 120000 });
  assert.equal(await page.locator("h1").count(), 1);
  for (const id of ids)
    assert.equal(
      await page.locator(`[id="${id}"]`).count(),
      1,
      `Missing or duplicate product section: ${id}`,
    );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
    `${label}: horizontal overflow`,
  );
  await page.screenshot({
    path: `.artifacts/homepage/${label}.png`,
    fullPage: true,
  });
  await page.screenshot({ path: `.artifacts/homepage/${label}-viewport.png` });
  await page.getByRole("region", { name: "Your daily tools" }).screenshot({ path: `.artifacts/homepage/${label}-tools.png` });
  console.log(`PASS ${label}: all 11 product destinations rendered`);
}
try {
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.locator("#fitfuel-coach-trigger").waitFor({ state: "visible" });
  await check("restored-home-desktop");
  const trigger = page.locator("#fitfuel-coach-trigger");
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Your FitFuel AI coach" });
  await dialog.waitFor();
  await dialog.getByRole("link", { name: /Sign in to your coach/ }).waitFor();
  assert.match(
    await dialog
      .getByRole("link", { name: /Sign in to your coach/ })
      .getAttribute("href"),
    /callbackUrl=%2Fdashboard%2Ftrainer/,
  );
  await page.keyboard.press("Shift+Tab");
  assert.equal(
    await page.evaluate(() => !!document.activeElement?.closest("dialog")),
    true,
    "Focus stays in coach",
  );
  await page.screenshot({ path: ".artifacts/homepage/coach-guest-desktop.png" });
  await page.keyboard.press("Escape");
  assert.equal(
    await trigger.evaluate((element) => element === document.activeElement),
    true,
    "Focus returns to coach button",
  );
  const plan = page.getByRole("region", {
    name: "Build the plan, see the arithmetic",
  });
  const before = await plan.innerText();
  await plan.getByRole("button", { name: "1 Week", exact: true }).click();
  assert.notEqual(
    await plan.innerText(),
    before,
    "Calculator changes with duration",
  );
  assert.equal(
    await plan
      .getByRole("button", { name: "1 Week", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await plan.screenshot({
    path: ".artifacts/homepage/restored-plan-calculator.png",
  });
  await page.getByRole("button", { name: /What if I dislike a dish/ }).click();
  await page.getByText(/Rate the meal in your dashboard/).waitFor();
  for (const size of [
    { width: 375, height: 812 },
    { width: 667, height: 375 },
  ]) {
    await page.setViewportSize(size);
    await page.evaluate(() => scrollTo(0, 0));
    await check(`restored-home-${size.width}`);
    await trigger.click();
    await dialog.waitFor();
    const box = await dialog.boundingBox();
    assert.ok(
      box &&
        box.x >= 0 &&
        box.x + box.width <= size.width + 1 &&
        box.y >= 0 &&
        box.y + box.height <= size.height + 1,
    );
    await page.screenshot({
      path: `.artifacts/homepage/coach-guest-${size.width}.png`,
    });
    await page.keyboard.press("Escape");
  }
  assert.equal(
    (await context.request.get(`${base}/api/trainer/thread`, { timeout: 120000 })).status(),
    401,
    "Thread history requires authentication",
  );
  console.log(
    "PASS guest coach, focus, phone/landscape, calculator, FAQ and private history guard",
  );

  // Mock responses prove UI wiring without impersonating a live account or billing AI.
  const signed = await browser.newContext({
    viewport: { width: 375, height: 812 },
    reducedMotion: "reduce",
  });
  await signed.route("**/api/auth/session", (route) =>
    route.fulfill({
      json: {
        user: {
          id: "test-fixture",
          name: "UI fixture",
          email: "fixture@example.test",
        },
        expires: "2099-01-01T00:00:00Z",
      },
    }),
  );
  await signed.route("**/api/trainer/thread", (route) =>
    route.fulfill({
      json: {
        thread: {
          conversationId: "fixture",
          turns: [
            { role: "assistant", content: "Restored conversation fixture." },
          ],
        },
      },
    }),
  );
  let submitted = false;
  await signed.route("**/api/trainer/chat", async (route) => {
    assert.equal(route.request().postDataJSON().message, "Test connection");
    submitted = true;
    await route.fulfill({
      contentType: "application/x-ndjson",
      body: JSON.stringify({ t: "Connected test response." }) + "\n",
    });
  });
  const chat = await signed.newPage();
  await signed.route("**/api/nutrition/diary", (route) => route.fulfill({ json: { entries: [{}], totals: { calories: 480, protein: 32 } } }));
  let water = 750;
  let failWaterSave = false;
  let failPlanRead = false;
  await signed.route("**/api/nutrition/water", (route) => {
    if (route.request().method() === "POST") {
      if (failWaterSave) return route.fulfill({ status: 503, json: { error: "Test fixture failure" } });
      assert.deepEqual(route.request().postDataJSON(), { action: "add", amountMl: 250 });
      water += 250;
    }
    return route.fulfill({ json: { amountMl: water } });
  });
  await signed.route("**/api/user/active-plan", (route) => failPlanRead ? route.fulfill({ status: 503, json: { error: "Test fixture failure" } }) : route.fulfill({ json: { activePlan: { currentDay: 4, daysRemaining: 26, mealPlan: { name: "Test fixture meal plan" } } } }));
  await signed.route("**/api/user/active-plan/workout-today", (route) => route.fulfill({ json: { hasWorkout: true, focusArea: "Test fixture strength session" } }));
  chat.on("pageerror", (error) => errors.push(error.message));
  await chat.goto(base, { waitUntil: "domcontentloaded", timeout: 120000 });
  const today = chat.getByRole("region", { name: "Today at a glance" });
  await today.getByText("Test fixture meal plan", { exact: true }).waitFor();
  await today.getByText("Test fixture strength session", { exact: true }).waitFor();
  await today.getByRole("button", { name: "+ 250 ml", exact: true }).click();
  await today.getByText("1,000 ml water", { exact: true }).waitFor();
  await today.screenshot({ path: ".artifacts/homepage/home-today-account-fixture.png" });
  console.log("PASS homepage account summary uses real API contracts; add-water updates the diary (intercepted fixture)");
  failWaterSave = true;
  await today.getByRole("button", { name: "+ 250 ml", exact: true }).click();
  await today.getByText(/Could not confirm the save/).waitFor();
  assert.equal(await today.getByRole("button", { name: "+ 250 ml", exact: true }).isDisabled(), true);
  failWaterSave = false;
  failPlanRead = true;
  await today.getByRole("button", { name: "Refresh today's summary" }).click();
  await today.getByText("Plan unavailable", { exact: true }).waitFor();
  await today.getByText("1,000 ml water", { exact: true }).waitFor();
  assert.equal(await today.getByRole("button", { name: "+ 250 ml", exact: true }).isEnabled(), true);
  failPlanRead = false;
  await today.getByRole("button", { name: "Refresh today's summary" }).click();
  await today.getByText("Test fixture meal plan", { exact: true }).waitFor();
  console.log("PASS uncertain water saves cannot repeat without refresh; partial read errors preserve available data and recover");
  await chat.locator("#fitfuel-coach-trigger").click();
  if (
    await chat
      .getByText("Live chat is currently unavailable.", { exact: true })
      .count()
  ) {
    console.log(
      "PASS configured-off coach state; authenticated streaming fixture skipped because provider is off",
    );
  } else {
    await chat.getByText("Restored conversation fixture.").waitFor();
    await chat
      .getByRole("textbox", { name: "Ask the coach" })
      .fill("Test connection");
    await chat.getByRole("button", { name: "Send" }).click();
    await chat.getByText("Connected test response.").waitFor();
    assert.ok(submitted);
    await chat.screenshot({
      path: ".artifacts/homepage/coach-signed-in-fixture.png",
    });
    console.log(
      "PASS authenticated history and streaming UI with intercepted test responses",
    );
  }
  await signed.close();
  assert.deepEqual(errors, []);
  console.log("PASS no browser exceptions");
} finally {
  await browser.close();
}
