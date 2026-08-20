// components/Wordmark.tsx
//
// THE LOGO. ONE DEFINITION, EVERY SURFACE.
//
// Before this file there were four, and a customer could meet three of them in
// a single session:
//
//   /  and the 48 dish pages   no mark, Newsreader 21.6px/600, sentence case
//   every marketing page       36px lime square + a bolt icon, sans 20px/800
//   /dashboard                 22px lime square, condensed 19px/900 UPPERCASE
//   /auth/signin               lime square + bolt, sans 20px/800, raw #84cc16
//
// Four marks, three typefaces, and four different places the lime came from —
// a raw hex, a `LIME` const, `C.lime`, and a CSS token. The uppercase condensed
// one was also the exact style AGENTS.md rejects by name.
//
// SETTLED 2026-08-20: one wordmark, Newsreader, sentence case, lime "Fuel", no
// icon. Newsreader because that is what the approved homepage design ships and
// what app/_design/tokens.css calls display type; no icon because the design
// the owner signed off has none, and carrying a bolt on half the surfaces was
// the inconsistency being removed.
//
// A NEW LOGO IS COMING. That is the reason this is a component and not a
// find-and-replace: when the new mark is designed it lands here, once, and
// every header on the site takes it. Do not inline a wordmark anywhere else.
//
// WHY THE COLOURS ARE A FALLBACK CHAIN. This renders inside two different token
// systems — `--fk-*` on the app half, `--ff-*` on the marketing half — and
// neither defines the other's names. The chain resolves to whichever is present
// and to the literal only if a surface has neither. All three are #84cc16
// today, so the appearance is identical; what the chain buys is that a palette
// change on either half is still followed here.
//
// `--font-newsreader` is the Next font variable from app/layout.tsx, set on the
// document, so it resolves on every route including ones that never load
// tokens.css.
//
// SERVER COMPONENT. No hooks, so it drops into server and client trees alike.

import Link from "next/link";

const INK = "var(--fk-ink, var(--ff-ink, #f7f7f5))";
const LIME = "var(--fk-green, var(--ff-lime, #84cc16))";
const DISPLAY = "var(--font-newsreader), Georgia, 'Times New Roman', serif";

export default function Wordmark({
  href = "/",
  size = 21.6,
  weight = 600,
  className,
  title,
}: {
  /** Where it goes. `/` everywhere except the app shell, which goes to the
   *  dashboard the reader is already inside. */
  href?: string;
  /** Rendered size in px. 21.6 is the homepage's 1.35rem, and the default. */
  size?: number | string;
  weight?: number;
  className?: string;
  /** Accessible name. Defaults to the brand; the app shell overrides it so the
   *  link says where it goes rather than repeating the wordmark. */
  title?: string;
}) {
  /* THE SIZE GOES THROUGH A CUSTOM PROPERTY, not straight into fontSize.
     Inline styles beat every class, so a component that hard-codes its size
     cannot be made responsive by the stylesheet that places it — and the app
     header does shrink its wordmark to 1.15rem below 640px. Writing the prop
     into `--wm-size` and reading it back lets a className override it
     (`.brand { --wm-size: 1.15rem }`) while the default still holds
     everywhere else. */
  return (
    <Link
      href={href}
      className={className}
      aria-label={title ?? "FitFuel, home"}
      style={
        {
          "--wm-size": typeof size === "number" ? `${size}px` : size,
          "--wm-weight": String(weight),
          display: "inline-flex",
          alignItems: "center",
          /* 44px is the tap target, not a layout change — the wordmark is
             centred in it, so nothing moves on screen. */
          minHeight: 44,
          flexShrink: 0,
          fontFamily: DISPLAY,
          fontSize: "var(--wm-size)",
          fontWeight: "var(--wm-weight)" as unknown as number,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          color: INK,
          textDecoration: "none",
          whiteSpace: "nowrap",
        } as React.CSSProperties
      }
    >
      Fit
      <em style={{ fontStyle: "normal", color: LIME }}>Fuel</em>
    </Link>
  );
}
