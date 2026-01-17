'use client';

import { useState } from 'react';
import { deleteTask, updateTask } from '@/actions/admin-actions';
import TaskForm from '@/components/TaskForm';
import TaskDetailModal from '@/components/TaskDetailModal';
import { Plus, Trash2, Edit2, Calendar, CheckCircle2, Clock, AlertCircle, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TaskListClient({ initialTasks, allowAdd = true }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [viewingTask, setViewingTask] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        setIsLoading(true);
        await deleteTask(id);
        setIsLoading(false);
    };

    const handleStatusToggle = async (task, e) => {
        e.stopPropagation(); // Prevent card click
        setIsLoading(true);
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        const formData = new FormData();
        formData.append('status', newStatus);
        await updateTask(task.id, formData);
        setIsLoading(false);
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingTask(null);
        setIsFormOpen(true);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle2 size={18} className="text-green-500" />;
            case 'in-progress': return <Clock size={18} className="text-blue-500" />;
            default: return <AlertCircle size={18} className="text-gray-500" />;
        }
    };

    return (
        <>
            {allowAdd && (
                <div className="absolute top-8 right-8 md:static md:float-right mb-8">
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={20} />
                        New Task
                    </button>
                </div>
            )}

            <div className="flex flex-col gap-3 clear-right">
                {initialTasks.length === 0 ? (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-800 rounded-xl bg-gray-900/30">
                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                            <Calendar size={32} className="opacity-50" />
                        </div>
                        <p className="text-lg font-medium">No tasks found</p>
                        <p className="text-sm">Get started by creating a new task.</p>
                    </div>
                ) : (
                    initialTasks.map((task) => (
                        <div
                            key={task.id}
                            onClick={() => setViewingTask(task)}
                            className="group relative bg-gray-900/40 backdrop-blur-md border border-white/5 hover:border-blue-500/30 rounded-xl p-4 hover:bg-gray-900/60 transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-black/20 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer"
                        >

                            {/* Main Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-white truncate">{task.title}</h3>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                                        {task.priority || 'Medium'}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm line-clamp-1">{task.description || 'No description provided.'}</p>
                            </div>

                            {/* User Info - "In Side" */}
                            {task.user && (
                                <div className="md:w-32 flex flex-col justify-center border-l border-white/5 pl-4 md:border-none md:pl-0">
                                    <span className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">Owner</span>
                                    <span className="text-xs text-blue-300 truncate font-medium" title={task.user.email}>
                                        {task.user.name || task.user.email.split('@')[0]}
                                    </span>
                                </div>
                            )}

                            {/* Status & Date */}
                            <div className="md:w-32 flex flex-col items-start md:items-end gap-1 border-l border-white/5 pl-4 md:border-none md:pl-0">
                                <button
                                    onClick={(e) => handleStatusToggle(task, e)}
                                    className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                                    disabled={isLoading}
                                >
                                    {getStatusIcon(task.status)}
                                    <span className="capitalize">{task.status.replace('-', ' ')}</span>
                                </button>
                                <div className="text-[10px] text-gray-600 font-mono">
                                    {new Date(task.created_at).toLocaleDateString('en-GB')}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 border-l border-white/5 pl-4 ml-auto md:ml-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleEdit(task); }}
                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isFormOpen && (
                <TaskForm
                    task={editingTask}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        // Optional: trigger a toast notification here
                    }}
                />
            )}

            <TaskDetailModal
                task={viewingTask}
                onClose={() => setViewingTask(null)}
                isAdmin={true}
            />
        </>
    );
}
