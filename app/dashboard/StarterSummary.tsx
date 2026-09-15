import Link from "next/link";
import s from "./dashboard.module.css";

export type StarterSummaryData = {
  calories: number;
  protein: number;
  waterMl: number;
  entries: number;
  calorieTarget: number | null;
  weightKg: number | null;
  measuredAt: string | null;
};

export default function StarterSummary({ data }: { data: StarterSummaryData }) {
  return (
    <section className={s.starterSummary} aria-labelledby="diary-summary-title">
      <div>
        <h2 id="diary-summary-title">Your day so far</h2>
        <p>
          {data.entries
            ? `${data.entries} food ${data.entries === 1 ? "entry" : "entries"} in your diary today.`
            : "Nothing logged today yet. Start with your last meal or a glass of water."}
        </p>
        <Link href="/dashboard/nutrition">Open food & water diary →</Link>
      </div>
      <dl>
        <div>
          <dt>Food logged</dt>
          <dd>
            {Math.round(data.calories).toLocaleString("en-IN")}{" "}
            <small>kcal</small>
          </dd>
        </div>
        <div>
          <dt>Protein logged</dt>
          <dd>
            {Math.round(data.protein)} <small>g</small>
          </dd>
        </div>
        <div>
          <dt>Water logged</dt>
          <dd>
            {data.waterMl.toLocaleString("en-IN")} <small>ml</small>
          </dd>
        </div>
        <div>
          <dt>
            Latest weight
            {data.measuredAt
              ? ` · ${new Date(data.measuredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}`
              : ""}
          </dt>
          <dd>
            {data.weightKg ?? "Not recorded"}
            {data.weightKg !== null && <small> kg</small>}
          </dd>
        </div>
      </dl>
      <p className={s.starterNote}>
        {data.calorieTarget
          ? `Your saved diary target is ${Math.round(data.calorieTarget).toLocaleString("en-IN")} kcal.`
          : "Set your personal targets in the nutrition diary. No meal subscription is needed to keep a diary."}
      </p>
    </section>
  );
}
