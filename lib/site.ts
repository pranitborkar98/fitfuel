// lib/site.ts
//
// One canonical origin for the whole site.
//
// This existed in three inconsistent forms: app/sitemap.ts and app/robots.ts
// read NEXT_PUBLIC_BASE_URL (which is the *.vercel.app preview domain in this
// environment), while the layout's metadataBase and every JSON-LD block
// hard-coded https://fitfuel.in. The result was a sitemap advertising one
// domain and canonicals declaring another, which is the exact signal that
// makes a crawler distrust both.
//
// Rule: canonical URLs always use the production domain. A preview deployment
// should not be publishing its own hostname into a sitemap.

const FALLBACK = "https://fitfuel.in";

function normalise(u: string | undefined): string | null {
  if (!u) return null;
  const trimmed = u.trim().replace(/\/$/, "");
  if (!trimmed) return null;
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// NEXT_PUBLIC_SITE_URL is the explicit override. NEXT_PUBLIC_BASE_URL is kept
// for backwards compatibility but is ignored when it points at a preview host,
// so previews inherit the production canonical rather than competing with it.
const configured = normalise(process.env.NEXT_PUBLIC_SITE_URL)
  ?? normalise(process.env.NEXT_PUBLIC_BASE_URL);

export const SITE_URL =
  configured && !/\.vercel\.app$/.test(configured) ? configured : FALLBACK;

export const abs = (path: string): string =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/* ── The business WhatsApp number ─────────────────────────────────────────
 *
 * ONE constant, because eight files had their own copy and they disagreed.
 *
 * Decision #206 (Jun 23) replaced 919579738811 with 918850446348 and fixed
 * the footer and the contact page. It missed four files, which kept the dead
 * number through to today:
 *
 *   app/checkout/page.tsx            <- the money path
 *   app/auth/signin/page.tsx
 *   app/locations/LocationsClient.tsx
 *   app/order/confirmation/page.tsx
 *
 * A customer stuck at checkout was messaging a number nobody reads. Every one
 * of those files now imports from here, so the next change is one line and
 * cannot go half-applied.
 */
export const WHATSAPP_NUMBER = "918850446348";

/** Display form. Matches how the number is already printed on the legal
 *  pages, so this does not introduce a third formatting convention. */
export const WHATSAPP_DISPLAY = "+91 8850446348";

/** wa.me deep link, with the message pre-filled and encoded exactly once. */
export const waLink = (text?: string): string =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
