"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ShieldCheck, MessageCircle, AlertCircle,
  Banknote, CreditCard, FlaskConical, MapPin, Plus, Pencil,
} from "lucide-react";
import DeliveryWindowToggle from "@/components/DeliveryWindowToggle";

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
  monthly_ex: "Monthly excl. weekends", monthly: "1 Month",
  two_month: "2 Months", three_month: "3 Months",
};
const MEAL_LABELS: Record<string, string> = {
  bl: "Breakfast + Lunch", sd: "Snack + Dinner", all: "All 4 meals",
};

function fmt(n: number) { return "\u20B9" + n.toLocaleString("en-IN"); }

// ─── Saved address type ───────────────────────────────────────────────────────
type SavedAddress = {
  id: string;
  label?: string;
  line1: string;
  line2?: string;
  area: string;
  city: string;
  pincode: string;
  landmark?: string;
};

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
        type={type} name={name} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required} maxLength={maxLength}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
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

// ─── Payment method toggle ────────────────────────────────────────────────────
type PayMethod = "online" | "cod";

function PayToggle({ value, onChange }: { value: PayMethod; onChange: (v: PayMethod) => void }) {
  const options: { id: PayMethod; label: string; sub: string; icon: React.ReactNode }[] = [
    { id: "online", label: "Pay Online",        sub: "UPI, cards, net banking via PayU", icon: <CreditCard size={18} /> },
    { id: "cod",    label: "Cash on Delivery",  sub: "Pay when your meals arrive",        icon: <Banknote size={18} /> },
  ];
  return (
    <div style={{ marginBottom: 28 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecond, marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        Payment Method <span style={{ color: T.accent }}>*</span>
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {options.map(opt => {
          const active = value === opt.id;
          return (
            <button key={opt.id} type="button" onClick={() => onChange(opt.id)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                background: active ? "rgba(132,204,22,0.07)" : "#161616",
                border: `1px solid ${active ? "rgba(132,204,22,0.5)" : T.cardBorder}`,
                borderRadius: 12, padding: "14px 16px",
                cursor: "pointer", textAlign: "left", transition: "all 0.2s",
              }}
            >
              <div style={{ color: active ? T.accent : T.textMuted, marginTop: 1, flexShrink: 0 }}>{opt.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: active ? T.textPrimary : T.textSecond, marginBottom: 2 }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>{opt.sub}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Saved address card ───────────────────────────────────────────────────────
function AddressCard({
  address, selected, onSelect,
}: { address: SavedAddress; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect}
      style={{
        width: "100%", textAlign: "left",
        background: selected ? "rgba(132,204,22,0.07)" : "#161616",
        border: `1px solid ${selected ? "rgba(132,204,22,0.5)" : T.cardBorder}`,
        borderRadius: 12, padding: "14px 16px",
        cursor: "pointer", transition: "all 0.2s",
        display: "flex", alignItems: "flex-start", gap: 12,
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0, marginTop: 1,
        background: selected ? "rgba(132,204,22,0.15)" : "#1a1a1a",
        border: `1px solid ${selected ? "rgba(132,204,22,0.4)" : T.cardBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: selected ? T.accent : T.textMuted,
      }}>
        <MapPin size={14} />
      </div>
      <div style={{ flex: 1 }}>
        {address.label && (
          <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>
            {address.label}
          </div>
        )}
        <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, marginBottom: 2 }}>{address.line1}</div>
        {address.line2 && <div style={{ fontSize: 12, color: T.textSecond }}>{address.line2}</div>}
        <div style={{ fontSize: 12, color: T.textMuted }}>{address.area}, {address.city} – {address.pincode}</div>
        {address.landmark && <div style={{ fontSize: 12, color: T.textMuted }}>Near: {address.landmark}</div>}
      </div>
      {selected && (
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: T.accent, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      )}
    </button>
  );
}

// ─── Checkout inner ───────────────────────────────────────────────────────────
function CheckoutInner() {
  const params     = useSearchParams();
  const router     = useRouter();
  const { data: session, status: authStatus } = useSession();

  const diet     = params.get("diet")    || "veg";
  const dur      = params.get("dur")     || "monthly_ex";
  const meal     = params.get("meal")    || "sd";
  const rawPrice = Number(params.get("price") || 0);
  const error    = params.get("error");
  const errMsg   = params.get("msg");

  const isTest   = params.get("test") === "1";
  const price    = isTest ? 1 : rawPrice;
  const priceGST = isTest ? 1 : Math.round(rawPrice * 1.05);

  const productinfo = isTest
    ? "FitFuel TEST TRANSACTION — ignore"
    : `FitFuel ${DUR_LABELS[dur] || dur} · ${MEAL_LABELS[meal] || meal} · ${DIET_LABELS[diet] || diet}`;

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Form state
  const [form, setForm] = useState({
    firstname: "", lastname: "", email: "", phone: "",
    address: "", city: "Pune", pincode: "",
  });
  const [payMethod, setPayMethod] = useState<PayMethod>("online");
  const [deliveryWindow, setDeliveryWindow] = useState<"MORNING" | "EVENING">("MORNING");
  const [loading, setLoading]     = useState(false);
  const [payuData, setPayuData]   = useState<Record<string, string> | null>(null);

  // 17C-2 — credit preview
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditApplicable, setCreditApplicable] = useState(0);
  const [useCredit, setUseCredit] = useState(true);

  // Pre-fill name + email from session
  useEffect(() => {
    if (session?.user) {
      const parts = session.user.name?.split(" ") ?? [];
      setForm(f => ({
        ...f,
        firstname: parts[0] ?? f.firstname,
        lastname:  parts.slice(1).join(" ") ?? f.lastname,
        email:     session.user.email ?? f.email,
      }));
    }
  }, [session]);

  // Fetch saved addresses for logged-in users
  useEffect(() => {
    if (authStatus === "authenticated") {
      setLoadingAddresses(true);
      fetch("/api/user/addresses")
        .then(r => r.json())
        .then(data => {
          setSavedAddresses(data.addresses ?? []);
          // Auto-select first address if available
          if (data.addresses?.length > 0) {
            setSelectedAddressId(data.addresses[0].id);
          } else {
            setUseNewAddress(true);
          }
        })
        .catch(() => setUseNewAddress(true))
        .finally(() => setLoadingAddresses(false));
    } else if (authStatus === "unauthenticated") {
      setUseNewAddress(true);
    }
  }, [authStatus]);

  // Auto-submit PayU form
  useEffect(() => {
    if (payuData) {
      const formEl = document.getElementById("payu-form") as HTMLFormElement;
      if (formEl) formEl.submit();
    }
  }, [payuData]);

  // Get the selected saved address object
  const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId);

  // Determine delivery address for order submission
  function getDeliveryAddress() {
    if (selectedAddress && !useNewAddress) {
      return {
        address: selectedAddress.line1 + (selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""),
        city:    selectedAddress.city,
        pincode: selectedAddress.pincode,
      };
    }
    return { address: form.address, city: form.city, pincode: form.pincode };
  }

  if (!rawPrice && !isTest) {
    return (
      <div style={{ textAlign: "center", padding: "120px 20px", color: T.textSecond }}>
        <p style={{ fontSize: 16, marginBottom: 24 }}>No plan selected. Please choose a plan first.</p>
        <button onClick={() => router.push("/plans")} style={{
          background: T.accent, color: "#000", fontWeight: 800, fontSize: 13,
          padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer",
        }}>View Plans</button>
      </div>
    );
  }

  async function handleCOD() {
    setLoading(true);
    const { address: deliveryAddress, city, pincode } = getDeliveryAddress();
    try {
      const res = await fetch("/api/orders/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: form.firstname, lastname: form.lastname,
          email: form.email, phone: form.phone,
          address: deliveryAddress, city, pincode,
          diet, dur, meal, price: rawPrice, deliveryWindow,
          useCredit: useCredit && creditApplicable > 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");
      router.push(`/order/confirmation?txnid=COD-${Date.now()}&amount=${rawPrice}&cod=1&order=${data.orderNumber}`);
    } catch (err) {
      console.error("[COD]", err);
      alert("Something went wrong. Please try WhatsApp ordering instead.");
      setLoading(false);
    }
  }

  async function handlePayU() {
  setLoading(true);
  const { address: deliveryAddress, city, pincode } = getDeliveryAddress();
  try {
    const res = await fetch("/api/payments/payu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstname: form.firstname, lastname: form.lastname,
        email: form.email, phone: form.phone,
        address: deliveryAddress, city, pincode,
        diet, dur, meal, price: rawPrice, deliveryWindow,
        amount: priceGST.toFixed(2), productinfo,
        useCredit: useCredit && creditApplicable > 0,
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (payMethod === "cod") await handleCOD();
    else await handlePayU();
  }

  // 17C-2 — fetch credit preview when total changes
  useEffect(() => {
    const sub = payMethod === "cod" ? rawPrice : priceGST;
    if (sub <= 0) return;
    fetch(`/api/checkout/credit-preview?subtotal=${sub}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.signedIn && d.balanceRs > 0) {
          setCreditBalance(d.balanceRs);
          setCreditApplicable(d.applicableRs);
        } else {
          setCreditBalance(0); setCreditApplicable(0);
        }
      })
      .catch(() => { setCreditBalance(0); setCreditApplicable(0); });
  }, [rawPrice, priceGST, payMethod]);

  const showAddressForm = useNewAddress || savedAddresses.length === 0;

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.textPrimary, paddingTop: 100, paddingBottom: 80 }}>

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
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: T.accent, textTransform: "uppercase" }}>Checkout</span>
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            fontWeight: 900, textTransform: "uppercase",
            color: T.textPrimary, lineHeight: 1, letterSpacing: "-0.01em",
          }}>Complete Your Order</h1>
        </div>

        {/* Test mode banner */}
        {isTest && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)",
              borderRadius: 12, padding: "14px 18px", marginBottom: 28,
            }}
          >
            <FlaskConical size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24", marginBottom: 2 }}>Test mode — &#8377;1 charge</div>
              <div style={{ fontSize: 13, color: T.textSecond }}>
                Live &#8377;1 test transaction. Remove <code style={{ color: "#fbbf24" }}>?test=1</code> for production.
              </div>
            </div>
          </motion.div>
        )}

        {/* Error banner */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }} className="checkout-grid">

          {/* Left — form */}
          <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 20, padding: "28px 24px" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, marginBottom: 24 }}>Your details</h2>

            <form onSubmit={handleSubmit}>

              {/* Personal details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }} className="name-grid">
                <Field label="First name" name="firstname" value={form.firstname} onChange={v => setForm(f => ({ ...f, firstname: v }))} placeholder="Rahul" />
                <Field label="Last name" name="lastname" value={form.lastname} onChange={v => setForm(f => ({ ...f, lastname: v }))} placeholder="Sharma" required={false} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }} className="name-grid">
                <Field label="Email" name="email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="rahul@email.com" />
                <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="9876543210" maxLength={10} />
              </div>

              {/* Delivery address section */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecond, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Delivery Address <span style={{ color: T.accent }}>*</span>
                </label>

                {/* Saved addresses */}
                {loadingAddresses && (
                  <div style={{ fontSize: 13, color: T.textMuted, padding: "12px 0" }}>Loading saved addresses...</div>
                )}

                {!loadingAddresses && savedAddresses.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                    {savedAddresses.map(addr => (
                      <AddressCard
                        key={addr.id}
                        address={addr}
                        selected={selectedAddressId === addr.id && !useNewAddress}
                        onSelect={() => { setSelectedAddressId(addr.id); setUseNewAddress(false); }}
                      />
                    ))}

                    {/* Use different address toggle */}
                    <button
                      type="button"
                      onClick={() => { setUseNewAddress(!useNewAddress); setSelectedAddressId(null); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: useNewAddress ? "rgba(132,204,22,0.07)" : "#161616",
                        border: `1px solid ${useNewAddress ? "rgba(132,204,22,0.5)" : T.cardBorder}`,
                        borderRadius: 12, padding: "12px 16px",
                        cursor: "pointer", fontSize: 13, fontWeight: 600,
                        color: useNewAddress ? T.textPrimary : T.textSecond,
                        transition: "all 0.2s",
                      }}
                    >
                      <Plus size={15} color={useNewAddress ? T.accent : T.textMuted} />
                      Use a different address
                    </button>
                  </div>
                )}

                {/* New address form — shown when no saved addresses or user wants new one */}
                <AnimatePresence>
                  {showAddressForm && (
                    <motion.div
                      key="new-address"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: savedAddresses.length > 0 ? 4 : 0 }}>
                        <Field
                          label="Street address" name="address"
                          value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))}
                          placeholder="Flat 4B, Koregaon Park Road..."
                          required={showAddressForm}
                        />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="name-grid">
                          <Field label="City" name="city" value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} placeholder="Pune" />
                          <Field label="Pincode" name="pincode" value={form.pincode} onChange={v => setForm(f => ({ ...f, pincode: v }))} placeholder="411014" maxLength={6} required={showAddressForm} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Delivery window */}
              <div style={{ marginBottom: 28 }}><DeliveryWindowToggle value={deliveryWindow} onChange={setDeliveryWindow} /></div>

              {/* Payment method */}
              <PayToggle value={payMethod} onChange={setPayMethod} />

              {/* COD note */}
              <AnimatePresence>
                {payMethod === "cod" && (
                  <motion.div key="cod-note"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{
                      background: "rgba(132,204,22,0.05)", border: "1px solid rgba(132,204,22,0.2)",
                      borderRadius: 10, padding: "12px 16px",
                      fontSize: 13, color: T.textSecond, lineHeight: 1.6,
                    }}>
                      💵 Keep <strong style={{ color: T.textPrimary }}>{fmt(rawPrice)}</strong> ready at delivery.
                      Our delivery partner will collect cash when your meals arrive.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button type="submit" disabled={loading}
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
                {loading
                  ? (payMethod === "cod" ? "Placing order..." : "Redirecting to PayU...")
                  : payMethod === "cod"
                    ? <><Banknote size={15} /> Place COD Order — {fmt(rawPrice)}</>
                    : <>Pay {fmt(priceGST)} securely <ArrowRight size={15} /></>
                }
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 }}>
                <ShieldCheck size={13} color={T.textMuted} />
                <span style={{ fontSize: 12, color: T.textMuted }}>
                  {payMethod === "cod"
                    ? "No payment now · Pay cash at delivery"
                    : "Secured by PayU · 256-bit SSL encryption"}
                </span>
              </div>

            </form>
          </div>

          {/* Right — order summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 20, padding: "24px 20px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.accent}, transparent)` }} />
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: T.accent, textTransform: "uppercase", marginBottom: 16 }}>Order Summary</div>
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
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {isTest ? (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>Test charge</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#fbbf24" }}>&#8377;1</span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: T.textMuted }}>Plan price</span>
                      <span style={{ fontSize: 13, color: T.textPrimary }}>{fmt(rawPrice)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: T.textMuted }}>GST (5%)</span>
                      <span style={{ fontSize: 13, color: payMethod === "cod" ? T.textMuted : T.textPrimary, fontStyle: payMethod === "cod" ? "italic" : "normal" }}>
                        {payMethod === "cod" ? "collected at delivery" : fmt(priceGST - rawPrice)}
                      </span>
                    </div>
                    {creditApplicable > 0 && useCredit && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, color: T.accent }}>FitFuel credit</span>
                        <span style={{ fontSize: 13, color: T.accent }}>{'\u2212'} {fmt(Math.min(creditApplicable, payMethod === "cod" ? rawPrice : priceGST))}</span>
                      </div>
                    )}
                    <div style={{ height: 1, background: T.cardBorder, margin: "4px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>{payMethod === "cod" ? "Pay at door" : "Total"}</span>
                      <span style={{ fontSize: 22, fontWeight: 800, color: T.accent }}>
                        {fmt(Math.max(0, (payMethod === "cod" ? rawPrice : priceGST) - (useCredit ? creditApplicable : 0)))}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* 17C-2 — credit toggle (signed-in users only) */}
              {creditApplicable > 0 && (
                <div style={{ background: "rgba(132,204,22,0.04)", border: `1px solid ${useCredit ? T.accent : T.cardBorder}`, borderRadius: 12, padding: "12px 16px", marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", flex: 1 }}>
                    <input type="checkbox" checked={useCredit} onChange={(e) => setUseCredit(e.target.checked)} style={{ width: 18, height: 18, accentColor: T.accent }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Apply {fmt(creditApplicable)} credit</div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Balance: {fmt(creditBalance)}</div>
                    </div>
                  </label>
                </div>
              )}
            </div>

            <div style={{
              background: "rgba(132,204,22,0.05)", border: "1px solid rgba(132,204,22,0.2)",
              borderRadius: 12, padding: "14px 18px", fontSize: 13, color: T.textSecond, lineHeight: 1.6,
            }}>
              🚚 <strong style={{ color: T.textPrimary }}>Free delivery</strong> — 7am–10am daily to your door in Kharadi, Viman Nagar &amp; nearby areas.
            </div>

            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi FitFuel! I want to order:\n${productinfo}\nTotal: ${fmt(rawPrice)} (excl. GST)`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "transparent", border: `1px solid ${T.cardBorder}`,
                borderRadius: 12, padding: "13px 0",
                fontSize: 13, fontWeight: 700, color: T.textSecond, textDecoration: "none", transition: "all 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(132,204,22,0.3)"; (e.currentTarget as HTMLElement).style.color = T.textPrimary; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.cardBorder; (e.currentTarget as HTMLElement).style.color = T.textSecond; }}
            >
              <MessageCircle size={15} /> Order via WhatsApp instead
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