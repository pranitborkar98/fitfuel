// app/about/page.tsx
//
// Server shell. The page body is a client component (framer-motion scroll
// reveals), and a "use client" module cannot export `metadata`, so this page
// used to inherit the root title and ship with no description of its own.

import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why we built a kitchen and an app instead of one or the other. FitFuel cooks " +
    "condition-specific meals in an FSSAI-licensed Kharadi kitchen and tracks the " +
    "macros for you, so intake is measured rather than self-reported.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About FitFuel",
    description: "The kitchen, the app and the people behind FitFuel Pune.",
    url: "https://fitfuel.in/about",
    type: "website",
  },
};

export default function Page() {
  return <AboutClient />;
}
