import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Helper to check admin role
async function checkAdmin(cookieStore) {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return { message: 'Unauthorized', status: 401 };

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    const role = profile?.role || 'user';
    if (role !== 'admin' && role !== 'superadmin') {
        return { message: 'Forbidden', status: 403 };
    }

    return null; // OK
}

export async function GET(req) {
    try {
        const cookieStore = await cookies();
        const errorResponse = await checkAdmin(cookieStore);
        if (errorResponse) return NextResponse.json(errorResponse, { status: errorResponse.status });

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');

        let query = supabaseAdmin
            .from('tasks')
            .select(`
                *,
                users:user_id (name, email)
            `)
            .order('created_at', { ascending: false });

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        const { data: tasks, error } = await query;

        if (error) throw error;

        // Transform for frontend compatibility if needed
        const formattedTasks = tasks.map(task => ({
            ...task,
            user: task.users // Map 'users' relation to 'user' prop as expected by frontend
        }));

        return NextResponse.json({ tasks: formattedTasks }, { status: 200 });

    } catch (error) {
        console.error('Admin Tasks GET Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const cookieStore = await cookies();
        const errorResponse = await checkAdmin(cookieStore);
        if (errorResponse) return NextResponse.json(errorResponse, { status: errorResponse.status });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Task ID required' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Task deleted' }, { status: 200 });

    } catch (error) {
        console.error('Admin Tasks DELETE Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
