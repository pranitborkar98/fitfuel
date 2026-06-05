import Link from "next/link";
import { type ReactNode } from "react";

export const metadata = {
  title: "FAQ | FitFuel",
  description: "Answers about FitFuel meal plans, delivery in Pune, tracking, dietary options, payments, allergens and more.",
};

const C = { bg: "#080808", accent: "#a3e635", accent2: "#84cc16", text: "#ffffff", sub: "#a3a3a3", muted: "#737373", border: "#1f1f1f", card: "#111111" };
const link = { color: C.accent, textDecoration: "none", borderBottom: `1px solid ${C.accent}40` };

const faqs: { q: string; a: ReactNode }[] = [
  { q: "Where do you deliver?", a: <>We currently deliver within selected areas of Pune, with our kitchen based in Kharadi. Delivery areas are expanding; check at checkout whether your address is covered.</> },
  { q: "When will my food arrive?", a: <>You choose a Morning or Evening window when you subscribe. All your meals for the day arrive in a single bundled delivery within that window.</> },
  { q: "What is included in a plan?", a: <>Most plans include up to four items a day (breakfast, lunch, snack and dinner depending on the plan you pick), each portioned and labelled with its macros. Every box also includes a Morning Boost.</> },
  { q: "Can I see the menu before I subscribe?", a: <>Yes. The full 30-day rotating menu, including dish names and macros, is completely public, no account needed. Browse a plan and view all 30 days before you decide.</> },
  { q: "What dietary options do you offer?", a: <>Vegetarian, eggetarian, non-vegetarian, Jain and vegan options across a wide range of goals, plus condition-specific plans. Jain plans exclude onion, garlic, root vegetables and similar ingredients.</> },
  { q: "How does the tracking work?", a: <>When your meal arrives, tap "I ate this" in the app. The meal's macros are logged automatically, your calorie ring updates, and your progress charts build over time. You can adjust portions if you eat more or less.</> },
  { q: "Do you have plans for health conditions?", a: <>We design plans aligned with goals like diabetic-friendly, PCOS-supportive and heart-health eating. These offer nutritional support and are not medical treatment. Please read our <Link href="/medical-disclaimer" style={link}>Medical Disclaimer</Link> and consult your doctor.</> },
  { q: "I have allergies. Is FitFuel safe for me?", a: <>Our meals are prepared in a shared kitchen that handles common allergens, so we cannot guarantee any meal is allergen-free. Declare your allergies in your profile and read our <Link href="/allergen-policy" style={link}>Allergen Policy</Link>. If you have a severe allergy, consult your doctor first.</> },
  { q: "How much does it cost, and is GST included?", a: <>Plans range from a single trial day to multi-month subscriptions, with Standard, Premium and Luxury tiers. Prices are shown at checkout; GST of 5% applies on meal plans as indicated.</> },
  { q: "How do I pay?", a: <>We accept online payment through our partner PayU, as well as Cash on Delivery where available.</> },
  { q: "Can I pause, skip or cancel?", a: <>Yes. You can pause, skip upcoming days or cancel from your account, subject to our daily cut-off time. See our <Link href="/refund-policy" style={link}>Refund &amp; Cancellation Policy</Link> for how refunds work.</> },
  { q: "Is there a trial?", a: <>Yes, you can try a single trial day with no lock-in before committing to a longer subscription.</> },
];

export default function FAQPage() {
  return (
    <main style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "120px 24px 96px" }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 13, color: C.accent, margin: "0 0 14px" }}>FAQ</p>
        <h1 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "clamp(34px,6vw,56px)", lineHeight: 1.04, margin: "0 0 18px", letterSpacing: "-0.025em" }}>
          Questions, answered<span style={{ color: C.accent }}>.</span>
        </h1>
        <p style={{ color: C.sub, fontSize: 17, lineHeight: 1.7, maxWidth: 600, margin: "0 0 48px" }}>
          Everything you might want to know before you start. Still stuck? <Link href="/contact" style={link}>Get in touch</Link>.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((f, i) => (
            <details key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "4px 20px" }}>
              <summary style={{ cursor: "pointer", listStyle: "none", padding: "16px 0", fontSize: 16, fontWeight: 600, color: C.text, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                {f.q}
                <span style={{ color: C.accent, fontSize: 20, fontWeight: 400, flexShrink: 0 }}>+</span>
              </summary>
              <p style={{ color: C.sub, fontSize: 15, lineHeight: 1.7, margin: "0 0 16px" }}>{f.a}</p>
            </details>
          ))}
        </div>

        <div style={{ marginTop: 36 }}><Link href="/" style={link}>&larr; Back to home</Link></div>
      </div>
    </main>
  );
}
