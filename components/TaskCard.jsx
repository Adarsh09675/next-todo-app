'use client';

import { motion } from 'framer-motion';
import { Trash2, CheckCircle, Circle } from 'lucide-react';

export default function TaskCard({ task, onDelete, onUpdate, isAdmin, onClick }) {
    const priorityColors = {
        low: 'bg-green-500/20 text-green-400 border-green-500/30',
        medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        high: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    const handleToggleComplete = (e) => {
        e.stopPropagation();
        if (onUpdate) {
            onUpdate(task._id, { isCompleted: !task.isCompleted });
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => onClick && onClick(task)}
            className={`glass-dark p-5 rounded-xl border transition-all group cursor-pointer hover:shadow-lg ${task.isCompleted ? 'border-green-500/30 bg-green-900/10' : 'border-gray-700/50 hover:border-gray-500/50'
                }`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3 flex-1">
                    {!isAdmin && (
                        <button
                            onClick={handleToggleComplete}
                            className={`mt-1 transition-colors ${task.isCompleted ? 'text-green-500' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                            {task.isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                        </button>
                    )}
                    <div className="min-w-0">
                        <h3 className={`font-semibold text-lg transition-colors truncate ${task.isCompleted ? 'text-gray-500 line-through' : 'text-white group-hover:text-blue-400'
                            }`}>
                            {task.title}
                        </h3>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${priorityColors[task.priority || 'medium']}`}>
                            {task.priority || 'Medium'}
                        </span>
                    </div>
                </div>
            </div>

            <p className={`text-sm mb-4 line-clamp-2 ${task.isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                {task.description || 'No description'}
            </p>

            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-700/50 pt-3">
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                {(isAdmin && onDelete) && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Delete Task"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            {isAdmin && task.user && (
                <div className="mt-2 text-xs text-blue-300/70 truncate">
                    Owner: {task.user.name || task.user.username}
                </div>
            )}
        </motion.div>
    );
}
