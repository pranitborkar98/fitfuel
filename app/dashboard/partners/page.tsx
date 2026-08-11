// app/dashboard/partners/page.tsx
// Phase 17B, the B2B partner console. CUSTOMER type partners do not see this
// surface, they have /dashboard/referrals instead.
//
// Was a client component that fetched /api/user/partner after mount, on a page
// that had already queried the same Partner row to decide whether the viewer
// was allowed in. One query now, on the server, and the clipboard is the only
// thing left with state.

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getPartnerConsole, type Conversion, type Payout } from "@/lib/partner-console";
import { C, screen, body, label, num, figure, PANEL, APP_MAX } from "@/app/_app/theme";
import CopyLink from "./CopyLink";

export const metadata: Metadata = { title: "Partner console" };
export const dynamic = "force-dynamic";

const WRAP: React.CSSProperties = {
  width: "100%", maxWidth: APP_MAX, margin: "0 auto",
  padding: "0 clamp(16px,4vw,28px)",
};

const RUPEE = "₹";
const rs = (n: number) => `${RUPEE}${n.toLocaleString("en-IN")}`;

/** Every status is a word. The old pills were a bare colour with the raw enum
 *  next to it, which is meaning in hue and a shouty token at once. */
const PARTNER_STATUS: Record<string, string> = {
  ACTIVE: "Active",
  PENDING: "Under review",
  PAUSED: "Paused",
  REJECTED: "Not approved",
  TERMINATED: "Terminated",
};

const PARTNER_NOTE: Record<string, string> = {
  PENDING: "Your partner account is under review. Conversions still track while you wait.",
  PAUSED: "Your partner account is paused, so new conversions are not tracking. Contact us to reactivate.",
  REJECTED: "Your partner application was not approved. Contact us if you would like the detail.",
  TERMINATED: "This partner account has been terminated.",
};

const PAYOUT_STATUS: Record<string, string> = {
  PAID: "Paid",
  PROCESSING: "Processing",
  PENDING: "Pending",
  FAILED: "Failed",
};

function rewardLabel(type: string, v: number) {
  if (type === "MEAL_VOUCHER") return `${v} meal voucher${v === 1 ? "" : "s"}`;
  if (type === "DISCOUNT_ONLY") return "Referee discount only";
  if (type === "HYBRID") return `${rs(v)} and a discount`;
  return rs(v);
}

function formatPeriod(ym: string) {
  if (!/^\d{4}-\d{2}$/.test(ym)) return ym;
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString("en-IN", { month: "long", year: "numeric" });
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

function ConversionRow({ r }: { r: Conversion }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                  padding: "13px 0", borderBottom: `1px solid ${C.rule}` }}>
      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
        <p style={body(14, { color: C.ink, margin: 0 })}>{r.refereeName}</p>
        <p style={{ ...num(12, { color: C.dim }), margin: "3px 0 0" }}>
          {r.orderNumber ? `Order ${r.orderNumber}, ${rs(r.orderTotal)}, ` : ""}
          {new Date(r.createdAt).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
          })}
        </p>
      </div>
      <span style={label(12, { flex: "none" })}>
        {r.status.replace(/_/g, " ").toLowerCase()}
      </span>
      <span style={num(13, { flex: "none", minWidth: "9ch", textAlign: "right", color: C.lime })}>
        {rewardLabel(r.rewardType, r.rewardAmountRs)}
      </span>
    </div>
  );
}

function PayoutRow({ p }: { p: Payout }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                  padding: "13px 0", borderBottom: `1px solid ${C.rule}` }}>
      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
        <p style={body(14, { color: C.ink, margin: 0 })}>{formatPeriod(p.periodYearMonth)}</p>
        <p style={{ ...num(12, { color: C.dim }), margin: "3px 0 0" }}>
          {p.referralCount} conversion{p.referralCount === 1 ? "" : "s"}
          {p.paymentRef ? `, ref ${p.paymentRef}` : ""}
        </p>
      </div>
      <span style={label(12, { flex: "none" })}>{PAYOUT_STATUS[p.status] ?? p.status}</span>
      <span style={num(13, { flex: "none", minWidth: "9ch", textAlign: "right" })}>{rs(p.amountRs)}</span>
    </div>
  );
}

export default async function PartnerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard/partners");

  const data = await getPartnerConsole(session.user.id);
  if (!data) redirect("/dashboard");
  if (data.partner.type === "CUSTOMER") redirect("/dashboard/referrals");

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "fitfuel-eosin.vercel.app";
  const proto = h.get("x-forwarded-proto") || "https";
  const link = `${proto}://${host}/p/${data.partner.code}`;

  const p = data.partner;
  const note = PARTNER_NOTE[p.status];

  return (
    <div style={{ ...WRAP, paddingTop: 26 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={screen()}>Partner console</h1>
        <span style={label(12)}>
          {p.type.replace(/_/g, " ").toLowerCase()}, {(PARTNER_STATUS[p.status] ?? p.status).toLowerCase()}
        </span>
      </header>
      <p style={body(14, { margin: "12px 0 0", maxWidth: "68ch" })}>
        {p.name}. {rewardLabel(p.rewardType, p.rewardValueRs)} a conversion, and{" "}
        {rs(p.refereeDiscountRs)} off for the person you send.
      </p>

      {note ? (
        <div style={{ ...PANEL, borderColor: C.rule2, padding: "14px 16px", marginTop: 16 }}>
          <p style={body(14, { color: C.ink, maxWidth: "68ch" })}>{note}</p>
        </div>
      ) : null}

      <Spine>Where you stand</Spine>
      <div style={{ display: "grid", gap: 1, background: C.rule, border: `1px solid ${C.rule}`,
                    gridTemplateColumns: "repeat(auto-fit,minmax(136px,1fr))" }}>
        <Readout v={String(data.stats.totalConversions)} k="Conversions" />
        <Readout v={rs(data.stats.totalEarnedRs)} k="Earned in total" live={data.stats.totalEarnedRs > 0} />
        <Readout v={rs(data.stats.pendingPayoutRs)} k="Waiting to be paid" />
        <Readout v={rs(data.stats.paidPayoutRs)} k="Paid out" />
      </div>

      <Spine>Your tracking link</Spine>
      <div style={PANEL}>
        <span style={{
          display: "flex", alignItems: "center", minHeight: 52, padding: "0 16px",
          background: C.panel2, ...num(13, { color: C.lime }),
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {link}
        </span>
        <div style={{ padding: 16 }}>
          <CopyLink link={link} />
        </div>
        <p style={{ ...body(13), padding: "0 16px 16px", margin: 0, maxWidth: "68ch" }}>
          Code {p.code}. For printable QR posters, contact FitFuel admin.
        </p>
      </div>

      <Spine>Conversions</Spine>
      {data.referrals.length === 0 ? (
        <div style={{ ...PANEL, padding: "20px 18px" }}>
          <p style={body(14, { maxWidth: "62ch" })}>
            No conversions yet. They land here when someone who used your link places their
            first order.
          </p>
        </div>
      ) : (
        <div style={{ borderTop: `1px solid ${C.rule}` }}>
          {data.referrals.map((r) => <ConversionRow key={r.id} r={r} />)}
        </div>
      )}

      <Spine>Payouts, monthly</Spine>
      {data.payouts.length === 0 ? (
        <div style={{ ...PANEL, padding: "20px 18px" }}>
          <p style={body(14, { maxWidth: "62ch" })}>
            {p.rewardType === "CASH"
              ? "No payouts yet. Cash payouts are processed monthly."
              : p.rewardType === "MEAL_VOUCHER"
                ? "Meal vouchers are handled separately, so your conversion count is the number that matters here."
                : "This reward type does not generate payouts."}
          </p>
        </div>
      ) : (
        <div style={{ borderTop: `1px solid ${C.rule}` }}>
          {data.payouts.map((py) => <PayoutRow key={py.id} p={py} />)}
        </div>
      )}

    </div>
  );
}
