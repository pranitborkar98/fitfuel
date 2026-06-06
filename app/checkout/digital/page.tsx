// app/checkout/digital/page.tsx  (Phase 13 — Digital checkout)
// Mirrors the physical checkout's PayU auto-submit pattern, minus COD/address/delivery-window.
// Online-only, 18% GST inclusive, with a coupon field wired to /api/coupon/validate.
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const T = {
  bg: "#0a0a0a", card: "#111111", cardBorder: "#1f1f1f",
  accent: "#84cc16", accentLight: "#a3e635",
  textPrimary: "#ffffff", textSecond: "#a3a3a3", textMuted: "#737373",
};
const fmt = (n: number) => "\u20B9" + n.toLocaleString("en-IN");

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  const [f, setF] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecond, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ width: "100%", background: "#161616", border: `1px solid ${f ? "rgba(132,204,22,0.5)" : T.cardBorder}`, borderRadius: 10, padding: "13px 16px", fontSize: 14, color: T.textPrimary, outline: "none", boxSizing: "border-box" }}
      />
    </div>
  );
}

function DigitalCheckout() {
  const params = useSearchParams();
  const router = useRouter();

  const planSlug = params.get("planSlug") || "";
  const dur      = params.get("dur") || "monthly";
  const sale     = Number(params.get("sale") || 0);
  const mrp      = Number(params.get("mrp") || sale);
  const planName = params.get("name") || "Digital Plan";

  const [firstname, setFirst] = useState("");
  const [lastname, setLast]   = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [coupon, setCoupon]   = useState("");
  const [discount, setDiscount] = useState(0);
  const [total, setTotal]     = useState(sale);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy]       = useState(false);
  const [payuData, setPayuData] = useState<Record<string, string> | null>(null);

  useEffect(() => { setTotal(sale - discount); }, [sale, discount]);

  // auto-submit PayU form
  useEffect(() => {
    if (payuData) {
      const f = document.getElementById("payu-form") as HTMLFormElement;
      f?.submit();
    }
  }, [payuData]);

  async function applyCoupon() {
    setCouponMsg(null);
    const res = await fetch("/api/coupon/validate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon.trim().toUpperCase(), planSlug, dur, email }),
    });
    const data = await res.json();
    if (data.ok) {
      setDiscount(data.discountRs);
      setCouponMsg({ ok: true, text: `Applied — you save ${data.display.discount}` });
    } else {
      setDiscount(0);
      setCouponMsg({ ok: false, text: data.reason || "Invalid coupon" });
    }
  }

  async function pay() {
    if (!firstname || !email || !phone) { alert("Please fill name, email and phone."); return; }
    setBusy(true);
    const res = await fetch("/api/payments/payu/digital", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstname, lastname, email, phone, planSlug, dur, couponCode: discount > 0 ? coupon.trim().toUpperCase() : undefined }),
    });
    const data = await res.json();
    if (data.hash) setPayuData(data);
    else { alert(data.error || "Could not start payment"); setBusy(false); }
  }

  if (!planSlug || !sale) {
    return (
      <main style={{ background: T.bg, minHeight: "100vh", color: T.textPrimary, display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ marginBottom: 20 }}>No plan selected.</p>
          <button onClick={() => router.push("/plans/digital")} style={{ background: T.accent, color: "#0a0a0a", fontWeight: 700, padding: "12px 22px", borderRadius: 10, border: "none", cursor: "pointer" }}>View digital plans</button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: T.bg, minHeight: "100vh", color: T.textPrimary, padding: "56px 20px" }}>
      {payuData && (
        <form id="payu-form" method="POST" action={payuData.payuUrl} style={{ display: "none" }}>
          {Object.entries(payuData).map(([k, v]) => k !== "payuUrl" ? <input key={k} type="hidden" name={k} value={v} /> : null)}
        </form>
      )}

      <div style={{ maxWidth: 760, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800 }}>Checkout</h1>

        {/* Summary */}
        <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: 24 }}>
          <p style={{ color: T.textMuted, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Your plan</p>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>{planName} · Digital</h2>
          <div style={{ display: "flex", justifyContent: "space-between", color: T.textSecond, fontSize: 14, marginBottom: 6 }}>
            <span>Plan price</span><span>{fmt(sale)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: T.accentLight, fontSize: 14, marginBottom: 6 }}>
              <span>Coupon discount</span><span>− {fmt(discount)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18, marginTop: 10, paddingTop: 12, borderTop: `1px solid ${T.cardBorder}` }}>
            <span>Total (incl. 18% GST)</span><span style={{ color: T.accentLight }}>{fmt(total)}</span>
          </div>
        </div>

        {/* Coupon */}
        <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecond, marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>Coupon code</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="e.g. FITFUEL50"
              style={{ flex: 1, background: "#161616", border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: "12px 14px", color: T.textPrimary, outline: "none", textTransform: "uppercase" }} />
            <button onClick={applyCoupon} style={{ background: "transparent", color: T.accent, border: `1px solid ${T.accent}`, borderRadius: 10, padding: "0 18px", fontWeight: 700, cursor: "pointer" }}>Apply</button>
          </div>
          {couponMsg && <p style={{ marginTop: 8, fontSize: 13, color: couponMsg.ok ? T.accentLight : "#f87171" }}>{couponMsg.text}</p>}
        </div>

        {/* Details */}
        <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="First name" value={firstname} onChange={setFirst} placeholder="Pranit" />
            <Field label="Last name" value={lastname} onChange={setLast} placeholder="Borkar" />
          </div>
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
          <Field label="Phone" value={phone} onChange={setPhone} placeholder="98765 43210" />
          <p style={{ color: T.textMuted, fontSize: 12, marginTop: 4 }}>
            No address needed — this is a digital download. After payment, log in with this email to download from your dashboard.
          </p>
        </div>

        <button onClick={pay} disabled={busy} style={{ background: T.accent, color: "#0a0a0a", fontWeight: 800, fontSize: 16, padding: "15px 0", borderRadius: 12, border: "none", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}>
          {busy ? "Redirecting to PayU..." : `Pay ${fmt(total)} securely`}
        </button>
      </div>
    </main>
  );
}

export default function Page() {
  return <Suspense fallback={null}><DigitalCheckout /></Suspense>;
}
