import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(req) {
    try {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch { }
                    },
                },
            }
        );

        // 1. Authenticate User
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // 2. Check Role (Read from DB to be sure)
        const { data: currentUserProfile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        const role = currentUserProfile?.role || 'user';

        if (role !== 'admin' && role !== 'superadmin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // 3. Fetch All Users using Admin Client (Bypasses RLS if no policy exists, or just easier)
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');

        let query = supabaseAdmin
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const { data: users, error: dbError } = await query;

        if (dbError) {
            throw dbError;
        }

        return NextResponse.json({ users }, { status: 200 });

    } catch (error) {
        console.error('Admin Users Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
