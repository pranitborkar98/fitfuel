"use client";

import { useId, useState } from "react";
import s from "./home.module.css";

export type BoardDish = {
  id: string;
  name: string;
  blurb: string;
  priceLabel: string;
  kcalLabel: string;
  macroLine: string;
  variantNote?: string;
};

export type BoardCourse = {
  key: string;
  label: string;
  items: BoardDish[];
};

/**
 * The à la carte board.
 *
 * ONLY THE 16 DISHES THE KITCHEN HAS ACTUALLY PRICED appear here. The other 32
 * sit on a Rs 100 placeholder (`provisional: true` in lib/menu-alacarte.ts) and
 * the previous storefront rendered them as tiles reading "NOT PRICED YET" next
 * to an "ASK" button. Thirty-two of those in a row is the single strongest
 * signal on the page that the business is unfinished. They are summarised in
 * one honest sentence underneath instead, which is true, sells the range, and
 * does not print a number nobody will honour.
 *
 * Tabs are real buttons with roving `aria-selected`, not links, because they
 * swap content in place rather than navigating.
 */
export default function MenuBoard({ courses }: { courses: BoardCourse[] }) {
  const [active, setActive] = useState(courses[0]?.key ?? "");
  const baseId = useId();
  const current = courses.find((c) => c.key === active) ?? courses[0];

  if (!current) return null;

  return (
    <>
      <div className={s.tabs} role="tablist" aria-label="Menu courses">
        {courses.map((c) => {
          const on = c.key === current.key;
          return (
            <button
              key={c.key}
              type="button"
              role="tab"
              id={`${baseId}-tab-${c.key}`}
              aria-selected={on}
              aria-controls={`${baseId}-panel-${c.key}`}
              className={`${s.tab} ${on ? s.tabOn : ""}`}
              onClick={() => setActive(c.key)}
            >
              {c.label}
              <span className="fk-sr-only"> — {c.items.length} dishes</span>
            </button>
          );
        })}
      </div>

      <ul
        className={s.dishes}
        role="tabpanel"
        id={`${baseId}-panel-${current.key}`}
        aria-labelledby={`${baseId}-tab-${current.key}`}
      >
        {current.items.map((d) => (
          <li key={d.id} className={s.dish}>
            <h3 className={s.dishName}>{d.name}</h3>
            {/* Tabular figures so a column of prices lines up on the rupee. */}
            <p className={`${s.dishPrice} fk-num`}>{d.priceLabel}</p>
            <p className={s.dishBlurb}>{d.blurb}</p>
            <p className={s.dishMeta}>
              {/* "EST" is not decoration. app/_shop/catalog.ts is explicit that
                  these are recipe estimates, while the plan meals are weighed
                  on a scale. Printing them identically would encode a claim we
                  cannot back. */}
              <span className="fk-num">
                {d.kcalLabel} · {d.macroLine}
              </span>
              <span>estimated, not weighed</span>
              {d.variantNote ? <span>{d.variantNote}</span> : null}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
