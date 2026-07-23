"use client";
// app/error.tsx — WS-4 / F7. Branded runtime error boundary.
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <main style={{ minHeight: "100vh", background: "#080808", color: "#f4f3ee", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
      <style>{`

        .er-tag{ font-family:var(--ff-cond); font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:#f87171; }
        .er-h{ font-family:var(--ff-cond); font-weight:800; font-size:clamp(34px,7vw,56px); text-transform:uppercase; letter-spacing:.5px; margin:12px 0 8px; }
        .er-p{ font-family:var(--ff-cond); font-size:13px; color:#85857e; line-height:1.6; max-width:400px; margin:0 auto 28px; }
        .er-row{ display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
        .er-btn{ font-family:var(--ff-cond); font-size:12px; letter-spacing:.1em; text-transform:uppercase; padding:13px 22px; border-radius:5px; text-decoration:none; cursor:pointer; border:0; transition:transform .2s; }
        .er-btn.primary{ background:#a3e635; color:#0a0a0a; font-weight:700; }
        .er-btn.ghost{ border:1px solid #262626; color:#c9c3ac; background:transparent; }
        .er-btn:hover{ transform:translateY(-2px); }
        .er-digest{ font-family:var(--ff-cond); font-size:12px; color:#3a3a35; margin-top:22px; }
      `}</style>
      <div>
        <span className="er-tag">FitFuel // Error</span>
        <h1 className="er-h">Something broke</h1>
        <p className="er-p">A glitch on our end, not yours. Try again, and if it keeps happening, head back home.</p>
        <div className="er-row">
          <button onClick={() => reset()} className="er-btn primary">Try again</button>
          <Link href="/" className="er-btn ghost">Home</Link>
        </div>
        {error?.digest && <div className="er-digest">ref: {error.digest}</div>}
      </div>
    </main>
  );
}
