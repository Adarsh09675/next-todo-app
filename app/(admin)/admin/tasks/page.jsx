import { getTasks, deleteTask } from '@/actions/task-actions';
import { Plus, Trash2, Edit2, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import TaskListClient from '@/components/TaskListClient'; // We'll create this next to handle state

export default async function TasksPage() {
    // Fetch data on the server
    const { tasks, success, message } = await getTasks();

    if (!success) {
        return (
            <div className="p-8 text-center text-red-400">
                Error loading tasks: {message}
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Tasks</h1>
                    <p className="text-gray-400">Manage your daily activities</p>
                </div>
                {/* Client component will inject the "Add Task" button logic here */}
            </div>

            {/* Pass initial data to client component */}
            <TaskListClient initialTasks={tasks || []} />
        </div>
    );
}
