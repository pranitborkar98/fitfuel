// lib/ai-trainer/client.ts
//
// Phase 12B — the coach's turn. Provider-independent since 2026-08-18.
//
// WHAT THIS FILE OWNS, and what it deliberately does not. It owns the shape of
// a turn: build the context, pick a provider, stream NDJSON to the browser,
// translate a stop reason into something a customer can act on, and hand the
// finished reply to the caller for storage. It does NOT own the model call —
// that is behind ./provider, so the coach runs on a free provider today and on
// Claude the day there is budget, with no change here.
//
// The Anthropic integration that used to live in this file is intact in
// ./providers/anthropic.ts, not diluted: same Opus 5, same adaptive thinking,
// same cache breakpoint, same refusal fallback.
//
// ── THE PROMPT IS STILL BUILT FOR THE CACHE ────────────────────────────────
// Assembled stable-first, and handed to every provider in the same order:
//
//   system   TRAINER_SYSTEM      frozen string, identical for every user
//   context  serialised context  per user, changes about once a day
//   messages the conversation    changes every turn
//
// The Anthropic provider puts a cache breakpoint on the context block, so a
// returning customer re-reads persona + profile at ~0.1x. The Gemini provider
// has no equivalent and re-sends it — free, so it does not matter yet, and
// documented there so nobody assumes parity later.
//
// SERVER ONLY. Never import from a client component: providers read API keys.

import { buildTrainerContext } from "./context";
import { serialiseTrainerContext } from "./serialise";
import { TRAINER_SYSTEM, toneFor } from "./persona";
import type { TrainerProvider } from "./provider";
import { anthropicProvider } from "./providers/anthropic";
import { geminiProvider } from "./providers/gemini";
import type { TrainerChunk, TrainerOutcome, TrainerTurn } from "./types";

/* Re-exported so every existing importer of these types keeps working — they
   moved to ./types only to break a cycle with the providers. */
export type { TrainerChunk, TrainerOutcome, TrainerTurn } from "./types";

/* QUALITY FIRST, THEN FREE. Order is the whole policy: the day a real
   CLAUDE_API_KEY lands in the environment the coach upgrades itself with no
   code change and no deploy, and until then it runs rather than sitting dark. */
const PROVIDERS: TrainerProvider[] = [anthropicProvider, geminiProvider];

/** The provider that will answer, or null if none has a usable credential. */
export function activeTrainerProvider(): TrainerProvider | null {
  return PROVIDERS.find((p) => p.isConfigured()) ?? null;
}

export function isTrainerConfigured(): boolean {
  return activeTrainerProvider() !== null;
}

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
  onFinish?: (outcome: TrainerOutcome) => Promise<void> | void,
): Promise<ReadableStream<Uint8Array>> {
  const provider = activeTrainerProvider();

  /* Built before the stream opens: a context failure should surface as a clean
     message, not as a dead stream half a second in. */
  const ctx = await buildTrainerContext(userId);
  const contextBlock = `${serialiseTrainerContext(ctx)}\n\n## How to pitch this\n${toneFor(
    ctx.consistency.thisWeekScore,
  )}`;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = (c: TrainerChunk) => controller.enqueue(line(c));
      /* Accumulated alongside the stream so the finished reply can be stored
         without the route having to re-read what it just sent. */
      const outcome: TrainerOutcome = { reply: "", model: provider?.id };

      try {
        if (!provider) {
          /* Reachable if the key is unset between the route's check and here.
             Says the true thing rather than a generic failure. */
          push({ e: "The coach is not switched on yet." });
          return;
        }

        for await (const delta of provider.stream({
          system: TRAINER_SYSTEM,
          context: contextBlock,
          history,
          message,
        })) {
          if (delta.type === "text") {
            outcome.reply += delta.text;
            push({ t: delta.text });
            continue;
          }

          outcome.inputTokens = delta.inputTokens;
          outcome.outputTokens = delta.outputTokens;

          if (delta.stop === "refusal") {
            outcome.refusedReason = delta.refusedReason ?? "refusal";
            /* One line for every provider's refusal. The coach's boundary is
               ours, not the vendor's, so the customer reads the same sentence
               whichever model declined and never sees a vendor enum. */
            push({
              e: "I can't take that one on. If it's about your health or your medication, that's a question for your doctor — I can pick up anything to do with your plan and your numbers.",
            });
          } else if (delta.stop === "max_tokens") {
            push({ e: "That answer ran long and got cut off. Ask me for the short version." });
          }
        }
      } catch (err) {
        const status = (err as { status?: number })?.status;
        console.error(`[ai-trainer] stream failed (${provider?.id ?? "none"})`, err);
        push({
          e:
            status === 429
              ? "The coach is busy right now. Try again in a minute."
              : "The coach could not be reached. Nothing you have logged is affected — try again shortly.",
        });
      } finally {
        /* Persist before closing, and never let a storage failure surface as a
           broken stream — the customer has already read the reply by now. */
        try {
          await onFinish?.(outcome);
        } catch (err) {
          console.error("[ai-trainer] onFinish failed", err);
        }
        controller.close();
      }
    },
  });
}
