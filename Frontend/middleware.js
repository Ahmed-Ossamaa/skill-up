import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Check for refresh token (HttpOnly cookie set by backend)
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // Routes that require authentication
    const protectedRoutes = ['/admin', '/instructor', '/student'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // If accessing protected route without refresh token, redirect to login
    if (isProtectedRoute && !refreshToken) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/instructor/:path*', '/student/:path*'],
};