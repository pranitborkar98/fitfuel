"use client";

// app/_web/CoachChat.tsx
//
// THE COACH AS A CHAT PRODUCT (v2 §3.8).
//
// v1 showed four CSS bars and a receipt; the coach itself — a chat product —
// was never shown. This is a real transcript grounded in the example month
// (COACH_WEEKS + lib/coach/recalibration.ts: cap ±300 kcal, floor 1,200 kcal).
// The bubbles are new product copy drafted from that data; every number in
// them matches the data exactly. The card is labelled "Example conversation".

import Link from "next/link";

import { COACH_CHAT } from "./homepage-v2-data";
import s from "./app-preview.module.css";

export default function CoachChat() {
  return (
    <div className={s.chatCard}>
      <p className={s.chatLabel}>Example conversation</p>
      <div className={s.chatLog} aria-label="Example conversation with the AI coach">
        {COACH_CHAT.map((bubble, i) => (
          <p
            key={i}
            className={bubble.from === "member" ? s.chatMember : s.chatCoach}
          >
            <span className="fk-sr-only">
              {bubble.from === "member" ? "You: " : "Coach: "}
            </span>
            {bubble.text}
          </p>
        ))}
      </div>

      <div
        className={s.coachSum}
        role="group"
        aria-label="Recalibration: 2,000 kcal minus 300 kcal equals 1,700 kcal"
      >
        <span className={s.coachTile}>
          <b className="fk-num">2,000 kcal</b>
        </span>
        <i aria-hidden="true">&minus;</i>
        <span className={s.coachTile}>
          <b className="fk-num">300 kcal</b>
        </span>
        <i aria-hidden="true">=</i>
        <span className={`${s.coachTile} ${s.coachTileResult}`}>
          <b className="fk-num">1,700 kcal</b>
        </span>
        <span className={s.coachSumNote}>
          The engine&apos;s maximum single change after the trend leaves its goal range.
        </span>
      </div>

      <div className={s.chatActions}>
        <button
          type="button"
          className={s.chatPrimary}
          onClick={() => document.getElementById("fitfuel-coach-trigger")?.click()}
        >
          Open AI coach
        </button>
        <Link href="/dashboard/coach" className={s.chatGhost}>
          Apply 1,700 kcal
        </Link>
      </div>
      <p className={s.chatFine}>
        Applying opens the weekly review. Nothing changes from the homepage.
      </p>
    </div>
  );
}
