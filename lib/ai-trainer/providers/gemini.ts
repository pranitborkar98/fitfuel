// lib/ai-trainer/providers/gemini.ts
//
// THE FREE PROVIDER. Google Gemini Flash, free tier.
//
// Chosen because it is the only credible option that needs NO CARD: Google's
// docs state plainly that the free tier does not require billing to be enabled
// (billing is only needed to move past it), and an API key comes from AI Studio
// on a Google account the owner already has. That was the whole requirement.
//
// EVERY FIELD BELOW WAS READ OUT OF GOOGLE'S REST REFERENCE, NOT RECALLED.
// The Claude integration next door had a skill to check it against; this one
// did not, and an LLM integration written from memory is how you ship a body
// shape that 400s on first contact. Verified before writing:
//   - endpoint  POST /v1beta/models/{model}:streamGenerateContent?alt=sse
//   - auth      x-goog-api-key HEADER — not the ?key= query parameter the
//               reference also documents. Same result, but a key in a URL ends
//               up in proxy logs, access logs and error reports; a header does
//               not. Never move this back into the query string.
//   - body      { systemInstruction: {parts:[{text}]}, contents:[{role,parts}],
//                 generationConfig }
//   - roles     "user" | "model"  — NOT "assistant". Our stored turns say
//               assistant, so they are mapped on the way out. Sending
//               "assistant" is rejected.
//   - chunks    candidates[0].content.parts[].text, finishReason,
//               usageMetadata.promptTokenCount / candidatesTokenCount
//
// WHAT THIS PROVIDER DOES NOT HAVE, stated so nobody assumes parity with the
// Claude path: no explicit prompt-cache breakpoint (the Anthropic path caches
// the persona + context prefix at ~0.1x; here that prefix is re-sent every
// turn — irrelevant while the tier is free, relevant if it ever isn't), and no
// server-side refusal fallback. The 12-SAFE persona is unchanged either way,
// because the safety rules are ours and must not vary by vendor.

import type { ProviderDelta, ProviderRequest, TrainerProvider } from "../provider";

const KEY = process.env.GEMINI_API_KEY?.trim() ?? "";

/* Both this and gemini-3.7-flash are on Google's free-tier list. Defaulting to
   2.5 rather than the newest because it is the one this integration was written
   and reasoned against; override in the environment to move up without a
   deploy. The coach reads a month of one person's numbers — Flash is the right
   size for that, and Pro is not free. */
const MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

const ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`;

/* Shared budget for the reply. Flash does not bill us on the free tier, so this
   is a truncation guard rather than a cost one. */
const MAX_OUTPUT_TOKENS = 2_048;

type GeminiChunk = {
  candidates?: {
    content?: { parts?: { text?: string }[]; role?: string };
    finishReason?: string;
  }[];
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  promptFeedback?: { blockReason?: string };
};

export const geminiProvider: TrainerProvider = {
  id: `gemini:${MODEL}`,
  label: "Google Gemini Flash (free tier)",

  /* Google's keys are ~39 chars and start AIza. Checked by shape so the screen
     can say "not switched on" instead of surfacing a 400 as a broken panel —
     the same reasoning as the Anthropic key check. */
  isConfigured() {
    return KEY.startsWith("AIza") && KEY.length > 30;
  },

  async *stream(req: ProviderRequest): AsyncIterable<ProviderDelta> {
    const res = await fetch(ENDPOINT(MODEL), {
      method: "POST",
      headers: {
        "x-goog-api-key": KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        /* Persona and context both go here rather than as a leading user turn:
           systemInstruction is the channel Google treats as operator-authority,
           and putting the 12-SAFE rules in an ordinary turn would leave them
           arguable by a later user message. */
        systemInstruction: {
          parts: [{ text: `${req.system}\n\n${req.context}` }],
        },
        contents: [
          ...req.history.map((t) => ({
            /* assistant -> model. The one mapping that silently 400s if missed. */
            role: t.role === "assistant" ? "model" : "user",
            parts: [{ text: t.content }],
          })),
          { role: "user", parts: [{ text: req.message }] },
        ],
        generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
      }),
    });

    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => "");
      throw Object.assign(
        new Error(`gemini ${res.status}: ${detail.slice(0, 400)}`),
        { status: res.status },
      );
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    /* SSE frames are split across network reads at arbitrary byte offsets, so a
       partial line is carried forward rather than parsed. Dropping this buffer
       is the classic way to lose a word mid-sentence under load. */
    let buffer = "";
    let inputTokens: number | undefined;
    let outputTokens: number | undefined;
    let stop: "end" | "max_tokens" | "refusal" = "end";
    let refusedReason: string | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const raw of lines) {
        const trimmed = raw.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;

        let chunk: GeminiChunk;
        try {
          chunk = JSON.parse(payload) as GeminiChunk;
        } catch {
          /* A frame we cannot parse is skipped rather than thrown: the customer
             is mid-sentence, and one malformed chunk should cost a word, not
             the whole reply. */
          continue;
        }

        if (chunk.promptFeedback?.blockReason) {
          stop = "refusal";
          refusedReason = chunk.promptFeedback.blockReason;
        }

        const candidate = chunk.candidates?.[0];
        for (const part of candidate?.content?.parts ?? []) {
          if (part.text) yield { type: "text", text: part.text };
        }

        const finish = candidate?.finishReason;
        if (finish === "MAX_TOKENS") stop = "max_tokens";
        else if (finish && finish !== "STOP") {
          /* SAFETY, RECITATION, PROHIBITED_CONTENT and friends. Treated as a
             refusal so the screen shows the coach's own boundary line rather
             than a vendor enum the customer cannot act on. */
          stop = "refusal";
          refusedReason = finish;
        }

        if (chunk.usageMetadata) {
          inputTokens = chunk.usageMetadata.promptTokenCount ?? inputTokens;
          outputTokens = chunk.usageMetadata.candidatesTokenCount ?? outputTokens;
        }
      }
    }

    yield { type: "done", inputTokens, outputTokens, stop, refusedReason };
  },
};
