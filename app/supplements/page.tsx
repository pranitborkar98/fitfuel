// app/supplements/page.tsx
//
// Server half of the public supplements catalogue: the live catalogue, plus a
// personalised shortlist when someone is signed in.
//
// WHAT CHANGED. The personalised strip used to render ABOVE the landing
// component as its own <section>, with `padding: 104px 24px 24px` to clear the
// fixed navbar. That put a second full-width band in front of the page's own
// masthead, so a signed-in visitor met two stacked headers before any content.
// It is passed into the landing as a prop now and rendered inside the page
// flow, directly under the readout, which is where a "picked for you" block
// belongs: after the page has said what it is.
//
// It also piped `it.accentColor` from the DB into a `--ac` custom property on
// every card. Those rows hold amber, purple, sky and indigo, so a signed-in
// user saw a four-hue palette that a signed-out user did not. Removed, along
// with the emoji, the radius-8 cards and the translateY lift.

import { auth } from "@/lib/auth";
import SupplementsLanding from "./SupplementsLanding";
import { getAllSupplements } from "@/lib/supplements-db";
import { getRecommendedSupplements } from "@/lib/supplement-recommender";
import { Wrap } from "@/app/_ui/Page";

export const metadata = {
  alternates: { canonical: "/supplements" },
  title: "Supplements",
  description: "An evidence-labelled supplement directory with goal-based shortlists, India price context and links to third-party sellers.",
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
      <SupplementsLanding
        isLoggedIn={!!session?.user}
        supplements={supplements}
        recommended={rec && rec.items.length > 0 ? rec : null}
      />
      <AffiliateDisclosure />
    </>
  );
}

/**
 * The affiliate note. Sits below the page as a recessed band rather than a
 * centred grey paragraph: it is a legal statement, so it is set flush left at
 * a readable size on a grey that clears AA.
 */
function AffiliateDisclosure() {
  return (
    <section
      style={{
        background: "var(--fk-surface)",
        borderTop: "1px solid var(--fk-line)",
        padding: "clamp(28px,4vw,44px) 0",
      }}
    >
      <Wrap>
        <span
          style={{
            display: "block",
            fontFamily: "var(--fk-sans)",
            fontWeight: 700,
            fontSize: 14,
            color: "var(--fk-ink-3)",
            marginBottom: 12,
          }}
        >
          Affiliate disclosure
        </span>
        <p
          style={{
            maxWidth: "78ch",
            margin: 0,
            fontFamily: "var(--font-archivo), sans-serif",
            fontSize: 13.5,
            lineHeight: 1.7,
            color: "var(--fk-ink-2)",
          }}
        >
          FitFuel lists supplements and links to third-party retailers. Some links on this
          page are affiliate links. If you buy through them, FitFuel may earn a small commission at
          no extra cost to you. Affiliate commission does not change the evidence tier shown on an
          entry. Supplements are sold, shipped and supported by the retailer, and
          their returns and refund terms apply. See our{" "}
          <a
            href="/terms"
            style={{
              color: "var(--fk-green)",
              textDecoration: "none",
              borderBottom: "1px solid rgba(132,204,22,0.4)",
            }}
          >
            Terms
          </a>
          .
        </p>
      </Wrap>
    </section>
  );
}
