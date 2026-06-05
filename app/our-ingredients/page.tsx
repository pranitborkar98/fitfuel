import Link from "next/link";
import { type ReactNode } from "react";

export const metadata = {
  title: "Our Ingredients | FitFuel",
  description: "What goes into a FitFuel meal: fresh local sourcing, clean oils, real proteins, and what we deliberately leave out.",
};

const C = { bg: "#080808", accent: "#a3e635", accent2: "#84cc16", text: "#ffffff", sub: "#a3a3a3", muted: "#737373", border: "#1f1f1f", card: "#111111" };
const link = { color: C.accent, textDecoration: "none", borderBottom: `1px solid ${C.accent}40` };

const groups = [
  { t: "Fresh, locally sourced", d: "Vegetables and produce sourced in Pune and chosen for each day's menu, so they reach you fresh rather than stored for weeks." },
  { t: "Real proteins", d: "Paneer, dals and legumes, eggs, chicken and fish depending on your plan. Lean cuts, measured for your macro target." },
  { t: "Clean oils, used sparingly", d: "Cold-pressed and heart-friendly oils in measured amounts. No deep frying, no reused oil." },
  { t: "Whole grains and complex carbs", d: "Rotis, millets, brown and hand-pounded rice and oats, chosen to keep energy steady through the day." },
];

const avoid = [
  "No deep frying, anywhere on the menu",
  "No reused or hydrogenated oils",
  "No added refined sugar where it can be avoided; natural sweeteners in moderation",
  "No artificial preservatives or colours added by us",
  "No mystery portions: every ingredient is weighed and reflected in your macros",
];

function H2({ children }: { children: ReactNode }) {
  return <h2 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 26, color: C.text, margin: "0 0 24px", letterSpacing: "-0.02em" }}>{children}</h2>;
}

export default function OurIngredientsPage() {
  return (
    <main style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "120px 24px 96px" }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 13, color: C.accent, margin: "0 0 14px" }}>Our Ingredients</p>
        <h1 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "clamp(34px,6vw,56px)", lineHeight: 1.04, margin: "0 0 18px", letterSpacing: "-0.025em" }}>
          Real food, nothing hidden<span style={{ color: C.accent }}>.</span>
        </h1>
        <p style={{ color: C.sub, fontSize: 17, lineHeight: 1.7, maxWidth: 640, margin: "0 0 56px" }}>
          Good macros start with good ingredients. We keep the list simple, fresh and honest, so the food on your plate matches the numbers on your dashboard.
        </p>

        <H2>What goes in</H2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginBottom: 72 }}>
          {groups.map((g) => (
            <div key={g.t} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 22px" }}>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: C.text, marginBottom: 7 }}>{g.t}</div>
              <p style={{ color: C.sub, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{g.d}</p>
            </div>
          ))}
        </div>

        <H2>What we leave out</H2>
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 64px" }}>
          {avoid.map((a) => (
            <li key={a} style={{ position: "relative", paddingLeft: 26, marginBottom: 13, color: C.sub, fontSize: 15.5, lineHeight: 1.6 }}>
              <span style={{ position: "absolute", left: 0, top: 0, color: C.accent, fontWeight: 800 }}>&times;</span>
              {a}
            </li>
          ))}
        </ul>

        <div style={{ background: "rgba(132,204,22,0.06)", border: `1px solid ${C.accent}33`, borderRadius: 14, padding: "20px 22px" }}>
          <p style={{ color: C.sub, fontSize: 14.5, lineHeight: 1.7, margin: 0 }}>
            <strong style={{ color: C.text }}>A note on allergens:</strong> our meals are prepared in a shared kitchen that handles common allergens, so cross-contact is possible. Please read our <Link href="/allergen-policy" style={link}>Allergen Policy</Link> and declare any allergies in your profile.
          </p>
        </div>

        <div style={{ marginTop: 32 }}><Link href="/" style={link}>&larr; Back to home</Link></div>
      </div>
    </main>
  );
}
