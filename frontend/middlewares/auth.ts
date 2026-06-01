import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/profile', '/favorites', '/wardrobe'];
const GUEST_ONLY_PATHS = ['/login', '/register'];
const AUTH_COOKIE = 'nemuparfang-auth';

const matchesPath = (pathname: string, paths: string[]) =>
  paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

export function handleAuthMiddleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasAuthCookie = request.cookies.get(AUTH_COOKIE)?.value === '1';

  if (matchesPath(pathname, PROTECTED_PATHS) && !hasAuthCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (matchesPath(pathname, GUEST_ONLY_PATHS) && hasAuthCookie) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}
