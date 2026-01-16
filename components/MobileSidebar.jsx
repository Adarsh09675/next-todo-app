'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
    X,
    LogOut,
    CheckSquare,
    Users,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileSidebar({ isOpen, onClose }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const links = [
        { href: '/user/dashboard', label: 'My Tasks', icon: CheckSquare, roles: ['user', 'admin', 'superadmin'] },
        { href: '/admin/dashboard', label: 'Admin Panel', icon: Users, roles: ['admin', 'superadmin'] },
        { href: '/superadmin/dashboard', label: 'System Control', icon: Shield, roles: ['superadmin'] },
    ];

    const filteredLinks = links.filter(link => link.roles.includes(user.role));

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                    />

                    {/* Sidebar Drawer (Right Side) */}
                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-72 bg-gray-900 border-l border-gray-800 z-[70] flex flex-col shadow-2xl lg:hidden"
                    >
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Menu</h2>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg">
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                            {filteredLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                            ${isActive ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                                        `}
                                    >
                                        <Icon size={20} />
                                        <span className="font-medium">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t border-gray-800">
                            <button
                                onClick={() => {
                                    onClose();
                                    logout();
                                }}
                                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut size={20} />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
