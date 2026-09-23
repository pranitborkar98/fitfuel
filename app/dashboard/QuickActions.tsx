import Link from "next/link";
import {
  Utensils,
  Dumbbell,
  Activity,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Pill,
  Gift,
  Bell,
  User,
} from "lucide-react";
import s from "./dashboard.module.css";

export default function QuickActions() {
  return (
    <section className={s.toolsSection} aria-labelledby="fitfuel-tools-title">
      <div className={s.toolsHeading}>
        <div>
          <p>FitFuel workspace</p>
          <h2 id="fitfuel-tools-title">Everything you can use</h2>
        </div>
        <span>Available with or without a meal subscription</span>
      </div>

      <nav className={s.quickActions} aria-label="Daily actions">
        {[
        {
          href: "/dashboard/nutrition",
          title: "Log food & water",
          detail: "Keep your diary up to date",
          icon: Utensils,
        },
        {
          href: "/dashboard/exercises",
          title: "Start a workout",
          detail: "Choose exercises and record sets",
          icon: Dumbbell,
        },
        {
          href: "/dashboard/body-metrics",
          title: "Record a weigh-in",
          detail: "Manual entry or a compatible scale",
          icon: Activity,
        },
        {
          href: "/dashboard/trainer",
          title: "Ask your coach",
          detail: "Discuss your plan and recent progress",
          icon: Sparkles,
        },
        ].map(({ href, title, detail, icon: Icon }) => (
          <Link href={href} key={href}>
            <Icon size={20} aria-hidden="true" />
            <span>
              <b>{title}</b>
              <small>{detail}</small>
            </span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        ))}
      </nav>

      <nav className={s.productTools} aria-label="All FitFuel tools">
        {[
          { href: "/dashboard/coach", title: "Weekly review", detail: "Plan adjustments from your real week", icon: TrendingUp },
          { href: "/dashboard/progress", title: "Progress", detail: "Weight, consistency and trend lines", icon: TrendingUp },
          { href: "/dashboard/supplements", title: "Supplement guide", detail: "Goal-matched evidence and safety", icon: Pill },
          { href: "/dashboard/referrals", title: "Referrals", detail: "Your code, credits and delivery status", icon: Gift },
          { href: "/dashboard/notification-settings", title: "Notifications", detail: "Control reminders and updates", icon: Bell },
          { href: "/dashboard/profile", title: "Profile and addresses", detail: "Personal details, addresses and plan", icon: User },
        ].map(({ href, title, detail, icon: Icon }) => (
          <Link href={href} key={href}>
            <Icon size={18} aria-hidden="true" />
            <span><b>{title}</b><small>{detail}</small></span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        ))}
      </nav>
    </section>
  );
}
