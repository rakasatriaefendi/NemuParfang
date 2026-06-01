import { NextRequest } from 'next/server';
import { handleAuthMiddleware } from '@/server/auth-middleware';

export function middleware(request: NextRequest) {
  return handleAuthMiddleware(request);
}

export const config = {
  matcher: ['/profile/:path*', '/favorites/:path*', '/wardrobe/:path*', '/login', '/register'],
};
