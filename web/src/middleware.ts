import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Only checking for the presence of the session cookie here.
    // Full validation happens in the Server Components/API routes.
    const sessionToken = request.cookies.get('ums_session')?.value;

    if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin')) {
        if (!sessionToken) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*'],
};
