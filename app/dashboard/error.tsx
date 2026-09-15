"use client";

import Link from "next/link";
import { screen, body, solidBtn, ghostBtn } from "@/app/_app/theme";
import s from "./dashboard.module.css";

export default function DashboardError({
  unstable_retry,
}: {
  unstable_retry: () => void;
}) {
  return (
    <div className={s.page} role="alert">
      <h1 style={screen()}>Your dashboard could not load</h1>
      <p style={body(16, { margin: "16px 0" })}>
        We could not retrieve your account data. This does not mean your orders
        or records are missing.
      </p>
      <div className={s.inlineActions}>
        <button
          type="button"
          style={solidBtn()}
          onClick={() => unstable_retry()}
        >
          Try again
        </button>
        <Link href="/contact" style={ghostBtn()}>
          Contact support
        </Link>
      </div>
    </div>
  );
}
