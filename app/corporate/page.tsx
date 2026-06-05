import Link from "next/link";
import { type ReactNode } from "react";

export const metadata = {
  title: "Corporate Plans | FitFuel",
  description: "Healthy, goal-based meals for your team. FitFuel corporate wellness and meal programs for companies in Pune.",
};

const C = { bg: "#080808", accent: "#a3e635", accent2: "#84cc16", text: "#ffffff", sub: "#a3a3a3", muted: "#737373", border: "#1f1f1f", card: "#111111" };
const link = { color: C.accent, textDecoration: "none", borderBottom: `1px solid ${C.accent}40` };

const offerings = [
  { t: "Team meal programs", d: "Daily healthy meals for your employees, personalised by goal and dietary preference, delivered to the office or to homes." },
  { t: "Wellness as a benefit", d: "Offer FitFuel as a health benefit, with optional tracking and progress that supports a genuine wellness culture." },
  { t: "Flexible billing", d: "Consolidated monthly invoicing, GST-compliant, with simple onboarding for your team." },
  { t: "Tiered options", d: "Standard, Premium and Luxury tiers so each employee can choose the level that suits them." },
];

const benefits = [
  "Fewer sluggish afternoons and more steady energy across the workday",
  "A visible, practical investment in employee health and retention",
  "No kitchen or pantry logistics for you, we handle sourcing, cooking and delivery",
  "Personalised to each person, not a one-size-fits-all canteen menu",
];

export default function CorporatePage() {
  return (
    <main style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "120px 24px 96px" }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 13, color: C.accent, margin: "0 0 14px" }}>For Companies</p>
        <h1 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "clamp(34px,6vw,56px)", lineHeight: 1.04, margin: "0 0 18px", letterSpacing: "-0.025em" }}>
          Fuel your whole team<span style={{ color: C.accent }}>.</span>
        </h1>
        <p style={{ color: C.sub, fontSize: 17, lineHeight: 1.7, maxWidth: 640, margin: "0 0 56px" }}>
          A healthy team is a sharper team. Bring FitFuel's goal-based, freshly cooked meals to your workplace, personalised for every employee and handled end to end by us.
        </p>

        <h2 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 26, color: C.text, margin: "0 0 24px", letterSpacing: "-0.02em" }}>What we offer</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginBottom: 64 }}>
          {offerings.map((o) => (
            <div key={o.t} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 22px" }}>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: C.text, marginBottom: 7 }}>{o.t}</div>
              <p style={{ color: C.sub, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{o.d}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 26, color: C.text, margin: "0 0 24px", letterSpacing: "-0.02em" }}>Why companies choose FitFuel</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 64px" }}>
          {benefits.map((b) => (
            <li key={b} style={{ position: "relative", paddingLeft: 26, marginBottom: 13, color: C.sub, fontSize: 15.5, lineHeight: 1.6 }}>
              <span style={{ position: "absolute", left: 0, top: 1, color: C.accent }}>&mdash;</span>
              {b}
            </li>
          ))}
        </ul>

        <div style={{ background: "linear-gradient(145deg, #111, #0e0e0e)", border: `1px solid ${C.accent}33`, borderRadius: 18, padding: "36px 32px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 10 }}>Let us build a program for your team.</div>
          <p style={{ color: C.sub, fontSize: 15, margin: "0 0 22px" }}>Tell us your team size and goals and we will put together a proposal.</p>
          <a href="mailto:pranitborkar98@gmail.com?subject=FitFuel%20Corporate%20Enquiry" style={{ display: "inline-block", background: C.accent2, color: "#000", fontWeight: 800, fontSize: 14, padding: "13px 30px", borderRadius: 10, textDecoration: "none", letterSpacing: "0.04em" }}>ENQUIRE NOW</a>
        </div>

        <div style={{ marginTop: 36 }}><Link href="/" style={link}>&larr; Back to home</Link></div>
      </div>
    </main>
  );
}
