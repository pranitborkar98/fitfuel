// app/dashboard/referrals/page.tsx
//
// Was a client component that fetched /api/user/referrals in a useEffect, so
// the screen booted empty and filled in a moment later, and carried its own
// palette: a panel lighter than the ground, a green for "ok", an amber for
// "warn" and WhatsApp's own green. That is four hues on a two colour system.
//
// Now it follows the Coach: server component, the query called directly, and
// one small client component for the clipboard. The only numbers on the page
// are the ones the database holds. There is no reward ladder, because the
// product does not ship one (DESIGN.md §10).

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getReferralSummary, type Referee } from "@/lib/referrals";
import { C, screen, body, label, num, figure, PANEL, APP_MAX } from "@/app/_app/theme";
import ShareActions from "./ShareActions";

export const metadata: Metadata = { title: "Referrals" };
export const dynamic = "force-dynamic";

const WRAP: React.CSSProperties = {
  width: "100%", maxWidth: APP_MAX, margin: "0 auto",
  padding: "0 clamp(16px,4vw,28px)",
};

/** Status wording, never the colour on its own. DESIGN.md §8. */
const STATUS_COPY: Record<string, string> = {
  PENDING: "Waiting on their first order",
  APPROVED: "Credited",
  PAID: "Paid out",
  REJECTED: "Not eligible",
  CANCELLED: "Cancelled",
};

function statusText(raw: string): string {
  return STATUS_COPY[raw?.toUpperCase()] ?? raw.replace(/_/g, " ").toLowerCase();
}

function rupees(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function Spine({ children }: { children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "26px 0 16px" }}>
      <span style={label(12)}>{children}</span>
      <span style={{ flex: 1, height: 1, background: C.rule }} />
    </div>
  );
}

function Readout({ v, k, live = false }: { v: string; k: string; live?: boolean }) {
  return (
    <div style={{ background: C.bg, padding: "14px 16px 16px" }}>
      <span style={figure(30, { display: "block", color: live ? C.lime : C.ink })}>{v}</span>
      <span style={label(12, { display: "block", marginTop: 8, lineHeight: 1.45 })}>{k}</span>
    </div>
  );
}

/** Directory row: hairline separated, full width, the number in a column.
 *  DESIGN.md §4, signature device 3. Not a card grid. */
function RefereeRow({ r }: { r: Referee }) {
  const credited = r.status?.toUpperCase() === "APPROVED" || r.status?.toUpperCase() === "PAID";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                  padding: "13px 0", borderBottom: `1px solid ${C.rule}` }}>
      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
        <p style={body(14, { color: C.ink, margin: 0 })}>{r.refereeName}</p>
        <p style={{ ...num(12, { color: C.dim }), margin: "3px 0 0" }}>
          {r.orderNumber ? `Order ${r.orderNumber} · ` : ""}
          {new Date(r.createdAt).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
          })}
        </p>
      </div>
      <span style={label(12, { flex: "none" })}>{statusText(r.status)}</span>
      <span style={num(13, {
        flex: "none", minWidth: "7ch", textAlign: "right",
        color: credited ? C.lime : C.dim,
      })}>
        {credited ? rupees(r.rewardAmountRs) : "Not yet"}
      </span>
    </div>
  );
}

export default async function ReferralsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard/referrals");

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "fitfuel-eosin.vercel.app";
  const proto = h.get("x-forwarded-proto") || "https";

  let data;
  try {
    data = await getReferralSummary(session.user.id);
  } catch {
    return (
      <div style={{ ...WRAP, paddingTop: 26 }}>
        <h1 style={screen()}>Referrals</h1>
        <div style={{ ...PANEL, padding: "20px 18px", marginTop: 18 }}>
          <p style={body(14)}>
            Your code could not be loaded right now. Nothing is lost, any credit you have
            already earned is unaffected. Try again in a moment.
          </p>
        </div>
      </div>
    );
  }

  const shareLink = `${proto}://${host}/p/${data.code}`;
  const ordered = data.referees.filter(
    (r) => r.status?.toUpperCase() === "APPROVED" || r.status?.toUpperCase() === "PAID",
  ).length;

  return (
    <div style={{ ...WRAP, paddingTop: 26 }}>

      <header style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={screen()}>Referrals</h1>
        <span style={label(12)}>One code, two credits, paid on delivery</span>
      </header>

      <Spine>Your code</Spine>
      <div style={PANEL}>
        <div style={{ display: "flex", alignItems: "stretch", gap: 1, background: C.rule }}>
          <span style={{
            flex: 1, minWidth: 0, display: "flex", alignItems: "center",
            padding: "0 16px", minHeight: 52, background: C.panel2,
            ...num(18, { letterSpacing: "0.2em", color: C.lime }),
          }}>
            {data.code}
          </span>
        </div>
        <p style={{ ...body(13, { color: C.dim }), padding: "12px 16px 0", margin: 0,
                    overflowWrap: "anywhere" }}>
          {shareLink}
        </p>
        <div style={{ padding: 16 }}>
          <ShareActions link={shareLink} code={data.code} />
        </div>
        <p style={{ ...body(14), padding: "0 16px 16px", margin: 0, maxWidth: "62ch" }}>
          They get ₹200 off their first plan. You get ₹500 in credit once their first order
          is confirmed, applied to your next renewal automatically.
        </p>
      </div>

      <Spine>Where you stand</Spine>
      <div style={{ display: "grid", gap: 1, background: C.rule, border: `1px solid ${C.rule}`,
                    gridTemplateColumns: "repeat(auto-fit,minmax(136px,1fr))" }}>
        <Readout v={rupees(data.creditsBalanceRs)} k="Credit balance" live={data.creditsBalanceRs > 0} />
        <Readout v={rupees(data.totalEarnedRs)} k="Earned in total" />
        <Readout v={String(data.referees.length)} k="Signed up with your code" />
        <Readout v={String(ordered)} k="Went on to order" />
      </div>

      <Spine>People you invited</Spine>
      {data.referees.length === 0 ? (
        <div style={{ ...PANEL, padding: "20px 18px" }}>
          <p style={body(14, { maxWidth: "62ch" })}>
            Nobody has used your code yet. The credit lands when their first order is
            confirmed, not when they sign up.
          </p>
        </div>
      ) : (
        <div style={{ borderTop: `1px solid ${C.rule}` }}>
          {data.referees.map((r) => <RefereeRow key={r.id} r={r} />)}
        </div>
      )}

    </div>
  );
}
