'use client';

import { X, Calendar, Flag, CheckCircle, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TaskDetailModal({ task, onClose, onUpdate, isAdmin }) {
    if (!task) return null;

    const priorities = {
        low: { color: 'bg-green-500', label: 'Low' },
        medium: { color: 'bg-yellow-500', label: 'Medium' },
        high: { color: 'bg-red-500', label: 'High' }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const handleMarkComplete = () => {
        if (onUpdate) {
            onUpdate(task.id || task._id, { isCompleted: !task.isCompleted });
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex justify-between items-start p-6 border-b border-gray-800 bg-gray-900/50">
                        <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorities[task.priority]?.color} text-black mb-3`}>
                                {priorities[task.priority]?.label || 'Medium'} Priority
                            </span>
                            <h2 className={`text-2xl font-bold ${task.isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
                                {task.title}
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Description</h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {task.description || "No description provided."}
                            </p>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                    <Clock size={14} />
                                    <span className="text-xs">Created At</span>
                                </div>
                                <p className="text-sm text-gray-200">{formatDate(task.createdAt)}</p>
                            </div>

                            <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                    <CheckCircle size={14} />
                                    <span className="text-xs">Status</span>
                                </div>
                                <p className={`text-sm font-medium ${task.isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {task.isCompleted ? 'Completed' : 'Pending'}
                                </p>
                            </div>

                            {/* Show Creator for Admins */}
                            {isAdmin && task.user && (
                                <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50 col-span-2">
                                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                                        <User size={14} />
                                        <span className="text-xs">Created By</span>
                                    </div>
                                    <p className="text-sm text-gray-200">
                                        {task.user.username || task.user.name || 'Unknown User'}
                                        {task.user.email && <span className="text-gray-500 ml-2 text-xs">({task.user.email})</span>}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
                        {!isAdmin && (
                            <button
                                onClick={handleMarkComplete}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${task.isCompleted
                                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    : 'bg-green-600 text-white hover:bg-green-500'
                                    }`}
                            >
                                <CheckCircle size={18} />
                                {task.isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                            </button>
                        )}
                        {isAdmin && (
                            <div className="text-xs text-gray-500 flex items-center">
                                *Admin View Mode
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
