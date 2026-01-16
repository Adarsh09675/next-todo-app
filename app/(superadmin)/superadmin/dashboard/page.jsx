'use client';

import { useState, useEffect } from 'react';
import UserTable from '@/components/UserTable';
import TaskCard from '@/components/TaskCard';
import TaskDetailModal from '@/components/TaskDetailModal';
import { useAuth } from '@/components/AuthProvider';
import { useSearchParams } from 'next/navigation';

export default function SuperAdminDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        fetchData();
    }, [activeTab, searchParams]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const search = searchParams.get('search') || '';
            const url = activeTab === 'users'
                ? `/api/admin/users?search=${search}`
                : `/api/admin/tasks?search=${search}`;
            const res = await fetch(url);
            const contentType = res.headers.get('content-type');

            if (res.ok && contentType && contentType.includes('application/json')) {
                const data = await res.json();
                if (activeTab === 'users') setUsers(data.users);
                else setTasks(data.tasks);
            } else {
                console.error('Failed to fetch data');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId, isBlocked) => {
        try {
            const res = await fetch('/api/admin/block-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, isBlocked }),
            });
            if (res.ok) {
                setUsers(users.map(u => u._id === userId ? { ...u, isBlocked } : u));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            const res = await fetch('/api/admin/update-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, newRole }),
            });
            const contentType = res.headers.get('content-type');
            if (res.ok) {
                setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            } else if (contentType && contentType.includes('application/json')) {
                const data = await res.json();
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/admin/tasks?id=${taskId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setTasks(tasks.filter(t => t._id !== taskId));
                if (selectedTask?._id === taskId) setSelectedTask(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!user) return null;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent w-fit">
                    Superadmin Control
                </h1>
                <p className="text-gray-400">Full system access</p>
            </div>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors
            ${activeTab === 'users' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
          `}
                >
                    All Users & Admins
                </button>
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors
            ${activeTab === 'tasks' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
          `}
                >
                    Global Tasks
                </button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : activeTab === 'users' ? (
                <UserTable
                    users={users}
                    onBlock={handleBlockUser}
                    onRoleUpdate={handleRoleUpdate}
                    currentUserRole="superadmin"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            isAdmin={true}
                            onDelete={handleDeleteTask}
                            onClick={setSelectedTask}
                        />
                    ))}
                    {tasks.length === 0 && (
                        <div className="col-span-full">No tasks found.</div>
                    )}
                </div>
            )}

            <TaskDetailModal
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                isAdmin={true}
            />
        </div>
    );
}
