"use client";

// components/DeliveryWindowToggle.tsx
// Phase 11 -- customer picks their delivery run at checkout. Controlled component:
// pass value + onChange, then include `value` in your order/subscription POST so it
// lands on the UserActivePlan.deliveryWindow field.
//
// Usage in checkout:
//   const [deliveryWindow, setDeliveryWindow] = useState<"MORNING" | "EVENING">("MORNING");
//   <DeliveryWindowToggle value={deliveryWindow} onChange={setDeliveryWindow} />
//   // ...then send deliveryWindow in the body when you create the order.

const T = {
  card: "#101010", border: "#222", text: "#ffffff",
  textMuted: "#888888", accent: "#84cc16",
};

type Window = "MORNING" | "EVENING";

const OPTIONS: { value: Window; label: string; time: string }[] = [
  { value: "MORNING", label: "Morning", time: "7-9 AM" },
  { value: "EVENING", label: "Evening", time: "6-8 PM" },
];

export default function DeliveryWindowToggle({
  value,
  onChange,
}: {
  value: Window;
  onChange: (v: Window) => void;
}) {
  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 8 }}>
        When should we deliver?
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        {OPTIONS.map(opt => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                flex: 1,
                background: active ? T.accent : T.card,
                color: active ? "#0a0a0a" : T.text,
                border: `1px solid ${active ? T.accent : T.border}`,
                borderRadius: 12,
                padding: "14px 12px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ display: "block", fontSize: 15, fontWeight: 800 }}>{opt.label}</span>
              <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: active ? "#0a0a0a" : T.textMuted, marginTop: 2 }}>
                {opt.time}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}