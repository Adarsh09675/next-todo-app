import { getUsers, toggleUserBlock, updateUserRole, getAllTasks } from '@/actions/admin-actions';
import { deleteTask } from '@/actions/task-actions';
import UserTable from '@/components/UserTable';
import TaskListClient from '@/components/TaskListClient';
import Link from 'next/link';

export default async function AdminDashboard({ searchParams }) {
    const sp = await searchParams;
    const tab = sp?.tab || 'users';
    const search = sp?.search || '';

    let users = [];
    let tasks = [];

    if (tab === 'users') {
        const { users: fetchedUsers } = await getUsers(search);
        users = fetchedUsers || [];
    } else {
        // Use getAllTasks from admin-actions to fetch all tasks with user info
        const { tasks: fetchedTasks } = await getAllTasks(search);
        tasks = fetchedTasks || [];
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-white">Admin Dashboard</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-8">
                <Link
                    href="?tab=users"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    User Management
                </Link>
                <Link
                    href="?tab=tasks"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'tasks' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    All Tasks
                </Link>
            </div>

            {/* Content */}
            {tab === 'users' ? (
                <UserTable
                    users={users}
                    onBlock={toggleUserBlock}
                    onRoleUpdate={updateUserRole}
                    currentUserRole="admin" // Using 'admin' as default since this is Admin Dashboard. Ideally check real user role.
                />
            ) : (
                <TaskListClient initialTasks={tasks} allowAdd={false} />
            )}
        </div>
    );
}
