import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(req) {
    let response = NextResponse.next({
        request: {
            headers: req.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        req.cookies.set(name, value);
                    });
                    response = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const { pathname } = req.nextUrl;

    // Public paths
    if (pathname === '/' || pathname.startsWith('/api/auth') || pathname.startsWith('/_next') || pathname.startsWith('/static')) {
        if (user && pathname === '/') {
            // Redirect logged in users. We need to know role to redirect correctly.
            // We can fetch profile here or just default to user dashboard and let dashboard redirect if needed?
            // Fetching profile in middleware adds latency.
            // Let's rely on metadata if available or just redirect to /user/dashboard and let that page handle it?
            // Or query public.users.

            // Optimisation: check metadata
            const role = user.user_metadata?.role || 'user';
            if (role === 'superadmin') return NextResponse.redirect(new URL('/superadmin/dashboard', req.url));
            if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', req.url));
            return NextResponse.redirect(new URL('/user/dashboard', req.url));
        }
        return response;
    }

    const isApi = pathname.startsWith('/api');

    if (!user) {
        if (isApi) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Role check logic
    // We need the role. Supabase JWT *might* have it if we added it to metadata.
    // In register route I added: user_metadata: { name, role: 'user' }
    // So user.user_metadata.role should be available.
    const role = user.user_metadata?.role || 'user';

    if (pathname.startsWith('/admin') && role !== 'admin' && role !== 'superadmin') {
        if (isApi) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        return NextResponse.redirect(new URL('/user/dashboard', req.url));
    }

    if (pathname.startsWith('/superadmin') && role !== 'superadmin') {
        if (isApi) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        return NextResponse.redirect(new URL(role === 'admin' ? '/admin/dashboard' : '/user/dashboard', req.url));
    }

    response.headers.set('x-user-role', role);
    response.headers.set('x-user-id', user.id);

    // Cache control
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
