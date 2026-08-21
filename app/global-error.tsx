"use client";
// app/global-error.tsx — the boundary of last resort.
//
// WHY THIS EXISTS SEPARATELY FROM app/error.tsx. error.tsx is rendered *inside*
// the root layout, so it can only catch a throw from a page or a nested layout.
// If app/layout.tsx itself throws, there is no layout left to render the error
// into, and React unwinds past error.tsx to Next's own unstyled default screen.
// This file replaces that screen. It is the only place in the app permitted to
// render <html> and <body>, because the real ones never mounted.
//
// CONSEQUENCE: next/font never ran, so --font-newsreader and --font-archivo are
// NOT on the document, and every --fk-*/--ff-* family token is defined in terms
// of them. `var(--font-newsreader), Georgia, serif` does not degrade gracefully:
// an undefined custom property inside var() with no fallback makes the whole
// declaration invalid at computed-value time, so the font-family is dropped
// entirely rather than falling through to Georgia.
//
// THIS FILE THEREFORE NAMES ITS FAMILIES LITERALLY, and it is the only file on
// the site allowed to. Everywhere else a hardcoded family would be wrong; here a
// token is the thing that fails. Georgia is the closest widely-installed serif
// to Newsreader, so this screen still reads as FitFuel with no webfont at all.
//
// MIGRATED 2026-08-21 (Decision #223). Was --ff-cond at 900, UPPERCASE, up to
// 96px, radius 0 — the rejected register on the one screen a customer sees when
// everything else has already failed.
//
// Red is deliberate, and matches error.tsx for the same reason given there:
// this is the case where colour carries meaning instead of decorating.
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Nothing else survived to log this. Keep it unconditional.
    console.error("[app global error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          background: "#070707",
          color: "#f7f7f5",
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          display: "flex",
          alignItems: "center",
          padding: "120px clamp(18px,4vw,40px)",
        }}
      >
        <style>{`
          .geWrap { width: 100%; max-width: 1180px; margin: 0 auto; }
          .geTag {
            font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
            font-weight: 700; font-size: 11.5px; letter-spacing: .12em;
            text-transform: uppercase; color: #f87171;
            display: block; padding-bottom: 14px; border-bottom: 1px solid #232320;
          }
          .geH {
            font-family: Georgia, "Times New Roman", serif; font-weight: 600;
            font-size: clamp(2rem, 1.4rem + 2.4vw, 3.25rem);
            text-transform: none; letter-spacing: -.025em; line-height: 1.04;
            color: #f7f7f5; margin: 26px 0 16px; max-width: 20ch;
          }
          .geP {
            font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
            font-size: 15.5px; color: #9a9a94; line-height: 1.62;
            max-width: 46ch; margin: 0 0 30px;
          }
          .geRow { display: flex; gap: 14px; flex-wrap: wrap; }
          .geBtn {
            display: inline-flex; align-items: center; justify-content: center;
            font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
            font-weight: 600; font-size: 15px; letter-spacing: 0;
            text-transform: none; text-decoration: none;
            padding: 15px 26px; min-height: 52px; border-radius: 8px; cursor: pointer;
            transition: background .2s linear, color .2s linear, border-color .2s linear;
          }
          .geBtn.primary { background: #84cc16; color: #070707; border: 1px solid #84cc16; }
          .geBtn.primary:hover { background: #f7f7f5; border-color: #f7f7f5; }
          .geBtn.ghost { border: 1px solid #33332f; color: #f7f7f5; background: transparent; }
          .geBtn.ghost:hover { border-color: #84cc16; color: #84cc16; }
          .geBtn:focus-visible { outline: 2px solid #84cc16; outline-offset: 3px; }
          .geDigest {
            font-family: ui-monospace, "Cascadia Mono", Consolas, monospace;
            font-size: 12px; color: #85857e;
            letter-spacing: .1em; margin-top: 30px; padding-top: 14px;
            border-top: 1px solid #232320;
          }
          @media (prefers-reduced-motion: reduce) { .geBtn { transition: none; } }
        `}</style>
        <main className="geWrap">
          <span className="geTag">FitFuel / error</span>
          <h1 className="geH">Something broke</h1>
          <p className="geP">
            A glitch on our end, not yours. Try again, and if it keeps happening, head back home.
          </p>
          <div className="geRow">
            <button onClick={() => reset()} className="geBtn primary">
              Try again
            </button>
            {/* Deliberately an <a>, not next/link: the root layout threw, so
                the router is part of what failed and a client-side navigation
                may never resolve. A full document load is the reliable way out. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="geBtn ghost">
              Home
            </a>
          </div>
          {error?.digest && <div className="geDigest">Ref {error.digest}</div>}
        </main>
      </body>
    </html>
  );
}
