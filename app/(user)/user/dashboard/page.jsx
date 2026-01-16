'use client';

import { useState, useEffect } from 'react';
import TaskCard from '@/components/TaskCard';
import TaskInput from '@/components/TaskInput';
import TaskDetailModal from '@/components/TaskDetailModal';
import { useAuth } from '@/components/AuthProvider';
import { useSearchParams } from 'next/navigation';

export default function UserDashboard() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        fetchTasks();
    }, [searchParams]);

    const fetchTasks = async () => {
        try {
            const search = searchParams.get('search') || '';
            const res = await fetch(`/api/user/tasks?search=${search}`);
            const contentType = res.headers.get('content-type');
            if (res.ok && contentType && contentType.includes('application/json')) {
                const data = await res.json();
                setTasks(data.tasks);
            } else {
                console.error('Failed to fetch tasks: Invalid response');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (taskData) => {
        try {
            const res = await fetch('/api/user/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData),
            });
            const contentType = res.headers.get('content-type');
            if (res.ok && contentType && contentType.includes('application/json')) {
                const data = await res.json();
                setTasks([data.task, ...tasks]);
            } else {
                alert('Failed to add task');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateTask = async (taskId, updates) => {
        try {
            const res = await fetch('/api/user/tasks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId, ...updates }),
            });
            if (res.ok) {
                setTasks(tasks.map(t => t._id === taskId ? { ...t, ...updates } : t));
                if (selectedTask && selectedTask._id === taskId) {
                    setSelectedTask({ ...selectedTask, ...updates });
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="text-white">Loading tasks...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">My Tasks</h1>
            <p className="text-gray-400 mb-8">Manage your personal todo list</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                    <TaskCard
                        key={task._id}
                        task={task}
                        onClick={setSelectedTask}
                        onUpdate={handleUpdateTask}
                    />
                ))}
                {tasks.length === 0 && (
                    <div className="col-span-full text-center py-20 text-gray-500 border border-dashed border-gray-800 rounded-2xl">
                        No tasks found. Click + to add one.
                    </div>
                )}
            </div>

            <TaskInput onAdd={addTask} />

            <TaskDetailModal
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onUpdate={handleUpdateTask}
            />
        </div>
    );
}
