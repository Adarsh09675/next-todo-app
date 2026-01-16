'use client';

import { useAuth } from '@/components/AuthProvider';
import { Bell, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AdminNavbar() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    // Manual Search Logic
    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm) {
            params.set('search', searchTerm);
        } else {
            params.delete('search');
        }
        router.replace(`?${params.toString()}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Fallback if user is loading or null
    const userName = user?.name || 'Admin';
    const userEmail = user?.email || 'admin@example.com';

    return (
        <nav className="flex items-center justify-between p-4 mb-8 glass-dark rounded-xl border border-gray-800">
            {/* Left Section: Title/Breadcrumb */}
            <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Admin Dashboard
                </h2>
                <p className="text-xs text-gray-500">Overview & Management</p>
            </div>

            {/* Middle Section: Search */}
            <div className="hidden md:flex items-center bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-800 w-64 hover:border-gray-700 transition-colors">
                <button onClick={handleSearch} className="text-gray-500 mr-2 hover:text-white transition-colors">
                    <Search size={16} />
                </button>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search... (Press Enter)"
                    className="bg-transparent text-sm text-gray-300 focus:outline-none w-full placeholder-gray-600"
                />
            </div>

            {/* Right Section: Profile */}
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-white">{userName}</p>
                        <p className="text-xs text-gray-500">{userEmail}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </nav>
    );
}
