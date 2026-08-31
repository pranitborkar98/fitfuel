"use client";

// app/dashboard/trainer/TrainerChat.tsx
//
// The conversation. Client component because it owns the thread and the stream.
//
// THE THREAD IS PERSISTED (Phase 12C). The last conversation is read on the
// server and arrives as `initialTurns`, so a reload resumes rather than
// restarting. `conversationId` comes back down the stream on the first line and
// is echoed on every later turn; the server re-checks it belongs to the session
// before writing, because it is client-supplied.
//
// History is NOT the coach's memory. buildTrainerContext() re-reads the
// customer's real rows on every turn, so a weight logged since the last message
// is current even though the old message still quotes the old number.

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";

import s from "./trainer.module.css";

type Turn = { role: "user" | "assistant"; content: string };

type Props = {
  initialTurns?: Turn[];
  initialConversationId?: string | null;
};

/* Openers. Not decoration — an empty chat box asks the customer to invent a
   question, and the three below are the ones the context can answer best. */
const SUGGESTIONS = [
  "Why has my weight stalled?",
  "Am I getting enough protein?",
  "What should I eat tonight?",
];

export default function TrainerChat({
  initialTurns = [],
  initialConversationId = null,
}: Props) {
  const [turns, setTurns] = useState<Turn[]>(initialTurns);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  /* A ref, not state: it changes once, mid-stream, and rendering on it would
     re-run the reader loop's closure for no visible gain. */
  const convoId = useRef<string | null>(initialConversationId);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* Follow the stream, but never fight someone who has scrolled up to reread
     an earlier answer. */
  const pinned = useRef(true);
  useEffect(() => {
    if (!pinned.current) return;
    endRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "end",
    });
  }, [turns, busy]);

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || busy) return;

      pinned.current = true;
      setNotice(null);
      setDraft("");
      /* The empty assistant turn is the streaming target — appended up front so
         the reply grows in place instead of appearing whole at the end. */
      const history = turns;
      setTurns([...history, { role: "user", content: message }, { role: "assistant", content: "" }]);
      setBusy(true);

      try {
        const res = await fetch("/api/trainer/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message, history, conversationId: convoId.current }),
        });

        if (!res.ok || !res.body) {
          const j = await res.json().catch(() => null);
          setNotice(j?.error ?? "The coach could not be reached. Try again shortly.");
          setTurns((t) => t.slice(0, -1));
          return;
        }

        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        let got = false;

        /* NDJSON: split on newlines and keep the remainder, because a chunk
           boundary lands mid-object often enough to matter. */
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const raw of lines) {
            if (!raw.trim()) continue;
            let chunk: { t?: string; e?: string; c?: string };
            try {
              chunk = JSON.parse(raw);
            } catch {
              continue;
            }
            if (chunk.c) {
              convoId.current = chunk.c;
            } else if (chunk.e) {
              setNotice(chunk.e);
            } else if (chunk.t) {
              got = true;
              setTurns((t) => {
                const next = [...t];
                const last = next[next.length - 1];
                if (last?.role === "assistant") {
                  next[next.length - 1] = { ...last, content: last.content + chunk.t };
                }
                return next;
              });
            }
          }
        }

        /* A notice with no text means nothing was ever written — drop the empty
           bubble so the notice is not sitting under a blank panel. */
        if (!got) setTurns((t) => (t[t.length - 1]?.content === "" ? t.slice(0, -1) : t));
      } catch {
        setNotice("The connection dropped. Nothing you have logged is affected.");
        setTurns((t) => (t[t.length - 1]?.content === "" ? t.slice(0, -1) : t));
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy, turns],
  );

  return (
    <section className={s.chatShell} aria-label="AI coach conversation">
      <div className={s.chatTopbar}>
        <div className={s.chatIdentity}>
          <span className={s.chatAvatar} aria-hidden="true"><Sparkles size={19} /></span>
          <span><b>FitFuel coach</b><span>Grounded in your logged data</span></span>
        </div>
        <span className={s.chatPrivacy}>Private to your account</span>
      </div>

      <div
        className={s.transcript}
        aria-live="polite"
        aria-busy={busy}
        onWheel={() => {
          const el = document.scrollingElement;
          if (el) pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
        }}
      >
        {turns.length === 0 ? (
          <div className={s.emptyState}>
            <span className={s.emptyMark} aria-hidden="true"><Sparkles size={25} /></span>
            <h2>Your data is already in the room.</h2>
            <p>
              Ask a plain question. The coach can connect your plan, meals,
              protein, workouts and recent progress before it answers.
            </p>
          </div>
        ) : null}
        {turns.map((t, i) => (
          <div
            key={i}
            className={`${s.turn} ${t.role === "user" ? s.turnUser : ""}`}
          >
            <span className={s.turnAvatar} aria-hidden="true">{t.role === "user" ? "Y" : "F"}</span>
            <div className={s.bubble}>
              <p className={s.bubbleLabel}>{t.role === "user" ? "You" : "Coach"}</p>
              <p className={s.bubbleCopy}>
                {t.content}
                {busy && i === turns.length - 1 && t.role === "assistant" ? (
                  <span aria-hidden="true" className={s.typing}>
                    {t.content ? " ▍" : "Thinking…"}
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {notice ? (
        <p role="status" className={s.notice}>
          {notice}
        </p>
      ) : null}

      {turns.length === 0 ? (
        <div className={s.suggestions} aria-label="Suggested questions">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => send(suggestion)}
              disabled={busy}
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}

      <div className={s.composerWrap}>
        <form
          className={s.composer}
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
        >
          <label htmlFor="trainer-input" className="sr-only">Ask the coach</label>
          <textarea
            id="trainer-input"
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(draft);
              }
            }}
            rows={2}
            maxLength={2000}
            placeholder="Ask about your plan, macros or tonight’s meal…"
            disabled={busy}
          />
          <button className={s.sendButton} type="submit" disabled={busy || !draft.trim()}>
            <span>{busy ? "Thinking" : "Send"}</span>
            <ArrowUp size={18} aria-hidden="true" />
          </button>
        </form>
        <p className={s.disclosure}>
          Not medical advice. Ask a doctor about conditions or medication.
        </p>
      </div>
    </section>
  );
}
