"use client";

// app/auth/signin/page.tsx
//
// Sign in, on the Instrument System.
//
// The page set `fontFamily: "system-ui, sans-serif"` on its root, which is on
// the banned-faces list by name and meant the whole sign-in screen rendered in
// a different typeface from the rest of the site. It also had a 500px
// radial-gradient lime orb behind a centred radius-24 card with a 60px drop
// shadow, a lime-to-transparent gradient bar welded to the top of it, a 16px
// lime glow under the logo mark, translateY lifts, and radius 9/10/12/24.
//
// Two content fixes:
//   - The legal line said "you agree to FitFuel's terms of service and privacy
//     policy" with nothing linked. Both are real pages; they are links now.
//   - The WhatsApp fallback led with a speech-balloon emoji.
//
// The Google button keeps its white ground and the official mark: those are
// Google's own sign-in branding requirements, and they outrank the house style
// the same way the FSSAI mark does on the plan page. Corners are squared,
// which their guidelines permit, and the drop shadow is gone.

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Zap } from "lucide-react";
import Link from "next/link";

import { waLink } from "@/lib/site";
import { Shell, Wrap, A } from "@/app/_ui/Page";
import { k } from "@/app/_ui/Kit";
import { INK, MUTE, body, display, label } from "@/app/_ui/theme";

function SignInInner() {
  const params = useSearchParams();

  // Was defaulting to "/" — sends to /dashboard after login.
  const callbackUrl = params.get("callbackUrl") || "/dashboard";
  const error = params.get("error");

  return (
    <Shell>
      <Wrap style={{ paddingTop: "clamp(110px,15vw,180px)", paddingBottom: "clamp(60px,9vw,120px)" }}>
        {/* Flush left, in a measured column. Not a centred card on a glow. */}
        <div style={{ maxWidth: 460 }}>
          <Link
            href="/"
            style={{ display: "inline-flex", alignItems: "center", gap: 11, textDecoration: "none", marginBottom: 34 }}
          >
            <span
              style={{
                width: 34,
                height: 34,
                background: "#84cc16",
                borderRadius: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap style={{ width: 18, height: 18, color: "#070707" }} fill="#070707" />
            </span>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.025em", color: INK }}>
              Fit<span style={{ color: "#84cc16" }}>Fuel</span>
            </span>
          </Link>

          <span style={label()}>Sign in</span>
          <h1 style={{ ...display("clamp(2.4rem,7vw,4.4rem)"), margin: "16px 0 16px" }}>
            Welcome back
          </h1>
          <p style={{ ...body(16), marginBottom: 34 }}>
            Sign in to track your meals, orders and progress.
          </p>

          {error && (
            <div
              role="alert"
              style={{
                background: "#050504",
                border: "1px solid #232320",
                borderLeft: "2px solid #f87171",
                padding: "13px 16px",
                marginBottom: 24,
              }}
            >
              <p style={{ ...body(14), color: INK }}>
                {error === "OAuthAccountNotLinked"
                  ? "This email is already linked to another sign-in method."
                  : "Something went wrong. Please try again."}
              </p>
            </div>
          )}

          {/* Google's own branding: white ground, official mark. Squared, and
              without the drop shadow. */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              background: "#ffffff",
              color: "#070707",
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 600,
              fontSize: 15,
              padding: "15px 0",
              minHeight: 52,
              borderRadius: 0,
              border: "1px solid #ffffff",
              cursor: "pointer",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "22px 0" }}>
            <span style={{ flex: 1, height: 1, background: "#232320" }} />
            <span style={label()}>or</span>
            <span style={{ flex: 1, height: 1, background: "#232320" }} />
          </div>

          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={k.ghost}
            style={{ width: "100%", boxSizing: "border-box" }}
          >
            Order via WhatsApp instead
          </a>

          <p style={{ ...body(13), color: MUTE, marginTop: 26 }}>
            By signing in you agree to our <A href="/terms">Terms and Conditions</A> and{" "}
            <A href="/privacy">Privacy Policy</A>.
          </p>
        </div>
      </Wrap>
    </Shell>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <Shell>
          <Wrap style={{ paddingTop: 180 }}>
            <span style={label()}>Loading</span>
          </Wrap>
        </Shell>
      }
    >
      <SignInInner />
    </Suspense>
  );
}
