// app/not-found.tsx — branded 404.
//
// This file matters more than its traffic suggests: Next ships the not-found
// boundary in the RSC payload of every route, so whatever it sets is being
// served on top of every page on the site, including the migrated ones.
//
// MIGRATED 2026-08-21 (Decision #222). It was the last surface still in the
// rejected register and it had all of it at once: --ff-cond at weight 900,
// an UPPERCASE h1, `border-radius: 0` stated explicitly on the buttons, and
// eleven hard-coded hex values that no palette change would ever reach. Now
// Newsreader in sentence case on the --fk-* tokens, with the radius scale.
//
// THE 404 STAYS A LARGE FIGURE, but mono rather than display: numbers are set
// in mono everywhere else on this site, and this is a number.
import Link from "next/link";

export default function NotFound() {
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
        .nfWrap { width: 100%; max-width: 1180px; margin: 0 auto; }
        .nfTag {
          font-family: var(--font-archivo), system-ui, sans-serif;
          font-weight: 700; font-size: 11.5px; letter-spacing: .12em;
          text-transform: uppercase; color: var(--fk-ink-3);
          display: block; padding-bottom: 14px;
          border-bottom: 1px solid var(--fk-line);
        }
        .nfCode {
          font-family: var(--font-mono), ui-monospace, monospace;
          font-weight: 700; font-size: clamp(72px, 14vw, 8rem);
          line-height: 1; letter-spacing: -.03em; color: var(--fk-green);
          margin: 30px 0 0; font-variant-numeric: tabular-nums;
        }
        /* .fk h1 in app/_design/base.css is (0,1,1); a single class is (0,1,0)
           and would lose. Doubled, same as .h1 in app/_ui/page.module.css. */
        .nfH.nfH {
          font-family: var(--fk-display); font-weight: 600;
          font-size: clamp(2rem, 1.4rem + 2.4vw, 3.25rem);
          text-transform: none; letter-spacing: -.025em; line-height: 1.04;
          color: var(--fk-ink); margin: 14px 0 16px;
        }
        .nfP {
          font-family: var(--font-archivo), sans-serif; font-size: 15.5px;
          color: var(--fk-ink-2); line-height: 1.62; max-width: 46ch;
          margin: 0 0 30px;
        }
        .nfRow { display: flex; gap: 14px; flex-wrap: wrap; }
        .nfBtn {
          display: inline-flex; align-items: center; justify-content: center;
          font-family: var(--font-archivo), sans-serif; font-weight: 600;
          font-size: 15px; letter-spacing: 0; text-transform: none;
          text-decoration: none; padding: 15px 26px; min-height: 52px;
          border-radius: var(--fk-r);
          transition: background .2s linear, color .2s linear, border-color .2s linear;
        }
        .nfBtn.primary {
          background: var(--fk-green); color: var(--fk-paper);
          border: 1px solid var(--fk-green);
        }
        .nfBtn.primary:hover { background: var(--fk-ink); border-color: var(--fk-ink); }
        .nfBtn.ghost { border: 1px solid var(--fk-line-2); color: var(--fk-ink); }
        .nfBtn.ghost:hover { border-color: var(--fk-green); color: var(--fk-green); }
        .nfBtn:focus-visible { outline: 2px solid var(--fk-green); outline-offset: 3px; }
        @media (prefers-reduced-motion: reduce) { .nfBtn { transition: none; } }
      `}</style>
      <div className="nfWrap">
        <span className="nfTag">FitFuel / not found</span>
        <p className="nfCode">404</p>
        <h1 className="nfH">Off the menu</h1>
        <p className="nfP">
          This page is not on the plan, but your next meal is. Here is the way back.
        </p>
        <div className="nfRow">
          <Link href="/plans" className="nfBtn primary">
            Browse plans
          </Link>
          <Link href="/" className="nfBtn ghost">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
