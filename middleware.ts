import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get IP from headers (Vercel sets x-real-ip or x-forwarded-for)
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 20; // 20 requests per minute

  // Simple in-memory rate limit (use Redis/Upstash for production scale)
  const key = `rate-limit:${ip}`;
  const record = globalThis as any;
  
  if (!record.rateLimitMap) record.rateLimitMap = new Map();
  const map = record.rateLimitMap as Map<string, { count: number; resetTime: number }>;
  
  const entry = map.get(key) || { count: 0, resetTime: now + windowMs };

  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + windowMs;
  } else {
    entry.count++;
  }

  map.set(key, entry);

  if (entry.count > maxRequests) {
    return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/auth/:path*'],
};