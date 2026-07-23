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
