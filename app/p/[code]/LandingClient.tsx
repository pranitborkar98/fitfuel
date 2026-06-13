"use client";

// app/p/[code]/LandingClient.tsx
// Phase 17B (FIX) — branded landing for any partner type.
// Type-specific hero + shared CTA → /plans?ref=CODE.
// Sets ff_ref cookie CLIENT-SIDE on mount (first-touch — only if not already set).
// Server Components in Next 16 cannot write cookies, so this is the cookie path.

import Link from "next/link";
import { useEffect } from "react";

const COOKIE_NAME = "ff_ref";
const COOKIE_DAYS = 30;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&") + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

type View = {
  kind: "PARTNER" | "P2P";
  type: string;
  name: string;
  code: string;
  bio?: string | null;
  specialty?: string | null;
  profilePhotoUrl?: string | null;
  socialHandle?: string | null;
  gymAddress?: string | null;
  gymManagerName?: string | null;
  qualification?: string | null;
  clinicName?: string | null;
  hospitalAffiliation?: string | null;
  companyLogoUrl?: string | null;
  societyAddress?: string | null;
  treasurerContact?: string | null;
  refereeDiscountRs: number;
};

const T = {
  bg: "#080808",
  card: "#101010",
  border: "#1f1f1f",
  text: "#f5f5f4",
  dim: "#888",
  accent: "#a3e635",
  accent2: "#84cc16",
};

const RUPEE = "\u20B9";

export default function LandingClient({ view }: { view: View }) {
  // First-touch attribution: only write if not already set.
  useEffect(() => {
    const existing = readCookie(COOKIE_NAME);
    if (!existing && view?.code) {
      writeCookie(COOKIE_NAME, view.code, COOKIE_DAYS);
    }
  }, [view?.code]);

  const headline = headlineFor(view);
  const sub = subFor(view);
  const offer = view.refereeDiscountRs > 0
    ? `${RUPEE}${view.refereeDiscountRs} off your first plan`
    : `Special welcome via ${view.name}`;

  return (
    <div style={{ background: T.bg, minHeight: "calc(100vh - 80px)", color: T.text, padding: "72px 16px 80px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>

        {/* Ribbon */}
        <div style={{ display: "inline-block", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: T.accent, fontWeight: 700, marginBottom: 20, padding: "6px 12px", border: `1px solid ${T.accent2}`, borderRadius: 99, background: "rgba(132,204,22,0.08)" }}>
          You're invited
        </div>

        {/* Hero (type-specific) */}
        <Hero view={view} />

        {/* Offer card */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, marginTop: 28 }}>
          <div style={{ fontSize: 12, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your welcome offer</div>
          <div style={{ fontFamily: '"Syne", system-ui', fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>{offer}</div>
          <div style={{ color: T.dim, fontSize: 14, marginTop: 8 }}>
            Applied automatically at checkout. Valid on your first FitFuel meal plan or digital plan.
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
            <Link href={`/plans?ref=${encodeURIComponent(view.code)}`}
              style={{ background: T.accent, color: "#000", fontWeight: 800, fontSize: 14, padding: "14px 26px", borderRadius: 8, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              See plans →
            </Link>
            <Link href={`/plans/digital?ref=${encodeURIComponent(view.code)}`}
              style={{ background: "transparent", color: T.text, fontWeight: 700, fontSize: 14, padding: "13px 22px", borderRadius: 8, textDecoration: "none", border: `1px solid ${T.border}`, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Digital plans
            </Link>
          </div>

          <div style={{ marginTop: 18, fontSize: 11, color: T.dim }}>
            Referral code: <strong style={{ color: T.text, fontFamily: 'ui-monospace, monospace' }}>{view.code}</strong>
          </div>
        </div>

        {/* What you get strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 24 }}>
          <Mini title="Real meals delivered" body="Chef-built, macro-tracked, Pune-wide morning delivery." />
          <Mini title="Auto-logged macros" body="Every meal logs to your dashboard the moment it's delivered." />
          <Mini title="Coach-grade tracking" body="Weight, workouts, body metrics, consistency — one place." />
        </div>

        <div style={{ marginTop: 32, fontSize: 12, color: T.dim, textAlign: "center" }}>
          Not affiliated with {view.name}? <Link href="/plans" style={{ color: T.accent }}>Browse plans without the offer →</Link>
        </div>
      </div>
    </div>
  );
}

function headlineFor(v: View): string {
  switch (v.type) {
    case "GYM":        return `Train at ${v.name}? Eat like you mean it.`;
    case "TRAINER":    return `${v.name} eats this. So should you.`;
    case "INFLUENCER": return `${v.name} sent you. Welcome.`;
    case "DIETICIAN":  return `${v.name}'s recommended meal plans.`;
    case "DOCTOR":     return `As recommended by ${v.name}.`;
    case "CORPORATE":  return `An exclusive benefit from ${v.name}.`;
    case "RESIDENCE":  return `A welcome offer for ${v.name} residents.`;
    case "CUSTOMER":
    default:          return `${v.name} thinks you'll love this.`;
  }
}

function subFor(v: View): string {
  if (v.type === "GYM") return "FitFuel + your training program = the actual stack that works.";
  if (v.type === "TRAINER" || v.type === "INFLUENCER") return v.bio || "Real food, real numbers, no nonsense.";
  if (v.type === "DIETICIAN" || v.type === "DOCTOR") return v.qualification || "Clinically-aligned meal plans, delivered.";
  if (v.type === "CORPORATE") return "Employee wellness, done right.";
  if (v.type === "RESIDENCE") return "Fresh meals, delivered to your gate.";
  return "A friend who's been eating better — and wants you to too.";
}

function Hero({ view }: { view: View }) {
  const sub = subFor(view);

  // Image partner types
  const showPhoto = !!view.profilePhotoUrl && ["TRAINER", "INFLUENCER", "DIETICIAN", "DOCTOR"].includes(view.type);
  const showLogo = !!view.companyLogoUrl && view.type === "CORPORATE";

  return (
    <div style={{ display: "grid", gridTemplateColumns: showPhoto || showLogo ? "120px 1fr" : "1fr", gap: 20, alignItems: "center" }}>
      {showPhoto && (
        <img src={view.profilePhotoUrl as string} alt={view.name}
          style={{ width: 120, height: 120, borderRadius: 16, objectFit: "cover", border: `1px solid ${T.border}` }} />
      )}
      {showLogo && (
        <img src={view.companyLogoUrl as string} alt={view.name}
          style={{ width: 120, height: 120, borderRadius: 16, objectFit: "contain", background: "#fff", padding: 12, border: `1px solid ${T.border}` }} />
      )}

      <div>
        <h1 style={{ fontFamily: '"Syne", system-ui', fontSize: 38, fontWeight: 800, lineHeight: 1.05, margin: 0 }}>
          {headlineFor(view)}
        </h1>
        <div style={{ color: T.dim, fontSize: 15, marginTop: 12, lineHeight: 1.5 }}>{sub}</div>

        {/* Type-specific meta */}
        <div style={{ marginTop: 14, fontSize: 12, color: T.dim, display: "flex", flexWrap: "wrap", gap: 10 }}>
          {view.specialty && <MetaChip>{view.specialty}</MetaChip>}
          {view.qualification && <MetaChip>{view.qualification}</MetaChip>}
          {view.clinicName && <MetaChip>{view.clinicName}</MetaChip>}
          {view.hospitalAffiliation && <MetaChip>{view.hospitalAffiliation}</MetaChip>}
          {view.gymAddress && <MetaChip>{capitalize(view.gymAddress)}</MetaChip>}
          {view.societyAddress && <MetaChip>{capitalize(view.societyAddress)}</MetaChip>}
          {view.socialHandle && <MetaChip>{view.socialHandle}</MetaChip>}
        </div>
      </div>
    </div>
  );
}

function MetaChip({ children }: { children: any }) {
  return (
    <span style={{ background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 99, padding: "4px 10px", fontSize: 11, color: T.dim, letterSpacing: "0.02em" }}>
      {children}
    </span>
  );
}

function capitalize(s: string) {
  if (!s) return s;
  return s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function Mini({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}