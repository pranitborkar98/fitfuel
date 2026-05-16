"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, MessageCircle, AlertCircle } from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:          "#0a0a0a",
  card:        "#111111",
  cardBorder:  "#1f1f1f",
  accent:      "#84cc16",
  accentLight: "#a3e635",
  textPrimary: "#ffffff",
  textSecond:  "#a3a3a3",
  textMuted:   "#737373",
};

const WA_NUMBER = "919579738811";

// ─── Plan labels ──────────────────────────────────────────────────────────────
const DIET_LABELS: Record<string, string> = {
  veg: "Vegetarian", egg: "Eggetarian", nonveg: "Non-Vegetarian", jain: "Jain",
};
const DUR_LABELS: Record<string, string> = {
  trial: "Trial Day", weekly: "Weekly (7 days)", biweekly: "Bi-weekly (15 days)",
  monthly_ex: "Monthly excl. weekends", monthly: "1 Month", two_month: "2 Months", three_month: "3 Months",
};
const MEAL_LABELS: Record<string, string> = {
  bl: "Breakfast + Lunch", sd: "Snack + Dinner", all: "All 4 meals",
};

function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }

// ─── Input component ──────────────────────────────────────────────────────────
function Field({
  label, name, type = "text", value, onChange, placeholder, required = true, maxLength,
}: {
  label: string; name: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder: string; required?: boolean; maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecond, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}{required && <span style={{ color: T.accent, marginLeft: 2 }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", background: "#161616",
          border: `1px solid ${focused ? "rgba(132,204,22,0.5)" : T.cardBorder}`,
          borderRadius: 10, padding: "13px 16px",
          fontSize: 14, color: T.textPrimary, outline: "none",
          boxSizing: "border-box", transition: "border-color 0.2s",
        }}
      />
    </div>
  );
}

// ─── Checkout inner (uses useSearchParams) ────────────────────────────────────
function CheckoutInner() {
  const params = useSearchParams();
  const router = useRouter();

  // Plan params from URL (set by plans page)
  const diet    = params.get("diet")    || "veg";
  const dur     = params.get("dur")     || "monthly_ex";
  const meal    = params.get("meal")    || "sd";
  const price   = Number(params.get("price")  || 0);
  const priceGST = Math.round(price * 1.05);
  const error   = params.get("error");
  const errMsg  = params.get("msg");

  const productinfo = `FitFuel ${DUR_LABELS[dur] || dur} · ${MEAL_LABELS[meal] || meal} · ${DIET_LABELS[diet] || diet}`;

  // Form state
  const [form, setForm] = useState({
    firstname: "", lastname: "", email: "", phone: "", address: "", city: "Pune", pincode: "",
  });
  const [loading, setLoading] = useState(false);
  const [payuData, setPayuData] = useState<Record<string, string> | null>(null);

  // Auto-submit hidden form when payuData is ready
  useEffect(() => {
    if (payuData) {
      const formEl = document.getElementById("payu-form") as HTMLFormElement;
      if (formEl) formEl.submit();
    }
  }, [payuData]);

  if (!price) {
    return (
      <div style={{ textAlign: "center", padding: "120px 20px", color: T.textSecond }}>
        <p style={{ fontSize: 16, marginBottom: 24 }}>No plan selected. Please choose a plan first.</p>
        <button onClick={() => router.push("/plans")} style={{
          background: T.accent, color: "#000", fontWeight: 800, fontSize: 13,
          padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer",
        }}>
          View Plans
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/payments/payu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname:   form.firstname,
          email:       form.email,
          phone:       form.phone,
          amount:      priceGST.toFixed(2),
          productinfo,
          address:     `${form.address}, ${form.city} - ${form.pincode}`,
        }),
      });

      if (!res.ok) throw new Error("Failed to initiate payment");

      const data = await res.json();
      setPayuData(data);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try WhatsApp ordering instead.");
      setLoading(false);
    }
  }

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.textPrimary, paddingTop: 100, paddingBottom: 80 }}>

      {/* Hidden PayU form — auto-submitted after hash received */}
      {payuData && (
        <form id="payu-form" method="POST" action={payuData.payuUrl} style={{ display: "none" }}>
          {Object.entries(payuData).map(([k, v]) =>
            k !== "payuUrl" ? <input key={k} type="hidden" name={k} value={v} /> : null
          )}
        </form>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px", boxSizing: "border-box" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 24, height: 2, background: T.accent, borderRadius: 1 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: T.accent, textTransform: "uppercase" }}>
              Checkout
            </span>
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            fontWeight: 900, textTransform: "uppercase",
            color: T.textPrimary, lineHeight: 1, letterSpacing: "-0.01em",
          }}>
            Complete Your Order
          </h1>
        </div>

        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 12, padding: "14px 18px", marginBottom: 28,
            }}
          >
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f9fafb", marginBottom: 2 }}>Payment was not completed</div>
              <div style={{ fontSize: 13, color: T.textSecond }}>
                {errMsg || "Your payment was cancelled or failed. Please try again or order via WhatsApp."}
              </div>
            </div>
          </motion.div>
        )}

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }} className="checkout-grid">

          {/* Left — form */}
          <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 20, padding: "28px 24px" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, marginBottom: 24 }}>Your details</h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }} className="name-grid">
                <Field label="First name" name="firstname" value={form.firstname} onChange={v => setForm(f => ({ ...f, firstname: v }))} placeholder="Rahul" />
                <Field label="Last name" name="lastname" value={form.lastname} onChange={v => setForm(f => ({ ...f, lastname: v }))} placeholder="Sharma" required={false} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }} className="name-grid">
                <Field label="Email" name="email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="rahul@email.com" />
                <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="9876543210" maxLength={10} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <Field label="Delivery address" name="address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="Flat 4B, Koregaon Park Road..." />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }} className="name-grid">
                <Field label="City" name="city" value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} placeholder="Pune" />
                <Field label="Pincode" name="pincode" value={form.pincode} onChange={v => setForm(f => ({ ...f, pincode: v }))} placeholder="411014" maxLength={6} />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: loading ? "rgba(132,204,22,0.5)" : T.accent,
                  color: "#000", fontWeight: 900, fontSize: 14,
                  padding: "15px 0", borderRadius: 10, border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(132,204,22,0.35)",
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Redirecting to PayU..." : <>Pay {fmt(priceGST)} securely <ArrowRight size={15} /></>}
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 }}>
                <ShieldCheck size={13} color={T.textMuted} />
                <span style={{ fontSize: 12, color: T.textMuted }}>Secured by PayU · 256-bit SSL encryption</span>
              </div>
            </form>
          </div>

          {/* Right — order summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Plan summary */}
            <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 20, padding: "24px 20px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.accent}, transparent)` }} />
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: T.accent, textTransform: "uppercase", marginBottom: 16 }}>
                Order Summary
              </div>

              {/* Plan details */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {[
                  { label: "Diet",     value: DIET_LABELS[diet] || diet },
                  { label: "Duration", value: DUR_LABELS[dur]   || dur  },
                  { label: "Meals",    value: MEAL_LABELS[meal]  || meal },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: T.textMuted }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: T.cardBorder, marginBottom: 16 }} />

              {/* Price breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: T.textMuted }}>Plan price</span>
                  <span style={{ fontSize: 13, color: T.textPrimary }}>{fmt(price)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: T.textMuted }}>GST (5%)</span>
                  <span style={{ fontSize: 13, color: T.textPrimary }}>{fmt(priceGST - price)}</span>
                </div>
                <div style={{ height: 1, background: T.cardBorder, margin: "4px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>Total</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: T.accent }}>{fmt(priceGST)}</span>
                </div>
              </div>
            </div>

            {/* Free delivery badge */}
            <div style={{
              background: "rgba(132,204,22,0.05)", border: "1px solid rgba(132,204,22,0.2)",
              borderRadius: 12, padding: "14px 18px",
              fontSize: 13, color: T.textSecond, lineHeight: 1.6,
            }}>
              🚚 <strong style={{ color: T.textPrimary }}>Free delivery</strong> — 7am–10am daily to your door in Kharadi, Viman Nagar &amp; nearby areas.
            </div>

            {/* WhatsApp alternative */}
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi FitFuel! I want to order:\n${productinfo}\nTotal: ${fmt(priceGST)} (incl. GST)`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "transparent", border: `1px solid ${T.cardBorder}`,
                borderRadius: 12, padding: "13px 0",
                fontSize: 13, fontWeight: 700, color: T.textSecond,
                textDecoration: "none", transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(132,204,22,0.3)";
                (e.currentTarget as HTMLElement).style.color = T.textPrimary;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = T.cardBorder;
                (e.currentTarget as HTMLElement).style.color = T.textSecond;
              }}
            >
              <MessageCircle size={15} />
              Order via WhatsApp instead
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
          .name-grid     { grid-template-columns: 1fr !important; }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

// ─── Page wrapper (Suspense required for useSearchParams) ─────────────────────
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#a3a3a3" }}>
        Loading checkout...
      </div>
    }>
      <CheckoutInner />
    </Suspense>
  );
}
