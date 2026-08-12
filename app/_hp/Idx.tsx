// app/_hp/Idx.tsx
//
// The section marker: one label, one hairline. Nothing else.
//
// It started as an index header — `[ 004 ]  THE WEEK  ────────  1 OF 126 PLANS`
// — which is what the old "spine of the page" idea described. The owner has
// already rejected exactly that: the bracketed number plus a right-hand caption
// on every block was named as the specific tell that made an earlier build read
// as machine-generated ("too much subtext, each and everything"). A page with
// seventeen sections does not need seventeen serial numbers to feel structured;
// the rule and a single label already do that job, and the number was carrying
// none of it.
//
// So: ONE label per section. If a section wants to say something else, it says
// it in a heading or a sentence, not in a second mono caption.
//
// SERVER COMPONENT.

import s from "./hp.module.css";

export default function Idx({ label }: { label: string }) {
  return (
    <div className={s.idx}>
      <span className={s.idxLabel}>{label}</span>
      <span className={s.idxRule} aria-hidden="true" />
    </div>
  );
}
