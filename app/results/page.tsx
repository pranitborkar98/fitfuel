import Link from "next/link";
import { type ReactNode } from "react";

export const metadata = {
  title: "Results | FitFuel",
  description: "How FitFuel measures real progress, and an honest invitation to become one of our first transformation stories.",
};

const C = { bg: "#080808", accent: "#a3e635", accent2: "#84cc16", text: "#ffffff", sub: "#a3a3a3", muted: "#737373", border: "#1f1f1f", card: "#111111" };
const link = { color: C.accent, textDecoration: "none", borderBottom: `1px solid ${C.accent}40` };

const measures = [
  { t: "Weight trend", d: "Not a single weigh-in, but the line over weeks, so a bad day never looks like failure." },
  { t: "Consistency score", d: "A weekly 0 to 100 score from meals logged, workouts done, water and weigh-ins." },
  { t: "Macro adherence", d: "How closely your protein, carbs and fat tracked to your personalised target." },
  { t: "Body metrics", d: "Weight, body composition and measurements over time, beyond just the scale." },
];

function PlaceholderStory() {
  return (
    <div style={{ background: "#0e0e0e", border: `1px dashed ${C.border}`, borderRadius: 16, padding: "26px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#141414", border: `1px solid ${C.border}` }} />
        <div>
          <div style={{ height: 11, width: 110, background: "#1a1a1a", borderRadius: 4, marginBottom: 7 }} />
          <div style={{ height: 9, width: 70, background: "#161616", borderRadius: 4 }} />
        </div>
      </div>
      <div style={{ height: 9, width: "92%", background: "#161616", borderRadius: 4 }} />
      <div style={{ height: 9, width: "78%", background: "#161616", borderRadius: 4 }} />
      <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>Real story slot, coming soon</div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <main style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "120px 24px 96px" }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 13, color: C.accent, margin: "0 0 14px" }}>Results</p>
        <h1 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "clamp(34px,6vw,56px)", lineHeight: 1.04, margin: "0 0 18px", letterSpacing: "-0.025em" }}>
          Real progress, measured honestly<span style={{ color: C.accent }}>.</span>
        </h1>
        <p style={{ color: C.sub, fontSize: 17, lineHeight: 1.7, maxWidth: 660, margin: "0 0 40px" }}>
          We are just getting started, and we would rather show you nothing than show you stock photos and invented numbers. Here is how FitFuel measures progress, and an open invitation to be one of the first real stories on this page.
        </p>

        <div style={{ background: "rgba(132,204,22,0.06)", border: `1px solid ${C.accent}33`, borderRadius: 14, padding: "20px 22px", marginBottom: 64 }}>
          <p style={{ color: C.sub, fontSize: 15, lineHeight: 1.7, margin: 0 }}>
            <strong style={{ color: C.text }}>Our promise:</strong> every testimonial we ever publish here will be from a real FitFuel member, with their consent. No fabricated results, no rented faces.
          </p>
        </div>

        <h2 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 26, color: C.text, margin: "0 0 24px", letterSpacing: "-0.02em" }}>What we actually track</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18, marginBottom: 72 }}>
          {measures.map((m) => (
            <div key={m.t} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 22px" }}>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: C.text, marginBottom: 7 }}>{m.t}</div>
              <p style={{ color: C.sub, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{m.d}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 26, color: C.text, margin: "0 0 24px", letterSpacing: "-0.02em" }}>Transformation stories</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18, marginBottom: 64 }}>
          <PlaceholderStory />
          <PlaceholderStory />
          <PlaceholderStory />
        </div>

        <div style={{ background: "linear-gradient(145deg, #111, #0e0e0e)", border: `1px solid ${C.accent}33`, borderRadius: 18, padding: "36px 32px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Syne','Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 10 }}>Be one of the first.</div>
          <p style={{ color: C.sub, fontSize: 15, margin: "0 0 22px" }}>Start your plan, track your weeks, and your real numbers could be the story on this page.</p>
          <Link href="/plans/weight-loss-veg" style={{ display: "inline-block", background: C.accent2, color: "#000", fontWeight: 800, fontSize: 14, padding: "13px 30px", borderRadius: 10, textDecoration: "none", letterSpacing: "0.04em" }}>START YOUR PLAN</Link>
        </div>

        <div style={{ marginTop: 36 }}><Link href="/" style={link}>&larr; Back to home</Link></div>
      </div>
    </main>
  );
}
