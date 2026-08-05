import { ImageResponse } from "next/og";

// app/icon.tsx — the favicon.
//
// Was a rounded (radius 16) #a3e635 tile with a high-voltage EMOJI in it. Three
// problems: lime-light is reserved for a single live value, radius is 0, and
// the emoji was rendering through whatever fallback font the OG renderer
// happened to pick, so the mark was not reliably the same glyph twice.
//
// It is now the same mark the Navbar and Footer use: a square lime tile with
// the bolt drawn as a path, so it is identical everywhere and does not depend
// on font fallback.

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#84cc16",
          borderRadius: 0,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="#070707">
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
