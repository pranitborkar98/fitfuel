"use client";
// app/error.tsx — branded runtime error boundary.
//
// Same shape as not-found, and migrated for the same reason: an error boundary
// is shipped with every route, so its palette was on every page.
//
// MIGRATED 2026-08-21 (Decision #223), for exactly the reason the comment above
// already gave: an error boundary is shipped with EVERY route, so --ff-cond at
// 900, an UPPERCASE h1 at up to 96px and `border-radius: 0` were riding along on
// every migrated page. Same treatment as app/not-found.tsx.
//
// Red stays. It is the one non-lime value the system permits, because an error
// state is exactly the case where colour is carrying meaning rather than
// decorating. #f87171 clears AA on the page ground.
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <main
      className="fk"
      style={{
        minHeight: "100vh",
        background: "var(--fk-paper)",
        color: "var(--fk-ink)",
        display: "flex",
        alignItems: "center",
        padding: "120px clamp(18px,4vw,40px)",
      }}
    >
      <style>{`
        .erWrap { width: 100%; max-width: 1180px; margin: 0 auto; }
        .erTag {
          font-family: var(--font-archivo), system-ui, sans-serif;
          font-weight: 700; font-size: 11.5px; letter-spacing: .12em;
          text-transform: uppercase; color: #f87171;
          display: block; padding-bottom: 14px;
          border-bottom: 1px solid var(--fk-line);
        }
        /* Doubled: .fk h1 in app/_design/base.css is (0,1,1) and a single
           class is (0,1,0), so this would lose. See Decision #222.
           No backticks in here — this block is a template literal. */
        .erH.erH {
          font-family: var(--fk-display); font-weight: 600;
          font-size: clamp(2rem, 1.4rem + 2.4vw, 3.25rem);
          text-transform: none; letter-spacing: -.025em; line-height: 1.04;
          color: var(--fk-ink); margin: 26px 0 16px; max-width: 20ch;
        }
        .erP {
          font-family: var(--font-archivo), sans-serif; font-size: 15.5px;
          color: var(--fk-ink-2); line-height: 1.62; max-width: 46ch;
          margin: 0 0 30px;
        }
        .erRow { display: flex; gap: 14px; flex-wrap: wrap; }
        .erBtn {
          display: inline-flex; align-items: center; justify-content: center;
          font-family: var(--font-archivo), sans-serif; font-weight: 600;
          font-size: 15px; letter-spacing: 0; text-transform: none;
          text-decoration: none; padding: 15px 26px; min-height: 52px;
          border-radius: var(--fk-r); cursor: pointer;
          transition: background .2s linear, color .2s linear, border-color .2s linear;
        }
        .erBtn.primary {
          background: var(--fk-green); color: var(--fk-paper);
          border: 1px solid var(--fk-green);
        }
        .erBtn.primary:hover { background: var(--fk-ink); border-color: var(--fk-ink); }
        .erBtn.ghost {
          border: 1px solid var(--fk-line-2); color: var(--fk-ink);
          background: transparent;
        }
        .erBtn.ghost:hover { border-color: var(--fk-green); color: var(--fk-green); }
        .erBtn:focus-visible { outline: 2px solid var(--fk-green); outline-offset: 3px; }
        @media (prefers-reduced-motion: reduce) { .erBtn { transition: none; } }
        .erDigest {
          font-family: var(--font-mono), ui-monospace, monospace; font-size: 12px;
          color: var(--fk-ink-3); letter-spacing: .1em; margin-top: 30px;
          padding-top: 14px; border-top: 1px solid var(--fk-line);
        }
      `}</style>
      <div className="erWrap">
        <span className="erTag">FitFuel / error</span>
        <h1 className="erH">Something broke</h1>
        <p className="erP">
          A glitch on our end, not yours. Try again, and if it keeps happening, head back home.
        </p>
        <div className="erRow">
          <button onClick={() => reset()} className="erBtn primary">
            Try again
          </button>
          <Link href="/" className="erBtn ghost">
            Home
          </Link>
        </div>
        {error?.digest && <div className="erDigest">Ref {error.digest}</div>}
      </div>
    </main>
  );
}
