import type { Metadata } from "next";
import { Archivo, Barlow_Condensed, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChromeGate from "@/components/ChromeGate";
import { CartProvider } from "@/app/_cart/CartProvider";
import CartDrawer from "@/app/_cart/CartDrawer";
import { SessionProvider } from "next-auth/react";
import ReferralCapture from "@/components/ReferralCapture";
import { TRIAL_TOTAL_LABEL } from "@/lib/trial-price";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// TWO faces for the whole site, both self-hosted by next/font.
//
// Archivo, not Inter. Inter is the single most common "AI-generated site"
// tell; Archivo is a sturdier grotesque that pairs with Barlow Condensed.
//
// Barlow Condensed was previously pulled with a <link> in <head>, and eight
// interior pages each pulled Syne / DM Sans / Space Mono with an @import
// nested inside an inline <style> tag. That is the worst case for render:
// the browser cannot discover the font until it has parsed the stylesheet,
// so it costs an extra round trip to fonts.googleapis.com before any text
// paints. /plans/[slug] alone was making 12 font requests for 5 typefaces.
// Everything now resolves to these two, self-hosted, zero extra requests.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-archivo",
});

// The homepage display face. Barlow Condensed reads as athletic utility — gym
// signage, supplement tubs — which is the wrong voice for food. Fraunces is a
// warm old-style serif with a soft, slightly wonky axis; it is what premium food
// brands use, and it is the difference between "plain" and "appetising" without
// changing a single layout.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

// Data face. A macro-tracking food brand prints a lot of numbers — grams, kcal,
// times, licence numbers — and setting those in mono reads as measurement rather
// than marketing. Third leg of display serif / body sans / data mono.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-mono",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-barlow-condensed",
});

const TITLE = "FitFuel: Chef-Cooked Macro-Tracked Meal Plans Delivered in Pune";
const DESCRIPTION =
  "Chef-cooked meals weighed to your macros and delivered across Pune by 8am, " +
  "plus a training and body-metrics app that logs them for you. 126 goal and " +
  `condition plans. Trial day ${TRIAL_TOTAL_LABEL}.`;

export const metadata: Metadata = {
  // Was "FitFuel - Verified Nutrition": no city, no product, no intent.
  title: { default: TITLE, template: "%s | FitFuel Pune" },
  description: DESCRIPTION,
  metadataBase: new URL("https://fitfuel.in"),
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://fitfuel.in",
    siteName: "FitFuel",
    // The explicit /og-image.png entry that used to sit here 404s, and it
    // silently overrode the working file-based app/opengraph-image.tsx.
    // Dropped so the generated card wins.
    locale: "en_IN",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  robots: { index: true, follow: true },
};

// Kept static (no server-side auth() call) so the loading.tsx streaming boundary
// resolves on the client. SessionProvider fetches the session client-side.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${archivo.variable} ${barlowCondensed.variable} ${fraunces.variable} ${mono.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        {/* Fonts are self-hosted by next/font above. The preconnects and the
            blocking Barlow <link> that used to live here are gone with them. */}
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
      <body className={`${archivo.className} antialiased`} style={{ background: "var(--ff-bg)", color: "var(--ff-ink)" }}>
        <a href="#main" className="skip-link">Skip to content</a>
        <ReferralCapture />
        <SessionProvider>
          {/* CartProvider wraps the chrome, not just the page, because the
              basket trigger lives in the Navbar — a customer who adds a dish
              on /menu must still see it from /plans or /faq. The drawer is
              mounted once here rather than per-page for the same reason. */}
          <CartProvider>
            {/* ChromeGate hides Navbar/Footer on standalone routes like /driver and /admin */}
            <ChromeGate navbar={<Navbar />} footer={<Footer />}>
              <div id="main" tabIndex={-1}>{children}</div>
            </ChromeGate>
            <CartDrawer />
          </CartProvider>
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
