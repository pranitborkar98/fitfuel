// app/_hp/Areas.tsx
//
// "Do you deliver to me" is the first question a cold visitor has, and on the old
// page it was answered in section eleven.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import s from "./hp.module.css";
import { WRAP, SECTION, GREEN, display, body, label } from "./theme";

const AREAS = [
  "Kharadi", "Viman Nagar", "Kalyani Nagar", "Vadgaon Sheri", "Wagholi",
  "Yerwada", "Koregaon Park", "Sangamwadi", "Magarpatta City", "Amanora",
  "Mundhwa", "Tingre Nagar", "Hadapsar", "Dhanori", "Lohegaon",
];

export default function Areas() {
  return (
    <section aria-labelledby="hp-areas" style={SECTION}>
      <div style={WRAP}>
        <div className={s.reveal}>
          <span style={label(GREEN)}>Fifteen areas, one kitchen</span>
          <h2 id="hp-areas" style={{ ...display("clamp(2.1rem,4.6vw,3.5rem)"), marginTop: 14, maxWidth: "18ch" }}>
            Do we deliver to you?
          </h2>
          <p style={{ ...body(17), marginTop: 18, maxWidth: "54ch" }}>
            Cooked from 04:00 in Kharadi and at your door by 08:00, six days a week.
            We would rather serve east Pune properly than the whole city badly.
          </p>
        </div>

        <div className={s.areas}>
          <span className={`${s.area} ${s.areaHome}`}>Kharadi &middot; the kitchen</span>
          {AREAS.filter((a) => a !== "Kharadi").map((a) => (
            <span key={a} className={s.area}>{a}</span>
          ))}
        </div>

        <div className={s.actions} style={{ marginTop: 28 }}>
          <Link href="/locations" className={s.btnGhost}>
            Check your pincode <ArrowRight size={16} />
          </Link>
          <Link href="/contact" className={s.btnGhost}>
            Not on the list? Tell us <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
