import { getTasks } from '@/actions/task-actions';
import UserDashboardClient from '@/components/UserDashboardClient';

export default async function UserDashboard() {
    const { tasks, success } = await getTasks();

    return (
        <div className="px-4 py-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">My Tasks</h1>
                <p className="text-gray-400">Manage your personal todo list</p>
            </div>

            <UserDashboardClient initialTasks={success ? tasks : []} />
        </div>
    );
}
