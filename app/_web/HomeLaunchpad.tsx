import Link from "next/link";
import {
  BookOpen,
  Activity,
  Scale,
  LayoutDashboard,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import s from "./home-launchpad.module.css";

export default function HomeLaunchpad() {
  /* Renders inside the single dashboard section (DashboardBand in
     HomeSections), under its h2 — so this heading is an h3, not an h2. */
  return (
    <section className={s.launchpad} aria-labelledby="daily-tools-heading">
      <div className={s.heading}>
        <div>
          <h3 id="daily-tools-heading">Your daily tools</h3>
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
      {/* 2026-11-10 conversion restructure: the "Explore all services"
          directory is gone. It was 13 links (the 11 homepage capabilities
          plus Corporate meals and Gyms & partners) and the strip is removed
          from the homepage by the brief. The pages themselves are untouched
          and stay reachable from the footer, the rail menu and /services. */}
    </section>
  );
}
