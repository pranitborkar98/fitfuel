"use client";

// app/_web/YourNumbers.tsx
//
// THE CALCULATOR FROM THE v2 HOMEPAGE, WIRED INTO THE CATALOGUE.
//
// app/_hp/Finder.tsx has carried this since the v2 homepage was built, on no
// route anyone reaches. It is the one control on this whole product that turns
// "126 plans" into "your number", and the reason it is worth importing is not
// the form — it is what happens to every card once a profile exists.
//
// Before: the day bar offered three round targets, and Maintain was 2,000 kcal
// for a 52kg woman and a 95kg man alike. Every "24% of your calories" printed
// on a dish card was therefore 24% of a number belonging to nobody, and "Fits
// your day" was a guess.
//
// After: sex, age, height, weight and how the week actually moves go through
// lib/tdee.ts — Mifflin St Jeor, the SAME module onboarding and the plan
// builder run — and the catalogue's arithmetic becomes true for the reader.
//
// NOT A SECOND IMPLEMENTATION. calculateBMR / calculateTDEE / getCalorieTarget
// / getMacroTargets are imported, never reproduced. The v2 comment makes the
// point better than I can: a calculator on the homepage that disagrees with the
// one behind the login is worse than no calculator at all. That includes the
// floor, which is 1,200 for women and 1,500 for men and is printed below when
// it bites, because a target that silently stopped moving is a target the
// reader cannot check.
//
// It stores to localStorage and nothing else. No account, no email, no request
// — a visitor deciding what to eat tonight should not have to sign up to be
// told what their own maintenance is.

import { useMemo, useState, useSyncExternalStore } from "react";

import Sheet, { SheetClose } from "@/app/_shop/Sheet";
import {
  ACTIVITY_LEVEL_LABELS,
  getPersonalisedTargets,
  type ActivityLevel,
  type FitnessGoal,
  type Gender,
} from "@/lib/tdee";

import s from "./app.module.css";

export type Numbers = {
  sex: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
};

const KEY = "fk.numbers.v1";

/** The median Indian adult FitFuel actually sells to, as an opening position. */
export const DEFAULT_NUMBERS: Numbers = {
  sex: "MALE",
  age: 31,
  heightCm: 172,
  weightKg: 78,
  activity: "LIGHTLY_ACTIVE",
};

const ACTS: ActivityLevel[] = [
  "SEDENTARY",
  "LIGHTLY_ACTIVE",
  "MODERATELY_ACTIVE",
  "VERY_ACTIVE",
  "EXTREMELY_ACTIVE",
];

/* ── READING localStorage WITHOUT A HYDRATION MISMATCH ─────────────────────
   useSyncExternalStore, not useState + useEffect. The server has no
   localStorage, so the first client render MUST agree with the server's (null)
   and only then swap — which is exactly what getServerSnapshot is for. The
   effect-and-setState version does the same thing by cascading a second render
   and trips react-hooks' no-setstate-in-effect rule for the same reason.

   getSnapshot has to be referentially stable or React re-renders forever, so
   the parsed object is memoised against the raw string it came from. */
let cachedRaw: string | null = null;
let cachedValue: Numbers | null = null;

function parse(raw: string | null): Numbers | null {
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = null;
  if (raw) {
    try {
      const p = JSON.parse(raw) as Partial<Numbers>;
      /* Validated rather than trusted: this is user-writable storage, and a
         string in weightKg would make every target on the page NaN. */
      if (
        typeof p.age === "number" &&
        typeof p.heightCm === "number" &&
        typeof p.weightKg === "number" &&
        (p.sex === "MALE" || p.sex === "FEMALE") &&
        ACTS.includes(p.activity as ActivityLevel)
      ) {
        cachedValue = p as Numbers;
      }
    } catch {
      /* Corrupt JSON. The page works without it. */
    }
  }
  return cachedValue;
}

const EVENT = "fk:numbers";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  /* `storage` fires in OTHER tabs, so a second tab follows along. */
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function readStore(): Numbers | null {
  try {
    return parse(window.localStorage.getItem(KEY));
  } catch {
    /* Private mode or blocked storage. */
    return parse(null);
  }
}

export function useNumbers(): [Numbers | null, (n: Numbers | null) => void] {
  const numbers = useSyncExternalStore(subscribe, readStore, () => null);

  const write = (n: Numbers | null) => {
    try {
      if (n) window.localStorage.setItem(KEY, JSON.stringify(n));
      else window.localStorage.removeItem(KEY);
    } catch {
      /* Nothing to do — the next read just returns what is still there. */
    }
    window.dispatchEvent(new Event(EVENT));
  };

  return [numbers, write];
}

/** The target a profile implies for a goal — or the goal's own round figure
 *  when nobody has set one. One place, so the day bar and every card agree. */
export function targetFor(
  numbers: Numbers | null,
  goal: FitnessGoal,
  fallback: { kcal: number; protein: number },
): { kcal: number; protein: number; personal: boolean } {
  if (!numbers) return { ...fallback, personal: false };
  const t = getPersonalisedTargets(
    {
      weightKg: numbers.weightKg,
      heightCm: numbers.heightCm,
      age: numbers.age,
      gender: numbers.sex,
      activityLevel: numbers.activity,
    },
    goal,
  );
  return { kcal: t.calorieTarget, protein: t.proteinG, personal: true };
}

export default function YourNumbers({
  goal,
  goalLabel,
  initial,
  onSave,
  onClose,
}: {
  goal: FitnessGoal;
  goalLabel: string;
  initial: Numbers | null;
  onSave: (n: Numbers | null) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Numbers>(initial ?? DEFAULT_NUMBERS);

  /* Live, on every drag of the slider. The whole point of showing the
     arithmetic is that the reader watches it move. */
  const live = useMemo(() => {
    const t = getPersonalisedTargets(
      {
        weightKg: draft.weightKg,
        heightCm: draft.heightCm,
        age: draft.age,
        gender: draft.sex,
        activityLevel: draft.activity,
      },
      goal,
    );
    const floor = draft.sex === "FEMALE" ? 1200 : 1500;
    return { ...t, floor, floored: t.calorieTarget <= floor };
  }, [draft, goal]);

  const set = <K extends keyof Numbers>(k: K, v: Numbers[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const dials: [keyof Numbers, string, number, number, string][] = [
    ["age", "Age", 16, 80, `${draft.age} years`],
    ["heightCm", "Height", 140, 205, `${draft.heightCm} cm`],
    ["weightKg", "Weight", 40, 150, `${draft.weightKg} kg`],
  ];

  return (
    <Sheet onClose={onClose} labelledBy="fk-numbers-h">
      <div className={s.numbersTop}>
        <h2 id="fk-numbers-h" className={s.numbersH}>
          Your numbers
        </h2>
        <SheetClose onClose={onClose} />
      </div>

      <div className={s.numbers}>
        <p className={s.numbersLede}>
          Five answers and the menu starts doing arithmetic against your day
          instead of an average one. Nothing leaves this device — no account, no
          email.
        </p>

        <div className={s.numbersField}>
          <span className={s.numbersLabel}>Sex, for the resting figure</span>
          <div className={s.numbersSeg} role="radiogroup" aria-label="Sex">
            {(["MALE", "FEMALE"] as Gender[]).map((o) => (
              <button
                key={o}
                type="button"
                role="radio"
                aria-checked={draft.sex === o}
                className={`${s.numbersOpt} ${draft.sex === o ? s.numbersOn : ""}`}
                onClick={() => set("sex", o)}
              >
                {o === "MALE" ? "Male" : "Female"}
              </button>
            ))}
          </div>
          {/* Not decoration. Mifflin St Jeor carries a different constant per
              sex and lib/tdee floors the target at 1,200 or 1,500 accordingly,
              so this control changes the answer and the reader should know why
              it is being asked. */}
          <span className={s.numbersHint}>
            Mifflin St Jeor uses a different constant for each, and the daily
            floor is {draft.sex === "FEMALE" ? "1,200" : "1,500"} kcal.
          </span>
        </div>

        {dials.map(([k, label, min, max, shown]) => (
          <div key={k} className={s.numbersField}>
            <span className={s.numbersDialHead}>
              <label htmlFor={`fk-n-${k}`} className={s.numbersLabel}>
                {label}
              </label>
              <b className="fk-num">{shown}</b>
            </span>
            <input
              id={`fk-n-${k}`}
              className={s.numbersRange}
              type="range"
              min={min}
              max={max}
              step={1}
              value={draft[k] as number}
              aria-valuetext={shown}
              onChange={(e) => set(k, Number(e.target.value) as Numbers[typeof k])}
            />
          </div>
        ))}

        <div className={s.numbersField}>
          <span className={s.numbersLabel}>How your week actually moves</span>
          <div className={s.numbersSeg} role="radiogroup" aria-label="Activity">
            {ACTS.map((o) => (
              <button
                key={o}
                type="button"
                role="radio"
                aria-checked={draft.activity === o}
                className={`${s.numbersOpt} ${draft.activity === o ? s.numbersOn : ""}`}
                onClick={() => set("activity", o)}
              >
                {ACTIVITY_LEVEL_LABELS[o].replace(" (Athlete)", "").replace("ly Active", "")}
              </button>
            ))}
          </div>
        </div>

        {/* ── The ledger ────────────────────────────────────────────────────
            Every step shown, because the claim this page makes about the coach
            is that it shows its working — a calculator that prints only its
            answer would be arguing the opposite two bands further down. */}
        <div className={s.numbersOut}>
          <span className={s.numbersLabel}>
            Your target for {goalLabel.toLowerCase()}, computed live
          </span>
          <b className={`${s.numbersBig} fk-num`}>
            {live.calorieTarget.toLocaleString("en-IN")}
            <span>kcal a day</span>
          </b>

          <span className={s.numbersMacros}>
            {(
              [
                ["Protein", `${live.proteinG}g`],
                ["Carbohydrate", `${live.carbsG}g`],
                ["Fat", `${live.fatG}g`],
              ] as const
            ).map(([k, v]) => (
              <span key={k}>
                <b className="fk-num">{v}</b>
                <span>{k}</span>
              </span>
            ))}
          </span>

          <span className={s.numbersLedger}>
            <span>
              Maintenance (TDEE)
              <b className="fk-num">{Math.round(live.tdee).toLocaleString("en-IN")}</b>
            </span>
            <span>
              Adjustment for {goalLabel.toLowerCase()}
              <b className="fk-num">
                {live.calorieTarget - Math.round(live.tdee) >= 0 ? "+" : "−"}
                {Math.abs(live.calorieTarget - Math.round(live.tdee)).toLocaleString("en-IN")}
              </b>
            </span>
            {live.floored ? (
              <span>
                Floor for {draft.sex === "FEMALE" ? "women" : "men"}, applied
                <b className={`${s.numbersFloor} fk-num`}>
                  {live.floor.toLocaleString("en-IN")}
                </b>
              </span>
            ) : null}
          </span>
        </div>

        <div className={s.numbersActions}>
          <button
            type="button"
            className={s.numbersSave}
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            Use these numbers
          </button>
          {initial ? (
            <button
              type="button"
              className={s.numbersClear}
              onClick={() => {
                onSave(null);
                onClose();
              }}
            >
              Forget them
            </button>
          ) : null}
        </div>
      </div>
    </Sheet>
  );
}
