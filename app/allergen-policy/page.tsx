// app/allergen-policy/page.tsx
//
// Set as a document, on the shared clause list. Same warning treatment as the
// medical disclaimer: a square note with a red edge and "Important" leading
// the copy, rather than a radius-14 rose tint.
//
// The allergen list in clause 2 is a real <table>. It was a bulleted list, but
// it is a set of allergens against where they appear, a reader with a specific
// allergy is scanning for one row, and that is what a spec table is for.

import { Clause, Clauses, Masthead, Note, Prose, Shell, Wrap, A } from "@/app/_ui/Page";
import { Spec } from "@/app/_ui/Kit";

export const metadata = {
  alternates: { canonical: "/allergen-policy" },
  title: "Allergen Policy",
  description:
    "How FitFuel handles allergens, cross-contact in a shared kitchen, and your responsibilities when ordering with allergies.",
};

const ALLERGENS = [
  { a: "Milk and dairy", w: "Paneer, curd, ghee, milk" },
  { a: "Tree nuts and peanuts", w: "Almonds, peanuts, nut-based preparations" },
  { a: "Wheat and gluten", w: "Roti, atta, semolina-based dishes" },
  { a: "Soy", w: "Soy products and preparations" },
  { a: "Eggs", w: "Egg-based plans" },
  { a: "Fish", w: "Non-vegetarian plans" },
  { a: "Sesame and mustard", w: "Seeds and spice blends" },
];

export default function AllergenPolicyPage() {
  return (
    <Shell>
      <Masthead
        label="Legal"
        title="Allergen policy"
        deck="One shared kitchen, seven allergen groups handled in it, and what that means for what you can safely order."
        meta={[
          { k: "Last updated", v: "5 June 2026" },
          { k: "Kitchen", v: "Shared" },
          { k: "Allergen-free lines", v: "None" },
        ]}
      />

      <Wrap>
        <Note tone="warn" style={{ marginBottom: "clamp(34px,5vw,56px)" }}>
          <Prose>
            <p>
              <strong>Important.</strong> FitFuel meals are prepared in a shared kitchen that
              handles common allergens. We cannot guarantee that any meal is completely free of a
              given allergen. If you have a severe or life-threatening allergy, please consult your
              doctor before ordering and order at your own discretion.
            </p>
          </Prose>
        </Note>

        <Clauses>
          <Clause no="01" title="Our kitchen environment">
            <p>
              All FitFuel meals are prepared in a single shared kitchen where many ingredients are
              handled, stored and cooked using shared equipment and surfaces. Even with careful
              handling and cleaning, <strong>cross-contact between ingredients can occur</strong>.
              This means traces of an allergen may be present in a meal even if that allergen is not
              a listed ingredient.
            </p>
          </Clause>

          <Clause no="02" title="Common allergens we handle">
            <p>Our kitchen regularly works with the following, among others:</p>
            <div style={{ margin: "18px 0 14px", maxWidth: 660 }}>
              <Spec
                caption="Allergens handled in the FitFuel kitchen and where they appear"
                head={["Allergen group", "Where it appears"]}
              >
                {ALLERGENS.map((x) => (
                  <tr key={x.a}>
                    <th scope="row">{x.a}</th>
                    <td>{x.w}</td>
                  </tr>
                ))}
              </Spec>
            </div>
            <p>Specific ingredients vary by plan and by daily menu.</p>
          </Clause>

          <Clause no="03" title="No guarantee of allergen-free meals">
            <p>
              Because of the shared environment described above, FitFuel{" "}
              <strong>cannot guarantee</strong> that any meal is free from a specific allergen or
              from cross-contact. We do not operate dedicated allergen-free preparation lines. Please
              take this into account when deciding whether FitFuel is suitable for your needs.
            </p>
          </Clause>

          <Clause no="04" title="Your responsibility">
            <p>
              When you set up your profile, you can declare allergies and intolerances, and we use
              this information to guide plan personalisation where reasonably possible. You remain
              responsible for:
            </p>
            <ul>
              <li>Declaring all relevant allergies and intolerances accurately, and keeping them updated.</li>
              <li>Reviewing the listed ingredients of your meals before eating.</li>
              <li>Deciding, with your doctor where appropriate, whether a meal is safe for you.</li>
            </ul>
            <p>
              We will try to accommodate declared allergies, but accommodation is not a guarantee of
              an allergen-free meal.
            </p>
          </Clause>

          <Clause no="05" title="Severe and life-threatening allergies">
            <p>
              If you have a severe allergy (for example, one that has caused or could cause
              anaphylaxis), we strongly recommend that you consult your doctor before subscribing and
              exercise your own judgment. Given the shared-kitchen environment, FitFuel may not be
              suitable for individuals with severe allergies, and you order at your own risk.
            </p>
          </Clause>

          <Clause no="06" title="Ingredients and labelling">
            <p>
              We aim to provide accurate ingredient and nutrition information for each meal. If you
              are unsure about an ingredient in a specific dish, contact us before consuming it and
              we will do our best to help. Recipes and ingredients may be updated over time, so
              please re-check if your meals change.
            </p>
          </Clause>

          <Clause no="07" title="Changes to this policy">
            <p>
              We may update this Allergen Policy as our kitchen, menu or processes change. The
              current version is always available here with an updated date.
            </p>
          </Clause>

          <Clause no="08" title="Contact us">
            <p>Questions about allergens in your meals?</p>
            <p>
              <strong>FitFuel</strong> &middot; Email:{" "}
              <A href="mailto:contact@fitfuel.in">contact@fitfuel.in</A>
              <br />
              FSSAI Licence: 21523035002815
            </p>
            <p>
              See also our <A href="/medical-disclaimer">Medical Disclaimer</A> and{" "}
              <A href="/terms">Terms and Conditions</A>.
            </p>
          </Clause>
        </Clauses>

        <Prose style={{ padding: "clamp(40px,6vw,72px) 0" }}>
          <p>
            What goes into the food itself is on <A href="/our-ingredients">Our Ingredients</A>, and
            how it is cooked is on <A href="/our-kitchen">Our Kitchen</A>.
          </p>
        </Prose>
      </Wrap>
    </Shell>
  );
}
