import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(req) {
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

        // 1. Authenticate Requesting User
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // 2. Check Requesting User's Role
        const { data: currentUserProfile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        const currentUserRole = currentUserProfile?.role || 'user';

        if (currentUserRole !== 'admin' && currentUserRole !== 'superadmin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { userId, isBlocked } = await req.json();

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        // 3. fetch target user to check logic
        const { data: targetUser } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();

        if (!targetUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (targetUser.role === 'superadmin') {
            return NextResponse.json({ message: 'Cannot block Superadmin' }, { status: 403 });
        }

        // 4. Update Block Status
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ is_blocked: isBlocked })
            .eq('id', userId);

        if (updateError) {
            throw updateError;
        }

        // Optional: If blocking, verify if we should also ban in Auth?
        // For now, just updating the DB flag. Login logic should check this flag.

        return NextResponse.json({ message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully` }, { status: 200 });

    } catch (error) {
        console.error('Block User Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
