"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, MessageCircle, Truck, ChefHat, Clock, Banknote } from "lucide-react";

const T = {
  bg:          "#0a0a0a",
  card:        "#111111",
  cardBorder:  "#1f1f1f",
  accent:      "#84cc16",
  textPrimary: "#ffffff",
  textSecond:  "#a3a3a3",
  textMuted:   "#737373",
};

const WA_NUMBER = "919579738811";
function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }

function ConfirmationInner() {
  const params  = useSearchParams();
  const router  = useRouter();

  const txnid   = params.get("txnid")  || "";
  const amount  = Number(params.get("amount") || 0);
  const isCOD   = params.get("cod") === "1";
  const orderNo = params.get("order") || txnid;

  const waText = encodeURIComponent(
    `Hi FitFuel! My order is confirmed.\nOrder: ${orderNo}\nAmount: ${isCOD ? fmt(amount) + " (COD)" : fmt(amount)}\nPlease share delivery details. 🙏`
  );

  const steps = [
    { icon: <CheckCircle size={18} />, title: "Order confirmed",   sub: "We've received your order"                        },
    { icon: <ChefHat     size={18} />, title: "Fresh preparation", sub: "Your meals are cooked fresh daily in our kitchen" },
    { icon: <Clock       size={18} />, title: "Delivery by 10am",  sub: "7am – 10am to your door every day"                },
    { icon: <Truck       size={18} />, title: isCOD ? "Pay cash at door" : "Payment received ✓",
      sub: isCOD ? `Keep ${fmt(amount)} + 5% GST ready` : "Paid online via PayU"                                          },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.textPrimary, paddingTop: 100, paddingBottom: 80 }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 16px", boxSizing: "border-box" }}>

        {/* Checkmark */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}
        >
          <div style={{
            width: 88, height: 88, borderRadius: "50%",
            background: "rgba(132,204,22,0.08)",
            border: "2px solid rgba(132,204,22,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {isCOD
              ? <Banknote size={44} color={T.accent} strokeWidth={1.5} />
              : <CheckCircle size={44} color={T.accent} strokeWidth={1.5} />}
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ textAlign: "center", marginBottom: 36 }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: T.accent, textTransform: "uppercase", marginBottom: 12 }}>
            {isCOD ? "Order Placed" : "Payment Confirmed"}
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(2rem, 8vw, 3rem)",
            fontWeight: 900, textTransform: "uppercase",
            color: T.textPrimary, lineHeight: 1, margin: "0 0 12px",
          }}>
            {isCOD ? "Order Confirmed!" : "You're All Set!"}
          </h1>
          <p style={{ fontSize: 15, color: T.textSecond, lineHeight: 1.7, margin: 0 }}>
            {isCOD
              ? <>Keep <strong style={{ color: T.textPrimary }}>{fmt(amount)}</strong> + 5% GST ready at delivery. Fresh meals arrive <strong style={{ color: T.textPrimary }}>7am–10am</strong> daily.</>
              : <>Your FitFuel order is confirmed. Fresh meals at your door between <strong style={{ color: T.textPrimary }}>7am–10am</strong> daily.</>
            }
          </p>
        </motion.div>

        {/* Order details card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{
            background: T.card, border: `1px solid ${T.cardBorder}`,
            borderRadius: 20, padding: "24px 20px",
            marginBottom: 16, position: "relative", overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.accent}, transparent)` }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: T.accent, textTransform: "uppercase", marginBottom: 16 }}>
            Order Details
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {orderNo && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: T.textMuted }}>Order ID</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, fontFamily: "monospace" }}>{orderNo}</span>
              </div>
            )}
            {amount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: T.textMuted }}>{isCOD ? "Pay at door" : "Amount paid"}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: T.accent }}>{fmt(amount)}{isCOD ? " + GST" : ""}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: T.textMuted }}>Payment</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: isCOD ? "#fbbf24" : T.accent }}>
                {isCOD ? "💵 Cash on Delivery" : "✅ Paid via PayU"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* What happens next */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{
            background: T.card, border: `1px solid ${T.cardBorder}`,
            borderRadius: 20, padding: "24px 20px", marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: T.accent, textTransform: "uppercase", marginBottom: 20 }}>
            What happens next
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(132,204,22,0.08)", border: "1px solid rgba(132,204,22,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: T.accent,
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${waText}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: T.accent, color: "#000", fontWeight: 900, fontSize: 13,
              padding: "15px 0", borderRadius: 12, textDecoration: "none",
              letterSpacing: "0.08em", textTransform: "uppercase",
              boxShadow: "0 4px 20px rgba(132,204,22,0.35)",
            }}
          >
            <MessageCircle size={15} /> WhatsApp Us
          </a>
          <button
            onClick={() => router.push("/plans")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "transparent", border: `1px solid ${T.cardBorder}`,
              borderRadius: 12, padding: "14px 0",
              fontSize: 13, fontWeight: 700, color: T.textSecond, cursor: "pointer",
            }}
          >
            View Plans
          </button>
        </motion.div>

      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#a3a3a3" }}>
        Loading...
      </div>
    }>
      <ConfirmationInner />
    </Suspense>
  );
}