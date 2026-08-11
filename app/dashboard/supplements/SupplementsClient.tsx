"use client";

// app/dashboard/supplements/SupplementsClient.tsx
//
// Phase 8, the supplement guide. Every logged in user gets all of it.
//
// The old version led each card with an emoji at 30px, and 52px in the detail
// sheet, which the reject list names outright. It was also the wrong thing to
// lead with: lib/supplements-data carries evidenceLevel, studyCount,
// keyStudyFindings, mechanism, warnings and sideEffects, and none of it was on
// screen. The nav calls this "researched, not stocked". The research is the
// product, so the research is what a row shows.
//
// Also gone: two backdrop-blurs, three drop shadows, an amber "popular" badge,
// and body text at rgba(255,255,255,0.2), which is nowhere near AA on this
// ground.

import { useMemo, useState } from "react";
import {
  SUPPLEMENTS, STACKS, GOAL_META, CATEGORY_META,
  resolveStack, getSupplementById,
  type Supplement, type SupplementGoal, type SupplementCategory, type QuizAnswers,
} from "@/lib/supplements-data";
import { C, COND, SANS, section, body, label, num, PANEL } from "@/app/_app/theme";
import Dialog from "./Dialog";

/** Reads the FitnessGoal enum UserProfile actually stores, and still accepts a
 *  free string. IMPROVE_FITNESS used to fall through to balanced because none
 *  of the substrings matched it. */
const GOAL_BY_ENUM: Record<string, SupplementGoal> = {
  GAIN_MUSCLE: "muscle_gain",
  LOSE_WEIGHT: "weight_loss",
  IMPROVE_FITNESS: "performance",
  MAINTAIN: "balanced",
  MANAGE_CONDITION: "balanced",
};

function mapProfileGoal(raw: string | null): SupplementGoal {
  if (!raw) return "balanced";
  const exact = GOAL_BY_ENUM[raw.toUpperCase()];
  if (exact) return exact;

  const r = raw.toLowerCase();
  if (r.includes("muscle") || r.includes("gain") || r.includes("bulk")) return "muscle_gain";
  if (r.includes("loss") || r.includes("cut") || r.includes("weight")) return "weight_loss";
  if (r.includes("perform") || r.includes("athletic") || r.includes("sport") || r.includes("fitness")) return "performance";
  return "balanced";
}

/** Words, not pictures. Every option used to carry an emoji that the reader
 *  had to decode: a crescent moon for bad sleep, a falling chart for a
 *  strength plateau. */
const QUIZ_STEPS = [
  {
    key: "goal" as const,
    question: "What are you working on right now?",
    options: [
      { value: "muscle_gain", label: "Build muscle" },
      { value: "weight_loss", label: "Lose fat" },
      { value: "balanced", label: "Stay healthy" },
      { value: "performance", label: "Peak performance" },
    ],
  },
  {
    key: "frequency" as const,
    question: "How often do you train in a week?",
    options: [
      { value: "low", label: "1 to 2 times" },
      { value: "medium", label: "3 to 4 times" },
      { value: "high", label: "5 to 7 times" },
    ],
  },
  {
    key: "challenge" as const,
    question: "What is getting in the way?",
    options: [
      { value: "recovery", label: "Poor recovery" },
      { value: "energy", label: "Low energy" },
      { value: "strength", label: "Strength plateau" },
      { value: "weight", label: "Stubborn weight" },
      { value: "sleep", label: "Bad sleep" },
    ],
  },
  {
    key: "diet" as const,
    question: "What do you eat?",
    options: [
      { value: "nonveg", label: "Non vegetarian" },
      { value: "veg", label: "Vegetarian" },
      { value: "vegan", label: "Vegan" },
    ],
  },
  {
    key: "budget" as const,
    question: "What is your monthly budget?",
    options: [
      { value: "low", label: "Under ₹1,000" },
      { value: "mid", label: "₹1,000 to ₹2,500" },
      { value: "high", label: "Over ₹2,500" },
    ],
  },
];

const CATEGORIES: Array<"all" | SupplementCategory> =
  ["all", "protein", "performance", "recovery", "health", "weight"];

function Spine({ children }: { children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "26px 0 16px" }}>
      <span style={label(12)}>{children}</span>
      <span style={{ flex: 1, height: 1, background: C.rule }} />
    </div>
  );
}

/** Square chip, 44 tall, selection is a lime hairline plus lime text. */
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      style={{
        minHeight: 44, padding: "0 14px", cursor: "pointer",
        background: on ? C.wash : "transparent",
        border: `1px solid ${on ? C.lime : C.rule2}`,
        color: on ? C.lime : C.mute,
        fontFamily: SANS, fontSize: 14, fontWeight: on ? 500 : 400,
        transition: "border-color 180ms ease-out, color 180ms ease-out",
      }}
    >
      {children}
    </button>
  );
}

/** Directory row, DESIGN.md §4 device 3. A real button, so it is reachable by
 *  keyboard; the old card was a div with an onClick and nothing else. */
function Row({ supp, inStack, onOpen }: { supp: Supplement; inStack?: boolean; onOpen: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
        width: "100%", minHeight: 44, padding: "13px 14px", textAlign: "left",
        background: hover ? C.panel2 : "transparent",
        border: 0,
        borderBottom: `1px solid ${C.rule}`,
        borderLeft: `2px solid ${inStack || hover ? C.lime : "transparent"}`,
        cursor: "pointer",
        transition: "background-color 180ms ease-out, border-color 180ms ease-out",
      }}
    >
      <span style={{ flex: "1 1 220px", minWidth: 0 }}>
        <span style={{ ...body(14, { color: C.ink }), display: "block" }}>{supp.name}</span>
        <span style={{ ...body(13), display: "block", marginTop: 3 }}>{supp.tagline}</span>
      </span>
      <span style={label(12, { flex: "none" })}>{CATEGORY_META[supp.category].label}</span>
      <span style={num(12, { flex: "none", minWidth: "12ch", color: C.dim })}>{supp.dosage}</span>
      <span style={num(12, { flex: "none", minWidth: "9ch", textAlign: "right" })}>{supp.priceRange}</span>
    </button>
  );
}

function Detail({ supp, onClose }: { supp: Supplement; onClose: () => void }) {
  return (
    <Dialog title={supp.name} onClose={onClose}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                    gap: 12, padding: "18px 18px 14px", borderBottom: `1px solid ${C.rule}` }}>
        <div style={{ minWidth: 0 }}>
          <span style={label(12, { display: "block", marginBottom: 8 })}>
            {CATEGORY_META[supp.category].label}
          </span>
          <h2 style={section()}>{supp.name}</h2>
          <p style={body(13, { marginTop: 6 })}>{supp.tagline}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: "none", minWidth: 44, minHeight: 44, background: "transparent",
            border: `1px solid ${C.rule2}`, color: C.ink, cursor: "pointer",
            fontFamily: COND, fontWeight: 800, fontSize: 14, textTransform: "uppercase",
          }}
        >
          Close
        </button>
      </div>

      <div style={{ padding: 18 }}>
        <p style={body(14, { maxWidth: "62ch" })}>{supp.description}</p>

        <Spine>How it works</Spine>
        <p style={body(14, { maxWidth: "62ch" })}>{supp.mechanism}</p>

        <Spine>The evidence</Spine>
        <div style={{ display: "grid", gap: 1, background: C.rule, border: `1px solid ${C.rule}`,
                      gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))" }}>
          <div style={{ background: C.bg, padding: "12px 14px" }}>
            <span style={num(13, { display: "block", color: C.lime })}>{String(supp.evidenceLevel).replace(/_/g, " ")}</span>
            <span style={label(12, { display: "block", marginTop: 6 })}>Evidence level</span>
          </div>
          <div style={{ background: C.bg, padding: "12px 14px" }}>
            <span style={num(13, { display: "block" })}>{supp.studyCount}</span>
            <span style={label(12, { display: "block", marginTop: 6 })}>Studies</span>
          </div>
          <div style={{ background: C.bg, padding: "12px 14px" }}>
            <span style={num(13, { display: "block" })}>{String(supp.valueRating).replace(/_/g, " ")}</span>
            <span style={label(12, { display: "block", marginTop: 6 })}>Value for money</span>
          </div>
        </div>
        {supp.keyStudyFindings?.length ? (
          <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0, borderTop: `1px solid ${C.rule}` }}>
            {supp.keyStudyFindings.map((f) => (
              <li key={f} style={{ display: "flex", gap: 13, padding: "11px 0", alignItems: "baseline",
                                   borderBottom: `1px solid ${C.rule}` }}>
                <span style={num(12, { color: C.lime, flex: "none", minWidth: "2ch" })}>&gt;</span>
                <span style={body(14, { color: C.ink })}>{f}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <Spine>How to take it</Spine>
        <div style={{ display: "grid", gap: 1, background: C.rule, border: `1px solid ${C.rule}`,
                      gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
          {[
            { k: "Dose", v: supp.dosage },
            { k: "Timing", v: supp.timing },
            { k: "Noticeable after", v: supp.onsetTime },
            { k: "Form", v: supp.form },
          ].map((r) => (
            <div key={r.k} style={{ background: C.bg, padding: "12px 14px" }}>
              <span style={label(12, { display: "block", marginBottom: 6 })}>{r.k}</span>
              <span style={body(13, { color: C.ink })}>{r.v}</span>
            </div>
          ))}
        </div>

        {supp.warnings || supp.sideEffects?.length ? (
          <>
            <Spine>Before you take it</Spine>
            {supp.warnings ? (
              <p style={{ ...body(14, { color: C.ink, maxWidth: "62ch" }),
                          borderLeft: `2px solid ${C.danger}`, paddingLeft: 14 }}>
                {supp.warnings}
              </p>
            ) : null}
            {supp.sideEffects?.length ? (
              <p style={body(13, { marginTop: 10, maxWidth: "62ch" })}>
                Reported side effects: {supp.sideEffects.join(", ")}.
              </p>
            ) : null}
          </>
        ) : null}

        <Spine>Price</Spine>
        <p style={num(15)}>{supp.priceRange}</p>
        <p style={body(13, { marginTop: 8, maxWidth: "62ch" })}>
          A street price range, not a FitFuel price. We do not sell supplements.
          {supp.certificationNote ? ` ${supp.certificationNote}` : ""}
        </p>
      </div>
    </Dialog>
  );
}

function Quiz({ onComplete, onClose }: { onComplete: (a: QuizAnswers) => void; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const current = QUIZ_STEPS[step];
  const chosen = answers[current.key];
  const last = step === QUIZ_STEPS.length - 1;

  return (
    <Dialog title="Build your stack" onClose={onClose} maxWidth={480}>
      <div style={{ height: 2, background: C.trough }}>
        <div style={{ height: 2, width: `${((step + 1) / QUIZ_STEPS.length) * 100}%`, background: C.lime }} />
      </div>

      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span style={label(12)}>Step {step + 1} of {QUIZ_STEPS.length}</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              minWidth: 44, minHeight: 44, background: "transparent",
              border: `1px solid ${C.rule2}`, color: C.ink, cursor: "pointer",
              fontFamily: COND, fontWeight: 800, fontSize: 14, textTransform: "uppercase",
            }}
          >
            Close
          </button>
        </div>

        <h2 style={section({ margin: "16px 0 14px" })}>{current.question}</h2>

        <div role="radiogroup" aria-label={current.question}
             style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {current.options.map((o) => {
            const on = chosen === o.value;
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setAnswers((p) => ({ ...p, [current.key]: o.value }))}
                style={{
                  display: "flex", alignItems: "center", minHeight: 48, padding: "0 14px",
                  textAlign: "left", cursor: "pointer",
                  background: on ? C.wash : "transparent",
                  border: `1px solid ${on ? C.lime : C.rule2}`,
                  color: on ? C.lime : C.mute,
                  fontFamily: SANS, fontSize: 14, fontWeight: on ? 500 : 400,
                  transition: "border-color 180ms ease-out, color 180ms ease-out",
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              style={{
                minHeight: 44, padding: "0 16px", background: "transparent",
                border: `1px solid ${C.rule2}`, color: C.ink, cursor: "pointer",
                fontFamily: COND, fontWeight: 800, fontSize: 14,
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}
            >
              Back
            </button>
          )}
          <button
            type="button"
            disabled={chosen === undefined}
            onClick={() => (last ? onComplete(answers as QuizAnswers) : setStep(step + 1))}
            style={{
              flex: 1, minHeight: 44, padding: "0 16px",
              background: chosen === undefined ? "transparent" : C.lime,
              border: `1px solid ${chosen === undefined ? C.rule2 : C.lime}`,
              color: chosen === undefined ? C.dim : C.onLime,
              cursor: chosen === undefined ? "default" : "pointer",
              fontFamily: COND, fontWeight: 900, fontSize: 15,
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}
          >
            {last ? "Build my stack" : "Continue"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export default function SupplementsClient({ userGoal }: { userGoal: string | null }) {
  const defaultGoal = mapProfileGoal(userGoal);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selected, setSelected] = useState<Supplement | null>(null);
  const [cat, setCat] = useState<"all" | SupplementCategory>("all");

  const stackIds = useMemo(
    () => (quizAnswers ? resolveStack(quizAnswers) : STACKS[defaultGoal]),
    [quizAnswers, defaultGoal],
  );
  const stack = stackIds.map(getSupplementById).filter(Boolean) as Supplement[];
  const stackSet = new Set(stack.map((s) => s.id));

  const catalogue = useMemo(
    () => (cat === "all" ? SUPPLEMENTS : SUPPLEMENTS.filter((s) => s.category === cat)),
    [cat],
  );

  const goal = quizAnswers?.goal ?? defaultGoal;

  return (
    <>
      <Spine>Your stack</Spine>
      <div style={PANEL}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: 12, flexWrap: "wrap", padding: "14px 14px 12px",
                      borderBottom: `1px solid ${C.rule}` }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={section()}>{GOAL_META[goal].label}</h2>
            <p style={body(13, { marginTop: 5 })}>
              {quizAnswers
                ? "Built from your answers."
                : "Built from the goal on your profile. Take the quiz to narrow it."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowQuiz(true)}
            style={{
              flex: "none", minHeight: 44, padding: "0 16px", background: "transparent",
              border: `1px solid ${C.rule2}`, color: C.ink, cursor: "pointer",
              fontFamily: COND, fontWeight: 800, fontSize: 14,
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}
          >
            {quizAnswers ? "Retake quiz" : "Take quiz"}
          </button>
        </div>
        {stack.map((s) => (
          <Row key={s.id} supp={s} inStack onOpen={() => setSelected(s)} />
        ))}
      </div>

      <Spine>Everything we have looked at</Spine>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {CATEGORIES.map((c) => (
          <Chip key={c} on={c === cat} onClick={() => setCat(c)}>
            {c === "all" ? "All" : CATEGORY_META[c].label}
          </Chip>
        ))}
      </div>
      <p style={body(13, { marginBottom: 12 })}>
        {catalogue.length} supplement{catalogue.length === 1 ? "" : "s"}.
      </p>
      <div style={{ borderTop: `1px solid ${C.rule}` }}>
        {catalogue.map((s) => (
          <Row key={s.id} supp={s} inStack={stackSet.has(s.id)} onOpen={() => setSelected(s)} />
        ))}
      </div>

      {showQuiz && (
        <Quiz
          onComplete={(a) => { setQuizAnswers(a); setShowQuiz(false); }}
          onClose={() => setShowQuiz(false)}
        />
      )}
      {selected && <Detail supp={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
