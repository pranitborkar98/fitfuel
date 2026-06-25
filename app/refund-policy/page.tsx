import Link from "next/link";
import { type ReactNode } from "react";

export const metadata = {
  title: "Refund & Cancellation Policy | FitFuel",
  description: "How cancellations, pauses and refunds work for FitFuel meal subscriptions, trial days, digital plans and supplements.",
};

const C = {
  bg: "#080808", accent: "#a3e635", text: "#ffffff",
  sub: "#a3a3a3", muted: "#737373", border: "#1f1f1f", card: "#111111",
};
const linkStyle = { color: C.accent, textDecoration: "none" } as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 34 }}>
      <h2 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 20, color: C.text, margin: "0 0 12px", letterSpacing: "-0.01em" }}>{title}</h2>
      {children}
    </section>
  );
}
function P({ children }: { children: ReactNode }) {
  return <p style={{ color: C.sub, fontSize: 15.5, lineHeight: 1.75, margin: "0 0 14px" }}>{children}</p>;
}
function B({ children }: { children: ReactNode }) {
  return <strong style={{ color: C.text, fontWeight: 600 }}>{children}</strong>;
}
function UL({ children }: { children: ReactNode }) {
  return <ul style={{ color: C.sub, fontSize: 15.5, lineHeight: 1.7, margin: "0 0 14px", paddingLeft: 0, listStyle: "none" }}>{children}</ul>;
}
function LI({ children }: { children: ReactNode }) {
  return (
    <li style={{ position: "relative", paddingLeft: 22, marginBottom: 9 }}>
      <span style={{ position: "absolute", left: 0, top: 1, color: C.accent }}>—</span>
      {children}
    </li>
  );
}

export default function RefundPolicyPage() {
  return (
    <main style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "120px 24px 96px" }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 13, color: C.accent, margin: "0 0 14px" }}>Legal</p>
        <h1 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "clamp(34px,6vw,52px)", lineHeight: 1.05, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
          Refund &amp; Cancellation Policy<span style={{ color: C.accent }}>.</span>
        </h1>
        <p style={{ color: C.muted, fontSize: 14, margin: "0 0 40px" }}>Last updated: 24 June 2026</p>
        <div style={{ height: 1, background: C.border, margin: "0 0 40px" }} />

        <Section title="1. Overview">
          <P>This Refund &amp; Cancellation Policy explains how cancellations, pauses and refunds work across FitFuel&apos;s meal subscriptions, trial days, digital meal plans and supplement recommendations. It forms part of our <Link href="/terms" style={linkStyle}>Terms &amp; Conditions</Link>. FitFuel is operated by [Registered Entity Name], Pune, Maharashtra, India.</P>
        </Section>

        <Section title="2. Cancelling or pausing a subscription">
          <P>Because every meal is freshly cooked to order, cancellations and pauses are tied to a daily kitchen <B>cut-off time</B>, communicated in the app.</P>
          <UL>
            <LI>You may pause, skip or cancel <B>upcoming</B> deliveries before the cut-off for that day at no charge.</LI>
            <LI>Changes made <B>after</B> the cut-off apply from the next available delivery day, as that day&apos;s food is already in preparation.</LI>
            <LI>Pausing does not extend the subscription beyond its purchased duration unless we confirm otherwise.</LI>
          </UL>
        </Section>

        <Section title="3. Refunds for meal subscriptions">
          <P>If you cancel an active subscription, we refund the value of <B>undelivered, un-prepared</B> meals only.</P>
          <UL>
            <LI>Meals already delivered or already in preparation for the day are non-refundable.</LI>
            <LI>The refundable amount is calculated on the per-day value of your plan for the remaining, un-started delivery days.</LI>
            <LI>Any discount or coupon applied is accounted for proportionally in the refund.</LI>
          </UL>
        </Section>

        <Section title="4. Trial Day">
          <P>The Trial Day is a single, discounted day created so you can experience FitFuel before committing. Once a Trial Day has been prepared or delivered, it is <B>non-refundable</B>. If a Trial Day order is cancelled before the kitchen cut-off, it is refunded in full.</P>
        </Section>

        <Section title="5. Quality, wrong or damaged deliveries">
          <P>Your satisfaction with the food matters to us. If a delivery is missing, incorrect, spoiled or damaged on arrival, please report it <B>the same day</B> via WhatsApp or email with your order number and a photo where possible. Verified issues are resolved with a replacement on the next delivery or a refund/credit for that meal, at your preference.</P>
        </Section>

        <Section title="6. Cash on Delivery (COD)">
          <P>For COD orders, you pay at the door. If you cancel a COD order before the cut-off, no payment is due. Refunds only apply where a prepaid amount or credit was involved.</P>
        </Section>

        <Section title="7. Digital meal plans">
          <P>Digital meal plans (downloadable PDFs) are delivered instantly. Because access is granted immediately on purchase, digital plans are <B>non-refundable once accessed or downloaded</B>, except where the file is faulty and we are unable to provide a working copy.</P>
        </Section>

        <Section title="8. Supplements">
          <P>Supplement recommendations on FitFuel link to third-party retailers who fulfil, ship and support those orders. Returns, refunds and cancellations for supplements are governed by <B>the retailer&apos;s own policy</B>, not FitFuel&apos;s. We are not the seller of record for supplement purchases.</P>
        </Section>

        <Section title="9. How refunds are issued">
          <P>Approved refunds are issued to your original payment method via our payment partner, <B>PayU</B>, typically within <B>5–7 business days</B>, subject to your bank&apos;s processing times. Where faster, we may offer FitFuel account credit instead, with your consent.</P>
        </Section>

        <Section title="10. How to request a cancellation or refund">
          <P>Contact us with your order number:</P>
          <UL>
            <LI>Email: <a href="mailto:contact@fitfuel.in" style={linkStyle}>contact@fitfuel.in</a></LI>
            <LI>WhatsApp / Phone: <a href="https://wa.me/918850446348" style={linkStyle}>+91 8850446348</a></LI>
          </UL>
          <P>We aim to acknowledge every request within one business day.</P>
        </Section>

        <div style={{ height: 1, background: C.border, margin: "40px 0 24px" }} />
        <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.7 }}>
          See also our <Link href="/terms" style={linkStyle}>Terms &amp; Conditions</Link> and <Link href="/privacy" style={linkStyle}>Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}
