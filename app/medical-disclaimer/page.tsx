// app/medical-disclaimer/page.tsx
//
// Set as a document, on the shared clause list.
//
// The rose warning box keeps a warning colour, because "this is not medical
// advice" is the case where colour genuinely carries meaning. It is a square
// note with a red edge rather than a radius-14 rgba tint, the red is #f87171
// (which clears AA) rather than #fb7185 at 40% opacity on a border, and the
// word "Important" leads the copy so the meaning never rests on the colour.

import { Clause, Clauses, Masthead, Note, Prose, Shell, Wrap, A } from "@/app/_ui/Page";

export const metadata = {
  alternates: { canonical: "/medical-disclaimer" },
  title: "Medical Disclaimer",
  description:
    "FitFuel provides food and general nutrition guidance, not medical advice. Important information before starting any plan.",
};

export default function MedicalDisclaimerPage() {
  return (
    <Shell>
      <Masthead
        label="Legal"
        title="Medical disclaimer"
        deck="What FitFuel is, what it is not, and when to talk to a doctor first."
        meta={[
          { k: "Last updated", v: "5 June 2026" },
          { k: "Clauses", v: "10" },
        ]}
      />

      <Wrap>
        <Note tone="warn" style={{ marginBottom: "clamp(34px,5vw,56px)" }}>
          <Prose>
            <p>
              <strong>Important.</strong> FitFuel provides food and general nutrition and fitness
              guidance. It is not medical advice, diagnosis or treatment, and it is not a substitute
              for care from a qualified healthcare professional. Always consult your doctor before
              making changes to your diet or exercise, especially if you have a health condition,
              are pregnant or nursing, or take medication.
            </p>
          </Prose>
        </Note>

        <Clauses>
          <Clause no="01" title="Not medical advice">
            <p>
              The meal plans, nutritional information, calorie and macro targets, workout guidance
              and any educational content provided by FitFuel are for general informational purposes
              only. They are not intended to diagnose, treat, cure or prevent any disease or health
              condition, and they should not be relied upon as a substitute for advice from your
              physician, dietitian or other qualified healthcare provider.
            </p>
          </Clause>

          <Clause no="02" title="Consult your healthcare provider">
            <p>
              Before starting any FitFuel plan, you should consult a qualified medical professional,
              particularly if you:
            </p>
            <ul>
              <li>
                Have a chronic or acute health condition (for example diabetes, PCOS, thyroid,
                cardiac, kidney or liver conditions).
              </li>
              <li>Are pregnant, planning a pregnancy, or nursing.</li>
              <li>Take prescription medication or have allergies or intolerances.</li>
              <li>Are recovering from surgery, illness or an eating disorder.</li>
              <li>Have any concern about whether a plan is appropriate for you.</li>
            </ul>
          </Clause>

          <Clause no="03" title="Condition-specific and therapeutic plans">
            <p>
              Some FitFuel plans are designed with specific health goals in mind (such as
              diabetic-friendly, PCOS-supportive or heart-health plans). These plans offer{" "}
              <strong>nutritional support</strong> aligned with general dietary principles for those
              goals. They are <strong>not</strong> medical treatment, do not replace your prescribed
              care, and must not be used to self-manage a medical condition in place of professional
              supervision. Continue to follow your doctor&rsquo;s guidance and medication.
            </p>
          </Clause>

          <Clause no="04" title="No doctor-patient relationship">
            <p>
              Using FitFuel, including any current or future AI guidance or coaching features, does
              not create a doctor-patient, dietitian-client or other professional clinical
              relationship between you and FitFuel. Any AI feature surfaces general guidance and
              your own data; it does not diagnose, prescribe or replace professional medical
              judgment, and medical questions should be directed to a qualified professional.
            </p>
          </Clause>

          <Clause no="05" title="Allergies and intolerances">
            <p>
              FitFuel meals are prepared in a shared kitchen and may contain or come into contact
              with common allergens. Please read our <A href="/allergen-policy">Allergen Policy</A>{" "}
              carefully and declare any allergies in your profile. If you have a severe allergy,
              consult your doctor before ordering.
            </p>
          </Clause>

          <Clause no="06" title="Individual results vary">
            <p>
              Health, weight and fitness outcomes depend on many factors including genetics, medical
              conditions, consistency, sleep, stress and adherence. FitFuel does not guarantee any
              specific result. Any testimonials or examples reflect individual experiences and are
              not promises of similar outcomes.
            </p>
          </Clause>

          <Clause no="07" title="Pregnancy, nursing and children">
            <p>
              Nutritional needs during pregnancy, while nursing, and for children and teenagers are
              specialised. Do not begin a plan in these situations without guidance from a qualified
              healthcare professional.
            </p>
          </Clause>

          <Clause no="08" title="In an emergency">
            <p>
              FitFuel is not an emergency service. If you experience a medical emergency or symptoms
              that concern you, stop and seek immediate help from a doctor or your local emergency
              services. Do not rely on FitFuel for urgent or emergency medical needs.
            </p>
          </Clause>

          <Clause no="09" title="Our nutrition team">
            <p>
              FitFuel&rsquo;s plans are designed with nutrition principles in mind. A qualified
              nutritionist has not yet been appointed; their name and credentials will be published
              on <A href="/our-team">Our Team</A>, and that appointment is a requirement before any
              condition-specific plan goes live. For personalised medical or clinical nutrition
              advice, please consult your own qualified professional.
            </p>
          </Clause>

          <Clause no="10" title="Contact us">
            <p>
              Questions about this disclaimer? Email{" "}
              <A href="mailto:contact@fitfuel.in">contact@fitfuel.in</A>. See also our{" "}
              <A href="/terms">Terms and Conditions</A> and{" "}
              <A href="/allergen-policy">Allergen Policy</A>.
            </p>
          </Clause>
        </Clauses>

        <Prose style={{ padding: "clamp(40px,6vw,72px) 0" }}>
          <p>
            FSSAI Licence 21523035002815. FitFuel, Kharadi, Pune, Maharashtra.
          </p>
        </Prose>
      </Wrap>
    </Shell>
  );
}
