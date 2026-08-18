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

import { auth } from "@/lib/auth";
import { isTrainerConfigured } from "@/lib/ai-trainer/client";
import { loadLatestThread } from "@/lib/ai-trainer/store";
import { TRAINER_OFFLINE, TRAINER_OPENER } from "@/lib/ai-trainer/persona";
import { C, screen, body, label, PANEL, APP_MAX, SANS } from "@/app/_app/theme";
import TrainerChat from "./TrainerChat";

export const metadata: Metadata = { title: "Coach chat" };
export const dynamic = "force-dynamic";

const WRAP: React.CSSProperties = {
  width: "100%",
  maxWidth: APP_MAX,
  margin: "0 auto",
  padding: "0 clamp(16px,4vw,28px)",
};

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
    <div style={{ background: C.bg, minHeight: "100dvh", paddingBottom: 96 }}>
      <div style={WRAP}>
        <header style={{ paddingTop: 28, paddingBottom: 18 }}>
          <p style={label(12, { color: C.lime, marginBottom: 8 })}>Your coach</p>
          <h1 style={screen()}>Ask about your plan</h1>
          <p style={body(14, { color: C.mute, marginTop: 10, maxWidth: "60ch" })}>
            {TRAINER_OPENER}
          </p>
          <p style={body(13, { color: C.dim, marginTop: 12, maxWidth: "60ch" })}>
            It reads your logged data and explains it. It does not change
            anything — recalibration still happens on{" "}
            <Link
              href="/dashboard/coach"
              style={{ color: C.lime, textDecoration: "underline" }}
            >
              the coach screen
            </Link>
            . It is not a doctor, and it will not answer questions about
            medication.
          </p>
        </header>

        {configured ? (
          <TrainerChat
            initialTurns={thread?.turns ?? []}
            initialConversationId={thread?.conversationId ?? null}
          />
        ) : (
          /* NOT an error state. The pipeline is built and wired; the key is a
             business decision that has not been taken. Saying so plainly is
             more useful than a spinner that never resolves. */
          <div style={{ ...PANEL, padding: 20, borderRadius: 2 }}>
            <p style={body(14, { color: C.ink, margin: 0, maxWidth: "60ch" })}>
              {TRAINER_OFFLINE}
            </p>
            {/* Two keys named, cheapest first, because the blocker was budget
                rather than engineering. Gemini's free tier needs no billing
                enabled and no card — that is the whole reason it is here. */}
            <p style={body(13, { color: C.dim, marginTop: 12, maxWidth: "60ch" })}>
              Set either{" "}
              <code style={{ fontFamily: SANS, color: C.mute }}>GEMINI_API_KEY</code>{" "}
              (free tier, no card) or{" "}
              <code style={{ fontFamily: SANS, color: C.mute }}>CLAUDE_API_KEY</code>{" "}
              and this screen starts working with no further code change. If both
              are set, Claude answers.
            </p>
            <Link
              href="/dashboard/coach"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 44,
                marginTop: 16,
                padding: "0 18px",
                background: C.lime,
                color: C.onLime,
                fontFamily: SANS,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              See your weekly review instead
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
