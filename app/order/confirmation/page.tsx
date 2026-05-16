"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, MessageCircle } from "lucide-react";

const T = {
  bg: "#0a0a0a", card: "#111111", cardBorder: "#1f1f1f",
  accent: "#84cc16", textPrimary: "#ffffff", textSecond: "#a3a3a3", textMuted: "#737373",
};

const WA_NUMBER = "919579738811";

function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }

function SuccessInner() {
  const params  = useSearchParams();
  const txnid   = params.get("txnid")  || "";
  const amount  = params.get("amount") || "";

  return (
    <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%", maxWidth: 520, textAlign: "center" }}
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4, type: "spring", stiffness: 200 }}
          style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "rgba(132,204,22,0.1)",
            border: "2px solid rgba(132,204,22,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
          }}
        >
          <CheckCircle size={40} color={T.accent} />
        </motion.div>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: T.accent, textTransform: "uppercase", marginBottom: 12 }}>
          Payment Confirmed
        </div>

        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "clamp(2rem, 8vw, 3.5rem)",
          fontWeight: 900, textTransform: "uppercase",
          color: T.textPrimary, lineHeight: 1, marginBottom: 16,
        }}>
          You're all set!
        </h1>

        <p style={{ fontSize: 15, color: T.textSecond, lineHeight: 1.7, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
          Your FitFuel order is confirmed. Fresh meals will be at your door between <strong style={{ color: T.textPrimary }}>7am–10am</strong> starting tomorrow.
        </p>

        {/* Order details card */}
        {txnid && (
          <div style={{
            background: T.card, border: `1px solid ${T.cardBorder}`,
            borderRadius: 16, padding: "20px 24px",
            marginBottom: 28, textAlign: "left",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Transaction ID", value: txnid },
                { label: "Amount paid",    value: amount ? fmt(Math.round(Number(amount))) : "—" },
                { label: "Status",         value: "✅ Paid" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: T.textMuted }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What happens next */}
        <div style={{
          background: "rgba(132,204,22,0.05)", border: "1px solid rgba(132,204,22,0.18)",
          borderRadius: 14, padding: "18px 20px",
          marginBottom: 28, textAlign: "left",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            What happens next
          </div>
          {[
            "You'll receive a WhatsApp confirmation within 30 minutes",
            "Our kitchen starts prep early morning with fresh ingredients",
            "Meals delivered 7am–10am to your registered address",
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(132,204,22,0.15)", border: "1px solid rgba(132,204,22,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, fontWeight: 800, color: T.accent }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 13, color: T.textSecond, lineHeight: 1.6 }}>{step}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/plans" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: T.accent, color: "#000",
            fontWeight: 800, fontSize: 13, padding: "12px 24px",
            borderRadius: 10, textDecoration: "none",
            letterSpacing: "0.07em", textTransform: "uppercase",
          }}>
            View Plans <ArrowRight size={14} />
          </Link>
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi FitFuel! I just completed my order. My transaction ID is: " + txnid)}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "transparent", border: `1px solid ${T.cardBorder}`,
              color: T.textSecond, fontWeight: 700, fontSize: 13,
              padding: "12px 20px", borderRadius: 10, textDecoration: "none",
              letterSpacing: "0.07em", textTransform: "uppercase",
            }}
          >
            <MessageCircle size={14} /> WhatsApp Us
          </a>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#a3a3a3" }}>
        Loading...
      </div>
    }>
      <SuccessInner />
    </Suspense>
  );
}
