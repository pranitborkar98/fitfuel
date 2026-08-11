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
// CONSEQUENCE: next/font never ran, so --font-barlow-condensed and
// --font-archivo are not on the document. globals.css declares --ff-cond and
// --ff-body with 'Arial Narrow' / sans-serif fallbacks behind those variables,
// so importing it here degrades to a condensed stack rather than to Times. Do
// not "fix" that by hardcoding a family: the ban list in DESIGN.md §11 still
// applies to anything a user can actually see.
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
          display: "flex",
          alignItems: "center",
          padding: "120px clamp(18px,4vw,40px)",
        }}
      >
        <style>{`
          .geWrap { width: 100%; max-width: 1180px; margin: 0 auto; }
          .geTag {
            font-family: var(--font-mono), monospace; font-weight: 500; font-size: 12px;
            letter-spacing: .22em; text-transform: uppercase; color: #f87171;
            display: block; padding-bottom: 14px; border-bottom: 1px solid #232320;
          }
          .geH {
            font-family: var(--ff-cond); font-weight: 900; font-size: clamp(34px,8vw,6rem);
            text-transform: uppercase; letter-spacing: -.03em; line-height: .84;
            margin: 26px 0 16px; max-width: 14ch;
          }
          .geP {
            font-family: var(--ff-body); font-size: 15.5px; color: #9a9a94;
            line-height: 1.62; max-width: 46ch; margin: 0 0 30px;
          }
          .geRow { display: flex; gap: 14px; flex-wrap: wrap; }
          .geBtn {
            display: inline-flex; align-items: center; justify-content: center;
            font-family: var(--ff-cond); font-weight: 900; font-size: 15px;
            letter-spacing: .06em; text-transform: uppercase; text-decoration: none;
            padding: 15px 26px; min-height: 52px; border-radius: 0; cursor: pointer;
            transition: background .2s linear, color .2s linear, border-color .2s linear;
          }
          .geBtn.primary { background: #84cc16; color: #070707; border: 1px solid #84cc16; }
          .geBtn.primary:hover { background: #f7f7f5; border-color: #f7f7f5; }
          .geBtn.ghost { border: 1px solid #33332f; color: #f7f7f5; background: transparent; }
          .geBtn.ghost:hover { border-color: #84cc16; color: #84cc16; }
          .geBtn:focus-visible { outline: 2px solid #84cc16; outline-offset: 3px; }
          .geDigest {
            font-family: var(--font-mono), monospace; font-size: 12px; color: #85857e;
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
