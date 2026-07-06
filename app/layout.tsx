import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChromeGate from "@/components/ChromeGate";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import ReferralCapture from "@/components/ReferralCapture";

const inter = Inter({ subsets: ["latin"] });

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
            {/* Google Analytics */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-QZ32L5KQ6X"></script>
      <script dangerouslySetInnerHTML={{__html: \
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-QZ32L5KQ6X');
      \}} />
      {/* Meta Pixel */}
      <script dangerouslySetInnerHTML={{__html: \
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '1065964451892729');
        fbq('track', 'PageView');
      \}} />
      {/* Microsoft Clarity */}
      <script type="text/javascript" dangerouslySetInnerHTML={{__html: \
        (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "xiermgpllc");
      \}} />
    </head>
      <body className={`${inter.className} bg-[#080808] text-white antialiased`}>
        <a href="#main" className="skip-link">Skip to content</a>
        {/* SessionProvider wraps everything so useSession() works in any client component */}
        <ReferralCapture />
        <SessionProvider session={session}>
          {/* ChromeGate hides Navbar/Footer on standalone routes like /driver */}
          <ChromeGate navbar={<Navbar />} footer={<Footer />}>
            <div id="main" tabIndex={-1}>{children}</div>
          </ChromeGate>
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
