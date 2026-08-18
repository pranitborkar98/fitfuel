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

import { C, body, label, SANS, PANEL } from "@/app/_app/theme";

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
    <div>
      {/* aria-live so a screen reader hears the reply as it lands. `polite`,
          not `assertive`: it should not interrupt the customer mid-sentence. */}
      <div
        style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 200 }}
        aria-live="polite"
        aria-busy={busy}
        onWheel={() => {
          const el = document.scrollingElement;
          if (el) pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
        }}
      >
        {turns.map((t, i) => (
          <div
            key={i}
            style={{
              alignSelf: t.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "min(64ch, 92%)",
              ...(t.role === "user"
                ? { background: C.wash, border: `1px solid ${C.rule2}` }
                : PANEL),
              padding: "12px 14px",
            }}
          >
            <p
              style={label(11, {
                color: t.role === "user" ? C.mute : C.lime,
                marginBottom: 6,
              })}
            >
              {t.role === "user" ? "You" : "Coach"}
            </p>
            <p
              style={body(14, {
                color: C.ink,
                margin: 0,
                whiteSpace: "pre-wrap",
                lineHeight: 1.55,
              })}
            >
              {t.content}
              {/* The caret only exists while the last bubble is still filling. */}
              {busy && i === turns.length - 1 && t.role === "assistant" ? (
                <span aria-hidden="true" style={{ color: C.lime }}>
                  {t.content ? " ▍" : "Thinking…"}
                </span>
              ) : null}
            </p>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {notice ? (
        <p
          role="status"
          style={body(13, {
            color: C.ink,
            background: C.panel2,
            border: `1px solid ${C.rule2}`,
            padding: "10px 12px",
            marginTop: 14,
          })}
        >
          {notice}
        </p>
      ) : null}

      {turns.length === 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={busy}
              style={{
                minHeight: 44,
                padding: "0 14px",
                background: "transparent",
                border: `1px solid ${C.rule2}`,
                color: C.ink,
                fontFamily: SANS,
                fontSize: 13,
                cursor: busy ? "default" : "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
        style={{ display: "flex", gap: 10, alignItems: "flex-end", marginTop: 18 }}
      >
        <label htmlFor="trainer-input" className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}>
          Ask the coach
        </label>
        <textarea
          id="trainer-input"
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            /* Enter sends, shift+enter breaks the line — the convention every
               chat surface uses, and the one thumbs already expect. */
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(draft);
            }
          }}
          rows={2}
          maxLength={2000}
          placeholder="Ask about your plan, your macros, tonight's meal…"
          disabled={busy}
          style={{
            flex: 1,
            minHeight: 44,
            resize: "vertical",
            padding: "11px 12px",
            background: C.panel,
            border: `1px solid ${C.rule2}`,
            color: C.ink,
            /* 16px: anything smaller triggers iOS auto-zoom on focus, which
               yanks the whole page sideways mid-conversation. */
            fontSize: 16,
            fontFamily: SANS,
            lineHeight: 1.45,
          }}
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          style={{
            minHeight: 44,
            padding: "0 20px",
            background: busy || !draft.trim() ? C.trough : C.lime,
            color: busy || !draft.trim() ? C.dim : C.onLime,
            border: 0,
            fontFamily: SANS,
            fontSize: 14,
            fontWeight: 700,
            cursor: busy || !draft.trim() ? "default" : "pointer",
          }}
        >
          {busy ? "…" : "Send"}
        </button>
      </form>

      <p style={body(12, { color: C.dim, marginTop: 10, maxWidth: "60ch" })}>
        Not medical advice. For anything about a condition or medication, talk to
        your doctor.
      </p>
    </div>
  );
}
