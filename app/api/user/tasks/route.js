import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');

        let query = supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        // RLS will handle "user: payload.userId" automatically if we use standard client
        // creating policies where auth.uid() = user_id. 
        // So we don't strictly need .eq('user_id', user.id) IF RLS is on and working.
        // But for safety/explicitness, let's add it or rely on RLS.
        // The policy "Users can view own tasks" is: using (auth.uid() = user_id).
        // Since we are using `supabase` client initialized with ANON key, 
        // AND we passed `token`? Wait.
        // The default `supabase` client in lib is just createClient(url, key).
        // It DOES NOT automatically know the user context unless we set the session.
        // So we need to set the session on the client, OR use the service role (bad for RLS), 
        // OR just manually filter.
        // Better: create a client context with the token.

        // Actually, we can just do:
        // const { data: tasks, error } = await supabase.from('tasks').select('*').eq('user_id', user.id);

        // If we want search:
        if (search) {
            // title like search
            // query = query.ilike('title', `%${search}%`); 
            // Note: can't chain conditionally easily with const query assignment like that if not careful
        }

        // Let's chain it properly
        let supabaseQuery = supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (search) {
            supabaseQuery = supabaseQuery.ilike('title', `%${search}%`);
        }

        const { data: tasks, error } = await supabaseQuery;

        if (error) {
            throw error;
        }

        return NextResponse.json({ tasks }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const { title, description, priority } = await req.json();

        // Validate priority
        const validPriorities = ['low', 'medium', 'high'];
        let normalizedPriority = priority;

        if (typeof priority === 'string') {
            normalizedPriority = priority.trim().toLowerCase();
        }

        const finalPriority = validPriorities.includes(normalizedPriority) ? normalizedPriority : 'medium';

        if (!title) {
            return NextResponse.json({ message: "Title is required" }, { status: 400 });
        }

        const { data: newTask, error } = await supabase
            .from('tasks')
            .insert({
                title,
                description,
                priority: finalPriority,
                user_id: user.id
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({ task: newTask }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id, isCompleted, priority } = await req.json();

        const updateData = {};
        if (typeof isCompleted !== 'undefined') updateData.is_completed = isCompleted; // Note payload mapping: isCompleted -> is_completed
        if (priority) updateData.priority = priority;

        // Add user_id check to ensure ownership
        const { data: updatedTask, error } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error || !updatedTask) {
            return NextResponse.json({ message: 'Task not found or update failed' }, { status: 404 });
        }

        return NextResponse.json({ task: updatedTask }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
