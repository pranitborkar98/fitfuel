import Link from "next/link";
import { type ReactNode } from "react";

export const metadata = {
  title: "Allergen Policy | FitFuel",
  description: "How FitFuel handles allergens, cross-contact in a shared kitchen, and your responsibilities when ordering with allergies.",
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

export default function AllergenPolicyPage() {
  return (
    <main style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "120px 24px 96px" }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 13, color: C.accent, margin: "0 0 14px" }}>Legal</p>
        <h1 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "clamp(34px,6vw,52px)", lineHeight: 1.05, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
          Allergen Policy<span style={{ color: C.accent }}>.</span>
        </h1>
        <p style={{ color: C.muted, fontSize: 14, margin: "0 0 40px" }}>Last updated: 5 June 2026</p>

        <div style={{ background: "rgba(251,113,133,0.08)", border: `1px solid ${C.warn}40`, borderRadius: 14, padding: "18px 22px", margin: "0 0 40px" }}>
          <p style={{ color: C.text, fontSize: 15.5, lineHeight: 1.7, margin: 0 }}>
            <B>Important:</B> FitFuel meals are prepared in a shared kitchen that handles common allergens. We cannot guarantee that any meal is completely free of a given allergen. If you have a severe or life-threatening allergy, please consult your doctor before ordering and order at your own discretion.
          </p>
        </div>

        <Section title="1. Our Kitchen Environment">
          <P>All FitFuel meals are prepared in a single shared kitchen where many ingredients are handled, stored and cooked using shared equipment and surfaces. Even with careful handling and cleaning, <B>cross-contact between ingredients can occur</B>. This means traces of an allergen may be present in a meal even if that allergen is not a listed ingredient.</P>
        </Section>

        <Section title="2. Common Allergens We Handle">
          <P>Our kitchen regularly works with ingredients that include, among others:</P>
          <UL>
            <LI>Milk and dairy (paneer, curd, ghee, milk).</LI>
            <LI>Tree nuts and peanuts (almonds, peanuts and nut-based preparations).</LI>
            <LI>Wheat and gluten (roti, atta, semolina-based dishes).</LI>
            <LI>Soy.</LI>
            <LI>Eggs (in egg-based plans).</LI>
            <LI>Fish (in non-vegetarian plans).</LI>
            <LI>Sesame, mustard and other seeds and spices.</LI>
          </UL>
          <P>Specific ingredients vary by plan and by daily menu.</P>
        </Section>

        <Section title="3. No Guarantee of Allergen-Free Meals">
          <P>Because of the shared environment described above, FitFuel <B>cannot guarantee</B> that any meal is free from a specific allergen or from cross-contact. We do not operate dedicated allergen-free preparation lines. Please take this into account when deciding whether FitFuel is suitable for your needs.</P>
        </Section>

        <Section title="4. Your Responsibility">
          <P>When you set up your profile, you can declare allergies and intolerances, and we use this information to guide plan personalisation where reasonably possible. You remain responsible for:</P>
          <UL>
            <LI>Declaring all relevant allergies and intolerances accurately and keeping them updated.</LI>
            <LI>Reviewing the listed ingredients of your meals before eating.</LI>
            <LI>Deciding, with your doctor where appropriate, whether a meal is safe for you.</LI>
          </UL>
          <P>We will try to accommodate declared allergies, but accommodation is not a guarantee of an allergen-free meal.</P>
        </Section>

        <Section title="5. Severe and Life-Threatening Allergies">
          <P>If you have a severe allergy (for example, one that has caused or could cause anaphylaxis), we strongly recommend that you consult your doctor before subscribing and exercise your own judgment. Given the shared-kitchen environment, FitFuel may not be suitable for individuals with severe allergies, and you order at your own risk.</P>
        </Section>

        <Section title="6. Ingredients and Labelling">
          <P>We aim to provide accurate ingredient and nutrition information for each meal. If you are unsure about an ingredient in a specific dish, contact us before consuming it and we will do our best to help. Recipes and ingredients may be updated over time, so please re-check if your meals change.</P>
        </Section>

        <Section title="7. Changes to this Policy">
          <P>We may update this Allergen Policy as our kitchen, menu or processes change. The current version is always available here with an updated date.</P>
        </Section>

        <Section title="8. Contact Us">
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
            <P>Questions about allergens in your meals?</P>
            <P><B>FitFuel</B> &middot; Email: <a href="mailto:contact@fitfuel.in" style={linkStyle}>contact@fitfuel.in</a><br />FSSAI Licence: 21523035002815</P>
            <P>See also our <Link href="/medical-disclaimer" style={linkStyle}>Medical Disclaimer</Link> and <Link href="/terms" style={linkStyle}>Terms &amp; Conditions</Link>.</P>
          </div>
        </Section>

        <div style={{ marginTop: 24 }}>
          <Link href="/" style={linkStyle}>&larr; Back to home</Link>
        </div>
      </div>
    </main>
  );
}
