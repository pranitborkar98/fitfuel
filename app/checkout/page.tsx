"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ShieldCheck, MessageCircle, AlertCircle,
  Banknote, CreditCard, MapPin, Plus,
} from "lucide-react";
import DeliveryWindowToggle from "@/components/DeliveryWindowToggle";
import FirstDeliveryNotice from "@/components/FirstDeliveryNotice";
import { DELIVERY_WINDOWS } from "@/lib/delivery-windows";
import { decomposePrice, durationKeyFromShort } from "@/lib/pricing-decomposition";
import { WHATSAPP_NUMBER } from "@/lib/site";

// ─── Design tokens ────────────────────────────────────────────────────────────
/* ON THE HOMEPAGE SYSTEM, 2026-08-21. Every value here was already a
   tokens.css colour written out as raw hex — the right palette under the wrong
   names, so a palette move on the design system would have stranded the one
   page that takes money. Names now, values unchanged.

   NOTHING BELOW THIS OBJECT WAS TOUCHED. PayU, the price decomposition, the
   COD path, the validation and the WhatsApp handoff are exactly as they were:
   this is the surface where a styling mistake costs a sale, so the diff is
   colours, radius and type and nothing else. */
const T = {
  bg:          "var(--fk-paper)",
  card:        "var(--fk-surface)",
  cardBorder:  "var(--fk-line)",
  accent:      "var(--fk-green)",
  accentLight: "var(--fk-green-deep)",
  textPrimary: "var(--fk-ink)",
  textSecond:  "var(--fk-ink-2)",
  textMuted:   "var(--fk-ink-3)",
};

// Was a local copy of the OLD number that Decision #206 retired, so anyone
// who hit trouble at checkout messaged a dead line. Imported now.
const WA_NUMBER = WHATSAPP_NUMBER;

// ─── Plan labels ──────────────────────────────────────────────────────────────
const DIET_LABELS: Record<string, string> = {
  veg: "Vegetarian", egg: "Eggetarian", nonveg: "Non-Vegetarian", jain: "Jain",
};
const DUR_LABELS: Record<string, string> = {
  trial: "Trial day", weekly: "1 week (7 days)", biweekly: "2 weeks (14 days)",
  monthly_ex: "Weekdays for a month", monthly: "1 month",
  two_month: "2 months", three_month: "3 months",
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
      <label htmlFor={name} style={{ display: "block", fontSize: 14, fontWeight: 600, color: T.textSecond, marginBottom: 7 }}>
        {label}{required && <span style={{ color: T.accent, marginLeft: 2 }}>*</span>}
      </label>
      <input
        id={name} type={type} name={name} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required} maxLength={maxLength}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", background: "var(--fk-warm)",
          border: `1px solid ${focused ? "rgba(132,204,22,0.5)" : T.cardBorder}`,
          borderRadius: 8, padding: "13px 16px",
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
    { id: "online", label: "Pay online",       sub: "UPI, cards and net banking via PayU", icon: <CreditCard size={18} /> },
    { id: "cod",    label: "Cash on delivery", sub: "Pay when your meals arrive",          icon: <Banknote size={18} /> },
  ];
  return (
    <div style={{ marginBottom: 28 }}>
      <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: T.textSecond, marginBottom: 10 }}>
        Payment method <span style={{ color: T.accent }}>*</span>
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {options.map(opt => {
          const active = value === opt.id;
          return (
            <button key={opt.id} type="button" onClick={() => onChange(opt.id)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                background: active ? "rgba(132,204,22,0.07)" : "var(--fk-warm)",
                border: `1px solid ${active ? "rgba(132,204,22,0.5)" : T.cardBorder}`,
                borderRadius: 8, padding: "14px 16px",
                cursor: "pointer", textAlign: "left", transition: "all 0.2s",
              }}
            >
              <div style={{ color: active ? T.accent : T.textMuted, marginTop: 1, flexShrink: 0 }}>{opt.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: active ? T.textPrimary : T.textSecond, marginBottom: 2 }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>{opt.sub}</div>
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
        background: selected ? "rgba(132,204,22,0.07)" : "var(--fk-warm)",
        border: `1px solid ${selected ? "rgba(132,204,22,0.5)" : T.cardBorder}`,
        borderRadius: 8, padding: "14px 16px",
        cursor: "pointer", transition: "all 0.2s",
        display: "flex", alignItems: "flex-start", gap: 12,
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0, marginTop: 1,
        background: selected ? "rgba(132,204,22,0.15)" : "var(--fk-warm-2)",
        border: `1px solid ${selected ? "rgba(132,204,22,0.4)" : T.cardBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: selected ? T.accent : T.textMuted,
      }}>
        <MapPin size={14} />
      </div>
      <div style={{ flex: 1 }}>
        {address.label && (
          <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, marginBottom: 3 }}>
            {address.label}
          </div>
        )}
        <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, marginBottom: 2 }}>{address.line1}</div>
        {address.line2 && <div style={{ fontSize: 12, color: T.textSecond }}>{address.line2}</div>}
        <div style={{ fontSize: 12, color: T.textMuted }}>{address.area}, {address.city} – {address.pincode}</div>
        {address.landmark && <div style={{ fontSize: 12, color: T.textMuted }}>Near: {address.landmark}</div>}
      </div>
      {selected && (
        <div style={{ width: 18, height: 18, borderRadius: 8, background: T.accent, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
  const planSlug = params.get("planSlug") || "";   // LOOP-3: carry the chosen plan to the order
  const error    = params.get("error");
  const errMsg   = params.get("msg");
  const [verifiedSubtotal, setVerifiedSubtotal] = useState<number | null>(null);
  const [selectionLoading, setSelectionLoading] = useState(true);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [verifiedPlanName, setVerifiedPlanName] = useState<string | null>(null);
  const rawPrice = verifiedSubtotal ?? 0;

  // Public query parameters never create a reduced-value payment path. The
  // preview and the server-authoritative charge use the selected-plan subtotal.

  // R-PRICE — coupon state (declared before the total computation that reads `discount`)
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [discountSource, setDiscountSource] = useState<"coupon" | "referral" | null>(null);
  const [pricingNotice, setPricingNotice] = useState<string | null>(null);

  // R-PRICE (#189) — marketing decomposition of the (GST-exclusive) anchor price.
  // base + delivery + packaging = subtotal (rawPrice); GST on top → total.
  // Display-only: the order still records subtotal/gst/total exactly as before.
  const bd = decomposePrice({ subtotalRs: rawPrice, duration: durationKeyFromShort(dur) });
  // coupon discount reduces the taxable subtotal; GST recomputes on the net.
  const effSubtotal = Math.max(0, rawPrice - discount);
  const effGst = Math.round(effSubtotal * 0.05);
  const grandTotal = effSubtotal + effGst; // GST-inclusive collected

  const productinfo = `${verifiedPlanName || "FitFuel meal plan"} · ${DUR_LABELS[dur] || dur} · ${MEAL_LABELS[meal] || meal} · ${DIET_LABELS[diet] || diet}`;

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
  const payableTotal = Math.max(payMethod === "online" ? 1 : 0, grandTotal - (useCredit ? creditApplicable : 0));

  useEffect(() => {
    let cancelled = false;
    const loadSelection = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setSelectionLoading(true);
      setSelectionError(null);
      setVerifiedSubtotal(null);
      try {
        const response = await fetch("/api/checkout/physical-selection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planSlug, diet, dur, meal }),
        });
        const data: unknown = await response.json().catch(() => null);
        const message = data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error
          : "This plan selection is not available.";
        if (!response.ok) throw new Error(message);
        if (!cancelled && data && typeof data === "object") {
          const subtotal = "subtotalRs" in data ? Number(data.subtotalRs) : Number.NaN;
          const plan = "plan" in data && data.plan && typeof data.plan === "object" ? data.plan : null;
          setVerifiedSubtotal(Number.isFinite(subtotal) ? subtotal : null);
          setVerifiedPlanName(plan && "name" in plan && typeof plan.name === "string" ? plan.name : null);
        }
      } catch (fetchError: unknown) {
        if (!cancelled) setSelectionError(fetchError instanceof Error ? fetchError.message : "This plan selection is not available.");
      } finally {
        if (!cancelled) setSelectionLoading(false);
      }
    };
    void loadSelection();
    return () => { cancelled = true; };
  }, [planSlug, diet, dur, meal]);

  // Pre-fill name + email from session
  useEffect(() => {
    if (session?.user) {
      const parts = session.user.name?.split(" ") ?? [];
      // Session data is an external source; this is the editable-form prefill.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      // This flag represents the external address request, not derived UI state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  async function applyCouponFn() {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    setCouponBusy(true); setCouponMsg(null);
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code, planSlug, dur, email: form.email || undefined,
          isDigital: false, subtotalRs: rawPrice, deliveryRs: bd?.deliveryRs ?? 0, meal,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setDiscount(data.discountRs); setCouponApplied(code);
        setDiscountSource("coupon");
        setPricingNotice(null);
        setCouponMsg({ ok: true, text: `Applied, you save ${data.display.discount}` });
      } else {
        setDiscount(0); setCouponApplied(null); setDiscountSource(null);
        setCouponMsg({ ok: false, text: data.reason || "Invalid coupon." });
      }
    } catch {
      setDiscount(0); setCouponApplied(null); setDiscountSource(null);
      setCouponMsg({ ok: false, text: "Could not validate coupon." });
    } finally {
      setCouponBusy(false);
    }
  }

  function clearCoupon() {
    setCoupon(""); setDiscount(0); setCouponApplied(null); setCouponMsg(null); setDiscountSource(null); setPricingNotice(null);
  }

  function acceptServerTotal(data: unknown, status: number): boolean {
    if (status !== 409 || !data || typeof data !== "object" || !("totalRs" in data) || !Number.isFinite(Number(data.totalRs))) return false;
    const serverDiscount = Math.max(0, Number("discountRs" in data ? data.discountRs : 0));
    const serverCoupon = "couponCode" in data && typeof data.couponCode === "string" ? data.couponCode : null;
    const fromReferral = Number("referralDiscountRs" in data ? data.referralDiscountRs : 0) > 0 && !serverCoupon;
    setDiscount(serverDiscount);
    setDiscountSource(fromReferral ? "referral" : serverCoupon ? "coupon" : null);
    setCouponApplied(serverCoupon);
    setCreditApplicable(Math.max(0, Number("creditAppliedRs" in data ? data.creditAppliedRs : 0)));
    setPricingNotice(fromReferral
      ? "Your referral welcome discount is now included. Review the new total, then place your order again."
      : "Your price or available credit changed. Review the new total, then place your order again.");
    return true;
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
          diet, dur, meal, price: rawPrice, deliveryWindow, planSlug,
          useCredit: useCredit && creditApplicable > 0,
          couponCode: couponApplied || undefined,
          expectedTotalRs: payableTotal,
        }),
      });
      const data = await res.json();
      if (acceptServerTotal(data, res.status)) { setLoading(false); return; }
      if (!res.ok) throw new Error(data.error || "Failed to place order");
      router.push(`/order/confirmation?txnid=COD-${encodeURIComponent(data.orderNumber)}&amount=${data.total}&cod=1&order=${data.orderNumber}&window=${deliveryWindow}`);
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
        diet, dur, meal, price: rawPrice, deliveryWindow, planSlug,
        amount: grandTotal.toFixed(2), productinfo,
        useCredit: useCredit && creditApplicable > 0,
        couponCode: couponApplied || undefined,
        expectedTotalRs: payableTotal,
      }),
    });
    const data = await res.json();
    if (acceptServerTotal(data, res.status)) { setLoading(false); return; }
    if (!res.ok) throw new Error(data.error || "Failed to initiate payment");
    setPayuData(data);
  } catch (err) {
    console.error(err);
    alert(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
    const sub = grandTotal;
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
  }, [rawPrice, grandTotal, payMethod]);

  if (selectionLoading) {
    return (
      <main className="fk" aria-busy="true" style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "120px 20px", color: T.textSecond }}>
        <p>Checking this plan and its current price…</p>
      </main>
    );
  }

  if (selectionError || !rawPrice) {
    return (
      /* Keep this branch after every hook so `/checkout` without a selection
         does not change the hook order when query parameters arrive. */
      <div className="fk" style={{ textAlign: "center", padding: "120px 20px", color: T.textSecond }}>
        <p role="alert" style={{ fontSize: 16, marginBottom: 24 }}>{selectionError || "No plan selected. Please choose a plan first."}</p>
        <button onClick={() => router.push("/plans")} style={{
          background: T.accent, color: "#000", fontWeight: 800, fontSize: 13,
          padding: "12px 28px", borderRadius: 8, border: "none", cursor: "pointer",
        }}>View plans</button>
      </div>
    );
  }

  const showAddressForm = useNewAddress || savedAddresses.length === 0;

  return (
    /* `fk` opts this subtree out of the marketing radius ban in
       app/globals.css. Without it every rounded corner set above is flattened
       to 0 by an !important rule and the page keeps the rejected square look. */
    <div className="fk" style={{ background: T.bg, minHeight: "100vh", color: T.textPrimary, paddingTop: 100, paddingBottom: 80 }}>

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
            <div style={{ width: 24, height: 2, background: T.accent, borderRadius: 8 }} />
            <span style={{ fontSize: 14, fontWeight: 650, color: T.accent }}>Checkout</span>
          </div>
          <h1 style={{
            /* Was Barlow Condensed 900 UPPERCASE at 3.5rem. The clamp is the
               plan detail page's own .h1, so the last step of the funnel is
               set at the same size as the step before it. */
            fontFamily: "var(--fk-display)",
            fontSize: "clamp(2rem, 1.4rem + 2.4vw, 3.25rem)",
            fontWeight: 600, textTransform: "none",
            color: T.textPrimary, lineHeight: 1.04, letterSpacing: "-0.025em",
          }}>Complete your order</h1>
        </div>

        {/* Error banner */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 8, padding: "14px 18px", marginBottom: 28,
            }}
          >
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fk-ink)", marginBottom: 2 }}>Payment was not completed</div>
              <div style={{ fontSize: 13, color: T.textSecond }}>
                {errMsg || "Your payment was cancelled or failed. Please try again or order via WhatsApp."}
              </div>
            </div>
          </motion.div>
        )}

        {pricingNotice && (
          <div role="status" style={{
            background: "rgba(132,204,22,0.08)", border: "1px solid rgba(132,204,22,0.35)",
            borderRadius: 12, color: T.textSecond, lineHeight: 1.55, marginBottom: 28, padding: "14px 18px",
          }}>
            <strong style={{ color: T.textPrimary }}>Your total was updated.</strong>{" "}{pricingNotice}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }} className="checkout-grid">

          {/* Left — form */}
          <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "28px 24px" }}>
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
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: T.textSecond, marginBottom: 12 }}>
                  Delivery address <span style={{ color: T.accent }}>*</span>
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
                        background: useNewAddress ? "rgba(132,204,22,0.07)" : "var(--fk-warm)",
                        border: `1px solid ${useNewAddress ? "rgba(132,204,22,0.5)" : T.cardBorder}`,
                        borderRadius: 8, padding: "12px 16px",
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

              {/* When the food actually starts. Sits directly above the window
                  picker because both answer "when", and this is the one a
                  customer is silently guessing at otherwise. */}
              <FirstDeliveryNotice deliveryWindow={deliveryWindow} />

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
                      borderRadius: 8, padding: "12px 16px",
                      fontSize: 13, color: T.textSecond, lineHeight: 1.6,
                    }}>
                      Keep <strong style={{ color: T.textPrimary }}>{fmt(payableTotal)}</strong> ready at delivery.
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
                  color: "#000", fontWeight: 750, fontSize: 15,
                  padding: "15px 0", borderRadius: 8, border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: 0, textTransform: "none",
                  transition: "all 0.2s",
                }}
              >
                {loading
                  ? (payMethod === "cod" ? "Placing order..." : "Redirecting to PayU...")
                  : payMethod === "cod"
                    ? <><Banknote size={15} /> Place COD order · {fmt(payableTotal)}</>
                    : <>Pay {fmt(payableTotal)} securely <ArrowRight size={15} /></>
                }
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 }}>
                <ShieldCheck size={13} color={T.textMuted} />
                <span style={{ fontSize: 12, color: T.textMuted }}>
                  {payMethod === "cod"
                    ? "No payment now · Pay cash at delivery"
                    : "Secure payment handled by PayU"}
                </span>
              </div>

            </form>
          </div>

          {/* Right — order summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderTop: `2px solid ${T.accent}`, borderRadius: 8, padding: "24px 20px", position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, marginBottom: 16 }}>Order summary</div>
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
                <>
                    {/* R-PRICE (#189) — marketing decomposition */}
                    {bd && bd.mrpRs > bd.baseRs && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, color: T.textMuted }}>Plan value</span>
                        <span style={{ fontSize: 13, color: T.textMuted, textDecoration: "line-through" }}>{fmt(bd.mrpRs)}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: T.textMuted }}>Base price</span>
                      <span style={{ fontSize: 13, color: T.textPrimary }}>{fmt(bd.baseRs)}</span>
                    </div>
                    {bd && bd.deliveryRs > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, color: T.textMuted }}>Delivery charges</span>
                        <span style={{ fontSize: 13, color: T.textPrimary }}>{fmt(bd.deliveryRs)}</span>
                      </div>
                    )}
                    {bd && bd.packagingRs > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, color: T.textMuted }}>Packaging &amp; handling</span>
                        <span style={{ fontSize: 13, color: T.textPrimary }}>{fmt(bd.packagingRs)}</span>
                      </div>
                    )}
                    <div style={{ height: 1, background: T.cardBorder, margin: "4px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: T.textMuted }}>Subtotal</span>
                      <span style={{ fontSize: 13, color: T.textPrimary }}>{fmt(bd.subtotalRs)}</span>
                    </div>
                    {discount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, color: T.accent }}>
                          {discountSource === "referral" ? "Referral welcome" : `Coupon (${couponApplied})`}
                        </span>
                        <span style={{ fontSize: 13, color: T.accent }}>{'\u2212'} {fmt(discount)}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: T.textMuted }}>GST (5%)</span>
                      <span style={{ fontSize: 13, color: T.textPrimary }}>{fmt(effGst)}</span>
                    </div>
                    {creditApplicable > 0 && useCredit && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, color: T.accent }}>FitFuel credit</span>
                        <span style={{ fontSize: 13, color: T.accent }}>{'\u2212'} {fmt(Math.min(creditApplicable, grandTotal))}</span>
                      </div>
                    )}
                    <div style={{ height: 1, background: T.cardBorder, margin: "4px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>{payMethod === "cod" ? "Pay at door" : "Total"}</span>
                      <span style={{ fontSize: 22, fontWeight: 800, color: T.accent }}>
                        {fmt(payableTotal)}
                      </span>
                    </div>
                </>
              </div>

              {/* R-PRICE — coupon input */}
              <div style={{ marginTop: 14 }}>
                  <label htmlFor="checkout-coupon" style={{ display: "block", fontSize: 13, fontWeight: 650, color: T.textSecond, marginBottom: 7 }}>Coupon code</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input id="checkout-coupon" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Enter code"
                      style={{ flex: 1, minHeight: 44, background: "var(--fk-warm)", border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "10px 12px", color: T.textPrimary, fontSize: 13, outline: "none" }} />
                    {couponApplied ? (
                      <button type="button" onClick={clearCoupon}
                        style={{ minHeight: 44, background: "transparent", color: T.textMuted, border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "0 14px", fontSize: 13, cursor: "pointer" }}>Remove</button>
                    ) : (
                      <button type="button" onClick={applyCouponFn} disabled={couponBusy || !coupon.trim()}
                        style={{ minHeight: 44, background: couponBusy || !coupon.trim() ? "rgba(132,204,22,0.4)" : T.accent, color: "#000", fontWeight: 800, border: "none", borderRadius: 8, padding: "0 16px", fontSize: 13, cursor: couponBusy ? "not-allowed" : "pointer" }}>{couponBusy ? "…" : "Apply"}</button>
                    )}
                  </div>
                  {couponMsg && <div style={{ fontSize: 12, marginTop: 6, color: couponMsg.ok ? T.accent : "#ef4444" }}>{couponMsg.text}</div>}
              </div>

              {/* 17C-2 — credit toggle (signed-in users only) */}
              {creditApplicable > 0 && (
                <div style={{ background: "rgba(132,204,22,0.04)", border: `1px solid ${useCredit ? T.accent : T.cardBorder}`, borderRadius: 8, padding: "12px 16px", marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", flex: 1 }}>
                    <input type="checkbox" checked={useCredit} onChange={(e) => setUseCredit(e.target.checked)} style={{ width: 18, height: 18, accentColor: T.accent }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Apply {fmt(creditApplicable)} credit</div>
                      <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Balance: {fmt(creditBalance)}</div>
                    </div>
                  </label>
                </div>
              )}
            </div>

            <div style={{
              background: "rgba(132,204,22,0.05)", border: "1px solid rgba(132,204,22,0.2)",
              borderRadius: 8, padding: "14px 18px", fontSize: 13, color: T.textSecond, lineHeight: 1.6,
            }}>
              <strong style={{ color: T.textPrimary }}>
                Selected window: {DELIVERY_WINDOWS[deliveryWindow].label}, {DELIVERY_WINDOWS[deliveryWindow].time}.
              </strong>{" "}
              The delivery charge is already included in the total above.
            </div>

            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi FitFuel! I want to order:\n${productinfo}\nCurrent checkout total: ${fmt(payableTotal)}. Please confirm any referral discount or credit before placing the order.`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "transparent", border: `1px solid ${T.cardBorder}`,
                borderRadius: 8, minHeight: 44, padding: "13px 0",
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
      <div style={{ background: "var(--fk-paper)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fk-ink-3)" }}>
        Loading checkout...
      </div>
    }>
      <CheckoutInner />
    </Suspense>
  );
}
