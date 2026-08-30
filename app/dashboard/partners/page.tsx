import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import { ExternalLink, QrCode } from "lucide-react";

import { auth } from "@/lib/auth";
import { getPartnerConsole, type Conversion, type Payout } from "@/lib/partner-console";
import { SITE_URL } from "@/lib/site";
import PartnerShareActions from "./PartnerShareActions";
import styles from "./partner-console.module.css";

export const metadata: Metadata = { title: "Partner console" };
export const dynamic = "force-dynamic";

const PARTNER_STATUS = {
  ACTIVE: "Active",
  PENDING: "Under review",
  PAUSED: "Paused",
  REJECTED: "Not approved",
  TERMINATED: "Terminated",
} as const;

const PARTNER_NOTE = {
  PENDING: "Your application is under review. Your page and tracking will switch on only after approval.",
  PAUSED: "New referrals are paused. Existing conversion and payout records remain visible while you contact FitFuel about reactivation.",
  REJECTED: "This application was not approved. Contact FitFuel if you need the review details.",
  TERMINATED: "This partnership has ended. The code no longer attributes new customers.",
} as const;

function money(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function readable(value: string): string {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function shortDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function formatPeriod(period: string): string {
  if (!/^\d{4}-\d{2}$/.test(period)) return period;
  const [year, month] = period.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
}

function rewardLabel(type: string, value: number): string {
  if (type === "MEAL_VOUCHER") return `${value} meal voucher${value === 1 ? "" : "s"}`;
  if (type === "DISCOUNT_ONLY") return "Customer discount only";
  return money(value);
}

function statusClass(status: string): string {
  if (status === "ACTIVE" || status === "PAID" || status === "FIRST_ORDER" || status === "REWARD_PAID") return styles.statusGood;
  if (status === "PENDING" || status === "PROCESSING" || status === "SIGNED_UP") return styles.statusWaiting;
  if (status === "FAILED" || status === "REJECTED" || status === "TERMINATED" || status === "CANCELLED") return styles.statusBad;
  return styles.statusQuiet;
}

function Status({ value, label }: { value: string; label?: string }) {
  return <span className={`${styles.status} ${statusClass(value)}`}>{label || readable(value)}</span>;
}

function ConversionRow({ conversion }: { conversion: Conversion }) {
  const cancelled = conversion.status === "CANCELLED";
  return (
    <article className={styles.conversionRow}>
      <div>
        <strong>{conversion.refereeName}</strong>
        <small>{conversion.orderNumber ? `Order ${conversion.orderNumber} · ${money(conversion.orderTotal)} · ` : ""}{shortDate(conversion.createdAt)}</small>
      </div>
      <Status value={conversion.status} />
      <span className={styles.rewardValue}>{cancelled ? "No reward" : rewardLabel(conversion.rewardType, conversion.rewardAmountRs)}</span>
    </article>
  );
}

function PayoutRow({ payout }: { payout: Payout }) {
  return (
    <article className={styles.payoutRow}>
      <div><strong>{formatPeriod(payout.periodYearMonth)}</strong><small>{payout.referralCount} eligible referral{payout.referralCount === 1 ? "" : "s"}{payout.paymentRef ? ` · Ref ${payout.paymentRef}` : ""}</small></div>
      <Status value={payout.status} />
      <span className={styles.rewardValue}>{money(payout.amountRs)}</span>
    </article>
  );
}

export default async function PartnerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard/partners");

  const data = await getPartnerConsole(session.user.id);
  if (!data) redirect("/dashboard");
  if (data.partner.type === "CUSTOMER") redirect("/dashboard/referrals");

  const partner = data.partner;
  const link = `${SITE_URL}/p/${partner.code}`;
  const active = partner.status === "ACTIVE";
  const cashReward = partner.rewardType === "CASH" || partner.rewardType === "HYBRID";
  const rewardValue = partner.rewardType === "MEAL_VOUCHER"
    ? String(data.stats.totalRewardValue)
    : partner.rewardType === "DISCOUNT_ONLY"
      ? String(data.stats.totalConversions)
      : money(data.stats.totalRewardValue);
  const rewardMetric = partner.rewardType === "MEAL_VOUCHER"
    ? "Vouchers earned"
    : partner.rewardType === "DISCOUNT_ONLY"
      ? "Eligible orders"
      : "Rewards earned";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>Partner console</p><h1>{partner.name}</h1><p>{readable(partner.type)} programme · {rewardLabel(partner.rewardType, partner.rewardValueRs)} per eligible first order · {money(partner.refereeDiscountRs)} customer welcome discount.</p></div>
        <Status value={partner.status} label={PARTNER_STATUS[partner.status]} />
      </header>

      {partner.status !== "ACTIVE" && <section className={styles.notice} aria-label="Partner status"><strong>{PARTNER_STATUS[partner.status]}</strong><p>{PARTNER_NOTE[partner.status]}</p></section>}

      <section className={styles.metrics} aria-label="Partner summary">
        <article><span>Eligible conversions</span><strong>{data.stats.totalConversions}</strong><small>Cancelled orders are excluded</small></article>
        <article><span>{rewardMetric}</span><strong>{rewardValue}</strong><small>From eligible first orders</small></article>
        {cashReward ? <><article><span>Still to be settled</span><strong>{money(data.stats.pendingPayoutRs)}</strong><small>Includes failed payouts that need retry</small></article><article><span>Paid to date</span><strong>{money(data.stats.paidPayoutRs)}</strong><small>Closed payout records</small></article></> : <article><span>Customer welcome offer</span><strong>{money(partner.refereeDiscountRs)}</strong><small>Applied to a qualifying first order</small></article>}
      </section>

      <section className={`${styles.shareCard} ${!active ? styles.shareCardDisabled : ""}`}>
        <div className={styles.sectionTitle}><div><p className={styles.eyebrow}>Your referral route</p><h2>{active ? "Share the page that tracks back to you" : "Your referral page is not live yet"}</h2><p>{active ? "The same verified code follows a customer from this page through checkout." : "You can see the reserved code, but it will not attribute a customer until the partnership is active."}</p></div></div>
        <div className={styles.shareGrid}>
          <div className={styles.linkPanel}><span>Referral link</span><strong>{link}</strong><small>Code {partner.code}</small>{active && <PartnerShareActions link={link} />}</div>
          <div className={styles.qrPanel}>{active ? <><Image unoptimized src="/api/user/partner/qr?format=svg" alt={`QR code for ${partner.name}'s FitFuel referral page`} width={184} height={184} /><span><QrCode aria-hidden="true" size={16} />Print or place this where customers can scan it.</span></> : <div className={styles.qrUnavailable}><QrCode aria-hidden="true" size={30} /><span>Available after approval</span></div>}</div>
        </div>
        {active && <a className={styles.openPage} href={link} target="_blank" rel="noreferrer">Open my public page <ExternalLink aria-hidden="true" size={16} /></a>}
      </section>

      <section className={styles.dataSection}>
        <div className={styles.sectionTitle}><div><p className={styles.eyebrow}>Conversion record</p><h2>Customers attributed to your code</h2><p>The latest 100 records. A cancelled qualifying order remains visible but is removed from earned totals.</p></div></div>
        {data.referrals.length === 0 ? <div className={styles.empty}><strong>No conversions yet</strong><span>{active ? "Share your link or QR. The first paid order will appear here." : "Tracking begins after the partner code is approved and active."}</span></div> : <div className={styles.conversionList}>{data.referrals.map((conversion) => <ConversionRow key={conversion.id} conversion={conversion} />)}</div>}
      </section>

      <section className={styles.dataSection}>
        <div className={styles.sectionTitle}><div><p className={styles.eyebrow}>Settlement record</p><h2>{cashReward ? "Monthly payouts" : "Reward fulfilment"}</h2><p>{cashReward ? "Each cash settlement stays visible from pending through paid." : partner.rewardType === "MEAL_VOUCHER" ? "Voucher entitlement follows eligible conversion count and is fulfilled with FitFuel staff." : "This programme does not generate a cash payout."}</p></div></div>
        {data.payouts.length === 0 ? <div className={styles.empty}><strong>No payout records</strong><span>{cashReward ? "The first eligible cash reward will open a monthly payout record." : "There is no cash payout to reconcile for this reward model."}</span></div> : <div className={styles.payoutList}>{data.payouts.map((payout) => <PayoutRow key={payout.id} payout={payout} />)}</div>}
      </section>
    </main>
  );
}
