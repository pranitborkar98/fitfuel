export type MealPlanAccess =
  | { kind: "active"; planName: string; startDate: string; endDate: string }
  | { kind: "scheduled"; planName: string; startDate: string; endDate: string }
  | { kind: "expired"; planName: string; endDate: string }
  | { kind: "none" };
