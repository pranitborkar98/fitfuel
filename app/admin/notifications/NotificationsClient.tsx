"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import styles from "./notifications.module.css";

const CHANNELS = ["WHATSAPP", "EMAIL", "BOTH"] as const;
const CATEGORIES = [
  "orderUpdates", "deliveryUpdates", "weeklyDigest", "morningPush",
  "eveningRecap", "nudges", "marketing", "staff",
] as const;
const STATUSES = ["QUEUED", "SENT", "FAILED", "SKIPPED"] as const;

type Channel = typeof CHANNELS[number];
type Category = typeof CATEGORIES[number];
type NotificationStatus = typeof STATUSES[number];
type Template = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  channel: Channel;
  category: Category;
  whatsappTemplateName: string | null;
  whatsappLanguage: string | null;
  whatsappVariables: string | null;
  emailSubject: string | null;
  emailBody: string | null;
  active: boolean;
  isStaff: boolean;
  updatedAt: string;
};
type NotificationLog = {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userPhone: string | null;
  templateKey: string;
  channel: Channel;
  status: NotificationStatus;
  provider: string | null;
  providerRef: string | null;
  error: string | null;
  createdAt: string;
};
type TemplateForm = {
  id: string;
  name: string;
  description: string;
  channel: Channel;
  category: Category;
  active: boolean;
  whatsappTemplateName: string;
  whatsappLanguage: string;
  whatsappVariables: string;
  emailSubject: string;
  emailBody: string;
};
type SendResult = {
  whatsapp?: "sent" | "skipped" | "failed";
  email?: "sent" | "skipped" | "failed";
  errors: string[];
};

const dateTime = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok || !payload) throw new Error(payload?.error ?? "The request failed.");
  return payload;
}

function pretty(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase());
}

function variableNames(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function templateForm(template: Template): TemplateForm {
  return {
    id: template.id,
    name: template.name,
    description: template.description ?? "",
    channel: template.channel,
    category: template.category,
    active: template.active,
    whatsappTemplateName: template.whatsappTemplateName ?? "",
    whatsappLanguage: template.whatsappLanguage ?? "en",
    whatsappVariables: variableNames(template.whatsappVariables).join(", "),
    emailSubject: template.emailSubject ?? "",
    emailBody: template.emailBody ?? "",
  };
}

export default function NotificationsClient() {
  const [tab, setTab] = useState<"templates" | "logs">("templates");
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Customer communication</p>
        <h1>Notifications</h1>
        <p>Edit the messages customers receive, test each delivery channel deliberately, and see provider failures without exposing notification payloads.</p>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Notification sections">
        <button type="button" role="tab" aria-selected={tab === "templates"} onClick={() => setTab("templates")}>Message templates</button>
        <button type="button" role="tab" aria-selected={tab === "logs"} onClick={() => setTab("logs")}>Delivery logs</button>
      </div>

      {tab === "templates" ? <TemplatesTab /> : <LogsTab />}
    </main>
  );
}

function TemplatesTab() {
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    try {
      const data = await requestJson<{ templates: Template[] }>("/api/admin/notifications?tab=templates");
      setTemplates(data.templates);
      setError(null);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Notification templates could not be loaded.");
    }
  }

  useEffect(() => {
    let cancelled = false;
    requestJson<{ templates: Template[] }>("/api/admin/notifications?tab=templates")
      .then((data) => { if (!cancelled) setTemplates(data.templates); })
      .catch((caught: unknown) => { if (!cancelled) setError(caught instanceof Error ? caught.message : "Notification templates could not be loaded."); })
      .finally(() => { if (!cancelled) setTemplates((current) => current ?? []); });
    return () => { cancelled = true; };
  }, []);

  const summary = useMemo(() => ({
    active: templates?.filter((template) => template.active).length ?? 0,
    customer: templates?.filter((template) => !template.isStaff).length ?? 0,
    staff: templates?.filter((template) => template.isStaff).length ?? 0,
  }), [templates]);

  return (
    <section className={styles.panel} role="tabpanel">
      <div className={styles.metrics}>
        <Metric label="Active templates" value={summary.active} note="Eligible to send" />
        <Metric label="Customer messages" value={summary.customer} note="Preference-aware" />
        <Metric label="Staff alerts" value={summary.staff} note="Operational only" />
      </div>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {templates === null ? <Loading label="Loading notification templates…" /> : templates.length === 0 ? (
        <div className={styles.empty}><strong>No templates configured</strong><span>The deployment needs its notification template data before messages can send.</span></div>
      ) : (
        <div className={styles.templateList}>
          {templates.map((template) => {
            const open = openId === template.id;
            const detailId = `template-${template.id}`;
            return (
              <article className={open ? `${styles.template} ${styles.templateOpen}` : styles.template} key={template.id}>
                <button className={styles.templateSummary} type="button" aria-expanded={open} aria-controls={detailId} onClick={() => setOpenId(open ? null : template.id)}>
                  <span className={styles.channelIcon} aria-hidden="true">{template.channel === "WHATSAPP" ? "W" : template.channel === "EMAIL" ? "E" : "W+E"}</span>
                  <span className={styles.templateName}><strong>{template.name}</strong><small>{template.description || template.key}</small></span>
                  <span className={template.active ? styles.activeStatus : styles.inactiveStatus}>{template.active ? "Active" : "Inactive"}</span>
                  <span className={styles.meta}>{pretty(template.channel)}</span>
                  <span className={styles.meta}>{pretty(template.category)}</span>
                  <span className={styles.expand} aria-hidden="true">{open ? "−" : "+"}</span>
                </button>
                {open ? <TemplateEditor template={template} onChanged={reload} id={detailId} /> : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function TemplateEditor({ template, onChanged, id }: { template: Template; onChanged: () => Promise<void>; id: string }) {
  const [form, setForm] = useState(() => templateForm(template));
  const [saving, setSaving] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const usesWhatsApp = form.channel === "WHATSAPP" || form.channel === "BOTH";
  const usesEmail = form.channel === "EMAIL" || form.channel === "BOTH";

  function update<K extends keyof TemplateForm>(key: K, value: TemplateForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const variables = form.whatsappVariables.split(/[\n,]/).map((value) => value.trim()).filter(Boolean);
    try {
      await requestJson("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateTemplate",
          data: { ...form, whatsappVariables: JSON.stringify(variables) },
        }),
      });
      setMessage("Template saved.");
      await onChanged();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "The template could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.editor} id={id}>
      <form onSubmit={save}>
        <div className={styles.editorGrid}>
          <section>
            <SectionTitle title="Message identity" note={`System key: ${template.key}. The key cannot be renamed because product workflows depend on it.`} />
            <div className={styles.formGrid}>
              <Field label="Internal name"><input required maxLength={120} value={form.name} onChange={(event) => update("name", event.target.value)} /></Field>
              <Field label="Channel"><select value={form.channel} onChange={(event) => update("channel", event.target.value as Channel)}>{CHANNELS.map((channel) => <option value={channel} key={channel}>{pretty(channel)}</option>)}</select></Field>
              <Field label="Category"><select disabled={template.isStaff} value={form.category} onChange={(event) => update("category", event.target.value as Category)}>{CATEGORIES.filter((category) => template.isStaff ? category === "staff" : category !== "staff").map((category) => <option value={category} key={category}>{pretty(category)}</option>)}</select></Field>
              <Check label="Active and eligible to send" checked={form.active} onChange={(value) => update("active", value)} />
              <Field label="Internal description" wide><textarea rows={3} maxLength={500} value={form.description} onChange={(event) => update("description", event.target.value)} /></Field>
            </div>
          </section>

          {usesWhatsApp ? (
            <section>
              <SectionTitle title="WhatsApp" note="The template name and variable order must match the approved MSG91 / Meta template exactly." />
              <div className={styles.formGrid}>
                <Field label="Approved template name"><input required pattern="[a-z0-9_]+" value={form.whatsappTemplateName} onChange={(event) => update("whatsappTemplateName", event.target.value)} /></Field>
                <Field label="Language"><input required pattern="[a-z]{2}(_[A-Z]{2})?" value={form.whatsappLanguage} onChange={(event) => update("whatsappLanguage", event.target.value)} placeholder="en or en_US" /></Field>
                <Field label="Variables in body order" wide><textarea rows={3} value={form.whatsappVariables} onChange={(event) => update("whatsappVariables", event.target.value)} placeholder="name, orderNumber, deliveryDate" /><small>Comma or line separated. These map to WhatsApp body variables in order.</small></Field>
              </div>
            </section>
          ) : null}

          {usesEmail ? (
            <section>
              <SectionTitle title="Email" note="Variables use double braces, for example {{name}}. Test every meaningful change before leaving it active." />
              <div className={styles.formGrid}>
                <Field label="Subject" wide><input required maxLength={200} value={form.emailSubject} onChange={(event) => update("emailSubject", event.target.value)} /></Field>
                <Field label="HTML body" wide><textarea className={styles.codeArea} rows={12} required value={form.emailBody} onChange={(event) => update("emailBody", event.target.value)} /></Field>
              </div>
            </section>
          ) : null}
        </div>

        {message ? <p className={styles.success} role="status">{message}</p> : null}
        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <div className={styles.editorActions}>
          <button type="button" onClick={() => setTestOpen((value) => !value)}>{testOpen ? "Close test send" : "Open test send"}</button>
          <button className={styles.primaryButton} disabled={saving}>{saving ? "Saving…" : "Save template"}</button>
        </div>
      </form>
      {testOpen ? <TestSend template={template} form={form} /> : null}
    </div>
  );
}

function TestSend({ template, form }: { template: Template; form: TemplateForm }) {
  const names = form.whatsappVariables.split(/[\n,]/).map((value) => value.trim()).filter(Boolean);
  const [toEmail, setToEmail] = useState("");
  const [toPhone, setToPhone] = useState("");
  const [vars, setVars] = useState<Record<string, string>>(() => Object.fromEntries(names.map((name) => [name, name === "name" ? "Test customer" : `Test ${pretty(name)}`])));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const usesEmail = form.channel === "EMAIL" || form.channel === "BOTH";
  const usesWhatsApp = form.channel === "WHATSAPP" || form.channel === "BOTH";

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!window.confirm(`Send a real test using “${template.name}” to the entered destination${form.channel === "BOTH" ? "s" : ""}?`)) return;
    setBusy(true);
    setResult(null);
    setError(null);
    try {
      const data = await requestJson<{ result: SendResult }>("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "testSend", data: { templateKey: template.key, toEmail, toPhone, vars } }),
      });
      setResult(data.result);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "The test send failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.testBox} onSubmit={send}>
      <SectionTitle title="Send a live test" note="This contacts the real provider and creates delivery logs. Use your own destination." />
      <div className={styles.formGrid}>
        {usesEmail ? <Field label="Test email"><input type="email" required={!usesWhatsApp} value={toEmail} onChange={(event) => setToEmail(event.target.value)} placeholder="you@example.com" /></Field> : null}
        {usesWhatsApp ? <Field label="Test Indian mobile"><input type="tel" required={!usesEmail} value={toPhone} onChange={(event) => setToPhone(event.target.value)} placeholder="+91 98765 43210" /></Field> : null}
        {names.map((name) => <Field label={pretty(name)} key={name}><input maxLength={500} value={vars[name] ?? ""} onChange={(event) => setVars((current) => ({ ...current, [name]: event.target.value }))} /></Field>)}
      </div>
      {result ? <p className={styles.success} role="status">WhatsApp: {result.whatsapp ?? "not requested"}. Email: {result.email ?? "not requested"}.</p> : null}
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <div className={styles.editorActions}><button className={styles.primaryButton} disabled={busy}>{busy ? "Sending…" : "Send live test"}</button></div>
    </form>
  );
}

function LogsTab() {
  const [logs, setLogs] = useState<NotificationLog[] | null>(null);
  const [status, setStatus] = useState<NotificationStatus | "">("");
  const [channel, setChannel] = useState<Channel | "">("");
  const [query, setQuery] = useState("");
  const [templateKey, setTemplateKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ tab: "logs" });
    if (status) params.set("status", status);
    if (channel) params.set("channel", channel);
    if (query.trim()) params.set("q", query.trim());
    if (templateKey.trim()) params.set("key", templateKey.trim());
    try {
      const data = await requestJson<{ logs: NotificationLog[] }>(`/api/admin/notifications?${params}`);
      setLogs(data.logs);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Delivery logs could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    requestJson<{ logs: NotificationLog[] }>("/api/admin/notifications?tab=logs")
      .then((data) => { if (!cancelled) setLogs(data.logs); })
      .catch((caught: unknown) => { if (!cancelled) setError(caught instanceof Error ? caught.message : "Delivery logs could not be loaded."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const summary = useMemo(() => ({
    sent: logs?.filter((log) => log.status === "SENT").length ?? 0,
    failed: logs?.filter((log) => log.status === "FAILED").length ?? 0,
    skipped: logs?.filter((log) => log.status === "SKIPPED").length ?? 0,
  }), [logs]);

  return (
    <section className={styles.panel} role="tabpanel">
      <div className={styles.metrics}>
        <Metric label="Sent" value={summary.sent} note="In the loaded result" />
        <Metric label="Failed" value={summary.failed} note="Needs provider review" warning={summary.failed > 0} />
        <Metric label="Skipped" value={summary.skipped} note="Opt-out or missing channel" />
      </div>

      <form className={styles.logFilters} onSubmit={(event) => { event.preventDefault(); void load(); }}>
        <Field label="Customer"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Email or phone" /></Field>
        <Field label="Template key"><input value={templateKey} onChange={(event) => setTemplateKey(event.target.value)} placeholder="delivery_out_for_delivery" /></Field>
        <Field label="Status"><select value={status} onChange={(event) => setStatus(event.target.value as NotificationStatus | "")}><option value="">All statuses</option>{STATUSES.map((item) => <option value={item} key={item}>{pretty(item)}</option>)}</select></Field>
        <Field label="Channel"><select value={channel} onChange={(event) => setChannel(event.target.value as Channel | "")}><option value="">All channels</option>{CHANNELS.map((item) => <option value={item} key={item}>{pretty(item)}</option>)}</select></Field>
        <button type="submit" className={styles.primaryButton} disabled={loading}>{loading ? "Loading…" : "Apply filters"}</button>
      </form>

      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {logs === null ? <Loading label="Loading delivery logs…" /> : logs.length === 0 ? (
        <div className={styles.empty}><strong>No matching deliveries</strong><span>Try a broader filter or send a deliberate test.</span></div>
      ) : (
        <div className={styles.logList}>
          <div className={styles.logHead} aria-hidden="true"><span>Time</span><span>Template and recipient</span><span>Channel</span><span>Status</span><span>Provider</span></div>
          {logs.map((log) => (
            <article className={styles.log} key={log.id}>
              <time dateTime={log.createdAt}>{dateTime.format(new Date(log.createdAt))}</time>
              <div><strong>{log.templateKey}</strong><small>{log.userEmail || log.userPhone || "No recipient saved"}</small>{log.error ? <p>{log.error}</p> : null}</div>
              <span className={styles.meta}>{pretty(log.channel)}</span>
              <span className={statusClass(log.status)}>{pretty(log.status)}</span>
              <div className={styles.provider}><strong>{log.provider || "—"}</strong><small>{log.providerRef || "No provider reference"}</small></div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function statusClass(status: NotificationStatus) {
  if (status === "SENT") return styles.sentStatus;
  if (status === "FAILED") return styles.failedStatus;
  if (status === "SKIPPED") return styles.skippedStatus;
  return styles.queuedStatus;
}

function Metric({ label, value, note, warning = false }: { label: string; value: number; note: string; warning?: boolean }) {
  return <article className={warning ? styles.metricWarning : undefined}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function SectionTitle({ title, note }: { title: string; note: string }) {
  return <div className={styles.sectionTitle}><h2>{title}</h2><p>{note}</p></div>;
}

function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return <label className={wide ? styles.wideField : undefined}><span>{label}</span>{children}</label>;
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className={styles.check}><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>;
}

function Loading({ label }: { label: string }) {
  return <div className={styles.loading} role="status"><span />{label}</div>;
}
