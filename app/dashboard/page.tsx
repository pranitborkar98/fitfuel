"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  Zap, ShoppingBag, Activity, Utensils, Dumbbell,
  ChevronRight, LogOut, User, MapPin, Bell
} from "lucide-react";
import Image from "next/image";

const T = {
  bg:         "#0a0a0a",
  card:       "#111111",
  border:     "#1f1f1f",
  accent:     "#84cc16",
  text:       "#f9fafb",
  textSecond: "#a3a3a3",
  textMuted:  "#737373",
};

const comingSoon = [
  {
    icon: <Activity size={20} />,
    label: "Body Metrics",
    desc: "Track weight, BMI, body fat via FitDays BLE scale",
    phase: 5,
  },
  {
    icon: <Utensils size={20} />,
    label: "Nutrition Tracker",
    desc: "Log meals, track calories and macros daily",
    phase: 6,
  },
  {
    icon: <Dumbbell size={20} />,
    label: "Exercise Library",
    desc: "Workouts, sets, reps — beginner to expert",
    phase: 7,
  },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div style={{
        background: T.bg, minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: T.textMuted, fontSize: 14,
      }}>
        Loading...
      </div>
    );
  }

  if (!session) return null;

  const user = session.user;
  const firstName = user.name?.split(" ")[0] ?? "there";

  return (
    <div style={{ background: T.bg, minHeight: "100vh", paddingTop: 88, paddingBottom: 80, color: T.text }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16, marginBottom: 40,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Avatar */}
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              border: `2px solid ${T.border}`,
              overflow: "hidden", flexShrink: 0,
              background: "#1a1a1a",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {user.image ? (
                <img src={user.image} alt={user.name ?? "User"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <User size={22} color={T.textMuted} />
              )}
            </div>
            <div>
              <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 3 }}>Welcome back</p>
              <h1 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 32, fontWeight: 900, textTransform: "uppercase",
                letterSpacing: "-0.01em", lineHeight: 1,
                color: T.text,
              }}>
                {firstName} <span style={{ color: T.accent }}>💪</span>
              </h1>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "transparent", border: `1px solid ${T.border}`,
              borderRadius: 8, padding: "9px 16px",
              fontSize: 13, fontWeight: 600, color: T.textMuted,
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#3a3a3a"; e.currentTarget.style.color = T.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border;   e.currentTarget.style.color = T.textMuted; }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>

        {/* ── Active Plan ── */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 16, padding: "28px 32px", marginBottom: 24,
          position: "relative", overflow: "hidden",
        }}>
          {/* lime top bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.accent}, transparent)` }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Active Plan
              </p>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 6 }}>
                No active plan yet
              </h2>
              <p style={{ fontSize: 14, color: T.textSecond, lineHeight: 1.6 }}>
                Start with a trial day for just ₹400 — fresh meals delivered to your door.
              </p>
            </div>
            <Link
              href="/plans"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: T.accent, color: "#000",
                fontWeight: 800, fontSize: 13, textDecoration: "none",
                padding: "11px 22px", borderRadius: 8,
                textTransform: "uppercase", letterSpacing: "0.06em",
                boxShadow: "0 2px 16px rgba(132,204,22,0.3)",
                whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#a3e635"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = T.accent;  (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              <Zap size={14} fill="currentColor" />
              Order Now
            </Link>
          </div>
        </div>

        {/* ── Recent Orders ── */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 16, padding: "28px 32px", marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShoppingBag size={18} color={T.accent} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Recent Orders</h2>
            </div>
          </div>

          {/* Empty state */}
          <div style={{
            border: `1px dashed ${T.border}`, borderRadius: 10,
            padding: "32px 24px", textAlign: "center",
          }}>
            <ShoppingBag size={32} color={T.border} style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.6 }}>
              No orders yet. Your order history will appear here.
            </p>
          </div>
        </div>

        {/* ── Coming Soon features ── */}
        <p style={{
          fontSize: 12, color: T.textMuted, textTransform: "uppercase",
          letterSpacing: "0.08em", marginBottom: 14,
        }}>
          Coming Soon
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16, marginBottom: 32,
        }}>
          {comingSoon.map((item) => (
            <div
              key={item.label}
              style={{
                background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 14, padding: "22px 24px",
                display: "flex", alignItems: "flex-start", gap: 16,
                opacity: 0.6,
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "#1a1a1a", border: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: T.textMuted, flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{item.label}</p>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: T.textMuted,
                    background: "#1a1a1a", border: `1px solid ${T.border}`,
                    borderRadius: 4, padding: "2px 6px", letterSpacing: "0.05em",
                  }}>
                    PHASE {item.phase}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Account details ── */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 16, padding: "24px 32px",
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 16 }}>Account</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Row label="Name"  value={user.name  ?? "—"} />
            <Row label="Email" value={user.email ?? "—"} />
            <Row label="Role"  value={(session.user as any).role ?? "CUSTOMER"} />
          </div>
        </div>

      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 0", borderBottom: "1px solid #161616",
      gap: 12,
    }}>
      <span style={{ fontSize: 13, color: "#737373", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#f9fafb", textAlign: "right", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}
