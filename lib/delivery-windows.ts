export type DeliveryWindow = "MORNING" | "EVENING";

export const DELIVERY_WINDOWS: Record<
  DeliveryWindow,
  { label: string; time: string; sentence: string }
> = {
  MORNING: {
    label: "Morning",
    time: "7–10 AM",
    sentence: "between 7:00 and 10:00 AM",
  },
  EVENING: {
    label: "Evening",
    time: "5–8 PM",
    sentence: "between 5:00 and 8:00 PM",
  },
};

export function normalizeDeliveryWindow(value: unknown): DeliveryWindow {
  return value === "EVENING" ? "EVENING" : "MORNING";
}
