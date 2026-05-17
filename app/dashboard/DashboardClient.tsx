"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  Zap, ShoppingBag, Activity, Utensils, Dumbbell, LogOut, User, ChevronRight,
} from "lucide-react";

const T = {
  bg: "#0a0a0a", card: "#111111", border: "#1f1f1f",
  accent: "#84cc16", text: "#f9fafb",
  textSecond: "#a3a3a3", textMuted: "#737373",
};

const MEAL_LABEL: Record<string, string> = {
  BREAKFAST_LUNCH: "Breakfast + Lunch",
  SNACK_DINNER:    "Snack + Dinner",
  ALL_FOUR:        "All 4 Meals",
};
const DUR_LABEL: Record<string, string> = {
  TRIAL_DAY:             "Trial Day",
  WEEKLY:                "Weekly",
  BI_WEEKLY:             "Bi-Weekly",
  MONTHLY_EXCL_WEEKENDS: "Monthly (excl. weekends)",
  ONE_MONTH:             "1 Month",
  TWO_MONTH:             "2 Months",
  THREE_MONTH:           "3 Months",
};
const STATUS_COLOR: Record<string, string> = {
  CONFIRMED:       "#84cc16",
  PENDING_PAYMENT: "#facc15",
  CANCELLED:       "#ef4444",
  DELIVERED:       "#22c55e",
  PROCESSING:      "#60a5fa",
};

const comingSoon = [
  { icon: <Dumbbell size={20} />, label: "Exercise Library", desc: "Workouts, sets, reps — beginner to expert", phase: 7 },
];

export default function DashboardClient({ session, orders, user }: { session: any; orders: any[]; user: any }) {
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div style={{ background: T.bg, minHeight: "100vh", paddingTop: 88, paddingBottom: 80, color: T.text }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${T.border}`, overflow: "hidden", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {user?.image
                ? <img src={user.image} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <User size={22} color={T.textMuted} />}
            </div>
            <div>
              <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 3 }}>Welcome back</p>
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", lineHeight: 1 }}>
                {firstName} <span style={{ color: T.accent }}>💪</span>
              </h1>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, color: T.textMuted, cursor: "pointer" }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* Active Plan */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 32px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.accent}, transparent)` }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Active Plan</p>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>No active plan yet</h2>
              <p style={{ fontSize: 14, color: T.textSecond, lineHeight: 1.6 }}>Start with a trial day for just ₹400 — fresh meals delivered to your door.</p>
            </div>
            <Link href="/plans" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.accent, color: "#000", fontWeight: 800, fontSize: 13, textDecoration: "none", padding: "11px 22px", borderRadius: 8, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
              <Zap size={14} fill="currentColor" /> Order Now
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 32px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <ShoppingBag size={18} color={T.accent} />
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Orders</h2>
            <span style={{ fontSize: 12, color: T.textMuted, marginLeft: 4 }}>({orders.length})</span>
          </div>

          {orders.length === 0 ? (
            <div style={{ border: `1px dashed ${T.border}`, borderRadius: 10, padding: "32px 24px", textAlign: "center" }}>
              <ShoppingBag size={32} color={T.border} style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: 14, color: T.textMuted }}>No orders yet. Your order history will appear here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {orders.map((order: any) => {
                const item = order.items?.[0];
                return (
                  <div key={order.id} style={{ background: "#0f0f0f", border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{order.orderNumber}</p>
                      <p style={{ fontSize: 12, color: T.textMuted }}>
                        {item ? `${MEAL_LABEL[item.mealsPerDay] ?? item.mealsPerDay} · ${DUR_LABEL[item.duration] ?? item.duration}` : "—"}
                      </p>
                      <p style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>₹{order.totalRs.toLocaleString("en-IN")}</p>
                      <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLOR[order.status] ?? T.textMuted, background: "#1a1a1a", border: `1px solid ${T.border}`, borderRadius: 4, padding: "2px 8px" }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Features */}
        <p style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Features</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>

          {/* Body Metrics — LIVE */}
          <Link href="/dashboard/body-metrics" style={{ textDecoration: "none" }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "22px 24px", display: "flex", alignItems: "flex-start", gap: 16, cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#365314")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1a2e05", border: `1px solid #365314`, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, flexShrink: 0 }}>
                <Activity size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Body Metrics</p>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.accent, background: "#1a2e05", border: `1px solid #365314`, borderRadius: 4, padding: "2px 6px" }}>LIVE</span>
                </div>
                <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5 }}>Track 13 body composition parameters — connect your FitDays BLE scale or log manually.</p>
              </div>
              <ChevronRight size={16} color={T.textMuted} style={{ flexShrink: 0, marginTop: 2 }} />
            </div>
          </Link>

          {/* Nutrition Tracker — LIVE */}
          <Link href="/dashboard/nutrition" style={{ textDecoration: "none" }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "22px 24px", display: "flex", alignItems: "flex-start", gap: 16, cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#365314")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1a2e05", border: `1px solid #365314`, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, flexShrink: 0 }}>
                <Utensils size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Nutrition Tracker</p>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.accent, background: "#1a2e05", border: `1px solid #365314`, borderRadius: 4, padding: "2px 6px" }}>LIVE</span>
                </div>
                <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5 }}>Log meals, track calories, macros and water daily.</p>
              </div>
              <ChevronRight size={16} color={T.textMuted} style={{ flexShrink: 0, marginTop: 2 }} />
            </div>
          </Link>

          {/* Coming Soon cards */}
          {comingSoon.map((item) => (
            <div key={item.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "22px 24px", display: "flex", alignItems: "flex-start", gap: 16, opacity: 0.6 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1a1a1a", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 14, fontWeight: 700 }}>{item.label}</p>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, background: "#1a1a1a", border: `1px solid ${T.border}`, borderRadius: 4, padding: "2px 6px" }}>PHASE {item.phase}</span>
                </div>
                <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}

        </div>

        {/* Account */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Account</h2>
            <Link href="/dashboard/profile" style={{ fontSize: 13, fontWeight: 600, color: T.accent, textDecoration: "none" }}>
              Edit Profile →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Row label="Name"  value={user?.name  ?? "—"} />
            <Row label="Email" value={user?.email ?? "—"} />
            <Row label="Phone" value={user?.phone ?? "—"} />
            <Row label="Role"  value={user?.role  ?? "CUSTOMER"} />
          </div>
        </div>

      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #161616", gap: 12 }}>
      <span style={{ fontSize: 13, color: "#737373", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#f9fafb", textAlign: "right", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}