import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChromeGate from "@/components/ChromeGate";
import { SessionProvider } from "next-auth/react";
import ReferralCapture from "@/components/ReferralCapture";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Archivo, not Inter. Inter is the single most common "AI-generated site"
// tell; Archivo is a sturdier grotesque that pairs with Barlow Condensed.
const archivo = Archivo({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "FitFuel - Verified Nutrition",
  description: "Verified intake, not self-reported. Premium meal plans delivered.",
  metadataBase: new URL('https://fitfuel.in'),
  openGraph: {
    title: "FitFuel - Verified Nutrition",
    description: "Verified intake, not self-reported. Premium meal plans delivered.",
    url: 'https://fitfuel.in',
    siteName: 'FitFuel',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
};

// Kept static (no server-side auth() call) so the loading.tsx streaming boundary
// resolves on the client. SessionProvider fetches the session client-side.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-QZ32L5KQ6X" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QZ32L5KQ6X');
            `,
          }}
        />
        {/* Meta Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
              document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1065964451892729');
              fbq('track', 'PageView');
            `,
          }}
        />
        {/* Microsoft Clarity */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "xiermgpllc");
            `,
          }}
        />
      </head>
      <body className={`${archivo.className} bg-[#080808] text-white antialiased`}>
        <a href="#main" className="skip-link">Skip to content</a>
        <ReferralCapture />
        <SessionProvider>
          {/* ChromeGate hides Navbar/Footer on standalone routes like /driver and /admin */}
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
