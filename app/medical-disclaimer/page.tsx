import Link from "next/link";
import { type ReactNode } from "react";

export const metadata = {
  title: "Medical Disclaimer | FitFuel",
  description: "FitFuel provides food and general nutrition guidance, not medical advice. Important information before starting any plan.",
};

const C = {
  bg: "#080808",
  accent: "#a3e635",
  warn: "#fb7185",
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

export default function MedicalDisclaimerPage() {
  return (
    <main style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "120px 24px 96px" }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 13, color: C.accent, margin: "0 0 14px" }}>Legal</p>
        <h1 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "clamp(34px,6vw,52px)", lineHeight: 1.05, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
          Medical Disclaimer<span style={{ color: C.accent }}>.</span>
        </h1>
        <p style={{ color: C.muted, fontSize: 14, margin: "0 0 40px" }}>Last updated: 5 June 2026</p>

        <div style={{ background: "rgba(251,113,133,0.08)", border: `1px solid ${C.warn}40`, borderRadius: 14, padding: "18px 22px", margin: "0 0 40px" }}>
          <p style={{ color: C.text, fontSize: 15.5, lineHeight: 1.7, margin: 0 }}>
            <B>Important:</B> FitFuel provides food and general nutrition and fitness guidance. It is not medical advice, diagnosis or treatment, and it is not a substitute for care from a qualified healthcare professional. Always consult your doctor before making changes to your diet or exercise, especially if you have a health condition, are pregnant or nursing, or take medication.
          </p>
        </div>

        <Section title="1. Not Medical Advice">
          <P>The meal plans, nutritional information, calorie and macro targets, workout guidance and any educational content provided by FitFuel are for general informational purposes only. They are not intended to diagnose, treat, cure or prevent any disease or health condition, and they should not be relied upon as a substitute for advice from your physician, dietitian or other qualified healthcare provider.</P>
        </Section>

        <Section title="2. Consult Your Healthcare Provider">
          <P>Before starting any FitFuel plan, you should consult a qualified medical professional, particularly if you:</P>
          <UL>
            <LI>Have a chronic or acute health condition (for example diabetes, PCOS, thyroid, cardiac, kidney or liver conditions).</LI>
            <LI>Are pregnant, planning a pregnancy, or nursing.</LI>
            <LI>Take prescription medication or have allergies or intolerances.</LI>
            <LI>Are recovering from surgery, illness or an eating disorder.</LI>
            <LI>Have any concern about whether a plan is appropriate for you.</LI>
          </UL>
        </Section>

        <Section title="3. Condition-Specific and Therapeutic Plans">
          <P>Some FitFuel plans are designed with specific health goals in mind (such as diabetic-friendly, PCOS-supportive or heart-health plans). These plans offer <B>nutritional support</B> aligned with general dietary principles for those goals. They are <B>not</B> medical treatment, do not replace your prescribed care, and must not be used to self-manage a medical condition in place of professional supervision. Continue to follow your doctor's guidance and medication.</P>
        </Section>

        <Section title="4. No Doctor-Patient Relationship">
          <P>Using FitFuel, including any current or future AI guidance or coaching features, does not create a doctor-patient, dietitian-client or other professional clinical relationship between you and FitFuel. Any AI feature surfaces general guidance and your own data; it does not diagnose, prescribe or replace professional medical judgment, and medical questions should be directed to a qualified professional.</P>
        </Section>

        <Section title="5. Allergies and Intolerances">
          <P>FitFuel meals are prepared in a shared kitchen and may contain or come into contact with common allergens. Please read our <Link href="/allergen-policy" style={linkStyle}>Allergen Policy</Link> carefully and declare any allergies in your profile. If you have a severe allergy, consult your doctor before ordering.</P>
        </Section>

        <Section title="6. Individual Results Vary">
          <P>Health, weight and fitness outcomes depend on many factors including genetics, medical conditions, consistency, sleep, stress and adherence. FitFuel does not guarantee any specific result. Any testimonials or examples reflect individual experiences and are not promises of similar outcomes.</P>
        </Section>

        <Section title="7. Pregnancy, Nursing and Children">
          <P>Nutritional needs during pregnancy, while nursing, and for children and teenagers are specialised. Do not begin a plan in these situations without guidance from a qualified healthcare professional.</P>
        </Section>

        <Section title="8. In an Emergency">
          <P>FitFuel is not an emergency service. If you experience a medical emergency or symptoms that concern you, stop and seek immediate help from a doctor or your local emergency services. Do not rely on FitFuel for urgent or emergency medical needs.</P>
        </Section>

        <Section title="9. Our Nutrition Team">
          <P>FitFuel's plans are designed with nutrition principles in mind. [Nutritionist name and credentials to be added before condition-specific plans go live.] For personalised medical or clinical nutrition advice, please consult your own qualified professional.</P>
        </Section>

        <Section title="10. Contact Us">
          <P>Questions about this disclaimer? Email <a href="mailto:contact@fitfuel.in" style={linkStyle}>contact@fitfuel.in</a>. See also our <Link href="/terms" style={linkStyle}>Terms &amp; Conditions</Link> and <Link href="/allergen-policy" style={linkStyle}>Allergen Policy</Link>.</P>
        </Section>

        <div style={{ marginTop: 24 }}>
          <Link href="/" style={linkStyle}>&larr; Back to home</Link>
        </div>
      </div>
    </main>
  );
}
