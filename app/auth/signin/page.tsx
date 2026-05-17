"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Zap } from "lucide-react";
import Link from "next/link";

const T = {
  bg:         "#0a0a0a",
  card:       "#111111",
  cardBorder: "#1f1f1f",
  accent:     "#84cc16",
  textPrimary:"#f9fafb",
  textSecond: "#a3a3a3",
  textMuted:  "#737373",
};

function SignInInner() {
  const params      = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const error       = params.get("error");

  return (
    <div style={{
      background: T.bg, minHeight: "100vh", color: T.textPrimary,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "100px 20px 60px",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{
        position: "fixed", top: "30%", left: "50%", transform: "translateX(-50%)",
        width: 500, height: 500,
        background: "radial-gradient(circle, rgba(132,204,22,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        background: T.card, border: `1px solid ${T.cardBorder}`,
        borderRadius: 24, padding: "44px 40px", width: "100%", maxWidth: 400,
        position: "relative", overflow: "hidden",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.accent}, transparent)` }} />

        {/* Logo — matches Navbar exactly */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 11, textDecoration: "none", marginBottom: 36 }}>
          <div style={{
            width: 36, height: 36, background: T.accent, borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(132,204,22,0.35)",
          }}>
            <Zap style={{ width: 19, height: 19, color: "#000" }} fill="#000" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.025em", color: T.textPrimary }}>
            Fit<span style={{ color: T.accent }}>Fuel</span>
          </span>
        </Link>

        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 36, fontWeight: 900, textTransform: "uppercase",
          lineHeight: 1, letterSpacing: "-0.01em",
          color: T.textPrimary, marginBottom: 8,
        }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 14, color: T.textSecond, marginBottom: 32, lineHeight: 1.6 }}>
          Sign in to track your meals, orders, and fitness progress.
        </p>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 10, padding: "12px 16px", marginBottom: 24,
            fontSize: 13, color: "#fca5a5",
          }}>
            {error === "OAuthAccountNotLinked"
              ? "This email is already linked to another sign-in method."
              : "Something went wrong. Please try again."}
          </div>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl })}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            background: "#ffffff", color: "#1a1a1a", fontWeight: 700, fontSize: 15,
            padding: "14px 0", borderRadius: 12, border: "none", cursor: "pointer",
            boxShadow: "0 2px 12px rgba(0,0,0,0.3)", transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)"; }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
          <div style={{ flex: 1, height: 1, background: T.cardBorder }} />
          <span style={{ fontSize: 12, color: T.textMuted }}>or</span>
          <div style={{ flex: 1, height: 1, background: T.cardBorder }} />
        </div>

        <a
          href="https://wa.me/919579738811"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "transparent", border: `1px solid ${T.cardBorder}`,
            borderRadius: 12, padding: "13px 0",
            fontSize: 14, fontWeight: 600, color: T.textSecond,
            textDecoration: "none", transition: "all 0.2s", boxSizing: "border-box",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(132,204,22,0.3)"; (e.currentTarget as HTMLElement).style.color = T.textPrimary; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.cardBorder; (e.currentTarget as HTMLElement).style.color = T.textSecond; }}
        >
          💬 Order via WhatsApp instead
        </a>

        <p style={{ fontSize: 12, color: T.textMuted, textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          By signing in, you agree to FitFuel's terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#a3a3a3" }}>
        Loading...
      </div>
    }>
      <SignInInner />
    </Suspense>
  );
}