// components/ReferralCapture.tsx
// Phase 17A \u2014 client-side ref code capture.
// Drop into app/layout.tsx (or any layout that wraps both authed + unauthed pages).
// On mount:
//   1. If URL has ?ref=CODE, write to a long-lived cookie + localStorage
//   2. If user is logged in (cookie/session present), POST to /api/attribute-ref
// The endpoint guards first-touch and validates the code, so duplicate calls are safe.

"use client";
import { useEffect } from "react";

const COOKIE_NAME = "ff_ref";
const COOKIE_MAX_AGE_DAYS = 30;

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 86400_000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function ReferralCapture() {
  useEffect(() => {
    try {
      // 1. capture from URL
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get("ref");
      if (fromUrl) {
        const clean = fromUrl.trim().slice(0, 64);
        setCookie(COOKIE_NAME, clean, COOKIE_MAX_AGE_DAYS);
        try { localStorage.setItem("ff_ref", clean); } catch {}
      }

      // 2. attempt server attribution (server checks auth + first-touch)
      const code = fromUrl || getCookie(COOKIE_NAME) || (typeof localStorage !== "undefined" ? localStorage.getItem("ff_ref") : null);
      if (code) {
        fetch("/api/attribute-ref", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        }).catch(() => {});
      }
    } catch {
      // silently ignore \u2014 referral attribution is best-effort
    }
  }, []);

  return null;
}
