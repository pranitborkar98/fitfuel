import Link from "next/link";
import { type ReactNode } from "react";

export const metadata = {
  alternates: { canonical: "/privacy" },
  title: "Privacy Policy",
  description: "How FitFuel collects, uses, protects and shares your personal and health information, and your rights under India's data protection law.",
};

const C = {
  bg: "#080808",
  accent: "#a3e635",
  text: "#ffffff",
  sub: "#a3a3a3",
  muted: "#9a9a94",
  border: "#1f1f1f",
  card: "#111111",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 34 }}>
      <h2 style={{ fontFamily: "var(--ff-cond)", fontWeight: 700, fontSize: 20, color: C.text, margin: "0 0 12px", letterSpacing: "-0.01em" }}>{title}</h2>
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

export default function PrivacyPage() {
  return (
    <main style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "inherit", WebkitFontSmoothing: "antialiased" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "120px 24px 96px" }}>
        <p style={{ fontFamily: "var(--ff-cond)", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 13, color: C.accent, margin: "0 0 14px" }}>Legal</p>
        <h1 style={{ fontFamily: "var(--ff-cond)", fontWeight: 800, fontSize: "clamp(34px,6vw,52px)", lineHeight: 1.05, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
          Privacy Policy<span style={{ color: C.accent }}>.</span>
        </h1>
        <p style={{ color: C.muted, fontSize: 14, margin: "0 0 40px" }}>Last updated: 5 June 2026</p>
        <div style={{ height: 1, background: C.border, margin: "0 0 40px" }} />

        <Section title="1. Introduction">
          <P>FitFuel, operated by [Registered Entity Name] in Pune, Maharashtra, India, respects your privacy. This policy explains what information we collect, why we collect it, how we use and protect it, and the rights you have. It applies to our website, app and all related Services. Because FitFuel personalises nutrition and fitness, some of the information we handle is sensitive, and we treat it with particular care.</P>
        </Section>

        <Section title="2. Information We Collect">
          <P>We collect the following categories of information:</P>
          <UL>
            <LI><B>Account and contact details:</B> name, email, phone number and delivery address.</LI>
            <LI><B>Health and body information:</B> weight, height, age, gender, body metrics, goals, activity level, dietary preferences, allergies and health conditions you choose to share. This is sensitive personal data.</LI>
            <LI><B>Order and subscription data:</B> the plans you choose, meals logged, ratings, swaps and delivery preferences.</LI>
            <LI><B>Payment information:</B> processed by our payment partner PayU. We do not store your full card or banking details on our servers.</LI>
            <LI><B>Usage and device data:</B> how you interact with the Services, along with standard log and device information.</LI>
          </UL>
        </Section>

        <Section title="3. How We Use Your Information">
          <P>We use your information to:</P>
          <UL>
            <LI>Calculate your nutrition targets and match you to the right meal plan.</LI>
            <LI>Prepare and deliver your meals and run your subscription.</LI>
            <LI>Power your tracking, progress and (in future) coaching features.</LI>
            <LI>Process payments, prevent fraud and provide customer support.</LI>
            <LI>Communicate service updates, and, with your consent, send relevant offers.</LI>
            <LI>Improve and secure the Services and meet our legal obligations.</LI>
          </UL>
        </Section>

        <Section title="4. Health Data and Your Consent">
          <P>The body, health and dietary information you provide is collected only to personalise your plans and is processed on the basis of your consent. You may withdraw your consent at any time by contacting us, though doing so may limit our ability to personalise the Services. We do not use your health data for advertising and we do not sell it.</P>
        </Section>

        <Section title="5. How We Share Information">
          <P>We share information only as needed to run the Services:</P>
          <UL>
            <LI><B>Service providers:</B> payment processing (PayU), hosting, infrastructure and delivery support, bound to handle data securely and only on our instructions.</LI>
            <LI><B>Delivery personnel:</B> the minimum needed to deliver your order (name, address, contact, items).</LI>
            <LI><B>Legal:</B> where required by law, regulation or valid legal process.</LI>
          </UL>
          <P>We do <B>not</B> sell your personal information to third parties.</P>
        </Section>

        <Section title="6. Cookies and Analytics">
          <P>We use cookies and similar technologies to keep you signed in, remember preferences and understand how the Services are used so we can improve them. You can control cookies through your browser settings; disabling some cookies may affect functionality.</P>
        </Section>

        <Section title="7. Data Security">
          <P>We use reasonable technical and organisational measures to protect your information against unauthorised access, loss or misuse. No system is completely secure, so while we work hard to protect your data, we cannot guarantee absolute security. Please keep your account credentials confidential.</P>
        </Section>

        <Section title="8. Data Retention">
          <P>We retain your information for as long as your account is active and as needed to provide the Services, comply with legal obligations, resolve disputes and enforce our agreements. When information is no longer required, we delete or anonymise it.</P>
        </Section>

        <Section title="9. Your Rights">
          <P>Subject to applicable Indian data protection law, including the Digital Personal Data Protection Act, 2023, you have the right to:</P>
          <UL>
            <LI>Access the personal data we hold about you and request a summary of how it is processed.</LI>
            <LI>Request correction or updating of inaccurate or incomplete data.</LI>
            <LI>Request erasure of your data, subject to legal retention requirements.</LI>
            <LI>Withdraw consent for processing where processing is based on consent.</LI>
            <LI>Nominate another individual to exercise your rights in the event of death or incapacity.</LI>
            <LI>Raise a grievance with our Grievance Officer and, if unresolved, with the Data Protection Board of India.</LI>
          </UL>
          <P>To exercise any of these rights, contact us using the details below.</P>
        </Section>

        <Section title="10. Grievance Officer">
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
            <P>In line with applicable Indian law, you can contact our Grievance Officer for any concern about your data:</P>
            <P><B>Grievance Officer:</B> [Grievance Officer Name]<br />FitFuel &middot; [Registered Entity Name]<br />[Full Registered Address, Pune, Maharashtra, PIN]<br />Email: <a href="mailto:contact@fitfuel.in" style={linkStyle}>contact@fitfuel.in</a></P>
            <P>We will acknowledge and address grievances within the timelines required by law.</P>
          </div>
        </Section>

        <Section title="11. Children's Privacy">
          <P>The Services are intended for users aged 18 and above. We do not knowingly collect personal data of children except where a parent or guardian provides it on their behalf and provides verifiable consent as required by law. If you believe a child has provided us data without proper consent, contact us so we can address it.</P>
        </Section>

        <Section title="12. Changes to this Policy">
          <P>We may update this Privacy Policy from time to time. The latest version will always be available here with an updated "Last updated" date. Where changes are significant, we will make reasonable efforts to notify you.</P>
        </Section>

        <Section title="13. Contact Us">
          <P>For any privacy question, email us at <a href="mailto:contact@fitfuel.in" style={linkStyle}>contact@fitfuel.in</a>. See also our <Link href="/terms" style={linkStyle}>Terms &amp; Conditions</Link>.</P>
        </Section>

        <div style={{ marginTop: 24 }}>
          <Link href="/" style={linkStyle}>&larr; Back to home</Link>
        </div>
      </div>
    </main>
  );
}
