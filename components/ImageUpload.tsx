"use client";

// components/ImageUpload.tsx
// Reusable image uploader (recipes, plans, blog covers, testimonial avatars).
// Uploads straight to Vercel Blob via the client-upload flow, then calls
// onChange with the public URL. Falls back to letting you paste a URL too.

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

const C = {
  border: "#222", soft: "#0c0c0c", text: "#ffffff", muted: "#888888",
  accent: "#84cc16", danger: "#f87171", card: "#101010",
};

export default function ImageUpload({
  value,
  onChange,
  folder = "uploads",
  label,
}: {
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file?: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErr("Please choose an image file."); return; }
    if (file.size > 8 * 1024 * 1024) { setErr("Image must be under 8 MB."); return; }
    setBusy(true); setErr(null);
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const blob = await upload(`${folder}/${safe}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      onChange(blob.url);
    } catch (e: any) {
      setErr(e?.message || "Upload failed. Is the Blob store connected?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {label && <div style={{ fontSize: 12, color: C.muted, marginBottom: 5, fontWeight: 600 }}>{label}</div>}

      {value ? (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img src={value} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}`, background: C.soft }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} style={btnStyle(false)}>{busy ? "Uploading…" : "Replace"}</button>
            <button type="button" onClick={() => onChange("")} style={{ ...btnStyle(false), color: C.danger, borderColor: "#3a1c1c" }}>Remove</button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
          style={{
            border: `1.5px dashed ${drag ? C.accent : C.border}`, borderRadius: 10, padding: "20px 16px",
            textAlign: "center", cursor: "pointer", background: drag ? "#10160a" : C.soft, transition: "all .12s",
          }}
        >
          <div style={{ color: busy ? C.accent : C.muted, fontSize: 13 }}>
            {busy ? "Uploading…" : <>Drag an image here, or <span style={{ color: C.accent, fontWeight: 600 }}>browse</span></>}
          </div>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>JPG / PNG / WebP · up to 8 MB</div>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files?.[0])} />

      {err && <div style={{ color: C.danger, fontSize: 12, marginTop: 6 }}>{err}</div>}

      <div style={{ marginTop: 6 }}>
        {showUrl ? (
          <input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL"
            style={{ width: "100%", background: C.soft, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 12.5, boxSizing: "border-box" }}
          />
        ) : (
          <button type="button" onClick={() => setShowUrl(true)} style={{ background: "none", border: "none", color: C.muted, fontSize: 12.5, cursor: "pointer", padding: 0, textDecoration: "underline" }}>
            or paste a URL
          </button>
        )}
      </div>
    </div>
  );
}

function btnStyle(primary: boolean): React.CSSProperties {
  return {
    background: primary ? C.accent : "transparent", color: primary ? "#080808" : C.text,
    border: `1px solid ${primary ? C.accent : C.border}`, borderRadius: 8, padding: "6px 12px",
    fontSize: 12, fontWeight: 700, cursor: "pointer",
  };
}
