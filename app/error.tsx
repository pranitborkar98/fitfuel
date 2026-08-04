"use client";
// app/error.tsx — branded runtime error boundary.
//
// Same shape as not-found, and migrated for the same reason: an error boundary
// is shipped with every route, so its palette was on every page.
//
// Red stays. It is the one non-lime value the system permits, because an error
// state is exactly the case where colour is carrying meaning rather than
// decorating. #f87171 clears AA on the page ground; the old #3a3a35 digest line
// did not clear anything and is now on the ramp.
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
      style={{
        minHeight: "100vh",
        background: "#070707",
        color: "#f7f7f5",
        display: "flex",
        alignItems: "center",
        padding: "120px clamp(18px,4vw,40px)",
      }}
    >
      <style>{`
        .erWrap { width: 100%; max-width: 1180px; margin: 0 auto; }
        .erTag {
          font-family: var(--font-mono), monospace; font-weight: 500; font-size: 12px;
          letter-spacing: .22em; text-transform: uppercase; color: #f87171;
          display: block; padding-bottom: 14px; border-bottom: 1px solid #232320;
        }
        .erH {
          font-family: var(--ff-cond); font-weight: 900; font-size: clamp(34px,8vw,6rem);
          text-transform: uppercase; letter-spacing: -.03em; line-height: .84;
          margin: 26px 0 16px; max-width: 14ch;
        }
        .erP {
          font-family: var(--font-archivo), sans-serif; font-size: 15.5px; color: #9a9a94;
          line-height: 1.62; max-width: 46ch; margin: 0 0 30px;
        }
        .erRow { display: flex; gap: 14px; flex-wrap: wrap; }
        .erBtn {
          display: inline-flex; align-items: center; justify-content: center;
          font-family: var(--ff-cond); font-weight: 900; font-size: 15px;
          letter-spacing: .06em; text-transform: uppercase; text-decoration: none;
          padding: 15px 26px; min-height: 52px; border-radius: 0; cursor: pointer;
          transition: background .2s linear, color .2s linear, border-color .2s linear;
        }
        .erBtn.primary { background: #84cc16; color: #070707; border: 1px solid #84cc16; }
        .erBtn.primary:hover { background: #f7f7f5; border-color: #f7f7f5; }
        .erBtn.ghost { border: 1px solid #33332f; color: #f7f7f5; background: transparent; }
        .erBtn.ghost:hover { border-color: #84cc16; color: #84cc16; }
        .erBtn:focus-visible { outline: 2px solid #84cc16; outline-offset: 3px; }
        .erDigest {
          font-family: var(--font-mono), monospace; font-size: 12px; color: #85857e;
          letter-spacing: .1em; margin-top: 30px; padding-top: 14px;
          border-top: 1px solid #232320;
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
