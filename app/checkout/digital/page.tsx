// app/checkout/digital/page.tsx — digital checkout, bundle-aware, coupon, online-only.
// Phase 13D (capture): optional body stats collected here -> stashed in order.notes ->
// persisted to UserProfile on payment success (seeds dashboard + personalises the PDF).
// Phase 17C-2: credit-balance toggle for signed-in users (auto-applies max available).
"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const T = { bg: "#0a0a0a", card: "#111111", cardBorder: "#1f1f1f", accent: "#84cc16", accentLight: "#a3e635", textPrimary: "#fff", textSecond: "#a3a3a3", textMuted: "#9a9a94" };
const fmt = (n: number) => "\u20B9" + n.toLocaleString("en-IN");

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecond, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ width: "100%", background: "#161616", border: `1px solid ${f ? "rgba(132,204,22,0.5)" : T.cardBorder}`, borderRadius: 10, padding: "13px 16px", fontSize: 14, color: T.textPrimary, outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

function DigitalCheckout() {
  const params = useSearchParams();
  const router = useRouter();
  const planSlug = params.get("planSlug") || "";
  const dur = params.get("dur") || "monthly";
  const bundle = params.get("bundle") || "STARTER";
  const sale = Number(params.get("sale") || 0);
  const tier = params.get("tier") || "Digital Plan";
  const planName = params.get("name") || "Digital Plan";

  const [firstname, setFirst] = useState(""); const [lastname, setLast] = useState("");
  const [email, setEmail] = useState(""); const [phone, setPhone] = useState("");
  // Optional personalisation capture
  const [heightCm, setHeight] = useState(""); const [weightKg, setWeight] = useState("");
  const [targetWeightKg, setTargetWeight] = useState(""); const [age, setAge] = useState("");
  const [coupon, setCoupon] = useState(""); const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(sale);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [payuData, setPayuData] = useState<Record<string, string> | null>(null);

  // 17C-2: credit preview
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditApplicable, setCreditApplicable] = useState(0);
  const [useCredit, setUseCredit] = useState(true);

  useEffect(() => { setTotal(sale - discount); }, [sale, discount]);
  useEffect(() => { if (payuData) (document.getElementById("payu-form") as HTMLFormElement)?.submit(); }, [payuData]);

  // Fetch credit preview when total changes
  useEffect(() => {
    const subtotal = sale - discount;
    if (subtotal <= 0) return;
    fetch(`/api/checkout/credit-preview?subtotal=${subtotal}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.signedIn && d.balanceRs > 0) {
          setCreditBalance(d.balanceRs);
          setCreditApplicable(d.applicableRs);
          if (d.email && !email) setEmail(d.email);
        } else {
          setCreditBalance(0); setCreditApplicable(0);
        }
      })
      .catch(() => { setCreditBalance(0); setCreditApplicable(0); });
  }, [sale, discount]); // eslint-disable-line

  const effectiveCredit = useCredit ? creditApplicable : 0;
  const payableTotal = Math.max(0, total - effectiveCredit);

  async function applyCouponFn() {
    setCouponMsg(null);
    const res = await fetch("/api/coupon/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: coupon.trim().toUpperCase(), planSlug, dur, email }) });
    const data = await res.json();
    if (data.ok) { setDiscount(data.discountRs); setCouponMsg({ ok: true, text: `Applied — you save ${data.display.discount}` }); }
    else { setDiscount(0); setCouponMsg({ ok: false, text: data.reason || "Invalid coupon" }); }
  }
  async function pay() {
    if (!firstname || !email || !phone) { alert("Please fill name, email and phone."); return; }
    setBusy(true);
    const res = await fetch("/api/payments/payu/digital", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      firstname, lastname, email, phone, planSlug, dur, bundle,
      couponCode: discount > 0 ? coupon.trim().toUpperCase() : undefined,
      heightCm, weightKg, targetWeightKg, age,
      useCredit: useCredit && creditApplicable > 0,
    }) });
    const data = await res.json();
    if (data.hash) setPayuData(data); else { alert(data.error || "Could not start payment"); setBusy(false); }
  }

  if (!planSlug || !sale) return (
    <main style={{ background: T.bg, minHeight: "100vh", color: T.textPrimary, display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ textAlign: "center" }}><p style={{ marginBottom: 20 }}>No plan selected.</p>
        <button onClick={() => router.push("/plans/digital")} style={{ background: T.accent, color: "#0a0a0a", fontWeight: 700, padding: "12px 22px", borderRadius: 10, border: "none", cursor: "pointer" }}>View digital plans</button></div>
    </main>
  );

  return (
    <main style={{ background: T.bg, minHeight: "100vh", color: T.textPrimary, padding: "56px 20px" }}>
      {payuData && <form id="payu-form" method="POST" action={payuData.payuUrl} style={{ display: "none" }}>{Object.entries(payuData).map(([k, v]) => k !== "payuUrl" ? <input key={k} type="hidden" name={k} value={v} /> : null)}</form>}
      <div style={{ maxWidth: 760, margin: "0 auto", display: "grid", gap: 24 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800 }}>Checkout</h1>
        <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: 24 }}>
          <p style={{ color: T.textMuted, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Your plan</p>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>{tier} · {planName}</h2>
          <div style={{ display: "flex", justifyContent: "space-between", color: T.textSecond, fontSize: 14, marginBottom: 6 }}><span>Plan price</span><span>{fmt(sale)}</span></div>
          {discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: T.accentLight, fontSize: 14, marginBottom: 6 }}><span>Coupon discount</span><span>{'\u2212'} {fmt(discount)}</span></div>}
          {effectiveCredit > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: T.accentLight, fontSize: 14, marginBottom: 6 }}><span>FitFuel credit applied</span><span>{'\u2212'} {fmt(effectiveCredit)}</span></div>}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18, marginTop: 10, paddingTop: 12, borderTop: `1px solid ${T.cardBorder}` }}><span>Total (incl. 18% GST)</span><span style={{ color: T.accentLight }}>{fmt(payableTotal)}</span></div>
        </div>

        {creditApplicable > 0 && (
          <div style={{ background: T.card, border: `1px solid ${useCredit ? T.accent : T.cardBorder}`, borderRadius: 16, padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", flex: 1 }}>
              <input type="checkbox" checked={useCredit} onChange={(e) => setUseCredit(e.target.checked)} style={{ width: 18, height: 18, accentColor: T.accent }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Apply {fmt(creditApplicable)} credit</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Available balance: {fmt(creditBalance)}</div>
              </div>
            </label>
          </div>
        )}

        <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecond, marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>Coupon code</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="e.g. FITFUEL50" style={{ flex: 1, background: "#161616", border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: "12px 14px", color: T.textPrimary, outline: "none", textTransform: "uppercase" }} />
            <button onClick={applyCouponFn} style={{ background: "transparent", color: T.accent, border: `1px solid ${T.accent}`, borderRadius: 10, padding: "0 18px", fontWeight: 700, cursor: "pointer" }}>Apply</button>
          </div>
          {couponMsg && <p style={{ marginTop: 8, fontSize: 13, color: couponMsg.ok ? T.accentLight : "#f87171" }}>{couponMsg.text}</p>}
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="First name" value={firstname} onChange={setFirst} placeholder="Pranit" />
            <Field label="Last name" value={lastname} onChange={setLast} placeholder="Borkar" />
          </div>
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
          <Field label="Phone" value={phone} onChange={setPhone} placeholder="98765 43210" />
          <p style={{ color: T.textMuted, fontSize: 12, marginTop: 4 }}>No address needed {'\u2014'} digital download. After payment, log in with this email to download from your dashboard.</p>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Personalise my plan</h3>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0a0a0a", background: T.accent, padding: "2px 8px", borderRadius: 999 }}>OPTIONAL</span>
          </div>
          <p style={{ color: T.textMuted, fontSize: 12.5, marginBottom: 16 }}>
            Add your stats and your PDF opens with your own numbers {'\u2014'} BMI, calorie target, deficit and a weight-projection chart. Skip it and you{'\u2019'}ll get the standard plan; you can add these later in your dashboard.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Height (cm)" type="number" value={heightCm} onChange={setHeight} placeholder="175" />
            <Field label="Age" type="number" value={age} onChange={setAge} placeholder="28" />
            <Field label="Current weight (kg)" type="number" value={weightKg} onChange={setWeight} placeholder="82" />
            <Field label="Goal weight (kg)" type="number" value={targetWeightKg} onChange={setTargetWeight} placeholder="74" />
          </div>
        </div>

        <button onClick={pay} disabled={busy} style={{ background: T.accent, color: "#0a0a0a", fontWeight: 800, fontSize: 16, padding: "15px 0", borderRadius: 12, border: "none", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}>
          {busy ? "Redirecting to PayU..." : `Pay ${fmt(payableTotal)} securely`}
        </button>
      </div>
    </main>
  );
}
export default function Page() { return <Suspense fallback={null}><DigitalCheckout /></Suspense>; }
