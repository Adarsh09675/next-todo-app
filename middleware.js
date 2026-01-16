import { NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';

export async function middleware(req) {
    const token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    // Paths that require no auth
    if (pathname === '/' || pathname.startsWith('/api/auth') || pathname.startsWith('/_next') || pathname.startsWith('/static')) {
        if (token && pathname === '/') {
            // Redirect logged in users away from login page
            try {
                const payload = await verifyToken(token);
                if (payload) {
                    if (payload.role === 'superadmin') return NextResponse.redirect(new URL('/superadmin/dashboard', req.url));
                    if (payload.role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', req.url));
                    return NextResponse.redirect(new URL('/user/dashboard', req.url));
                }
            } catch (e) { }
        }
        return NextResponse.next();
    }

    // Helper for API error responses
    const isApi = pathname.startsWith('/api');

    // Protected paths: Check Token
    if (!token) {
        if (isApi) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/', req.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
        // Invalid token
        if (isApi) {
            return NextResponse.json({ message: 'Invalid Token' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Role based protection
    if (pathname.startsWith('/admin') && payload.role !== 'admin' && payload.role !== 'superadmin') {
        if (isApi) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/user/dashboard', req.url));
    }

    if (pathname.startsWith('/superadmin') && payload.role !== 'superadmin') {
        if (isApi) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.redirect(new URL(payload.role === 'admin' ? '/admin/dashboard' : '/user/dashboard', req.url));
    }

    // Pass user info in headers for server components (optional)
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-role', payload.role);
    requestHeaders.set('x-user-id', payload.userId);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    // Prevent caching of protected routes to ensure logout is effective immediately (Back button protection)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
