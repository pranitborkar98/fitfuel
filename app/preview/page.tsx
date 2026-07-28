// app/preview/page.tsx
//
// The chooser. Three routes, three registers, one sentence each.

import Link from "next/link";

const OPTIONS: { href: string; key: string; name: string; what: string }[] = [
  {
    href: "/preview/a",
    key: "A",
    name: "Cinematic",
    what: "Your photography at viewport scale, type set over the image, no cards and no chrome. The page is the food.",
  },
  {
    href: "/preview/b",
    key: "B",
    name: "Poster",
    what: "Type is the layout. Absurd scale, hard lime and black colour fields, almost no photography. Loudest of the three.",
  },
  {
    href: "/preview/c",
    key: "C",
    name: "Heat",
    what: "Near-black dropped entirely. Saturated colour fields, high contrast, high energy. Nothing about it is safe.",
  },
];

export default function PreviewIndex() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#fff",
        padding: "120px 24px 80px",
        fontFamily: "var(--font-archivo), sans-serif",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <p style={{ color: "#8f8f8f", fontSize: 14, margin: "0 0 10px" }}>Drafts, not the site</p>
        <h1
          style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: "clamp(2rem,5vw,3.4rem)",
            lineHeight: 1.05,
            margin: "0 0 18px",
          }}
        >
          Three directions. Pick one.
        </h1>
        <p style={{ color: "#b9b9b9", fontSize: 16.5, lineHeight: 1.6, margin: "0 0 44px", maxWidth: "56ch" }}>
          Each one is a real hero plus the trial day, on your actual photography and your
          actual day-one dishes from the database. They are deliberately far apart. Tell me
          the letter, or tell me what to steal from which, and I will build the whole page in
          it.
        </p>

        <div style={{ display: "grid", gap: 1, background: "#242424", border: "1px solid #242424" }}>
          {OPTIONS.map((o) => (
            <Link
              key={o.href}
              href={o.href}
              style={{
                display: "block",
                background: "#0b0b0b",
                padding: "26px 24px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <span style={{ color: "#a3e635", fontWeight: 700, fontSize: 15 }}>{o.key}</span>
                <span style={{ fontSize: 22, fontWeight: 700 }}>{o.name}</span>
              </div>
              <p style={{ color: "#b9b9b9", fontSize: 15, lineHeight: 1.6, margin: "10px 0 0" }}>
                {o.what}
              </p>
            </Link>
          ))}
        </div>

        <p style={{ color: "#7a7a7a", fontSize: 14, marginTop: 34 }}>
          Your live homepage is untouched at <Link href="/" style={{ color: "#a3e635" }}>/</Link>.
        </p>
      </div>
    </main>
  );
}
