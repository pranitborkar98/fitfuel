type PublicPlanCopyInput = {
  name: string;
  category?: string | null;
  description?: string | null;
  tagline?: string | null;
  whoIsItFor?: string | null;
  keyPrinciples?: string[] | null;
};

const PROMISE_LANGUAGE = /\b(cure|cures|curing|treat|treats|reverse|reverses|prevent|prevents|guarantee|guaranteed|scientifically|clinically|therapeutic|ketosis achieved|works\b|without hunger|no starvation|blood pressure reduction|insulin sensitivity)\b/i;

export const CONDITION_PLAN_BOUNDARY =
  "This is a cooked-food service, not medical treatment. It does not diagnose, treat or replace prescriptions, clinical nutrition or advice from your doctor or dietitian.";

export function isConditionSupportPlan(plan: Pick<PublicPlanCopyInput, "category">): boolean {
  return plan.category === "LIFESTYLE_MEDICAL";
}

function fallbackDescription(plan: PublicPlanCopyInput): string {
  if (isConditionSupportPlan(plan)) {
    return `${plan.name} is a condition-aware cooked menu for practical day-to-day food support. ${CONDITION_PLAN_BOUNDARY}`;
  }
  if (plan.category === "SPORTS") {
    return `${plan.name} is a rotating cooked-meal plan with published portions and nutrition estimates for an active routine.`;
  }
  return `${plan.name} is a rotating cooked-meal plan with published portions and daily nutrition estimates.`;
}

export function publicPlanDescription(plan: PublicPlanCopyInput): string {
  const source = String(plan.description || plan.tagline || "").trim();
  if (!source || isConditionSupportPlan(plan) || PROMISE_LANGUAGE.test(source)) {
    return fallbackDescription(plan);
  }
  return source;
}

export function publicPlanAudience(plan: PublicPlanCopyInput): string {
  if (isConditionSupportPlan(plan)) {
    return "For adults who want a more structured cooked-food routine alongside care they already receive. Medication, clinical targets and treatment decisions stay with their clinician.";
  }
  const source = String(plan.whoIsItFor || "").trim();
  return source && !PROMISE_LANGUAGE.test(source)
    ? source
    : "For people who want a practical cooked-food routine with portions and tracking that agree.";
}

export function publicPlanPrinciples(plan: PublicPlanCopyInput): string[] {
  if (isConditionSupportPlan(plan)) {
    return [
      "A published menu and portion for each scheduled meal",
      "Nutrition values shown as estimates for the planned serving",
      "Clinical targets and medication changes left to your clinician",
    ];
  }
  return (plan.keyPrinciples || []).filter((item) => !PROMISE_LANGUAGE.test(item)).slice(0, 8);
}
