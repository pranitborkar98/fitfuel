// app/tdee-calculator/page.tsx — F8. Public TDEE & calorie calculator (acquisition funnel).
import TdeeCalculator from "./TdeeCalculator";

export const metadata = {
  title: "Free TDEE & Calorie Calculator",
  description:
    "Calculate your TDEE, daily calories and ideal protein/carb/fat split in seconds. Then get meals delivered in Pune that hit those numbers automatically.",
  alternates: { canonical: "/tdee-calculator" },
};

export default function TdeeCalculatorPage() {
  return <TdeeCalculator />;
}
