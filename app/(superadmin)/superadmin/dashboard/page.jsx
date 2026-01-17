import { getUsers, toggleUserBlock, updateUserRole, getAllTasks } from '@/actions/admin-actions';
import { deleteTask } from '@/actions/task-actions'; // Using getTasks for global task view
import UserTable from '@/components/UserTable';
import TaskListClient from '@/components/TaskListClient';
import Link from 'next/link';

export default async function SuperAdminDashboard({ searchParams }) {
    const sp = await searchParams;
    const tab = sp?.tab || 'users';
    const search = sp?.search || '';

    let users = [];
    let tasks = [];

    if (tab === 'users') {
        const { users: fetchedUsers } = await getUsers(search);
        users = fetchedUsers || [];
    } else {
        const { tasks: fetchedTasks } = await getAllTasks(search);
        tasks = fetchedTasks || [];
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent w-fit">
                    Superadmin Control
                </h1>
                <p className="text-gray-400">Full system access</p>
            </div>

            <div className="flex gap-4 mb-8">
                <Link
                    href="?tab=users"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors
            ${tab === 'users' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
          `}
                >
                    All Users & Admins
                </Link>
                <Link
                    href="?tab=tasks"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors
            ${tab === 'tasks' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
          `}
                >
                    Global Tasks
                </Link>
            </div>

            {tab === 'users' ? (
                <UserTable
                    users={users}
                    onBlock={toggleUserBlock}
                    onRoleUpdate={updateUserRole}
                    currentUserRole="superadmin"
                />
            ) : (
                <TaskListClient initialTasks={tasks} allowAdd={false} />
            )}
        </div>
    );
}
