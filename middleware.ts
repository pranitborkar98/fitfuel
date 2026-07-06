import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple rate limiting map (In production, use Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  // Extract IP from headers (Vercel sets x-real-ip or x-forwarded-for)
  const ip = request.headers.get('x-real-ip') || 
             request.headers.get('x-forwarded-for')?.split(',')[0] || 
             '127.0.0.1';
  
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 20; // 20 requests per minute

  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count++;
  }

  rateLimitMap.set(ip, record);

  if (record.count > maxRequests) {
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