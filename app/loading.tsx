// app/loading.tsx — branded route loading state.
//
// Cream paper, leaf-green sweep, ink text, sentence case — the v2 theme,
// not the old black ground with a lime segment. The house device is kept:
// a hairline, with a green segment travelling along it under a plain label.
// Square, 1px, no glow. Dead under prefers-reduced-motion, where the rule
// simply sits there at rest.
export default function Loading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FAF6EF",
        color: "#1D1A15",
        display: "flex",
        alignItems: "center",
        padding: "120px clamp(18px,4vw,40px)",
      }}
    >
      <style>{`
        @keyframes ffSweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .ldWrap { width: 100%; max-width: 1180px; margin: 0 auto; }
        .ldTrack {
          position: relative;
          height: 1px;
          background: #E0D9C8;
          overflow: hidden;
          margin-top: 18px;
        }
        .ldTrack::after {
          content: "";
          position: absolute;
          inset: 0 auto 0 0;
          width: 25%;
          background: #1E5B3A;
          animation: ffSweep 1.15s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .ldTxt {
          font-family: var(--fk-sans), system-ui, sans-serif;
          font-weight: 500;
          font-size: 14px;
          color: #57503F;
        }
        @media (prefers-reduced-motion: reduce) {
          .ldTrack::after { animation: none; width: 100%; opacity: 0.4; }
        }
      `}</style>
      <div className="ldWrap">
        <span className="ldTxt">Plating your page</span>
        <div className="ldTrack" aria-hidden="true" />
      </div>
    </main>
  );
}
