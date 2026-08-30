/** A physical plan is sellable only when every planned day has every meal slot. */
export function hasCompletePlanSchedule(input: {
  scheduleCount: number;
  cycleLengthDays: number;
  mealsPerDay: number;
}): boolean {
  if (input.cycleLengthDays <= 0 || input.mealsPerDay <= 0) return false;
  return input.scheduleCount >= input.cycleLengthDays * input.mealsPerDay;
}
