export const MIN_SERVING_SCALE = 0.7;
export const MAX_SERVING_SCALE = 1.3;
export const SERVING_SCALE_STEP = 0.05;

export type ServingScale = {
  factor: number;
  requestedFactor: number;
  clamped: boolean;
};

/**
 * Convert a member's daily target into a kitchen-friendly portion multiplier.
 * A 5% step is measurable on the line; the cap avoids unsafe or impractical
 * portions and is surfaced as a production warning instead of hidden.
 */
export function servingScaleForTarget(input: {
  calorieTarget: number | null | undefined;
  planCalories: number | null | undefined;
}): ServingScale {
  const target = Number(input.calorieTarget);
  const plan = Number(input.planCalories);
  if (!Number.isFinite(target) || target <= 0 || !Number.isFinite(plan) || plan <= 0) {
    return { factor: 1, requestedFactor: 1, clamped: false };
  }

  const requestedFactor = target / plan;
  const bounded = Math.max(MIN_SERVING_SCALE, Math.min(MAX_SERVING_SCALE, requestedFactor));
  const factor = Math.round(bounded / SERVING_SCALE_STEP) * SERVING_SCALE_STEP;
  return {
    factor: Math.round(factor * 100) / 100,
    requestedFactor,
    clamped: requestedFactor < MIN_SERVING_SCALE || requestedFactor > MAX_SERVING_SCALE,
  };
}
