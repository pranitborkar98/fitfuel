// app/admin/notifications/NotificationsClient.tsx
"use client";
import { useEffect, useState } from "react";

type Tpl = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  channel: "WHATSAPP" | "EMAIL" | "BOTH";
  category: string;
  whatsappTemplateName: string | null;
  whatsappLanguage: string | null;
  whatsappVariables: string | null;
  emailSubject: string | null;
  emailBody: string | null;
  active: boolean;
  isStaff: boolean;
  updatedAt: string;
};

type Log = {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userPhone: string | null;
  templateKey: string;
  channel: "WHATSAPP" | "EMAIL" | "BOTH";
  status: "QUEUED" | "SENT" | "FAILED" | "SKIPPED";
  provider: string | null;
  providerRef: string | null;
  error: string | null;
  createdAt: string;
};

const PANEL: React.CSSProperties = {
  background: "#0e0e0e",
  border: "1px solid #1f1f1f",
  borderRadius: 8,
  padding: 20,
};
const INPUT: React.CSSProperties = {
  background: "#080808",
  border: "1px solid #2a2a2a",
  color: "#eee",
  borderRadius: 4,
  padding: "8px 10px",
  fontSize: 13,
  width: "100%",
  fontFamily: "inherit",
};
const BTN: React.CSSProperties = {
  background: "#84cc16",
  color: "#000",
  border: "none",
  padding: "8px 14px",
  borderRadius: 4,
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 13,
};
const BTN_GHOST: React.CSSProperties = {
  background: "transparent",
  color: "#bbb",
  border: "1px solid #2a2a2a",
  padding: "8px 14px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 13,
};
const LABEL: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  color: "#888",
  textTransform: "uppercase",
  letterSpacing: 0.6,
  marginBottom: 6,
  fontWeight: 600,
};

export default function NotificationsClient() {
  const [tab, setTab] = useState<"templates" | "logs">("templates");
  return (
    <div style={{ padding: 24, color: "#eee" }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            margin: 0,
            letterSpacing: -0.5,
          }}
        >
          Notifications
        </h1>
        <p style={{ color: "#777", margin: "6px 0 0", fontSize: 13 }}>
          Email + WhatsApp templates, send logs, and test sends.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setTab("templates")}
          style={{
            ...BTN_GHOST,
            background: tab === "templates" ? "#84cc16" : "transparent",
            color: tab === "templates" ? "#000" : "#bbb",
            border:
              tab === "templates"
                ? "1px solid #84cc16"
                : "1px solid #2a2a2a",
            fontWeight: tab === "templates" ? 700 : 500,
          }}
        >
          Templates
        </button>
        <button
          onClick={() => setTab("logs")}
          style={{
            ...BTN_GHOST,
            background: tab === "logs" ? "#84cc16" : "transparent",
            color: tab === "logs" ? "#000" : "#bbb",
            border:
              tab === "logs" ? "1px solid #84cc16" : "1px solid #2a2a2a",
            fontWeight: tab === "logs" ? 700 : 500,
          }}
        >
          Send logs
        </button>
      </div>

      {tab === "templates" ? <TemplatesTab /> : <LogsTab />}
    </div>
  );
}

/* ---------------- TEMPLATES TAB ---------------- */

function TemplatesTab() {
  const [items, setItems] = useState<Tpl[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/admin/notifications?tab=templates");
    const j = await r.json();
    setItems(j.templates || []);
  }
  useEffect(() => {
    load();
  }, []);

  if (!items) return <div style={{ color: "#666" }}>Loading\u2026</div>;
  if (items.length === 0) {
    return (
      <div style={PANEL}>
        <div style={{ color: "#aaa" }}>
          No templates yet. Run:{" "}
          <code style={{ color: "#84cc16" }}>
            npx tsx prisma/seed-notification-templates.ts
          </code>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((t) => (
        <TemplateRow
          key={t.id}
          tpl={t}
          open={openId === t.id}
          onToggleOpen={() => setOpenId(openId === t.id ? null : t.id)}
          onChanged={load}
        />
      ))}
    </div>
  );
}

function TemplateRow({
  tpl,
  open,
  onToggleOpen,
  onChanged,
}: {
  tpl: Tpl;
  open: boolean;
  onToggleOpen: () => void;
  onChanged: () => void;
}) {
  async function toggleActive() {
    await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "toggleActive",
        data: { id: tpl.id },
      }),
    });
    onChanged();
  }

  return (
    <div style={PANEL}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}
            >
              {tpl.name}
            </div>
            <code
              style={{
                fontSize: 11,
                color: "#84cc16",
                background: "#0a1505",
                padding: "2px 6px",
                borderRadius: 3,
              }}
            >
              {tpl.key}
            </code>
            <Pill>{tpl.channel}</Pill>
            <Pill muted>{tpl.category}</Pill>
            {tpl.isStaff && <Pill muted>staff</Pill>}
          </div>
          {tpl.description && (
            <div style={{ color: "#888", fontSize: 12, marginTop: 6 }}>
              {tpl.description}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={toggleActive}
            style={{
              ...BTN_GHOST,
              borderColor: tpl.active ? "#84cc16" : "#2a2a2a",
              color: tpl.active ? "#84cc16" : "#888",
            }}
          >
            {tpl.active ? "Active" : "Inactive"}
          </button>
          <button onClick={onToggleOpen} style={BTN_GHOST}>
            {open ? "Close" : "Edit"}
          </button>
        </div>
      </div>

      {open && <TemplateEditor tpl={tpl} onSaved={onChanged} />}
    </div>
  );
}

function TemplateEditor({
  tpl,
  onSaved,
}: {
  tpl: Tpl;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    id: tpl.id,
    name: tpl.name,
    description: tpl.description || "",
    channel: tpl.channel,
    category: tpl.category,
    whatsappTemplateName: tpl.whatsappTemplateName || "",
    whatsappLanguage: tpl.whatsappLanguage || "en",
    whatsappVariables: tpl.whatsappVariables || "",
    emailSubject: tpl.emailSubject || "",
    emailBody: tpl.emailBody || "",
    active: tpl.active,
  });
  const [saving, setSaving] = useState(false);
  const [testOpen, setTestOpen] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateTemplate", data: form }),
      });
      const j = await r.json();
      if (j.ok) onSaved();
      else alert(j.error || "save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        marginTop: 16,
        paddingTop: 16,
        borderTop: "1px solid #1f1f1f",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <div>
          <label style={LABEL}>Channel</label>
          <select
            style={INPUT}
            value={form.channel}
            onChange={(e) => update("channel", e.target.value as any)}
          >
            <option value="WHATSAPP">WhatsApp only</option>
            <option value="EMAIL">Email only</option>
            <option value="BOTH">Both</option>
          </select>
        </div>
        <div>
          <label style={LABEL}>Category (user-pref bucket)</label>
          <select
            style={INPUT}
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="orderUpdates">Order updates</option>
            <option value="deliveryUpdates">Delivery updates</option>
            <option value="weeklyDigest">Weekly digest</option>
            <option value="morningPush">Morning push</option>
            <option value="nudges">Nudges</option>
            <option value="marketing">Marketing</option>
            <option value="staff">Staff (bypasses prefs)</option>
          </select>
        </div>
      </div>

      <div>
        <label style={LABEL}>Description</label>
        <input
          style={INPUT}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      {(form.channel === "WHATSAPP" || form.channel === "BOTH") && (
        <div
          style={{
            border: "1px solid #1a1a1a",
            borderRadius: 6,
            padding: 14,
            background: "#0a0a0a",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#84cc16",
              textTransform: "uppercase",
              letterSpacing: 0.6,
              marginBottom: 12,
            }}
          >
            WhatsApp (MSG91)
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: 12,
            }}
          >
            <div>
              <label style={LABEL}>Template name (Meta-approved)</label>
              <input
                style={INPUT}
                value={form.whatsappTemplateName}
                onChange={(e) =>
                  update("whatsappTemplateName", e.target.value)
                }
                placeholder="ff_order_confirmed"
              />
            </div>
            <div>
              <label style={LABEL}>Language</label>
              <input
                style={INPUT}
                value={form.whatsappLanguage}
                onChange={(e) =>
                  update("whatsappLanguage", e.target.value)
                }
                placeholder="en"
              />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={LABEL}>
              Variables (ordered JSON array of var names)
            </label>
            <input
              style={INPUT}
              value={form.whatsappVariables}
              onChange={(e) =>
                update("whatsappVariables", e.target.value)
              }
              placeholder='["name","orderNumber","amount"]'
            />
            <div style={{ color: "#666", fontSize: 11, marginTop: 4 }}>
              These map to body_1, body_2\u2026 in the Meta template.
            </div>
          </div>
        </div>
      )}

      {(form.channel === "EMAIL" || form.channel === "BOTH") && (
        <div
          style={{
            border: "1px solid #1a1a1a",
            borderRadius: 6,
            padding: 14,
            background: "#0a0a0a",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#84cc16",
              textTransform: "uppercase",
              letterSpacing: 0.6,
              marginBottom: 12,
            }}
          >
            Email (Resend)
          </div>
          <div>
            <label style={LABEL}>Subject</label>
            <input
              style={INPUT}
              value={form.emailSubject}
              onChange={(e) => update("emailSubject", e.target.value)}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={LABEL}>Body (HTML \u2014 use {`{{var}}`})</label>
            <textarea
              style={{
                ...INPUT,
                minHeight: 220,
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 12,
                lineHeight: 1.5,
              }}
              value={form.emailBody}
              onChange={(e) => update("emailBody", e.target.value)}
            />
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={save} style={BTN} disabled={saving}>
          {saving ? "Saving\u2026" : "Save"}
        </button>
        <button
          onClick={() => setTestOpen((s) => !s)}
          style={BTN_GHOST}
        >
          {testOpen ? "Close test" : "Test send"}
        </button>
      </div>

      {testOpen && <TestSendBox templateKey={tpl.key} variables={form.whatsappVariables} />}
    </div>
  );
}

function TestSendBox({
  templateKey,
  variables,
}: {
  templateKey: string;
  variables: string;
}) {
  // Try to derive sensible default var fields from the WA variables JSON
  let varNames: string[] = [];
  try {
    if (variables) varNames = JSON.parse(variables);
  } catch {}
  const [toEmail, setToEmail] = useState("");
  const [toPhone, setToPhone] = useState("");
  const [vars, setVars] = useState<Record<string, string>>(
    Object.fromEntries(varNames.map((n) => [n, ""]))
  );
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function fire() {
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "testSend",
          data: { templateKey, toEmail, toPhone, vars },
        }),
      });
      const j = await r.json();
      setResult(j);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        marginTop: 4,
        border: "1px dashed #2a2a2a",
        borderRadius: 6,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#888",
          textTransform: "uppercase",
          letterSpacing: 0.6,
          marginBottom: 12,
          fontWeight: 600,
        }}
      >
        Test send
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div>
          <label style={LABEL}>To email</label>
          <input
            style={INPUT}
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label style={LABEL}>To phone (with country code)</label>
          <input
            style={INPUT}
            value={toPhone}
            onChange={(e) => setToPhone(e.target.value)}
            placeholder="919876543210"
          />
        </div>
      </div>
      {varNames.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 10,
          }}
        >
          {varNames.map((n) => (
            <div key={n}>
              <label style={LABEL}>{n}</label>
              <input
                style={INPUT}
                value={vars[n] || ""}
                onChange={(e) =>
                  setVars((v) => ({ ...v, [n]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>
      )}
      <button onClick={fire} style={BTN} disabled={busy}>
        {busy ? "Sending\u2026" : "Fire test"}
      </button>
      {result && (
        <pre
          style={{
            marginTop: 12,
            background: "#050505",
            padding: 10,
            borderRadius: 4,
            fontSize: 11,
            color: "#9ae600",
            border: "1px solid #1a1a1a",
            overflow: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

/* ---------------- LOGS TAB ---------------- */

function LogsTab() {
  const [logs, setLogs] = useState<Log[] | null>(null);
  const [status, setStatus] = useState("");
  const [channel, setChannel] = useState("");
  const [q, setQ] = useState("");

  async function load() {
    const params = new URLSearchParams({ tab: "logs" });
    if (status) params.set("status", status);
    if (channel) params.set("channel", channel);
    if (q) params.set("q", q);
    const r = await fetch("/api/admin/notifications?" + params.toString());
    const j = await r.json();
    setLogs(j.logs || []);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <select
          style={{ ...INPUT, width: 140 }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="SENT">Sent</option>
          <option value="FAILED">Failed</option>
          <option value="SKIPPED">Skipped</option>
        </select>
        <select
          style={{ ...INPUT, width: 140 }}
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        >
          <option value="">All channels</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="EMAIL">Email</option>
        </select>
        <input
          style={{ ...INPUT, width: 240 }}
          placeholder="Search email or phone"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={load} style={BTN}>
          Filter
        </button>
      </div>

      {!logs ? (
        <div style={{ color: "#666" }}>Loading\u2026</div>
      ) : logs.length === 0 ? (
        <div style={{ ...PANEL, color: "#777" }}>No logs yet.</div>
      ) : (
        <div style={{ ...PANEL, padding: 0, overflow: "hidden" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
            }}
          >
            <thead>
              <tr style={{ background: "#0a0a0a", color: "#888" }}>
                <Th>When</Th>
                <Th>Template</Th>
                <Th>Channel</Th>
                <Th>Status</Th>
                <Th>To</Th>
                <Th>Error</Th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr
                  key={l.id}
                  style={{ borderTop: "1px solid #1a1a1a" }}
                >
                  <Td>{new Date(l.createdAt).toLocaleString()}</Td>
                  <Td>
                    <code style={{ color: "#84cc16", fontSize: 11 }}>
                      {l.templateKey}
                    </code>
                  </Td>
                  <Td>{l.channel}</Td>
                  <Td>
                    <span
                      style={{
                        color:
                          l.status === "SENT"
                            ? "#84cc16"
                            : l.status === "FAILED"
                            ? "#ef4444"
                            : "#888",
                        fontWeight: 600,
                      }}
                    >
                      {l.status}
                    </span>
                  </Td>
                  <Td>{l.userEmail || l.userPhone || "\u2014"}</Td>
                  <Td style={{ color: "#888" }}>{l.error || "\u2014"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "10px 12px",
        fontWeight: 600,
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      {children}
    </th>
  );
}
function Td({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <td
      style={{
        padding: "10px 12px",
        color: "#ddd",
        verticalAlign: "top",
        ...style,
      }}
    >
      {children}
    </td>
  );
}

function Pill({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        background: muted ? "#1a1a1a" : "#0a1505",
        color: muted ? "#aaa" : "#84cc16",
        border: muted ? "1px solid #2a2a2a" : "1px solid #1f3a08",
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      {children}
    </span>
  );
}
