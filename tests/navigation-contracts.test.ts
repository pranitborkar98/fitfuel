import assert from "node:assert/strict";
import test from "node:test";

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
      ["Supplements", "/?mode=supps#catalog"],
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
  assert.equal(activeCustomerNav("/dashboard/trainer"), "coach");
  assert.equal(activeCustomerNav("/dashboard/coach"), "coach");
  assert.equal(activeCustomerNav("/dashboard/nutrition"), "today");
  assert.equal(activeCustomerNav("/dashboard"), "today");
});
