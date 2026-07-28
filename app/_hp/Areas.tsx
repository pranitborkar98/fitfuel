// app/_hp/Areas.tsx
//
// "Do you deliver to me" is the first question a cold visitor has, and on the
// old page it was answered in section eleven. It is answered here before the
// close, with the kitchen's own area first so the geography is legible.
//
// SERVER COMPONENT.

import Link from "next/link";

import s from "./hp.module.css";
import Idx from "./Idx";
import { cutoffLabel } from "@/lib/order-cutoff";
import { WRAP, SECTION, DIM, display, body } from "./theme";

const AREAS = [
  "Viman Nagar", "Kalyani Nagar", "Vadgaon Sheri", "Wagholi",
  "Yerwada", "Koregaon Park", "Sangamwadi", "Magarpatta City", "Amanora",
  "Mundhwa", "Tingre Nagar", "Hadapsar", "Dhanori", "Lohegaon",
];

export default function Areas() {
  return (
    <section aria-labelledby="hp-areas" style={SECTION}>
      <div style={WRAP}>
        <Idx label="Coverage" />

        <div className={`${s.duo} ${s.reveal}`}>
          <h2 id="hp-areas" style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "12ch" }}>
            Do we deliver to you?
          </h2>
          <p style={{ ...body(16.5) }}>
            Cooked from 04:00 in Kharadi and at your door by 08:00. Fifteen areas, one
            kitchen, and no plans to change that this year: we would rather serve east
            Pune properly than the whole city badly.
          </p>
        </div>

        <div className={s.chips} style={{ marginTop: "clamp(26px,3.4vw,42px)" }}>
          <span className={`${s.chip} ${s.chipHome}`}>Kharadi · the kitchen</span>
          {AREAS.map((a) => (
            <span key={a} className={s.chip}>
              {a}
            </span>
          ))}
        </div>

        <div className={s.actions} style={{ marginTop: 26 }}>
          <Link href="/locations" className={s.ghost}>
            Check your pincode
          </Link>
          <Link href="/contact" className={s.link}>
            Not on the list? Tell us where you are
          </Link>
        </div>

        <p style={{ ...body(13.5), color: DIM, marginTop: 20 }}>
          Order by {cutoffLabel()} and you eat the next morning; after that, the morning
          after. Two delivery windows, morning and evening, chosen per plan. Digital plans
          have no delivery at all and are available anywhere in India.
        </p>
      </div>
    </section>
  );
}
