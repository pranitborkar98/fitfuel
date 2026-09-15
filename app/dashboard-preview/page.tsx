import type { Metadata } from "next";
import PreviewClient from "./PreviewClient";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: "Explore the FitFuel dashboard",
  description:
    "Try a sample day: meal logging, nutrition, training and a weekly review. No account required to preview.",
  alternates: { canonical: "/dashboard-preview" },
};

export default function DashboardPreviewPage() {
  return <PreviewClient />;
}
