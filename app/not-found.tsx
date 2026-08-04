// app/not-found.tsx — branded 404.
//
// This file mattered more than its traffic suggests: Next ships the not-found
// boundary in the RSC payload of every route, so its #080808 ground, #a3e635
// numerals and radius-5 buttons were being served on top of every page on the
// site, including the ones already migrated.
//
// Rebuilt flush left on the system. The 404 is set as a display figure, which
// is the one place on this site a number is allowed to be that large.
import Link from "next/link";

export default function NotFound() {
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
        .nfWrap { width: 100%; max-width: 1180px; margin: 0 auto; }
        .nfTag {
          font-family: var(--font-mono), monospace; font-weight: 500; font-size: 12px;
          letter-spacing: .22em; text-transform: uppercase; color: #85857e;
          display: block; padding-bottom: 14px; border-bottom: 1px solid #232320;
        }
        .nfCode {
          font-family: var(--ff-cond); font-weight: 900; font-size: clamp(96px,24vw,15rem);
          line-height: .82; letter-spacing: -.04em; color: #f7f7f5; margin: 26px 0 0;
          font-variant-numeric: tabular-nums;
        }
        .nfH {
          font-family: var(--ff-cond); font-weight: 900; font-size: clamp(28px,5vw,3rem);
          text-transform: uppercase; letter-spacing: -.02em; line-height: .9; margin: 10px 0 14px;
        }
        .nfP {
          font-family: var(--font-archivo), sans-serif; font-size: 15.5px; color: #9a9a94;
          line-height: 1.62; max-width: 46ch; margin: 0 0 30px;
        }
        .nfRow { display: flex; gap: 14px; flex-wrap: wrap; }
        .nfBtn {
          display: inline-flex; align-items: center; justify-content: center;
          font-family: var(--ff-cond); font-weight: 900; font-size: 15px;
          letter-spacing: .06em; text-transform: uppercase; text-decoration: none;
          padding: 15px 26px; min-height: 52px; border-radius: 0;
          transition: background .2s linear, color .2s linear, border-color .2s linear;
        }
        .nfBtn.primary { background: #84cc16; color: #070707; border: 1px solid #84cc16; }
        .nfBtn.primary:hover { background: #f7f7f5; border-color: #f7f7f5; }
        .nfBtn.ghost { border: 1px solid #33332f; color: #f7f7f5; }
        .nfBtn.ghost:hover { border-color: #84cc16; color: #84cc16; }
        .nfBtn:focus-visible { outline: 2px solid #84cc16; outline-offset: 3px; }
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
