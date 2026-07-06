import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  // Simple logic: allow all for now, prevents build error
  return NextResponse.next();
}
export const config = { matcher: ['/api/:path*', '/auth/:path*'] };