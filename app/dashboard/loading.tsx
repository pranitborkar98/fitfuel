import { screen } from "@/app/_app/theme";
import s from "./dashboard.module.css";

export default function DashboardLoading() {
  return (
    <div className={s.page} aria-busy="true">
      <h1 style={screen()}>Your dashboard</h1>
      <p role="status" className={s.pageIntro}>
        Loading your meals, diary and recent activity…
      </p>
      <div className={s.loadingPanel} aria-hidden="true" />
    </div>
  );
}
