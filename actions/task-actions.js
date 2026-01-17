'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTasks() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, message: 'Unauthorized' }
    }

    // Check if user is admin (optional, depending on if admins see ALL tasks)
    // For now, let's stick to the policy: "Users can view own tasks"
    // If needed, we can expand later for Admin viewing all.

    // Fetch tasks
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
            *,
            users:user_id (name, email)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching tasks:', error)
        return { success: false, message: 'Failed to fetch tasks' }
    }

    return { success: true, tasks }
}

export async function createTask(formData) {
    const supabase = await createClient()

    const title = formData.get('title')
    const description = formData.get('description')
    const priority = formData.get('priority')
    const status = formData.get('status')
    const imageFile = formData.get('image')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'Unauthorized' }
    }

    let image_url = null;
    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('task-images')
            .upload(filePath, imageFile);

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return { success: false, message: 'Failed to upload image' };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('task-images')
            .getPublicUrl(filePath);

        image_url = publicUrl;
    }

    const { error } = await supabase
        .from('tasks')
        .insert({
            title,
            description,
            priority,
            status,
            user_id: user.id,
            image_url
        })

    if (error) {
        console.error('Error creating task:', error)
        return { success: false, message: 'Failed to create task' }
    }

    revalidatePath('/admin/dashboard')
    revalidatePath('/user/dashboard')
    revalidatePath('/superadmin/dashboard')
    return { success: true, message: 'Task created successfully' }
}

export async function updateTask(id, formData) {
    const supabase = await createClient()

    const updates = {};
    const title = formData.get('title');
    const description = formData.get('description');
    const priority = formData.get('priority');
    const status = formData.get('status');
    const imageFile = formData.get('image');

    if (title !== null) updates.title = title;
    if (description !== null) updates.description = description;
    if (priority !== null) updates.priority = priority;
    if (status !== null) updates.status = status;

    if (imageFile && imageFile.size > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('task-images')
                .upload(filePath, imageFile);

            if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage
                    .from('task-images')
                    .getPublicUrl(filePath);
                updates.image_url = publicUrl;
            }
        }
    }

    // Legacy mapping support: if status is updated, sync is_completed (if needed by frontend legacy logic, though we generally use status now)
    if (status === 'completed') updates.is_completed = true;
    if (status === 'pending' || status === 'in-progress') updates.is_completed = false;

    const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)

    if (error) {
        console.error('Error updating task:', error)
        return { success: false, message: 'Failed to update task' }
    }

    revalidatePath('/admin/dashboard')
    revalidatePath('/user/dashboard')
    revalidatePath('/superadmin/dashboard')
    // Return image_url so frontend can update state immediately if needed, though refresh covers it
    return { success: true, message: 'Task updated successfully', image_url: updates.image_url }
}

export async function deleteTask(id) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting task:', error)
        return { success: false, message: 'Failed to delete task' }
    }

    revalidatePath('/admin/tasks')
    return { success: true, message: 'Task deleted successfully' }
}
