// app/supplements/page.tsx
// Phase 18-1 — Server-side fetch supplements from DB, pass to client renderer.
// Replaces direct static-import pattern.

import { auth } from "@/lib/auth";
import SupplementsLanding from "./SupplementsLanding";
import { getAllSupplements } from "@/lib/supplements-db";
import { getRecommendedSupplements, type SupplementRecommendation } from "@/lib/supplement-recommender";

export const metadata = {
  title: "Supplements — FitFuel Premium",
  description: "Goal-based supplement stacks personalised for you. Delivered with your meals.",
};

export const dynamic = "force-dynamic";

export default async function SupplementsPage() {
  const session = await auth();
  const [supplements, rec] = await Promise.all([
    getAllSupplements(),
    session?.user?.id ? getRecommendedSupplements(session.user.id) : Promise.resolve(null),
  ]);

  return (
    <>
      {rec && rec.items.length > 0 && <RecommendedStrip rec={rec} />}
      <SupplementsLanding
        isLoggedIn={!!session?.user}
        supplements={supplements}
      />
      <AffiliateDisclosure />
    </>
  );
}

function RecommendedStrip({ rec }: { rec: SupplementRecommendation }) {
  return (
    <section style={{ background: "#080808", borderBottom: "1px solid #1c1c1c", padding: "104px 24px 24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Space+Mono:wght@400;700&display=swap');
        .rec-wrap{ max-width:1000px; margin:0 auto; }
        .rec-eyebrow{ font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:#a3e635; margin-bottom:8px; }
        .rec-h{ font-family:'Barlow Condensed',sans-serif; font-weight:800; font-size:26px; letter-spacing:.3px; text-transform:uppercase; color:#f4f3ee; margin:0 0 18px; }
        .rec-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px; }
        .rec-card{ display:flex; flex-direction:column; gap:8px; padding:16px; border:1px solid #1c1c1c; border-radius:8px; background:#0d0d0d; text-decoration:none; color:inherit; transition:border-color .2s, transform .2s; position:relative; overflow:hidden; }
        .rec-card:hover{ transform:translateY(-2px); border-color:var(--ac,#a3e635); }
        .rec-emoji{ font-size:24px; }
        .rec-name{ font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:18px; letter-spacing:.3px; text-transform:uppercase; color:#f4f3ee; }
        .rec-tag{ font-size:12px; color:#8d8d87; line-height:1.5; }
        .rec-go{ font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--ac,#a3e635); margin-top:auto; }
      `}</style>
      <div className="rec-wrap">
        <div className="rec-eyebrow">Picked for you</div>
        <h2 className="rec-h">Built for {rec.goalLabel}</h2>
        <div className="rec-grid">
          {rec.items.map((it) => {
            const inner = (
              <>
                {it.emoji && <span className="rec-emoji">{it.emoji}</span>}
                <span className="rec-name">{it.name}</span>
                {it.tagline && <span className="rec-tag">{it.tagline}</span>}
                <span className="rec-go">{it.buyUrl ? "View product \u2192" : "Learn more \u2192"}</span>
              </>
            );
            const style = { ["--ac" as never]: it.accentColor || "#a3e635" } as React.CSSProperties;
            return it.buyUrl ? (
              <a key={it.slug} className="rec-card" style={style} href={it.buyUrl} target="_blank" rel="noopener noreferrer sponsored">{inner}</a>
            ) : (
              <a key={it.slug} className="rec-card" style={style} href={`/supplements#${it.slug}`}>{inner}</a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AffiliateDisclosure() {
  return (
    <section
      style={{
        background: "#080808",
        borderTop: "1px solid #1c1c1c",
        padding: "28px 24px",
      }}
    >
      <p
        style={{
          maxWidth: 760,
          margin: "0 auto",
          fontSize: 12.5,
          lineHeight: 1.7,
          color: "#737373",
          textAlign: "center",
        }}
      >
        <strong style={{ color: "#a3a3a3", fontWeight: 600 }}>Affiliate disclosure.</strong>{" "}
        FitFuel recommends supplements from trusted third-party retailers. Some links on this
        page are affiliate links — if you buy through them, FitFuel may earn a small commission
        at no extra cost to you. We only recommend products we believe in; commissions never
        change what we suggest. Supplements are sold, shipped and supported by the retailer, and
        their returns and refund terms apply. See our{" "}
        <a href="/terms" style={{ color: "#a3e635", textDecoration: "none" }}>Terms</a>.
      </p>
    </section>
  );
}
