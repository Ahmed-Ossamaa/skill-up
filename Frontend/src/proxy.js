import { NextResponse } from 'next/server';

const AUTH_ROUTES = ['/auth/login', '/auth/signup', '/forgot-password', '/reset-password'];
const PROTECTED_ROUTES = ['/admin', '/instructor', '/student', '/profile', '/checkout'];

export function proxy(request) {
    const { pathname } = request.nextUrl;
    
    // Check for hasSession cookie instead of refreshToken
    const hasSession = request.cookies.get('hasSession');

    // Check if the current route is an auth route
    const isAuthPage = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    // Check if the current route is a protected route
    const isProtectedPage = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

    //  If user is logged in
    if (hasSession) {
        // Redirect away from auth pages to /home
        if (isAuthPage) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // If user is guest
    // Prevent access to protected routes
    if (isProtectedPage) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)'],
};