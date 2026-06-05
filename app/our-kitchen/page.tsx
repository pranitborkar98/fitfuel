import Link from "next/link";
import { type ReactNode } from "react";

export const metadata = {
  title: "Our Kitchen | FitFuel",
  description: "Inside the FitFuel kitchen: fresh daily prep, no deep frying, clean oils and FSSAI-licensed food safety in Pune.",
};

const C = { bg: "#080808", accent: "#a3e635", accent2: "#84cc16", text: "#ffffff", sub: "#a3a3a3", muted: "#737373", border: "#1f1f1f", card: "#111111" };
const link = { color: C.accent, textDecoration: "none", borderBottom: `1px solid ${C.accent}40` };

const standards = [
  { t: "No deep frying", d: "Ever. We steam, saute, grill and slow-cook. Flavour without the oil load." },
  { t: "Clean oils only", d: "Cold-pressed and heart-friendly oils used in measured amounts, never reused." },
  { t: "Cooked the same day", d: "Your food is prepared fresh each morning, not batch-cooked days ahead and reheated." },
  { t: "Measured to the gram", d: "Portions are weighed so the macros on your dashboard match what is actually in the box." },
  { t: "Fresh sourcing", d: "Vegetables and proteins sourced locally in Pune, chosen for the day's menu." },
  { t: "FSSAI licensed", d: "We operate under FSSAI licence 21523035002815, with hygiene and food-safety practices throughout." },
];

const rhythm = [
  { time: "4:00 AM", t: "Prep begins", d: "Fresh produce washed, cut and weighed for the day's menu." },
  { time: "5:30 AM", t: "Cooking", d: "Meals cooked in small batches, no frying, portioned to plan." },
  { time: "7:00 AM", t: "Pack and quality check", d: "Sealed, labelled with macros, and your Morning Boost added." },
  { time: "From 7:30 AM", t: "Dispatch", d: "Bundled into your daily delivery window and on its way." },
];

function Photo({ label }: { label: string }) {
  return (
    <div style={{ aspectRatio: "4 / 3", background: "#0e0e0e", border: `1px dashed ${C.border}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 13 }}>
      {label}
    </div>
  );
}
function H2({ children }: { children: ReactNode }) {
  return <h2 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 26, color: C.text, margin: "0 0 24px", letterSpacing: "-0.02em" }}>{children}</h2>;
}

export default function OurKitchenPage() {
  return (
    <main style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "120px 24px 96px" }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 13, color: C.accent, margin: "0 0 14px" }}>Our Kitchen</p>
        <h1 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "clamp(34px,6vw,56px)", lineHeight: 1.04, margin: "0 0 18px", letterSpacing: "-0.025em" }}>
          Fresh, clean, every morning<span style={{ color: C.accent }}>.</span>
        </h1>
        <p style={{ color: C.sub, fontSize: 17, lineHeight: 1.7, maxWidth: 640, margin: "0 0 56px" }}>
          The dashboard is only as honest as the kitchen behind it. Here is how your food is actually made, and the standards we hold every single day.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 72 }}>
          <Photo label="Kitchen photo" />
          <Photo label="Fresh prep" />
          <Photo label="Plating / packing" />
        </div>

        <H2>Our standards</H2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginBottom: 76 }}>
          {standards.map((s) => (
            <div key={s.t} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 22px" }}>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: C.text, marginBottom: 7 }}>{s.t}</div>
              <p style={{ color: C.sub, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
            </div>
          ))}
        </div>

        <H2>The daily rhythm</H2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 64 }}>
          {rhythm.map((r, i) => (
            <div key={r.time} style={{ display: "flex", gap: 22, paddingBottom: i === rhythm.length - 1 ? 0 : 24 }}>
              <div style={{ minWidth: 96, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 17, color: C.accent, paddingTop: 1 }}>{r.time}</div>
              <div style={{ borderLeft: `1px solid ${C.border}`, paddingLeft: 22 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>{r.t}</div>
                <p style={{ color: C.sub, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{r.d}</p>
              </div>
            </div>
          ))}
        </div>

        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>
          Curious what goes into the food itself? See <Link href="/our-ingredients" style={link}>Our Ingredients</Link>, or read our <Link href="/allergen-policy" style={link}>Allergen Policy</Link>.
        </p>

        <div style={{ marginTop: 28 }}><Link href="/" style={link}>&larr; Back to home</Link></div>
      </div>
    </main>
  );
}
