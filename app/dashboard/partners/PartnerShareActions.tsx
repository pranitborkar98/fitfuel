"use client";

import { Check, Copy, Download, MessageCircle } from "lucide-react";
import { useState } from "react";
import styles from "./partner-console.module.css";

export default function PartnerShareActions({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const copy = async () => {
    setError("");
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setError("Copy is unavailable in this browser. Select the link above instead.");
    }
  };

  const message = encodeURIComponent(`I thought FitFuel might suit you. See the meal plans here: ${link}`);
  return (
    <div className={styles.shareActions}>
      <button type="button" onClick={() => void copy()}>{copied ? <Check aria-hidden="true" size={17} /> : <Copy aria-hidden="true" size={17} />}{copied ? "Link copied" : "Copy link"}</button>
      <a href={`https://wa.me/?text=${message}`} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" size={17} />Share on WhatsApp</a>
      <a href="/api/user/partner/qr?format=png&download=1"><Download aria-hidden="true" size={17} />Download QR</a>
      <span role="status" aria-live="polite">{error}</span>
    </div>
  );
}
