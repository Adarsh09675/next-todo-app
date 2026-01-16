'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    Shield,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(true);

    if (!user) return null;

    const links = [
        { href: '/user/dashboard', label: 'My Tasks', icon: CheckSquare, roles: ['user', 'admin', 'superadmin'] },
        { href: '/admin/dashboard', label: 'Admin Panel', icon: Users, roles: ['admin', 'superadmin'] },
        { href: '/superadmin/dashboard', label: 'System Control', icon: Shield, roles: ['superadmin'] },
    ];

    const filteredLinks = links.filter(link => link.roles.includes(user.role));

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg text-white"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <AnimatePresence mode="wait">
                {(isOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className={`fixed left-0 top-0 h-full w-64 bg-gray-900/50 backdrop-blur-xl border-r border-gray-800 z-40 flex flex-col transition-all duration-300 ${!isOpen ? 'hidden lg:flex' : 'flex'}`}
                    >
                        <div className="p-6 border-b border-gray-800">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                TaskForce
                            </h1>
                            <div className="mt-4">
                                <p className="text-white font-medium">{user.name || 'User'}</p>
                                <p className="text-gray-500 text-xs">{user.email}</p>
                                <div className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-800 text-gray-300 border border-gray-700">
                                    {user.role}
                                </div>
                            </div>
                        </div>

                        <nav className="flex-1 p-4 space-y-2">
                            {filteredLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                      ${isActive ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                    `}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-nav"
                                                className="absolute inset-0 bg-blue-600/10 border-r-2 border-blue-500"
                                                initial={false}
                                                transition={{ duration: 0.3 }}
                                            />
                                        )}
                                        <Icon size={20} />
                                        <span className="font-medium relative z-10">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>


                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
}
