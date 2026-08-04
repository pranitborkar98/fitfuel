// app/refund-policy/page.tsx
//
// Set as a document, on the shared clause list.
//
// The en dash in "5–7 business days" is now "5 to 7": the copy rule bans the
// dash forms, and a range written in words cannot be misread as a minus sign
// by a screen reader.

import { Clause, Clauses, Masthead, Prose, Shell, Wrap, A } from "@/app/_ui/Page";
import { waLink, WHATSAPP_DISPLAY } from "@/lib/site";

export const metadata = {
  alternates: { canonical: "/refund-policy" },
  title: "Refund & Cancellation Policy",
  description:
    "How cancellations, pauses and refunds work across FitFuel meal subscriptions, trial days, digital plans and supplements.",
};

export default function RefundPolicyPage() {
  return (
    <Shell>
      <Masthead
        label="Legal"
        title="Refund and cancellation policy"
        deck="Every meal is cooked to order, so almost everything here turns on one thing: the daily kitchen cut-off."
        meta={[
          { k: "Last updated", v: "24 June 2026" },
          { k: "Refund window", v: "5 to 7 days" },
        ]}
      />

      <Wrap>
        <Clauses>
          <Clause no="01" title="Overview">
            <p>
              This Refund and Cancellation Policy explains how cancellations, pauses and refunds work
              across FitFuel&rsquo;s meal subscriptions, trial days, digital meal plans and
              supplement recommendations. It forms part of our{" "}
              <A href="/terms">Terms and Conditions</A>. FitFuel is operated by [Registered Entity
              Name], Pune, Maharashtra, India.
            </p>
          </Clause>

          <Clause no="02" title="Cancelling or pausing a subscription">
            <p>
              Because every meal is freshly cooked to order, cancellations and pauses are tied to a
              daily kitchen <strong>cut-off time</strong>, communicated in the app.
            </p>
            <ul>
              <li>
                You may pause, skip or cancel <strong>upcoming</strong> deliveries before the cut-off
                for that day at no charge.
              </li>
              <li>
                Changes made <strong>after</strong> the cut-off apply from the next available
                delivery day, as that day&rsquo;s food is already in preparation.
              </li>
              <li>
                Pausing does not extend the subscription beyond its purchased duration unless we
                confirm otherwise.
              </li>
            </ul>
          </Clause>

          <Clause no="03" title="Refunds for meal subscriptions">
            <p>
              If you cancel an active subscription, we refund the value of{" "}
              <strong>undelivered, un-prepared</strong> meals only.
            </p>
            <ul>
              <li>Meals already delivered or already in preparation for the day are non-refundable.</li>
              <li>
                The refundable amount is calculated on the per-day value of your plan for the
                remaining, un-started delivery days.
              </li>
              <li>Any discount or coupon applied is accounted for proportionally in the refund.</li>
            </ul>
          </Clause>

          <Clause no="04" title="Trial day">
            <p>
              The Trial Day is a single, discounted day created so you can experience FitFuel before
              committing. Once a Trial Day has been prepared or delivered, it is{" "}
              <strong>non-refundable</strong>. If a Trial Day order is cancelled before the kitchen
              cut-off, it is refunded in full.
            </p>
          </Clause>

          <Clause no="05" title="Quality, wrong or damaged deliveries">
            <p>
              Your satisfaction with the food matters to us. If a delivery is missing, incorrect,
              spoiled or damaged on arrival, please report it <strong>the same day</strong> via
              WhatsApp or email with your order number and a photo where possible. Verified issues are
              resolved with a replacement on the next delivery or a refund or credit for that meal,
              at your preference.
            </p>
          </Clause>

          <Clause no="06" title="Cash on delivery">
            <p>
              For COD orders, you pay at the door. If you cancel a COD order before the cut-off, no
              payment is due. Refunds only apply where a prepaid amount or credit was involved.
            </p>
          </Clause>

          <Clause no="07" title="Digital meal plans">
            <p>
              Digital meal plans (downloadable PDFs) are delivered instantly. Because access is
              granted immediately on purchase, digital plans are{" "}
              <strong>non-refundable once accessed or downloaded</strong>, except where the file is
              faulty and we are unable to provide a working copy.
            </p>
          </Clause>

          <Clause no="08" title="Supplements">
            <p>
              Supplement recommendations on FitFuel link to third-party retailers who fulfil, ship
              and support those orders. Returns, refunds and cancellations for supplements are
              governed by <strong>the retailer&rsquo;s own policy</strong>, not FitFuel&rsquo;s. We
              are not the seller of record for supplement purchases.
            </p>
          </Clause>

          <Clause no="09" title="How refunds are issued">
            <p>
              Approved refunds are issued to your original payment method via our payment partner,{" "}
              <strong>PayU</strong>, typically within <strong>5 to 7 business days</strong>, subject
              to your bank&rsquo;s processing times. Where faster, we may offer FitFuel account
              credit instead, with your consent.
            </p>
          </Clause>

          <Clause no="10" title="How to request a cancellation or refund">
            <p>Contact us with your order number:</p>
            <ul>
              <li>
                Email: <A href="mailto:contact@fitfuel.in">contact@fitfuel.in</A>
              </li>
              <li>
                WhatsApp or phone: <A href={waLink()}>{WHATSAPP_DISPLAY}</A>
              </li>
            </ul>
            <p>We aim to acknowledge every request within one business day.</p>
          </Clause>
        </Clauses>

        <Prose style={{ padding: "clamp(40px,6vw,72px) 0" }}>
          <p>
            See also our <A href="/terms">Terms and Conditions</A> and the{" "}
            <A href="/privacy">Privacy Policy</A>.
          </p>
        </Prose>
      </Wrap>
    </Shell>
  );
}
