import Link from "next/link";
import { type ReactNode } from "react";

export const metadata = {
  title: "Our Team | FitFuel",
  description: "The people behind FitFuel and the nutrition principles that shape every plan.",
};

const C = { bg: "#080808", accent: "#a3e635", accent2: "#84cc16", text: "#ffffff", sub: "#a3a3a3", muted: "#737373", border: "#1f1f1f", card: "#111111" };
const link = { color: C.accent, textDecoration: "none", borderBottom: `1px solid ${C.accent}40` };

function Avatar({ initials }: { initials: string }) {
  return (
    <div style={{ width: 76, height: 76, borderRadius: 16, background: "#0e0e0e", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 26, color: C.accent, flexShrink: 0 }}>
      {initials}
    </div>
  );
}
function H2({ children }: { children: ReactNode }) {
  return <h2 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 24, color: C.text, margin: "0 0 22px", letterSpacing: "-0.02em" }}>{children}</h2>;
}

export default function OurTeamPage() {
  return (
    <main style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "120px 24px 96px" }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 13, color: C.accent, margin: "0 0 14px" }}>Our Team</p>
        <h1 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "clamp(34px,6vw,56px)", lineHeight: 1.04, margin: "0 0 18px", letterSpacing: "-0.025em" }}>
          The people behind your plate<span style={{ color: C.accent }}>.</span>
        </h1>
        <p style={{ color: C.sub, fontSize: 17, lineHeight: 1.7, maxWidth: 600, margin: "0 0 56px" }}>
          FitFuel was built by people who got tired of choosing between food that tastes good and food that works. So we built a system that does both.
        </p>

        <H2>Founder</H2>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "26px 24px", display: "flex", gap: 22, alignItems: "flex-start", marginBottom: 48, flexWrap: "wrap" }}>
          <Avatar initials="PB" />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: C.text }}>Pranit Borkar</div>
            <div style={{ fontSize: 13, color: C.accent, fontWeight: 600, letterSpacing: "0.04em", marginBottom: 12, textTransform: "uppercase" }}>Founder</div>
            <p style={{ color: C.sub, fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              Pranit founded FitFuel in Pune to turn meal delivery into something more than a tiffin service: a personal health system that cooks for you, tracks every gram, and adapts as your body changes. He leads product, kitchen and technology, and personally tests every part of the experience.
            </p>
          </div>
        </div>

        <H2>Nutrition</H2>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "26px 24px", display: "flex", gap: 22, alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap" }}>
          <Avatar initials="FF" />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: C.text }}>[Nutritionist name]</div>
            <div style={{ fontSize: 13, color: C.accent, fontWeight: 600, letterSpacing: "0.04em", marginBottom: 12, textTransform: "uppercase" }}>[Qualified Nutritionist / Dietitian, credentials]</div>
            <p style={{ color: C.sub, fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              Our plans are built on established nutrition principles. Full nutritionist details and credentials will be published here, and are required before any condition-specific medical plan goes live.
            </p>
          </div>
        </div>

        <div style={{ background: "rgba(132,204,22,0.06)", border: `1px solid ${C.accent}33`, borderRadius: 14, padding: "18px 22px" }}>
          <p style={{ color: C.sub, fontSize: 14.5, lineHeight: 1.7, margin: 0 }}>
            FitFuel provides food and general nutrition guidance, not medical advice. Please read our <Link href="/medical-disclaimer" style={link}>Medical Disclaimer</Link> before starting a condition-specific plan.
          </p>
        </div>

        <div style={{ marginTop: 32 }}><Link href="/" style={link}>&larr; Back to home</Link></div>
      </div>
    </main>
  );
}
