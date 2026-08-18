// lib/ai-trainer/provider.ts
//
// WHICH MODEL ANSWERS THE COACH.
//
// The owner has no budget for the Anthropic API, so the coach — built, wired,
// migrated and shipped — has never once run. This module is why it can run on a
// free provider today and move to Claude the day there is budget, WITHOUT
// rewriting the screen, the route, the persona or the context engine.
//
// It is a provider interface, deliberately, rather than a swap of one SDK for
// another. Swapping would have thrown away a working Claude integration to get
// a free one; this keeps both and picks at runtime:
//
//   CLAUDE_API_KEY set and real  ->  Claude Opus 5      (preferred)
//   GEMINI_API_KEY set           ->  Gemini Flash       (free tier)
//   neither                      ->  the screen says so, honestly
//
// Precedence is quality-first on purpose: the day a real Anthropic key lands in
// the environment, the coach upgrades itself with no code change and no deploy.
//
// WHAT A PROVIDER IS RESPONSIBLE FOR: turning one prompt into a stream of text
// deltas and a final usage/stop report. Nothing else. The persona, the context
// engine, the 12-SAFE guards, the NDJSON envelope, the conversation store and
// the rate limit all sit ABOVE this line and are provider-independent — which
// is the point. The safety rules are ours, not the vendor's, so changing vendor
// must not be able to change what the coach is allowed to say.

import type { TrainerTurn } from "./types";

/** One event from a provider's stream. */
export type ProviderDelta =
  | { type: "text"; text: string }
  | {
      type: "done";
      inputTokens?: number;
      outputTokens?: number;
      /** Why generation stopped. `refusal` covers a provider safety block. */
      stop?: "end" | "max_tokens" | "refusal";
      refusedReason?: string;
    };

/** What every provider is handed. Assembled once, upstream, identically. */
export type ProviderRequest = {
  /** The frozen 12-SAFE system prompt. Never interpolated. */
  system: string;
  /** This customer's serialised context plus the tone note. */
  context: string;
  history: TrainerTurn[];
  message: string;
};

export interface TrainerProvider {
  /** Stable id for logs and for the `AiMessage.model` column. */
  readonly id: string;
  /** Shown to the operator, never to the customer. */
  readonly label: string;
  /** True when this provider has a credential that could plausibly work. */
  isConfigured(): boolean;
  stream(req: ProviderRequest): AsyncIterable<ProviderDelta>;
}
