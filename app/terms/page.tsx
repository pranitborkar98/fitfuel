// app/terms/page.tsx
//
// Terms, set as a document rather than as a landing page that happens to
// contain law.
//
// The clause number moves into a left gutter in mono, the title is condensed
// display, and the copy runs in one 66ch column with a hairline under each
// clause. That is the spec-table logic applied to prose: a numbered clause IS
// a row, and a reader looking for clause 13A should be able to run their eye
// down a column of numbers to find it.
//
// The em-dash bullet that stood in for a list marker is gone; the list marker
// is a 1px lime rule, which is the house device.

import { Clause, Clauses, Masthead, Prose, Shell, Wrap, A } from "@/app/_ui/Page";

export const metadata = {
  alternates: { canonical: "/terms" },
  title: "Terms & Conditions",
  description:
    "The terms governing your use of FitFuel's meal plans, delivery, digital plans and health tracking tools.",
};

export default function TermsPage() {
  return (
    <Shell>
      <Masthead
        label="Legal"
        title="Terms and conditions"
        deck="These govern your account, your subscription, our delivery and the health tools in the app. Clause 9 and clause 13A are the two most people need."
        meta={[
          { k: "Last updated", v: "5 June 2026" },
          { k: "Clauses", v: "19" },
          { k: "Governing law", v: "India" },
        ]}
      />

      <Wrap>
        <Clauses>
          <Clause no="01" title="Acceptance of these terms">
            <p>
              These Terms and Conditions govern your access to and use of FitFuel, including our
              website, meal subscription plans, daily delivery, digital meal plans, supplement
              guidance and health tracking tools (together, the <strong>Services</strong>). FitFuel
              is operated by [Registered Entity Name], based in Pune, Maharashtra, India (
              <strong>FitFuel</strong>, <strong>we</strong>, <strong>us</strong>). By creating an
              account, placing an order or using any part of the Services, you agree to these Terms.
              If you do not agree, please do not use the Services.
            </p>
          </Clause>

          <Clause no="02" title="Eligibility">
            <p>
              You must be at least 18 years old and capable of forming a legally binding contract
              under Indian law to use the Services. If you are using the Services on behalf of a
              minor (for example, a parent ordering for a child), you accept these Terms on their
              behalf and are responsible for their use.
            </p>
          </Clause>

          <Clause no="03" title="Our services">
            <p>
              FitFuel provides personalised, freshly prepared meal plans delivered within our
              serviceable areas, alongside tools for nutrition tracking, body metrics, workout
              guidance and progress monitoring. Some features are tied to specific subscription
              tiers. We may add, change, suspend or remove features at any time. Meal availability,
              delivery areas and plan options may vary and are not guaranteed.
            </p>
          </Clause>

          <Clause no="04" title="Your account and information">
            <p>
              You are responsible for keeping your account credentials secure and for all activity
              under your account. The personalisation we provide depends on the accuracy of the
              information you give us, including your body details, goals, health conditions and
              allergies. You agree to provide accurate, current and complete information and to keep
              it updated. We are not responsible for outcomes resulting from inaccurate or
              incomplete information you provide.
            </p>
          </Clause>

          <Clause no="05" title="Subscriptions and orders">
            <p>
              Meal plans are offered as trial, weekly, fortnightly, monthly and multi-month
              subscriptions. When you subscribe:
            </p>
            <ul>
              <li>Your subscription covers the duration and meal selection you choose at checkout.</li>
              <li>
                You may pause, skip or modify upcoming deliveries subject to our cut-off times,
                which we will communicate in the app.
              </li>
              <li>
                Deliveries are bundled into a single drop per day in your chosen Morning or Evening
                window.
              </li>
              <li>
                Subscriptions do not auto-renew unless this is clearly stated at the point of
                purchase; where auto-renewal applies, you may cancel before the next cycle.
              </li>
            </ul>
          </Clause>

          <Clause no="06" title="Pricing, payments and taxes">
            <p>
              Prices are listed in Indian Rupees and are inclusive or exclusive of applicable taxes
              as indicated at checkout. We accept payments through our payment partner, PayU, and
              Cash on Delivery where available. By paying online you agree to PayU&rsquo;s terms in
              addition to these Terms. We may revise prices from time to time; changes will not
              affect a subscription already paid for, but will apply to renewals and new orders.
            </p>
          </Clause>

          <Clause no="07" title="Delivery">
            <p>
              We currently deliver within selected areas of Pune. Delivery windows are estimates and
              may be affected by weather, traffic, address accuracy and circumstances beyond our
              control. Please ensure someone is available to receive the delivery and that the
              address and contact details on your account are correct. Confirmation of delivery may
              be recorded by our delivery personnel.
            </p>
          </Clause>

          <Clause no="08" title="Cancellation and refunds">
            <p>
              Cancellations and refunds are governed by our{" "}
              <A href="/refund-policy">Refund and Cancellation Policy</A>, which forms part of these
              Terms. Please read it before subscribing.
            </p>
          </Clause>

          <Clause no="09" title="Health, nutrition and medical disclaimer">
            <p>
              FitFuel provides food and general nutrition and fitness guidance. It is{" "}
              <strong>not</strong> medical advice and is not a substitute for professional
              healthcare. This applies especially to condition-specific plans (such as diabetic,
              PCOS, thyroid, heart-health or recovery plans). Please read our{" "}
              <A href="/medical-disclaimer">Medical Disclaimer</A> and{" "}
              <A href="/allergen-policy">Allergen Policy</A>, which form part of these Terms. Consult
              a qualified medical professional before starting any plan, particularly if you have a
              health condition, are pregnant or nursing, or are on medication.
            </p>
          </Clause>

          <Clause no="10" title="Food safety">
            <p>
              FitFuel operates under FSSAI licence number 21523035002815. We prepare meals fresh and
              follow food-safety practices, but you are responsible for storing, reheating and
              consuming meals within the recommended time and conditions communicated to you.
            </p>
          </Clause>

          <Clause no="11" title="Acceptable use">
            <p>
              You agree not to misuse the Services, including by attempting to disrupt or gain
              unauthorised access to our systems, reselling meals or plans without authorisation,
              scraping or copying our content, or using the Services for any unlawful purpose. We
              may suspend or terminate accounts that violate these Terms.
            </p>
          </Clause>

          <Clause no="12" title="Intellectual property">
            <p>
              All content on the Services, including recipes, meal plans, text, design, logos and
              software, is owned by FitFuel or its licensors and is protected by applicable laws.
              Your subscription gives you a personal, non-transferable right to use the Services and
              content for your own use. You may not reproduce, redistribute or commercially exploit
              any content without our written permission.
            </p>
          </Clause>

          <Clause no="13" title="Third-party services">
            <p>
              The Services rely on third parties such as payment processors and delivery and
              infrastructure providers. We are not responsible for the acts, omissions or terms of
              these third parties, and your use of their services may be governed by their own terms
              and policies.
            </p>
          </Clause>

          {/* The anchor the footer's imagery disclosure points at. It is a real
              clause id on the clause element itself now, rather than an empty
              span with a scroll margin sitting above the heading. */}
          <Clause no="13A" title="Images and illustrations" id="imagery">
            <p>
              We want you to know exactly what you are looking at, so we state this plainly rather
              than in a caption you would never find.
            </p>
            <p>
              <strong>Photographs on this site are illustrative.</strong> Some images are licensed
              stock photography, and some are generated using artificial intelligence. They are used
              to convey the style, freshness and general character of our food and our kitchen. They
              are <strong>not</strong> photographs of the specific portion that will be delivered to
              you, and the meal you receive will differ in plating, garnish, colour and arrangement.
            </p>
            <p>
              <strong>What is never illustrative is the data.</strong> Every dish name, calorie
              figure, macronutrient value, ingredient list, allergen note, plan duration and price
              shown on this site is real, comes from our own kitchen records, and is what we cook and
              weigh to. Where you see a circular macro mark beside a dish, it is drawn directly from
              that dish&rsquo;s own weighed protein, carbohydrate and fat values rather than from any
              image.
            </p>
            <p>
              If any image ever conflicts with the written macros, ingredients or allergen
              information for a dish, <strong>the written information governs</strong>. If you
              believe an image has misled you about an order you received, contact us and we will
              make it right under our refund policy.
            </p>
            <p>
              We are working towards photographing every dish we cook. As real photographs of our own
              meals replace illustrative imagery, this section will be updated to reflect that.
            </p>
          </Clause>

          <Clause no="14" title="Limitation of liability">
            <p>
              To the maximum extent permitted by law, FitFuel is not liable for any indirect,
              incidental or consequential loss arising from your use of the Services. Our total
              liability for any claim relating to the Services is limited to the amount you paid to
              us for the relevant order or subscription in the three months preceding the claim.
              Nothing in these Terms excludes liability that cannot be excluded under Indian law.
            </p>
          </Clause>

          <Clause no="15" title="Indemnity">
            <p>
              You agree to indemnify and hold FitFuel harmless from claims, damages and expenses
              arising from your breach of these Terms, your misuse of the Services, or your provision
              of inaccurate health information.
            </p>
          </Clause>

          <Clause no="16" title="Governing law and jurisdiction">
            <p>
              These Terms are governed by the laws of India. Subject to applicable law, the courts at
              Pune, Maharashtra shall have exclusive jurisdiction over any dispute arising out of or
              relating to these Terms or the Services.
            </p>
          </Clause>

          <Clause no="17" title="Changes to these terms">
            <p>
              We may update these Terms from time to time. We will post the revised version here with
              a new &ldquo;Last updated&rdquo; date, and where changes are significant we will make
              reasonable efforts to notify you. Continued use of the Services after changes take
              effect constitutes acceptance of the updated Terms.
            </p>
          </Clause>

          <Clause no="18" title="Contact us">
            <p>Questions about these Terms? Reach us at:</p>
            <p>
              <strong>FitFuel</strong> &middot; [Registered Entity Name]
              <br />
              [Full Registered Address, Pune, Maharashtra, PIN]
              <br />
              Email: <A href="mailto:contact@fitfuel.in">contact@fitfuel.in</A>
              <br />
              FSSAI Licence: 21523035002815
            </p>
          </Clause>
        </Clauses>

        <Prose style={{ padding: "clamp(40px,6vw,72px) 0" }}>
          <p>
            Also part of these Terms: the{" "}
            <A href="/refund-policy">Refund and Cancellation Policy</A>, the{" "}
            <A href="/medical-disclaimer">Medical Disclaimer</A>, the{" "}
            <A href="/allergen-policy">Allergen Policy</A> and the{" "}
            <A href="/privacy">Privacy Policy</A>.
          </p>
        </Prose>
      </Wrap>
    </Shell>
  );
}
