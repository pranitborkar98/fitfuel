import Link from "next/link";
import { type ReactNode } from "react";

export const metadata = {
  title: "Terms & Conditions | FitFuel",
  description: "The terms governing your use of FitFuel's meal plans, delivery, digital plans and health tracking tools.",
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

export default function TermsPage() {
  return (
    <main style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "120px 24px 96px" }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 13, color: C.accent, margin: "0 0 14px" }}>Legal</p>
        <h1 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "clamp(34px,6vw,52px)", lineHeight: 1.05, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
          Terms &amp; Conditions<span style={{ color: C.accent }}>.</span>
        </h1>
        <p style={{ color: C.muted, fontSize: 14, margin: "0 0 40px" }}>Last updated: 5 June 2026</p>
        <div style={{ height: 1, background: C.border, margin: "0 0 40px" }} />

        <Section title="1. Acceptance of these Terms">
          <P>These Terms and Conditions govern your access to and use of FitFuel, including our website, meal subscription plans, daily delivery, digital meal plans, supplement guidance and health tracking tools (together, the <B>Services</B>). FitFuel is operated by [Registered Entity Name], based in Pune, Maharashtra, India (<B>FitFuel</B>, <B>we</B>, <B>us</B>). By creating an account, placing an order or using any part of the Services, you agree to these Terms. If you do not agree, please do not use the Services.</P>
        </Section>

        <Section title="2. Eligibility">
          <P>You must be at least 18 years old and capable of forming a legally binding contract under Indian law to use the Services. If you are using the Services on behalf of a minor (for example, a parent ordering for a child), you accept these Terms on their behalf and are responsible for their use.</P>
        </Section>

        <Section title="3. Our Services">
          <P>FitFuel provides personalised, freshly prepared meal plans delivered within our serviceable areas, alongside tools for nutrition tracking, body metrics, workout guidance and progress monitoring. Some features are tied to specific subscription tiers. We may add, change, suspend or remove features at any time. Meal availability, delivery areas and plan options may vary and are not guaranteed.</P>
        </Section>

        <Section title="4. Your Account and Information">
          <P>You are responsible for keeping your account credentials secure and for all activity under your account. The personalisation we provide depends on the accuracy of the information you give us, including your body details, goals, health conditions and allergies. You agree to provide accurate, current and complete information and to keep it updated. We are not responsible for outcomes resulting from inaccurate or incomplete information you provide.</P>
        </Section>

        <Section title="5. Subscriptions and Orders">
          <P>Meal plans are offered as trial, weekly, fortnightly, monthly and multi-month subscriptions. When you subscribe:</P>
          <UL>
            <LI>Your subscription covers the duration and meal selection you choose at checkout.</LI>
            <LI>You may pause, skip or modify upcoming deliveries subject to our cut-off times, which we will communicate in the app.</LI>
            <LI>Deliveries are bundled into a single drop per day in your chosen Morning or Evening window.</LI>
            <LI>Subscriptions do not auto-renew unless this is clearly stated at the point of purchase; where auto-renewal applies, you may cancel before the next cycle.</LI>
          </UL>
        </Section>

        <Section title="6. Pricing, Payments and Taxes">
          <P>Prices are listed in Indian Rupees and are inclusive or exclusive of applicable taxes as indicated at checkout. We accept payments through our payment partner, PayU, and Cash on Delivery where available. By paying online you agree to PayU's terms in addition to these Terms. We may revise prices from time to time; changes will not affect a subscription already paid for, but will apply to renewals and new orders.</P>
        </Section>

        <Section title="7. Delivery">
          <P>We currently deliver within selected areas of Pune. Delivery windows are estimates and may be affected by weather, traffic, address accuracy and circumstances beyond our control. Please ensure someone is available to receive the delivery and that the address and contact details on your account are correct. Confirmation of delivery may be recorded by our delivery personnel.</P>
        </Section>

        <Section title="8. Cancellation and Refunds">
          <P>Cancellations and refunds are governed by our <Link href="/refund-policy" style={linkStyle}>Refund &amp; Cancellation Policy</Link>, which forms part of these Terms. Please read it before subscribing.</P>
        </Section>

        <Section title="9. Health, Nutrition and Medical Disclaimer">
          <P>FitFuel provides food and general nutrition and fitness guidance. It is <B>not</B> medical advice and is not a substitute for professional healthcare. This applies especially to condition-specific plans (such as diabetic, PCOS, thyroid, heart-health or recovery plans). Please read our <Link href="/medical-disclaimer" style={linkStyle}>Medical Disclaimer</Link> and <Link href="/allergen-policy" style={linkStyle}>Allergen Policy</Link>, which form part of these Terms. Consult a qualified medical professional before starting any plan, particularly if you have a health condition, are pregnant or nursing, or are on medication.</P>
        </Section>

        <Section title="10. Food Safety">
          <P>FitFuel operates under FSSAI licence number 21523035002815. We prepare meals fresh and follow food-safety practices, but you are responsible for storing, reheating and consuming meals within the recommended time and conditions communicated to you.</P>
        </Section>

        <Section title="11. Acceptable Use">
          <P>You agree not to misuse the Services, including by attempting to disrupt or gain unauthorised access to our systems, reselling meals or plans without authorisation, scraping or copying our content, or using the Services for any unlawful purpose. We may suspend or terminate accounts that violate these Terms.</P>
        </Section>

        <Section title="12. Intellectual Property">
          <P>All content on the Services, including recipes, meal plans, text, design, logos and software, is owned by FitFuel or its licensors and is protected by applicable laws. Your subscription gives you a personal, non-transferable right to use the Services and content for your own use. You may not reproduce, redistribute or commercially exploit any content without our written permission.</P>
        </Section>

        <Section title="13. Third-Party Services">
          <P>The Services rely on third parties such as payment processors and delivery and infrastructure providers. We are not responsible for the acts, omissions or terms of these third parties, and your use of their services may be governed by their own terms and policies.</P>
        </Section>

        <Section title="14. Limitation of Liability">
          <P>To the maximum extent permitted by law, FitFuel is not liable for any indirect, incidental or consequential loss arising from your use of the Services. Our total liability for any claim relating to the Services is limited to the amount you paid to us for the relevant order or subscription in the three months preceding the claim. Nothing in these Terms excludes liability that cannot be excluded under Indian law.</P>
        </Section>

        <Section title="15. Indemnity">
          <P>You agree to indemnify and hold FitFuel harmless from claims, damages and expenses arising from your breach of these Terms, your misuse of the Services, or your provision of inaccurate health information.</P>
        </Section>

        <Section title="16. Governing Law and Jurisdiction">
          <P>These Terms are governed by the laws of India. Subject to applicable law, the courts at Pune, Maharashtra shall have exclusive jurisdiction over any dispute arising out of or relating to these Terms or the Services.</P>
        </Section>

        <Section title="17. Changes to these Terms">
          <P>We may update these Terms from time to time. We will post the revised version here with a new "Last updated" date, and where changes are significant we will make reasonable efforts to notify you. Continued use of the Services after changes take effect constitutes acceptance of the updated Terms.</P>
        </Section>

        <Section title="18. Contact Us">
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
            <P>Questions about these Terms? Reach us at:</P>
            <P><B>FitFuel</B> &middot; [Registered Entity Name]<br />[Full Registered Address, Pune, Maharashtra, PIN]<br />Email: <a href="mailto:pranitborkar98@gmail.com" style={linkStyle}>pranitborkar98@gmail.com</a><br />FSSAI Licence: 21523035002815</P>
          </div>
        </Section>

        <div style={{ marginTop: 24 }}>
          <Link href="/" style={linkStyle}>&larr; Back to home</Link>
        </div>
      </div>
    </main>
  );
}
