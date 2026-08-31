// app/dashboard/trainer/page.tsx
//
// Phase 12B — the coach's screen.
//
// /dashboard/coach is the DETERMINISTIC half: the weekly review, the plateau
// call and the recalibration, computed in TypeScript and applied with a button.
// That half is not replaced and should not be — arithmetic about someone's
// weight belongs in code that can be read, not in a model's head.
//
// This is the conversational half, and the split is deliberate: the coach
// screen tells you what changed, this one answers "why" and "what do I do
// tonight". They link to each other.
//
// Server component. It reads the API key's configuration state so the client
// never has to, and so a missing key renders as a plain statement on first
// paint rather than as a failed fetch a second later.

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";

import { auth } from "@/lib/auth";
import { isTrainerConfigured } from "@/lib/ai-trainer/client";
import { loadLatestThread } from "@/lib/ai-trainer/store";
import { TRAINER_OFFLINE, TRAINER_OPENER } from "@/lib/ai-trainer/persona";
import TrainerChat from "./TrainerChat";
import s from "./trainer.module.css";

export const metadata: Metadata = { title: "Coach chat" };
export const dynamic = "force-dynamic";

export default async function TrainerPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard/trainer");

  const configured = isTrainerConfigured();
  /* Read on the server so a returning customer's thread is in the first paint
     rather than appearing a beat later — a chat that flashes empty and then
     fills reads as though it lost the conversation. Skipped when the coach is
     off; there is nothing to resume. */
  const thread = configured ? await loadLatestThread(session.user.id) : null;

  return (
    <main className={s.page}>
      <div className={s.wrap}>
        <header className={s.hero}>
          <div className={s.heroCopy}>
            <p className={s.coachLabel}>Your personal data, connected</p>
            <h1>Ask the coach that knows your week.</h1>
            <p>{TRAINER_OPENER}</p>
          </div>
          <aside className={s.contextCard} aria-label="What the coach can use">
            <span className={s.contextIcon} aria-hidden="true"><Sparkles size={24} /></span>
            <div>
              <h2>Already briefed</h2>
              <p>No retyping your context every time you ask a question.</p>
              <ul className={s.contextList}>
                <li>Your current plan and targets</li>
                <li>Meals, workouts and recent weigh-ins</li>
                <li>Your last 30 days of progress</li>
              </ul>
              <Link href="/dashboard/coach">Open weekly recalibration</Link>
            </div>
          </aside>
        </header>

        {configured ? (
          <TrainerChat
            initialTurns={thread?.turns ?? []}
            initialConversationId={thread?.conversationId ?? null}
          />
        ) : (
          <div className={s.offline}>
            <h2>The live coach is taking a pause.</h2>
            <p>{TRAINER_OFFLINE}</p>
            <p>Your logs and plan are safe. The deterministic weekly review is still available.</p>
            <Link href="/dashboard/coach">See your weekly review</Link>
          </div>
        )}
      </div>
    </main>
  );
}
