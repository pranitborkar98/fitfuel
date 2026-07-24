// app/_home/Chapter.tsx
//
// THE SPINE.
//
// The homepage grew to twenty sections, each a deep dive, with no map. Even
// the owner said he could not tell what was being offered: abundance read as
// confusion. This is the fix, and it is deliberately the OPPOSITE of the
// clever scroll mechanisms elsewhere: a quiet, static, full-width marker that
// groups the sections into four plain acts, so a reader always knows which
// part of the story they are in.
//
// Four chapters: Eat, Track, The system, Join. Nothing is cut; the same
// sections now sit under a heading that orients them.
//
// SERVER COMPONENT. No animation on purpose. Calm is the point.

import { WRAP, RULE, LIME, MUTE, DIM, huge, tag } from "./theme";

export default function Chapter({ n, label, line, id }: { n: string; label: string; line: string; id?: string }) {
  return (
    <section
      aria-label={`${label}: ${line}`}
      style={{ borderTop: `1px solid ${RULE}`, background: "#050504" }}
      id={id}
    >
      <div style={{ ...WRAP, display: "flex", alignItems: "baseline", gap: "clamp(16px,3vw,40px)", flexWrap: "wrap", padding: "clamp(30px,4vw,52px) clamp(18px,4vw,56px)" }}>
        <span aria-hidden style={{ ...huge("clamp(2.2rem,4vw,3.2rem)"), color: LIME, lineHeight: 0.8 }}>{n}</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: "clamp(12px,2vw,22px)", flexWrap: "wrap" }}>
          <h2 style={{ ...huge("clamp(1.7rem,3.4vw,2.8rem)") }}>{label}</h2>
          <p style={{ ...tag(DIM), fontSize: 13, color: MUTE }}>{line}</p>
        </div>
      </div>
    </section>
  );
}
