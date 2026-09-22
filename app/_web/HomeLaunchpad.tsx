import Link from "next/link";
import {
  BookOpen,
  Activity,
  Scale,
  LayoutDashboard,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { HOME_CAPABILITIES } from "./home-capabilities";
import s from "./home-launchpad.module.css";

export default function HomeLaunchpad() {
  return (
    <section className={s.launchpad} aria-labelledby="daily-tools-heading">
      <div className={s.heading}>
        <div>
          <h2 id="daily-tools-heading">Your daily tools</h2>
        </div>
        <Link href="/dashboard-preview">Explore a sample day</Link>
      </div>
      <nav className={s.tools} aria-label="Daily FitFuel tools">
        <Link href="/dashboard">
          <LayoutDashboard size={21} />
          <span>
            <b>Today</b>
            <small>Meals, delivery and orders</small>
          </span>
        </Link>
        <Link href="/dashboard/nutrition">
          <BookOpen size={21} />
          <span>
            <b>Food & water</b>
            <small>Keep your day up to date</small>
          </span>
        </Link>
        <Link href="/dashboard/exercises">
          <Activity size={21} />
          <span>
            <b>Workouts</b>
            <small>Workouts, sets and reps</small>
          </span>
        </Link>
        <Link href="/dashboard/body-metrics">
          <Scale size={21} />
          <span>
            <b>Measurements</b>
            <small>Manual or compatible scale</small>
          </span>
        </Link>
        <Link href="/dashboard/progress">
          <TrendingUp size={21} />
          <span>
            <b>Progress</b>
            <small>Trends and consistency</small>
          </span>
        </Link>
        <button
          type="button"
          onClick={() =>
            document.getElementById("fitfuel-coach-trigger")?.click()
          }
        >
          <Sparkles size={21} />
          <span>
            <b>AI coach</b>
            <small>Your logs in context</small>
          </span>
        </button>
      </nav>
      <details className={s.explore}>
      <summary>Explore all services and how they work</summary>
      <nav
        className={s.directory}
        aria-label="Explore the full FitFuel product"
      >
        {HOME_CAPABILITIES.map((item) => (
          <a key={item.id} href={`#${item.id}`}>
            {item.label}
          </a>
        ))}
        <Link href="/corporate">Corporate meals</Link>
        <Link href="/partners">Gyms & partners</Link>
      </nav>
      </details>
    </section>
  );
}
