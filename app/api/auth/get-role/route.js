import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
    try {
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ message: 'Missing token' }, { status: 400 });
        }

        // 1. Verify the token first (using normal client) - optional but good practice
        // Actually, we can just trust the token validation of getUser()
        // But for getting the role, we MUST use Service Role to bypass RLS

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Verify token and get user ID
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        // Fetch authoritative role from public.users
        const { data: userData, error: dbError } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (dbError) {
            console.error("Database role fetch error:", dbError);
            // Fallback to metadata if DB fails? No, better to fail secure or return default
            // But if DB error, maybe just return metadata role or 'user'
            return NextResponse.json({ role: user.user_metadata?.role || 'user' });
        }

        // Return the authoritative role
        return NextResponse.json({ role: userData?.role || 'user' });

    } catch (error) {
        console.error("Get Role API Error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
