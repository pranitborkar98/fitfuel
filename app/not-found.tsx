// app/not-found.tsx — WS-4 / F7. Branded 404.
import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", background: "#080808", color: "#f4f3ee", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Space+Mono:wght@400;700&display=swap');
        .nf-code{ font-family:'Barlow Condensed',sans-serif; font-weight:800; font-size:clamp(96px,22vw,200px); line-height:.82; letter-spacing:2px; color:#a3e635; margin:0; }
        .nf-h{ font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:clamp(26px,5vw,38px); text-transform:uppercase; letter-spacing:.5px; margin:14px 0 8px; }
        .nf-p{ font-family:'Space Mono',monospace; font-size:13px; color:#8d8d87; line-height:1.6; max-width:380px; margin:0 auto 28px; }
        .nf-row{ display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
        .nf-btn{ font-family:'Space Mono',monospace; font-size:11.5px; letter-spacing:.1em; text-transform:uppercase; padding:13px 22px; border-radius:5px; text-decoration:none; transition:transform .2s; }
        .nf-btn.primary{ background:#a3e635; color:#0a0a0a; font-weight:700; }
        .nf-btn.ghost{ border:1px solid #262626; color:#c9c3ac; }
        .nf-btn:hover{ transform:translateY(-2px); }
        .nf-tag{ font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:#56564f; }
      `}</style>
      <div>
        <span className="nf-tag">FitFuel // 404</span>
        <p className="nf-code">404</p>
        <h1 className="nf-h">Off the menu</h1>
        <p className="nf-p">This page isn&apos;t on the plan — but your next meal is. Let&apos;s get you back on track.</p>
        <div className="nf-row">
          <Link href="/" className="nf-btn primary">Home</Link>
          <Link href="/plans" className="nf-btn ghost">Browse plans →</Link>
        </div>
      </div>
    </main>
  );
}
