import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChromeGate from "@/components/ChromeGate";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

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

// ✅ Must be async — we call auth() server-side to pass session to SessionProvider
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Fetch session server-side so SessionProvider hydrates correctly on first paint
  const session = await auth();

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} bg-[#080808] text-white antialiased`}>
        {/* SessionProvider wraps everything so useSession() works in any client component */}
        <SessionProvider session={session}>
          {/* ChromeGate hides Navbar/Footer on standalone routes like /driver */}
          <ChromeGate navbar={<Navbar />} footer={<Footer />}>
            {children}
          </ChromeGate>
        </SessionProvider>
      </body>
    </html>
  );
}
