import Link from "next/link";
import { type ReactNode } from "react";

export const metadata = {
  title: "Refund & Cancellation Policy | FitFuel",
  description: "How cancellations, refunds, quality issues and missed deliveries are handled for FitFuel subscriptions and digital plans.",
};

const C = {
  bg: "#080808",
  accent: "#a3e635",
  text: "#ffffff",
  sub: "#a3a3a3",
  muted: "#737373",
  border: "#1f1f1f",
  card: "#111111",
};

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
const linkStyle = { color: C.accent, textDecoration: "none", borderBottom: `1px solid ${C.accent}40` };

export default function RefundPolicyPage() {
  return (
    <main style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "120px 24px 96px" }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 13, color: C.accent, margin: "0 0 14px" }}>Legal</p>
        <h1 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "clamp(34px,6vw,52px)", lineHeight: 1.05, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
          Refund &amp; Cancellation<span style={{ color: C.accent }}>.</span>
        </h1>
        <p style={{ color: C.muted, fontSize: 14, margin: "0 0 40px" }}>Last updated: 5 June 2026</p>
        <div style={{ height: 1, background: C.border, margin: "0 0 40px" }} />

        <Section title="1. Overview">
          <P>We want you to be happy with FitFuel. Because we prepare fresh, perishable food daily and personalise it to you, our refund rules balance fairness to you with the realities of a fresh-food kitchen. This policy explains when you can cancel, when refunds apply and how to request one. It forms part of our <Link href="/terms" style={linkStyle}>Terms &amp; Conditions</Link>.</P>
        </Section>

        <Section title="2. Cancelling a Subscription">
          <P>You can cancel an active subscription at any time from your account or by contacting us. Cancellation stops future deliveries and billing cycles. Because meals are planned and procured ahead of time, cancellations take effect <B>after our daily cut-off</B>: any delivery already scheduled or prepared for the next day may still be delivered and billed.</P>
        </Section>

        <Section title="3. Refund Eligibility">
          <P>For prepaid multi-day subscriptions, if you cancel mid-term we will refund the value of the <B>unused, undelivered days</B>, calculated on a pro-rata basis, after deducting:</P>
          <UL>
            <LI>The value of meals already delivered or prepared, and</LI>
            <LI>Any discount that was conditional on the full subscription duration (the effective per-day rate may be recalculated to the shorter actual term).</LI>
          </UL>
          <P>Days that have already passed or been delivered are not refundable.</P>
        </Section>

        <Section title="4. Trial Day">
          <P>Trial-day orders are intended to let you sample the experience and are <B>non-refundable</B> once prepared or delivered, except in the case of a quality issue described below.</P>
        </Section>

        <Section title="5. Quality Issues or Incorrect Meals">
          <P>If a meal arrives damaged, spoiled, incorrect or materially not as described, please report it to us with a photo <B>within 4 hours of delivery</B>. Where we confirm the issue, we will, at our discretion, offer a replacement, an account credit or a refund for that meal. Reporting promptly helps us verify and resolve the issue fairly.</P>
        </Section>

        <Section title="6. Missed or Failed Deliveries">
          <P>If a delivery fails because of us, you will receive a credit or refund for that delivery. If a delivery fails because no one was available to receive it, the address or contact details were incorrect, or access was not possible, that delivery is treated as completed and is not refundable. Please keep your delivery details accurate and stay reachable during your chosen window.</P>
        </Section>

        <Section title="7. Digital Meal Plans">
          <P>Digital meal plans are downloadable content. Because they are delivered instantly and cannot be returned, they are <B>non-refundable once accessed or downloaded</B>, except where the content is faulty or materially not as described. This does not affect any non-waivable rights you have under applicable law.</P>
        </Section>

        <Section title="8. Refund Method and Timeline">
          <P>Approved refunds are issued to your original payment method. For online (PayU) payments, refunds are typically processed within <B>5 to 7 business days</B> after approval, though the time for the amount to reflect depends on your bank or card issuer. Account credits, where offered, are applied immediately and can be used against future orders.</P>
        </Section>

        <Section title="9. Cash on Delivery Orders">
          <P>For Cash on Delivery orders, approved refunds are issued by bank transfer or UPI to details you provide and verify. We may request reasonable verification before processing a refund to a COD account.</P>
        </Section>

        <Section title="10. How to Request a Refund or Cancellation">
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
            <P>Use your account, or contact us with your order details:</P>
            <P><B>FitFuel</B> &middot; [Registered Entity Name]<br />Email: <a href="mailto:pranitborkar98@gmail.com" style={linkStyle}>pranitborkar98@gmail.com</a><br />[Support phone / WhatsApp number]</P>
            <P>Please include your order or subscription ID and, for quality issues, a photo and brief description.</P>
          </div>
        </Section>

        <div style={{ marginTop: 24 }}>
          <Link href="/" style={linkStyle}>&larr; Back to home</Link>
        </div>
      </div>
    </main>
  );
}
