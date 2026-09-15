import Link from "next/link";
import {
  Utensils,
  Dumbbell,
  Activity,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import s from "./dashboard.module.css";

export default function QuickActions() {
  return (
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
  );
}
