'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Flag, CheckCircle, Circle, Save, Trash2, Edit2, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TaskDetailModal({ task, onClose, onUpdate, isAdmin }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState(task);

    useEffect(() => {
        setEditedTask(task);
    }, [task]);

    if (!task) return null;

    const handleSave = async () => {
        if (onUpdate) {
            await onUpdate(task.id, editedTask);
        }
        setIsEditing(false);
    };

    const handleDelete = () => {
        // Implement delete logic if needed here, or keep it in parent
    };

    const priorityColor = (p) => {
        if (p === 'high') return 'bg-red-500';
        if (p === 'medium') return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                    className="glass-dark w-full max-w-2xl bg-[#111] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto"
                >
                    <div className="p-6 md:p-8">
                        <div className="flex justify-between items-start mb-6">
                            {/* Title Area */}
                            <div className="flex-1 mr-4">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedTask?.title || task.title}
                                        onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xl font-bold text-white focus:outline-none focus:border-blue-500"
                                    />
                                ) : (
                                    <h2 className="text-2xl font-bold text-white leading-tight">{task.title}</h2>
                                )}
                            </div>

                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap gap-4 mb-8 text-sm text-gray-400">
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                                <div className={`w-2 h-2 rounded-full ${priorityColor(editedTask?.priority || task.priority)}`} />
                                {isEditing ? (
                                    <select
                                        value={editedTask.priority || 'medium'}
                                        onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                                        className="bg-transparent border-none focus:outline-none text-gray-300"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                ) : (
                                    <span className="capitalize">{task.priority || 'Medium'}</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                                {isEditing ? (
                                    <select
                                        value={editedTask.status || 'pending'}
                                        onChange={(e) => {
                                            const newStatus = e.target.value;
                                            setEditedTask({
                                                ...editedTask,
                                                status: newStatus,
                                                is_completed: newStatus === 'completed'
                                            });
                                        }}
                                        className="bg-transparent border-none focus:outline-none text-gray-300"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                ) : (
                                    <button
                                        onClick={() => {
                                            if (isAdmin) return;
                                            const newStatus = task.is_completed ? 'pending' : 'completed';
                                            // Trigger parent update
                                            onUpdate(task.id, {
                                                status: newStatus,
                                                is_completed: !task.is_completed
                                            });
                                        }}
                                        className={`flex items-center gap-2 ${isAdmin ? 'cursor-default' : 'cursor-pointer hover:text-white transition-colors'}`}
                                        disabled={isAdmin}
                                    >
                                        {task.is_completed ? <CheckCircle size={14} className="text-green-500" /> : <Circle size={14} />}
                                        <span>{task.is_completed ? 'Completed' : 'Pending'}</span>
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 px-2">
                                <Calendar size={14} />
                                <span>{new Date(task.created_at).toLocaleDateString('en-GB')}</span>
                            </div>
                        </div>

                        {/* Image Section */}
                        {(task.image_url || isEditing) && (
                            <div className="mb-8">
                                {task.image_url && !isEditing && (
                                    <div className="rounded-xl overflow-hidden mb-4 border border-gray-800 bg-black/20">
                                        <img
                                            src={task.image_url}
                                            alt="Task Attachment"
                                            className="w-full h-auto max-h-96 object-contain"
                                        />
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="space-y-2 p-4 bg-white/5 rounded-xl border border-white/5">
                                        <label className="text-gray-400 text-sm flex items-center gap-2 font-medium">
                                            <ImageIcon size={16} /> Update Attachment
                                        </label>
                                        {task.image_url && (
                                            <div className="text-xs text-gray-500 mb-2">Current: <a href={task.image_url} target="_blank" className="text-blue-400 hover:underline">View Image</a></div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setEditedTask({ ...editedTask, image: e.target.files[0] })}
                                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-blue-400 hover:file:bg-gray-700 cursor-pointer"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Description */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Description</h3>
                            {isEditing ? (
                                <textarea
                                    value={editedTask?.description || ''}
                                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                    rows={5}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-gray-300 focus:outline-none focus:border-blue-500 resize-none"
                                />
                            ) : (
                                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {task.description || 'No description provided for this task.'}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end pt-6 border-t border-gray-800 gap-3">
                            {!isAdmin ? (
                                isEditing ? (
                                    <>
                                        <button
                                            onClick={() => { setIsEditing(false); setEditedTask(task); }}
                                            className="px-4 py-2 text-gray-400 hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 font-medium"
                                        >
                                            <Save size={18} /> Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
                                    >
                                        <Edit2 size={18} /> Edit Task
                                    </button>
                                )
                            ) : (
                                <span className="text-xs text-gray-500 italic flex items-center">Admin View Only</span>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
