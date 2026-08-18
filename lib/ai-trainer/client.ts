// lib/ai-trainer/client.ts
//
// Phase 12B — the model call. The one place in the codebase that talks to an LLM.
//
// WHAT WAS ALREADY HERE AND WHAT WAS NOT. lib/ai-trainer/context.ts (403 lines)
// and serialise.ts (161) have existed since 2026-07-29 and were imported by
// NOTHING — a complete context engine with no consumer, because Phase 12B was
// parked pending an API key. This file is the consumer. It adds no new
// interpretation: the arithmetic, the plateau detection and the momentum call
// all still happen in TypeScript upstream, exactly as context.ts intended.
//
// ── THE PROMPT IS BUILT FOR THE CACHE ──────────────────────────────────────
// Caching is a prefix match, so the request is assembled stable-first:
//
//   system[0]  TRAINER_SYSTEM      frozen string, identical for every user
//   system[1]  serialised context  per user, changes about once a day  <- breakpoint
//   messages   the conversation    changes every turn
//
// serialise.ts was written for this — its header says the block is assembled
// deterministically precisely so it can be cached. The breakpoint sits on the
// context block, so a returning customer re-reads both blocks at ~0.1x instead
// of paying full price for a 2k-token profile on every message.
//
// SERVER ONLY. Never import from a client component: it reads the API key.

import Anthropic from "@anthropic-ai/sdk";

import { buildTrainerContext } from "./context";
import { serialiseTrainerContext } from "./serialise";
import { TRAINER_SYSTEM, toneFor } from "./persona";

/* ── Configuration ─────────────────────────────────────────────────────────
   A real key is `sk-ant-...` and around a hundred characters. `.env` currently
   carries a 12-character placeholder, which would fail at request time with an
   authentication error the customer would see as a broken screen. Checking the
   shape up front lets the UI say "not switched on yet", which is true, instead
   of "something went wrong", which is not. */
const KEY = process.env.CLAUDE_API_KEY?.trim() ?? "";

export function isTrainerConfigured(): boolean {
  return KEY.startsWith("sk-ant-") && KEY.length > 40;
}

/* Claude Opus 5. The coach reasons over a month of one person's data and has to
   get medical boundaries right every time; this is not the surface to save on. */
const MODEL = "claude-opus-5";

/* Effort is the latency lever for this screen, and it is left at the API
   default deliberately rather than tuned down on a guess. `medium` is the first
   thing to try if replies feel slow in use — Opus 5 holds up unusually well
   below `high` — but that is a product call to make against a real reply, not
   one to bake in blind. */
const EFFORT = "high" as const;

/* Thinking counts against max_tokens on Opus 5, and thinking is ON by default
   here — so this figure is the reply PLUS the reasoning, not the reply alone. A
   4k budget sized for chat text would truncate mid-sentence once the coach
   thinks about a plateau. */
const MAX_TOKENS = 16_000;

/** One turn of the stored conversation. */
export type TrainerTurn = { role: "user" | "assistant"; content: string };

/** A line of the response stream. Newline-delimited JSON: `t` is text to
 *  append, `e` is a notice to show in place of a reply. */
export type TrainerChunk = { t: string } | { e: string };

const enc = new TextEncoder();
const line = (c: TrainerChunk) => enc.encode(JSON.stringify(c) + "\n");

/**
 * Stream a coach reply for one user.
 *
 * Returns a ReadableStream of NDJSON. Errors are delivered IN the stream rather
 * than thrown, because by the time most of them happen the HTTP response has
 * already started and a thrown error would just truncate the connection — which
 * the browser renders as a half-written sentence with no explanation.
 */
export async function streamTrainerReply(
  userId: string,
  history: TrainerTurn[],
  message: string,
): Promise<ReadableStream<Uint8Array>> {
  const anthropic = new Anthropic({ apiKey: KEY });

  /* Built before the stream opens: a context failure should surface as a clean
     message, not as a dead stream half a second in. */
  const ctx = await buildTrainerContext(userId);
  const contextBlock = `${serialiseTrainerContext(ctx)}\n\n## How to pitch this\n${toneFor(
    ctx.consistency.thisWeekScore,
  )}`;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = (c: TrainerChunk) => controller.enqueue(line(c));
      try {
        const stream = anthropic.beta.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          /* Opus 5 thinks by default; stating it keeps the intent legible next
             to max_tokens, which it shares a budget with. */
          thinking: { type: "adaptive" },
          output_config: { effort: EFFORT },
          /* Opus 5's safety classifiers can decline a request outright. A
             nutrition coach is not the expected trigger, but a customer asking
             about a medication interaction is exactly the adjacent-to-clinical
             shape that occasionally trips one — and a silent stop would look
             like the app breaking. `default` routes by refusal category rather
             than pinning a model that will eventually be deprecated. */
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          system: [
            { type: "text", text: TRAINER_SYSTEM },
            {
              type: "text",
              text: contextBlock,
              /* The breakpoint. Everything above it — persona plus this
                 customer's profile — is served at cache-read price on their
                 next message. */
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [
            ...history.map((t) => ({ role: t.role, content: t.content })),
            { role: "user" as const, content: message },
          ],
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta" &&
            event.delta.text
          ) {
            push({ t: event.delta.text });
          }
        }

        const final = await stream.finalMessage();

        /* Checked AFTER the stream drains rather than instead of reading it: a
           mid-stream decline keeps the partial text, so the customer should see
           what was written plus an explanation, not a blank panel. */
        if (final.stop_reason === "refusal") {
          push({
            e: "I can't take that one on. If it's about your health or your medication, that's a question for your doctor — I can pick up anything to do with your plan and your numbers.",
          });
        } else if (final.stop_reason === "max_tokens") {
          push({ e: "That answer ran long and got cut off. Ask me for the short version." });
        }
      } catch (err) {
        const status = (err as { status?: number })?.status;
        console.error("[ai-trainer] stream failed", err);
        push({
          e:
            status === 429
              ? "The coach is busy right now. Try again in a minute."
              : "The coach could not be reached. Nothing you have logged is affected — try again shortly.",
        });
      } finally {
        controller.close();
      }
    },
  });
}
