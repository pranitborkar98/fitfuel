// lib/ai-trainer/store.ts
//
// Phase 12C — conversation persistence.
//
// Small on purpose. The coach's intelligence comes from the context engine
// reading logged rows, not from conversation history, so this layer only has to
// do one thing well: let someone close the tab and come back to the thread they
// were in.
//
// WHY THE THREAD IS NOT THE MEMORY. It is tempting to treat stored messages as
// what the coach "knows". It is not — buildTrainerContext() re-reads the
// customer's real data on every turn, so a fact that changed since Tuesday is
// correct on Wednesday even though Tuesday's message still says the old number.
// History is here for the conversation to make sense, not to be a source of
// truth, and nothing downstream should start trusting it as one.
//
// SERVER ONLY.

import { prisma } from "@/lib/prisma";
import type { TrainerTurn } from "./client";

/** How much of a thread is replayed to the model and rendered on load. The
 *  route caps the model's view at 20 turns; matching it here means the screen
 *  never shows context the coach cannot actually see. */
const WINDOW = 20;

/** The stored thread, oldest first, plus the id to keep writing into. */
export type StoredThread = { conversationId: string; turns: TrainerTurn[] };

/**
 * The conversation to resume, or null for a first-time visitor.
 *
 * "Most recently updated" rather than "most recent by creation": someone who
 * returns to an older thread and keeps typing should keep landing in it.
 */
export async function loadLatestThread(userId: string): Promise<StoredThread | null> {
  try {
    const convo = await prisma.aiConversation.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: WINDOW,
          select: { role: true, content: true },
        },
      },
    });
    if (!convo) return null;
    return {
      conversationId: convo.id,
      /* Taken newest-first so the DB does the limiting, then flipped — the last
         N turns are what matters, not the first N. */
      turns: convo.messages
        .reverse()
        .map((m) => ({
          role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
          content: m.content,
        })),
    };
  } catch (err) {
    /* A history failure must not cost someone the ability to ask a question.
       Degrade to a fresh thread rather than erroring the screen. */
    console.error("[ai-trainer] loadLatestThread failed", err);
    return null;
  }
}

/**
 * Record the customer's turn, opening a conversation if this is the first one.
 *
 * Written BEFORE the model is called, so a question that crashes the coach is
 * still in the thread when they reload — losing the customer's own words to our
 * outage is the worse of the two failures.
 */
export async function beginTurn(
  userId: string,
  conversationId: string | null,
  message: string,
): Promise<string | null> {
  try {
    if (conversationId) {
      /* Scoped by userId as well as id: the id arrives from the client, so
         without this anyone could append to — and later read back — a stranger's
         health conversation by guessing a cuid. */
      const owned = await prisma.aiConversation.findFirst({
        where: { id: conversationId, userId },
        select: { id: true },
      });
      if (!owned) conversationId = null;
    }

    if (!conversationId) {
      const created = await prisma.aiConversation.create({
        data: {
          userId,
          /* The opening question, trimmed, as the thread's name. Never asked of
             the model: a title round trip is a second billed request and can
             invent a subject the customer never raised. */
          title: message.slice(0, 80),
        },
        select: { id: true },
      });
      conversationId = created.id;
    }

    await prisma.aiMessage.create({
      data: { conversationId, role: "USER", content: message },
    });
    return conversationId;
  } catch (err) {
    /* Persistence is a convenience; the coach still works without it. Return
       null and let the turn proceed unsaved rather than refusing to answer. */
    console.error("[ai-trainer] beginTurn failed", err);
    return null;
  }
}

/**
 * Record the coach's reply and what the turn cost.
 *
 * `refusedReason` is stored rather than dropped so a run of refusals shows up
 * as a pattern in the data instead of as silence — that is the difference
 * between "the classifier is miscalibrated for nutrition questions" being
 * discoverable and being folklore. `model` is stored for the same reason once
 * there are two providers: a refusal rate is meaningless if you cannot tell
 * which model produced it.
 */
export async function finishTurn(
  conversationId: string | null,
  reply: string,
  usage: {
    inputTokens?: number;
    outputTokens?: number;
    refusedReason?: string;
    /* Which provider answered. Recorded per MESSAGE rather than per thread
       because a single conversation can legitimately span providers — the
       coach upgrades from the free tier to Claude the moment a key appears,
       mid-thread if need be. */
    model?: string;
  },
): Promise<void> {
  if (!conversationId) return;
  /* An empty reply with no refusal means the stream died before a word was
     written. A blank assistant bubble on reload is worse than none. */
  if (!reply && !usage.refusedReason) return;
  try {
    await prisma.$transaction([
      prisma.aiMessage.create({
        data: {
          conversationId,
          role: "ASSISTANT",
          content: reply,
          inputTokens: usage.inputTokens ?? null,
          outputTokens: usage.outputTokens ?? null,
          refusedReason: usage.refusedReason ?? null,
          model: usage.model ?? null,
        },
      }),
      /* Touch the parent so loadLatestThread finds this thread next time. */
      prisma.aiConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);
  } catch (err) {
    console.error("[ai-trainer] finishTurn failed", err);
  }
}
