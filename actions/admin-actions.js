'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'

// Helper to check if current user is admin
async function checkAdminRole() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false;

    // Check role in public.users or metadata
    const role = user.user_metadata?.role || 'user';
    return role === 'admin' || role === 'superadmin';
}

export async function getUsers(search = '') {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
        return { success: false, message: 'Unauthorized' }
    }

    // Use supabaseAdmin to bypass RLS and see ALL users
    // Note: createClient() from server uses user's session, so RLS applies.
    // supabaseAdmin uses service role key.

    if (!supabaseAdmin) {
        console.error('Supabase Service Key missing');
        return { success: false, message: 'Server configuration error' };
    }

    let query = supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

    if (search) {
        query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
    }

    const { data: users, error } = await query

    if (error) {
        console.error('Error fetching users:', error)
        return { success: false, message: 'Failed to fetch users' }
    }

    // Custom Sort: Superadmin -> Admin -> User
    const rolePriority = { superadmin: 1, admin: 2, user: 3 };
    users.sort((a, b) => {
        const pA = rolePriority[a.role] || 4;
        const pB = rolePriority[b.role] || 4;
        return pA - pB;
    });

    return { success: true, users }
}

export async function getAllTasks(search = '') {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
        return { success: false, message: 'Unauthorized' }
    }

    if (!supabaseAdmin) {
        return { success: false, message: 'Server configuration error' };
    }

    // Fetch tasks with user details
    let query = supabaseAdmin
        .from('tasks')
        .select(`
            *,
            users:user_id (name, email)
        `)
        .order('created_at', { ascending: false })

    if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: tasks, error } = await query

    if (error) {
        console.error('Error fetching all tasks:', error)
        return { success: false, message: 'Failed to fetch tasks' }
    }

    // Transform if necessary to match frontend expectations
    // Frontend UserDashboard expects `task.user`? No, UserDashboard doesn't show user.
    // AdminDashboard TaskListClient might want to show user email.
    const formattedTasks = tasks.map(task => ({
        ...task,
        user: task.users // Map relational data to 'user' prop
    }));

    return { success: true, tasks: formattedTasks }
}

export async function toggleUserBlock(userId, isBlocked) {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) return { success: false, message: 'Unauthorized' };

    const { error } = await supabaseAdmin
        .from('users')
        .update({ is_blocked: isBlocked })
        .eq('id', userId)

    if (error) {
        console.error('Error blocking user:', error)
        return { success: false, message: 'Failed to update user status' }
    }

    revalidatePath('/admin/dashboard')
    revalidatePath('/superadmin/dashboard')
    return { success: true, message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully` }
}

export async function updateUserRole(userId, newRole) {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) return { success: false, message: 'Unauthorized' };

    const { error } = await supabaseAdmin
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

    if (error) {
        console.error('Error updating role:', error)
        return { success: false, message: 'Failed to update role' }
    }

    // Also update auth.users metadata if needed to keep in sync?
    // Ideally yes, but let's stick to public table first as primary source.

    // ... previous code
    revalidatePath('/admin/dashboard')
    revalidatePath('/superadmin/dashboard')
    return { success: true, message: 'User role updated successfully' }
}

export async function deleteTask(taskId) {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) return { success: false, message: 'Unauthorized' };

    const { error } = await supabaseAdmin
        .from('tasks')
        .delete()
        .eq('id', taskId)

    if (error) {
        console.error('Error deleting task:', error)
        return { success: false, message: 'Failed to delete task' }
    }

    revalidatePath('/admin/dashboard')
    revalidatePath('/superadmin/dashboard')
    return { success: true, message: 'Task deleted successfully' }
}

export async function createTask(formData) {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) return { success: false, message: 'Unauthorized' };

    const title = formData.get('title')
    const description = formData.get('description')
    const priority = formData.get('priority')
    const status = formData.get('status')

    // Note: Admin creating task. Who is the owner?
    // Be default, assign to the admin themselves, OR we need a user_id selector.
    // TaskForm doesn't have user selector. So for now, assign to Admin (current user).
    // Getting current user ID:
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: 'User not found' }

    const { error } = await supabaseAdmin
        .from('tasks')
        .insert({
            title,
            description,
            priority,
            status,
            user_id: user.id
        })

    if (error) {
        console.error('Error creating task:', error)
        return { success: false, message: 'Failed to create task' }
    }

    revalidatePath('/admin/dashboard')
    revalidatePath('/superadmin/dashboard')
    return { success: true, message: 'Task created successfully' }
}

export async function updateTask(id, formData) {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) return { success: false, message: 'Unauthorized' };

    const updates = {};
    const title = formData.get('title');
    const description = formData.get('description');
    const priority = formData.get('priority');
    const status = formData.get('status');

    if (title !== null) updates.title = title;
    if (description !== null) updates.description = description;
    if (priority !== null) updates.priority = priority;
    if (status !== null) updates.status = status;

    // Map status to is_completed if needed for compatibility
    if (status === 'completed') updates.is_completed = true;
    if (status === 'pending' || status === 'in-progress') updates.is_completed = false;

    const { error } = await supabaseAdmin
        .from('tasks')
        .update(updates)
        .eq('id', id)
    // Note: No .eq('user_id') check here, allowing Admin to edit ANY task.

    if (error) {
        console.error('Error updating task:', error)
        return { success: false, message: 'Failed to update task' }
    }

    revalidatePath('/admin/dashboard')
    revalidatePath('/superadmin/dashboard')
    return { success: true, message: 'Task updated successfully' }
}
