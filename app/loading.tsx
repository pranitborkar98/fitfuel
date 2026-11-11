// app/loading.tsx — branded route loading state.
//
// Was a 46px border-radius:999px ring spinning against #080808 in #a3e635.
// A circle is the one shape this system does not have, and lime-light is
// reserved for a single live value rather than a decoration that appears on
// every route transition.
//
// It is now the house device: a hairline, with a lime segment travelling along
// it under a mono label. Square, 1px, no glow. Dead under prefers-reduced-
// motion, where the rule simply sits there at rest.
export default function Loading() {
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
        @keyframes ffSweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .ldWrap { width: 100%; max-width: 1180px; margin: 0 auto; }
        .ldTrack {
          position: relative;
          height: 1px;
          background: #232320;
          overflow: hidden;
          margin-top: 18px;
        }
        .ldTrack::after {
          content: "";
          position: absolute;
          inset: 0 auto 0 0;
          width: 25%;
          background: #84cc16;
          animation: ffSweep 1.15s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .ldTxt {
          font-family: var(--font-mono), monospace;
          font-weight: 500;
          font-size: 12px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #85857e;
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
