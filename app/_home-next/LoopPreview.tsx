"use client";

import Image from "next/image";
import { Check, RotateCcw } from "lucide-react";
import { useState } from "react";
import styles from "./HomePage.module.css";

type Props = {
  mealName: string;
  calories: number;
  protein: number;
};

export default function LoopPreview({ mealName, calories, protein }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const dailyTarget = 1800;
  const eatenBefore = 620;
  const eaten = eatenBefore + (confirmed ? calories : 0);
  const progress = Math.min(100, Math.round((eaten / dailyTarget) * 100));

  return (
    <div className={styles.previewShell}>
      <div className={styles.previewTopline}>
        <span>Product preview</span>
        <span>Today</span>
      </div>

      <div className={styles.previewMeal}>
        <div className={styles.previewImage}>
          <Image
            src="/images/hero-bowl-v2.png"
            alt="A chef-cooked bowl with paneer, brown rice, vegetables, chickpeas and raita"
            fill
            loading="eager"
            sizes="(max-width: 760px) 32vw, 150px"
            className="fk-food"
          />
        </div>
        <div className={styles.previewMealCopy}>
          <span className={styles.previewStatus}>Lunch · Ready to confirm</span>
          <strong>{mealName}</strong>
          <span>{calories} kcal · {protein}g protein</span>
        </div>
      </div>

      <div className={styles.previewProgress}>
        <div className={styles.previewProgressCopy}>
          <span>Daily intake</span>
          <strong>{eaten.toLocaleString("en-IN")} / {dailyTarget.toLocaleString("en-IN")} kcal</strong>
        </div>
        <div className={styles.previewTrack} aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      <button
        type="button"
        className={`${styles.previewButton} ${confirmed ? styles.previewButtonDone : ""}`}
        onClick={() => setConfirmed((value) => !value)}
        aria-pressed={confirmed}
      >
        {confirmed ? <RotateCcw size={18} /> : <Check size={18} />}
        {confirmed ? "Undo confirmation" : "I ate this"}
      </button>
      <p className={styles.previewFootnote} aria-live="polite">
        {confirmed
          ? "Logged. Your diary and daily totals now agree with the kitchen serving."
          : "The kitchen serving is already filled in. You only confirm what happened."}
      </p>
    </div>
  );
}
