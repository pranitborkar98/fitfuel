# FitFuel product redesign checkpoint

Updated 2026-09-16. This records the implementation and remaining work. `AGENTS.md`
holds the owner's design decisions and takes precedence over this checkpoint.

## Customer journey

The front door serves the next meal decision: browse food, choose a plan, or
return to the daily app. FitFuel's advantages belong inside those actions.
Personal portions belong with meal configuration. Coaching belongs with the
customer's diary and progress. Ingredient guidance belongs beside supplements.
Kitchen coverage belongs behind the address check. Each advantage should help a
decision before it becomes another section on the homepage.

The shared customer destinations are Meals, Plans, Supplements, Coach and Today.
Supplement shopping goes to `/products`. `/supplements` is the ingredient guide.
Corporate meals and gym/trainer partnerships remain secondary entry points.

## Implemented in this pass

- Homepage: food preview, catalogue, compact links to the wider product, footer.
  The ten long `HomeSections` bands no longer render, and their unused price
  matrix and count queries have been removed from the homepage request.
- Supplement marketplace: 738 imported Nutrabay products, search, categories,
  sorting, ingredient-guide filtering, progressive loading and retailer links.
  The import completed with 31 products linked to ingredient guidance. Search,
  category, guidance, sort and loaded-card count are stored in the URL so a guide
  visit or reload does not discard the customer's shopping context.
- Retailer integration: stable links, validated Nutrabay destinations, affiliate
  attribution, database click records, and a snapshot fallback for an unavailable
  or not-yet-imported database. A deliberately disabled catalogue stays disabled
  when the database is reachable.
- Import: small, resumable batches with a final count check. Existing disabled
  products stay disabled. Prices are imported values, not a live inventory feed.
- Navigation: marketplace entry in the customer tabs, desktop rails and global
  navigation. Products uses the same ordering shell as meal detail pages.
  Its desktop rail measures the actual header height instead of using the
  homepage's taller header as a fixed offset.
- Mobile marketplace: a compact shopping header, readable counts, search and
  filters before the product grid. Price uncertainty and commission are disclosed
  before the grid. Empty search results offer a clear-filters action.
- Slow database: the marketplace read has a four-second deadline and a loading
  screen with navigation. Snapshot fallback explicitly marks ingredient links as
  unavailable instead of showing a misleading zero. Retailer redirects have a
  separate bounded lookup, with a validated snapshot destination as fallback.
- Shared copy: address-based kitchen language; sample menus labelled as samples;
  ingredient guidance distinguished from certification of a branded product.

## Design decisions to carry forward

Black `#070707` and lime `#84cc16` remain current. Use the `--fk-*` tokens, ordinary
sentence case and readable labels. Existing intentional photo placeholders are
not a reason to restart the art direction. Do not restore the old terminal-like
type treatment or the rejected warm-paper palette from historical comments.

## Remaining release checks and wider redesign

The whole project is not considered redesigned merely because the homepage is
shorter. Review the remaining journeys against the same customer destinations:

| Journey | Next acceptance check |
| --- | --- |
| Meal and plan configuration | Selected diet, portions, delivery availability and total remain clear through checkout. |
| Ingredient guide | Deep links reach the relevant entry. Bring the guide's older page hierarchy and navigation into the shared shopping experience. |
| Today, diary and Coach | Returning customers can identify the next useful action without another marketing introduction. |
| Digital plans | The purchase clearly distinguishes a downloadable plan from delivered food. |
| Corporate and partner pages | Their audience-specific actions stay separate from the meal-ordering flow. |

Before release, complete mobile and desktop browser checks, including navigation,
search, empty results, loading more products, guide links, cart access and the
retailer redirect. Verify the production build and record any blockers. Keep the
existing operational and checkout contract tests passing. Deploy only through
the project's normal authorized release process.

## Verification recorded in this pass

- 21 contract tests pass, including catalogue integrity, safe destinations,
  bounded reads, navigation, filter URL round-tripping and checkout invariants.
- The final production build passes, including TypeScript and all 127 generated
  pages. Focused lint checks pass for the changed marketplace, navigation and
  filter-state code.
- Browser: search for creatine returned 34 matches; the Creatine category returned
  31 products; combining it with guidance returned three. Price-low sorting was
  ascending across all 36 rendered cards. Load more expanded the list to 72.
- Empty results recovered to 36 cards through Clear filters, using both keyboard
  and pointer activation. The shared cart opened with the existing item unchanged
  and restored focus to its trigger on close. No order was placed.
- Retailer handoff: the oats product opened on Nutrabay with the matching product
  ID and `ref=pranit1944` intact. This verifies the outbound link, not a purchase,
  affiliate payout or live stock feed.
- A creatine guide link opened `/supplements#creatine`. The first browser Back
  check exposed lost filters; that defect prompted the URL-state implementation
  and its regression tests. The final production browser check retained
  `q=creatine&guidance=1`, the search value and three matching products after both
  the guide round trip and a reload.
- At 375px phone width, the compact marketplace shows search, sorting, filters
  and the beginning of product imagery in the first viewport. The homepage shows
  the meal preview and its Explore today's food action opens the food catalogue.
  Desktop reviews checked the compact marketplace and measured navigation rail.
- The existing black-and-lime palette passed its 21 contrast-pair checks. The
  mobile and desktop layout reviews retain that palette and the established
  photo placeholders.

The section above records the first marketplace pass. The follow-through below
supersedes its dashboard, partner and ingredient-guide work items.

## Product-readiness follow-through, 2026-09-15

- Today now has a real diary summary for members without an active subscription:
  calories, protein, water, entry count and latest recorded weight are read from
  their own account. No invented zero-state target is presented as personal advice.
  Food logging, training, measurements and coaching remain reachable without buying meals.
- Active-plan Today retains meal logging, delivery management, nutrition balance,
  workouts, consistency, weekly reviews and orders. Failed reads have a retry
  action; failed saves are reported. Skipped meals cannot be logged. Missing
  nutrition data is not displayed as zero consumption. Existing plan records,
  including expired or future ones, no longer trigger a false activation warning.
- `/dashboard-preview` reuses the actual dashboard UI with isolated sample data.
  Meal/workout interactions are local only. It includes with-plan and no-plan
  states, reset, and a clear sign-in handoff. It does not bypass authentication.
- `/services` connects nine product capabilities to their existing pages, with
  availability explained beside each action. Homepage, navigation and footer
  expose the dashboard preview and service hub.
- A shared partner section appears on the homepage, services, corporate and
  partner pages. Nutrabay is labelled an affiliate retailer. XYZ Gym, XYZ Company
  and XYZ Trainer are explicitly labelled placeholders, never signed partners.
- Corporate now explains workplace meals, employee codes, digital alternatives,
  application review, manual commercial terms and employee data boundaries.
  Its main action uses the existing corporate application and preserves the
  selected programme through sign-in. No form submission or payment was made.
- The public ingredient guide now uses the same shopping header, cart and
  navigation as the marketplace, with an ingredient-specific heading and a
  direct route back to shopping. The 375px check exposed an intrinsic-width
  overflow in ingredient cards; zero-minimum grid tracks and wrapping correct it.
  Evidence content remains unchanged and needs its own clinical-content review
  before any claim of medical readiness.
- Dashboard loading/error boundaries are present. Dialog focus is no longer
  reinitialised on every parent render, and meal ratings support arrow-key selection.

### Verification and launch boundaries

24 contract tests pass. The product build passes with 129 generated pages.
Browser checks have verified sample meal logging, workout completion, reset,
dialog/menu focus restoration, no account writes from preview, mobile layout,
corporate sign-in handoff and the real dashboard's authentication guard.
`scripts/verify-product-ui.mjs` makes these public checks repeatable using an
installed Playwright package and Edge. Screenshots are local build artifacts,
not repository assets. Final check results are recorded in the delivery message.

This is not a certification of operational launch readiness. Remaining live
acceptance gates require an authorised test account and payment environment:
sign-in with the deployed callback URL; account persistence across devices;
meal/digital checkout success and failure; payment webhooks and plan activation;
delivery skip, fulfilment and confirmation; partner approval and payout records;
notification delivery; and production migration/configuration verification.
No customer record, live payment, payout or partner approval was created for
these UI checks. Placeholder organisations must be replaced only with verified
names and permission to publish them. Repository push is not a production deployment.

## Homepage restoration, 2026-09-16

The owner rejected the reduced homepage after commit 421c4b0. Removing the
HomeSections mount removed product capabilities from the front door, even though
their implementation files and destination pages survived. Passing build and
layout checks did not establish feature completeness. The reduced-homepage
direction above is superseded by this correction.

- Keep the kitchen-to-diary explanation, connected nutrition, digital plans,
  body measurements, training, supplement guidance and Nutrabay shopping,
  interactive plan calculator, goals and conditions, coach and weekly review,
  trial breakdown, delivery questions, corporate programmes and partner roster.
- Keep meals purchasable from the homepage, daily account tools accessible near
  the top, and a section index for the full product. A services page is not a
  substitute for these homepage capabilities.
- Keep a visible floating AI coach. The panel uses the existing authenticated
  trainer API and account-scoped conversation history, not simulated answers.
  Guests see the sign-in handoff. Unconfigured providers show an offline state.
  The full coach and weekly review remain directly accessible.
- Do not restore obsolete claims along with a component. Body composition is
  estimated rather than directly read from all scales; condition menus do not
  replace treatment; delivery times depend on the selected kitchen and address.
- The feature inventory is `app/_web/home-capabilities.ts`. Contract tests check
  that it is mounted. `scripts/verify-homepage-restoration.mjs` checks all 11
  destinations in the rendered page, calculator changes, FAQ interaction,
  coach focus and sign-in behaviour, private-history authentication, mobile and
  landscape sizing. Signed-in coach UI tests intercept session/history/chat
  responses and do not call a paid model or write a customer's account.

These checks supplement, rather than replace, the live launch gates above.

### Product home, not a rollback

Restoration alone was explicitly rejected by the owner in the same review.
The homepage must connect the backend to everyday actions, not merely remount
the previous marketing composition. `HomeExperience` now composes a compact
app heading, six daily tools, the food preview and `HomeToday` rather than a
large sales headline. Detailed product sections remain accessible and intact.

`HomeToday` reads the existing authenticated diary, water, active-plan and
workout-today APIs. It shows logged totals, the current plan and today's
scheduled session without inventing a nutrition target. Adding 250 ml uses
the existing water diary endpoint and updates the displayed saved amount.
A failed or uncertain save is announced and cannot be repeated until the
customer refreshes the actual record. Partial read failures are visible and
retryable. Account changes unmount private summary state. Guests see neither
invented account totals nor an imitation of a signed-in dashboard.

The six homepage tools map to Today, Food & water, Workouts, Measurements,
Progress and the existing AI coach. Ordering remains in the same homepage
catalogue. The feature index, richer product examples, pricing, condition
menus, digital plans, Nutrabay, corporate and partner sections are retained.

## Dashboard visibility and FitFuel meals, 2026-09-23

The app shell did not delete the dashboard backend, but it did make most of the
product difficult to discover on phones by moving it behind All tools. The
dashboard must visibly expose food and water, training, body measurements, AI
coach, weekly review, progress, supplement guidance, referrals, notifications
and profile/address management for members with and without a meal subscription.
The persistent navigation remains the routing source of truth; the dashboard
directory is the mobile discovery surface. Contract and browser tests verify
that every non-partner dashboard route remains implemented and visible.

The diary food picker must combine two different product datasets. FitFuel
recipes are cooked meals and appear first with the FitFuel label, real serving
size and recipe nutrition. FoodItem rows remain available for ingredients,
outside food and customer-created entries. This is not subscription-gated.
When a member explicitly logs a recipe, the server resolves it to the FoodItem
record required by the existing diary model; merely viewing or searching does
not write data. A subscribed member's one-tap plan confirmation continues to
use the active-plan meal log so delivery, ratings and consistency stay linked.
