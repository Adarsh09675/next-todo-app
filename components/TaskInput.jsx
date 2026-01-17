'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Flag, Image as ImageIcon } from 'lucide-react';

export default function TaskInput({ onAdd }) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const priorities = [
        { value: 'low', label: 'Low', color: 'bg-green-500 hover:bg-green-600' },
        { value: 'medium', label: 'Medium', color: 'bg-yellow-500 hover:bg-yellow-600' },
        { value: 'high', label: 'High', color: 'bg-red-500 hover:bg-red-600' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        await onAdd({ title, description, priority, image });

        setTitle('');
        setDescription('');
        setPriority('medium');
        setImage(null);
        setLoading(false);
        setIsOpen(false);
    };

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-500 p-4 rounded-full shadow-lg shadow-blue-500/30 text-white z-20"
            >
                <Plus size={24} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="glass-dark w-full max-w-lg p-6 rounded-2xl relative z-10 border border-white/10"
                        >
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-4">New Task</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Task Title"
                                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Description (optional)"
                                        rows={3}
                                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                    />
                                </div>

                                {/* Image and Priority */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-gray-400 text-sm mb-2 block flex items-center gap-2">
                                            <Flag size={14} /> Priority
                                        </label>
                                        <div className="flex gap-2">
                                            {priorities.map((p) => (
                                                <button
                                                    key={p.value}
                                                    type="button"
                                                    onClick={() => setPriority(p.value)}
                                                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${priority === p.value
                                                        ? `${p.color} text-white shadow-lg`
                                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-gray-400 text-sm mb-2 block flex items-center gap-2">
                                            <ImageIcon size={14} /> Attachment
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImage(e.target.files[0])}
                                            className="w-full text-sm text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-gray-800 file:text-blue-400 hover:file:bg-gray-700 transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-medium transition-colors mt-2"
                                >
                                    {loading ? 'Adding...' : 'Create Task'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
