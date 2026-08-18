// app/api/trainer/chat/route.ts
//
// Phase 12B — the coach's one endpoint.
//
// Streams a reply as newline-delimited JSON. Not SSE: there is exactly one
// consumer, it is our own screen, and NDJSON needs no event framing and no
// EventSource on the client — which matters because EventSource cannot POST,
// and the request body here is a conversation.
//
// GATES, in the order they run and the order they matter:
//   1. session          — this reads one person's weigh-ins and meal log
//   2. rate limit       — every call spends money on a frontier model
//   3. schema           — untrusted body, and it goes into a prompt
//   4. configuration    — no key means an honest notice, not a 500

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  isTrainerConfigured,
  streamTrainerReply,
  type TrainerChunk,
} from "@/lib/ai-trainer/client";
import { TRAINER_OFFLINE } from "@/lib/ai-trainer/persona";
import { beginTurn, finishTurn } from "@/lib/ai-trainer/store";

/** Emit one NDJSON line ahead of an existing stream, without buffering it. */
function prependLine(
  stream: ReadableStream<Uint8Array>,
  chunk: TrainerChunk,
): ReadableStream<Uint8Array> {
  const head = new TextEncoder().encode(JSON.stringify(chunk) + "\n");
  const reader = stream.getReader();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(head);
    },
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) controller.close();
      else controller.enqueue(value);
    },
    /* Propagate a client disconnect so the upstream request is torn down
       rather than left generating tokens nobody will read. */
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
}

/* Builds a per-user context from live rows; nothing here is cacheable. */
export const dynamic = "force-dynamic";

/* Message length is capped well below anything a person types so a pasted
   document cannot quietly become a 60k-token bill. History is capped too: the
   client sends the thread back each turn, and without a ceiling an old
   conversation grows the prompt without limit. Twenty turns is roughly the
   point past which the coach should be leaning on the context block anyway. */
const Body = z.object({
  message: z.string().trim().min(1, "Say something first.").max(2_000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(8_000),
      }),
    )
    .max(20)
    .default([]),
  /* Which thread to append to. Client-supplied and therefore untrusted —
     beginTurn() re-checks ownership against the session before writing. */
  conversationId: z.string().cuid().nullish(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to talk to the coach." }, { status: 401 });
  }

  /* Keyed on the user as well as the IP: an office or a shared mobile network
     puts many customers behind one address, and one heavy user should not lock
     the coach for a floor of colleagues. */
  const limit = await enforceRateLimit(req, "aiChat", session.user.id);
  if (!limit.ok) return limit.response;

  let parsed;
  try {
    parsed = Body.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  /* 200, not 503. The screen is working exactly as built; the key is missing.
     A 5xx here would page an on-call engineer for a business decision. */
  if (!isTrainerConfigured()) {
    return new Response(JSON.stringify({ e: TRAINER_OFFLINE }) + "\n", {
      status: 200,
      headers: { "content-type": "application/x-ndjson; charset=utf-8" },
    });
  }

  /* The customer's turn is recorded before the model is called, so a question
     that crashes the coach survives the reload. Returns null if persistence is
     unavailable, and the turn proceeds unsaved rather than being refused. */
  const conversationId = await beginTurn(
    session.user.id,
    parsed.data.conversationId ?? null,
    parsed.data.message,
  );

  const stream = await streamTrainerReply(
    session.user.id,
    parsed.data.history,
    parsed.data.message,
    (outcome) =>
      finishTurn(conversationId, outcome.reply, {
        inputTokens: outcome.inputTokens,
        outputTokens: outcome.outputTokens,
        refusedReason: outcome.refusedReason,
      }),
  );

  /* The thread id goes out ahead of the reply so the client is holding it
     before the first token lands — a customer who closes the tab mid-answer
     still comes back to the right conversation. */
  const withId = conversationId
    ? prependLine(stream, { c: conversationId })
    : stream;

  return new Response(withId, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      /* Vercel and nginx both buffer proxied responses by default, which holds
         the whole reply until it finishes and defeats the point of streaming. */
      "x-accel-buffering": "no",
    },
  });
}
