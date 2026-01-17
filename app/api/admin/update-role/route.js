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

        const { userId, newRole } = await req.json();

        if (!userId || !newRole) {
            return NextResponse.json({ message: 'User ID and Role are required' }, { status: 400 });
        }

        if (!['user', 'admin'].includes(newRole)) {
            // Only allow promoting to user or admin. Superadmin creation usually restricted.
            return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
        }

        // 3. Check Target User
        const { data: targetUser } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();

        if (!targetUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (targetUser.role === 'superadmin') {
            return NextResponse.json({ message: 'Cannot modify Superadmin' }, { status: 403 });
        }

        // Prevent Admin from demoting another Admin (if that rule exists)
        if (currentUserRole === 'admin' && targetUser.role === 'admin' && newRole === 'user') {
            return NextResponse.json({ message: 'Admins cannot demote other Admins' }, { status: 403 });
        }

        // 4. Update Role in Public Table
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ role: newRole })
            .eq('id', userId);

        if (updateError) {
            throw updateError;
        }

        // 5. Update Role in Auth Metadata (Optional but good for sync)
        await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { role: newRole }
        });

        return NextResponse.json({ message: `User role updated to ${newRole}` }, { status: 200 });

    } catch (error) {
        console.error('Update Role Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
