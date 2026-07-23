// app/loading.tsx — WS-4 / F7. Branded route loading state.
export default function Loading() {
  return (
    <main style={{ minHeight: "100vh", background: "#080808", color: "#f4f3ee", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
      <style>{`

        @keyframes ff-spin{ to{ transform:rotate(360deg); } }
        @keyframes ff-pulse{ 0%,100%{ opacity:.35; } 50%{ opacity:1; } }
        .ld-wrap{ display:flex; flex-direction:column; align-items:center; gap:18px; }
        .ld-ring{ width:46px; height:46px; border-radius:999px; border:3px solid #1a1a1a; border-top-color:#a3e635; animation:ff-spin .8s linear infinite; }
        .ld-txt{ font-family:var(--ff-cond); font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:#85857e; animation:ff-pulse 1.4s ease-in-out infinite; }
      `}</style>
      <div className="ld-wrap">
        <div className="ld-ring" />
        <span className="ld-txt">Plating your page…</span>
      </div>
    </main>
  );
}
