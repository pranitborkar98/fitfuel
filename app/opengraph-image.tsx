import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FitFuel. Meals that train with you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", background: "#080808",
          padding: "72px 80px", fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#a3e635", display: "flex", alignItems: "center", justifyContent: "center", color: "#0a0a0a", fontSize: 28, fontWeight: 800 }}>⚡</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#f4f3ee", letterSpacing: -1 }}>
            Fit<span style={{ color: "#a3e635" }}>Fuel</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, color: "#f4f3ee", lineHeight: 1.02, letterSpacing: -2 }}>
            Meals that
          </div>
          <div style={{ fontSize: 76, fontWeight: 800, color: "#a3e635", lineHeight: 1.02, letterSpacing: -2 }}>
            train with you.
          </div>
          <div style={{ fontSize: 28, color: "#85857e", marginTop: 26 }}>
            Verified meals · macros tracked · coaching built in · Pune
          </div>
        </div>

        <div style={{ display: "flex", gap: 28, fontSize: 22, color: "#85857e" }}>
          <span style={{ color: "#a3e635" }}>₹112 / meal</span>
          <span>126 plans</span>
          <span>fitfuel.in</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
