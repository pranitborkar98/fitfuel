// lib/ai-trainer/providers/anthropic.ts
//
// THE PREFERRED PROVIDER. Claude Opus 5.
//
// This is the Phase 12B integration, moved behind the provider interface
// unchanged — same model, same adaptive thinking, same cache breakpoint on the
// context block, same server-side refusal fallback. Nothing about it was
// weakened to accommodate the free provider next door; it is simply no longer
// the only option, so the coach can run without a paid key and upgrade to this
// the moment one exists.
//
// SERVER ONLY. Reads the API key.

import Anthropic from "@anthropic-ai/sdk";

import type { ProviderDelta, ProviderRequest, TrainerProvider } from "../provider";

/* A real key is `sk-ant-...` and around a hundred characters. `.env` currently
   carries a 12-character placeholder, which would fail at request time with an
   authentication error the customer would see as a broken screen. Checking the
   shape up front lets the UI say "not switched on yet", which is true, instead
   of "something went wrong", which is not. */
const KEY = process.env.CLAUDE_API_KEY?.trim() ?? "";

/* The coach reasons over a month of one person's data and has to get medical
   boundaries right every time; this is not the surface to save on. */
const MODEL = "claude-opus-5";

/* Left at the API default deliberately rather than tuned down on a guess.
   `medium` is the first thing to try if replies feel slow in use — Opus 5 holds
   up unusually well below `high` — but that is a product call to make against a
   real reply, not one to bake in blind. */
const EFFORT = "high" as const;

/* Thinking counts against max_tokens on Opus 5, and thinking is ON by default —
   so this figure is the reply PLUS the reasoning, not the reply alone. A 4k
   budget sized for chat text would truncate mid-sentence once the coach thinks
   about a plateau. */
const MAX_TOKENS = 16_000;

export const anthropicProvider: TrainerProvider = {
  id: `anthropic:${MODEL}`,
  label: "Claude Opus 5",

  isConfigured() {
    return KEY.startsWith("sk-ant-") && KEY.length > 40;
  },

  async *stream(req: ProviderRequest): AsyncIterable<ProviderDelta> {
    const anthropic = new Anthropic({ apiKey: KEY });

    const stream = anthropic.beta.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      /* Opus 5 thinks by default; stating it keeps the intent legible next to
         max_tokens, which it shares a budget with. */
      thinking: { type: "adaptive" },
      output_config: { effort: EFFORT },
      /* Opus 5's safety classifiers can decline a request outright. A nutrition
         coach is not the expected trigger, but a customer asking about a
         medication interaction is exactly the adjacent-to-clinical shape that
         occasionally trips one — and a silent stop would look like the app
         breaking. `default` routes by refusal category rather than pinning a
         model that will eventually be deprecated. */
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [
        { type: "text", text: req.system },
        {
          type: "text",
          text: req.context,
          /* The breakpoint. Everything above it — persona plus this customer's
             profile — is served at cache-read price on their next message. */
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        ...req.history.map((t) => ({ role: t.role, content: t.content })),
        { role: "user" as const, content: req.message },
      ],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta" &&
        event.delta.text
      ) {
        yield { type: "text", text: event.delta.text };
      }
    }

    const final = await stream.finalMessage();

    /* Read AFTER the stream drains rather than instead of reading it: a
       mid-stream decline keeps the partial text, so the customer should see
       what was written plus an explanation, not a blank panel. */
    let stop: "end" | "max_tokens" | "refusal" = "end";
    let refusedReason: string | undefined;
    if (final.stop_reason === "refusal") {
      stop = "refusal";
      refusedReason =
        (final.stop_details as { category?: string } | null)?.category ?? "refusal";
    } else if (final.stop_reason === "max_tokens") {
      stop = "max_tokens";
    }

    yield {
      type: "done",
      inputTokens: final.usage?.input_tokens,
      outputTokens: final.usage?.output_tokens,
      stop,
      refusedReason,
    };
  },
};
