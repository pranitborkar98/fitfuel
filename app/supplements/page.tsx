// app/supplements/page.tsx
// Phase 18-1 — Server-side fetch supplements from DB, pass to client renderer.
// Replaces direct static-import pattern.

import { auth } from "@/lib/auth";
import SupplementsLanding from "./SupplementsLanding";
import { getAllSupplements } from "@/lib/supplements-db";

export const metadata = {
  title: "Supplements — FitFuel Premium",
  description: "Goal-based supplement stacks personalised for you. Delivered with your meals.",
};

export const dynamic = "force-dynamic";

export default async function SupplementsPage() {
  const [session, supplements] = await Promise.all([
    auth(),
    getAllSupplements(),
  ]);

  return (
    <>
      <SupplementsLanding
        isLoggedIn={!!session?.user}
        supplements={supplements}
      />
      <AffiliateDisclosure />
    </>
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
