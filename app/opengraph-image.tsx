import { ImageResponse } from "next/og";

// app/opengraph-image.tsx — the social share card.
//
// This is the most-seen brand asset outside the site: it is what renders in
// WhatsApp, on X, in Slack and in a Google preview. It was off the system in
// every respect — #080808 ground, #a3e635 as the accent, #f4f3ee ink, a
// radius-12 logo tile with a high-voltage emoji in it, and the headline set in
// generic "sans-serif".
//
// THE BOLT IS GONE, 2026-08-20. It was drawn as a path here so the mark would
// be "identical to the Navbar" — and the Navbar no longer has a mark. The site
// settled on a wordmark alone (components/Wordmark), so this card was the last
// place a lime-square-and-bolt survived, on the single most-shared brand asset
// there is.
//
// THE FACE STILL DIFFERS, on purpose and knowingly: next/og cannot read the
// next/font variables, so matching Newsreader here would mean shipping a font
// binary to an edge function on every crawl. A share card set in the fallback
// stack is a reasonable trade; a share card whose glyphs vary per platform is
// not. So the COMPOSITION matches the site — wordmark only, lime "Fuel" — and
// the typeface does not.
//
// WHEN THE NEW LOGO LANDS this is the second of exactly two places to change.
// The other is components/Wordmark. There is no third.

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
        {/* Satori needs an explicit display on any node with more than one
            child, and "Fit" + <span>Fuel</span> is two. */}
        <div style={{ display: "flex", fontSize: 34, fontWeight: 600, color: "#f7f7f5", letterSpacing: -1 }}>
          Fit<span style={{ color: "#84cc16" }}>Fuel</span>
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
            Cooked meals · matching macros · connected diary · Pune
          </div>
        </div>

        {/* A hairline, the way every band on the site is separated. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ width: "100%", height: 1, background: "#232320" }} />
          <div style={{ display: "flex", gap: 28, fontSize: 22, color: "#85857e" }}>
            <span style={{ color: "#f7f7f5" }}>Cooked in Kharadi</span>
            <span>Meals, diary and kitchen connected</span>
            <span>fitfuel.in</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
