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
            // Using logic compatible with new Schema (is_completed vs isCompleted)
            // Supabase schema says: is_completed
            // But let's check what the object has. 
            // The previous code used `isCompleted`. Step 10 schema says `is_completed`.
            // I should adapt this component to handle both or strictly standard.
            // Let's assume the passed `task` object matches Supabase format now.
            const newValue = !task.is_completed;
            onUpdate(task.id, { is_completed: newValue });
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => onClick && onClick(task)}
            className="group relative bg-gray-900/40 backdrop-blur-md border border-white/5 hover:border-blue-500/30 rounded-xl p-4 hover:bg-gray-900/60 transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-black/20 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer"
        >
            {/* Priority Strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${priorityColors[task.priority || 'medium'].split(' ')[0].replace('/20', '')}`} />

            {/* Content */}
            <div className="flex-1 min-w-0 pl-3">
                <div className="flex items-center gap-3 mb-1">
                    <h3 className={`text-lg font-bold truncate ${task.is_completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                        {task.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${priorityColors[task.priority || 'medium']}`}>
                        {task.priority || 'Medium'}
                    </span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-1">{task.description || 'No description provided.'}</p>
            </div>



            {/* Status & Date */}
            <div className="md:w-32 flex flex-col items-start md:items-end gap-1 border-l border-white/5 pl-4 md:border-none md:pl-0">
                {!isAdmin && (
                    <button
                        onClick={handleToggleComplete}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${task.is_completed ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
                    >
                        {task.is_completed ? <CheckCircle size={16} /> : <Circle size={16} />}
                        <span className="capitalize">{task.is_completed ? 'Completed' : 'Pending'}</span>
                    </button>
                )}
                {isAdmin && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                        {task.is_completed ? <CheckCircle size={16} className="text-green-500" /> : <Circle size={16} />}
                        <span className="capitalize">{task.is_completed ? 'Completed' : 'Pending'}</span>
                    </div>
                )}
                <div className="text-[10px] text-gray-600 font-mono">
                    {new Date(task.created_at).toLocaleDateString('en-GB')}
                </div>
            </div>

            {/* Actions */}
            {(isAdmin && onDelete) && (
                <div className="flex items-center gap-1 border-l border-white/5 pl-4 ml-auto md:ml-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}
        </motion.div>
    );
}
