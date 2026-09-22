"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sparkles, X, ArrowUpRight } from "lucide-react";
import { useCart } from "@/app/_cart/CartProvider";
import s from "./coach-dock.module.css";

const TrainerChat = dynamic(
  () => import("@/app/dashboard/trainer/TrainerChat"),
  {
    loading: () => <p role="status">Opening your coach…</p>,
  },
);
type Thread = {
  conversationId: string;
  turns: { role: "user" | "assistant"; content: string }[];
};

export default function CoachDock({ configured }: { configured: boolean }) {
  const pathname = usePathname();
  const { status, data: session } = useSession();
  const cart = useCart();
  // A route or account change unmounts private conversation state immediately.
  if (
    [
      "/admin",
      "/driver",
      "/auth",
      "/checkout",
      "/dashboard-preview",
      "/dashboard/trainer",
    ].some((p) => pathname === p || pathname.startsWith(`${p}/`))
  )
    return null;
  return (
    <Dock
      key={`${pathname}:${session?.user?.id ?? status}`}
      configured={configured}
      status={status}
      cartOpen={cart.open}
      hasCart={cart.badgeCount > 0}
    />
  );
}

function Dock({
  configured,
  status,
  cartOpen,
  hasCart,
}: {
  configured: boolean;
  status: "authenticated" | "unauthenticated" | "loading";
  cartOpen: boolean;
  hasCart: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState<Thread | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const returnFocus = document.activeElement as HTMLElement | null;
    element?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previous;
      returnFocus?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open || status !== "authenticated" || !configured) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    let active = true;
    fetch("/api/trainer/thread", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("History unavailable");
        const data = (await response.json()) as { thread: Thread | null };
        if (active) {
          setThread(data.thread);
          setReady(true);
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [open, status, configured, attempt]);

  return (
    <>
      <button
        ref={trigger}
        id="fitfuel-coach-trigger"
        type="button"
        className={s.trigger}
        data-cart={hasCart}
        hidden={cartOpen}
        aria-label="Open AI coach"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setReady(false);
          setError(false);
          setOpen(true);
        }}
      >
        <Sparkles size={21} aria-hidden="true" />
        <span>AI coach</span>
      </button>
      {open ? (
        <dialog
          ref={dialog}
          className={s.dialog}
          aria-labelledby="coach-dock-title"
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const items = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>(
                'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),[tabindex="0"]',
              ),
            ).filter((item) => item.getClientRects().length > 0);
            const first = items[0];
            const last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }}
          onCancel={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <header className={s.header}>
            <div>
              <Sparkles size={20} aria-hidden="true" />
              <h2 id="coach-dock-title">Your FitFuel AI coach</h2>
            </div>
            <button
              type="button"
              autoFocus
              onClick={() => setOpen(false)}
              aria-label="Close AI coach"
            >
              <X size={22} />
            </button>
          </header>
          <div className={s.content}>
            {status === "loading" ? (
              <p role="status">Checking your account…</p>
            ) : status !== "authenticated" ? (
              <div className={s.welcome}>
                <p className={s.label}>Meals, training and progress</p>
                <h3>Ask about your day, with your data in context.</h3>
                <p>
                  The coach can use your saved plan, food diary, workouts and
                  measurements. Sign in to keep the conversation private to your
                  account.
                </p>
                <ul>
                  <li>Understand your calorie and protein logs</li>
                  <li>Review workouts and recent progress</li>
                  <li>Talk through your meal plan</li>
                </ul>
                {!configured ? (
                  <p role="status">
                    Live chat is currently unavailable. Your weekly review is
                    still accessible after sign-in.
                  </p>
                ) : null}
                <Link
                  className={s.primary}
                  href="/auth/signin?callbackUrl=%2Fdashboard%2Ftrainer"
                >
                  Sign in to your coach <ArrowUpRight size={18} />
                </Link>
                <Link href="/dashboard-preview">
                  Explore the dashboard without signing in
                </Link>
                <p className={s.fine}>
                  AI guidance can be wrong. It is not medical advice.
                </p>
              </div>
            ) : !configured ? (
              <div className={s.welcome}>
                <h3>Live chat is currently unavailable.</h3>
                <p>Your saved logs and weekly review remain available.</p>
                <Link className={s.primary} href="/dashboard/coach">
                  Open weekly review
                </Link>
              </div>
            ) : error ? (
              <div className={s.welcome} role="alert">
                <p>Your conversation could not be loaded.</p>
                <button
                  className={s.primary}
                  type="button"
                  onClick={() => {
                    setError(false);
                    setAttempt((value) => value + 1);
                  }}
                >
                  Try again
                </button>
                <Link href="/dashboard/trainer">Open the full coach</Link>
              </div>
            ) : !ready ? (
              <p role="status">Loading your conversation…</p>
            ) : (
              <TrainerChat
                compact
                initialTurns={thread?.turns ?? []}
                initialConversationId={thread?.conversationId ?? null}
              />
            )}
          </div>
          <footer className={s.footer}>
            <Link href="/dashboard/trainer">Full coach</Link>
            <Link href="/dashboard/coach">Weekly review</Link>
          </footer>
        </dialog>
      ) : null}
    </>
  );
}
