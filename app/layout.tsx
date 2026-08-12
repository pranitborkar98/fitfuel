import type { Metadata } from "next";
import { Archivo, Barlow_Condensed, JetBrains_Mono, Newsreader } from "next/font/google";
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

// FRAUNCES IS GONE. It was loaded here on the argument above: that Barlow
// Condensed reads as athletic utility and a warm old-style serif is the
// difference between "plain" and "appetising". That was rejected on
// 2026-07-30 and the reasoning stands. The Instrument System's thesis is
// hairlines, grain, radius 0 and kinetic type at ~10x scale, which is coherent
// with a condensed grotesque; a serif with a wonky optical axis is a different
// thesis, and hybridising the two satisfies neither.
//
// It was also only ever used by app/preview/a and app/preview/c, two rejected
// experiments, while shipping a fourth typeface to every visitor on every page
// against a locked list of three. Those routes are deleted with it.
//
// The observation behind it stands and is not solved here: the page does read
// cold for a food brand. That is an image-grade problem, and the fix is the
// art-directed photography specified since rev 2.

// Data face. A macro-tracking food brand prints a lot of numbers — grams, kcal,
// times, licence numbers — and setting those in mono reads as measurement rather
// than marketing. Third leg of display serif / body sans / data mono.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-mono",
});

// THE DISPLAY FACE OF THE STOREFRONT, and the typographic half of the
// 2026-08-12 reset. The page read as a trading terminal largely because every
// heading was Barlow Condensed 900, uppercase, tracked tight. A warm editorial
// serif set in sentence case is the single largest lever on "does this look
// like food", and it costs nothing at the layout level to swap.
//
// This is deliberately NOT Fraunces. Fraunces was proposed and rejected twice,
// and the objection was sound: it shipped a fourth face to every visitor while
// being used on two preview routes only. Newsreader is the primary display
// face of the actual homepage, and it arrives in the same change that cuts
// Barlow Condensed from ten font files to four — no italic axis (grep found
// zero italic usage across app/ and components/) and no 500. Total payload
// goes DOWN, from 18 files to 15.
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-newsreader",
});

// Retained ONLY for the ~27 legacy pages still on the old token set. It is no
// longer loaded for its own sake, and the new storefront never references it.
// When those pages migrate, delete this and the --font-barlow-condensed var.
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
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
      className={`${archivo.variable} ${newsreader.variable} ${barlowCondensed.variable} ${mono.variable} scroll-smooth`}
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
      {/* The inline `background: var(--ff-bg)` that used to sit here is gone.
          It duplicated the `html, body, main` rule in globals.css, and because
          an inline style beats any stylesheet it made the page ground
          impossible to override per-route — the warm storefront rendered on a
          near-black body, visible on overscroll and under short pages. Legacy
          pages still get the dark ground from globals.css; app/_design/base.css
          flips it to warm paper for any page containing `.fk`. */}
      <body className={`${archivo.className} antialiased`}>
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
