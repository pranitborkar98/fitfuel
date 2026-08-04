// app/privacy/page.tsx
//
// Set as a document, on the shared clause list.
//
// The grievance officer block was a radius-14 card inside clause 10. It is a
// Note now, with the lime edge, because it is the one thing on this page a
// reader may have arrived specifically to find.

import { Clause, Clauses, Masthead, Note, Prose, Shell, Wrap, A } from "@/app/_ui/Page";

export const metadata = {
  alternates: { canonical: "/privacy" },
  title: "Privacy Policy",
  description:
    "What FitFuel collects, why, how we protect it, and your rights under the Digital Personal Data Protection Act, 2023.",
};

export default function PrivacyPage() {
  return (
    <Shell>
      <Masthead
        label="Legal"
        title="Privacy policy"
        deck="FitFuel personalises nutrition, so some of what we hold is health data. This says exactly what, why, and what you can make us do about it."
        meta={[
          { k: "Last updated", v: "5 June 2026" },
          { k: "Governing act", v: "DPDP 2023" },
          { k: "Data sold", v: "None" },
        ]}
      />

      <Wrap>
        <Clauses>
          <Clause no="01" title="Introduction">
            <p>
              FitFuel, operated by [Registered Entity Name] in Pune, Maharashtra, India, respects
              your privacy. This policy explains what information we collect, why we collect it, how
              we use and protect it, and the rights you have. It applies to our website, app and all
              related Services. Because FitFuel personalises nutrition and fitness, some of the
              information we handle is sensitive, and we treat it with particular care.
            </p>
          </Clause>

          <Clause no="02" title="Information we collect">
            <p>We collect the following categories of information:</p>
            <ul>
              <li>
                <strong>Account and contact details:</strong> name, email, phone number and delivery
                address.
              </li>
              <li>
                <strong>Health and body information:</strong> weight, height, age, gender, body
                metrics, goals, activity level, dietary preferences, allergies and health conditions
                you choose to share. This is sensitive personal data.
              </li>
              <li>
                <strong>Order and subscription data:</strong> the plans you choose, meals logged,
                ratings, swaps and delivery preferences.
              </li>
              <li>
                <strong>Payment information:</strong> processed by our payment partner PayU. We do
                not store your full card or banking details on our servers.
              </li>
              <li>
                <strong>Usage and device data:</strong> how you interact with the Services, along
                with standard log and device information.
              </li>
            </ul>
          </Clause>

          <Clause no="03" title="How we use your information">
            <p>We use your information to:</p>
            <ul>
              <li>Calculate your nutrition targets and match you to the right meal plan.</li>
              <li>Prepare and deliver your meals and run your subscription.</li>
              <li>Power your tracking, progress and, in future, coaching features.</li>
              <li>Process payments, prevent fraud and provide customer support.</li>
              <li>Communicate service updates, and, with your consent, send relevant offers.</li>
              <li>Improve and secure the Services and meet our legal obligations.</li>
            </ul>
          </Clause>

          <Clause no="04" title="Health data and your consent">
            <p>
              The body, health and dietary information you provide is collected only to personalise
              your plans and is processed on the basis of your consent. You may withdraw your consent
              at any time by contacting us, though doing so may limit our ability to personalise the
              Services. We do not use your health data for advertising and we do not sell it.
            </p>
          </Clause>

          <Clause no="05" title="How we share information">
            <p>We share information only as needed to run the Services:</p>
            <ul>
              <li>
                <strong>Service providers:</strong> payment processing (PayU), hosting,
                infrastructure and delivery support, bound to handle data securely and only on our
                instructions.
              </li>
              <li>
                <strong>Delivery personnel:</strong> the minimum needed to deliver your order (name,
                address, contact, items).
              </li>
              <li>
                <strong>Legal:</strong> where required by law, regulation or valid legal process.
              </li>
            </ul>
            <p>
              We do <strong>not</strong> sell your personal information to third parties.
            </p>
          </Clause>

          <Clause no="06" title="Cookies and analytics">
            <p>
              We use cookies and similar technologies to keep you signed in, remember preferences and
              understand how the Services are used so we can improve them. You can control cookies
              through your browser settings; disabling some cookies may affect functionality.
            </p>
          </Clause>

          <Clause no="07" title="Data security">
            <p>
              We use reasonable technical and organisational measures to protect your information
              against unauthorised access, loss or misuse. No system is completely secure, so while
              we work hard to protect your data, we cannot guarantee absolute security. Please keep
              your account credentials confidential.
            </p>
          </Clause>

          <Clause no="08" title="Data retention">
            <p>
              We retain your information for as long as your account is active and as needed to
              provide the Services, comply with legal obligations, resolve disputes and enforce our
              agreements. When information is no longer required, we delete or anonymise it.
            </p>
          </Clause>

          <Clause no="09" title="Your rights">
            <p>
              Subject to applicable Indian data protection law, including the Digital Personal Data
              Protection Act, 2023, you have the right to:
            </p>
            <ul>
              <li>
                Access the personal data we hold about you and request a summary of how it is
                processed.
              </li>
              <li>Request correction or updating of inaccurate or incomplete data.</li>
              <li>Request erasure of your data, subject to legal retention requirements.</li>
              <li>Withdraw consent for processing where processing is based on consent.</li>
              <li>
                Nominate another individual to exercise your rights in the event of death or
                incapacity.
              </li>
              <li>
                Raise a grievance with our Grievance Officer and, if unresolved, with the Data
                Protection Board of India.
              </li>
            </ul>
            <p>To exercise any of these rights, contact us using the details below.</p>
          </Clause>

          <Clause no="10" title="Grievance officer">
            <p>
              In line with applicable Indian law, you can contact our Grievance Officer for any
              concern about your data.
            </p>
            <Note style={{ margin: "18px 0 14px", maxWidth: 660 }}>
              <p>
                <strong>Grievance Officer:</strong> [Grievance Officer Name]
                <br />
                FitFuel &middot; [Registered Entity Name]
                <br />
                [Full Registered Address, Pune, Maharashtra, PIN]
                <br />
                Email: <A href="mailto:contact@fitfuel.in">contact@fitfuel.in</A>
              </p>
            </Note>
            <p>We will acknowledge and address grievances within the timelines required by law.</p>
          </Clause>

          <Clause no="11" title="Children's privacy">
            <p>
              The Services are intended for users aged 18 and above. We do not knowingly collect
              personal data of children except where a parent or guardian provides it on their behalf
              and provides verifiable consent as required by law. If you believe a child has provided
              us data without proper consent, contact us so we can address it.
            </p>
          </Clause>

          <Clause no="12" title="Changes to this policy">
            <p>
              We may update this Privacy Policy from time to time. The latest version will always be
              available here with an updated &ldquo;Last updated&rdquo; date. Where changes are
              significant, we will make reasonable efforts to notify you.
            </p>
          </Clause>

          <Clause no="13" title="Contact us">
            <p>
              For any privacy question, email us at{" "}
              <A href="mailto:contact@fitfuel.in">contact@fitfuel.in</A>. See also our{" "}
              <A href="/terms">Terms and Conditions</A>.
            </p>
          </Clause>
        </Clauses>

        <Prose style={{ padding: "clamp(40px,6vw,72px) 0" }}>
          <p>
            Also part of our terms: the{" "}
            <A href="/refund-policy">Refund and Cancellation Policy</A>, the{" "}
            <A href="/medical-disclaimer">Medical Disclaimer</A> and the{" "}
            <A href="/allergen-policy">Allergen Policy</A>.
          </p>
        </Prose>
      </Wrap>
    </Shell>
  );
}
