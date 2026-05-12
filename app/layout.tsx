import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FitFuel — Fuel Your Goals",
  description:
    "Pune's premium goal-based meal delivery. Muscle Gain, Weight Loss, Balanced Diet — fresh, chef-cooked, delivered daily.",
  keywords: "meal delivery pune, healthy food pune, muscle gain meal plan, weight loss food pune, fitfuel",
  openGraph: {
    title: "FitFuel — Fuel Your Goals",
    description: "Pune's premium goal-based meal delivery.",
    url: "https://fitfuel.in",
    siteName: "FitFuel",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-[#0a0a0a] text-white antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
