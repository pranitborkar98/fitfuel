import { ImageResponse } from "next/og";

// app/opengraph-image.tsx — the social share card.
//
// This is the most-seen brand asset outside the site: it is what renders in
// WhatsApp, on X, in Slack and in a Google preview. It was off the system in
// every respect — #080808 ground, #a3e635 as the accent, #f4f3ee ink, a
// radius-12 logo tile with a high-voltage emoji in it, and the headline set in
// generic "sans-serif".
//
// On the ramp now, square, with the bolt drawn as a path so the mark is
// identical to the Navbar and does not depend on which font the OG renderer
// falls back to for an emoji.
//
// The face stays a generic stack on purpose: next/og cannot use the next/font
// variables, and loading Barlow Condensed here would mean shipping the font
// binary to an edge function on every crawl. A share card set in the fallback
// is a reasonable trade; a share card whose glyphs vary per platform is not.

export const runtime = "edge";
export const alt = "FitFuel. Meals that train with you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#070707",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 0,
              background: "#84cc16",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="27" height="27" viewBox="0 0 24 24" fill="#070707">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          {/* Satori needs an explicit display on any node with more than one
              child, and "Fit" + <span>Fuel</span> is two. */}
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800, color: "#f7f7f5", letterSpacing: -1 }}>
            Fit<span style={{ color: "#84cc16" }}>Fuel</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "#f7f7f5",
              lineHeight: 1.02,
              letterSpacing: -2,
            }}
          >
            Meals that
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 800,
              color: "#f7f7f5",
              lineHeight: 1.02,
              letterSpacing: -2,
            }}
          >
            train with you<span style={{ color: "#84cc16" }}>.</span>
          </div>
          <div style={{ fontSize: 28, color: "#9a9a94", marginTop: 26 }}>
            Verified meals · macros tracked · coaching built in · Pune
          </div>
        </div>

        {/* A hairline, the way every band on the site is separated. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ width: "100%", height: 1, background: "#232320" }} />
          <div style={{ display: "flex", gap: 28, fontSize: 22, color: "#85857e" }}>
            <span style={{ color: "#f7f7f5" }}>₹112 / meal</span>
            <span>126 plans</span>
            <span>fitfuel.in</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
