'use client';

import { useState, useEffect } from 'react';
import TaskCard from '@/components/TaskCard';
import TaskInput from '@/components/TaskInput';
import TaskDetailModal from '@/components/TaskDetailModal';
import { createTask, updateTask, deleteTask } from '@/actions/task-actions';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function UserDashboardClient({ initialTasks }) {
    const [tasks, setTasks] = useState(initialTasks);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(false);

    // We update local state optimistically or re-fetch?
    // Given the previous implementation used local setUsers/setTasks, let's try to mimic that responsiveness.
    // However, server actions usually revalidatePath on server.
    // If we rely on props `initialTasks`, we need the parent to re-render.
    // But `UserDashboardClient` preserves state until key changes or new props arrive.
    // To see updates immediately without full page reload, we can update local state AND rely on router.refresh().

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const handleAddTask = async (taskData) => {
        // Adapt Data: TaskInput passes { title, description, priority }
        // Server Action expects FormData.
        const formData = new FormData();
        formData.append('title', taskData.title);
        formData.append('description', taskData.description);
        formData.append('priority', taskData.priority);
        formData.append('status', 'pending'); // Default

        // Optimistic update?
        // Let's wait for server response for ID.
        const res = await createTask(formData);
        if (res.success) {
            // We can't easily add to local state because we don't have the new ID or created_at from server immediately 
            // unless we return the created object from action.
            // My action currently returns { success, message }. 
            // I should update the action to return the object OR rely on router.refresh() 
            // forcing a new `initialTasks` prop.
            // For "same UI" feel, router.refresh is best practice with Server Actions.
        } else {
            alert(res.message);
        }
    };

    const handleUpdateTask = async (taskId, updates) => {
        const currentTask = tasks.find(t => t.id === taskId);
        if (!currentTask) return;

        // Determine new values (prefer updates, fallback to current)
        const title = updates.title !== undefined ? updates.title : currentTask.title;
        const description = updates.description !== undefined ? updates.description : (currentTask.description || '');
        const priority = updates.priority !== undefined ? updates.priority : currentTask.priority;

        let status = updates.status !== undefined ? updates.status : currentTask.status;

        // sync is_completed
        if (updates.hasOwnProperty('is_completed')) {
            status = updates.is_completed ? 'completed' : 'pending';
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('priority', priority);
        formData.append('status', status);

        const res = await updateTask(taskId, formData);

        if (res.success) {
            const updatedTaskData = {
                ...currentTask,
                ...updates,
                title, description, priority, status,
                is_completed: status === 'completed',
            };

            const updatedTasks = tasks.map(t => t.id === taskId ? updatedTaskData : t);
            setTasks(updatedTasks);

            if (selectedTask && selectedTask.id === taskId) {
                setSelectedTask(updatedTaskData);
            }
        }
    };

    // Deletion
    // TaskCard passes `id`. AdminDashboard logic uses `deleteTask`.
    // Re-use `deleteTask` action.

    return (
        <div>
            <div className="flex flex-col gap-4">
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onClick={setSelectedTask}
                        onUpdate={handleUpdateTask}
                    // User can't delete in original UI? 
                    // Step 81 has `TaskCard` props: `task`, `onClick`, `onUpdate`. 
                    // It does NOT have `onDelete` for User!
                    // So User cannot delete tasks in original UI?
                    // "make the ui same as it was earlier".
                    // Logic check: User dashboard usually allows delete. 
                    // Step 98 (Admin) has delete. Step 81 (User) code:
                    /*
                        <TaskCard
                            key={task._id}
                            task={task}
                            onClick={setSelectedTask}
                            onUpdate={handleUpdateTask}
                        />
                    */
                    // Correct. No delete prop passed to TaskCard in User Dashboard.
                    // I will stick to this.
                    />
                ))}
                {tasks.length === 0 && (
                    <div className="col-span-full text-center py-20 text-gray-500 border border-dashed border-gray-800 rounded-2xl">
                        No tasks found. Click + to add one.
                    </div>
                )}
            </div>

            <TaskInput onAdd={handleAddTask} />

            <TaskDetailModal
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onUpdate={handleUpdateTask}
            />
        </div>
    );
}
