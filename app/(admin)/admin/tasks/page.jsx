'use client';

import { useState, useEffect } from 'react';
import TaskCard from '@/components/TaskCard';
import TaskDetailModal from '@/components/TaskDetailModal';

export default function AdminTasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/admin/tasks');
            if (res.ok) {
                const data = await res.json();
                setTasks(data.tasks);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
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

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-white">Global Task Management</h1>
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
                    <div className="col-span-full text-gray-400">No tasks found.</div>
                )}
            </div>

            <TaskDetailModal
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                isAdmin={true}
            />
        </div>
    );
}
