// middleware.ts
// WS-3 · SEC-6 (F2) — edge middleware. Two jobs, both additive:
//   1) Security headers on every response (clickjacking, MIME-sniff, referrer,
//      permissions, HSTS).
//   2) Cheap gate for /admin and /dashboard: if there's no session cookie, bounce
//      to sign-in BEFORE the page renders. This is defence-in-depth only — the
//      real role/authorisation checks still happen in each page/route via auth().
//      We deliberately do NOT hit Prisma here (database sessions aren't readable
//      at the edge); presence-of-cookie is enough to redirect anonymous users.

import { NextResponse, type NextRequest } from "next/server";

const PROTECTED: RegExp[] = [/^\/admin(\/|$)/, /^\/dashboard(\/|$)/];

// Auth.js v5 names the cookie differently in dev vs prod (and there's a legacy
// next-auth name). Check all so this works in every environment.
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function hasSession(req: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => Boolean(req.cookies.get(name)?.value));
}

function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  // Ignored by browsers over plain HTTP; takes effect on HTTPS (Vercel).
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  return res;
}

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some((re) => re.test(pathname));
  if (isProtected && !hasSession(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set("callbackUrl", pathname);
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  // Run on all paths EXCEPT Next internals and static assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|txt|xml|map|woff|woff2|ttf)$).*)",
  ],
};
